import Link from 'next/link';
import { 
    ArrowRight, ShieldCheck, Wallet, Users, Sparkles, 
    TrendingUp, Zap, Star,
    Globe, HeartPulse, GraduationCap, Target, Landmark,
    Share2, type LucideIcon
} from 'lucide-react';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-white flex flex-col font-sans selection:bg-cyan-100 selection:text-cyan-900">
            {/* --- NAVIGATION --- */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg shadow-slate-200">
                            <LandmarkIcon className="w-6 h-6 text-cyan-400" />
                        </div>
                        <span className="text-xl font-black text-slate-900 tracking-tighter">
                            Faith<span className="text-cyan-600">Coop</span>
                        </span>
                    </div>
                    
                    <div className="hidden md:flex items-center gap-10">
                        <Link href="#features" className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">Features</Link>
                        <Link href="#how-it-works" className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">How it Works</Link>
                        <Link href="#impact" className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">Community</Link>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link href="/auth" className="text-sm font-black text-slate-900 uppercase tracking-widest hover:text-cyan-600 transition-colors">Sign In</Link>
                        <Link href="/auth" className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl active:scale-95">
                            Join Now
                        </Link>
                    </div>
                </div>
            </nav>

            {/* --- HERO SECTION --- */}
            <header className="relative pt-40 pb-24 overflow-hidden">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-cyan-50 rounded-full blur-3xl -mr-96 -mt-96 opacity-50" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-50 rounded-full blur-3xl -ml-48 -mb-48 opacity-30" />
                
                <div className="max-w-7xl mx-auto px-6 relative z-10 text-center md:text-left grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-50 text-cyan-700 rounded-full border border-cyan-100 animate-fade-in">
                            <Sparkles className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Next-Gen Cooperative Banking</span>
                        </div>
                        
                        <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.1] tracking-tight">
                            Build Wealth, <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600">Together.</span>
                        </h1>
                        
                        <p className="text-xl text-slate-500 max-w-xl leading-relaxed font-medium">
                            Experience the future of rotational savings and community-driven finance. Secure, transparent, and built for your growth.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <Link 
                                href="/auth" 
                                className="group flex items-center justify-center gap-3 bg-cyan-600 hover:bg-cyan-700 text-white text-lg px-10 py-5 rounded-[2rem] font-black transition-all shadow-2xl shadow-cyan-200 active:scale-95"
                            >
                                Get Started Free
                                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link 
                                href="#features" 
                                className="flex items-center justify-center gap-2 bg-white border-2 border-slate-100 text-slate-900 px-10 py-5 rounded-[2rem] font-black hover:bg-slate-50 transition-all active:scale-95"
                            >
                                Explore Features
                            </Link>
                        </div>

                        <div className="flex items-center gap-6 pt-8 border-t border-slate-100">
                            <div className="flex -space-x-3">
                                {[1,2,3,4].map(i => (
                                    <div key={i} className="w-10 h-10 rounded-full border-4 border-white bg-slate-200" />
                                ))}
                            </div>
                            <p className="text-sm font-bold text-slate-400">Join <span className="text-slate-900 font-black">2,500+</span> verified members</p>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="relative z-10 bg-white border border-slate-200 rounded-[3rem] p-4 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)]">
                            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-8 opacity-10">
                                    <Globe className="w-32 h-32" />
                                </div>
                                <div className="space-y-10">
                                    <div className="flex justify-between items-center">
                                        <div className="px-3 py-1 bg-white/10 rounded-full text-[8px] font-black uppercase tracking-widest border border-white/10">Master Card</div>
                                        <ShieldCheck className="w-6 h-6 text-cyan-400" />
                                    </div>
                                    <div>
                                        <p className="text-white/50 text-[10px] font-black uppercase tracking-widest mb-1">Coop Balance</p>
                                        <h3 className="text-4xl font-black tracking-tight">₦4,250,000.00</h3>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-white/30 tracking-widest">Member Since</p>
                                            <p className="text-sm font-bold tracking-widest">2024</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-black italic">FaithCoop</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-4 grid grid-cols-2 gap-4">
                                <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                                    <TrendingUp className="w-6 h-6 text-green-600 mb-2" />
                                    <p className="text-lg font-black text-slate-900">5.2%</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Annual Yield</p>
                                </div>
                                <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                                    <Users className="w-6 h-6 text-cyan-600 mb-2" />
                                    <p className="text-lg font-black text-slate-900">12</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Active Ajo</p>
                                </div>
                            </div>
                        </div>
                        
                        {/* Decorative floating badges */}
                        <div className="absolute -top-10 -right-10 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 animate-bounce delay-700">
                            <Zap className="w-6 h-6 text-yellow-500 fill-current" />
                        </div>
                        <div className="absolute bottom-10 -left-10 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 animate-bounce">
                            <HeartPulse className="w-6 h-6 text-red-500 fill-current" />
                        </div>
                    </div>
                </div>
            </header>

            {/* --- FEATURES GRID --- */}
            <section id="features" className="py-32 bg-slate-50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center space-y-4 mb-20">
                        <h2 className="text-xs font-black text-cyan-600 uppercase tracking-[0.3em]">The Ecosystem</h2>
                        <h3 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Everything you need <br />to succeed.</h3>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <FeatureCard 
                            icon={Users} 
                            title="Rotational Ajo" 
                            desc="Automated member matching and transparent rotations. Your turn is guaranteed." 
                            color="bg-purple-50 text-purple-600"
                        />
                        <FeatureCard 
                            icon={Target} 
                            title="Savings Goals" 
                            desc="Target specific milestones with locked goals to build iron-clad financial discipline." 
                            color="bg-cyan-50 text-cyan-600"
                        />
                        <FeatureCard 
                            icon={Zap} 
                            title="Quick Loans" 
                            desc="Access 3x your savings in instant cooperative loans with minimal paperwork." 
                            color="bg-yellow-50 text-yellow-600"
                        />
                        <FeatureCard 
                            icon={Star} 
                            title="Dividends" 
                            desc="Share in the cooperative's growth. Yearly distributions for all verified members." 
                            color="bg-green-50 text-green-600"
                        />
                        <FeatureCard 
                            icon={GraduationCap} 
                            title="Education Fund" 
                            desc="Specialized sub-accounts for tuition and development with priority payout." 
                            color="bg-blue-50 text-blue-600"
                        />
                        <FeatureCard 
                            icon={ShieldCheck} 
                            title="NIN Verified" 
                            desc="Biometric and NIN verification ensures a safe and trusted community for everyone." 
                            color="bg-red-50 text-red-600"
                        />
                    </div>
                </div>
            </section>

            {/* --- HOW IT WORKS --- */}
            <section id="how-it-works" className="py-32">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <div className="space-y-10">
                        <h2 className="text-4xl font-black text-slate-900 tracking-tight">Your path to <br />financial freedom.</h2>
                        
                        <div className="space-y-8">
                            <Step 
                                num="01" 
                                title="Verify Identity" 
                                desc="Complete your KYC using your NIN and a live photo to unlock full membership status." 
                            />
                            <Step 
                                num="02" 
                                title="Fund Your Wallet" 
                                desc="Add capital to your secure cooperative wallet using Paystack or bank transfer." 
                            />
                            <Step 
                                num="03" 
                                title="Join or Save" 
                                desc="Join an active Ajo cycle or create a personalized savings goal with a lock feature." 
                            />
                            <Step 
                                num="04" 
                                title="Harvest Growth" 
                                desc="Receive automated payouts, earn dividends, and build your credit rating." 
                            />
                        </div>
                    </div>
                    
                    <div className="bg-cyan-900 rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Star className="w-48 h-48" />
                        </div>
                        <h3 className="text-3xl font-black mb-6 leading-tight">Ready to join the community?</h3>
                        <p className="text-cyan-100/70 text-lg mb-10 font-medium">
                            Join thousands of members already building their future with Household of Faith.
                        </p>
                        <Link href="/auth" className="inline-flex items-center gap-3 bg-white text-slate-900 px-10 py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-cyan-50 transition-all shadow-2xl">
                            Join Now <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* --- FOOTER --- */}
            <footer className="bg-white border-t border-slate-100 pt-24 pb-12">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
                        <div className="md:col-span-2 space-y-6">
                            <div className="flex items-center gap-2">
                                <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
                                    <LandmarkIcon className="w-6 h-6 text-cyan-400" />
                                </div>
                                <span className="text-2xl font-black text-slate-900 tracking-tighter">FaithCoop</span>
                            </div>
                            <p className="text-slate-500 max-w-sm font-medium leading-relaxed">
                                Empowering community growth through modern rotational savings and specialized cooperative services.
                            </p>
                        </div>
                        <div>
                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6">Explore</h4>
                            <ul className="space-y-4 text-sm font-bold text-slate-500">
                                <li><Link href="#features" className="hover:text-cyan-600 transition-colors">Features</Link></li>
                                <li><Link href="#how-it-works" className="hover:text-cyan-600 transition-colors">How it Works</Link></li>
                                <li><Link href="/dashboard/services" className="hover:text-cyan-600 transition-colors">Marketplace</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6">Support</h4>
                            <ul className="space-y-4 text-sm font-bold text-slate-500">
                                <li><Link href="#" className="hover:text-cyan-600 transition-colors">Help Center</Link></li>
                                <li><Link href="#" className="hover:text-cyan-600 transition-colors">Terms of Service</Link></li>
                                <li><Link href="#" className="hover:text-cyan-600 transition-colors">Privacy Policy</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="pt-12 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                            © {new Date().getFullYear()} Household of Faith Multipurpose Cooperative.
                        </p>
                        <div className="flex items-center gap-6">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 hover:text-cyan-600 transition-colors cursor-pointer">
                                <Globe className="w-4 h-4" />
                            </div>
                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 hover:text-cyan-600 transition-colors cursor-pointer">
                                <Share2 className="w-4 h-4" />
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function FeatureCard({ icon: Icon, title, desc, color }: { icon: LucideIcon, title: string, desc: string, color: string }) {
    return (
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 hover:border-cyan-200 hover:shadow-xl transition-all group">
            <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform`}>
                <Icon className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-3">{title}</h3>
            <p className="text-slate-500 leading-relaxed font-medium text-sm">{desc}</p>
        </div>
    );
}

function Step({ num, title, desc }: { num: string, title: string, desc: string }) {
    return (
        <div className="flex gap-6 group">
            <div className="text-2xl font-black text-cyan-100 group-hover:text-cyan-600 transition-colors">{num}</div>
            <div className="space-y-1">
                <h4 className="text-lg font-black text-slate-900 tracking-tight">{title}</h4>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">{desc}</p>
            </div>
        </div>
    );
}

function LandmarkIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <line x1="2" x2="22" y1="22" y2="22"/><line x1="8" x2="8" y1="11" y2="18"/><line x1="12" x2="12" y1="11" y2="18"/><line x1="16" x2="16" y1="11" y2="18"/><path d="M12 2 2 7v4h20V7Z"/>
        </svg>
    );
}
