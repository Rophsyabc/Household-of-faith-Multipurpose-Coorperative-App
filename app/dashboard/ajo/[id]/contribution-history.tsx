import { History, CheckCircle2 } from 'lucide-react';

interface LedgerRecord {
    id: string;
    cycle_number: number;
    created_at: string;
    amount: number;
}

export function ContributionHistory({ history }: { history: LedgerRecord[] | null }) {
    return (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-100 font-semibold text-slate-700 flex items-center gap-2">
                <History className="w-4 h-4" /> My Contributions
            </div>
            {(!history || history.length === 0) ? (
                <div className="p-6 text-center text-sm text-slate-400">No contributions yet</div>
            ) : (
                <div className="divide-y divide-slate-100">
                    {history.map((record) => (
                        <div key={record.id} className="p-4 flex justify-between items-center">
                            <div>
                                <p className="text-sm font-bold text-slate-900">Cycle {record.cycle_number}</p>
                                <p className="text-xs text-slate-500">{new Date(record.created_at).toLocaleDateString()}</p>
                            </div>
                            <span className="flex items-center gap-1 text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-full">
                                <CheckCircle2 className="w-3 h-3" /> Paid ₦{record.amount.toLocaleString()}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}