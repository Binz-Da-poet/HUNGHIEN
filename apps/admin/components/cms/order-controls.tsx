import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface OrderControlsProps {
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
  disabled?: boolean;
}

export function OrderControls({ onMoveUp, onMoveDown, isFirst, isLast, disabled }: OrderControlsProps) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        disabled={disabled || isFirst}
        onClick={onMoveUp}
        className="p-1 text-slate-400 hover:text-slate-900 disabled:opacity-30 disabled:hover:text-slate-400"
        title="Di chuyển lên"
      >
        <ChevronUp className="h-5 w-5" />
      </button>
      <button
        type="button"
        disabled={disabled || isLast}
        onClick={onMoveDown}
        className="p-1 text-slate-400 hover:text-slate-900 disabled:opacity-30 disabled:hover:text-slate-400"
        title="Di chuyển xuống"
      >
        <ChevronDown className="h-5 w-5" />
      </button>
    </div>
  );
}
