'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Zap, Shield, Flame, Shuffle, CheckCircle2 } from 'lucide-react';
import PageWrapper from '@/components/PageWrapper';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { setItem, getItem } from '@/lib/storage';

const DIFFICULTIES = [
  { 
    id: 'easy', 
    name: 'Easy', 
    icon: Zap, 
    color: 'green', 
    desc: 'Perfect for entry-level. Focuses on fundamentals and basic concepts.',
    distribution: '7 EASY + 3 MEDIUM QUESTIONS'
  },
  { 
    id: 'medium', 
    name: 'Medium', 
    icon: Shield, 
    color: 'amber', 
    desc: 'Balanced challenge. Ideal for junior to mid-level developers.',
    distribution: '3 EASY + 5 MEDIUM + 2 HARD QUESTIONS'
  },
  { 
    id: 'hard', 
    name: 'Hard', 
    icon: Flame, 
    color: 'red', 
    desc: 'Tough and in-depth. For senior roles and complex problem solvers.',
    distribution: '2 MEDIUM + 8 HARD QUESTIONS'
  },
  { 
    id: 'mix', 
    name: 'Mixed', 
    icon: Shuffle, 
    color: 'purple', 
    desc: 'A random assortment. Tests your versatility across all levels.',
    distribution: 'REALISTIC MIX OF ALL LEVELS'
  }
];

export default function DifficultyPage() {
  const [selected, setSelected] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const saved = getItem('mockify_difficulty');
    if (saved) setSelected(saved);
  }, []);

  const handleNext = () => {
    if (selected) {
      setItem('mockify_difficulty', selected);
      router.push('/mode');
    }
  };

  const badgeColors = {
    easy: 'green',
    medium: 'amber',
    hard: 'red',
    mix: 'purple'
  };

  return (
    <PageWrapper className="max-w-4xl mx-auto px-4 py-20 w-full relative">

      <div className="space-y-8 sm:space-y-12">
        <div className="text-center space-y-2 sm:space-y-3">
          <h1 className="text-3xl sm:text-5xl font-black text-slate-800 tracking-tight">Select Difficulty</h1>
          <p className="text-sm sm:text-xl text-slate-500 font-medium">
            How challenging do you want your interview to be?
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
          {DIFFICULTIES.map((diff) => {
            const isSelected = selected === diff.id;
            const Icon = diff.icon;
            
            return (
              <motion.div
                key={diff.id}
                whileHover={{ y: -6 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Card 
                  onClick={() => setSelected(diff.id)}
                  className={`
                    p-5 sm:p-8 cursor-pointer relative overflow-hidden h-full border-2 transition-all duration-300
                    ${isSelected ? 'border-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.2)] bg-indigo-50/20' : 'border-white/80 hover:border-indigo-200'}
                  `}
                >
                  {isSelected && (
                    <div className="absolute top-4 right-4 sm:top-5 sm:right-5 text-indigo-500 animate-in zoom-in">
                      <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 fill-indigo-500 text-white shadow-xl" />
                    </div>
                  )}
                  
                  <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl mb-4 sm:mb-6 flex items-center justify-center bg-${diff.color}-50 text-${diff.color}-600 border border-${diff.color}-100 shadow-sm`}>
                    <Icon className="w-5 h-5 sm:w-7 sm:h-7" />
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <h3 className="text-lg sm:text-2xl font-black text-slate-800">{diff.name}</h3>
                      <Badge variant={diff.id} className="text-[10px] sm:text-xs">{diff.id.toUpperCase()}</Badge>
                    </div>
                    <p className="text-slate-500 text-xs sm:text-base leading-snug sm:leading-relaxed font-medium">{diff.desc}</p>
                    <div className="pt-3 sm:pt-6 flex items-center gap-1.5 sm:gap-2 text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest sm:tracking-[0.15em]">
                      <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> {diff.distribution}
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 pt-2 sm:pt-4 max-w-lg mx-auto w-full">
          <Button variant="outline" size="lg" className="flex-1 h-12 sm:h-16 rounded-full w-full text-sm sm:text-lg" onClick={() => router.back()}>
            Back
          </Button>
          <Button 
            size="lg"
            className="flex-1 h-12 sm:h-16 rounded-full w-full text-sm sm:text-lg" 
            disabled={!selected}
            onClick={handleNext}
          >
            Done
          </Button>
        </div>
      </div>
    </PageWrapper>
  );
}
