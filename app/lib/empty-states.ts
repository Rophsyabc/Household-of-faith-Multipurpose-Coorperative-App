'use client';

import { Calendar, User, TrendingUp, PiggyBank, Shield, CreditCard, DollarSign, Clock, Banknote, Wallet, AlertCircle, CheckCircle, Lock, TrendingDown, ArrowRight } from 'lucide-react';

const EMPTY_STATE_DATA = {
    wallet: {
        icon: Wallet,
        title: 'Start Your Financial Journey',
        description: 'Create your wallet and begin saving with household members. Your first deposit gets you in the rotation.',
        action: <Link href="/dashboard/wallet/deposit" className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-full font-black transition-all">
            Fund Your Wallet
            <ArrowRight className="w-4 h-4" />
        </Link>
    },
    transactions: {
        icon: ArrowRight,
        title: 'No Recent Transactions',
        description: 'All transactions will appear here. Start by funding your wallet and making your first transfer.',
        action: <Link href="/dashboard/wallet/deposit" className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-full font-black transition-all">
            Fund Your Wallet
            <ArrowRight className="w-4 h-4" />
        </Link>
    },
    ajo: {
        icon: Users,
        title: 'Join Your Ajo Rotation',
        description: 'You are not currently in an active Ajo rotation. Join or wait for the next rotation cycle.',
        action: <Link href="/dashboard/ajo/join" className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-full font-black transition-all">
            Find an Ajo
            <ArrowRight className="w-4 h-4" />
        </Link>
    },
    savings: {
        icon: PiggyBank,
        title: 'Start a Savings Goal',
        description: 'Create a savings goal to reach specific milestones like education, home purchase, or emergency fund.',
        action: <Link href="/dashboard/savings/goal/create" className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-full font-black transition-all">
            Create Goal
            <ArrowRight className="w-4 h-4" />
        </Link>
    },
    loans: {
        icon: CreditCard,
        title: 'Apply for a Loan',
        description: 'Access cooperative credit facilities backed by your savings and cooperative guarantors.',
        action: <Link href="/dashboard/loans/apply" className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-full font-black transition-all">
            Apply Now
            <ArrowRight className="w-4 h-4" />
        </Link>
    },
    dividends: {
        icon: TrendingUp,
        title: 'No Dividends Yet',
        description: 'Dividends are declared by the cooperative administration following fiscal surplus reviews.',
        action: <Link href="/dashboard/members" className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-full font-black transition-all">
            View Members
            <ArrowRight className="w-4 h-4" />
        </Link>
    },
    education: {
        icon: GraduationCap,
        title: 'Start Your Education Fund',
        description: 'Create a dedicated education fund with priority payout for tuition and school fees.',
        action: <Link href="/dashboard/savings/goal/create" className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-full font-black transition-all">
            Create Fund
            <ArrowRight className="w-4 h-4" />
        </Link>
    }
};

export function getEmptyState(key: keyof typeof EMPTY_STATE_DATA) {
    return EMPTY_STATE_DATA[key];
}
