'use client';

import { useState } from 'react';
import { createAjoGroup } from './actions';
import { Modal } from '@/app/components/Modal';
import { Plus, Loader2, Calendar, Banknote, RefreshCcw, Type, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export function CreateGroupButton() {
    const [isOpen, setIsOpen] = useState(false);
    const [showKycModal, setShowKycModal] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (formData: FormData) => {
        setLoading(true);
        const result = await createAjoGroup(formData);
        setLoading(false);

        if (result.error) {
            // Check if the error is related to KYC
            if (result.error.includes('KYC')) {
                setIsOpen(false); 
                setShowKycModal(true); 
            } else {
                alert(result.error);
            }
        } else {
            setIsOpen(false);
        }
    };

    return (
        <>
            <button 
                onClick={() => setIsOpen(true)}
                className="bg-cyan-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer hover:bg-cyan-700 transition"
            >
                <Plus className="w-4 h-4" />
                <span>Create Group</span>
            </button>

            {/* 1. The Creation Form Modal */}
            <Modal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title="Start a New Savings Group"
            >
                <form action={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Group Title</label>
                        <div className="relative">
                            <Type className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                            <input
                                name="title"
                                required
                                placeholder="e.g. Lagos Traders June 2025"
                                className="w-full pl-9 p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Contribution (NGN)</label>
                            <div className="relative">
                                <Banknote className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                <input
                                    name="amount"
                                    type="number"
                                    required
                                    placeholder="50000"
                                    className="w-full pl-9 p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none"
                                />
                            </div>
                        </div>
            
                        <div>
                            <label htmlFor="frequency" className="block text-sm font-medium text-slate-700 mb-1">Frequency</label>
                            <div className="relative">
                                <RefreshCcw className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                <select 
                                    id="frequency"
                                    name="frequency"
                                    className="w-full pl-9 p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none bg-white"
                                >
                                    <option value="weekly">Weekly</option>
                                    <option value="monthly">Monthly</option>
                                    <option value="daily">Daily</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="date" className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                            <input
                                id="date"
                                name="start_date"
                                type="date"
                                required
                                className="w-full pl-9 p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none"
                            />
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold cursor-pointer py-2.5 rounded-lg flex items-center justify-center transition-colors"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Group'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* 2. The KYC Warning Modal */}
            <Modal
                isOpen={showKycModal}
                onClose={() => setShowKycModal(false)}
                title="Verification Required"
            >
                <div className="text-center space-y-4 py-4">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto text-orange-600">
                        <ShieldAlert className="w-8 h-8" />
                    </div>
                    
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">Identity Verification Needed</h3>
                        <p className="text-slate-500 text-sm mt-2">
                            To ensure the safety of all members, you must verify your identity before creating or joining an Ajo group.
                        </p>
                    </div>

                    <div className="pt-4 space-y-3">
                        <Link 
                            href="/dashboard/admin"
                            className="block w-full bg-cyan-600 text-white font-semibold py-2.5 rounded-lg hover:bg-cyan-700 transition"
                        >
                            Go to Verification (Demo)
                        </Link>
                        <button
                            onClick={() => setShowKycModal(false)}
                            className="block w-full bg-slate-100 text-slate-600 cursor-pointer font-semibold py-2.5 rounded-lg hover:bg-slate-200 transition"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
}