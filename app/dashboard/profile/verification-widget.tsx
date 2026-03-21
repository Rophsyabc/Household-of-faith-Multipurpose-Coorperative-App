'use client';

import { useState } from 'react';
import { ArrowRight, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { requestVerification } from './actions';
import { Modal } from '@/app/components/Modal';

export function VerificationWidget() {
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleRequest = async () => {
        setLoading(true);
        await requestVerification();
        setLoading(false);

        setIsModalOpen(true);
    };

    return (
        <>
            <div className="bg-cyan-50 border border-cyan-100 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-full text-cyan-600 shadow-sm">
                        <AlertCircle className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-cyan-900">Identity Unverified</h3>
                        <p className="text-sm text-cyan-700">Submit your details for approval to unlock all features.</p>
                    </div>
                </div>
                
                <button 
                    onClick={handleRequest}
                    disabled={loading}
                    className="whitespace-nowrap bg-cyan-600 hover:bg-cyan-700 cursor-pointer text-white text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Sending Request...
                        </>
                    ) : (
                        <>
                            Request Verification <ArrowRight className="w-4 h-4" />
                        </>
                    )}
                </button>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Request Sent"
            >
                <div className="text-center py-4 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <p className="text-slate-600 font-medium">
                        Your verification request has been sent to the Admin!
                    </p>
                    <button
                        onClick={() => window.location.reload()} 
                        className="w-full bg-slate-100 hover:bg-slate-200 cursor-pointer text-slate-700 font-medium py-2.5 rounded-lg transition-colors"
                    >
                        Okay, Refresh Page
                    </button>
                </div>
            </Modal>
        </>
    );
}