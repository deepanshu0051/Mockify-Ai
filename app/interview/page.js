'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Send, AlertCircle, Save, ArrowLeft } from 'lucide-react';
import PageWrapper from '@/components/PageWrapper';
import NovaVoiceExperience from '@/components/NovaVoiceExperience';
import Button from '@/components/ui/Button';
// Card import removed - unused in text interview flow
import Stepper from '@/components/ui/Stepper';
import QuestionCard from '@/components/QuestionCard';
import VoiceInput from '@/components/VoiceInput';
import ProgressBar from '@/components/ui/ProgressBar';
import { setItem, getItem } from '@/lib/storage';
import { escapeHtml } from '@/lib/security';

export default function InterviewPage() {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState(Array(10).fill(''));
  const [mode, setMode] = useState('text');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastQuestionSkipped, setLastQuestionSkipped] = useState(false);
  
  const router = useRouter();

  useEffect(() => {
    const q = getItem('mockify_questions');
    const m = getItem('mockify_mode', 'text');
    const a = getItem('mockify_answers', Array(10).fill(''));
    
    if (!q || q.length === 0) {
      router.push('/mode');
      return;
    }
    
    setQuestions(q);
    setMode(m);
    setAnswers(a);
    setIsLoading(false);
  }, [router]);

  const saveState = useCallback((newAnswers) => {
    // Sanitize before saving to local storage
    const sanitizedAnswers = newAnswers.map(ans => escapeHtml(ans));
    setItem('mockify_answers', sanitizedAnswers);
  }, []);

  const handleAnswer = (val) => {
    const newAnswers = [...answers];
    newAnswers[currentIndex] = val;
    setAnswers(newAnswers);
    saveState(newAnswers);
  };

  const handleNext = () => {
    const currentAnswer = answers[currentIndex] || '';
    const wordCount = currentAnswer.trim().split(/\s+/).filter(Boolean).length;

    if (wordCount < 5 && currentAnswer !== '[SKIPPED]') {
      return; // Gate keep
    }

    if (currentIndex < 9) {
      setCurrentIndex(prev => prev + 1);
    } else {
      if (isSubmitting) return;
      setIsSubmitting(true);
      const currentIds = questions.map(q => q.id);
      setItem('mockify_last_ids', currentIds);
      router.push('/result');
    }
  };

  const handleSkip = () => {
    const newAnswers = [...answers];
    newAnswers[currentIndex] = '[SKIPPED]';
    setAnswers(newAnswers);
    saveState(newAnswers);

    if (currentIndex < 9) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // On the last question, just mark it skipped and stay
      setLastQuestionSkipped(true);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  // ── All hooks MUST be called before any early return (Rules of Hooks) ──
  const canGoNext = useMemo(() => {
    const currentAnswer = answers[currentIndex] || '';
    const wordCount = currentAnswer.trim().split(/\s+/).filter(Boolean).length;
    return wordCount >= 5 || currentAnswer === '[SKIPPED]';
  }, [answers, currentIndex]);

  const wordCount = useMemo(() => {
    const currentAnswer = answers[currentIndex] || '';
    return currentAnswer.trim().split(/\s+/).filter(Boolean).length;
  }, [answers, currentIndex]);

  if (isLoading) return null;

  if (mode === 'voice') {
    return <NovaVoiceExperience questions={questions} />;
  }

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / 10) * 100;
  const isLast = currentIndex === 9;
  

  return (
    <PageWrapper className="max-w-4xl mx-auto px-4 py-12 w-full h-full flex flex-col relative">
      <div className="fixed top-6 left-6 z-50 pointer-events-auto">
        <button
          onClick={() => router.push('/mode')}
          className="flex items-center justify-center w-12 h-12 rounded-full bg-white/90 backdrop-blur-xl border border-white shadow-xl transition-all hover:bg-white active:scale-95 group p-0 min-h-[44px] min-w-[44px]"
          aria-label="Go back"
        >
          <ArrowLeft 
            className="h-5 w-5 text-slate-800 shrink-0 transition-colors group-hover:text-black" 
            strokeWidth={2} 
          />
        </button>
      </div>
      {/* Header Info */}
      <div className="space-y-8 mb-12 sm:mt-6 mt-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Current Session</span>
            <h2 className="text-xl font-bold text-slate-800">Mock Interview</h2>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Efficiency</span>
            <div className="flex items-center gap-2">
              <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 w-3/4" />
              </div>
              <span className="text-xs font-bold text-green-600 text-right">Optimal</span>
            </div>
          </div>
        </div>

        <Stepper 
          steps={['1','2','3','4','5','6','7','8','9','10']} 
          currentStep={currentIndex + 1} 
        />
        
        <div className="pt-4 flex items-center justify-between text-sm">
          <span className="text-slate-400 font-medium">Progress</span>
          <span className="text-primary font-bold">{currentIndex + 1} / 10 Questions</span>
        </div>
        <ProgressBar progress={progress} className="h-1" />
      </div>

      {/* Main Interview Area */}
      <div className="flex-1 space-y-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <QuestionCard question={currentQuestion} />
          </motion.div>
        </AnimatePresence>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Your Answer</h4>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
              <Save className="w-3 h-3" /> Auto-saving...
            </div>
          </div>

          {mode === 'text' ? (
            <div className="relative group">
              <textarea
                value={answers[currentIndex] === '[SKIPPED]' ? '' : answers[currentIndex]}
                onChange={(e) => handleAnswer(e.target.value)}
                placeholder="Type your comprehensive answer here..."
                className="w-full min-h-[150px] sm:min-h-[200px] h-48 sm:h-64 p-4 sm:p-8 bg-white rounded-2xl sm:rounded-[2.5rem] border border-slate-200 focus:border-primary focus:ring-4 sm:focus:ring-8 focus:ring-primary/5 outline-none transition-all text-sm sm:text-lg text-slate-700 leading-relaxed resize-y shadow-sm group-hover:border-slate-300"
              />
              <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-8">
                <p className={`text-[10px] sm:text-xs font-bold transition-colors ${wordCount >= 5 ? 'text-green-500' : 'text-slate-400'}`}>
                  {wordCount} / 5 words minimum
                </p>
              </div>
              <div className="absolute bottom-4 sm:bottom-6 right-4 sm:right-6">
                <div className={`px-2 sm:px-4 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold border transition-colors ${answers[currentIndex].length > 100 ? 'bg-green-50 text-green-600 border-green-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                  {answers[currentIndex].length} characters
                </div>
              </div>
            </div>
          ) : (
            <VoiceInput 
              onTranscript={handleAnswer} 
              className="py-10" 
            />
          )}

          {wordCount < 5 && wordCount > 0 && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-amber-500 bg-amber-50 p-4 rounded-xl border border-amber-100 text-sm font-medium"
            >
              <AlertCircle className="w-4 h-4" /> Please write at least 5 words to continue, or skip this question.
            </motion.div>
          )}

          {lastQuestionSkipped && isLast && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-3 text-blue-600 bg-blue-50/50 backdrop-blur-sm p-5 rounded-2xl border border-blue-100/50 shadow-sm text-sm font-bold"
            >
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              Last question skipped. Please click &ldquo;Finalize &amp; Submit&rdquo; to complete your interview.
            </motion.div>
          )}
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row gap-3 sm:gap-4 pt-8 sm:pt-12 border-t border-slate-50 w-full">
        <Button 
          variant="outline" 
          size="lg" 
          className="flex-1 h-12 sm:h-16 rounded-xl sm:rounded-2xl gap-1.5 sm:gap-2 font-bold w-full text-sm sm:text-base"
          onClick={handleBack}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" /> Previous
        </Button>
        <Button 
          variant="secondary" 
          size="lg" 
          className="flex-1 h-12 sm:h-16 rounded-xl sm:rounded-2xl font-bold w-full text-sm sm:text-base hover:bg-slate-100"
          onClick={handleSkip}
          disabled={isSubmitting}
        >
          Skip Question
        </Button>
        <Button 
          size="lg" 
          variant={isLast && canGoNext ? 'success' : 'primary'}
          className={`flex-[2] h-12 sm:h-16 rounded-xl sm:rounded-2xl gap-1.5 sm:gap-2 font-bold w-full text-sm sm:text-base transition-all ${!canGoNext ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
          onClick={handleNext}
          disabled={!canGoNext || isSubmitting}
        >
          {isLast ? (
            <>Finalize & Submit <Send className="w-4 h-4 sm:w-5 sm:h-5" /></>
          ) : (
            <>Next Question <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" /></>
          )}
        </Button>
      </div>
    </PageWrapper>
  );
}
