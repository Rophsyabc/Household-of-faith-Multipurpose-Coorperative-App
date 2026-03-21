'use client';

import { useState } from 'react';
import { postAnnouncement, distributeDividends } from './actions';
import { Megaphone, Coins, TrendingUp, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function AnnouncementManager({ treasuryBalance }: { treasuryBalance: number }) {
    const [loading, setLoading] = useState(false);

    // Explicitly returning Promise<void> to satisfy Next.js form action requirements
    async function onDividendSubmit(formData: FormData): Promise<void> {
        const pStr = formData.get('percentage') as string;
        const p = parseInt(pStr);
        
        if (!p) {
            toast.error("Please select a percentage");
            return;
        }

        const confirmed = window.confirm(`Distribute ${p}% of the treasury to all verified members? This cannot be undone.`);
        if (!confirmed) return;

        setLoading(true);
        try {
            const res = await distributeDividends(p);
            if (res?.error) toast.error(res.error);
            else toast.success("Dividends distributed successfully!");
        } catch (err) {
            toast.error("System error during distribution");
        } finally {
            setLoading(false);
        }
    }

    async function onAnnouncementSubmit(formData: FormData): Promise<void> {
        setLoading(true);
        try {
            const res = await postAnnouncement(formData);
            if (res?.error) toast.error(res.error);
            else {
                toast.success("Announcement posted to all members.");
                const form = document.getElementById('ann-form') as HTMLFormElement;
                if (form) form.reset();
            }
        } catch (err) {
            toast.error("Failed to post notice");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            {/* 1. Post Announcement */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                    <Megaphone className="w-6 h-6 text-cyan-600" /> Broadcast Notice
                </h2>
                <form id="ann-form" action={onAnnouncementSubmit} className="space-y-5">
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 ml-1">Headline</label>
                        <input name="title" required placeholder="Subject Headline" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-cyan-500" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 ml-1">Notice Content</label>
                        <textarea name="content" required rows={3} placeholder="Write your message..." className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-cyan-500 resize-none" />
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-slate-900 hover:bg-black text-white font-black py-4 rounded-2xl transition-all shadow-xl active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                        Post Announcement
                    </button>
                </form>
            </div>

            {/* 2. Distribute Dividends */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col">
                <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                    <Coins className="w-6 h-6 text-cyan-600" /> Distribution
                </h2>
                <div className="bg-cyan-50 p-10 rounded-[2rem] border border-cyan-100 text-center mb-8 flex-1 flex flex-col justify-center items-center">
                    <p className="text-[10px] font-black text-cyan-600 uppercase tracking-widest mb-2">Total Treasury Pool</p>
                    <p className="text-5xl font-black text-slate-900 tracking-tighter">₦{Number(treasuryBalance).toLocaleString()}</p>
                </div>
                <form action={onDividendSubmit} className="space-y-5">
                    <div className="flex gap-2">
                        {[10, 25, 50, 100].map((p) => (
                            <label key={p} className="flex-1">
                                <input type="radio" name="percentage" value={p} className="peer hidden" />
                                <div className="p-4 border border-slate-200 rounded-2xl text-center text-xs font-black text-slate-600 peer-checked:bg-cyan-600 peer-checked:text-white peer-checked:border-cyan-600 cursor-pointer transition-all">
                                    {p}%
                                </div>
                            </label>
                        ))}
                    </div>
                    <button type="submit" disabled={loading || treasuryBalance <= 0} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-black py-4 rounded-2xl transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2">
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <TrendingUp className="w-5 h-5" />}
                        Execute Payout
                    </button>
                </form>
            </div>
        </div>
    );
}
