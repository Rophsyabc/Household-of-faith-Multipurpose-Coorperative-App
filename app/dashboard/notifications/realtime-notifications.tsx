'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Bell, CheckCircle2, Info, AlertCircle, Clock } from 'lucide-react';
import { markAsRead } from './actions';

interface Notification {
    id: string;
    message: string;
    type: string;
    is_read: boolean;
    created_at: string;
}

export function RealtimeNotifications({ initialNotifications, userId }: { initialNotifications: Notification[], userId: string }) {
    const [notifications, setNotifications] = useState(initialNotifications);

    useEffect(() => {
        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const channel = supabase
            .channel('realtime-notifications')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${userId}`,
                },
                () => {
                    fetchNotifications();
                }
            )
            .subscribe();

        async function fetchNotifications() {
            const { data } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });
            
            if (data) setNotifications(data);
        }

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId]);

    return (
        <div className="space-y-4">
            {notifications.map((notif) => (
                <div 
                    key={notif.id} 
                    className={`p-6 rounded-[2rem] border transition-all flex gap-4 items-start ${
                        notif.is_read 
                        ? 'bg-white border-slate-100 opacity-60' 
                        : 'bg-white border-cyan-100 shadow-xl shadow-cyan-500/5 ring-1 ring-cyan-50'
                    }`}
                >
                    <div className={`p-3 rounded-2xl shrink-0 ${
                        notif.type === 'credit' ? 'bg-green-100 text-green-600' :
                        notif.type === 'debit' ? 'bg-red-100 text-red-600' :
                        'bg-cyan-100 text-cyan-600'
                    }`}>
                        {notif.type === 'credit' ? <CheckCircle2 className="w-5 h-5" /> :
                         notif.type === 'debit' ? <AlertCircle className="w-5 h-5" /> :
                         <Info className="w-5 h-5" />}
                    </div>
                    
                    <div className="flex-1 space-y-1">
                        <div className="flex justify-between items-start">
                            <p className={`text-sm font-bold leading-relaxed ${notif.is_read ? 'text-slate-600' : 'text-slate-900'}`}>
                                {notif.message}
                            </p>
                            {!notif.is_read && (
                                <button 
                                    onClick={() => markAsRead(notif.id)}
                                    className="text-[10px] font-black text-cyan-600 uppercase tracking-tighter hover:underline cursor-pointer"
                                >
                                    Mark Read
                                </button>
                            )}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <Clock className="w-3 h-3" />
                            {new Date(notif.created_at).toLocaleString()}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
