'use client';

import { useState } from 'react';
import { Send, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Modal } from '@/app/components/Modal';
import { transferFunds } from './transfer-actions';
import { toast } from 'sonner';

export function TransferForm() {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const [email, setEmail] = useState('');
    const [amount, setAmount] = useState('');

    const handleTransfer = async (e: React.FormEvent) => {
        e.preventDefault();
        const val = parseFloat(amount);
        if (!email || isNaN(val) || val <= 0) {
            toast.error("Please provide a valid email and amount.");
            return;
        }

        setLoading(true);
        const res = await transferFunds(email, val);
        setLoading(false);

        if (res.error) {
            setStatus('error');
            setMessage(res.error);
        } else {
            setStatus('success');
            setMessage(`Successfully transferred ₦${val.toLocaleString()} to ${email}.`);
            setEmail('');
            setAmount('');
            setIsOpen(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center justify-center py-3 px-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl font-bold text-sm text-white transition-all active:scale-95 shadow-lg backdrop-blur-md"
            >
                <Send className="w-4 h-4 mr-2" /> Transfer
            </button>

            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Member Transfer">
                <form onSubmit={handleTransfer} className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Recipient Email</label>
                        <input 
                            type="email" 
                            required 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="member@example.com"
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Amount (₦)</label>
                        <input 
                            type="number" 
                            required 
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xl font-black outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                    </div>

                    <div className="p-4 bg-cyan-50 rounded-2xl border border-cyan-100">
                        <p className="text-[10px] text-cyan-700 font-bold leading-relaxed">
                            Transferring funds between cooperative members is instant and free. Ensure the email is correct as transfers are irreversible.
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-slate-900 hover:bg-black text-white font-black rounded-2xl transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2"
                    >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        Confirm Transfer
                    </button>
                </form>
            </Modal>

            <Modal isOpen={status !== 'idle'} onClose={() => setStatus('idle')} title={status === 'success' ? 'Transfer Successful' : 'Transfer Failed'}>
                <div className="text-center py-6 space-y-6">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto ${
                        status === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                        {status === 'success' ? <CheckCircle2 className="w-12 h-12" /> : <XCircle className="w-12 h-12" />}
                    </div>
                    <p className="text-sm text-slate-500 font-medium px-4">{message}</p>
                    <button onClick={() => setStatus('idle')} className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl">Close</button>
                </div>
            </Modal>
        </>
    );
}
