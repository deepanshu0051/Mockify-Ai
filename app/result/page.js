'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, ArrowRight, RotateCcw, CheckCircle2, XCircle, BarChart3, ListChecks, Copy, RefreshCw, Home } from 'lucide-react';
import PageWrapper from '@/components/PageWrapper';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { getItem, setItem } from '@/lib/storage';
import { clearUserSession } from '@/lib/cleanup';

export default function ResultPage() {
  const [score, setScore] = useState(0);
  const [breakdown, setBreakdown] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showRetestModal, setShowRetestModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const questions = getItem('mockify_questions');
    const answers = getItem('mockify_answers');

    if (!questions || !answers) {
      router.push('/');
      return;
    }

    // Compute scores
    const results = questions.map((q, idx) => {
      const userAnswer = (answers[idx] || '').toLowerCase();
      const keywords = q.keywords || [];
      const matched = keywords.filter(k => userAnswer.includes(k.toLowerCase()));
      const qScore = keywords.length > 0 ? (matched.length / keywords.length) * 10 : 0;
      
      return {
        id: q.id,
        score: Math.round(qScore),
        matched,
        totalKeywords: keywords.length,
        topic: q.topic
      };
    });

    const total = results.reduce((acc, curr) => acc + curr.score, 0);
    setScore(total); // total out of 100 since 10 questions * 10 max each
    setBreakdown(results);
    setIsLoading(false);
  }, [router]);

  if (isLoading) return null;

  const getStatus = (s) => {
    if (s >= 80) return { label: 'Excellent', color: 'text-green-500', bg: 'bg-green-50' };
    if (s >= 60) return { label: 'Good', color: 'text-blue-500', bg: 'bg-blue-50' };
    if (s >= 40) return { label: 'Average', color: 'text-amber-500', bg: 'bg-amber-50' };
    return { label: 'Needs Practice', color: 'text-red-500', bg: 'bg-red-50' };
  };

  const status = getStatus(score);

  const handleRetestSame = () => {
    // Reset answers but keep same questions
    setItem('mockify_answers', Array(10).fill(''));
    router.push('/interview');
  };

  const handleRetestNew = () => {
    router.push('/difficulty');
  };

  const handleHome = () => {
    clearUserSession();
    router.push('/');
  };

  return (
    <PageWrapper className="max-w-5xl mx-auto px-4 py-20 w-full relative">
      <div className="fixed top-6 right-6 z-50 pointer-events-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <button
            onClick={handleHome}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-white/70 backdrop-blur-xl border border-white shadow-xl transition-all hover:bg-white active:scale-95 group p-0 min-h-[44px] min-w-[44px]"
            aria-label="Go home"
          >
            <Home className="h-5 w-5 text-slate-800 shrink-0 transition-colors group-hover:text-black" strokeWidth={2} />
          </button>
        </motion.div>
      </div>

      <div className="space-y-8 sm:space-y-12">
        <div className="text-center space-y-2 sm:space-y-4">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-1.5 sm:py-2 rounded-full font-bold text-xs sm:text-sm border ${status.bg} ${status.color} border-current/20 mb-2 sm:mb-4`}
          >
            <Award className="w-3 h-3 sm:w-4 sm:h-4" /> INTERVIEW COMPLETED
          </motion.div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-800 tracking-tight">Your Performance Report</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Score Circle */}
          <Card className="lg:col-span-1 p-6 sm:p-10 flex flex-col items-center justify-center text-center space-y-4 sm:space-y-6">
            <h3 className="text-sm sm:text-lg font-bold text-slate-400 uppercase tracking-widest">Overall Score</h3>
            <div className="relative w-32 h-32 sm:w-48 sm:h-48 flex items-center justify-center">
              <svg viewBox="0 0 192 192" className="w-full h-full transform -rotate-90">
                <circle
                  cx="96" cy="96" r="88"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="12"
                  className="text-slate-100"
                />
                <motion.circle
                  cx="96" cy="96" r="88"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="12"
                  strokeDasharray={2 * Math.PI * 88}
                  initial={{ strokeDashoffset: 2 * Math.PI * 88 }}
                  animate={{ strokeDashoffset: (2 * Math.PI * 88) * (1 - score / 100) }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                  className={status.color}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-5xl sm:text-6xl font-black ${status.color}`}>{score}</span>
                <span className="text-[10px] sm:text-sm text-slate-300 font-bold uppercase tracking-tighter"> / 100</span>
              </div>
            </div>
            <div className="space-y-2">
              <p className={`text-2xl font-bold ${status.color}`}>{status.label}</p>
              <p className="text-sm text-slate-400 max-w-[200px]">Based on keyword matching and technical accuracy.</p>
            </div>
          </Card>

          {/* Breakdown Cards */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                <BarChart3 className="w-6 h-6 text-primary" /> Category Analysis
              </h3>
              <Badge variant="default">{breakdown.length} Questions</Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {breakdown.map((item, idx) => (
                <Card key={idx} className="p-4 sm:p-6 hover:translate-y-[-2px] transition-all">
                  <div className="flex justify-between items-start mb-3 sm:mb-4">
                    <Badge variant={item.topic} className="text-[10px] sm:text-xs">{item.topic}</Badge>
                    <span className={`text-base sm:text-lg font-black ${item.score >= 8 ? 'text-green-500' : item.score >= 5 ? 'text-amber-500' : 'text-red-400'}`}>
                      {item.score}/10
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-700 text-xs sm:text-sm mb-2 sm:mb-3">Question {idx + 1}</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {item.matched.length > 0 ? (
                      item.matched.map(m => (
                        <span key={m} className="px-2 py-0.5 bg-green-50 text-[10px] font-bold text-green-600 rounded uppercase tracking-tighter">
                          {m}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] font-medium text-slate-300 italic">No keywords matched</span>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-6 sm:pt-8 w-full">
          <Button variant="outline" size="lg" className="h-12 sm:h-16 px-6 sm:px-10 rounded-xl sm:rounded-2xl gap-2 sm:gap-3 text-sm sm:text-lg w-full sm:w-auto" onClick={() => setShowRetestModal(true)}>
            <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" /> Retest New Questions
          </Button>
          <Button size="lg" className="h-12 sm:h-16 px-6 sm:px-10 rounded-xl sm:rounded-2xl gap-2 sm:gap-3 text-sm sm:text-lg w-full sm:w-auto" onClick={() => router.push('/answers')}>
            View Detailed Answers <ListChecks className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {showRetestModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setShowRetestModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-xl bg-white/90 backdrop-blur-xl border border-white rounded-[2.5rem] shadow-2xl p-8 sm:p-12 overflow-hidden"
            >
              <div className="relative z-10 space-y-8">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">Choose Your Retest Mode</h2>
                  <p className="text-slate-500 text-sm sm:text-base">Would you like to practice the same interview again or generate a different interview?</p>
                </div>

                <div className="space-y-4">
                  {/* Same Questions Option */}
                  <div 
                    onClick={handleRetestSame}
                    className="group cursor-pointer p-5 sm:p-6 rounded-2xl sm:rounded-3xl border-2 border-slate-100 hover:border-primary/50 hover:bg-blue-50/30 transition-all flex items-start gap-4"
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <Copy className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div>
                      <h4 className="text-base sm:text-lg font-bold text-slate-800 mb-1">Same Questions</h4>
                      <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">Retake the interview using the exact same questions from your previous attempt. Best for mastering specific topics.</p>
                    </div>
                  </div>

                  {/* Different Questions Option */}
                  <div 
                    onClick={handleRetestNew}
                    className="group cursor-pointer p-5 sm:p-6 rounded-2xl sm:rounded-3xl border-2 border-slate-100 hover:border-indigo-500/50 hover:bg-indigo-50/30 transition-all flex items-start gap-4"
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div>
                      <h4 className="text-base sm:text-lg font-bold text-slate-800 mb-1">Different Questions</h4>
                      <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">Generate a new interview with different questions. Follows the standard flow avoiding previously seen questions.</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center pt-2">
                  <Button variant="ghost" size="lg" className="h-12 rounded-xl px-8 font-bold text-slate-400 hover:text-slate-600 w-full" onClick={() => setShowRetestModal(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageWrapper>
  );
}
