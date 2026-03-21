'use client';

import { useState } from 'react';
import { Play, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { forceAdvanceCycle } from './actions';
import { Modal } from '@/app/components/Modal'; 

export function AdvanceCycleButton({ groupId, groupTitle }: { groupId: string, groupTitle: string }) {
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [result, setResult] = useState<{ success?: boolean; error?: string; message?: string }>({});

    const handleAdvance = async () => {
        setLoading(true);
        
        // Call the Server Action
        const response = await forceAdvanceCycle(groupId);
        
        setLoading(false);
        setResult(response);
        setModalOpen(true);
    };

    const handleClose = () => {
        setModalOpen(false);
        if (result.success) {
        // Reload page to show updated cycle count
        window.location.reload(); 
        }
    };

    return (
        <>
            <button 
                onClick={handleAdvance}
                disabled={loading}
                className="bg-slate-900 hover:bg-black text-white cursor-pointer px-3 py-1.5 rounded-lg text-xs font-medium inline-flex items-center gap-2 transition-transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {loading ? (
                    <Loader2 className="w-3 h-3 animate-spin text-cyan-400" />
                ) : (
                    <Play className="w-3 h-3 text-cyan-400" />
                )}
                {loading ? 'Processing...' : 'Advance Cycle'}
            </button>

            {/* FEEDBACK MODAL */}
            <Modal
                isOpen={modalOpen}
                onClose={handleClose}
                title={result.success ? 'Cycle Advanced' : 'Action Failed'}
            >
                <div className="text-center py-6 space-y-4">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${
                        result.success ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                        {result.success ? <CheckCircle2 className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}
                    </div>
                
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">
                            {result.success ? 'Payment Successful!' : 'Error'}
                        </h3>
                        <p className="text-slate-500 mt-2">
                            {result.success 
                                ? `The winner for the current cycle in "${groupTitle}" has been credited, and the rotation has moved to the next member.` 
                                : result.error || 'Something went wrong.'}
                        </p>
                    </div>

                    <button
                        onClick={handleClose}
                        className="w-full bg-slate-900 text-white cursor-pointer font-medium py-2.5 rounded-lg hover:bg-black transition-colors"
                    >
                        {result.success ? 'Excellent, Refresh Page' : 'Close'}
                    </button>
                </div>
            </Modal>
        </>
    );
}