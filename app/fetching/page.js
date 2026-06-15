'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Brain, Sparkles, CheckCircle2, Loader2, Circle } from 'lucide-react';
import PageWrapper from '@/components/PageWrapper';
import Card from '@/components/ui/Card';

const STEPS = [
  { text: 'Reading your resume...', icon: CheckCircle2 },
  { text: 'Extracting key skills...', icon: CheckCircle2 },
  { text: 'Preparing interview role...', icon: Brain },
  { text: 'Finalizing...', icon: Sparkles },
];

export default function FetchingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (currentStep < STEPS.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 800);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        router.push('/role');
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [currentStep, router]);

  return (
    <PageWrapper className="flex items-center justify-center min-h-[85vh] px-4">
      <Card className="w-full max-w-sm sm:max-w-md p-6 sm:p-10 space-y-6 sm:space-y-10 relative overflow-hidden bg-white/70 backdrop-blur-xl border-white/80 shadow-2xl rounded-3xl sm:rounded-[2.5rem]">
        {/* Animated Rotating Arc Header */}
        <div className="text-center space-y-4 sm:space-y-6 pt-2">
          <div className="relative w-16 h-16 sm:w-24 sm:h-24 mx-auto block">
            {/* Spinning Arc SVG */}
            <svg className="absolute inset-0 w-full h-full animate-[spin_3s_linear_infinite]" viewBox="0 0 100 100">
              <circle
                cx="50" cy="50" r="45"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="4"
                strokeDasharray="70 200"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
            </svg>
            
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-6 h-6 sm:w-10 sm:h-10 text-indigo-500 animate-pulse" />
            </div>
          </div>

          <div className="space-y-1">
            <h2 className="text-xl sm:text-3xl font-black text-slate-800 tracking-tight">Analyzing Resume</h2>
            <p className="text-xs sm:text-sm text-slate-400 font-medium italic">Our AI is processing your background...</p>
          </div>
        </div>

        {/* Step List */}
        <div className="space-y-4 sm:space-y-6 px-1 sm:px-2">
          {STEPS.map((step, idx) => {
            const isDone = idx < currentStep;
            const isActive = idx === currentStep;
            
            return (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center gap-5"
              >
                <div className="relative flex-shrink-0">
                  {isDone ? (
                    <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center text-white shadow-lg shadow-green-200 transition-all scale-110">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  ) : isActive ? (
                    <div className="w-7 h-7 rounded-full bg-white border-2 border-indigo-500 flex items-center justify-center text-indigo-600 shadow-md">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-slate-50 border-2 border-slate-100 flex items-center justify-center text-slate-200">
                      <Circle className="w-3 h-3 fill-current" />
                    </div>
                  )}
                </div>
                
                <span className={`text-sm font-bold transition-colors ${isDone ? 'text-slate-800' : isActive ? 'text-indigo-600' : 'text-slate-300'}`}>
                  {step.text}
                </span>
              </motion.div>
            );
          })}
        </div>
      </Card>

      {/* Embedded Style for Spin is already in Tailwind with animate-spin, but our custom slow arc uses animate-[spin_3s_linear_infinite] */}
    </PageWrapper>
  );
}
