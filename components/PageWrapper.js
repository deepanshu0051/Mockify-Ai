'use client';
import { motion } from 'framer-motion';

export default function PageWrapper({ children, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={`flex-1 flex flex-col ${className}`}
    >
      {children}
    </motion.div>
  );
}
