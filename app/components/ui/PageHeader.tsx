'use client';

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    className?: string;
    action?: React.ReactNode;
}

export function PageHeader({ title, subtitle, className = '', action }: PageHeaderProps) {
    return (
        <header className={`mb-6 ${className}`}>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{title}</h1>
            {subtitle && <p className="text-slate-500 mb-4 font-medium">{subtitle}</p>}
            {action && <div>{action}</div>}
        </header>
    );
}