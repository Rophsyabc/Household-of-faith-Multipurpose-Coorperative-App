'use client';

import { useState } from 'react';
import { User, Phone, MapPin, CheckCircle2, XCircle, Briefcase, Users, Mail, Home } from 'lucide-react';
import { updateProfile } from './actions';
import { Modal } from '@/app/components/Modal';
import { SubmitButton } from './submit-button';

interface Profile {
    full_name: string;
    email: string;
    phone: string;
    address: string;
    occupation: string;
    work_address: string;
    state_of_origin: string;
    lga: string;
    next_of_kin_name: string;
    next_of_kin_phone: string;
    next_of_kin_address: string;
}

export function ProfileForm({ profile }: { profile: Profile }) {
    const [loading, setLoading] = useState(false);
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'success' | 'error'>('success');
    const [modalMessage, setModalMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const result = await updateProfile(formData);

        setLoading(false);

        if (result?.error) {
            setModalType('error');
            setModalMessage(result.error);
        } else {
            setModalType('success');
            setModalMessage('Cooperative profile updated successfully.');
        }
        setIsModalOpen(true);
    };

    return (
        <>
            <form onSubmit={handleSubmit} className="p-8 space-y-10">
                {/* Section 1: Basic Info */}
                <div className="space-y-6">
                    <h3 className="text-xs font-black text-cyan-600 uppercase tracking-[0.2em] border-b border-cyan-100 pb-2 flex items-center gap-2">
                        <User className="w-4 h-4" /> Personal Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Full Name</label>
                            <input name="full_name" required defaultValue={profile.full_name} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-cyan-500 outline-none text-sm font-bold" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Email (Primary)</label>
                            <input type="email" disabled defaultValue={profile.email} className="w-full p-3 bg-slate-100 border border-slate-200 rounded-2xl text-slate-500 text-sm font-bold cursor-not-allowed" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Phone Number</label>
                            <input name="phone" required defaultValue={profile.phone} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-cyan-500 outline-none text-sm font-bold" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">State of Origin</label>
                            <input disabled defaultValue={profile.state_of_origin} className="w-full p-3 bg-slate-100 border border-slate-200 rounded-2xl text-slate-500 text-sm font-bold cursor-not-allowed" />
                        </div>
                    </div>
                </div>

                {/* Section 2: Address & Employment */}
                <div className="space-y-6">
                    <h3 className="text-xs font-black text-cyan-600 uppercase tracking-[0.2em] border-b border-cyan-100 pb-2 flex items-center gap-2">
                        <Briefcase className="w-4 h-4" /> Residency & Employment
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Residential Address</label>
                            <textarea name="address" required rows={2} defaultValue={profile.address} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-cyan-500 outline-none text-sm font-bold resize-none" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Occupation</label>
                                <input name="occupation" required defaultValue={profile.occupation} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-cyan-500 outline-none text-sm font-bold" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Work Address</label>
                                <input name="work_address" required defaultValue={profile.work_address} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-cyan-500 outline-none text-sm font-bold" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 3: Next of Kin (Read Only) */}
                <div className="space-y-6">
                    <h3 className="text-xs font-black text-cyan-600 uppercase tracking-[0.2em] border-b border-cyan-100 pb-2 flex items-center gap-2">
                        <Users className="w-4 h-4" /> Next of Kin (Verification Required to Change)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">NOK Name</label>
                            <input disabled defaultValue={profile.next_of_kin_name} className="w-full p-3 bg-slate-100 border border-slate-200 rounded-2xl text-slate-500 text-sm font-bold cursor-not-allowed" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">NOK Phone</label>
                            <input disabled defaultValue={profile.next_of_kin_phone} className="w-full p-3 bg-slate-100 border border-slate-200 rounded-2xl text-slate-500 text-sm font-bold cursor-not-allowed" />
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-slate-100 flex justify-end">
                    <SubmitButton isLoading={loading} />
                </div>
            </form>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
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
                        onClick={() => setIsModalOpen(false)}
                        className="w-full bg-slate-900 text-white font-black py-3 rounded-2xl transition-colors cursor-pointer"
                    >
                        Okay, Noted
                    </button>
                </div>
            </Modal>
        </>
    );
}
