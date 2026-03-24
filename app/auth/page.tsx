'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/app/lib/supabase/client';
import { Loader2, Eye, EyeOff, Sparkles, ShieldCheck, PiggyBank, HandCoins, Users, Mail, ArrowLeft, ShieldAlert, Lock } from 'lucide-react';

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
    const [isAdminLogin, setIsAdminLogin] = useState(false);
    const [needsVerification, setNeedsVerification] = useState(false);
    const [verificationEmail, setVerificationEmail] = useState('');
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

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isSignUp) {
                // 1. Check for Duplicate Account by Name
                const { data: existingUser } = await supabase
                    .from('profiles')
                    .select('id')
                    .eq('full_name', fullName)
                    .single();

                if (existingUser) {
                    setError('An account with this name already exists. Please Login instead.');
                    setLoading(false);
                    return;
                }

                let referrerId = null;
                if (referralCode) {
                    const { data: refProfile } = await supabase
                        .from('profiles')
                        .select('id')
                        .eq('referral_code', referralCode.toUpperCase())
                        .single();
                    if (refProfile) referrerId = refProfile.id;
                }

                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: { 
                            full_name: fullName,
                            referred_by: referrerId 
                        },
                        emailRedirectTo: `${window.location.origin}/auth/callback`,
                    },
                });

                if (error) throw error;

                if (data.user && data.session === null) {
                    setVerificationEmail(email);
                    setNeedsVerification(true);
                }
            } else {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (error) {
                    if (error.message.includes('Email not confirmed')) {
                        setVerificationEmail(email);
                        setNeedsVerification(true);
                        return;
                    }
                    throw error;
                }
                
                if (data.user) {
                    // 2. Strict Admin Access Control
                    if (isAdminLogin) {
                        const { data: profile } = await supabase
                            .from('profiles')
                            .select('is_admin')
                            .eq('id', data.user.id)
                            .single();

                        if (!profile?.is_admin) {
                            await supabase.auth.signOut();
                            throw new Error('Unauthorized: Admin Access Required.');
                        }
                        router.push('/dashboard/admin');
                    } else {
                        router.push('/dashboard');
                    }
                    router.refresh();
                }
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    if (needsVerification) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-10 border border-slate-100 text-center space-y-8">
                    <div className="w-24 h-24 bg-cyan-50 rounded-[2rem] flex items-center justify-center mx-auto shadow-inner">
                        <Mail className="w-12 h-12 text-cyan-600 animate-bounce" />
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Verify your Email</h2>
                        <p className="text-slate-500 font-medium leading-relaxed">
                            We have sent you a verification email to <span className="text-cyan-600 font-bold">{verificationEmail}</span>. Please verify it and log in.
                        </p>
                    </div>
                    <button onClick={() => { setNeedsVerification(false); setIsSignUp(false); }} className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl transition-all shadow-xl active:scale-95">
                        Return to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
            {/* Left Side: Carousel */}
            <div className="md:w-1/2 bg-slate-900 flex items-center justify-center p-8 relative overflow-hidden order-last md:order-first">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 to-transparent" />
                <div className="relative z-10 max-w-sm text-center">
                    <div className="h-64 flex flex-col items-center justify-center">
                        {carouselSlides.map((slide, idx) => (
                            <div key={idx} className={`transition-all duration-700 absolute inset-0 flex flex-col items-center justify-center space-y-6 ${idx === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                                <div className="p-6 bg-white/5 rounded-[2.5rem] backdrop-blur-md border border-white/10">{slide.icon}</div>
                                <h2 className="text-2xl font-black text-white">{slide.title}</h2>
                                <p className="text-slate-400 text-sm font-medium">{slide.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Side: Auth Form */}
            <div className="md:w-1/2 flex items-center justify-center p-4">
                <div className={`w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-8 border ${isAdminLogin ? 'border-amber-200' : 'border-slate-100'} relative`}>
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Household of Faith</h1>
                        <p className={`font-black text-[10px] uppercase tracking-[0.3em] mt-2 ${isAdminLogin ? 'text-amber-600' : 'text-slate-500'}`}>
                            {isAdminLogin ? 'Admin Portal Secure Login' : isSignUp ? 'Join the Cooperative' : 'Member Access'}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100 flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4" /> {error}
                        </div>
                    )}

                    <form onSubmit={handleAuth} className="space-y-5">
                        {isSignUp && !isAdminLogin && (
                            <div className="animate-in fade-in">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Full Profile Name</label>
                                <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold" placeholder="Legal Full Name" />
                            </div>
                        )}
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Email</label>
                            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold" placeholder="name@example.com" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Password</label>
                            <input type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold" placeholder="••••••••" />
                        </div>

                        <button type="submit" disabled={loading} className={`w-full font-black py-5 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-xl active:scale-95 ${isAdminLogin ? 'bg-amber-600 hover:bg-amber-700' : 'bg-slate-900 hover:bg-black'} text-white`}>
                            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : isAdminLogin ? <Lock className="w-5 h-5" /> : 'Enter Application'}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col gap-4 text-center">
                        {!isAdminLogin && (
                            <button onClick={() => setIsSignUp(!isSignUp)} className="text-cyan-600 font-black uppercase tracking-widest text-[10px] hover:underline">
                                {isSignUp ? 'Back to Sign In' : 'Create a New Account'}
                            </button>
                        )}
                        <button onClick={() => { setIsAdminLogin(!isAdminLogin); setIsSignUp(false); }} className="text-slate-400 font-black uppercase tracking-widest text-[10px] hover:text-slate-900 transition-colors">
                            {isAdminLogin ? 'Switch to Member Login' : 'Login as Admin'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function AuthPage() {
    return <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-10 h-10 animate-spin text-cyan-600" /></div>}><AuthContent /></Suspense>;
}
