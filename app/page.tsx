import Link from 'next/link';
import { 
    ArrowRight, ShieldCheck, Wallet, Users, Sparkles, 
    TrendingUp, Zap, Star, Shield, Lock,
    Globe, HeartPulse, GraduationCap, Target, Landmark,
    ShoppingBag, Headphones, CheckCircle2, ChevronRight,
    Building2, FileText, BadgeCheck
} from 'lucide-react';
import { Brand } from '@/app/components/ui/Brand';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-cyan-100 selection:text-cyan-900">
            {/* --- TOP NAVIGATION BAR --- */}
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <Brand href="/" />

                    <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-600">
                        <Link href="#services" className="hover:text-cyan-700 transition-colors">Core Services</Link>
                        <Link href="#how-it-works" className="hover:text-cyan-700 transition-colors">How Membership Works</Link>
                        <Link href="#trust" className="hover:text-cyan-700 transition-colors">Trust & Governance</Link>
                    </nav>

                    <div className="flex items-center gap-3">
                        <Link 
                            href="/auth?mode=login" 
                            className="px-5 py-2.5 text-sm font-black text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all"
                        >
                            Sign In
                        </Link>
                        <Link 
                            href="/auth?mode=signup" 
                            className="px-6 py-2.5 text-sm font-black text-white bg-cyan-700 hover:bg-cyan-800 rounded-full shadow-md hover:shadow-lg transition-all active:scale-95"
                        >
                            Become a Member
                        </Link>
                    </div>
                </div>
            </header>

            {/* --- HERO SECTION --- */}
            <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden bg-white border-b border-slate-100">
                <div className="absolute top-0 right-0 w-[550px] h-[550px] bg-cyan-100/50 rounded-full blur-3xl -mr-40 -mt-40 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-blue-100/40 rounded-full blur-3xl -ml-28 -mb-28 pointer-events-none" />
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-black uppercase tracking-wider mb-6">
                            <BadgeCheck className="w-4 h-4 text-cyan-700" />
                            Cooperative Society & Member Services
                        </div>
                        
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15] mb-6">
                            Household of Faith Multipurpose Cooperative
                        </h1>
                        
                        <p className="text-lg sm:text-xl text-slate-600 leading-relaxed font-medium mb-10">
                            Empowering our community through disciplined cooperative savings, structured rotational thrift (Ajo), accessible credit facilities, and collective economic development.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link 
                                href="/auth?mode=signup" 
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-cyan-700 hover:bg-cyan-800 text-white text-base font-black px-8 py-4 rounded-full shadow-lg hover:shadow-cyan-700/25 transition-all active:scale-95"
                            >
                                Become a Member
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                            <Link 
                                href="/auth?mode=login" 
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-900 text-base font-black px-8 py-4 rounded-full transition-all active:scale-95"
                            >
                                Sign In
                            </Link>
                        </div>
                    </div>

                    {/* Cooperative Value Pillars */}
                    <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 hover:border-cyan-300 transition-all">
                            <div className="w-12 h-12 rounded-xl bg-cyan-100 flex items-center justify-center text-cyan-700 mb-4 font-black">
                                <Building2 className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-black text-slate-900 mb-2">Member Governance</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Democratic cooperative management where member rights and financial welfare are prioritized through transparent bylaws.
                            </p>
                        </div>

                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 hover:border-cyan-300 transition-all">
                            <div className="w-12 h-12 rounded-xl bg-cyan-100 flex items-center justify-center text-cyan-700 mb-4 font-black">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-black text-slate-900 mb-2">Verified Community</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Multi-level identity validation with NIN verification ensures a secure and trusted mutual-support environment.
                            </p>
                        </div>

                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 hover:border-cyan-300 transition-all">
                            <div className="w-12 h-12 rounded-xl bg-cyan-100 flex items-center justify-center text-cyan-700 mb-4 font-black">
                                <FileText className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-black text-slate-900 mb-2">Dedicated Ledger</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Complete transaction traceability with automated recording of every deposit, cycle contribution, and disbursement.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- CORE SERVICES SECTION --- */}
            <section id="services" className="py-20 md:py-28 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <span className="text-cyan-700 text-xs font-black uppercase tracking-widest">Cooperative Solutions</span>
                        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-2 mb-4">
                            Core Cooperative Services
                        </h2>
                        <p className="text-slate-600 font-medium">
                            Designed to meet your personal and collective financial milestones through structured cooperative collaboration.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* 1. Cooperative Savings */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-cyan-300 transition-all">
                            <div className="w-12 h-12 rounded-xl bg-cyan-50 flex items-center justify-center mb-4 text-cyan-700">
                                <Target className="w-6 h-6" />
                            </div>
                            <h3 className="font-black text-lg text-slate-900 mb-2">Cooperative Savings</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Personalized savings targets and locked discipline accounts to help members systematically accumulate capital over time.
                            </p>
                        </div>

                        {/* 2. Ajo / Rotational Savings */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-cyan-300 transition-all">
                            <div className="w-12 h-12 rounded-xl bg-cyan-50 flex items-center justify-center mb-4 text-cyan-700">
                                <Users className="w-6 h-6" />
                            </div>
                            <h3 className="font-black text-lg text-slate-900 mb-2">Ajo / Rotational Savings</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Structured community thrift groups with transparent cycle schedules, automated allocation, and coordinated disbursements.
                            </p>
                        </div>

                        {/* 3. Cooperative Loans */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-cyan-300 transition-all">
                            <div className="w-12 h-12 rounded-xl bg-cyan-50 flex items-center justify-center mb-4 text-cyan-700">
                                <Zap className="w-6 h-6" />
                            </div>
                            <h3 className="font-black text-lg text-slate-900 mb-2">Cooperative Loans</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Accessible credit facilities for verified members, subject to qualified savings multiples, cooperative guidelines, and guarantor review.
                            </p>
                        </div>

                        {/* 4. Wallet */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-cyan-300 transition-all">
                            <div className="w-12 h-12 rounded-xl bg-cyan-50 flex items-center justify-center mb-4 text-cyan-700">
                                <Wallet className="w-6 h-6" />
                            </div>
                            <h3 className="font-black text-lg text-slate-900 mb-2">Cooperative Wallet</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                A secure digital member ledger enabling instant deposits via Paystack, bank withdrawals, and internal cooperative accounting.
                            </p>
                        </div>

                        {/* 5. Dividends */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-cyan-300 transition-all">
                            <div className="w-12 h-12 rounded-xl bg-cyan-50 flex items-center justify-center mb-4 text-cyan-700">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                            <h3 className="font-black text-lg text-slate-900 mb-2">Dividends</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Annual cooperative surplus distributions allocated to qualified members in accordance with cooperative financial performance and AGM resolutions.
                            </p>
                        </div>

                        {/* 6. Education Fund */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-cyan-300 transition-all">
                            <div className="w-12 h-12 rounded-xl bg-cyan-50 flex items-center justify-center mb-4 text-cyan-700">
                                <GraduationCap className="w-6 h-6" />
                            </div>
                            <h3 className="font-black text-lg text-slate-900 mb-2">Education Fund</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Dedicated savings sub-accounts established to prepare systematically for tuition fees, academic milestones, and vocational development.
                            </p>
                        </div>

                        {/* 7. Member Marketplace */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-cyan-300 transition-all">
                            <div className="w-12 h-12 rounded-xl bg-cyan-50 flex items-center justify-center mb-4 text-cyan-700">
                                <ShoppingBag className="w-6 h-6" />
                            </div>
                            <h3 className="font-black text-lg text-slate-900 mb-2">Member Marketplace</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Community trade directory connecting verified cooperative members to showcase products, services, and local entrepreneurial ventures.
                            </p>
                        </div>

                        {/* 8. Member Support */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-cyan-300 transition-all">
                            <div className="w-12 h-12 rounded-xl bg-cyan-50 flex items-center justify-center mb-4 text-cyan-700">
                                <Headphones className="w-6 h-6" />
                            </div>
                            <h3 className="font-black text-lg text-slate-900 mb-2">Member Support</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Dedicated cooperative assistance desk providing responsive member guidance, issue resolution, and administrative support.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- HOW MEMBERSHIP WORKS --- */}
            <section id="how-it-works" className="py-20 md:py-28 bg-white border-y border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <span className="text-cyan-700 text-xs font-black uppercase tracking-widest">Clear Journey</span>
                        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-2 mb-4">
                            How Membership Works
                        </h2>
                        <p className="text-slate-600 font-medium">
                            A transparent 6-step onboarding process to unlock cooperative membership and community benefits.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Step 1 */}
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 relative">
                            <div className="w-10 h-10 rounded-full bg-cyan-700 text-white font-black text-sm flex items-center justify-center mb-4">
                                01
                            </div>
                            <h3 className="text-lg font-black text-slate-900 mb-2">Create Account</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Register with your verified email address and set up a secure password for portal access.
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 relative">
                            <div className="w-10 h-10 rounded-full bg-cyan-700 text-white font-black text-sm flex items-center justify-center mb-4">
                                02
                            </div>
                            <h3 className="text-lg font-black text-slate-900 mb-2">Complete Profile</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Provide personal details, verified phone number, residential address, and employment information.
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 relative">
                            <div className="w-10 h-10 rounded-full bg-cyan-700 text-white font-black text-sm flex items-center justify-center mb-4">
                                03
                            </div>
                            <h3 className="text-lg font-black text-slate-900 mb-2">Complete KYC</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Submit your National Identity Number (NIN), photo verification, and valid identity document.
                            </p>
                        </div>

                        {/* Step 4 */}
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 relative">
                            <div className="w-10 h-10 rounded-full bg-cyan-700 text-white font-black text-sm flex items-center justify-center mb-4">
                                04
                            </div>
                            <h3 className="text-lg font-black text-slate-900 mb-2">Become Approved Member</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Compliance review verifies your submission and activates full cooperative membership privileges.
                            </p>
                        </div>

                        {/* Step 5 */}
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 relative">
                            <div className="w-10 h-10 rounded-full bg-cyan-700 text-white font-black text-sm flex items-center justify-center mb-4">
                                05
                            </div>
                            <h3 className="text-lg font-black text-slate-900 mb-2">Fund Wallet / Savings</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Add capital securely to your cooperative wallet through integrated Paystack checkout or cooperative deposits.
                            </p>
                        </div>

                        {/* Step 6 */}
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 relative">
                            <div className="w-10 h-10 rounded-full bg-cyan-700 text-white font-black text-sm flex items-center justify-center mb-4">
                                06
                            </div>
                            <h3 className="text-lg font-black text-slate-900 mb-2">Join Applicable Services</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Participate in active Ajo rotational thrift cycles, set personal savings goals, or apply for credit facilities.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- TRUST & GOVERNANCE SECTION --- */}
            <section id="trust" className="py-20 md:py-28 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <span className="text-cyan-700 text-xs font-black uppercase tracking-widest">Protection & Compliance</span>
                        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-2 mb-4">
                            Trust, Security & Governance
                        </h2>
                        <p className="text-slate-600 font-medium">
                            Our cooperative operates on principles of mutual trust, technical protection, and disciplined internal accountability.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <div className="w-12 h-12 rounded-xl bg-cyan-50 flex items-center justify-center text-cyan-700 mb-4">
                                <Lock className="w-6 h-6" />
                            </div>
                            <h3 className="font-black text-lg text-slate-900 mb-2">Secure Authentication</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Industry-standard session security and encrypted credentials safeguard member portal access at all times.
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <div className="w-12 h-12 rounded-xl bg-cyan-50 flex items-center justify-center text-cyan-700 mb-4">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <h3 className="font-black text-lg text-slate-900 mb-2">KYC Verification</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Comprehensive identity screening using NIN and photo capture ensures that only legitimate, verified members participate.
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <div className="w-12 h-12 rounded-xl bg-cyan-50 flex items-center justify-center text-cyan-700 mb-4">
                                <Shield className="w-6 h-6" />
                            </div>
                            <h3 className="font-black text-lg text-slate-900 mb-2">Protected Financial Records</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Database-enforced Row Level Security (RLS) ensures that members can only access their own private records and ledgers.
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <div className="w-12 h-12 rounded-xl bg-cyan-50 flex items-center justify-center text-cyan-700 mb-4">
                                <FileText className="w-6 h-6" />
                            </div>
                            <h3 className="font-black text-lg text-slate-900 mb-2">Transaction Tracking</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Clear, timestamped ledger records for every contribution, deposit, loan disbursement, and withdrawal request.
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm md:col-span-2 lg:col-span-2">
                            <div className="w-12 h-12 rounded-xl bg-cyan-50 flex items-center justify-center text-cyan-700 mb-4">
                                <Building2 className="w-6 h-6" />
                            </div>
                            <h3 className="font-black text-lg text-slate-900 mb-2">Cooperative Governance</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Regulated internally through cooperative bylaws and elected committee administration. Surplus allocations and credit policies are conducted transparently in compliance with approved cooperative society constitutions.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- BOTTOM CALL TO ACTION --- */}
            <section className="py-16 md:py-20 bg-slate-900 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4">
                        Join Household of Faith Multipurpose Cooperative
                    </h2>
                    <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto mb-8 font-medium">
                        Start your journey toward disciplined savings, structured Ajo cycles, and cooperative economic growth today.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link 
                            href="/auth?mode=signup" 
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black px-8 py-4 rounded-full transition-all shadow-lg shadow-cyan-500/20 active:scale-95 text-base"
                        >
                            Become a Member
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                        <Link 
                            href="/auth?mode=login" 
                            className="w-full sm:w-auto inline-flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-white font-black px-8 py-4 rounded-full transition-all text-base border border-slate-700"
                        >
                            Sign In
                        </Link>
                    </div>
                </div>
            </section>

            {/* --- FOOTER --- */}
            <footer className="bg-white border-t border-slate-200 pt-16 pb-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
                        <div className="md:col-span-2">
                            <div className="text-xl font-black text-slate-900 tracking-tight mb-2">
                                Household of Faith Multipurpose Cooperative
                            </div>
                            <p className="text-slate-600 text-sm max-w-md leading-relaxed">
                                An autonomous cooperative society focused on community empowerment through structured rotational thrift (Ajo), targeted savings, and mutual credit support.
                            </p>
                        </div>

                        <div>
                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4">Navigation</h4>
                            <ul className="space-y-2.5 text-sm font-bold text-slate-600">
                                <li><Link href="#services" className="hover:text-cyan-700 transition-colors">Core Services</Link></li>
                                <li><Link href="#how-it-works" className="hover:text-cyan-700 transition-colors">How Membership Works</Link></li>
                                <li><Link href="#trust" className="hover:text-cyan-700 transition-colors">Trust & Governance</Link></li>
                                <li><Link href="/auth?mode=signup" className="hover:text-cyan-700 transition-colors">Become a Member</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4">Member Portal</h4>
                            <ul className="space-y-2.5 text-sm font-bold text-slate-600">
                                <li><Link href="/auth?mode=login" className="hover:text-cyan-700 transition-colors">Member Sign In</Link></li>
                                <li><Link href="/dashboard" className="hover:text-cyan-700 transition-colors">Dashboard</Link></li>
                                <li><Link href="/dashboard/support" className="hover:text-cyan-700 transition-colors">Member Support</Link></li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-medium text-slate-500">
                        <p>© {new Date().getFullYear()} Household of Faith Multipurpose Cooperative. All rights reserved.</p>
                        <p className="text-slate-400">Cooperative Society Registration & Internal Bylaws Enforced.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}