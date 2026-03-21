export interface Member {
    user_id: string;
    position: number;
    profiles: { full_name: string }[] | { full_name: string } | null;
}

// Utility to safely extract name
export function getMemberName(member: Member | undefined) {
    if (!member || !member.profiles) return 'Unknown Member';
    if (Array.isArray(member.profiles)) {
        return member.profiles[0]?.full_name || 'Unknown';
    }
    return member.profiles.full_name || 'Unknown';
}

interface RotationTableProps {
    members: Member[];
    activePosition: number;
}

export function RotationTable({ members, activePosition }: RotationTableProps) {
    return (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-100 font-semibold text-slate-700">
                Payout Rotation (FIFO)
            </div>
            <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500">
                    <tr>
                        <th className="p-3">Pos</th>
                        <th className="p-3">Member</th>
                        <th className="p-3 text-right">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {members.map((m) => (
                        <tr key={m.user_id} className={m.position === activePosition ? 'bg-cyan-50' : ''}>
                            <td className="p-3 font-medium text-slate-500">#{m.position}</td>
                            <td className="p-3 font-medium text-slate-900">{getMemberName(m)}</td>
                            <td className="p-3 text-right">
                                {m.position === activePosition ? (
                                    <span className="text-cyan-600 text-xs font-bold px-2 py-1 bg-cyan-100 rounded-full">Collecting Now</span>
                                ) : (
                                    <span className="text-slate-400 text-xs">Contributor</span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}