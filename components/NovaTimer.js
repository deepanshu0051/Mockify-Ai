'use client';
import { useState, useEffect } from 'react';

export default function NovaTimer({ duration, onComplete, isActive }) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    setTimeLeft(duration);
  }, [duration]);

  useEffect(() => {
    if (!isActive) return;
    
    if (timeLeft <= 0) {
      if (onComplete) onComplete();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isActive, onComplete]);

  const percentage = (timeLeft / duration) * 100;
  
  let colorClass = 'text-green-500';
  let pathColorClass = 'stroke-green-500';
  if (percentage <= 25) {
    colorClass = 'text-red-500';
    pathColorClass = 'stroke-red-500';
  } else if (percentage <= 50) {
    colorClass = 'text-amber-500';
    pathColorClass = 'stroke-amber-500';
  }

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center bg-white/50 backdrop-blur-sm rounded-full shadow-lg border border-white">
      <svg className="w-full h-full transform -rotate-90 p-2" viewBox="0 0 100 100">
        <circle
          className="stroke-slate-200"
          strokeWidth="6"
          fill="transparent"
          r={radius}
          cx="50"
          cy="50"
        />
        <circle
          className={`transition-all duration-1000 ease-linear ${pathColorClass}`}
          strokeWidth="6"
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx="50"
          cy="50"
          style={{ strokeDasharray: circumference, strokeDashoffset }}
        />
      </svg>
      <div className={`absolute font-black text-2xl sm:text-3xl tracking-tighter ${colorClass}`}>
        {timeLeft}
      </div>
    </div>
  );
}
