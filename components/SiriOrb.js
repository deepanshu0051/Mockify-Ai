'use client';
import { motion } from 'framer-motion';

export default function SiriOrb({ isActive = false }) {
  return (
    <div className="relative w-40 h-40 sm:w-64 sm:h-64 flex items-center justify-center">
      {/* Outer glow */}
      <motion.div
        animate={{
          scale: isActive ? [1, 1.1, 1] : 1,
          opacity: isActive ? [0.3, 0.6, 0.3] : 0.3,
        }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute inset-0 bg-blue-400 rounded-full blur-[60px]"
      />
      
      {/* The Orb */}
      <motion.div
        animate={{
          rotate: [0, 360],
          scale: isActive ? [1, 1.05, 1] : 1,
        }}
        transition={{
          rotate: { duration: 10, repeat: Infinity, ease: 'linear' },
          scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
        }}
        className="relative w-32 h-32 sm:w-48 sm:h-48 rounded-full overflow-hidden shadow-2xl"
        style={{
          background: 'conic-gradient(from 0deg, #2563eb, #60a5fa, #818cf8, #2563eb)',
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

      {/* Pulsing rings */}
      <AnimatePresence>
        {isActive && (
          <>
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 2, opacity: 0 }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.6, ease: 'easeOut' }}
                className="absolute w-32 h-32 sm:w-48 sm:h-48 border border-blue-200 rounded-full"
              />
            ))}
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Fixed missing import in thought
import { AnimatePresence } from 'framer-motion';
