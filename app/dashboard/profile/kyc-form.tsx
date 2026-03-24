'use client';

import { useState, useRef } from 'react';
import { Phone, Shield, CheckCircle2, XCircle, Camera, Upload, Fingerprint, RefreshCw, MapPin, Briefcase, Users, Mail, User, Calendar } from 'lucide-react';
import { submitKyc } from './actions';
import { Modal } from '@/app/components/Modal'; 
import { SubmitButton } from './submit-button';
import { toast } from 'sonner';

export function KycForm({ 
    phone: initialPhone,
    email: initialEmail,
    fullName: initialName,
    status
}: { 
    phone: string | null,
    email?: string | null,
    fullName?: string | null,
    status?: string
}) {
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    
    // Media State
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [livePhotoBlob, setLivePhotoBlob] = useState<Blob | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [idCard, setIdCard] = useState<File | null>(null);
    
    // Form State
    const [formData, setFormData] = useState({
        fullName: initialName || '',
        email: initialEmail || '',
        phone: initialPhone || '',
        nin: '',
        dateOfBirth: '',
        stateOfOrigin: '',
        lga: '',
        address: '',
        occupation: '',
        workAddress: '',
        nextOfKinName: '',
        nextOfKinPhone: '',
        nextOfKinAddress: ''
    });

    // Refs
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'success' | 'error'>('success');
    const [modalMessage, setModalMessage] = useState('');

    const updateField = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Camera Logic
    const startCamera = async () => {
        setIsCameraOpen(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'user' }, 
                audio: false 
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Camera access error:", err);
            toast.error("Could not access camera. Please ensure you have granted permission.");
            setIsCameraOpen(false);
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        setIsCameraOpen(false);
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            if (context) {
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                canvas.toBlob((blob) => {
                    if (blob) {
                        setLivePhotoBlob(blob);
                        setPhotoPreview(URL.createObjectURL(blob));
                        stopCamera();
                    }
                }, 'image/jpeg', 0.9);
            }
        }
    };

    const handleIdUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error("File is too large. Max 5MB.");
                return;
            }
            setIdCard(file);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        if (modalType === 'success') {
            window.location.reload();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!livePhotoBlob) return toast.error("Live Photo is required.");
        if (!idCard) return toast.error("ID Document is required.");

        setLoading(true); 

        const finalData = new FormData();
        Object.entries(formData).forEach(([key, value]) => finalData.append(key, value));
        finalData.append('livePhoto', new File([livePhotoBlob], "live_photo.jpg", { type: "image/jpeg" }));
        finalData.append('idCard', idCard);

        const result = await submitKyc(finalData);

        setLoading(false); 

        if (result?.error) {
            setModalType('error');
            setModalMessage(result.error);
            setIsModalOpen(true);
        } else {
            setModalType('success');
            setModalMessage('KYC Verification Submitted! Our security team will review your application shortly.');
            setIsModalOpen(true);
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            {status === 'failed' && (
                <div className="mb-8 p-6 bg-red-50 border border-red-100 rounded-[2rem] flex items-center gap-4 text-red-800 animate-in zoom-in-95">
                    <div className="p-3 bg-white rounded-xl shadow-sm">
                        <XCircle className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                        <h3 className="font-black text-lg tracking-tight">Verification Failed</h3>
                        <p className="text-sm opacity-80 font-medium">Your previous submission was declined. Please review your details and try again.</p>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
                {/* Stepper Header */}
                <div className="bg-slate-900 text-white p-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-cyan-500 rounded-2xl">
                                <Shield className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black tracking-tight">KYC Verification</h2>
                                <p className="text-slate-400 text-sm font-medium">Complete all steps to unlock full benefits</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Step {step} of 4</span>
                            <div className="flex gap-1.5 mt-2">
                                {[1, 2, 3, 4].map((s) => (
                                    <div key={s} className={`h-1.5 w-8 rounded-full transition-all duration-500 ${step >= s ? 'bg-cyan-500' : 'bg-slate-700'}`} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-8">
                    {/* STEP 1: PERSONAL & IDENTITY */}
                    {step === 1 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <User className="w-5 h-5 text-cyan-600" /> Identity Details
                            </h3>
                            <div className="grid md:grid-cols-2 gap-5">
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1">Full Name</label>
                                    <input name="fullName" required value={formData.fullName} onChange={updateField} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-cyan-500 outline-none text-sm font-bold" placeholder="As seen on ID" />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1">Email Address</label>
                                    <input name="email" type="email" required value={formData.email} onChange={updateField} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-cyan-500 outline-none text-sm font-bold" placeholder="name@example.com" />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1">Phone Number</label>
                                    <input name="phone" required value={formData.phone} onChange={updateField} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-cyan-500 outline-none text-sm font-bold" placeholder="+234..." />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1">Date of Birth</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input type="date" name="dateOfBirth" required value={formData.dateOfBirth} onChange={updateField} className="w-full pl-10 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-cyan-500 outline-none text-sm font-bold" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1">NIN (11 Digits)</label>
                                    <input name="nin" required maxLength={11} value={formData.nin} onChange={updateField} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-cyan-500 outline-none text-sm font-bold tracking-widest" placeholder="12345678901" />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1">State of Origin</label>
                                    <input name="stateOfOrigin" required value={formData.stateOfOrigin} onChange={updateField} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-cyan-500 outline-none text-sm font-bold" placeholder="e.g. Delta" />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1">Local Government (LGA)</label>
                                    <input name="lga" required value={formData.lga} onChange={updateField} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-cyan-500 outline-none text-sm font-bold" placeholder="e.g. Ethiope East" />
                                </div>
                            </div>
                            <button onClick={() => setStep(2)} className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl hover:bg-black transition-all shadow-lg flex items-center justify-center gap-2">
                                Continue to Address & Work
                            </button>
                        </div>
                    )}

                    {/* STEP 2: ADDRESS & WORK */}
                    {step === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <Briefcase className="w-5 h-5 text-cyan-600" /> Residental & Work Details
                            </h3>
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1">Home Address</label>
                                    <textarea name="address" required rows={2} value={formData.address} onChange={updateField} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-cyan-500 outline-none text-sm font-bold resize-none" placeholder="Full residential address" />
                                </div>
                                <div className="grid md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1">Occupation</label>
                                        <input name="occupation" required value={formData.occupation} onChange={updateField} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-cyan-500 outline-none text-sm font-bold" placeholder="e.g. Civil Servant" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1">Work/Office Address</label>
                                        <input name="workAddress" required value={formData.workAddress} onChange={updateField} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-cyan-500 outline-none text-sm font-bold" placeholder="Office location" />
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <button onClick={() => setStep(1)} className="flex-1 py-4 text-slate-500 font-bold">Back</button>
                                <button onClick={() => setStep(3)} className="flex-[2] bg-slate-900 text-white font-black py-4 rounded-2xl hover:bg-black transition-all shadow-lg">
                                    Continue to Next of Kin
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: NEXT OF KIN */}
                    {step === 3 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <Users className="w-5 h-5 text-cyan-600" /> Next of Kin Details
                            </h3>
                            <div className="space-y-5">
                                <div className="grid md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1">Full Name</label>
                                        <input name="nextOfKinName" required value={formData.nextOfKinName} onChange={updateField} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-cyan-500 outline-none text-sm font-bold" placeholder="NOK Name" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1">Phone Number</label>
                                        <input name="nextOfKinPhone" required value={formData.nextOfKinPhone} onChange={updateField} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-cyan-500 outline-none text-sm font-bold" placeholder="NOK Phone" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1">Home Address</label>
                                    <textarea name="nextOfKinAddress" required rows={2} value={formData.nextOfKinAddress} onChange={updateField} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-cyan-500 outline-none text-sm font-bold resize-none" placeholder="NOK residential address" />
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <button onClick={() => setStep(2)} className="flex-1 py-4 text-slate-500 font-bold">Back</button>
                                <button onClick={() => setStep(4)} className="flex-[2] bg-slate-900 text-white font-black py-4 rounded-2xl hover:bg-black transition-all shadow-lg">
                                    Continue to Verification
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 4: VERIFICATION MEDIA */}
                    {step === 4 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <Camera className="w-5 h-5 text-cyan-600" /> Biological & ID Verification
                            </h3>
                            
                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Live Capture */}
                                <div className="space-y-3">
                                    <label className="block text-xs font-black text-slate-400 uppercase">Live Face Capture</label>
                                    <div className="relative aspect-square bg-slate-100 rounded-3xl border-2 border-dashed border-slate-200 overflow-hidden shadow-inner flex flex-col items-center justify-center">
                                        {isCameraOpen ? (
                                            <>
                                                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover scale-x-[-1]" />
                                                <button onClick={capturePhoto} className="absolute bottom-4 left-1/2 -translate-x-1/2 w-12 h-12 bg-white rounded-full border-4 border-cyan-500 flex items-center justify-center">
                                                    <div className="w-8 h-8 bg-cyan-500 rounded-full animate-pulse" />
                                                </button>
                                            </>
                                        ) : photoPreview ? (
                                            <div className="relative w-full h-full">
                                                <img src={photoPreview} alt="Captured" className="w-full h-full object-cover" />
                                                <button onClick={startCamera} className="absolute bottom-2 right-2 p-2 bg-white/90 rounded-full shadow-lg text-cyan-600"><RefreshCw className="w-4 h-4" /></button>
                                            </div>
                                        ) : (
                                            <button onClick={startCamera} className="bg-cyan-600 text-white px-4 py-2 rounded-xl text-xs font-black shadow-lg">Launch Camera</button>
                                        )}
                                    </div>
                                </div>

                                {/* ID Upload */}
                                <div className="space-y-3">
                                    <label className="block text-xs font-black text-slate-400 uppercase">Upload ID Document</label>
                                    <input type="file" accept="image/*,.pdf" onChange={handleIdUpload} className="hidden" id="id-upload-final" />
                                    <label htmlFor="id-upload-final" className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50 hover:bg-slate-100 hover:border-cyan-300 transition-all cursor-pointer overflow-hidden">
                                        {idCard ? (
                                            <div className="text-center p-4">
                                                <CheckCircle2 className="w-10 h-10 text-cyan-500 mx-auto mb-2" />
                                                <p className="text-[10px] font-black text-slate-900 truncate max-w-[120px]">{idCard.name}</p>
                                            </div>
                                        ) : (
                                            <>
                                                <Upload className="w-10 h-10 text-slate-200 mb-2" />
                                                <span className="text-[10px] font-black text-slate-400 px-4 text-center uppercase tracking-widest">NIN Slip / Drivers License</span>
                                            </>
                                        )}
                                    </label>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button onClick={() => setStep(3)} className="flex-1 py-4 text-slate-500 font-bold">Back</button>
                                <button 
                                    onClick={handleSubmit}
                                    disabled={loading || !photoPreview || !idCard}
                                    className="flex-[2] bg-cyan-600 text-white font-black py-4 rounded-2xl hover:bg-cyan-700 transition-all shadow-xl shadow-cyan-100 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Shield className="w-5 h-5" />}
                                    Finalize Application
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <canvas ref={canvasRef} className="hidden" />

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={modalType === 'success' ? 'Application Received' : 'Submission Error'}>
                <div className="text-center py-6 space-y-6">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto ${modalType === 'success' ? 'bg-green-100 text-green-600 shadow-[0_0_20px_rgba(22,163,74,0.2)]' : 'bg-red-100 text-red-600'}`}>
                        {modalType === 'success' ? <CheckCircle2 className="w-12 h-12" /> : <XCircle className="w-12 h-12" />}
                    </div>
                    <div className="space-y-2">
                        <p className="text-xl font-black text-slate-900 tracking-tight">{modalType === 'success' ? 'Submission Successful!' : 'Oops!'}</p>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed px-4">{modalMessage}</p>
                    </div>
                    <button onClick={handleCloseModal} className="w-full bg-slate-900 hover:bg-black text-white font-black py-4 rounded-2xl transition-all shadow-lg">{modalType === 'success' ? 'Return to Dashboard' : 'Try Again'}</button>
                </div>
            </Modal>
        </div>
    );
}
