import { redirect } from 'next/navigation';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { 
    Home, Wallet, Users, LogOut, ShieldCheck, 
    User, HandCoins, Target, LayoutGrid, Bell, 
    Menu, ShoppingBag, Globe, type LucideIcon 
} from 'lucide-react';
import { RealtimeLayoutObserver } from '../components/RealtimeLayoutObserver';
import { RealtimeToast } from '../components/RealtimeToast';

interface Profile {
    full_name: string;
    kyc_status: 'unverified' | 'pending' | 'verified';
}

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const cookieStore = await cookies();

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) { return cookieStore.get(name)?.value; },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/auth');

    const { data: rawProfile } = await supabase
        .from('profiles')
        .select('full_name, kyc_status, is_admin')
        .eq('id', user.id)
        .single();

    const profile = rawProfile as (Profile & { is_admin?: boolean }) | null;

    const isDesignatedAdmin = Boolean(
        process.env.NEXT_PUBLIC_ADMIN_EMAIL &&
        user.email?.toLowerCase() === process.env.NEXT_PUBLIC_ADMIN_EMAIL.toLowerCase()
    );
    const isAdmin = profile?.is_admin === true && isDesignatedAdmin;

    const signOut = async () => {
        'use server';
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) { return cookieStore.get(name)?.value; },
                    set(name: string, value: string, options: CookieOptions) { cookieStore.set(name, value, options); },
                    remove(name: string, options: CookieOptions) { cookieStore.set(name, '', { ...options, maxAge: 0 }); },
                },
            }
        );
        await supabase.auth.signOut();
        redirect('/auth');
    };

    const { count: notificationCount } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false);

    return (
        <div className="flex h-screen bg-slate-50 flex-col md:flex-row overflow-hidden font-sans">
            <RealtimeLayoutObserver userId={user.id} />
            <RealtimeToast userId={user.id} />
            
            {/* --- DESKTOP SIDEBAR --- */}
            <aside className="w-72 bg-white border-r border-slate-200 hidden md:flex flex-col">
                <div className="p-8">
                    <h1 className="text-2xl font-black text-slate-900 tracking-tighter">
                        Household of Faith
                    </h1>
                </div>

                <nav className="flex-1 px-6 space-y-1.5 overflow-y-auto">
                    <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Main Office</p>
                    <NavLink href="/dashboard" icon={Home}>Dashboard</NavLink>
                    <NavLink href="/dashboard/wallet" icon={Wallet} badge={notificationCount || 0}>My Wallet</NavLink>
                    <NavLink href="/dashboard/ajo" icon={Users}>Ajo Groups</NavLink>
                    <NavLink href="/dashboard/savings" icon={Target}>Savings Goals</NavLink>
                    <NavLink href="/dashboard/loans" icon={HandCoins}>Quick Loans</NavLink>
                    
                    <div className="pt-6">
                        <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Ecosystem</p>
                        <NavLink href="/dashboard/marketplace" icon={ShoppingBag}>Marketplace</NavLink>
                        <NavLink href="/dashboard/members" icon={Globe}>Directory</NavLink>
                        <NavLink href="/dashboard/services" icon={LayoutGrid}>Discover</NavLink>
                    </div>

                    <div className="pt-6">
                        <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Settings</p>
                        <NavLink href="/dashboard/profile" icon={User}>Account</NavLink>
                        <NavLink href="/dashboard/menu" icon={Menu}>Full Menu</NavLink>
                    </div>
                </nav>

                <div className="p-6 border-t border-slate-100 space-y-4">
                    {isAdmin && (
                        <Link 
                            href="/dashboard/admin" 
                            className="flex items-center px-4 py-3 text-sm font-black text-slate-900 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all group"
                        >
                            <ShieldCheck className="w-5 h-5 mr-3 text-cyan-600" />
                            Admin Console
                        </Link>
                    )}

                    <div className="flex items-center gap-3 px-2">
                        <div className="w-10 h-10 rounded-2xl bg-cyan-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-cyan-100 shrink-0">
                            {profile?.full_name?.[0] || 'U'}
                        </div>
                        <div className="text-sm overflow-hidden">
                            <p className="font-black text-slate-900 truncate">
                                {profile?.full_name || 'Member'}
                            </p>
                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">
                                {profile?.kyc_status || 'Unverified'}
                            </p>
                        </div>
                    </div>

                    <form action={signOut}>
                        <button className="flex items-center w-full px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-2xl transition-all cursor-pointer">
                            <LogOut className="w-5 h-5 mr-3" />
                            Secure Exit
                        </button>
                    </form>
                </div>
            </aside>

            {/* --- MOBILE HEADER --- */}
            <header className="md:hidden bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
<h1 className="text-xl font-black text-slate-900 tracking-tighter">
                        Household of Faith
                    </h1>
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/notifications" className="relative p-2 bg-slate-50 rounded-xl">
                        <Bell className="w-5 h-5 text-slate-600" />
                        {notificationCount ? (
                            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                        ) : null}
                    </Link>
                    <Link href="/dashboard/profile" className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black text-xs shadow-lg">
                        {profile?.full_name?.[0] || 'U'}
                    </Link>
                </div>
            </header>

            {/* --- MAIN CONTENT --- */}
            <main className="flex-1 overflow-y-auto pb-24 md:pb-0">
                <div className="p-6 md:p-10 max-w-6xl mx-auto">
                    {children}
                </div>
            </main>

            {/* --- MOBILE BOTTOM NAV --- */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-2xl border-t border-slate-100 px-4 py-3 flex items-center justify-between z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                <MobileNavLink href="/dashboard" icon={Home} label="Home" />
                <MobileNavLink href="/dashboard/ajo" icon={Users} label="Ajo" />
                <MobileNavLink href="/dashboard/marketplace" icon={ShoppingBag} label="Market" />
                <MobileNavLink href="/dashboard/wallet" icon={Wallet} label="Wallet" badge={notificationCount} />
                <MobileNavLink href="/dashboard/menu" icon={Menu} label="Menu" />
            </nav>
        </div>
    );
}

function NavLink({ href, icon: Icon, children, badge }: { href: string, icon: LucideIcon, children: React.ReactNode, badge?: number }) {
    return (
        <Link
            href={href}
            className="flex items-center justify-between px-4 py-3 text-sm font-bold text-slate-500 rounded-2xl hover:bg-slate-50 hover:text-cyan-600 group transition-all"
        >
            <div className="flex items-center">
                <Icon className="w-5 h-5 mr-3 text-slate-400 group-hover:text-cyan-600 transition-colors" />
                {children}
            </div>
            {badge !== undefined && badge > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg shadow-red-100">
                    {badge}
                </span>
            )}
        </Link>
    );
}

function MobileNavLink({ href, icon: Icon, label, badge }: { href: string, icon: LucideIcon, label: string, badge?: number }) {
    return (
        <Link href={href} className="flex flex-col items-center gap-1 px-3 py-1 relative group">
            <div className="p-2 rounded-2xl group-active:bg-cyan-50 transition-colors">
                <Icon className="w-6 h-6 text-slate-400 group-hover:text-cyan-600 transition-colors" />
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter group-hover:text-cyan-600">{label}</span>
            {badge !== undefined && badge > 0 && (
                <span className="absolute top-1 right-2 w-4 h-4 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-bounce">
                    {badge}
                </span>
            )}
        </Link>
    );
}
