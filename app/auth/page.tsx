'use client';

import { useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/app/lib/supabase/client';
import { ShieldCheck, Mail, ShieldAlert, Eye, EyeOff, } from 'lucide-react';

export default function AuthPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-pulse text-slate-400">Loading...</div></div>}>
            <AuthContent />
        </Suspense>
    );
}

function AuthContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const supabase = createClient();

    const [isSignUp, setIsSignUp] = useState(false);
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
        setLoading(true);
        setError(null);

        try {
            if (isSignUp) {
                // Check for Duplicate Account by Name
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

                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: { full_name: fullName },
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
                    router.push('/dashboard');
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
                            We have sent a verification email to <span className="text-cyan-600 font-bold">{verificationEmail}</span>. Please verify it and log in.
                        </p>
                    </div>
                    <button onClick={() => setNeedsVerification(false)} className="w-full py-4 bg-cyan-600 hover:bg-cyan-700 text-white font-black rounded-full shadow-xl active:scale-95 transition-all">
                        Resend Verification Email
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Header */}
            <header className="p-4 md:p-6 border-b border-slate-100 bg-white/90 backdrop-blur-xl shadow-sm">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-cyan-600 rounded-xl flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </svg>
                        </div>
                        <span className="text-xl font-black text-slate-900 tracking-tighter">Household of Faith</span>
                    </div>
                    
                    <div className="flex items-center gap-3 text-sm font-black">
                        {isSignUp ? 'Already have an account?' : 'New to the cooperative?'}
                        <button onClick={() => setIsSignUp(!isSignUp)} className="text-cyan-600 hover:underline transition-colors">
                            {isSignUp ? 'Sign In' : 'Create Account'}
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center p-4 md:p-8">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 p-8">
                    <h1 className="text-2xl font-black text-slate-900 text-center mb-1 tracking-tight">
                        {isSignUp ? 'Create an Account' : 'Sign In to Your Account'}
                    </h1>
                    <p className="text-slate-500 text-sm text-center mb-6">
                        {isSignUp ? 'Join our multipurpose cooperative community today.' : 'Access your wallet, Ajo rotations, and savings goals.'}
                    </p>

                    {error && (
                        <div className="mb-4 p-4 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100 flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4" /> {error}
                        </div>
                    )}

                    <form onSubmit={handleAuth} className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">Email</label>
                            <input 
                                type="email" 
                                required 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold placeholder:text-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-600"
                                placeholder="name@example.com"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">Password</label>
                            <div className="relative">
                                <input 
                                    type={showPassword ? 'text' : 'password'} 
                                    required 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold placeholder:text-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-600"
                                    placeholder="••••••••"
                                />
                                <button 
                                    type="button" 
                                    onClick={() => setShowPassword(!showPassword)} 
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {isSignUp && (
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Name</label>
                                <input 
                                    type="text" 
                                    required 
                                    value={fullName} 
                                    onChange={(e) => setFullName(e.target.value)} 
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold placeholder:text-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-600"
                                    placeholder="Legal Full Name"
                                />
                            </div>
                        )}

                        <button type="submit" disabled={loading} className="w-full py-4 rounded-full font-black transition-all shadow-lg active:scale-95 bg-cyan-600 hover:bg-cyan-700 text-white disabled:opacity-50 disabled:cursor-not-allowed">
                            {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-slate-100 text-center text-xs font-bold text-slate-500">
                        By continuing, you agree to our Terms of Service and Privacy Policy.
                    </div>
                </div>
            </main>
        </div>
    );
}