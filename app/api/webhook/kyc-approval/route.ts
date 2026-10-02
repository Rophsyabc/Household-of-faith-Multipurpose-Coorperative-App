import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(req: Request) {
    try {
        const resend = new Resend(process.env.RESEND_API_KEY);

        const authHeader = req.headers.get('Authorization');
        if (authHeader !== process.env.SUPABASE_WEBHOOK_SECRET) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { record, old_record, type } = body;

        // Trigger only when status changes to 'verified'
        if (type === 'UPDATE' && record.kyc_status === 'verified' && old_record.kyc_status !== 'verified') {

            await resend.emails.send({
                from: 'Household of Faith <onboarding@resend.dev>', // Replace with your domain once verified
                to: record.email,
                subject: 'Membership Approved - Welcome to the Cooperative!',
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 15px;">
                        <h2 style="color: #0891b2;">Congratulations ${record.full_name}!</h2>
                        <p>We are pleased to inform you that your identity verification (KYC) has been <strong>Approved</strong>.</p>
                        <p>You now have full access to:</p>
                        <ul>
                            <li>Ajo Contribution Groups</li>
                            <li>Cooperative Loan Applications</li>
                            <li>Wallet Withdrawals</li>
                            <li>Savings Goals</li>
                        </ul>
                        <a href="https://household-of-faith-multipurpose.onrender.com/dashboard" style="display: inline-block; background: #0f172a; color: white; padding: 12px 25px; border-radius: 10px; text-decoration: none; font-weight: bold; margin-top: 20px;">Go to Dashboard</a>
                        <hr style="margin-top: 30px; border: 0; border-top: 1px solid #eee;" />
                        <p style="font-size: 12px; color: #666;">This is an automated message from Household of Faith Cooperative.</p>
                    </div>
                `
            });

            return NextResponse.json({ success: true, message: 'Approval email sent' });
        }

        return NextResponse.json({ success: true, message: 'No action needed' });

    } catch (error: any) {
        console.error('Webhook Error:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
