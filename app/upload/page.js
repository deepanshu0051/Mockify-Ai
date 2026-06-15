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

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const router = useRouter();

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
      setItem('mockify_resume', {
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB',
        uploadedAt: new Date().toISOString(),
      });
      router.push('/fetching');
    }
  };

  return (
    <PageWrapper className="max-w-3xl mx-auto px-4 py-20 w-full">
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
          >
            <div
              {...getRootProps()}
              className={`
                relative h-56 lg:h-80 rounded-3xl lg:rounded-[2.5rem] border-2 border-dashed flex flex-col items-center justify-center p-6 lg:p-12 transition-all cursor-pointer
                ${isDragActive ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'}
              `}
            >
              <input {...getInputProps()} />
              <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-blue-50 flex items-center justify-center text-primary mb-4 lg:mb-6">
                <Upload className="w-8 h-8 lg:w-10 lg:h-10" />
              </div>
              <h3 className="text-base lg:text-xl font-bold text-slate-800 mb-1 lg:mb-2 text-center">
                {isDragActive ? 'Drop your resume here' : 'Drag & drop your resume'}
              </h3>
              <p className="text-xs lg:text-sm text-slate-400">PDF files only, up to 5MB</p>
              
              <Button variant="secondary" className="mt-4 lg:mt-8 rounded-full h-10 lg:h-12 text-xs lg:text-sm px-6">
                Browse Files
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="p-4 lg:p-8 group">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:gap-6">
                <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl lg:rounded-3xl bg-blue-50 flex items-center justify-center text-primary relative border border-blue-100 flex-shrink-0">
                  <FileText className="w-8 h-8 lg:w-10 lg:h-10" />
                  <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1 shadow-lg">
                    <CheckCircle className="w-4 h-4 lg:w-5 lg:h-5" />
                  </div>
                </div>
                <div className="flex-1 min-w-0 w-full text-center sm:text-left">
                  <h3 className="text-base lg:text-xl font-bold text-slate-800 truncate mb-1">{file.name}</h3>
                  <p className="text-slate-400 text-xs lg:text-sm">{(file.size / (1024 * 1024)).toFixed(2)} MB • Ready for analysis</p>
                </div>
                <div className="flex items-center justify-center gap-2 w-full sm:w-auto">
                  <Button variant="ghost" size="sm" onClick={() => setIsPreviewOpen(true)} className="rounded-xl h-10">
                    <Eye className="w-4 h-4 lg:w-5 lg:h-5" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleRemove} className="rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50 h-10">
                    <Trash2 className="w-4 h-4 lg:w-5 lg:h-5" />
                  </Button>
                </div>
              </div>
              
              <div className="mt-6 lg:mt-10 flex flex-col sm:flex-row gap-3 lg:gap-4 w-full">
                <Button variant="outline" className="flex-1 h-12 lg:h-14 rounded-2xl w-full text-sm lg:text-base" onClick={handleRemove}>
                  Replace File
                </Button>
                <Button className="flex-1 h-12 lg:h-14 rounded-2xl w-full text-sm lg:text-base" onClick={handleDone}>
                  Analyze Resume
                </Button>
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
