export const dynamic = 'force-dynamic';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';

import { HeaderSection } from './header-section';
import { PayoutCard } from './payout-card';
import { ContributionHistory } from './contribution-history';
import { RotationTable, Member, getMemberName } from './rotation-table';
import { ContributionCard } from './contribution-card'; 
import { RealtimeAjoDashboard } from './realtime-ajo-dashboard';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function SingleGroupPage({ params }: PageProps) {
    const { id } = await params;

    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { get(name: string) { return cookieStore.get(name)?.value; } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/auth');

    // 1. Fetch Group
    const { data: group } = await supabase.from('ajo_groups').select('*').eq('id', id).single();
    if (!group) notFound();

    // 2. Fetch Members
    const { data: rawMembers } = await supabase
        .from('ajo_members')
        .select('user_id, position, profiles(full_name)')
        .eq('group_id', group.id)
        .order('position');

    const members = (rawMembers || []) as unknown as Member[];

    // 3. Fetch Wallet
    const { data: wallet } = await supabase.from('wallets').select('balance').eq('user_id', user.id).single();

    const currentCycle = group.current_cycle || 1;
    
    // 4. Check Payment Status
    const { count: currentPaymentCount } = await supabase
        .from('ajo_ledger')
        .select('*', { count: 'exact', head: true })
        .eq('group_id', group.id)
        .eq('user_id', user.id)
        .eq('cycle_number', currentCycle)
        .eq('type', 'contribution');

    const hasPaidCurrent = (currentPaymentCount || 0) > 0;

    // 5. Fetch History
    const { data: history } = await supabase
        .from('ajo_ledger')
        .select('*')
        .eq('group_id', group.id)
        .eq('user_id', user.id)
        .eq('type', 'contribution')
        .order('created_at', { ascending: false });

    // 6. Calculate Beneficiary
    const activePosition = ((currentCycle - 1) % (members.length || 1)) + 1;
    const currentBeneficiary = members.find(m => m.position === activePosition);
    const beneficiaryName = getMemberName(currentBeneficiary);
    const totalPot = group.contribution_amount * members.length;

    return (
        <div className="max-w-5xl mx-auto space-y-10 pb-24">
            <RealtimeAjoDashboard groupId={group.id} />
            
            <HeaderSection 
                title={group.title}
                memberCount={members.length}
                currentCycle={currentCycle}
                startDate={group.start_date}
                groupId={group.id}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="space-y-8">
                    <ContributionCard 
                        groupId={group.id}
                        amount={group.contribution_amount}
                        cycle={currentCycle}
                        userBalance={wallet?.balance || 0}
                        hasPaid={hasPaidCurrent}
                    />

                    <PayoutCard 
                        beneficiaryName={beneficiaryName}
                        totalPot={totalPot}
                    />

                    <ContributionHistory history={history} />
                </div>

                <div className="lg:col-span-2 space-y-10">
                    <RotationTable 
                        members={members}
                        activePosition={activePosition}
                    />
                </div>
            </div>
        </div>
    );
}
