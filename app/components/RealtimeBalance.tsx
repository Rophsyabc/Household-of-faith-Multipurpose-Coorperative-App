'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

export function RealtimeBalance({ initialBalance, userId, className = "" }: { initialBalance: number, userId: string, className?: string }) {
    const [balance, setBalance] = useState(initialBalance);

    useEffect(() => {
        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const channel = supabase
            .channel(`wallet-${userId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'wallets',
                    filter: `user_id=eq.${userId}`,
                },
                (payload) => {
                    setBalance(payload.new.balance);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId]);

    return (
        <span className={className}>
            ₦{balance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
        </span>
    );
}
