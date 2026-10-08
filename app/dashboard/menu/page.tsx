import Link from 'next/link';
import { 
    User, ShieldCheck, Bell, Share2, HelpCircle, 
    Settings, LogOut, Info, BookOpen, MessageSquare,
    Gift, Star, CreditCard, Landmark, LayoutGrid
} from 'lucide-react';

const MENU_GROUPS = [
    {
        title: "Account & Security",
        items: [
            { title: "Profile Details", icon: <User className="w-5 h-5" />, href: "/dashboard/profile", color: "text-blue-600", bg: "bg-blue-50" },
            { title: "KYC Verification", icon: <ShieldCheck className="w-5 h-5" />, href: "/dashboard/profile", color: "text-green-600", bg: "bg-green-50" },
            { title: "Notifications", icon: <Bell className="w-5 h-5" />, href: "/dashboard/notifications", color: "text-orange-600", bg: "bg-orange-50" },
        ]
    },
    {
        title: "Rewards & Growth",
        items: [
            { title: "Refer & Earn", icon: <Share2 className="w-5 h-5" />, href: "/dashboard/profile", color: "text-purple-600", bg: "bg-purple-50", badge: "₦500" },
            { title: "Coop Dividends", icon: <Star className="w-5 h-5" />, href: "/dashboard/wallet", color: "text-yellow-600", bg: "bg-yellow-50" },
            { title: "Membership Level", icon: <Gift className="w-5 h-5" />, href: "/dashboard/savings", color: "text-pink-600", bg: "bg-pink-50" },
        ]
    },
    {
        title: "Support & Legal",
        items: [
            { title: "Help Center", icon: <HelpCircle className="w-5 h-5" />, href: "/dashboard/support", color: "text-cyan-600", bg: "bg-cyan-50" },
            { title: "Support Tickets", icon: <MessageSquare className="w-5 h-5" />, href: "/dashboard/support", color: "text-indigo-600", bg: "bg-indigo-50" },
            { title: "Coop Bylaws", icon: <BookOpen className="w-5 h-5" />, href: "#", color: "text-slate-600", bg: "bg-slate-50" },
            { title: "Privacy Policy", icon: <Info className="w-5 h-5" />, href: "#", color: "text-slate-600", bg: "bg-slate-50" },
        ]
    }
];

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export default async function MenuPage() {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { get(name: string) { return cookieStore.get(name)?.value; } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user?.id)
        .single();

    const adminEmailEnv = process.env.NEXT_PUBLIC_ADMIN_EMAIL?.trim();
    const passesEmailCheck = !adminEmailEnv
        || user?.email?.toLowerCase() === adminEmailEnv.toLowerCase();
    const isAdmin = Boolean(profile?.is_admin && passesEmailCheck);

    return (
        <div className="max-w-2xl mx-auto space-y-8 pb-24">
            <div className="flex items-center justify-between px-2">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">App Menu</h1>
                <div className="p-2 bg-white rounded-2xl border border-slate-200 shadow-sm">
                    <Settings className="w-6 h-6 text-slate-400" />
                </div>
            </div>

            <div className="space-y-8">
                {isAdmin && (
                    <div className="space-y-4">
                        <h2 className="text-[10px] font-black text-cyan-600 uppercase tracking-[0.2em] ml-4">Administrator Control</h2>
                        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-[2.5rem] border border-slate-700 shadow-xl overflow-hidden p-1">
                            <Link 
                                href="/dashboard/admin"
                                className="flex items-center justify-between p-5 hover:bg-slate-800/60 transition-all rounded-[2.3rem] group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-cyan-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-900/50">
                                        <ShieldCheck className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <span className="font-black text-white block text-sm">Admin Command Center</span>
                                        <span className="text-[11px] text-cyan-300 font-medium">Manage members, loans, KYC & treasury</span>
                                    </div>
                                </div>
                                <span className="bg-cyan-500 text-slate-900 font-black text-[10px] px-3 py-1 rounded-full uppercase tracking-widest shadow-md">
                                    ROOT
                                </span>
                            </Link>
                        </div>
                    </div>
                )}
                {MENU_GROUPS.map((group, idx) => (
                    <div key={idx} className="space-y-4">
                        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-4">{group.title}</h2>
                        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                            <div className="divide-y divide-slate-50">
                                {group.items.map((item, i) => (
                                    <Link 
                                        key={i} 
                                        href={item.href}
                                        className="flex items-center justify-between p-5 hover:bg-slate-50 transition-all active:scale-[0.99] group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 ${item.bg} ${item.color} rounded-xl flex items-center justify-center transition-transform group-hover:scale-110`}>
                                                {item.icon}
                                            </div>
                                            <span className="font-bold text-slate-700">{item.title}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {item.badge && (
                                                <span className="bg-green-100 text-green-700 text-[10px] font-black px-2 py-0.5 rounded-lg border border-green-200">
                                                    {item.badge}
                                                </span>
                                            )}
                                            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-cyan-50 group-hover:text-cyan-600 transition-colors">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="px-4">
                <button className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-black py-5 rounded-[2rem] border border-red-100 transition-all flex items-center justify-center gap-3 active:scale-95">
                    <LogOut className="w-5 h-5" />
                    Sign Out Safely
                </button>
                <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-8">
                    Household of Faith Multipurpose Cooperative v2.0
                </p>
            </div>
        </div>
    );
}
