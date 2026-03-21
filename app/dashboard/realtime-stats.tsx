'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Users, Target, MessageSquare, Megaphone } from 'lucide-react';
import Link from 'next/link';

export function RealtimeStats({ 
    initialActiveGroups, 
    initialActiveGoals, 
    initialOpenTickets, 
    initialAnnouncementsCount,
    userId 
}: { 
    initialActiveGroups: number, 
    initialActiveGoals: number, 
    initialOpenTickets: number, 
    initialAnnouncementsCount: number,
    userId: string 
}) {
    const [stats, setStats] = useState({
        activeGroups: initialActiveGroups,
        activeGoals: initialActiveGoals,
        openTickets: initialOpenTickets,
        announcementsCount: initialAnnouncementsCount
    });

    useEffect(() => {
        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        // Realtime subscription for various triggers
        const channel = supabase
            .channel('dashboard-stats')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'ajo_members', filter: `user_id=eq.${userId}` }, () => fetchStats())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'savings_goals', filter: `user_id=eq.${userId}` }, () => fetchStats())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'support_tickets', filter: `user_id=eq.${userId}` }, () => fetchStats())
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'announcements' }, () => fetchStats())
            .subscribe();

        async function fetchStats() {
            const [
                { count: activeGroups },
                { count: activeGoals },
                { count: openTickets },
                { count: announcementsCount }
            ] = await Promise.all([
                supabase.from('ajo_members').select('*', { count: 'exact', head: true }).eq('user_id', userId),
                supabase.from('savings_goals').select('*', { count: 'exact', head: true }).eq('user_id', userId).neq('status', 'withdrawn'),
                supabase.from('support_tickets').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'open'),
                supabase.from('announcements').select('*', { count: 'exact', head: true })
            ]);

            setStats({
                activeGroups: activeGroups || 0,
                activeGoals: activeGoals || 0,
                openTickets: openTickets || 0,
                announcementsCount: announcementsCount || 0
            });
        }

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <QuickStatCard 
                icon={<Users className="w-5 h-5" />} 
                label="Ajo Cycles" 
                value={stats.activeGroups} 
                color="text-purple-600" 
                bg="bg-purple-50" 
                href="/dashboard/ajo"
            />
            <QuickStatCard 
                icon={<Target className="w-5 h-5" />} 
                label="Active Goals" 
                value={stats.activeGoals} 
                color="text-cyan-600" 
                bg="bg-cyan-50" 
                href="/dashboard/savings"
            />
            <QuickStatCard 
                icon={<MessageSquare className="w-5 h-5" />} 
                label="Open Tickets" 
                value={stats.openTickets} 
                color="text-indigo-600" 
                bg="bg-indigo-50" 
                href="/dashboard/support"
            />
            <QuickStatCard 
                icon={<Megaphone className="w-5 h-5" />} 
                label="Community News" 
                value={stats.announcementsCount > 0 ? `${stats.announcementsCount} Posts` : "0"} 
                color="text-red-600" 
                bg="bg-red-50" 
                href="/dashboard/menu"
            />
        </div>
    );
}

function QuickStatCard({ icon, label, value, color, bg, href }: { icon: React.ReactNode, label: string, value: string | number, color: string, bg: string, href: string }) {
    return (
        <Link href={href} className="bg-white border border-slate-200 p-6 rounded-[2rem] shadow-sm hover:border-cyan-200 transition-all group active:scale-95">
            <div className={`w-10 h-10 ${bg} ${color} rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:rotate-6`}>
                {icon}
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
            <p className="text-xl font-black text-slate-900">{value}</p>
        </Link>
    );
}
