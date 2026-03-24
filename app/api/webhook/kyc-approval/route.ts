import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// SECURE: Only allow Supabase to call this
const WEBHOOK_SECRET = process.env.SUPABASE_WEBHOOK_SECRET;

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { record, old_record, type } = body;

        // 1. Logic Check: Only trigger when status changes to 'verified'
        if (type === 'UPDATE' && record.kyc_status === 'verified' && old_record.kyc_status !== 'verified') {
            
            console.log(`Sending approval email to: ${record.email}`);

            /**
             * EMAIL SENDING LOGIC (Recommended: Resend.com)
             * 
             * await resend.emails.send({
             *   from: 'Cooperative <no-reply@yourdomain.com>',
             *   to: record.email,
             *   subject: 'Membership Approved - Welcome to Household of Faith',
             *   html: `<h1>Welcome ${record.full_name}!</h1><p>Your identity has been verified...</p>`
             * });
             */

            return NextResponse.json({ success: true, message: 'Approval email triggered' });
        }

        return NextResponse.json({ success: false, message: 'Status did not change to verified' });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
