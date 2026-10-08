import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { 
    Target, PiggyBank, ArrowRight, TrendingUp, Wallet, Lock, 
    Unlock, Briefcase, GraduationCap, Home, Plane, PartyPopper, 
    AlertCircle, Calendar, ShieldCheck, Flame, Zap, Trophy, 
    Star, Medal, Info, ChevronRight, CheckCircle2, ShieldAlert
} from 'lucide-react';
import { createSavingsGoal, addFundsToGoal, withdrawFromGoal } from './actions';
import { RealtimeSavings } from './realtime-savings';

export const dynamic = 'force-dynamic';

interface SavingsGoal {
    id: string;
    title: string;
    target_amount: number;
    current_amount: number;
    category: 'General' | 'Emergency' | 'Education' | 'Business' | 'Housing' | 'Travel' | 'Festive';
    contribution_frequency: 'Manual' | 'Daily' | 'Weekly' | 'Monthly';
    amount_per_period: number;
    deadline: string | null;
    is_locked: boolean;
    early_withdrawal_penalty: number;
    streak_count: number;
    status: 'active' | 'completed' | 'withdrawn';
}

const CATEGORIES = [
    { name: 'General', icon: <PiggyBank className="w-4 h-4" /> },
    { name: 'Emergency', icon: <AlertCircle className="w-4 h-4" /> },
    { name: 'Education', icon: <GraduationCap className="w-4 h-4" /> },
    { name: 'Business', icon: <Briefcase className="w-4 h-4" /> },
    { name: 'Housing', icon: <Home className="w-4 h-4" /> },
    { name: 'Travel', icon: <Plane className="w-4 h-4" /> },
    { name: 'Festive', icon: <PartyPopper className="w-4 h-4" /> },
];

const GOAL_BLUEPRINTS = [
    { title: "Emergency Cushion", target: 50000, category: "Emergency", frequency: "Monthly", amount: 5000, icon: <AlertCircle className="w-5 h-5" />, color: "bg-red-50 text-red-600" },
    { title: "Land Purchase", target: 1000000, category: "Housing", frequency: "Monthly", amount: 50000, icon: <Home className="w-5 h-5" />, color: "bg-green-50 text-green-600" },
    { title: "Back to School", target: 150000, category: "Education", frequency: "Weekly", amount: 10000, icon: <GraduationCap className="w-5 h-5" />, color: "bg-blue-50 text-blue-600" },
];

