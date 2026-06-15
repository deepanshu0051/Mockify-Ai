'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink } from 'lucide-react';
import Button from './ui/Button';

export default function PDFPreviewModal({ isOpen, onClose, fileUrl, fileName }) {
  if (typeof window === 'undefined') return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center sm:p-6 p-0">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white w-full h-full sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-100"
          >
            <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
              <div className="flex flex-col">
                <h2 className="text-lg font-bold text-slate-800">Resume Preview</h2>
                <p className="text-xs text-slate-400 truncate max-w-[200px]">{fileName}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => window.open(fileUrl, '_blank')} className="hidden sm:flex gap-2">
                  <ExternalLink className="w-4 h-4" /> Open Original
                </Button>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <X className="w-6 h-6 text-slate-500" />
                </button>
              </div>
            </div>
            <div className="flex-1 bg-slate-100 relative">
              <iframe
                src={fileUrl}
                title="Resume Preview"
                className="w-full h-full border-none"
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
