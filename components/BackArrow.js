'use client';

import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { getItem } from '@/lib/storage';

const FLOW_BACK = {
  "/fetching": "/upload",
  "/role": "/upload",
  "/difficulty": "/role",
  "/mode": "/difficulty",
  "/interview": "/mode",
  "/result": "/interview",
  "/answers": "/result"
};

export default function BackArrow() {
  const router = useRouter();
  const pathname = usePathname();

  // Rules: Do NOT show on landing page "/", "/upload", "/interview" and "/result"
  if (pathname === '/' || pathname === '/upload' || pathname === '/interview' || pathname === '/result') {
    return null;
  }

  const handleBack = () => {
    // Custom event to allow pages to intercept and cancel navigation (e.g. aborting transcription in /fetching)
    const event = new CustomEvent('back-arrow-click', { cancelable: true });
    const isCancelled = !window.dispatchEvent(event);
    
    if (isCancelled) return;

    // Special rule for Voice Mode results page
    if (pathname === '/result') {
      const mode = getItem('mockify_mode');
      if (mode === 'voice') {
        router.push('/mode');
        return;
      }
    }

    // Deterministic Flow based on FLOW_BACK
    if (FLOW_BACK[pathname]) {
      router.push(FLOW_BACK[pathname]);
    } else {
      router.back();
    }
  };

  return (
    <div className="fixed top-6 left-6 z-[60] pointer-events-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }} 
        whileTap={{ scale: 0.95 }}
      >
        <button
          onClick={handleBack}
          className="flex items-center justify-center w-12 h-12 rounded-full bg-white/90 backdrop-blur-xl border border-white shadow-xl transition-all hover:bg-white active:scale-95 group p-0 min-h-[44px] min-w-[44px]"
          aria-label="Go back"
        >
          <ArrowLeft 
            className="h-5 w-5 text-slate-800 shrink-0 transition-colors group-hover:text-black" 
            strokeWidth={2} 
          />
        </button>
      </motion.div>
    </div>
  );
}

