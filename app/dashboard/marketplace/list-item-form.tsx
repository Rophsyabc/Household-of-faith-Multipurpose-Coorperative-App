'use server';

'use client';

import { useState } from 'react';
import { Plus, Loader2, Tag, ShoppingBag, XCircle, CheckCircle2, ImagePlus } from 'lucide-react';
import { Modal } from '@/app/components/Modal';
import { listItem } from './actions';
import { toast } from 'sonner';

export function ListItemForm() {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);

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
        const res = await listItem(formData);
        
        setLoading(false);

        if (res?.error) {
            toast.error(res.error);
        } else {
            toast.success('Item listed successfully!');
            setIsOpen(false);
            setPreview(null);
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
                        {/* Image Upload */}
                        <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-3xl p-6 hover:border-cyan-500 transition-colors bg-slate-50 relative overflow-hidden group">
                            {preview ? (
                                <img src={preview} alt="Preview" className="w-full h-40 object-cover rounded-2xl" />
                            ) : (
                                <div className="text-center">
                                    <ImagePlus className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Add Product Image</p>
                                </div>
                            )}
                            <input 
                                type="file" 
                                name="image" 
                                accept="image/*" 
                                onChange={handleImageChange}
                                className="absolute inset-0 opacity-0 cursor-pointer" 
                            />
                        </div>

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
                                rows={3} 
                                placeholder="Condition, age, specifications..." 
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-cyan-500 resize-none" 
                            />
                        </div>
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
