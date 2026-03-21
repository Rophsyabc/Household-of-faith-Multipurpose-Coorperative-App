'use client';

import { useState } from 'react';
import { Lock, Unlock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { joinAjoGroup } from './actions';
import { Modal } from '@/app/components/Modal'; // Reuse your existing Modal

interface JoinButtonProps {
    groupId: string;
    isPrivate: boolean;
}

export function JoinButton({ groupId, isPrivate }: JoinButtonProps) {
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [code, setCode] = useState('');

    const handleJoin = async (inputCode?: string) => {
        setLoading(true);

        const res = await joinAjoGroup(groupId, inputCode);
        setLoading(false);
        setModalOpen(false); 

        if (res?.error) {
            toast.error(res.error);
        } else {
            toast.success("Joined group successfully!");
        }
    };

    // If Public -> Join immediately
    // If Private -> Open Modal
    const handleClick = () => {
        if (isPrivate) {
            setModalOpen(true);
        } else {
            handleJoin();
        }
    };

    return (
        <>
            <button 
                onClick={handleClick}
                disabled={loading}
                className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer flex items-center gap-2 transition-colors ${
                isPrivate 
                    ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' 
                    : 'bg-cyan-600 text-white hover:bg-cyan-700'
                }`}
            >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                    isPrivate ? <><Lock className="w-4 h-4" /> Join Private</> : <><Unlock className="w-4 h-4" /> Join Group</>
                )}
            </button>

            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Enter Access Code">
                <div className="p-4">
                    <p className="text-slate-500 text-sm mb-4">This group is private. Please enter the invite code to join.</p>
                    <input 
                        type="text" 
                        placeholder="e.g. 7XK9L2"
                        className="w-full border border-slate-300 rounded-lg p-3 text-lg font-mono uppercase tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                    />
                    <button 
                        onClick={() => handleJoin(code)}
                        disabled={loading || !code}
                        className="w-full mt-4 bg-cyan-600 text-white py-3 rounded-lg font-medium hover:bg-cyan-700 disabled:opacity-50 cursor-pointer"
                    >
                        {loading ? 'Verifying...' : 'Join Now'}
                    </button>
                </div>
            </Modal>
        </>
    );
}