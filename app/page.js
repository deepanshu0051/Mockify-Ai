'use client';
import Link from 'next/link';
import PageWrapper from '@/components/PageWrapper';
import Button from '@/components/ui/Button';
import { ArrowRight, Star, Shield, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingPage() {
  return (
    <PageWrapper className="justify-center items-center px-4 py-20 min-h-[90vh]">
      <div className="max-w-4xl text-center space-y-8">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <span className="px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-sm font-semibold border border-blue-100 uppercase tracking-wider">
            AI-Powered Career Growth
          </span>
        </motion.div>

        {/* Heading */}
        <motion.h1 
          className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-slate-900 leading-tight lg:leading-[1.1] tracking-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Welcome to <span className="text-primary">Mockify-AI</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p 
          className="text-base lg:text-xl text-slate-500 max-w-2xl mx-auto leading-snug lg:leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          Ace your next interview with real-time feedback, personalized questions derived from your resume, and professional practice modes.
        </motion.p>

        {/* CTA */}
        <motion.div 
          className="flex flex-col sm:flex-row items-center justify-center gap-3 lg:gap-4 pt-4 w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Link href="/upload" className="w-full sm:w-auto">
            <Button size="lg" className="h-12 lg:h-16 px-6 lg:px-10 gap-2 lg:gap-3 group w-full sm:w-auto text-sm lg:text-lg">
              Get Started <ArrowRight className="w-4 h-4 lg:w-5 lg:h-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </motion.div>

        {/* Stats/Features */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-8 pt-10 lg:pt-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 1 }}
        >
          {[
            { icon: Zap, label: 'Instant Feedback', desc: 'Get scored on your answers immediately.' },
            { icon: Shield, label: 'Resume Based', desc: 'Questions tailored to your actual skills.' },
            { icon: Star, label: 'Expert Mode', desc: 'Challenge yourself with hard difficulty.' }
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center space-y-2 lg:space-y-3 p-4 lg:p-6 rounded-2xl lg:rounded-3xl bg-white/50 border border-slate-100 hover:border-blue-100 transition-colors">
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 mb-1 lg:mb-2">
                <item.icon className="w-5 h-5 lg:w-6 lg:h-6" />
              </div>
              <h3 className="text-sm lg:text-base font-bold text-slate-800">{item.label}</h3>
              <p className="text-xs lg:text-sm text-slate-500">{item.desc}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </PageWrapper>
  );
}
