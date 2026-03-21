import { Calendar, Users, LogOut } from 'lucide-react';
import { leaveGroup } from '../actions'; 

interface HeaderSectionProps {
    title: string;
    memberCount: number;
    currentCycle: number;
    startDate: string;
    groupId: string;
}

export function HeaderSection({ title, memberCount, currentCycle, startDate, groupId }: HeaderSectionProps) {
    const isStarted = new Date(startDate) < new Date();

    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
                <div className="flex gap-4 text-sm text-slate-500 mt-1">
                    <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {memberCount} Members</span>
                    <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> Cycle {currentCycle}</span>
                </div>
            </div>

            {!isStarted && (
                <form action={leaveGroup.bind(null, groupId)}>
                    <button type="submit" className="text-red-600 text-sm font-medium hover:bg-red-50 px-3 py-2 rounded-lg flex items-center gap-2 transition-colors cursor-pointer">
                        <LogOut className="w-4 h-4" /> Leave Group
                    </button>
                </form>
            )}
        </div>
    );
}
