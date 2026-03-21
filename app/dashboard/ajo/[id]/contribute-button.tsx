'use client';

import { useState } from 'react';
import { contributeToCycle } from '../actions'; 
import { Loader2, Check } from 'lucide-react';


interface ContributeButtonProps {
    groupId: string;
    amount: number;
    currentCycle: number;
}

export function ContributeButton({ groupId, amount, currentCycle }: ContributeButtonProps) {
    const [loading, setLoading] = useState(false);
    const [paid, setPaid] = useState(false);

    const handlePay = async () => {
        if (!confirm(`Confirm contribution of ₦${amount.toLocaleString()}?`)) return;
        
        setLoading(true);
        const result = await contributeToCycle(groupId, amount);
        setLoading(false);

        if (result.error) {
            alert(result.error);
        } else {
            setPaid(true);
        }
    };

    if (paid) {
        return (
            <button disabled className="w-full bg-green-500 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 cursor-default">
                <Check className="w-5 h-5" />
                Paid for Cycle {currentCycle}
            </button>
        );
    }

    return (
        <button
            onClick={handlePay}
            disabled={loading}
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white cursor-pointer py-3 rounded-lg font-bold transition-all shadow-lg shadow-cyan-900/20 flex justify-center items-center"
        >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Pay Now'}
        </button>
    );
}