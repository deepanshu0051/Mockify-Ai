'use client';
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { FileText, Upload, X, CheckCircle, Eye, Trash2 } from 'lucide-react';
import PageWrapper from '@/components/PageWrapper';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import PDFPreviewModal from '@/components/PDFPreviewModal';
import { setItem } from '@/lib/storage';
import { useGlobalFile } from '@/lib/FileContext';

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const router = useRouter();
  const { setGlobalFile } = useGlobalFile();

  const onDrop = useCallback(acceptedFiles => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    multiple: false
  });

  const handleRemove = (e) => {
    e.stopPropagation();
    setFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  const handleDone = () => {
    if (file) {
      setGlobalFile(file);
      setItem('mockify_resume', {
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB',
        uploadedAt: new Date().toISOString(),
      });
      router.push('/fetching');
    }
  };

  return (
    <PageWrapper className="max-w-3xl mx-auto px-4 py-20 w-full relative">
      <div className="space-y-6 lg:space-y-10">
        <div className="text-center space-y-2 lg:space-y-3">
          <h1 className="text-2xl lg:text-4xl font-bold text-slate-800">Upload Resume</h1>
          <p className="text-sm lg:text-lg text-slate-500">
            Tell us about your background so we can tailor the interview.
          </p>
        </div>

        {!file ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <div
              {...getRootProps()}
              className={`
                relative h-64 lg:h-[340px] rounded-[2rem] lg:rounded-[2.5rem] border-2 border-dashed flex flex-col items-center justify-center p-6 lg:p-12 transition-all cursor-pointer backdrop-blur-xl
                ${isDragActive ? 'border-primary bg-primary/5 scale-[1.02] shadow-xl shadow-primary/10' : 'border-slate-200 bg-white/70 hover:border-indigo-300 hover:bg-white shadow-lg shadow-slate-100/50'}
              `}
            >
              <input {...getInputProps()} />
              <motion.div 
                whileHover={{ scale: 1.05, rotate: -5 }}
                className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center text-primary mb-4 lg:mb-6 shadow-sm border border-indigo-100/50"
              >
                <Upload className="w-8 h-8 lg:w-10 lg:h-10" />
              </motion.div>
              <h3 className="text-lg lg:text-2xl font-bold text-slate-800 mb-1 lg:mb-2 text-center tracking-tight">
                {isDragActive ? 'Drop your resume here' : 'Drag & drop your resume'}
              </h3>
              <p className="text-xs lg:text-sm text-slate-400 font-medium">PDF files only, up to 5MB</p>
              
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="mt-6 lg:mt-8">
                <Button variant="secondary" className="rounded-xl h-11 lg:h-12 text-sm lg:text-base px-8 font-semibold bg-white border border-slate-200 text-slate-600 shadow-sm hover:border-indigo-200 hover:text-primary transition-all">
                  Browse Files
                </Button>
              </motion.div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <Card className="p-6 lg:p-10 group relative border border-slate-100 bg-white/80 backdrop-blur-xl shadow-2xl shadow-indigo-50/50 rounded-[2rem]">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 lg:gap-8">
                <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center text-primary relative border border-indigo-100/50 flex-shrink-0 shadow-sm">
                  <FileText className="w-8 h-8 lg:w-10 lg:h-10" />
                  <motion.div 
                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}
                    className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1 shadow-lg shadow-green-200"
                  >
                    <CheckCircle className="w-4 h-4 lg:w-5 lg:h-5" />
                  </motion.div>
                </div>
                <div className="flex-1 min-w-0 w-full text-center sm:text-left">
                  <h3 className="text-lg lg:text-2xl font-bold text-slate-800 truncate mb-1 lg:mb-2 tracking-tight">{file.name}</h3>
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-slate-400 text-xs lg:text-sm font-medium">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100">{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                    <span>•</span>
                    <span className="text-green-600">Ready for analysis</span>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 w-full sm:w-auto mt-4 sm:mt-0">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="ghost" size="sm" onClick={() => setIsPreviewOpen(true)} className="rounded-xl h-10 w-10 p-0 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
                      <Eye className="w-4 h-4 lg:w-5 lg:h-5 mx-auto" />
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="ghost" size="sm" onClick={handleRemove} className="rounded-xl h-10 w-10 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                      <Trash2 className="w-4 h-4 lg:w-5 lg:h-5 mx-auto" />
                    </Button>
                  </motion.div>
                </div>
              </div>
              
              <div className="mt-8 lg:mt-10 flex flex-col sm:flex-row gap-3 lg:gap-4 w-full">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                  <Button variant="outline" className="h-12 lg:h-14 rounded-xl w-full text-sm lg:text-base border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50 font-semibold shadow-sm transition-all" onClick={handleRemove}>
                    Replace File
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }} className="flex-1">
                  <Button className="h-12 lg:h-14 rounded-xl w-full text-sm lg:text-base bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold shadow-lg shadow-indigo-500/30 border-0 transition-all" onClick={handleDone}>
                    Analyze Resume
                  </Button>
                </motion.div>
              </div>
            </Card>
          </motion.div>
        )}

        <div className="flex justify-center">
          <Button variant="ghost" className="text-slate-400 hover:text-slate-600" onClick={() => router.push('/')}>
            Cancel and return home
          </Button>
        </div>
      </div>

      <PDFPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        fileUrl={previewUrl}
        fileName={file?.name}
      />
    </PageWrapper>
  );
}

// Adding missing import for motion
import { motion } from 'framer-motion';
