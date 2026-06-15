'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Award, ArrowRight, RotateCcw, CheckCircle2, XCircle, BarChart3, ListChecks, Home } from 'lucide-react';
import PageWrapper from '@/components/PageWrapper';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { getItem } from '@/lib/storage';

export default function ResultPage() {
  const [score, setScore] = useState(0);
  const [breakdown, setBreakdown] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
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

  const goHome = () => {
    localStorage.clear();
    router.push('/');
  };

  const getStatus = (s) => {
    if (s >= 80) return { label: 'Excellent', color: 'text-green-500', bg: 'bg-green-50' };
    if (s >= 60) return { label: 'Good', color: 'text-blue-500', bg: 'bg-blue-50' };
    if (s >= 40) return { label: 'Average', color: 'text-amber-500', bg: 'bg-amber-50' };
    return { label: 'Needs Practice', color: 'text-red-500', bg: 'bg-red-50' };
  };

  const status = getStatus(score);

  return (
    <PageWrapper className="max-w-5xl mx-auto px-4 py-20 w-full relative">
      {/* Home Button */}
      <div className="absolute top-4 right-4 sm:top-8 sm:right-8 z-10">
        <button 
          onClick={goHome}
          className="w-10 h-10 rounded-full bg-white/70 backdrop-blur-md border border-white/90 shadow-lg flex items-center justify-center text-indigo-600 hover:scale-110 hover:bg-white transition-all focus:outline-none"
          title="Go Home & Reset"
        >
          <Home className="w-5 h-5" />
        </button>
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
          <Button variant="outline" size="lg" className="h-12 sm:h-16 px-6 sm:px-10 rounded-xl sm:rounded-2xl gap-2 sm:gap-3 text-sm sm:text-lg w-full sm:w-auto" onClick={() => router.push('/difficulty')}>
            <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" /> Retest New Questions
          </Button>
          <Button size="lg" className="h-12 sm:h-16 px-6 sm:px-10 rounded-xl sm:rounded-2xl gap-2 sm:gap-3 text-sm sm:text-lg w-full sm:w-auto" onClick={() => router.push('/answers')}>
            View Detailed Answers <ListChecks className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
        </div>
      </div>
    </PageWrapper>
  );
}
