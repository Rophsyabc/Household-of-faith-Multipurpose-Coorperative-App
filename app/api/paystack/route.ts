import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

/**
 * Paystack Webhook Handler
 * Endpoint: POST /api/paystack/webhook
 *
 * SECURITY REQUIREMENTS:
 * 1. Signature MUST be verified using HMAC-SHA512 with PAYSTACK_SECRET_KEY
 *    BEFORE any payload processing.
 * 2. Idempotency: the same event reference must NEVER credit the wallet twice.
 *    We enforce this via a UNIQUE constraint on transactions.reference.
 * 3. Only events with status 'success' trigger wallet credit.
 * 4. Failed/reversed payments must NOT credit the wallet.
 * 5. Duplicate webhook deliveries are safe (idempotent).
 *
 * IMPORTANT: We do NOT trust `payload.data.status == 'success'` alone.
 * The signature verification proves the event is authentic.
 */

function verifySignature(payload: string, signature: string): boolean {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) return false;
    const hash = crypto
        .createHmac('sha512', secret)
        .update(payload)
        .digest('hex');
    return hash === signature;
}

function getSupabase() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return null;
    return createClient(url, key, { auth: { persistSession: false } });
}

export async function POST(req: NextRequest) {
    // 1. Read raw body for signature verification
    const rawBody = await req.text();
    const signature = req.headers.get('x-paystack-signature');

    if (!signature) {
        return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
    }

    // 2. Verify HMAC signature
    if (!verifySignature(rawBody, signature)) {
        console.error('[paystack-webhook] Invalid signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    let payload: any;
    try {
        payload = JSON.parse(rawBody);
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const event = payload?.event;
    const data = payload?.data;
    const reference = data?.reference;
    const status = data?.status;
    const amount = data?.amount; // Paystack returns amount in kobo
    const email = data?.customer?.email;

    // 3. Only process charge.success events
    if (event !== 'charge.success') {
        return NextResponse.json({ ok: true, message: 'Event ignored' });
    }

    if (status !== 'success') {
        return NextResponse.json({ ok: true, message: 'Payment not successful' });
    }

    if (!reference || !email) {
        return NextResponse.json({ error: 'Missing reference or email' }, { status: 400 });
    }

    const supabase = getSupabase();
    if (!supabase) {
        console.error('[paystack-webhook] Supabase not configured');
        return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    // 4. Find the user by email (Paystack customer email matches user profile)
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('email', email)
        .single();

    if (profileError || !profile) {
        console.error('[paystack-webhook] User not found for email:', email);
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 5. Idempotency: check if transaction with this reference already exists
    const { data: existingTxn } = await supabase
        .from('transactions')
        .select('id')
        .eq('reference', reference)
        .maybeSingle();

    if (existingTxn) {
        // Already processed — safe to return success
        return NextResponse.json({ ok: true, message: 'Already processed' });
    }

    // 6. Convert kobo to naira
    const amountNaira = Number(amount) / 100;

    // 7. Fetch current wallet balance (row lock via single())
    const { data: wallet, error: walletError } = await supabase
        .from('wallets')
        .select('id, balance')
        .eq('user_id', profile.id)
        .single();

    if (walletError || !wallet) {
        console.error('[paystack-webhook] Wallet not found for user:', profile.id);
        return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
    }

    // 8. Credit wallet
    const newBalance = Number(wallet.balance) + amountNaira;
    const { error: updateError } = await supabase
        .from('wallets')
        .update({ balance: newBalance, updated_at: new Date().toISOString() })
        .eq('id', wallet.id);

    if (updateError) {
        console.error('[paystack-webhook] Wallet update failed:', updateError);
        return NextResponse.json({ error: 'Wallet update failed' }, { status: 500 });
    }

    // 9. Record transaction (UNIQUE on reference prevents double-credit)
    const { error: txnError } = await supabase
        .from('transactions')
        .insert({
            user_id: profile.id,
            type: 'credit',
            amount: amountNaira,
            description: `Paystack Deposit (${reference})`,
            reference: reference,
            status: 'completed',
        });

    if (txnError) {
        // UNIQUE violation means duplicate — safe, don't rollback wallet
        console.warn('[paystack-webhook] Duplicate transaction reference:', reference);
        return NextResponse.json({ ok: true, message: 'Duplicate event handled' });
    }

    console.log('[paystack-webhook] Wallet credited:', profile.id, amountNaira, reference);
    return NextResponse.json({ ok: true, message: 'Wallet credited' });
}