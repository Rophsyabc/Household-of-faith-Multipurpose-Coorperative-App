'use client';

import { useState } from 'react';
import { Loader2, CheckCircle2, XCircle, Users, Calendar, Banknote, Lock } from 'lucide-react'; // Added Lock
import { createAjoGroup } from './actions';
import { Modal } from '@/app/components/Modal';

export function CreateGroupForm() {
    const [loading, setLoading] = useState(false);
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'success' | 'error'>('success');
    const [modalMessage, setModalMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const result = await createAjoGroup(formData);

        setLoading(false);

        if (result?.error) {
            setModalType('error');
            setModalMessage(result.error);
            setIsModalOpen(true);
        } else {
            setModalType('success');
            setModalMessage('Group created successfully! You are the first member.');
            setIsModalOpen(true);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        if (modalType === 'success') {
            window.location.reload(); 
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                <div className="space-y-2">
                    <h3 className="text-lg font-bold text-slate-900">Create New Ajo Group</h3>
                    <p className="text-sm text-slate-500">Set up a new savings circle and invite friends.</p>
                </div>

                <div className="space-y-4">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Group Title</label>
                        <div className="relative">
                            <Users className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                            <input 
                                name="title" 
                                type="text" 
                                required 
                                placeholder="e.g. December Savings"
                                className="w-full pl-10 p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Amount */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Contribution (₦)</label>
                            <div className="relative">
                                <Banknote className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                                <input 
                                    name="amount" 
                                    type="number" 
                                    required 
                                    min="1000"
                                    placeholder="5000"
                                    className="w-full pl-10 p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none"
                                />
                            </div>
                        </div>

                        {/* Frequency */}
                        <div>
                            <label htmlFor="frequency" className="block text-sm font-medium text-slate-700 mb-1">Frequency</label>
                            <select 
                                id="frequency"
                                name="frequency" 
                                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none bg-white"
                            >
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                            </select>
                        </div>
                    </div>

                    {/* Start Date */}
                    <div>
                        <label htmlFor="date" className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                            <input 
                                id="date"
                                name="start_date" 
                                type="date" 
                                required 
                                className="w-full pl-10 p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* --- Private Group Checkbox --- */}
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="flex items-center h-5">
                            <input 
                                id="is_private" 
                                name="is_private" 
                                type="checkbox" 
                                className="w-5 h-5 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500 cursor-pointer"
                            />
                        </div>
                        <label htmlFor="is_private" className="flex flex-col cursor-pointer select-none">
                            <span className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                <Lock className="w-3 h-3 text-slate-500" /> Private Group
                            </span>
                            <span className="text-xs text-slate-500">Only users with a code can join.</span>
                        </label>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-medium py-2.5 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm disabled:opacity-70"
                >
                    {loading ? (
                        <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Creating Group...
                        </>
                    ) : (
                        'Create Group'
                    )}
                </button>
            </form>

            {/* Success/Error Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={modalType === 'success' ? 'Success' : 'Error'}
            >
                <div className="text-center py-4 space-y-4">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${
                        modalType === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                        {modalType === 'success' ? <CheckCircle2 className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
                    </div>
                    <p className="text-slate-600 font-medium">{modalMessage}</p>
                    <button
                        onClick={handleCloseModal}
                        className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer font-medium py-2.5 rounded-lg transition-colors"
                    >
                        {modalType === 'success' ? 'Great, Let\'s Go' : 'Try Again'}
                    </button>
                </div>
            </Modal>
        </>
    );
}