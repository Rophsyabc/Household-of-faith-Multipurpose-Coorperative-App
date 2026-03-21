'use client';

import { useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';

export function RealtimeAdminObserver() {
    const router = useRouter();

    useEffect(() => {
        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        // Listen for everything an admin cares about
        const channel = supabase
            .channel('admin-global-sync')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'profiles', filter: 'kyc_status=eq.pending' }, () => router.refresh())
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'loans' }, () => router.refresh())
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'withdrawal_requests' }, () => router.refresh())
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'support_tickets' }, () => router.refresh())
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ajo_groups' }, () => router.refresh())
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [router]);

    return null;
}
