'use client';
import { cn } from './Button';

const variants = {
  easy: 'bg-green-50 text-green-700 border-green-100',
  medium: 'bg-amber-50 text-amber-700 border-amber-100',
  hard: 'bg-red-50 text-red-700 border-red-100',
  mix: 'bg-purple-50 text-purple-700 border-purple-100',
  default: 'bg-slate-100 text-slate-700 border-slate-200',
};

export default function Badge({ variant = 'default', className = '', children }) {
  const v = variants[variant.toLowerCase()] || variants.default;
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border transition-colors',
        v,
        className
      )}
    >
      {children}
    </span>
  );
}
