'use client';

import { useState } from 'react';
import { Landmark, Plus, Trash2, CheckCircle2, Loader2, Building2 } from 'lucide-react';
import { Modal } from '@/app/components/Modal';
import { addBankAccount, deleteBankAccount } from './actions';
import { toast } from 'sonner';

interface BankAccount {
    id: string;
    bank_name: string;
    account_number: string;
    account_name: string;
    is_primary: boolean;
}

export function BankAccounts({ accounts }: { accounts: BankAccount[] }) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        const res = await addBankAccount(formData);
        setLoading(false);

        if (res?.error) {
            toast.error(res.error);
        } else {
            toast.success('Bank account added successfully!');
            setIsOpen(false);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('Remove this bank account?')) return;
        const res = await deleteBankAccount(id);
        if (res?.error) toast.error(res.error);
        else toast.success('Account removed.');
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-cyan-600 uppercase tracking-[0.2em] border-b border-cyan-100 pb-2 flex items-center gap-2">
                    <Landmark className="w-4 h-4" /> Settlement Accounts
                </h3>
                <button 
                    onClick={() => setIsOpen(true)}
                    className="p-2 bg-cyan-50 text-cyan-600 rounded-xl hover:bg-cyan-100 transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {accounts.length === 0 ? (
                    <div className="col-span-full p-8 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl">
                        <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">No accounts linked</p>
                    </div>
                ) : (
                    accounts.map((acc) => (
                        <div key={acc.id} className="bg-white border border-slate-200 p-5 rounded-[2rem] shadow-sm flex items-center justify-between group hover:border-cyan-200 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg">
                                    <Landmark className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="font-black text-slate-900 text-sm">{acc.bank_name}</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{acc.account_number} • {acc.account_name}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => handleDelete(acc.id)}
                                className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))
                )}
            </div>

            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Link Bank Account">
                <form onSubmit={handleAdd} className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Bank Name</label>
                            <input name="bank_name" required placeholder="e.g. Zenith Bank" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-cyan-500" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Account Number</label>
                            <input name="account_number" required maxLength={10} placeholder="0123456789" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-cyan-500" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Account Name</label>
                            <input name="account_name" required placeholder="John Doe" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-cyan-500" />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                        Securely Link Account
                    </button>
                </form>
            </Modal>
        </div>
    );
}
