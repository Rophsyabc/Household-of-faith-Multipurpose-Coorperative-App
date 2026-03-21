'use client';

import { useState } from 'react';
import { Plus, Loader2, Tag, ShoppingBag, XCircle, CheckCircle2 } from 'lucide-react';
import { Modal } from '@/app/components/Modal';
import { listItem } from './actions';
import { toast } from 'sonner';

export function ListItemForm() {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const res = await listItem(formData);
        
        setLoading(false);

        if (res?.error) {
            toast.error(res.error);
        } else {
            toast.success('Item listed successfully!');
            setIsOpen(false);
            (e.target as HTMLFormElement).reset();
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="bg-slate-900 text-white px-6 py-4 rounded-2xl text-sm font-black hover:bg-black transition shadow-xl active:scale-95 flex items-center justify-center gap-2"
            >
                <Plus className="w-4 h-4" /> List an Item
            </button>

            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="List New Item">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Item Title</label>
                            <input 
                                name="title" 
                                required 
                                placeholder="e.g. MacBook Pro 2021" 
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-cyan-500" 
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Price (₦)</label>
                                <input 
                                    name="price" 
                                    type="number" 
                                    required 
                                    placeholder="0.00" 
                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-cyan-500" 
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Category</label>
                                <select 
                                    name="category" 
                                    required 
                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none cursor-pointer"
                                >
                                    <option value="Electronics">Electronics</option>
                                    <option value="Real Estate">Real Estate</option>
                                    <option value="Vehicles">Vehicles</option>
                                    <option value="Furniture">Furniture</option>
                                    <option value="Services">Services</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Description</label>
                            <textarea 
                                name="description" 
                                required 
                                rows={4} 
                                placeholder="Condition, age, specifications..." 
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-cyan-500 resize-none" 
                            />
                        </div>
                    </div>

                    <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                        <p className="text-[10px] text-amber-700 font-bold leading-relaxed">
                            Marketplace items are visible to all cooperative members. Ensure descriptions are accurate. FaithCoop does not handle delivery.
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-slate-900 hover:bg-black text-white font-black rounded-2xl transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShoppingBag className="w-5 h-5" />}
                        Publish Listing
                    </button>
                </form>
            </Modal>
        </>
    );
}
