'use client';
import { cn } from './Button';

export default function Card({ className = '', children, ...props }) {
  return (
    <div
      className={cn(
        'bg-white/65 backdrop-blur-[16px] rounded-[20px] border border-white/85 shadow-[0_4px_24px_rgba(0,0,0,0.07)] transition-all duration-300 hover:shadow-[0_8px_32px_rgba(0,0,0,0.1)]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
