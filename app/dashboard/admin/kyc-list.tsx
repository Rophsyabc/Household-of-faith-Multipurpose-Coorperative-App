'use client';

import { ShieldCheck, User, Phone, Fingerprint, Eye, Check, X, MapPin, Briefcase, Users, Mail, Info } from 'lucide-react';
import { toggleKyc } from './actions';
import { useState } from 'react';
import { Modal } from '@/app/components/Modal';

interface Profile {
    id: string;
    full_name: string;
    email: string;
    phone: string;
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

    return (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden mt-8 shadow-sm">
            <div className="p-4 bg-slate-50 border-b border-slate-100 font-bold text-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-cyan-600" /> Pending KYC Verifications
                </div>
                <span className="bg-orange-100 text-orange-700 text-[10px] px-2 py-0.5 rounded-full uppercase font-black">
                    {users?.length || 0} Awaiting Review
                </span>
            </div>

            {(!users || users.length === 0) ? (
                <div className="p-16 text-center text-slate-400">
                    <ShieldCheck className="w-16 h-16 mx-auto mb-4 opacity-10" />
                    <p className="font-medium">No pending verification requests.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                            <tr>
                                <th className="p-4 font-black uppercase text-[10px] tracking-widest">Member</th>
                                <th className="p-4 font-black uppercase text-[10px] tracking-widest">NIN / Identity</th>
                                <th className="p-4 font-black uppercase text-[10px] tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {users.map((profile) => (
                                <tr key={profile.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center text-cyan-600 font-black">
                                                {profile.full_name?.[0] || 'M'}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900">{profile.full_name}</p>
                                                <p className="text-[10px] text-slate-400 font-medium">{profile.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="space-y-1">
                                            <p className="text-xs font-mono font-bold text-slate-700 tracking-tighter bg-slate-100 px-2 py-0.5 rounded inline-block">
                                                {profile.nin || 'NO NIN'}
                                            </p>
                                            <p className="text-[10px] text-slate-400 flex items-center gap-1">
                                                <Phone className="w-3 h-3" /> {profile.phone}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button 
                                            onClick={() => setSelectedUser(profile)}
                                            className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-black hover:bg-black transition-all shadow-md active:scale-95"
                                        >
                                            Verify Full Profile
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Comprehensive Verification Modal */}
            <Modal 
                isOpen={!!selectedUser} 
                onClose={() => setSelectedUser(null)} 
                title="Member Background Check"
            >
                {selectedUser && (
                    <div className="space-y-8 py-2">
                        {/* 1. Visual Verification */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Face Scan</p>
                                <div className="h-40 bg-slate-100 rounded-2xl overflow-hidden border border-slate-200">
                                    {selectedUser.live_photo_url ? (
                                        <img src={selectedUser.live_photo_url} alt="Live" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-300"><User className="w-8 h-8" /></div>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ID Card (NIN/DL)</p>
                                <div className="h-40 bg-slate-100 rounded-2xl overflow-hidden border border-slate-200">
                                    {selectedUser.id_document_url ? (
                                        <img src={selectedUser.id_document_url} alt="ID" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-300"><Fingerprint className="w-8 h-8" /></div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* 2. Personal & Origin */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-black text-cyan-600 uppercase tracking-[0.2em] border-b border-cyan-50 pb-1 flex items-center gap-2">
                                <Info className="w-3.5 h-3.5" /> Identity & Origin
                            </h4>
                            <div className="grid grid-cols-2 gap-y-3 gap-x-6">
                                <Detail label="Full Name" value={selectedUser.full_name} />
                                <Detail label="Email" value={selectedUser.email} />
                                <Detail label="NIN" value={selectedUser.nin} isMono />
                                <Detail label="Origin" value={`${selectedUser.lga}, ${selectedUser.state_of_origin}`} />
                            </div>
                        </div>

                        {/* 3. Address & Occupation */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-black text-cyan-600 uppercase tracking-[0.2em] border-b border-cyan-50 pb-1 flex items-center gap-2">
                                <Briefcase className="w-3.5 h-3.5" /> Employment & Residency
                            </h4>
                            <div className="space-y-3">
                                <Detail label="Home Address" value={selectedUser.address} />
                                <div className="grid grid-cols-2 gap-6">
                                    <Detail label="Occupation" value={selectedUser.occupation} />
                                    <Detail label="Workplace" value={selectedUser.work_address} />
                                </div>
                            </div>
                        </div>

                        {/* 4. Next of Kin */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-black text-cyan-600 uppercase tracking-[0.2em] border-b border-cyan-50 pb-1 flex items-center gap-2">
                                <Users className="w-3.5 h-3.5" /> Next of Kin (NOK)
                            </h4>
                            <div className="grid grid-cols-2 gap-y-3 gap-x-6">
                                <Detail label="NOK Name" value={selectedUser.next_of_kin_name} />
                                <Detail label="NOK Phone" value={selectedUser.next_of_kin_phone} />
                                <div className="col-span-2">
                                    <Detail label="NOK Address" value={selectedUser.next_of_kin_address} />
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-4">
                            <button 
                                onClick={() => {
                                    toggleKyc(selectedUser.id, 'unverified');
                                    setSelectedUser(null);
                                }}
                                className="flex-1 px-4 py-4 bg-red-50 text-red-700 font-black rounded-2xl hover:bg-red-100 transition-colors shadow-sm"
                            >
                                Decline Request
                            </button>
                            <button 
                                onClick={() => {
                                    toggleKyc(selectedUser.id, 'pending');
                                    setSelectedUser(null);
                                }}
                                className="flex-[2] px-4 py-4 bg-green-600 text-white font-black rounded-2xl hover:bg-green-700 transition-all shadow-xl shadow-green-100"
                            >
                                Approve Certification
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
        <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-0.5">{label}</p>
            <p className={`text-sm font-bold text-slate-900 leading-tight ${isMono ? 'font-mono text-cyan-600' : ''}`}>
                {value || 'Not Provided'}
            </p>
        </div>
    );
}
