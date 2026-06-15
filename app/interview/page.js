'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Send, AlertCircle, Save } from 'lucide-react';
import PageWrapper from '@/components/PageWrapper';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Stepper from '@/components/ui/Stepper';
import QuestionCard from '@/components/QuestionCard';
import VoiceInput from '@/components/VoiceInput';
import ProgressBar from '@/components/ui/ProgressBar';
import { setItem, getItem } from '@/lib/storage';

export default function InterviewPage() {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState(Array(10).fill(''));
  const [mode, setMode] = useState('text');
  const [isLoading, setIsLoading] = useState(true);
  
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
    setItem('mockify_answers', newAnswers);
  }, []);

  const handleAnswer = (val) => {
    const newAnswers = [...answers];
    newAnswers[currentIndex] = val;
    setAnswers(newAnswers);
    saveState(newAnswers);
  };

  const handleNext = () => {
    if (currentIndex < 9) {
      setCurrentIndex(prev => prev + 1);
      // If voice mode, we don't automatically clear current transcript (it's handled in VoiceInput)
    } else {
      // Final Submit
      // Store IDs to avoid repeats next time
      const currentIds = questions.map(q => q.id);
      setItem('mockify_last_ids', currentIds);
      router.push('/result');
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  if (isLoading) return null;

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / 10) * 100;
  const isLast = currentIndex === 9;

  return (
    <PageWrapper className="max-w-4xl mx-auto px-4 py-12 w-full h-full flex flex-col">
      {/* Header Info */}
      <div className="space-y-8 mb-12">
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
                value={answers[currentIndex]}
                onChange={(e) => handleAnswer(e.target.value)}
                placeholder="Type your comprehensive answer here..."
                className="w-full min-h-[150px] sm:min-h-[200px] h-48 sm:h-64 p-4 sm:p-8 bg-white rounded-2xl sm:rounded-[2.5rem] border border-slate-200 focus:border-primary focus:ring-4 sm:focus:ring-8 focus:ring-primary/5 outline-none transition-all text-sm sm:text-lg text-slate-700 leading-relaxed resize-y shadow-sm group-hover:border-slate-300"
              />
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

          {answers[currentIndex].length < 20 && answers[currentIndex].length > 0 && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-amber-500 bg-amber-50 p-4 rounded-xl border border-amber-100 text-sm font-medium"
            >
              <AlertCircle className="w-4 h-4" /> Tip: Try giving a more detailed answer for a better score.
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
          className="flex-1 h-12 sm:h-16 rounded-xl sm:rounded-2xl font-bold w-full text-sm sm:text-base"
          onClick={handleNext}
        >
          Skip
        </Button>
        <Button 
          size="lg" 
          className={`flex-[2] h-12 sm:h-16 rounded-xl sm:rounded-2xl gap-1.5 sm:gap-2 font-bold w-full text-sm sm:text-base ${isLast ? 'bg-green-600 hover:bg-green-700' : ''}`}
          onClick={handleNext}
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
