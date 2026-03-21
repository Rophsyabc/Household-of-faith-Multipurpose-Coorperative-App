'use client';

import { useFormStatus } from 'react-dom';
import { Loader2 } from 'lucide-react';

interface SubmitButtonProps {
    formId?: string;       
    isLoading?: boolean;  
}

export function SubmitButton({ formId, isLoading = false }: SubmitButtonProps) {
    const { pending } = useFormStatus();
    
    const isBusy = pending || isLoading;

    return (
        <button
            type="submit"
            form={formId}
            disabled={isBusy}
            className="whitespace-nowrap bg-cyan-600 cursor-pointer hover:bg-cyan-700 text-white font-medium py-2.5 px-5 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed text-sm"
        >
            {isBusy ? (
                <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {isLoading ? 'Saving...' : 'Submitting...'}
                </>
            ) : (
                'Save Changes'
            )}
        </button>
    );
}