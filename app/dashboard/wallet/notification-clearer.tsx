'use client';

import { useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';

export function NotificationClearer() {
    const router = useRouter();

    useEffect(() => {
        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const markRead = async () => {
        // 1. Mark all as read in DB
        await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('is_read', false);
        
        // 2. Refresh the UI so the sidebar badge disappears
        router.refresh();
        };

        markRead();
    }, [router]);

    return null; 
}