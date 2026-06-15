'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from './Button';

export default function Modal({ isOpen, onClose, title, children, className = '' }) {
  if (typeof window === 'undefined') return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className={cn(
              'relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100',
              className
            )}
          >
            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-50 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="p-6 max-h-[80vh] overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
