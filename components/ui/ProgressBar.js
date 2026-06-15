'use client';
import { cn } from './Button';

export default function ProgressBar({ progress, className = '' }) {
  return (
    <div className={cn('w-full h-1.5 bg-slate-100 rounded-full overflow-hidden', className)}>
      <div
        className="h-full bg-primary transition-all duration-700 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
