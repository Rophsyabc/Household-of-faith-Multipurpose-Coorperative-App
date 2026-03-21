'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/app/lib/supabase/client';
import { Loader2, Eye, EyeOff, UserPlus, LogIn, Sparkles, ShieldCheck, PiggyBank, HandCoins, Users } from 'lucide-react';

const carouselSlides = [
    {
        icon: <Users className="w-12 h-12 text-cyan-500" />,
        title: "Ajo Rotations",
        description: "Join community cycles and get your payout when it's your turn. Secure and automated."
    },
    {
        icon: <PiggyBank className="w-12 h-12 text-green-500" />,
        title: "Smart Savings",
        description: "Set targeted goals for your future milestones. Build discipline with our lock feature."
    },
    {
        icon: <HandCoins className="w-12 h-12 text-purple-500" />,
        title: "Cooperative Loans",
        description: "Access quick loans at competitive rates based on your savings and membership status."
    },
    {
        icon: <ShieldCheck className="w-12 h-12 text-blue-500" />,
        title: "Secure & Transparent",
        description: "Verified membership and real-time ledger tracking for complete peace of mind."
    }
];

function AuthContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const supabase = createClient();
    
    const [isSignUp, setIsSignUp] = useState(false);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Form State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [showPassword, setShowPassword] = useState(false); 
    const [referralCode, setReferralCode] = useState('');

    // Carousel State
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
        }, 4000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const ref = searchParams.get('ref');
        if (ref) {
            setReferralCode(ref);
            setIsSignUp(true); 
        }
    }, [searchParams]);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isSignUp) {
                let referrerId = null;
                if (referralCode) {
                    const { data: refProfile } = await supabase
                        .from('profiles')
                        .select('id')
                        .eq('referral_code', referralCode.toUpperCase())
                        .single();
                    if (refProfile) referrerId = refProfile.id;
                }

                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: { 
                            full_name: fullName,
                            referred_by: referrerId 
                        },
                    },
                });
                if (error) throw error;
                setSuccessMsg('Account created successfully! You can now sign in.');
                setIsSignUp(false); 
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                
                router.push('/dashboard');
                router.refresh();
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
            {/* Left Side: Carousel (Hidden on small mobile if preferred, but user asked for it above login) */}
            <div className="md:w-1/2 bg-slate-900 flex items-center justify-center p-8 relative overflow-hidden order-last md:order-first">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 to-transparent" />
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" />
                
                <div className="relative z-10 max-w-sm text-center">
                    <div className="h-64 flex flex-col items-center justify-center">
                        {carouselSlides.map((slide, idx) => (
                            <div 
                                key={idx} 
                                className={`transition-all duration-700 absolute inset-0 flex flex-col items-center justify-center space-y-6 ${
                                    idx === currentSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'
                                }`}
                            >
                                <div className="p-6 bg-white/5 rounded-[2.5rem] backdrop-blur-md border border-white/10 shadow-2xl">
                                    {slide.icon}
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-black text-white tracking-tight">{slide.title}</h2>
                                    <p className="text-slate-400 text-sm font-medium leading-relaxed px-4">
                                        {slide.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    {/* Indicators */}
                    <div className="flex gap-2 justify-center mt-8">
                        {carouselSlides.map((_, idx) => (
                            <button 
                                key={idx} 
                                onClick={() => setCurrentSlide(idx)}
                                className={`h-1.5 rounded-full transition-all duration-300 ${
                                    idx === currentSlide ? 'w-8 bg-cyan-500' : 'w-2 bg-slate-700'
                                }`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Side: Auth Form */}
            <div className="md:w-1/2 flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-8 border border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-50 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />
                    
                    <div className="text-center mb-8 relative z-10">
                        <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Household of Faith</h1>
                        <p className="text-slate-500 mt-2 font-medium">
                            {isSignUp ? 'Join the Cooperative' : 'Welcome back, Member'}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100 animate-in fade-in zoom-in-95">
                            {error}
                        </div>
                    )}

                    {successMsg && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                            <div className="text-green-600 mt-0.5">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div className="text-xs text-green-800 font-bold">
                                <p className="uppercase tracking-widest mb-1 text-[10px]">Success</p>
                                <p className="font-medium text-sm">{successMsg}</p>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleAuth} className="space-y-5 relative z-10">
                        {isSignUp && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-cyan-500 focus:bg-white outline-none transition-all text-sm font-bold"
                                    placeholder="Enter your full name"
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Email Address</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-cyan-500 focus:bg-white outline-none transition-all text-sm font-bold"
                                placeholder="name@example.com"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Secure Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    minLength={6}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-cyan-500 focus:bg-white outline-none transition-all text-sm font-bold pr-12"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-600 focus:outline-none"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {isSignUp && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-500">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Referral Code (Optional)</label>
                                <div className="relative">
                                    <Sparkles className="absolute left-3 top-4 w-4 h-4 text-cyan-500" />
                                    <input
                                        type="text"
                                        value={referralCode}
                                        onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                                        className="w-full pl-10 p-4 bg-cyan-50/30 border border-cyan-100 rounded-2xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all text-sm font-black tracking-widest text-cyan-700"
                                        placeholder="REFERRAL CODE"
                                    />
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-slate-900 hover:bg-black text-white font-black py-5 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-200 active:scale-95 disabled:opacity-70 mt-4"
                        >
                            {loading ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                isSignUp ? 'Create Account' : 'Sign In'
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-slate-500 text-sm font-medium">
                            {isSignUp ? 'Already have a membership?' : "New to the Cooperative?"}
                        </p>
                        <button
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="mt-2 text-cyan-600 font-black uppercase tracking-widest text-[10px] hover:text-cyan-700 underline underline-offset-4"
                        >
                            {isSignUp ? 'Back to Sign In' : 'Register Now'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function AuthPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-10 h-10 animate-spin text-cyan-600" /></div>}>
            <AuthContent />
        </Suspense>
    );
}
