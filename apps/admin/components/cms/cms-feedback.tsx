import React from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CmsFeedbackProps {
  message: string;
  type: 'success' | 'error';
  onClear: () => void;
}

export function CmsFeedback({ message, type, onClear }: CmsFeedbackProps) {
  if (!message) return null;

  return (
    <div
      className={cn(
        'fixed bottom-8 right-8 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border animate-in fade-in slide-in-from-bottom-4',
        type === 'success' 
          ? 'bg-green-50 border-green-200 text-green-800' 
          : 'bg-red-50 border-red-200 text-red-800'
      )}
    >
      {type === 'success' ? (
        <CheckCircle2 className="h-5 w-5 text-green-500" />
      ) : (
        <AlertCircle className="h-5 w-5 text-red-500" />
      )}
      <span className="text-sm font-medium">{message}</span>
      <button
        onClick={onClear}
        className="ml-2 p-1 rounded-full hover:bg-black/5 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
