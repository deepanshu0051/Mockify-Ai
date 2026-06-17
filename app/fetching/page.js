'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Sparkles, CheckCircle2, Loader2, Circle, AlertTriangle, ArrowLeft } from 'lucide-react';
import PageWrapper from '@/components/PageWrapper';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useGlobalFile } from '@/lib/FileContext';
import { setItem } from '@/lib/storage';

const STEPS = [
  { text: 'Reading PDF', icon: CheckCircle2 },
  { text: 'Extracting Text', icon: CheckCircle2 },
  { text: 'AI Resume Analysis', icon: Brain },
  { text: 'Uploading Resume', icon: Sparkles },
  { text: 'Saving Candidate Data', icon: CheckCircle2 },
  { text: 'Preparing Interview', icon: Sparkles },
];

export default function FetchingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [errorState, setErrorState] = useState(null);
  const router = useRouter();
  const { globalFile } = useGlobalFile();
  const processingRef = useRef(false);
  const abortControllerRef = useRef(null);
  const progressIntervalRef = useRef(null);

  useEffect(() => {
    if (!globalFile) {
      router.push('/upload');
      return;
    }

    if (processingRef.current) return;
    processingRef.current = true;

    // Start a simulated progress up to Step 3 (Validating Resume)
    let simStep = 0;
    progressIntervalRef.current = setInterval(() => {
      simStep += 1;
      if (simStep <= 2) {
        setCurrentStep(simStep);
      } else {
        clearInterval(progressIntervalRef.current);
      }
    }, 1200);

    const processResume = async () => {
      abortControllerRef.current = new AbortController();
      try {
        const formData = new FormData();
        formData.append('file', globalFile);

        const res = await fetch('/api/resumes/process', {
          method: 'POST',
          body: formData,
          signal: abortControllerRef.current.signal,
        });

        const data = await res.json();
        clearInterval(progressIntervalRef.current);

        if (!data.ok) {
          setErrorState(data);
          return;
        }

        // Successfully processed. Store in localStorage
        setItem('mockify_resume', {
          resumeId: data.resumeId,
          fileUrl: data.fileUrl,
          name: data.fileName,
          uploadedAt: new Date().toISOString(),
        });
        
        if (data.extracted) {
          if (data.extracted.name) setItem('mockify_candidate_name', data.extracted.name);
          if (data.extracted.skills && data.extracted.skills.length > 0) {
            setItem('mockify_candidate_skills', data.extracted.skills);
          }
          if (data.extracted.suggestedRole) setItem('mockify_suggested_role', data.extracted.suggestedRole);
        }

        // Fast-forward processing display
        setCurrentStep(3);
        setTimeout(() => setCurrentStep(4), 400);
        setTimeout(() => setCurrentStep(5), 800);
        setTimeout(() => setCurrentStep(6), 1400);
        
        setTimeout(() => {
          router.push('/role');
        }, 1800);

      } catch (err) {
        if (err.name === 'AbortError') {
          console.log('Fetch aborted by user');
          return; // Expected abort, silently exit
        }
        console.error(err);
        clearInterval(progressIntervalRef.current);
        setErrorState({ reason: 'network_error' });
      }
    };

    const handleBackArrow = (e) => {
      e.preventDefault();
      handleCancel();
    };
    window.addEventListener('back-arrow-click', handleBackArrow);

    processResume();

    return () => {
      window.removeEventListener('back-arrow-click', handleBackArrow);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [globalFile, router]);

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    router.push('/upload');
  };

  // Render Error/Invalid Flows
  if (errorState) {
    let title = "Processing Failed";
    let message = "Something went wrong. Please try again.";
    let showRetry = true;

    if (errorState.reason === 'INVALID_RESUME') {
      title = "Invalid Resume";
      message = "This file doesn’t look like a resume. Please upload a valid resume PDF and try again.";
      showRetry = false;
    } else if (errorState.reason === 'NO_TEXT_EXTRACTED') {
      title = "Invalid Resume";
      message = "We couldn’t read text from this PDF. Please upload a text-based resume PDF (not scanned images).";
      showRetry = false;
    } else if (errorState.reason === 'AI_OUTPUT_PARSE_FAILED' || errorState.reason === 'AI_API_DOWN') {
      title = "Try Again";
      message = "We had trouble verifying this file. Please try again in a moment.";
      showRetry = true;
    } else {
      title = "Processing Failed";
      message = "Something went wrong. Please try again.";
      showRetry = true;
    }
    
    return (
      <PageWrapper className="min-h-screen w-full flex items-center justify-center px-4 py-8 relative">
        <Card className="w-full max-w-sm sm:max-w-md p-6 sm:p-10 space-y-6 sm:space-y-8 relative overflow-hidden bg-white/90 backdrop-blur-xl border-red-100 shadow-2xl rounded-3xl sm:rounded-[2.5rem]">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
              <AlertTriangle className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
              {title}
            </h2>
            <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
              {message}
            </p>
          </div>
          
          <div className="flex flex-col gap-3">
            {showRetry && (
              <Button 
                variant="outline"
                className="w-full h-12 lg:h-14 rounded-2xl text-sm lg:text-base gap-2" 
                onClick={() => window.location.reload()}
              >
                Retry Processing
              </Button>
            )}
            <Button 
              className="w-full h-12 lg:h-14 rounded-2xl text-sm lg:text-base gap-2 bg-slate-800 hover:bg-slate-900 text-white" 
              onClick={() => router.push('/upload')}
            >
              <ArrowLeft className="w-4 h-4" /> Upload New Resume
            </Button>
          </div>
        </Card>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper className="min-h-screen w-full flex items-center justify-center px-4 py-8 relative">

      <Card className="w-full max-w-sm sm:max-w-md p-6 sm:p-10 space-y-6 sm:space-y-8 relative overflow-hidden bg-white/70 backdrop-blur-xl border-white/80 shadow-2xl rounded-3xl sm:rounded-[2.5rem]">
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
        
        {/* Stop Analyzing Action */}
        <div className="pt-2 sm:pt-4">
          <Button 
            variant="secondary" 
            onClick={handleCancel}
            className="w-full h-12 lg:h-14 rounded-2xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-colors bg-white/80 font-bold shadow-sm"
          >
            Stop Analyzing
          </Button>
        </div>
      </Card>

      {/* Embedded Style for Spin is already in Tailwind with animate-spin, but our custom slow arc uses animate-[spin_3s_linear_infinite] */}
    </PageWrapper>
  );
}
