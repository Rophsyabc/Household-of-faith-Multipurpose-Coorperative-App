'use client';

import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import { Share2, Copy } from 'lucide-react';
import { toast } from 'sonner';

export function ShareReferral({ code }: { code: string }) {
    const referralLink = `${window.location.origin}/auth?ref=${code}`;

    const handleShare = async () => {
        if (Capacitor.isNativePlatform()) {
            await Share.share({
                title: 'Join FaithCoop',
                text: `Join me on FaithCoop! Use my code ${code} to start your community savings journey.`,
                url: referralLink,
                dialogTitle: 'Share with friends',
            });
        } else {
            // Fallback for Web
            navigator.clipboard.writeText(referralLink);
            toast.success("Referral link copied to clipboard!");
        }
    };

    return (
        <div className="flex flex-col sm:flex-row gap-4">
            <div 
                onClick={() => {
                    navigator.clipboard.writeText(referralLink);
                    toast.success("Link copied!");
                }}
                className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between group cursor-pointer hover:bg-white/10 transition-all overflow-hidden"
            >
                <span className="text-sm font-bold text-cyan-400 truncate mr-4">{referralLink}</span>
                <Copy className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors shrink-0" />
            </div>
            <button 
                onClick={handleShare}
                className="bg-cyan-600 hover:bg-cyan-500 text-white font-black px-8 py-4 rounded-2xl transition-all shadow-xl active:scale-95 text-sm uppercase tracking-widest flex items-center justify-center gap-2"
            >
                <Share2 className="w-4 h-4" /> {Capacitor.isNativePlatform() ? 'Share Now' : 'Copy Link'}
            </button>
        </div>
    );
}
