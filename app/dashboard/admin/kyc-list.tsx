'use client';

import { ShieldCheck, User, Phone, Fingerprint, Eye, Check, X, MapPin, Briefcase, Users, Mail, Info, Calendar } from 'lucide-react';
import { processKyc } from './actions';
import { useState } from 'react';
import { Modal } from '@/app/components/Modal';
import { toast } from 'sonner';

interface Profile {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    date_of_birth?: string;
    nin?: string;
    address?: string;
    state_of_origin?: string;
    lga?: string;
    occupation?: string;
    work_address?: string;
    next_of_kin_name?: string;
    next_of_kin_phone?: string;
    next_of_kin_address?: string;
    live_photo_url?: string;
    id_document_url?: string;
}

export function KycList({ users }: { users: Profile[] | null }) {
    const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
    const [processing, setProcessing] = useState(false);

    const handleAction = async (userId: string, status: 'verified' | 'failed') => {
        setProcessing(true);
        const res = await processKyc(userId, status);
        setProcessing(false);
        
        if (res?.error) {
            toast.error(res.error);
        } else {
            toast.success(status === 'verified' ? 'Member Approved!' : 'Member Declined');
            setSelectedUser(null);
        }
    };

    return (
        <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden mt-8 shadow-sm">
            <div className="p-6 bg-slate-50 border-b border-slate-100 font-bold text-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-cyan-600" /> Pending KYC Verifications
                </div>
                <span className="bg-orange-100 text-orange-700 text-[10px] px-3 py-1 rounded-full uppercase font-black tracking-widest">
                    {users?.length || 0} Awaiting Review
                </span>
            </div>

            {(!users || users.length === 0) ? (
                <div className="p-20 text-center text-slate-400">
                    <ShieldCheck className="w-16 h-16 mx-auto mb-4 opacity-10" />
                    <p className="font-medium">No pending verification requests.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                            <tr>
                                <th className="p-6 font-black uppercase text-[10px] tracking-widest">Member</th>
                                <th className="p-6 font-black uppercase text-[10px] tracking-widest">Identity Info</th>
                                <th className="p-6 font-black uppercase text-[10px] tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {users.map((profile) => (
                                <tr key={profile.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-cyan-50 flex items-center justify-center text-cyan-600 font-black shadow-inner">
                                                {profile.full_name?.[0] || 'M'}
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-900 text-base">{profile.full_name}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{profile.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="space-y-1.5">
                                            <p className="text-xs font-mono font-bold text-cyan-700 bg-cyan-50 px-2 py-1 rounded-lg inline-block border border-cyan-100">
                                                NIN: {profile.nin || 'MISSING'}
                                            </p>
                                            <div className="flex items-center gap-3 text-[10px] text-slate-500 font-bold">
                                                <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {profile.phone}</span>
                                                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {profile.date_of_birth || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6 text-right">
                                        <button 
                                            onClick={() => setSelectedUser(profile)}
                                            className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-xs font-black hover:bg-black transition-all shadow-lg active:scale-95 flex items-center gap-2 ml-auto"
                                        >
                                            <Eye className="w-4 h-4" /> Full Audit
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Modal 
                isOpen={!!selectedUser} 
                onClose={() => setSelectedUser(null)} 
                title="Member Integrity Audit"
            >
                {selectedUser && (
                    <div className="space-y-8 max-h-[70vh] overflow-y-auto px-1 custom-scrollbar">
                        {/* 1. Biological Proof */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                    <User className="w-3 h-3" /> Live Face Capture
                                </p>
                                <div className="aspect-[4/3] bg-slate-100 rounded-3xl overflow-hidden border-2 border-slate-200 group relative cursor-pointer">
                                    {selectedUser.live_photo_url ? (
                                        <img src={selectedUser.live_photo_url} alt="Live" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-300"><User className="w-10 h-10" /></div>
                                    )}
                                    <a href={selectedUser.live_photo_url} target="_blank" className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-black">View Original</a>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                    <Fingerprint className="w-3 h-3" /> ID Card Document
                                </p>
                                <div className="aspect-[4/3] bg-slate-100 rounded-3xl overflow-hidden border-2 border-slate-200 group relative cursor-pointer">
                                    {selectedUser.id_document_url ? (
                                        <img src={selectedUser.id_document_url} alt="ID" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-300"><Fingerprint className="w-10 h-10" /></div>
                                    )}
                                    <a href={selectedUser.id_document_url} target="_blank" className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-black">View Original</a>
                                </div>
                            </div>
                        </div>

                        {/* 2. Demographic Data */}
                        <div className="grid grid-cols-2 gap-x-8 gap-y-6 bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100">
                            <Detail label="Full Name" value={selectedUser.full_name} />
                            <Detail label="Date of Birth" value={selectedUser.date_of_birth} />
                            <Detail label="NIN Number" value={selectedUser.nin} isMono />
                            <Detail label="Origin" value={`${selectedUser.lga}, ${selectedUser.state_of_origin}`} />
                            <Detail label="Current Address" value={selectedUser.address} />
                            <Detail label="Employment" value={`${selectedUser.occupation} at ${selectedUser.work_address}`} />
                        </div>

                        {/* 3. Next of Kin Security */}
                        <div className="space-y-4 bg-cyan-50/30 p-6 rounded-[2rem] border border-cyan-100/50">
                            <h4 className="text-xs font-black text-cyan-700 uppercase tracking-widest flex items-center gap-2">
                                <Users className="w-4 h-4" /> Emergency Contact (Next of Kin)
                            </h4>
                            <div className="grid grid-cols-2 gap-6">
                                <Detail label="NOK Name" value={selectedUser.next_of_kin_name} />
                                <Detail label="NOK Phone" value={selectedUser.next_of_kin_phone} />
                                <div className="col-span-2">
                                    <Detail label="NOK Address" value={selectedUser.next_of_kin_address} />
                                </div>
                            </div>
                        </div>

                        {/* Final Decision Actions */}
                        <div className="flex gap-4 pt-4 sticky bottom-0 bg-white pb-2">
                            <button 
                                onClick={() => handleAction(selectedUser.id, 'failed')}
                                disabled={processing}
                                className="flex-1 px-6 py-5 bg-red-50 text-red-700 font-black rounded-3xl hover:bg-red-100 transition-all border-2 border-red-100 disabled:opacity-50"
                            >
                                Disapprove Request
                            </button>
                            <button 
                                onClick={() => handleAction(selectedUser.id, 'verified')}
                                disabled={processing}
                                className="flex-[2] px-6 py-5 bg-green-600 text-white font-black rounded-3xl hover:bg-green-700 transition-all shadow-xl shadow-green-100 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {processing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                                Approve Membership
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}

function Detail({ label, value, isMono = false }: { label: string, value?: string, isMono?: boolean }) {
    return (
        <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
            <p className={`text-sm font-bold text-slate-900 leading-tight ${isMono ? 'font-mono text-cyan-600' : ''}`}>
                {value || 'DATA NOT PROVIDED'}
            </p>
        </div>
    );
}

function RefreshCw(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
            <path d="M3 21v-5h5" />
        </svg>
    )
}
