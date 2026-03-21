export const dynamic = 'force-dynamic';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { User, CheckCircle2, Clock, Landmark } from 'lucide-react';
import { ProfileForm } from './profile-form';
import { KycForm } from './kyc-form';
import { BankAccounts } from './bank-accounts';
import { ShareReferral } from '../referrals/share-button';
import { MemberCard } from './member-card';

interface Profile {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    kyc_status: 'unverified' | 'pending' | 'verified';
    referral_code: string;
    address: string;
    occupation: string;
    work_address: string;
    state_of_origin: string;
    lga: string;
    next_of_kin_name: string;
    next_of_kin_phone: string;
    next_of_kin_address: string;
    updated_at: string; 
}

export default async function ProfilePage() {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { get(name: string) { return cookieStore.get(name)?.value; } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    
    const { data: rawProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

    const { data: bankAccounts } = await supabase
        .from('bank_accounts')
        .select('*')
        .eq('user_id', user?.id);

    const profile = rawProfile as Profile;
    const status = profile?.kyc_status || 'unverified';

    return (
        <div className="max-w-4xl mx-auto space-y-10 pb-24">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Account Identity</h1>
                    <p className="text-slate-500 font-medium mt-1">Manage your cooperative membership and payouts.</p>
                </div>
                
                <div className="w-full md:w-auto">
                    <MemberCard 
                        name={profile?.full_name || 'Cooperative Member'} 
                        status={status} 
                        id={profile?.id || ''} 
                    />
                </div>
            </div>

            {/* Status Feedback */}
            {status === 'pending' && (
                <div className="bg-orange-50 border border-orange-100 rounded-[2rem] p-8 flex items-center gap-6 text-orange-800 shadow-sm animate-in zoom-in-95">
                    <div className="p-4 bg-white rounded-2xl shadow-sm border border-orange-100">
                        <Clock className="w-8 h-8 animate-spin text-orange-500" />
                    </div>
                    <div>
                        <h3 className="font-black text-xl tracking-tight">Identity Audit in Progress</h3>
                        <p className="text-sm opacity-80 font-medium leading-relaxed mt-1">Our compliance team is verifying your NIN and biometrics. Payouts are restricted during this 24-hour window.</p>
                    </div>
                </div>
            )}

            {status === 'verified' && (
                <div className="bg-green-50 border border-green-100 rounded-[2rem] p-5 flex items-center gap-4 text-green-800 shadow-sm animate-in zoom-in-95">
                    <div className="p-2 bg-white rounded-xl shadow-sm">
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                    </div>
                    <span className="font-black text-[10px] uppercase tracking-widest">Trust Rating: Verified Cooperative Member</span>
                </div>
            )}

            {/* KYC Section */}
            {status === 'unverified' && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                    <KycForm 
                        phone={profile?.phone || ''} 
                        email={user?.email || profile?.email || ''} 
                        fullName={profile?.full_name || ''} 
                    />
                </div>
            )}

            {/* Bank Accounts Section */}
            {(status === 'verified' || status === 'pending') && (
                <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <BankAccounts accounts={bankAccounts || []} />
                </div>
            )}

            {/* Profile Form */}
            {(status === 'verified' || status === 'pending') && (
                <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="bg-slate-50/50 p-8 border-b border-slate-100 flex items-center gap-6">
                        <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center text-slate-400 border border-slate-200 shadow-inner relative group">
                            <User className="w-10 h-10 group-hover:scale-110 transition-transform" />
                            {status === 'verified' && (
                                <div className="absolute -top-2 -right-2 bg-green-500 text-white p-1.5 rounded-full border-4 border-white shadow-lg">
                                    <CheckCircle2 className="w-4 h-4" />
                                </div>
                            )}
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">{profile?.full_name || 'Member'}</h2>
                            <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">{user?.email}</p>
                        </div>
                    </div>

                    <ProfileForm profile={profile} />
                </div>
            )}

            {/* Referral Banner */}
            <div className="p-10 bg-cyan-900 text-white rounded-[3rem] shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500 rounded-full -mr-48 -mt-48 blur-3xl opacity-20 group-hover:opacity-30 transition-opacity" />
                <div className="relative z-10 space-y-6">
                    <div className="space-y-2">
                        <h3 className="font-black text-3xl tracking-tight">Capitalize Your Network</h3>
                        <p className="text-cyan-100 text-lg leading-relaxed font-medium max-w-2xl">
                            Earn ₦500 instantly for every verified member you bring into the community.
                        </p>
                    </div>
                    
                    <ShareReferral code={profile?.referral_code || ''} />
                </div>
            </div>
        </div>
    );
}
