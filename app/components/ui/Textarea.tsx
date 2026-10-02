'use client';

import { forwardRef } from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ label, error, className = '', disabled, ...props }, ref) => {
        return (
            <div className={`w-full ${className}`}>
                {label && (
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        {label}
                    </label>
                )}
                <textarea
                    ref={ref}
                    disabled={disabled}
                    className={`
                        w-full bg-slate-50 border-2 rounded-2xl px-3.5 py-2.5
                        placeholder:text-slate-400 font-medium
                        transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-600
                        disabled:opacity-50 disabled:cursor-not-allowed
                        resize-none
                        ${error ? 'border-red-300 focus:border-red-600 focus:ring-red-500/20' : 'border-slate-200'}
                    `}
                    {...props}
                />
                {error && <p className="mt-1 text-xs text-red-600 font-bold">{error}</p>}
            </div>
        );
    }
);

Textarea.displayName = 'Textarea';

export { Textarea };