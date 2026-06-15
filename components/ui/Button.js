'use client';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const variants = {
  primary: 'bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] text-white shadow-[0_4px_15px_rgba(99,102,241,0.3)] border-none hover:shadow-[0_6px_20px_rgba(99,102,241,0.4)]',
  secondary: 'bg-white/70 backdrop-blur-[10px] text-[#4f46e5] border border-white/90 shadow-[0_2px_10px_rgba(0,0,0,0.08)] hover:bg-white/80 hover:shadow-[0_4px_15px_rgba(0,0,0,0.1)]',
  outline: 'bg-white/50 backdrop-blur-[10px] text-[#4f46e5] border border-white/80 shadow-[0_2px_10px_rgba(0,0,0,0.05)] hover:bg-white/60 hover:shadow-[0_4px_15px_rgba(0,0,0,0.08)]',
  ghost: 'hover:bg-white/40 text-[#4f46e5] backdrop-blur-[5px]',
  danger: 'bg-red-500/80 backdrop-blur-[10px] text-white hover:bg-red-600 shadow-lg shadow-red-500/20',
};

const sizes = {
  sm: 'px-6 py-2 text-sm',
  md: 'px-8 py-3 text-base',
  lg: 'px-10 py-4 text-lg font-bold',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-full transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-4 focus:ring-indigo-500/10 hover:-translate-y-[1px]',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
