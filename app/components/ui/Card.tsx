'use client';

import { Card as CardType } from 'lucide-react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    variant?: 'default' | 'elevated';
}

export function Card({ children, className = '', variant = 'default' }: CardProps) {
    return (
        <div
            className={`
                bg-white border rounded-2xl p-4
                ${variant === 'elevated' ? 'shadow-lg border-slate-100' : 'border-slate-200'}
                ${className}
            `}
        >
            {children}
        </div>
    );
}

interface CardHeaderProps {
    children: React.ReactNode;
    className?: string;
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
    return <div className={`space-y-1 ${className}`}>{children}</div>;
}

interface CardTitleProps {
    children: React.ReactNode;
    className?: string;
}

export function CardTitle({ children, className = '' }: CardTitleProps) {
    return <h3 className={`text-base font-bold text-slate-900 ${className}`}>{children}</h3>;
}

interface CardDescriptionProps {
    children: React.ReactNode;
    className?: string;
}

export function CardDescription({ children, className = '' }: CardDescriptionProps) {
    return <p className={`text-xs text-slate-500 ${className}`}>{children}</p>;
}

interface CardContentProps {
    children: React.ReactNode;
    className?: string;
}

export function CardContent({ children, className = '' }: CardContentProps) {
    return <div className={`space-y-4 ${className}`}>{children}</div>;
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent };
