'use client';

import { useState, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/app/lib/supabase/client';
import { ShieldCheck, Mail, ShieldAlert, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function AuthPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex items-center gap-2 text-slate-500 font-bold">
                    <Loader2 className="w-5 h-5 animate-spin text-cyan-700" />
                    <span>Loading Authentication Portal...</span>
                </div>
            </div>
        }>
            <AuthContent />
        </Suspense>
    );
}

function AuthContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const supabase = createClient();

    const modeParam = searchParams.get('mode');
    const [isSignUp, setIsSignUp] = useState(modeParam === 'signup');

    useEffect(() => {
        if (modeParam === 'signup') {
            setIsSignUp(true);
        } else if (modeParam === 'login') {
            setIsSignUp(false);
        }
    }, [modeParam]);

    const [needsVerification, setNeedsVerification] = useState(false);
    const [verificationEmail, setVerificationEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validation
        const trimmedEmail = email.trim();
        const trimmedPassword = password;
        const trimmedName = fullName.trim();

        if (!trimmedEmail) {
            setError('Please enter a valid email address.');
            return;
        }

        if (trimmedPassword.length < 6) {
            setError('Password must be at least 6 characters in length.');
            return;
        }

        if (isSignUp && trimmedName.length < 2) {
            setError('Please enter your full legal name.');
            return;
        }

        setLoading(true);

        try {
            if (isSignUp) {
                const { data, error: signUpError } = await supabase.auth.signUp({
                    email: trimmedEmail,
                    password: trimmedPassword,
                    options: {
                        data: { full_name: trimmedName },
                        emailRedirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`,
                    },
                });

                if (signUpError) {
                    throw signUpError;
                }

                if (data.user && !data.session) {
                    // Confirmation email required
                    setVerificationEmail(trimmedEmail);
                    setNeedsVerification(true);
                } else if (data.session) {
                    // Direct login (e.g. if email confirmation is disabled)
                    router.push('/dashboard');
                    router.refresh();
                }
            } else {
                const { data, error: signInError } = await supabase.auth.signInWithPassword({
                    email: trimmedEmail,
                    password: trimmedPassword,
                });

                if (signInError) {
                    if (signInError.message.toLowerCase().includes('email not confirmed')) {
                        setVerificationEmail(trimmedEmail);
                        setNeedsVerification(true);
                        return;
                    }
                    throw signInError;
                }

                if (data.user) {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('is_admin')
                        .eq('id', data.user.id)
                        .single();

                    const adminEmailEnv = process.env.NEXT_PUBLIC_ADMIN_EMAIL?.trim();
                    const passesEmailCheck = !adminEmailEnv
                        || data.user.email?.toLowerCase() === adminEmailEnv.toLowerCase();
                    const isAdmin = Boolean(profile?.is_admin && passesEmailCheck);

                    if (isAdmin) {
                        router.push('/dashboard/admin');
                    } else {
                        router.push('/dashboard');
                    }
                    router.refresh();
                }
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                const msg = err.message.toLowerCase();
                if (msg.includes('failed to fetch') || msg.includes('networkerror') || msg.includes('fetch')) {
                    setError('Unable to reach authentication server. Please verify your internet connection or try again shortly.');
                } else if (msg.includes('invalid login credentials')) {
                    setError('Invalid email or password. Please verify your credentials and try again.');
                } else if (msg.includes('user already registered')) {
                    setError('An account with this email already exists. Please switch to Sign In.');
                } else {
                    setError(err.message);
                }
            } else {
                setError('An unexpected error occurred during authentication.');
            }
        } finally {
            setLoading(false);
        }
    };

    if (needsVerification) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">
                <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-slate-200 text-center space-y-6">
                    <div className="w-20 h-20 bg-cyan-50 rounded-2xl flex items-center justify-center mx-auto text-cyan-700">
                        <Mail className="w-10 h-10 animate-bounce" />
                    </div>
                    <div className="space-y-3">
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Verify Your Email</h2>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            A verification link has been dispatched to{' '}
                            <span className="font-bold text-slate-900">{verificationEmail}</span>.
                            Please open the email and follow the instructions to activate your membership account.
                        </p>
                    </div>
                    <div className="pt-2 space-y-3">
                        <button 
                            onClick={() => {
                                setNeedsVerification(false);
                                setIsSignUp(false);
                            }}
                            className="w-full py-3.5 bg-cyan-700 hover:bg-cyan-800 text-white font-black rounded-full shadow-md transition-all active:scale-95"
                        >
                            Return to Sign In
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            {/* Header */}
            <header className="p-4 md:p-6 border-b border-slate-200 bg-white/95 backdrop-blur-md">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-cyan-700 rounded-xl flex items-center justify-center text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </svg>
                        </div>
                        <div>
                            <span className="text-lg font-black text-slate-900 tracking-tight block leading-tight">Household of Faith</span>
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Multipurpose Cooperative</span>
                        </div>
                    </Link>
                    
                    <Link href="/" className="text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors">
                        Back to Home
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center p-4 md:p-8">
                <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200 p-8 sm:p-10">
                    {/* Toggle Tab */}
                    <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl mb-8">
                        <button
                            type="button"
                            onClick={() => { setIsSignUp(false); setError(null); }}
                            className={`py-2.5 text-xs font-black rounded-xl transition-all ${
                                !isSignUp 
                                    ? 'bg-white text-slate-900 shadow-sm' 
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            Sign In
                        </button>
                        <button
                            type="button"
                            onClick={() => { setIsSignUp(true); setError(null); }}
                            className={`py-2.5 text-xs font-black rounded-xl transition-all ${
                                isSignUp 
                                    ? 'bg-white text-slate-900 shadow-sm' 
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            Become a Member
                        </button>
                    </div>

                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
                            {isSignUp ? 'Create Cooperative Account' : 'Welcome Back'}
                        </h1>
                        <p className="text-slate-500 text-xs sm:text-sm font-medium">
                            {isSignUp 
                                ? 'Join Household of Faith Multipurpose Cooperative' 
                                : 'Sign in to access your wallet, savings, and Ajo cycles'}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-700 text-xs font-bold rounded-2xl border border-red-200 flex items-start gap-2.5">
                            <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0 text-red-600" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleAuth} className="space-y-5">
                        {isSignUp && (
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">Legal Full Name</label>
                                <input 
                                    type="text" 
                                    required 
                                    value={fullName} 
                                    onChange={(e) => setFullName(e.target.value)} 
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-700 transition-all"
                                    placeholder="e.g. John Emmanuel Adebayo"
                                    autoComplete="name"
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">Email Address</label>
                            <input 
                                type="email" 
                                required 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-700 transition-all"
                                placeholder="name@example.com"
                                autoComplete="email"
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1.5 ml-1">
                                <label className="text-xs font-bold text-slate-700">Password</label>
                                {isSignUp && <span className="text-[10px] text-slate-400 font-bold">Min. 6 characters</span>}
                            </div>
                            <div className="relative">
                                <input 
                                    type={showPassword ? 'text' : 'password'} 
                                    required 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-700 transition-all pr-11"
                                    placeholder="••••••••"
                                    autoComplete={isSignUp ? 'new-password' : 'current-password'}
                                />
                                <button 
                                    type="button" 
                                    onClick={() => setShowPassword(!showPassword)} 
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 focus:outline-none"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading} 
                            className="w-full py-4 rounded-full font-black text-sm transition-all shadow-md active:scale-95 bg-cyan-700 hover:bg-cyan-800 text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Processing...</span>
                                </>
                            ) : (
                                <>
                                    <span>{isSignUp ? 'Complete Registration' : 'Sign In'}</span>
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-slate-100 text-center text-[11px] font-medium text-slate-500">
                        Household of Faith Multipurpose Cooperative Society &copy; {new Date().getFullYear()}
                    </div>
                </div>
            </main>
        </div>
    );
}