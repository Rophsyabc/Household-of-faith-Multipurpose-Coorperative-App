'use client';

import { useState } from 'react';
import { updateTicketStatus, replyToTicket } from './actions';
import { MessageSquare, Clock, CheckCircle2, AlertCircle, Send, User, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';

interface SupportTicket {
    id: string;
    user_id: string;
    subject: string;
    message: string;
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    priority: 'low' | 'normal' | 'high' | 'urgent';
    admin_reply: string | null;
    created_at: string;
    profiles: {
        full_name: string;
        email: string;
    };
}

export function SupportList({ tickets }: { tickets: any[] | null }) {
    const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
    const [expanded, setExpanded] = useState<string | null>(null);
    const [loading, setLoading] = useState<string | null>(null);

    async function handleReply(ticketId: string) {
        const text = replyText[ticketId];
        if (!text?.trim()) return toast.error("Please enter a reply");

        setLoading(ticketId);
        const res = await replyToTicket(ticketId, text);
        setLoading(null);

        if (res?.error) {
            toast.error(res.error);
        } else {
            toast.success("Reply sent successfully");
            setReplyText({ ...replyText, [ticketId]: '' });
        }
    }

    async function handleStatusChange(ticketId: string, status: string) {
        const res = await updateTicketStatus(ticketId, status);
        if (res?.error) toast.error(res.error);
        else toast.success(`Status updated to ${status}`);
    }

    const openTickets = (tickets || []).filter(t => t.status !== 'closed');

    return (
        <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden mt-8">
            <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-100 rounded-2xl text-indigo-600 shadow-sm">
                        <MessageSquare className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-black text-slate-900 text-lg">Member Support Desk</h3>
                        <p className="text-xs text-slate-500 font-medium">Respond to inquiries and technical issues.</p>
                    </div>
                </div>
                <span className="bg-indigo-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-indigo-100">
                    {openTickets.length} Active
                </span>
            </div>

            {openTickets.length === 0 ? (
                <div className="p-20 text-center text-slate-400 flex flex-col items-center">
                    <CheckCircle2 className="w-16 h-16 mb-4 opacity-10" />
                    <p className="font-black uppercase tracking-[0.2em] text-[10px]">Helpdesk Clear</p>
                    <p className="text-sm font-medium mt-1">No active support tickets at this time.</p>
                </div>
            ) : (
                <div className="divide-y divide-slate-50">
                    {openTickets.map((ticket: SupportTicket) => (
                        <div key={ticket.id} className="transition-all hover:bg-slate-50/30">
                            <div 
                                className="p-6 cursor-pointer flex items-start justify-between gap-4"
                                onClick={() => setExpanded(expanded === ticket.id ? null : ticket.id)}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black shadow-inner shrink-0">
                                        {ticket.profiles?.full_name?.[0]}
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[8px] font-black px-2 py-0.5 rounded-lg uppercase border ${
                                                ticket.priority === 'urgent' ? 'bg-red-100 text-red-600 border-red-200' :
                                                ticket.priority === 'high' ? 'bg-orange-100 text-orange-600 border-orange-200' :
                                                'bg-slate-100 text-slate-500 border-slate-200'
                                            }`}>
                                                {ticket.priority}
                                            </span>
                                            <h4 className="font-black text-slate-900 tracking-tight">{ticket.subject}</h4>
                                        </div>
                                        <p className="text-xs text-slate-500 font-medium">From: {ticket.profiles?.full_name} • {ticket.profiles?.email}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                                            <Clock className="w-3 h-3" />
                                            {new Date(ticket.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                                        ticket.status === 'open' ? 'bg-cyan-100 text-cyan-700 border-cyan-200' :
                                        ticket.status === 'in_progress' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                                        'bg-green-100 text-green-700 border-green-200'
                                    }`}>
                                        {ticket.status.replace('_', ' ')}
                                    </div>
                                    {expanded === ticket.id ? <ChevronUp className="w-5 h-5 text-slate-300" /> : <ChevronDown className="w-5 h-5 text-slate-300" />}
                                </div>
                            </div>

                            {expanded === ticket.id && (
                                <div className="px-6 pb-8 pt-2 space-y-6 animate-in slide-in-from-top-2 duration-300">
                                    <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                                        <p className="text-sm text-slate-700 leading-relaxed font-medium italic">
                                            "{ticket.message}"
                                        </p>
                                    </div>

                                    {ticket.admin_reply && (
                                        <div className="flex items-start gap-4 pl-8">
                                            <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center text-white shrink-0 shadow-lg">
                                                <ShieldCheck className="w-4 h-4" />
                                            </div>
                                            <div className="bg-cyan-50 p-4 rounded-2xl border border-cyan-100 flex-1">
                                                <p className="text-[10px] font-black text-cyan-600 uppercase tracking-widest mb-1">Previous Response</p>
                                                <p className="text-sm text-slate-800 font-medium">{ticket.admin_reply}</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between px-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Post Response</label>
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => handleStatusChange(ticket.id, 'in_progress')}
                                                    className="text-[8px] font-black uppercase text-amber-600 hover:underline"
                                                >
                                                    Mark In Progress
                                                </button>
                                                <button 
                                                    onClick={() => handleStatusChange(ticket.id, 'resolved')}
                                                    className="text-[8px] font-black uppercase text-green-600 hover:underline"
                                                >
                                                    Mark Resolved
                                                </button>
                                            </div>
                                        </div>
                                        <div className="relative">
                                            <textarea 
                                                value={replyText[ticket.id] || ''}
                                                onChange={(e) => setReplyText({ ...replyText, [ticket.id]: e.target.value })}
                                                placeholder="Write your response to the member..."
                                                className="w-full p-5 bg-white border border-slate-200 rounded-[2rem] text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner resize-none h-32"
                                            />
                                            <button 
                                                onClick={() => handleReply(ticket.id)}
                                                disabled={loading === ticket.id}
                                                className="absolute bottom-4 right-4 bg-slate-900 hover:bg-black text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-xl disabled:opacity-50"
                                            >
                                                {loading === ticket.id ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-3 h-3" />}
                                                Send Reply
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
