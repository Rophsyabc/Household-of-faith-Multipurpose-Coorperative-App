import Link from 'next/link';
import { 
    ArrowRight, ShieldCheck, Wallet, Users, Sparkles, 
    TrendingUp, Zap, Star,
    Globe, HeartPulse, GraduationCap, Target, Landmark,
    Share2, type LucideIcon,
} from 'lucide-react';
import { Brand } from '@/app/components/ui/Brand';
import { PageHeader } from '@/app/components/ui/PageHeader';
import { EmptyState } from '@/app/components/ui/EmptyState';
import { Loading } from '@/app/components/ui/Loading';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-white flex flex-col font-sans selection:bg-cyan-100 selection:text-cyan-900">
            <Brand href="/" />

            {/* --- HERO SECTION --- */}
            <header className="relative pt-20 pb-16 overflow-hidden">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cyan-50 rounded-full blur-3xl -mr-48 -mt-48 opacity-40" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-50 rounded-full blur-3xl -ml-24 -mb-24 opacity-30" />
                
                <div className="max-w-5xl mx-auto px-6 relative z-10 text-center grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div>
                        <PageHeader
                            title="Welcome to Household of Faith"
                            subtitle="A modern multipurpose cooperative for savings, loans, Ajo rotations, and community growth."
                        />
                        
                        <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                            Join a trusted community of members building financial futures together. Secure, transparent, and designed for your growth.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 pt-6">
                            <Link 
                                href="/auth" 
                                className="flex items-center justify-center gap-3 bg-cyan-600 hover:bg-cyan-700 text-white text-lg px-8 py-4 rounded-full font-black transition-all shadow-2xl active:scale-95"
                            >
                                Get Started Free
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link 
                                href="#features" 
                                className="flex items-center justify-center gap-2 bg-white border-2 border-slate-100 text-slate-900 px-8 py-4 rounded-full font-black hover:bg-slate-50 transition-all active:scale-95"
                            >
                                Explore Features
                            </Link>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="bg-white border border-slate-200 rounded-2xl p-8 relative overflow-hidden">
                            <h3 className="text-2xl font-bold text-slate-900 mb-4">What We Offer</h3>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center flex-shrink-0">
                                        <Sparkles className="w-4 h-4 text-cyan-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900">Rotational Ajo</h4>
                                        <p className="text-slate-500 text-sm">Automated member matching with guaranteed transparent rotations.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center flex-shrink-0">
                                        <TrendingUp className="w-4 h-4 text-cyan-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900">Savings Goals</h4>
                                        <p className="text-slate-500 text-sm">Target-specific milestones with locked goals for financial discipline.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center flex-shrink-0">
                                        <Zap className="w-4 h-4 text-cyan-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900">Quick Loans</h4>
                                        <p className="text-slate-500 text-sm">Access 3x your savings in instant cooperative loans.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center flex-shrink-0">
                                        <Star className="w-4 h-4 text-cyan-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900">Dividends</h4>
                                        <p className="text-slate-500 text-sm">Share in the cooperative's growth with yearly distributions.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-2xl p-8 relative overflow-hidden">
                            <h3 className="text-2xl font-bold text-slate-900 mb-4">Trusted Community</h3>
                            
                            <div className="grid grid-cols-3 gap-4 pt-4">
                                <div className="flex items-center gap-3 text-slate-500 text-sm">
                                    <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                                        <Star className="w-2.5 h-2.5 text-cyan-500" />
                                    </div>
                                    <span>Verified members</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-500 text-sm">
                                    <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                                        <ShieldCheck className="w-2.5 h-2.5 text-cyan-500" />
                                    </div>
                                    <span>NIN verified</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-500 text-sm">
                                    <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                                        <Globe className="w-2.5 h-2.5 text-cyan-500" />
                                    </div>
                                    <span>Secure platform</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* --- FEATURES --- */}
            <section id="features" className="py-24 bg-slate-50">
                <div className="max-w-6xl mx-auto px-6">
                    <PageHeader
                        title="Our Ecosystem"
                        subtitle="Everything you need to build financial freedom within our community."
                    />
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                        <div className="bg-white rounded-2xl p-6 border border-slate-100 hover:border-cyan-200 hover:shadow-xl transition-all">
                            <div className="w-12 h-12 rounded-2xl bg-cyan-50 flex items-center justify-center mb-4">
                                <Users className="w-6 h-6 text-cyan-600" />
                            </div>
                            <h3 className="font-bold text-slate-900 mb-2">Rotational Ajo</h3>
                            <p className="text-slate-500 text-sm">Automated member matching and transparent rotations. Your turn is guaranteed.</p>
                        </div>

                        <div className="bg-white rounded-2xl p-6 border border-slate-100 hover:border-cyan-200 hover:shadow-xl transition-all">
                            <div className="w-12 h-12 rounded-2xl bg-cyan-50 flex items-center justify-center mb-4">
                                <Target className="w-6 h-6 text-cyan-600" />
                            </div>
                            <h3 className="font-bold text-slate-900 mb-2">Savings Goals</h3>
                            <p className="text-slate-500 text-sm">Target specific milestones with locked goals to build iron-clad financial discipline.</p>
                        </div>

                        <div className="bg-white rounded-2xl p-6 border border-slate-100 hover:border-cyan-200 hover:shadow-xl transition-all">
                            <div className="w-12 h-12 rounded-2xl bg-cyan-50 flex items-center justify-center mb-4">
                                <Zap className="w-6 h-6 text-cyan-600" />
                            </div>
                            <h3 className="font-bold text-slate-900 mb-2">Quick Loans</h3>
                            <p className="text-slate-500 text-sm">Access 3x your savings in instant cooperative loans with minimal paperwork.</p>
                        </div>

                        <div className="bg-white rounded-2xl p-6 border border-slate-100 hover:border-cyan-200 hover:shadow-xl transition-all">
                            <div className="w-12 h-12 rounded-2xl bg-cyan-50 flex items-center justify-center mb-4">
                                <Star className="w-6 h-6 text-cyan-600" />
                            </div>
                            <h3 className="font-bold text-slate-900 mb-2">Dividends</h3>
                            <p className="text-slate-500 text-sm">Share in the cooperative's growth. Yearly distributions for all verified members.</p>
                        </div>

                        <div className="bg-white rounded-2xl p-6 border border-slate-100 hover:border-cyan-200 hover:shadow-xl transition-all">
                            <div className="w-12 h-12 rounded-2xl bg-cyan-50 flex items-center justify-center mb-4">
                                <GraduationCap className="w-6 h-6 text-cyan-600" />
                            </div>
                            <h3 className="font-bold text-slate-900 mb-2">Education Fund</h3>
                            <p className="text-slate-500 text-sm">Specialized sub-accounts for tuition and development with priority payout.</p>
                        </div>

                        <div className="bg-white rounded-2xl p-6 border border-slate-100 hover:border-cyan-200 hover:shadow-xl transition-all">
                            <div className="w-12 h-12 rounded-2xl bg-cyan-50 flex items-center justify-center mb-4">
                                <ShieldCheck className="w-6 h-6 text-cyan-600" />
                            </div>
                            <h3 className="font-bold text-slate-900 mb-2">NIN Verified</h3>
                            <p className="text-slate-500 text-sm">Biometric and NIN verification ensures a safe and trusted community for everyone.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- HOW IT WORKS --- */}
            <section id="how-it-works" className="py-24 bg-white">
                <div className="max-w-6xl mx-auto px-6">
                    <PageHeader
                        title="Your Path to Financial Freedom"
                        subtitle="A simple, transparent journey from onboarding to growth."
                    />
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-cyan-50 flex items-center justify-center text-cyan-600 font-black text-xl">01</div>
                                <div>
                                    <h3 className="font-bold text-slate-900">Verify Identity</h3>
                                    <p className="text-slate-500 text-sm">Complete KYC with NIN and live photo to unlock full membership.</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-cyan-50 flex items-center justify-center text-cyan-600 font-black text-xl">02</div>
                                <div>
                                    <h3 className="font-bold text-slate-900">Fund Your Wallet</h3>
                                    <p className="text-slate-500 text-sm">Add capital using Paystack, bank transfer, or cooperative deposits.</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-cyan-50 flex items-center justify-center text-cyan-600 font-black text-xl">03</div>
                                <div>
                                    <h3 className="font-bold text-slate-900">Join or Save</h3>
                                    <p className="text-slate-500 text-sm">Join an active Ajo cycle or create a personalized savings goal.</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-cyan-50 flex items-center justify-center text-cyan-600 font-black text-xl">04</div>
                                <div>
                                    <h3 className="font-bold text-slate-900">Harvest Growth</h3>
                                    <p className="text-slate-500 text-sm">Receive automated payouts, earn dividends, and build your credit rating.</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-cyan-900 rounded-2xl p-8 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <Star className="w-32 h-32" />
                            </div>
                            <h3 className="text-2xl font-black mb-6">Ready to join?</h3>
                            <p className="text-cyan-100/70 text-lg mb-6 font-medium">
                                Join thousands of members already building their future with Household of Faith.
                            </p>
                            <Link href="/auth" className="inline-flex items-center gap-3 bg-white text-slate-900 px-6 py-3 rounded-full font-black uppercase tracking-widest hover:bg-cyan-50 transition-all shadow-2xl">
                                Join Now <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- FOOTER --- */}
            <footer className="bg-white border-t border-slate-100 pt-20 pb-12">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                        <div className="text-2xl font-black text-slate-900 tracking-tighter">Household of Faith</div>
                        <p className="text-slate-500 max-w-sm font-medium leading-relaxed mt-2">
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

                    <div>
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6">Connect</h4>
                        <ul className="space-y-4 text-sm font-bold text-slate-500">
                            <li><Link href="#" className="hover:text-cyan-600 transition-colors">Discord</Link></li>
                            <li><Link href="#" className="hover:text-cyan-600 transition-colors">Twitter</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-12 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        © {new Date().getFullYear()} Household of Faith Multipurpose Cooperative.
                    </p>
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 hover:text-cyan-600 transition-colors cursor-pointer">
                            <Globe className="w-4 h-4" />
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 hover:text-cyan-600 transition-colors cursor-pointer">
                            <Share2 className="w-4 h-4" />
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}