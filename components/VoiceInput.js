'use client';
import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, AlertCircle } from 'lucide-react';
import Button from './ui/Button';

export default function VoiceInput({ onTranscript, className = '' }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let currentTranscript = '';
      for (let i = 0; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript;
      }
      setTranscript(currentTranscript);
      onTranscript(currentTranscript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, [onTranscript]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setTranscript('');
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  if (!isSupported) {
    return (
      <div className="p-6 rounded-2xl bg-red-50 border border-red-100 text-red-700 flex flex-col items-center gap-4 text-center">
        <AlertCircle className="w-10 h-10 opacity-50" />
        <div>
          <p className="font-bold">Voice Mode Not Supported</p>
          <p className="text-sm opacity-80">Your browser doesn't support the Web Speech API. Please switch to Text Mode.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center gap-6 ${className}`}>
      <div className="relative">
        {isListening && (
          <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping scale-150" />
        )}
        <Button
          onClick={toggleListening}
          variant={isListening ? 'danger' : 'primary'}
          className="w-20 h-20 rounded-full shadow-lg relative z-10"
        >
          {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
        </Button>
      </div>

      <div className="w-full max-w-2xl bg-slate-50 min-h-[150px] p-6 rounded-2xl border border-slate-100 relative group transition-all hover:border-slate-200">
        <div className="absolute top-4 right-4 text-[10px] font-bold text-slate-300 uppercase tracking-widest">Live Transcript</div>
        <p className={`text-lg leading-relaxed ${transcript ? 'text-slate-700' : 'text-slate-400 italic'}`}>
          {transcript || (isListening ? 'Listening...' : 'Click the mic to start speaking your answer...')}
        </p>
      </div>
    </div>
  );
}
