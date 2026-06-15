'use client';
import { X } from 'lucide-react';
import { cn } from './Button';

export default function Chip({ label, onRemove, className = '' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-sm font-medium transition-all group hover:border-slate-300',
        className
      )}
    >
      {label}
      {onRemove && (
        <button
          onClick={onRemove}
          className="hover:bg-slate-200 rounded-md p-0.5 transition-colors"
        >
          <X className="w-3 h-3 text-slate-400 group-hover:text-slate-600" />
        </button>
      )}
    </span>
  );
}
