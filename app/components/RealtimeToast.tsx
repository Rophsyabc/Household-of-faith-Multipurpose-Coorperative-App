'use client';

import { useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { toast } from 'sonner';
import { BellRing, CreditCard, Users, HandCoins } from 'lucide-react';

export function RealtimeToast({ userId }: { userId: string }) {
    useEffect(() => {
        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const channel = supabase
            .channel(`user-toasts-${userId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${userId}`,
                },
                (payload) => {
                    const notif = payload.new;
                    toast(notif.message, {
                        icon: getIcon(notif.type),
                        duration: 5000,
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId]);

    return null;
}

function getIcon(type: string) {
    switch (type) {
        case 'credit': return <CreditCard className="w-4 h-4 text-green-500" />;
        case 'ajo': return <Users className="w-4 h-4 text-purple-500" />;
        case 'loan': return <HandCoins className="w-4 h-4 text-cyan-500" />;
        default: return <BellRing className="w-4 h-4 text-cyan-500" />;
    }
}
