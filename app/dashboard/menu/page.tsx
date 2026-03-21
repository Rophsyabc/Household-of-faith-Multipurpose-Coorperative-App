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

export default function MenuPage() {
    return (
        <div className="max-w-2xl mx-auto space-y-8 pb-24">
            <div className="flex items-center justify-between px-2">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">App Menu</h1>
                <div className="p-2 bg-white rounded-2xl border border-slate-200 shadow-sm">
                    <Settings className="w-6 h-6 text-slate-400" />
                </div>
            </div>

            <div className="space-y-8">
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
                <p className="text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-8">
                    FaithCoop App Version 1.0.4 • 2024
                </p>
            </div>
        </div>
    );
}
