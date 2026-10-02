'use client';

import { useState } from 'react';
import { processTransaction, verifyPaystackAndCredit } from './actions';
import { Loader2, Plus, Minus, XCircle, CheckCircle2, Landmark, AlertCircle } from 'lucide-react';
import { Modal } from '@/app/components/Modal';
import { usePaystackPayment } from 'react-paystack';
import { toast } from 'sonner';
import Link from 'next/link';

interface BankAccount {
    id: string;
    bank_name: string;
    account_number: string;
}

function generateReference(): string {
    return `DEP-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

export function TransactionForm({ type, email, bankAccounts = [] }: { type: 'credit' | 'debit', email: string, bankAccounts?: BankAccount[] }) {
    const [isOpen, setIsOpen] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [amount, setAmount] = useState('');
    const [selectedBankId, setSelectedBankId] = useState('');
    const [loading, setLoading] = useState(false);
    const isCredit = type === 'credit';

    const paystackReference = generateReference();
    const initializePayment = usePaystackPayment({
        reference: paystackReference,
        email: email,
        amount: parseFloat(amount) * 100,
        publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
        onClose: onClose,
    });

    const onSuccess = async (reference: string) => {
        setLoading(true);
        const val = parseFloat(amount);
        const result = await verifyPaystackAndCredit(reference);
        setLoading(false);

        if (result.error) {
            setStatus('error');
            setMessage(result.error);
        } else {
            setStatus('success');
            setMessage(`Successfully added ₦${val.toLocaleString()} to your wallet via Paystack.`);
            setAmount('');
        }
    };

    const onClose = () => {
        toast.info("Transaction cancelled.");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const val = parseFloat(amount);

        if (isNaN(val) || val <= 0) {
            toast.error('Please enter a valid amount.');
            return;
        }

        if (isCredit) {
            if (!process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY) {
                toast.error("Paystack is not configured. Please add NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY to .env.local");
                return;
            }
            setIsOpen(false);
            initializePayment(onSuccess, onClose);
        } else {
            if (!selectedBankId) {
                toast.error('Please select a destination bank account.');
                return;
            }

            setLoading(true);
            const result = await processTransaction(val, 'debit', selectedBankId);
            setLoading(false);
            setIsOpen(false);

            if (result.error) {
                setStatus('error');
                setMessage(result.error);
            } else {
                setStatus('success');
                setMessage(`Withdrawal request for ₦${val.toLocaleString()} submitted. Our team will process this to your account.`);
                setAmount('');
                setSelectedBankId('');
            }
        }
    };

    const closeStatus = () => setStatus('idle');

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className={`flex items-center justify-center py-4 rounded-2xl font-black cursor-pointer text-sm transition-all active:scale-95 ${
                    isCredit
                        ? 'bg-cyan-600 text-white hover:bg-cyan-700 shadow-lg shadow-cyan-200'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
            >
                {isCredit ? <Plus className="w-4 h-4 mr-2" /> : <Minus className="w-4 h-4 mr-2" />}
                {isCredit ? 'Add Money' : 'Withdraw'}
            </button>

            <Modal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title={isCredit ? 'Fund Wallet' : 'Withdraw Funds'}
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                            Amount (NGN)
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-4 font-black text-slate-400">₦</span>
                            <input
                                type="number"
                                required
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                className="w-full pl-10 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-cyan-500 outline-none text-slate-900 font-black text-xl"
                                autoFocus
                            />
                        </div>
                    </div>

                    {!isCredit && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                                    Destination Bank Account
                                </label>
                                {bankAccounts.length > 0 ? (
                                    <div className="relative">
                                        <Landmark className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                                        <select
                                            required
                                            value={selectedBankId}
                                            onChange={(e) => setSelectedBankId(e.target.value)}
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-cyan-500 appearance-none cursor-pointer"
                                        >
                                            <option value="">Select an account...</option>
                                            {bankAccounts.map(acc => (
                                                <option key={acc.id} value={acc.id}>{acc.bank_name} - {acc.account_number}</option>
                                            ))}
                                        </select>
                                    </div>
                                ) : (
                                    <div className="p-4 bg-red-50 rounded-2xl border border-red-100 flex flex-col items-center text-center gap-3">
                                        <AlertCircle className="w-6 h-6 text-red-500" />
                                        <p className="text-xs text-red-700 font-bold leading-relaxed">
                                            No bank accounts found. You must link a bank account in your profile before you can withdraw.
                                        </p>
                                        <Link href="/dashboard/profile" className="text-[10px] font-black uppercase text-red-600 underline">
                                            Go to Profile
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="p-4 bg-cyan-50 rounded-2xl border border-cyan-100">
                        <p className="text-[10px] text-cyan-700 font-bold leading-relaxed">
                            {isCredit
                                ? 'Secure real-time deposit via Paystack. Funds are credited after we verify your payment.'
                                : 'Withdrawal requests are processed within 24 hours. Ensure your bank details are accurate.'}
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={loading || (!isCredit && bankAccounts.length === 0)}
                            className="w-full py-4 text-sm font-black cursor-pointer text-white bg-slate-900 hover:bg-black rounded-2xl flex items-center justify-center shadow-xl transition-all active:scale-95 disabled:opacity-50"
                        >
                            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {isCredit ? 'Proceed to Paystack' : 'Request Withdrawal'}
                        </button>
                    </div>
                </form>
            </Modal>

            <Modal
                isOpen={status !== 'idle'}
                onClose={closeStatus}
                title={status === 'success' ? 'Confirmed' : 'Error'}
            >
                <div className="text-center py-6 space-y-6">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto ${
                        status === 'success' ? 'bg-green-100 text-green-600 shadow-xl' : 'bg-red-100 text-red-600'
                    }`}>
                        {status === 'success' ? <CheckCircle2 className="w-12 h-12" /> : <XCircle className="w-12 h-12" />}
                    </div>

                    <p className="text-sm text-slate-500 font-medium leading-relaxed px-4">{message}</p>

                    <button
                        onClick={closeStatus}
                        className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl shadow-lg active:scale-95"
                    >
                        Okay
                    </button>
                </div>
            </Modal>
        </>
    );
}
