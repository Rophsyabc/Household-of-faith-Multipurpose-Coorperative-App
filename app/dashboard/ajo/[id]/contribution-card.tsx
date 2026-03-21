'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation'; 
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { contributeToCycle } from '../actions'; 
import { Modal } from '@/app/components/Modal';
import { toast } from 'sonner';

interface ContributionProps {
    groupId: string;
    amount: number;
    cycle: number;
    userBalance: number;
    hasPaid: boolean; 
}

export function ContributionCard({ 
    groupId, 
    amount, 
    cycle, 
    userBalance,
    hasPaid 
}: ContributionProps) {

    const router = useRouter();
    
    const [lastPaidCycle, setLastPaidCycle] = useState<number | null>(null);
    
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    // 2. LOGIC: It is paid if the Server says so OR if we just paid for THIS cycle.
    // When 'cycle' changes (e.g. 1 -> 2), (lastPaidCycle === cycle) becomes false automatically.
    // No useEffect needed!
    const isPaid = hasPaid || lastPaidCycle === cycle;

    const handlePay = async () => {
        if (userBalance < amount) {
            setErrorMsg("Insufficient wallet balance. Please fund your wallet.");
            setModalOpen(true);
            return;
        }

        setLoading(true);

        const res = await contributeToCycle(groupId, amount);
        
        setLoading(false);

        if (res?.error) {
            setErrorMsg(res.error);
            setModalOpen(true);
        } else {
            // 3. Success: We record that we paid for THIS specific cycle
            setLastPaidCycle(cycle);
            router.refresh(); 
        }

        if (res?.success) {
            toast.success("Contribution Received!");
        } else {
            toast.error(res?.error || "Something went wrong");
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm transition-all">
            <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wide mb-4">Current Cycle Action</h3>
            
            <div className="flex items-end justify-between mb-6">
                <div>
                    <p className="text-3xl font-bold text-slate-900">₦{amount.toLocaleString()}</p>
                    <p className="text-slate-500 text-sm mt-1">Due for Cycle {cycle}</p>
                </div>
                
                <div className={`px-3 py-1 rounded-full text-xs font-bold transition-colors duration-300 ${
                    isPaid 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-orange-100 text-orange-700'
                    }`}
                >
                    {isPaid ? 'PAID' : 'PENDING'}
                </div>
            </div>

            {isPaid ? (
                <button disabled className="w-full bg-slate-100 text-slate-400 font-medium py-3 rounded-lg cursor-not-allowed flex items-center justify-center gap-2 border border-slate-200">
                    <CheckCircle2 className="w-5 h-5 text-green-500" /> 
                    Paid for Cycle {cycle}
                </button>
            ) : (
                <button 
                    onClick={handlePay}
                    disabled={loading}
                    className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-medium py-3 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm active:scale-[0.98]"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : `Pay Cycle ${cycle} Contribution`}
                </button>
            )}

            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Transaction Failed">
                <div className="text-center py-4">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 text-red-600">
                        <AlertCircle className="w-6 h-6" />
                    </div>
                    <p className="text-slate-600">{errorMsg}</p>
                    <button onClick={() => setModalOpen(false)} className="mt-4 w-full bg-slate-100 py-2 rounded-lg text-slate-700 cursor-pointer font-medium hover:bg-slate-200">Close</button>
                </div>
            </Modal>
        </div>
    );
}