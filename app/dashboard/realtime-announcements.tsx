'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Megaphone, BellRing } from 'lucide-react';

interface Announcement {
    id: string;
    title: string;
    content: string;
    is_priority: boolean;
    created_at: string;
}

export function RealtimeAnnouncements({ initialAnnouncement }: { initialAnnouncement: Announcement | null }) {
    const [announcement, setAnnouncement] = useState(initialAnnouncement);

    useEffect(() => {
        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const channel = supabase
            .channel('public-announcements')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'announcements',
                },
                (payload) => {
                    setAnnouncement(payload.new as Announcement);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    if (!announcement) {
        return (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] p-16 text-center flex flex-col items-center justify-center h-[300px]">
                <Megaphone className="w-10 h-10 text-slate-200 mb-4" />
                <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">No new broadcasts.</p>
            </div>
        );
    }

    return (
        <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group h-full">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                <Megaphone className="w-24 h-24" />
            </div>
            <div className="relative z-10 space-y-4">
                <div className="inline-block px-3 py-1 bg-cyan-500 rounded-lg text-[10px] font-black uppercase tracking-widest">
                    {announcement.is_priority ? 'Urgent Update' : 'Notice'}
                </div>
                <h4 className="text-2xl font-black leading-tight tracking-tight">
                    {announcement.title}
                </h4>
                <p className="text-slate-400 text-sm font-medium leading-relaxed">
                    {announcement.content}
                </p>
                <div className="pt-4 flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                    <BellRing className="w-3.5 h-3.5" /> Published {new Date(announcement.created_at).toLocaleDateString()}
                </div>
            </div>
        </div>
    );
}
