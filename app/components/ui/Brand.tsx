'use client';

import Link from 'next/link';

interface BrandProps {
    className?: string;
    href?: string;
}

export function Brand({ className = '', href = '/' }: BrandProps) {
    return (
        <Link href={href} className={`flex items-center space-x-2 ${className}`}>
            <div className="flex items-center justify-center w-10 h-10 bg-cyan-600 rounded-xl">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
            </div>
            <div>
                <p className="font-bold text-slate-900">Household of Faith</p>
                <p className="text-slate-500 text-xs">Multipurpose Cooperative</p>
            </div>
        </Link>
    );
}