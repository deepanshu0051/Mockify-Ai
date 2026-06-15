'use client';
import { cn } from './Button';
import { Check } from 'lucide-react';

export default function Stepper({ steps, currentStep, className = '' }) {
  return (
    <div className={cn('flex items-center justify-between w-full max-w-2xl mx-auto', className)}>
      {steps.map((step, index) => {
        const isCompleted = index < currentStep - 1;
        const isActive = index === currentStep - 1;

        return (
          <div key={index} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center relative group">
              <div
                className={cn(
                  'w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300',
                  isCompleted ? 'bg-primary border-primary text-white' : 
                  isActive ? 'border-primary text-primary bg-white ring-4 ring-primary/10' : 
                  'border-slate-200 text-slate-400 bg-white'
                )}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : <span>{index + 1}</span>}
              </div>
              <span className={cn(
                'absolute -bottom-7 text-xs font-medium whitespace-nowrap transition-colors duration-300',
                isActive ? 'text-primary' : 'text-slate-400'
              )}>
                {step}
              </span>
            </div>
            
            {index < steps.length - 1 && (
              <div className="flex-1 h-[2px] mx-4 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-500" 
                  style={{ width: isCompleted ? '100%' : '0%' }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