export default async function SavingsPage() {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { get(name: string) { return cookieStore.get(name)?.value; } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/auth');

    const { data: goalsData } = await supabase
        .from('savings_goals')
        .select('*')
        .neq('status', 'withdrawn')
        .order('created_at', { ascending: false });

    const goals = (goalsData as SavingsGoal[]) || [];
    const totalSaved = goals.reduce((acc, goal) => acc + Number(goal.current_amount), 0);
    const highestStreak = goals.reduce((max, goal) => Math.max(max, goal.streak_count || 0), 0);

    const getLevel = (amount: number) => {
        if (amount >= 1000000) return { name: 'Titan', icon: <Trophy className="w-4 h-4 text-yellow-500" />, color: 'text-yellow-600', bg: 'bg-yellow-50' };
        if (amount >= 500000) return { name: 'Platinum', icon: <Medal className="w-4 h-4 text-slate-400" />, color: 'text-slate-600', bg: 'bg-slate-50' };
        if (amount >= 100000) return { name: 'Gold', icon: <Star className="w-4 h-4 text-orange-400" />, color: 'text-orange-600', bg: 'bg-orange-50' };
        if (amount >= 10000) return { name: 'Silver', icon: <Star className="w-4 h-4 text-slate-300" />, color: 'text-slate-500', bg: 'bg-slate-50' };
        return { name: 'Starter', icon: <Star className="w-4 h-4 text-cyan-300" />, color: 'text-cyan-600', bg: 'bg-cyan-50' };
    };

    const userLevel = getLevel(totalSaved);

    return (
        <div className="space-y-10 pb-24">
            <RealtimeSavings userId={user.id} />
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        Wealth Architect
                        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-current ${userLevel.bg} ${userLevel.color} flex items-center gap-1.5`}>
                            {userLevel.icon} {userLevel.name} Tier
                        </span>
                    </h1>
                    <p className="text-slate-500 font-medium">Engineer your future through disciplined, categorized asset accumulation.</p>
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="flex-1 md:flex-none bg-white p-4 rounded-3xl border border-slate-200 flex items-center gap-3 shadow-sm">
                        <div className="p-2 bg-orange-100 text-orange-600 rounded-xl">
                            <Flame className="w-5 h-5 fill-current" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mastery Streak</p>
                            <p className="text-lg font-black text-slate-900">{highestStreak} Days</p>
                        </div>
                    </div>
                    
                    <div className="flex-1 md:flex-none bg-slate-900 text-white p-4 rounded-3xl shadow-xl flex items-center gap-4 border border-slate-800">
                        <div className="p-2 bg-cyan-500 rounded-xl shadow-lg shadow-cyan-500/30">
                            <TrendingUp className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Accumulated Assets</p>
                            <p className="text-lg font-black tracking-tight">₦{totalSaved.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* 1. CREATION & BLUEPRINTS */}
                <div className="lg:col-span-1 space-y-8">
                    {/* Goal Setup Form */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-50 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />
                        <h2 className="text-lg font-black text-slate-900 mb-8 flex items-center gap-2 relative z-10">
                            <Zap className="w-6 h-6 text-yellow-500 fill-current" />
                            Create Custom Goal
                        </h2>
                        <form action={createSavingsGoal} className="space-y-5 relative z-10">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Goal Purpose</label>
                                <input name="title" required placeholder="e.g. My Next Shop" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-cyan-500 transition-all" />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Target (₦)</label>
                                    <input name="target_amount" type="number" required placeholder="100000" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-cyan-500" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Category</label>
                                    <select name="category" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none appearance-none cursor-pointer">
                                        {CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Cycle</label>
                                    <select name="frequency" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none cursor-pointer">
                                        <option value="Manual">Manual</option>
                                        <option value="Daily">Daily</option>
                                        <option value="Weekly">Weekly</option>
                                        <option value="Monthly">Monthly</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Deadline</label>
                                    <input name="deadline" type="date" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-cyan-500" />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="p-5 bg-slate-900 rounded-3xl flex items-center justify-between border border-slate-800 shadow-xl">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-slate-800 rounded-xl">
                                            <Lock className="w-4 h-4 text-cyan-400" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-black text-white">Activate Lock</span>
                                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Discipline Multiplier</span>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" name="is_locked" className="sr-only peer" />
                                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                                    </label>
                                </div>
                                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3">
                                    <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                    <p className="text-[10px] text-amber-900 font-bold leading-relaxed italic">
                                        Locked goals cannot be broken without a 5% penalty. Commit only what you can afford to leave untouched.
                                    </p>
                                </div>
                            </div>

                            <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-black py-5 rounded-[1.5rem] transition-all shadow-xl shadow-cyan-100 active:scale-[0.98] flex items-center justify-center gap-2">
                                <Trophy className="w-5 h-5" />
                                Start Accumulating
                            </button>
                        </form>
                    </div>

                    {/* Goal Blueprints */}
                    <div className="space-y-4">
                        <h3 className="font-black text-slate-900 uppercase tracking-[0.2em] text-[10px] ml-4 flex items-center gap-2">
                            <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" /> 
                            Goal Blueprints
                        </h3>
                        <div className="space-y-3">
                            {GOAL_BLUEPRINTS.map((bp, i) => (
                                <div key={i} className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm flex items-center justify-between group hover:border-cyan-200 transition-all cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 ${bp.color} rounded-2xl flex items-center justify-center`}>
                                            {bp.icon}
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-900 text-sm">{bp.title}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">₦{bp.target.toLocaleString()} • {bp.frequency}</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-cyan-500 transition-colors" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 2. GOALS GRID & PERFORMANCE */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Performance Overview */}
                    <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-cyan-50 rounded-[2rem] flex items-center justify-center text-cyan-600 shadow-inner">
                                <TrendingUp className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">Savings Performance</h3>
                                <p className="text-slate-500 text-sm font-medium">Your current wealth generation velocity is optimal.</p>
                            </div>
                        </div>
                        <div className="hidden md:flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Borrowing Cap</p>
                                <p className="text-lg font-black text-cyan-600">₦{(totalSaved * 3).toLocaleString()}</p>
                            </div>
                            <div className="w-px h-10 bg-slate-100" />
                            <div className="text-right">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dividends</p>
                                <p className="text-lg font-black text-green-600">Active</p>
                            </div>
                        </div>
                    </div>

                    {/* Active Goals Grid */}
                    {(!goals || goals.length === 0) ? (
                        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[3rem] p-24 text-center">
                            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                                <PiggyBank className="w-12 h-12 text-slate-200" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Your Portfolio is Idle</h3>
                            <p className="text-slate-500 mt-3 max-w-sm mx-auto font-medium leading-relaxed">Financial freedom is built one deposit at a time. Start with a Blueprint or a custom goal.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {goals.map((goal: SavingsGoal) => {
                                const progress = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
                                const category = CATEGORIES.find(c => c.name === goal.category) || CATEGORIES[0];
                                const isNearDeadline = goal.deadline && new Date(goal.deadline).getTime() - new Date().getTime() < 7 * 24 * 3600 * 1000;
                                
                                return (
                                    <div key={goal.id} className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm group hover:shadow-2xl hover:border-cyan-200 transition-all flex flex-col h-full relative overflow-hidden">
                                        {/* Status & Streak */}
                                        <div className="flex justify-between items-start mb-8">
                                            <div className="flex items-center gap-4">
                                                <div className="p-4 bg-slate-50 rounded-2xl text-slate-400 group-hover:bg-cyan-600 group-hover:text-white transition-all border border-slate-100 shadow-sm">
                                                    {category.icon}
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">{goal.category}</p>
                                                    <h3 className="font-black text-slate-900 text-lg tracking-tight">{goal.title}</h3>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                {goal.streak_count > 0 && (
                                                    <div className="bg-orange-50 text-orange-600 border border-orange-100 px-2.5 py-1 rounded-xl flex items-center gap-1.5 animate-pulse">
                                                        <Flame className="w-3.5 h-3.5 fill-current" />
                                                        <span className="text-[10px] font-black">{goal.streak_count}</span>
                                                    </div>
                                                )}
                                                {goal.is_locked ? (
                                                    <div className="bg-slate-900 text-white p-2 rounded-xl shadow-lg" title="Strict Discipline Mode">
                                                        <Lock className="w-4 h-4" />
                                                    </div>
                                                ) : (
                                                    <div className="bg-slate-100 text-slate-300 p-2 rounded-xl">
                                                        <Unlock className="w-4 h-4" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Progress Visualization */}
                                        <div className="flex-1 space-y-8">
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-end">
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">Accumulated</p>
                                                        <p className="text-3xl font-black text-slate-900 tracking-tighter">₦{Number(goal.current_amount).toLocaleString()}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">Target</p>
                                                        <p className="text-sm font-bold text-slate-900 opacity-40">₦{Number(goal.target_amount).toLocaleString()}</p>
                                                    </div>
                                                </div>
                                                
                                                <div className="w-full h-5 bg-slate-50 rounded-full overflow-hidden p-1 shadow-inner border border-slate-100">
                                                    <div 
                                                        className={`h-full rounded-full transition-all duration-1000 ${progress === 100 ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.4)]' : 'bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.4)]'}`} 
                                                        style={{ width: `${progress}%` }} 
                                                    />
                                                </div>
                                                <div className="flex justify-between items-center px-1">
                                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{progress.toFixed(0)}% Maturity</p>
                                                    {goal.amount_per_period > 0 && (
                                                        <p className="text-[10px] font-black text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded-lg border border-cyan-100 uppercase tracking-tighter">
                                                            ₦{goal.amount_per_period.toLocaleString()} {goal.contribution_frequency}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Action Bar */}
                                            <div className="flex gap-3">
                                                <form action={async (formData) => {
                                                    'use server';
                                                    const amount = parseFloat(formData.get('amount') as string);
                                                    if (amount > 0) await addFundsToGoal(goal.id, amount);
                                                }} className="flex-1 flex gap-2">
                                                    <div className="relative flex-1 group/input">
                                                        <span className="absolute left-4 top-3.5 font-black text-slate-300 text-xs transition-colors group-focus-within/input:text-cyan-500">₦</span>
                                                        <input name="amount" type="number" placeholder="Inject Capital" className="w-full pl-8 pr-3 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-black outline-none focus:ring-2 focus:ring-cyan-500 transition-all placeholder:text-slate-300" />
                                                    </div>
                                                    <button type="submit" className="bg-slate-900 text-white px-6 rounded-2xl hover:bg-black transition-all shadow-lg active:scale-95 flex items-center justify-center">
                                                        <ArrowRight className="w-5 h-5" />
                                                    </button>
                                                </form>
                                                
                                                <form action={async () => {
                                                    'use server';
                                                    await withdrawFromGoal(goal.id);
                                                }}>
                                                    <button 
                                                        type="submit" 
                                                        className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-center ${
                                                            goal.is_locked && progress < 100 
                                                            ? 'bg-red-50 text-red-600 border-red-100 hover:bg-red-600 hover:text-white group/withdraw shadow-sm' 
                                                            : 'bg-white text-slate-900 border-slate-100 hover:bg-slate-50 shadow-sm'
                                                        }`}
                                                        title={goal.is_locked && progress < 100 ? "Liquidate with 5% Discipline Fine" : "Withdraw to Wallet"}
                                                    >
                                                        <Wallet className="w-5 h-5" />
                                                    </button>
                                                </form>
                                            </div>
                                        </div>
                                        
                                        {/* Footer Meta */}
                                        <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                                            {goal.deadline ? (
                                                <div className={`flex items-center gap-2 text-[10px] font-black uppercase ${isNearDeadline ? 'text-red-500 animate-bounce' : 'text-slate-400'}`}>
                                                    <Calendar className="w-4 h-4" /> 
                                                    Target: {new Date(goal.deadline).toLocaleDateString()}
                                                </div>
                                            ) : (
                                                <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                                                    <Zap className="w-3 h-3" /> Perpetual Savings
                                                </div>
                                            )}
                                            
                                            {goal.is_locked && progress < 100 && (
                                                <div className="bg-amber-100 text-amber-700 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase flex items-center gap-1.5 border border-amber-200">
                                                    <ShieldAlert className="w-3.5 h-3.5" />
                                                    Discipline Penalty: 5%
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Savings Wisdom Section */}
            <div className="bg-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full -mr-48 -mt-48 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full -ml-48 -mb-48 blur-3xl" />
                
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <div className="inline-flex p-3 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md text-cyan-400">
                            <Info className="w-6 h-6" />
                        </div>
                        <h2 className="text-3xl font-black tracking-tight leading-tight">Mastering the Cooperative Savings Culture</h2>
                        <p className="text-slate-400 font-medium leading-relaxed">
                            Savings are the foundation of cooperative participation. Maintaining active target goals builds your financial discipline and establishes your standing for cooperative loan applications and annual surplus allocations.
                        </p>
                        <div className="flex flex-wrap gap-4 pt-4">
                            <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                                <CheckCircle2 className="w-4 h-4 text-green-400" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Disciplined Savings</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                                <CheckCircle2 className="w-4 h-4 text-green-400" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Target Milestones</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-md">
                        <h4 className="text-sm font-black uppercase tracking-widest text-cyan-400 mb-6">Expert Financial Tip</h4>
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center shrink-0">
                                    <Star className="w-5 h-5 text-cyan-400" />
                                </div>
                                <p className="text-xs text-slate-300 leading-relaxed italic">
                                    "Save at least 20% of your income into your cooperative wallet. 
                                    Locked goals provide the highest psychological barrier to impulsive spending."
                                </p>
                            </div>
                            <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-700 border border-white/20 overflow-hidden">
                                        <div className="w-full h-full bg-cyan-600 flex items-center justify-center text-xs font-black">CP</div>
                                    </div>
                                    <div>
                                        <p className="text-xs font-black">Coop Planner</p>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Financial Advisor</p>
                                    </div>
                                </div>
                                <button className="text-[10px] font-black text-cyan-400 uppercase tracking-widest hover:underline">Get Coaching</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
