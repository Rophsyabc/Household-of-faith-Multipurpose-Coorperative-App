import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { ShoppingBag, Tag, CheckCircle2, Search, Filter, MessageSquare, ShieldCheck } from 'lucide-react';
import { ListItemForm } from './list-item-form';
import { RealtimeMarketplace } from './realtime-marketplace';

export const dynamic = 'force-dynamic';

export default async function MarketplacePage() {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { get(name: string) { return cookieStore.get(name)?.value; } } }
    );

    const { data: { user } } = await supabase.auth.getUser();

    const { data: items } = await supabase
        .from('marketplace_items')
        .select('*, profiles(full_name, kyc_status)')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

    return (
        <div className="max-w-6xl mx-auto space-y-10 pb-24">
            <RealtimeMarketplace />
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-2">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        Member Marketplace
                        <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                            Zero Fees
                        </span>
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">Buy and sell assets within your trusted cooperative community.</p>
                </div>
                
                <ListItemForm />
            </div>

            {/* Filters Bar */}
            <div className="flex flex-wrap items-center gap-4 px-2">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                        placeholder="Search items..." 
                        className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-cyan-500 shadow-sm transition-all"
                    />
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-600 flex items-center gap-2 hover:bg-slate-50 transition-all">
                        <Filter className="w-4 h-4" /> All Categories
                    </button>
                </div>
            </div>

            {/* Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {(!items || items.length === 0) ? (
                    <div className="col-span-full py-32 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem]">
                        <ShoppingBag className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                        <h3 className="text-xl font-black text-slate-900">Market is empty</h3>
                        <p className="text-slate-400 font-medium mt-2">Be the first to list an item for the community.</p>
                    </div>
                ) : (
                    items.map((item: any) => (
                        <div key={item.id} className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl hover:border-cyan-100 transition-all group flex flex-col h-full">
                            <div className="aspect-square bg-slate-100 relative overflow-hidden">
                                {item.image_url ? (
                                    <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                        <ShoppingBag className="w-12 h-12" />
                                    </div>
                                )}
                                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-900 shadow-sm">
                                    {item.category}
                                </div>
                            </div>

                            <div className="p-6 space-y-4 flex-1 flex flex-col">
                                <div className="space-y-1">
                                    <div className="flex justify-between items-start gap-2">
                                        <h3 className="font-black text-slate-900 text-lg leading-tight group-hover:text-cyan-600 transition-colors">{item.title}</h3>
                                        <p className="text-lg font-black text-cyan-600 tracking-tight">₦{Number(item.price).toLocaleString()}</p>
                                    </div>
                                    <p className="text-sm text-slate-500 font-medium line-clamp-2 leading-relaxed">
                                        {item.description}
                                    </p>
                                </div>

                                <div className="pt-4 border-t border-slate-50 flex items-center justify-between mt-auto">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-slate-900 rounded-xl flex items-center justify-center text-white text-[10px] font-black shadow-lg">
                                            {item.profiles?.full_name?.[0]}
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-900 uppercase truncate max-w-[80px]">{item.profiles?.full_name}</p>
                                            {item.profiles?.kyc_status === 'verified' && (
                                                <div className="flex items-center gap-1 text-[8px] text-green-600 font-bold uppercase tracking-tighter">
                                                    <ShieldCheck className="w-2.5 h-2.5" /> Verified
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <button className="p-3 bg-slate-50 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-xl transition-all shadow-sm">
                                        <MessageSquare className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Marketplace Promo */}
            <div className="bg-gradient-to-br from-cyan-600 to-blue-700 rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl" />
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                    <div className="space-y-6 flex-1">
                        <div className="inline-flex p-4 bg-white/10 rounded-[2rem] border border-white/10 backdrop-blur-md">
                            <Tag className="w-8 h-8 text-cyan-200" />
                        </div>
                        <h2 className="text-4xl font-black tracking-tight leading-tight">Trust-Based Commerce</h2>
                        <p className="text-cyan-100 text-lg font-medium leading-relaxed">
                            Listing items is free for all members. Our marketplace connects you directly with 
                            verified members, ensuring secure and community-backed transactions.
                        </p>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <li className="flex items-center gap-2 text-sm font-bold"><CheckCircle2 className="w-5 h-5 text-cyan-300" /> No Listing Fees</li>
                            <li className="flex items-center gap-2 text-sm font-bold"><CheckCircle2 className="w-5 h-5 text-cyan-300" /> Member-Only Access</li>
                            <li className="flex items-center gap-2 text-sm font-bold"><CheckCircle2 className="w-5 h-5 text-cyan-300" /> Instant Transfers</li>
                            <li className="flex items-center gap-2 text-sm font-bold"><CheckCircle2 className="w-5 h-5 text-cyan-300" /> Verified Sellers</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
