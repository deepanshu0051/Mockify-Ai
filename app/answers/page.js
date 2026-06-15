'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, XCircle, HelpCircle, User, Award, RotateCcw } from 'lucide-react';
import PageWrapper from '@/components/PageWrapper';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Chip from '@/components/ui/Chip';
import { getItem } from '@/lib/storage';

export default function AnswersPage() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const questions = getItem('mockify_questions');
    const answers = getItem('mockify_answers');

    if (!questions || !answers) {
      router.push('/');
      return;
    }

    const merged = questions.map((q, idx) => ({
      ...q,
      userAnswer: answers[idx] || '(No answer provided)',
      score: q.keywords.length > 0 ? 
        Math.round((q.keywords.filter(k => (answers[idx] || '').toLowerCase().includes(k.toLowerCase())).length / q.keywords.length) * 10) : 0
    }));

    setData(merged);
    setIsLoading(false);
  }, [router]);

  if (isLoading) return null;

  return (
    <PageWrapper className="max-w-4xl mx-auto px-4 py-20 w-full">
      <div className="space-y-8 sm:space-y-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-2">
            <button onClick={() => router.push('/result')} className="flex items-center gap-2 text-slate-400 hover:text-slate-600 font-medium text-xs sm:text-sm mb-1 sm:mb-2 transition-colors">
              <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" /> Back to Results
            </button>
            <h1 className="text-2xl sm:text-4xl font-bold text-slate-800 tracking-tight">Review Answers</h1>
            <p className="text-sm sm:text-base text-slate-500">Compare your responses with our model technical answers.</p>
          </div>
          <Button variant="secondary" className="rounded-xl sm:rounded-2xl gap-2 font-bold h-10 sm:h-auto w-full md:w-auto" onClick={() => router.push('/difficulty')}>
            <RotateCcw className="w-4 h-4" /> Retest
          </Button>
        </div>

        <div className="space-y-6 sm:space-y-10">
          {data.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="p-4 sm:p-8 space-y-4 sm:space-y-8 border-l-4 sm:border-l-8 border-l-slate-100 hover:border-l-primary/30 transition-all">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-50 flex items-center justify-center font-black text-slate-300 text-sm sm:text-base shrink-0">
                      {idx + 1}
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-lg font-bold text-slate-800 leading-tight">{item.question}</h3>
                      <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
                        <Badge variant={item.difficulty} className="text-[8px] sm:text-[10px]">{item.difficulty.toUpperCase()}</Badge>
                        <span className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.topic}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end shrink-0">
                    <span className="text-[10px] sm:text-xs font-bold text-slate-300 uppercase tracking-widest mb-1">Score</span>
                    <div className={`text-xl sm:text-2xl font-black ${item.score >= 8 ? 'text-green-500' : item.score >= 5 ? 'text-amber-500' : 'text-red-400'}`}>
                      {item.score}<span className="text-xs sm:text-sm text-slate-200"> / 10</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 pt-4 sm:pt-6 border-t border-slate-50">
                  {/* Your Answer */}
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">
                      <User className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> Your Response
                    </div>
                    <div className="p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-slate-50 text-slate-600 text-xs sm:text-sm leading-relaxed min-h-[80px] sm:min-h-[100px] italic">
                      "{item.userAnswer}"
                    </div>
                  </div>

                  {/* Model Answer */}
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-bold text-primary uppercase tracking-widest">
                      <Award className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> Technical Ideal
                    </div>
                    <div className="p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-blue-50/30 text-slate-700 text-xs sm:text-sm leading-relaxed min-h-[80px] sm:min-h-[100px] font-medium border border-blue-50">
                      {item.modelAnswer}
                    </div>
                  </div>
                </div>

                {/* Keywords */}
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">
                    <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> Target Keywords Matched
                  </div>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {item.keywords.map(k => {
                      const isMatched = item.userAnswer.toLowerCase().includes(k.toLowerCase());
                      return (
                        <div 
                          key={k} 
                          className={`
                            px-2 sm:px-3 py-0.5 sm:py-1 rounded-md sm:rounded-lg border text-[10px] sm:text-xs font-bold flex items-center gap-1 sm:gap-2 transition-all
                            ${isMatched ? 'bg-green-50 border-green-200 text-green-700' : 'bg-slate-50 border-slate-100 text-slate-300'}
                          `}
                        >
                          {isMatched ? <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> : <HelpCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
                          {k}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-center pt-6 sm:pt-8 w-full max-w-lg mx-auto">
          <Button size="lg" className="h-12 sm:h-16 rounded-xl sm:rounded-2xl text-sm sm:text-xl gap-2 sm:gap-3 shadow-xl shadow-primary/20 w-full md:w-auto px-6 sm:px-16" onClick={() => router.push('/difficulty')}>
            Start New Round <RotateCcw className="w-4 h-4 sm:w-6 sm:h-6" />
          </Button>
        </div>
      </div>
    </PageWrapper>
  );
}
