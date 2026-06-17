'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { MessageSquare, Mic, Play, ArrowLeft } from 'lucide-react';
import PageWrapper from '@/components/PageWrapper';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import SiriOrb from '@/components/SiriOrb';
import { setItem, getItem } from '@/lib/storage';
import { generateInterview } from '@/lib/generateInterview';

export default function ModePage() {
  const [mode, setMode] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const saved = getItem('mockify_mode');
    if (saved) setMode(saved);
  }, []);

  const handleStart = () => {
    if (mode) {
      const difficulty = getItem('mockify_difficulty', 'easy');
      const lastAttemptIds = getItem('mockify_last_ids', []);
      
      // Generate questions
      const questions = generateInterview(difficulty, lastAttemptIds);
      
      setItem('mockify_mode', mode);
      setItem('mockify_questions', questions);
      // Initialize empty answers
      setItem('mockify_answers', Array(10).fill(''));
      
      router.push('/interview');
    }
  };

  return (
    <PageWrapper className="items-center justify-center min-h-[90vh] px-4 py-20 relative">
      <div className="max-w-4xl w-full flex flex-col items-center gap-8 lg:gap-16">
        <div className="text-center space-y-2 lg:space-y-4">
          <h1 className="text-3xl lg:text-5xl font-extrabold text-slate-800 tracking-tight">Choose Your Mode</h1>
          <p className="text-sm lg:text-xl text-slate-500">Pick how you want to interact with our AI interviewer.</p>
        </div>

        {/* Center Orb */}
        <div className="relative group">
          <div className="absolute inset-0 bg-blue-100 rounded-full blur-[100px] opacity-20 group-hover:opacity-40 transition-opacity duration-700" />
          <SiriOrb isActive={mode === 'voice'} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-8 w-full max-w-3xl">
          {/* Text Mode */}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="h-full">
            <Card
              onClick={() => setMode('text')}
              className={`
                p-5 lg:p-8 cursor-pointer flex flex-col items-center gap-3 lg:gap-4 text-center border-2 transition-all h-full
                ${mode === 'text' ? 'border-primary bg-blue-50/30' : 'border-slate-100 hover:border-slate-300'}
              `}
            >
              <div className={`w-10 h-10 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl flex items-center justify-center ${mode === 'text' ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'bg-slate-50 text-slate-400'}`}>
                <MessageSquare className="w-5 h-5 lg:w-7 lg:h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg lg:text-xl font-bold text-slate-800">Text Mode</h3>
                <p className="text-xs lg:text-sm text-slate-500 leading-relaxed">Type your answers manually. Best for focused practice and fine-tuning wording.</p>
              </div>
            </Card>
          </motion.div>

          {/* Voice Mode */}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="h-full">
            <Card
              onClick={() => setMode('voice')}
              className={`
                p-5 lg:p-8 cursor-pointer flex flex-col items-center gap-3 lg:gap-4 text-center border-2 transition-all h-full
                ${mode === 'voice' ? 'border-primary bg-blue-50/30' : 'border-slate-100 hover:border-slate-300'}
              `}
            >
              <div className={`w-10 h-10 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl flex items-center justify-center ${mode === 'voice' ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'bg-slate-50 text-slate-400'}`}>
                <Mic className="w-5 h-5 lg:w-7 lg:h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg lg:text-xl font-bold text-slate-800">Voice Mode</h3>
                <p className="text-xs lg:text-sm text-slate-500 leading-relaxed">Speak naturally using your mic. Best for simulating a real conversational interview.</p>
              </div>
            </Card>
          </motion.div>
        </div>

        <div className="flex flex-col items-center gap-6">
          <Button
            size="lg"
            className="h-16 px-12 rounded-2xl gap-3 text-xl w-full sm:w-auto disabled:opacity-30 group"
            disabled={!mode}
            onClick={handleStart}
          >
            Start Interview <Play className="w-6 h-6 fill-current group-hover:scale-110 transition-transform" />
          </Button>
        </div>
      </div>
    </PageWrapper>
  );
}
