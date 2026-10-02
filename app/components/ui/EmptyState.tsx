'use client';

interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: React.ReactNode;
    className?: string;
}

export function EmptyState({ icon, title, description, action, className = '' }: EmptyStateProps) {
    return (
        <div className={`text-center py-10 ${className}`}>
            {icon && (
                <div className="flex justify-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        {icon}
                    </div>
                </div>
            )}
            <h3 className="text-sm font-semibold text-slate-900 mb-2">{title}</h3>
            {description && <p className="text-xs text-slate-500 mb-4 max-w-xs mx-auto">{description}</p>}
            {action && <div>{action}</div>}
        </div>
    );
}
