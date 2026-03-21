import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { MessageSquare, LifeBuoy, Send, Clock, CheckCircle2, AlertCircle, ShieldQuestion } from 'lucide-react';
import { createTicket } from './actions';
import { RealtimeSupport } from './realtime-support';

export default async function SupportPage() {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { get(name: string) { return cookieStore.get(name)?.value; } } }
    );

    const { data: { user } } = await supabase.auth.getUser();

    const { data: tickets } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

    return (
        <div className="max-w-4xl mx-auto space-y-10 pb-24">
            <RealtimeSupport userId={user?.id || ''} />
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Support Center</h1>
                    <p className="text-slate-500 font-medium">We're here to help you build your financial future.</p>
                </div>
                <div className="bg-cyan-600 text-white px-4 py-2 rounded-2xl flex items-center gap-2 shadow-lg shadow-cyan-200">
                    <LifeBuoy className="w-5 h-5 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest">24/7 Response</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 1. Ticket Form */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm sticky top-8">
                        <h2 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                            <Send className="w-5 h-5 text-cyan-600" />
                            New Request
                        </h2>
                        <form action={createTicket} className="space-y-5">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Subject</label>
                                <input name="subject" required placeholder="e.g. Withdrawal Delay" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-cyan-500" />
                            </div>
                            
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Priority</label>
                                <select name="priority" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none appearance-none cursor-pointer">
                                    <option value="low">Low - General Inquiry</option>
                                    <option value="normal">Normal - Account Issue</option>
                                    <option value="high">High - Transaction Error</option>
                                    <option value="urgent">Urgent - Security Concern</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Message</label>
                                <textarea name="message" required rows={4} placeholder="Describe your issue in detail..." className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-cyan-500 resize-none" />
                            </div>

                            <button type="submit" className="w-full bg-slate-900 hover:bg-black text-white font-black py-4 rounded-2xl transition-all shadow-xl active:scale-95">
                                Send Ticket
                            </button>
                        </form>
                    </div>
                </div>

                {/* 2. Ticket List */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Your Recent Tickets</h2>
                    
                    {(!tickets || tickets.length === 0) ? (
                        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] p-20 text-center flex flex-col items-center">
                            <ShieldQuestion className="w-12 h-12 text-slate-200 mb-4" />
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No active tickets</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {tickets.map((ticket) => (
                                <div key={ticket.id} className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm hover:border-cyan-100 transition-all">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-xl ${
                                                ticket.status === 'open' ? 'bg-cyan-50 text-cyan-600' :
                                                ticket.status === 'resolved' ? 'bg-green-50 text-green-600' :
                                                'bg-slate-50 text-slate-400'
                                            }`}>
                                                <MessageSquare className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h3 className="font-black text-slate-900">{ticket.subject}</h3>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">ID: {ticket.id.slice(0,8)} • {new Date(ticket.created_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase ${
                                            ticket.priority === 'urgent' ? 'bg-red-100 text-red-600' :
                                            ticket.priority === 'high' ? 'bg-orange-100 text-orange-600' :
                                            'bg-slate-100 text-slate-500'
                                        }`}>
                                            {ticket.priority}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-600 font-medium line-clamp-2 bg-slate-50 p-4 rounded-2xl border border-slate-100 italic">
                                        "{ticket.message}"
                                    </p>
                                    
                                    {ticket.admin_reply && (
                                        <div className="mt-4 pt-4 border-t border-slate-100">
                                            <div className="flex items-start gap-2">
                                                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Coop Response</p>
                                                    <p className="text-sm text-slate-900 font-bold">{ticket.admin_reply}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-6 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${
                                                ticket.status === 'open' ? 'bg-cyan-500 animate-pulse' :
                                                ticket.status === 'resolved' ? 'bg-green-500' : 'bg-slate-300'
                                            }`} />
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{ticket.status}</span>
                                        </div>
                                        <button className="text-[10px] font-black text-cyan-600 uppercase tracking-widest hover:underline cursor-pointer">View Details</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
