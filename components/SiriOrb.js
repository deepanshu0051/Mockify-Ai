'use client';
import { motion, AnimatePresence } from 'framer-motion';

export default function SiriOrb({ state = 'idle' }) {
  return (
    <div className="relative w-40 h-40 sm:w-64 sm:h-64 flex items-center justify-center">
      {/* Outer glow */}
      <motion.div
        animate={{
          scale: state === 'thinking' ? [1, 1.2, 1] : state === 'listening' ? [1, 1.05, 1] : state === 'speaking' ? [1, 1.15, 1] : 1,
          opacity: state === 'speaking' ? [0.4, 0.8, 0.4] : 0.3,
        }}
        transition={{ duration: state === 'thinking' ? 1.5 : 3, repeat: Infinity, ease: 'easeInOut' }}
        className={`absolute inset-0 rounded-full blur-[60px] ${state === 'thinking' ? 'bg-indigo-400' : 'bg-blue-400'}`}
      />
      
      {/* The Orb */}
      <motion.div
        animate={{
          rotate: state === 'thinking' ? [0, 1080] : [0, 360],
          scale: state === 'listening' ? [1, 1.08, 1] : state === 'speaking' ? [1, 1.05, 1] : 1,
        }}
        transition={{
          rotate: { duration: state === 'thinking' ? 4 : 10, repeat: Infinity, ease: 'linear' },
          scale: { duration: state === 'listening' ? 2.5 : 2, repeat: Infinity, ease: 'easeInOut' }
        }}
        className="relative w-32 h-32 sm:w-48 sm:h-48 rounded-full overflow-hidden shadow-2xl"
        style={{
          background: state === 'listening' ? 'conic-gradient(from 0deg, #ec4899, #8b5cf6, #3b82f6, #ec4899)' : 'conic-gradient(from 0deg, #2563eb, #60a5fa, #818cf8, #2563eb)',
          filter: 'blur(1px)',
        }}
      >
        <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]" />
        
        {/* Animated highlights inside the orb */}
        <motion.div
          animate={{
            x: ['-50%', '50%', '-50%'],
            y: ['-20%', '20%', '-20%'],
          }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 bg-gradient-to-tr from-white/30 to-transparent rounded-full"
        />
      </motion.div>

      {/* Pulsing rings for Speaking mapping */}
      <AnimatePresence>
        {state === 'speaking' && (
          <>
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 2.2, opacity: 0 }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.5, ease: 'easeOut' }}
                className="absolute w-32 h-32 sm:w-48 sm:h-48 border-[2px] border-blue-300 rounded-full"
              />
            ))}
          </>
        )}
      </AnimatePresence>
    </div>
  );
}


