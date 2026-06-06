import React from 'react';
import { cn } from '@/lib/utils';

interface StatusToggleProps {
  isActive: boolean;
  onToggle: (active: boolean) => void;
  disabled?: boolean;
}

export function StatusToggle({ isActive, onToggle, disabled }: StatusToggleProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onToggle(!isActive)}
      className={cn(
        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50',
        isActive ? 'bg-green-500' : 'bg-slate-300'
      )}
    >
      <span
        className={cn(
          'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
          isActive ? 'translate-x-6' : 'translate-x-1'
        )}
      />
    </button>
  );
}
