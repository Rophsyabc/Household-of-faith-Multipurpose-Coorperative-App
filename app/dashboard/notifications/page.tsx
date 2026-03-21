import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Bell, CheckCircle2 } from 'lucide-react';
import { markAllAsRead } from './actions';
import { RealtimeNotifications } from './realtime-notifications';

export default async function NotificationsPage() {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { get(name: string) { return cookieStore.get(name)?.value; } } }
    );

    const { data: { user } } = await supabase.auth.getUser();

    const { data: notifications } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

    const unreadCount = notifications?.filter(n => !n.is_read).length || 0;

    return (
        <div className="max-w-3xl mx-auto space-y-10 pb-24">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-2">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        Activity Stream
                        {unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-full animate-bounce shadow-lg shadow-red-100">
                                {unreadCount} NEW
                            </span>
                        )}
                    </h1>
                    <p className="text-slate-500 font-medium">Real-time updates on your cooperative transactions and social hits.</p>
                </div>
                
                {unreadCount > 0 && (
                    <form action={markAllAsRead}>
                        <button className="text-[10px] font-black text-cyan-600 uppercase tracking-widest hover:text-cyan-700 transition-colors flex items-center gap-2 bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-sm active:scale-95">
                            <CheckCircle2 className="w-4 h-4" />
                            Clear All
                        </button>
                    </form>
                )}
            </div>

            {(!notifications || notifications.length === 0) ? (
                <div className="bg-white border-2 border-dashed border-slate-200 rounded-[3rem] p-24 text-center">
                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                        <Bell className="w-12 h-12 text-slate-200" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Peace and Quiet</h3>
                    <p className="text-slate-500 mt-3 max-w-xs mx-auto font-medium leading-relaxed">Your activity stream is empty. New updates will appear here in real-time.</p>
                </div>
            ) : (
                <RealtimeNotifications initialNotifications={notifications as any[]} userId={user?.id || ''} />
            )}
        </div>
    );
}
