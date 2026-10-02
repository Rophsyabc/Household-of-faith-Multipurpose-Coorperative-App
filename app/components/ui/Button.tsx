'use client';

import { forwardRef } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    children: React.ReactNode;
    className?: string;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ variant = 'primary', size = 'md', isLoading, children, className = '', disabled, ...props }, ref) => {
        const variants = {
            primary: 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-200',
            secondary: 'bg-cyan-600 text-white hover:bg-cyan-700 shadow-lg shadow-cyan-200',
            outline: 'bg-white text-slate-900 border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50',
            ghost: 'bg-transparent text-slate-600 hover:bg-slate-100',
            danger: 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-200',
            success: 'bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-200',
        };

        const sizes = {
            sm: 'px-3 py-1.5 text-xs',
            md: 'px-5 py-2.5 text-sm',
            lg: 'px-6 py-3.5 text-base',
        };

        return (
            <button
                ref={ref}
                disabled={disabled || isLoading}
                className={`
                    rounded-2xl font-bold transition-all active:scale-95
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${variants[variant]}
                    ${sizes[size]}
                    ${className}
                `}
                {...props}
            >
                {isLoading && (
                    <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                )}
                {children}
            </button>
        );
    }
);

Button.displayName = 'Button';

export { Button };
