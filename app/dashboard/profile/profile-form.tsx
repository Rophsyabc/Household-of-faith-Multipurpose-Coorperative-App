'use client';

import { useState, useRef } from 'react';
import { User, Phone, MapPin, CheckCircle2, XCircle, Briefcase, Users, Mail, Home, Camera, Loader2, Trash2, AlertTriangle, ArrowLeft } from 'lucide-react';
import { updateProfile, deleteAccount } from './actions';
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
    live_photo_url?: string;
}

export function ProfileForm({ profile }: { profile: Profile }) {
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState<string | null>(profile.live_photo_url || null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'success' | 'error' | 'delete'>('success');
    const [modalMessage, setModalMessage] = useState('');

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPreview(URL.createObjectURL(file));
        }
    };

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

    const handleDeleteAccount = async () => {
        setLoading(true);
        const res = await deleteAccount();
        if (res?.error) {
            setModalType('error');
            setModalMessage(res.error);
            setLoading(false);
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit} className="p-8 space-y-10">
                {/* Profile Photo */}
                <div className="flex flex-col items-center gap-4 pb-4">
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="relative w-32 h-32 rounded-[2.5rem] bg-slate-100 border-4 border-white shadow-xl overflow-hidden cursor-pointer group hover:border-cyan-500 transition-all"
                    >
                        {preview ? (
                            <img src={preview} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                                <User className="w-12 h-12" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <input 
                        type="file" 
                        ref={fileInputRef}
                        name="profile_photo" 
                        accept="image/*" 
                        onChange={handleImageChange}
                        className="hidden" 
                    />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tap to change photo</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Basic Info */}
                    <div className="space-y-6">
                        <h3 className="text-xs font-black text-cyan-600 uppercase tracking-[0.2em] border-b border-cyan-100 pb-2 flex items-center gap-2">
                            <User className="w-4 h-4" /> Personal Information
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Full Name</label>
                                <input name="full_name" required defaultValue={profile.full_name} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-sm font-bold" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Phone Number</label>
                                <input name="phone" required defaultValue={profile.phone} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-sm font-bold" />
                            </div>
                        </div>
                    </div>

                    {/* Employment */}
                    <div className="space-y-6">
                        <h3 className="text-xs font-black text-cyan-600 uppercase tracking-[0.2em] border-b border-cyan-100 pb-2 flex items-center gap-2">
                            <Briefcase className="w-4 h-4" /> Employment
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Occupation</label>
                                <input name="occupation" required defaultValue={profile.occupation} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-sm font-bold" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Work Address</label>
                                <input name="work_address" required defaultValue={profile.work_address} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-sm font-bold" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Residential Address */}
                <div className="space-y-4">
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Residential Address</label>
                    <textarea name="address" required rows={2} defaultValue={profile.address} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-3xl outline-none text-sm font-bold resize-none" />
                </div>

                <div className="pt-6 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                    <button
                        type="button"
                        onClick={() => {
                            setModalType('delete');
                            setIsModalOpen(true);
                        }}
                        className="text-red-500 font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:opacity-70 transition-opacity"
                    >
                        <Trash2 className="w-4 h-4" /> Terminate Membership
                    </button>
                    <SubmitButton isLoading={loading} />
                </div>
            </form>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={modalType === 'delete' ? 'Danger Zone' : modalType === 'success' ? 'Success' : 'Error'}
            >
                {modalType === 'delete' ? (
                    <div className="text-center py-6 space-y-6">
                        <div className="w-20 h-20 bg-red-50 rounded-[2rem] flex items-center justify-center mx-auto">
                            <AlertTriangle className="w-10 h-10 text-red-500 animate-pulse" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Danger! Account Termination</h3>
                            <p className="text-sm text-slate-500 font-medium leading-relaxed px-4">
                                You are about to delete your profile and membership. This action is irreversible and all cooperative data will be lost.
                            </p>
                        </div>
                        <div className="space-y-3">
                            <button
                                onClick={handleDeleteAccount}
                                disabled={loading}
                                className="w-full bg-red-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-red-100 active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                                Delete My Profile Account
                            </button>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="w-full py-4 text-slate-400 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                            >
                                <ArrowLeft className="w-4 h-4" /> Go Back
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-4 space-y-4">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${
                            modalType === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                        }`}>
                            {modalType === 'success' ? <CheckCircle2 className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
                        </div>
                        <p className="text-slate-600 font-medium">{modalMessage}</p>
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="w-full bg-slate-900 text-white font-black py-3 rounded-2xl"
                        >
                            Okay, Noted
                        </button>
                    </div>
                )}
            </Modal>
        </>
    );
}
