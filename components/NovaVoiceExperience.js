'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, BookOpen, X, AlertTriangle } from 'lucide-react';
import SiriOrb from './SiriOrb';
import NovaTimer from './NovaTimer';
import Button from './ui/Button';
import { getItem, setItem } from '@/lib/storage';
import { clearUserSession } from '@/lib/cleanup';

const getDifficultyDuration = (difficulty) => {
  switch (difficulty) {
    case 'easy': return 20;
    case 'medium': return 30;
    case 'hard': return 50;
    case 'mix': return 60;
    default: return 30;
  }
};

export default function NovaVoiceExperience({ questions }) {
  const router = useRouter();
  
  // ── States ─────────────────────────────────────────────────────────────
  const [flowState, setFlowState] = useState('support_check');
  const [novaState, setNovaState] = useState('idle');
  const [lang, setLang] = useState('en-US');
  const [isSupported, setIsSupported] = useState(true);
  const [ttsUnlocked, setTtsUnlocked] = useState(false); // Mobile: requires user gesture
  
  const [showRules, setShowRules] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  // Storage
  const [userName, setUserName] = useState('there');
  const [difficulty, setDifficulty] = useState('medium');
  const [answers, setAnswers] = useState(Array(10).fill(''));
  
  // Refs
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);
  const currentTranscriptRef = useRef('');
  const voicesRef = useRef([]); // Pre-loaded voice list for mobile

  // ── Initialization ─────────────────────────────────────────────────────
  useEffect(() => {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!window.speechSynthesis || !SpeechRec) {
      setIsSupported(false);
      return;
    }
    
    synthRef.current = window.speechSynthesis;

    // Load voices — on mobile they load async via onvoiceschanged
    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices();
      if (v.length > 0) voicesRef.current = v;
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    
    const candidateName = getItem('mockify_candidate_name', 'there');
    const diff = getItem('mockify_difficulty', 'medium');
    setUserName(candidateName);
    setDifficulty(diff);
    
    // Do NOT auto-start greeting — wait for user tap (mobile TTS unlock)
    // setFlowState('greeting') is called from handleTtsUnlock instead
    
    return () => {
      if (synthRef.current) synthRef.current.cancel();
      if (window.speechSynthesis) window.speechSynthesis.onvoiceschanged = null;
      stopListening();
    };
  }, []);

  // ── Mobile TTS Unlock (required before any speak() on mobile) ──────────
  const handleTtsUnlock = () => {
    if (ttsUnlocked || !synthRef.current) return;
    // Fire a silent utterance to unlock the audio context with user gesture
    const silent = new SpeechSynthesisUtterance(' ');
    silent.volume = 0;
    silent.rate = 10;
    silent.onend = () => {
      setTtsUnlocked(true);
      setFlowState('greeting'); // Now safe to speak
    };
    silent.onerror = () => {
      // Even on error, try to proceed — some browsers fire error for silent
      setTtsUnlocked(true);
      setFlowState('greeting');
    };
    synthRef.current.speak(silent);
  };


  // ── Flow Engine ────────────────────────────────────────────────────────
  useEffect(() => {
    if (flowState === 'greeting') runGreeting();
    if (flowState === 'language') runLanguageSelection();
    if (flowState === 'rules') runRules();
    if (flowState === 'interview') runQuestionSequence();
    if (flowState === 'complete') runComplete();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flowState, currentQIndex]);

  // ── Core Speech Helpers ────────────────────────────────────────────────
  const speakText = (text, language, onComplete) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    
    const targetLang = language || lang;
    const targetLangMatch = targetLang === 'hi-IN' ? 'hi' : 'en';

    // Use pre-loaded voicesRef (avoids empty list on mobile)
    const voices = voicesRef.current.length > 0
      ? voicesRef.current
      : window.speechSynthesis.getVoices();
    let bestVoice = voices.find(v => v.lang.startsWith(targetLangMatch) && v.name.includes('Google'));
    if (!bestVoice) bestVoice = voices.find(v => v.lang.startsWith(targetLangMatch));
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = targetLang;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    if (bestVoice) utterance.voice = bestVoice;
    
    utterance.onstart = () => setNovaState('speaking');
    utterance.onend = () => {
      setNovaState('idle');
      if (onComplete) onComplete();
    };
    utterance.onerror = (e) => {
      console.error('Speech error:', e);
      setNovaState('idle');
      if (onComplete) onComplete();
    };
    
    // Mobile Chrome workaround: resume synthesis if it was interrupted
    if (synthRef.current.paused) synthRef.current.resume();
    synthRef.current.speak(utterance);
  };

  const handleStop = () => {
    setIsPaused(true);
    setTimerActive(false);
    if (synthRef.current) synthRef.current.cancel();
    stopListening();
  };

  const handleContinue = async () => {
    // Permission must be triggered by USER gesture
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
    } catch (err) {
      console.error("Mic permission denied:", err);
      return;
    }

    setIsPaused(false);
    if (flowState === 'interview') {
      // Do not start recognition if TTS is still speaking
      if (!synthRef.current?.speaking) {
        setTimerActive(true);
        startListening();
      }
    }
  };

  const getRecognitionLang = () => {
    // Force en-IN for all modes to maximize Hinglish and English command detection
    return 'en-IN';
  };

  const startListening = () => {
    // Allow listening in both 'language' and 'interview' states
    const canListen = flowState === 'interview' || flowState === 'language';
    if (isPaused || !canListen || synthRef.current?.speaking) return;
    
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) return;

    // Full cleanup of previous instance to avoid "zombie" restarts
    if (recognitionRef.current) {
      recognitionRef.current.onstart = null;
      recognitionRef.current.onerror = null;
      recognitionRef.current.onend = null;
      recognitionRef.current.onresult = null;
      try { recognitionRef.current.abort(); } catch(e){}
      recognitionRef.current = null;
    }

    const recognition = new SpeechRec();
    recognition.lang = getRecognitionLang();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => setNovaState('listening');
    
    recognition.onerror = (e) => {
      console.warn('Recognition error:', e.error);
      if (e.error === 'not-allowed') {
        setNovaState('idle');
      }
    };

    recognition.onend = () => {
      // Robust auto-restart if not paused and flow is appropriate
      const shouldBeListening = flowState === 'interview' || flowState === 'language';
      if (!isPaused && shouldBeListening && !synthRef.current?.speaking) {
        setTimeout(() => {
          try {
            if (recognitionRef.current === recognition) {
              recognition.start();
            }
          } catch(e) {
            console.warn("Restart failed", e);
          }
        }, 250);
      } else {
        setNovaState('idle');
      }
    };

    recognition.onresult = (event) => {
      let newFinals = '';
      let interim = '';
      
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          newFinals += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      
      currentTranscriptRef.current += newFinals.toLowerCase();
      const transcript = (currentTranscriptRef.current + interim).trim().toLowerCase();

      // Unified Phrase Detection (Bilingual)
      if (flowState === 'language') {
        if (transcript.includes('hindi')) {
          stopListening();
          setLang('hi-IN');
          setFlowState('rules');
          return;
        } else if (transcript.includes('english')) {
          stopListening();
          setLang('en-US');
          setFlowState('rules');
          return;
        }
      }

      if (flowState === 'interview') {
        const answerDonePhrases = [
          'answer done', 'i am done', "i'm done", "that's my answer", 'thats my answer', 
          'done', 'next question', 'next', 'answer complete', 'finished',
          'jawab ho gaya', 'ho gaya', 'mera jawab', 'bas itna hi', 'aage badho', 'next karo', 'bas', 'bas itna hi'
        ];
        const isAnswerDone = answerDonePhrases.some(phrase => transcript.includes(phrase));
        if (isAnswerDone) {
          handleAnswerDone();
        }
      }
    };

    recognitionRef.current = recognition;
    
    try {
      recognition.start();
    } catch (e) {
      console.warn("Recognition start failed", e);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.onstart = null;
      recognitionRef.current.onerror = null;
      recognitionRef.current.onend = null;
      recognitionRef.current.onresult = null;
      try { recognitionRef.current.abort(); } catch(e){}
      recognitionRef.current = null;
    }
    setNovaState('idle');
  };

  // ── State Handlers ─────────────────────────────────────────────────────

  // State 1: GREETING
  const runGreeting = () => {
    setNovaState('thinking');
    setTimeout(() => {
      speakText(`Hello ${userName}. I am Nova, your AI interviewer from Mockify AI. Welcome to your interview session.`, 'en-US', () => {
        setFlowState('language');
      });
    }, 1000);
  };

  // State 2: LANGUAGE SELECTION
  const runLanguageSelection = () => {
    setNovaState('thinking');
    setTimeout(() => {
      speakText('Would you like to continue in English or Hindi? Please say English or Hindi.', 'en-US', () => {
        setTimerActive(true);
        startListening();
      });
    }, 500);
  };

  // State 3: RULES
  const runRules = () => {
    setNovaState('thinking');
    setTimeout(() => {
      const text = lang === 'hi-IN' 
        ? "Theek hai. Shuru karne se pehle kuch rules hain. Pehla: Main aapse 10 sawaal puchunga. Doosra: Har sawaal ke liye ek time limit hogi. Teesra: Agar aap samay se pehle answer kar lo toh Answer Done bol dijiye. Chautha: Aapka score aur feedback interview ke baad dikhaya jayega. Kya aap taiyaar hain? Chaliye shuru karte hain."
        : "Great. Before we begin, here are the rules. First: I will ask you 10 questions. Second: Each question has a fixed time limit based on your selected difficulty. Third: If you finish your answer early, say Answer Done. Fourth: Your score and detailed feedback will be shown after the interview. Are you ready? Let's begin.";
      
      speakText(text, lang, () => {
        setFlowState('interview');
      });
    }, 1000);
  };

  // State 4: INTERVIEW LOOP
  const runQuestionSequence = () => {
    if (currentQIndex > 9) {
      setFlowState('complete');
      return;
    }

    setTimerActive(false);
    currentTranscriptRef.current = '';
    const qText = questions[currentQIndex]?.question || "Please describe your background.";
    
    setNovaState('thinking');
    
    setTimeout(() => {
      speakText(qText, lang, () => {
        // Once done speaking question, start timer and listening
        setTimerActive(true);
        startListening();
      });
    }, 1500);
  };

  const handleTimerComplete = () => {
    // Trigger Way B: Time Out Completion
    stopListening();
    setTimerActive(false);
    
    // Explicitly handle end of interview for timeout
    if (currentQIndex === 9) {
      saveAnswerAndNext();
      setFlowState('complete');
      return;
    }
    
    const timeoutText = lang === 'hi-IN'
      ? "Aapka samay khatam ho gaya. Main agla sawaal puchta hoon."
      : "Your time is up. Let's move to the next question.";
      
    speakText(timeoutText, lang, () => {
      saveAnswerAndNext();
    });
  };

  const saveAnswerAndNext = () => {
    const finalAnswer = currentTranscriptRef.current.replace(/answer done/gi, '').trim();
    const newAnswers = [...answers];
    newAnswers[currentQIndex] = finalAnswer;
    setAnswers(newAnswers);
    setItem('mockify_answers', newAnswers);
    
    if (currentQIndex >= 9) {
      setFlowState('complete');
    } else {
      setCurrentQIndex(prev => prev + 1);
    }
  };

  const handleAnswerDone = () => {
    stopListening();
    setTimerActive(false);

    // Save final transcript (excluding triggers) - Full Bilingual Cleanup
    const answerDonePhrases = [
      'answer done', 'i am done', "i'm done", "that's my answer", 'thats my answer', 'done', 'next question', 'next',
      'jawab ho gaya', 'ho gaya', 'mera jawab', 'bas itna hi', 'aage badho', 'next karo', 'bas'
    ];
    let finalAnswer = currentTranscriptRef.current;
    answerDonePhrases.forEach(p => {
      finalAnswer = finalAnswer.replace(new RegExp(p, 'gi'), '');
    });
    finalAnswer = finalAnswer.trim();

    const newAnswers = [...answers];
    newAnswers[currentQIndex] = finalAnswer;
    setAnswers(newAnswers);
    setItem('mockify_answers', newAnswers);

    // Redirect to complete if this is the last question
    if (currentQIndex >= 9) {
      setFlowState('complete');
      return;
    }

    const finishText = lang === 'hi-IN'
      ? "Theek hai, main agla sawaal puchta hoon."
      : "Okay, noted. Let me move to the next question.";
      
    speakText(finishText, lang, () => {
      setCurrentQIndex(prev => prev + 1);
    });
  };

  // State 5: COMPLETE
  const runComplete = () => {
    stopListening();
    setTimerActive(false);
    if (synthRef.current) synthRef.current.cancel();

    setNovaState('thinking');
    
    // Safety Fallback Redirect: guarantee navigation after 7 seconds max
    const fallbackTimer = setTimeout(() => {
      router.push('/result');
    }, 7000);

    setTimeout(() => {
      // Ensure all interview data is persisted for the results page
      setItem('mockify_answers', answers);
      setItem('mockify_questions', questions);
      const currentIds = questions.map(q => q.id);
      setItem('mockify_last_ids', currentIds);

      const finishText = lang === 'hi-IN'
        ? "Shabash. Aapne saare 10 sawaal complete kar liye hain. Aapke jawab record ho gaye hain. Ab aapko result page par bheja ja raha hai."
        : "Excellent. You have completed all 10 questions. Your responses have been recorded. Redirecting you to your results now.";

      speakText(finishText, lang, () => {
        clearTimeout(fallbackTimer);
        router.push('/result');
      });
    }, 800);
  };


  // ── Render Fallback ────────────────────────────────────────────────────
  if (!isSupported) {
    return (
      <PageWrapper className="flex items-center justify-center min-h-[85vh] px-4">
        <Card className="max-w-md w-full p-8 text-center space-y-6">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
          <h2 className="text-xl font-bold">Voice Mode Not Supported</h2>
          <p className="text-slate-500 text-sm">
            Voice mode is not supported in your browser. Please use Google Chrome or switch to Text Mode.
          </p>
          <Button className="w-full" onClick={() => router.push('/mode')}>
            Switch to Text Mode
          </Button>
        </Card>
      </PageWrapper>
    );
  }

  // ── Mobile TTS Gate: show Tap-to-Begin overlay until audio context is unlocked
  if (!ttsUnlocked) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-white via-indigo-50/30 to-pink-50/40 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="flex flex-col items-center gap-8 text-center max-w-sm"
        >
          <SiriOrb state="idle" />
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-800">Nova AI is Ready</h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              Tap the button below to start. Your browser requires a tap to enable voice.
            </p>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.03 }}
            onClick={handleTtsUnlock}
            className="w-full max-w-xs h-16 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold text-lg shadow-xl shadow-indigo-200 active:scale-95 transition-all"
          >
            Tap to Begin 🎙️
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────
  
  const getSubtext = () => {
    if (novaState === 'speaking') return 'Speaking...';
    if (novaState === 'listening') return 'Listening...';
    if (novaState === 'thinking') return 'Thinking...';
    if (flowState === 'support_check' || flowState === 'greeting') return `Hello ${userName}`;
    if (flowState === 'complete') return 'Interview Complete';
    return '';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-white via-indigo-50/30 to-pink-50/40 p-4 sm:p-8"
    >
      {/* Top Bar Navigation */}
      <div className="fixed top-4 sm:top-6 left-4 sm:left-6 z-50 pointer-events-auto">
        <button
          onClick={() => {
            handleStop();
            setShowExitModal(true);
          }}
          className="flex items-center justify-center w-12 h-12 rounded-full bg-white/90 backdrop-blur-xl border border-white shadow-xl transition-all hover:bg-white active:scale-95 group p-0 min-h-[44px] min-w-[44px]"
          aria-label="Go back"
        >
          <ArrowLeft 
            className="h-5 w-5 text-slate-800 shrink-0 transition-colors group-hover:text-black" 
            strokeWidth={2} 
          />
        </button>
      </div>

      <div className="absolute top-4 sm:top-6 right-4 sm:right-6 flex items-center justify-end z-10">
        <Button variant="ghost" className="rounded-full h-12 px-5 gap-2 text-indigo-600 hover:text-indigo-800 bg-white/50 backdrop-blur-sm shadow-sm" onClick={() => setShowRules(true)}>
          <BookOpen className="w-5 h-5" /> Rules
        </Button>
      </div>

      {/* Main Center Nova Orbital Experience */}
      <div className="flex-1 flex flex-col items-center justify-center space-y-8 sm:space-y-12 w-full max-w-2xl relative mt-16 sm:mt-10">
        
        <div className="flex flex-col items-center relative">
          <div className="h-6 mb-2 flex items-center justify-center">
            <AnimatePresence mode="wait">
              {flowState === 'interview' && (
                <motion.div
                  key={isPaused ? 'paused-hint' : 'running-hint'}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-sm italic text-slate-400 font-normal"
                >
                  {isPaused ? "Tap Nova to continue" : "Tap Nova to stop"}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.div 
            onClick={isPaused ? handleContinue : handleStop}
            whileTap={{ scale: 0.93 }}
            className="cursor-pointer"
          >
            <SiriOrb state={isPaused ? 'idle' : novaState} />
          </motion.div>
        </div>
        
        <AnimatePresence mode="wait">
          <motion.div 
            key={isPaused ? 'Paused' : getSubtext()}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-lg sm:text-2xl font-black text-slate-800 tracking-tight text-center px-4"
          >
            {isPaused ? 'Paused' : getSubtext()}
          </motion.div>
        </AnimatePresence>

        {/* Dynamic Display Region */}
        <div className="min-h-[8rem] sm:min-h-[10rem] h-auto w-full flex flex-col items-center justify-start text-center relative px-2">
          <AnimatePresence mode="wait">
            {flowState === 'interview' && (
              <motion.div
                key={`q-${currentQIndex}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-base sm:text-xl text-slate-700 font-medium leading-relaxed max-w-xl mx-auto"
              >
                {questions[currentQIndex]?.question}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom Area Timer */}
      <div className="h-32 flex items-end justify-center pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
        <AnimatePresence>
          {flowState === 'interview' && timerActive && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <NovaTimer 
                duration={getDifficultyDuration(difficulty)}
                isActive={timerActive && !isPaused}
                onComplete={handleTimerComplete}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Rules Modal */}
      <AnimatePresence>
        {showRules && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/20 backdrop-blur-md"
              onClick={() => setShowRules(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto bg-white/80 backdrop-blur-xl border border-white rounded-2xl sm:rounded-[2.5rem] shadow-2xl p-6 sm:p-10 space-y-6 sm:space-y-8"
            >
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-black text-slate-800">Interview Rules</h3>
                <p className="text-slate-500">Nova AI Voice Mode</p>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100">
                  <span className="font-bold text-indigo-500 mr-2">Rule 1:</span>
                  Nova AI will ask you 10 questions.
                </div>
                <div className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100">
                  <span className="font-bold text-pink-500 mr-2">Rule 2:</span>
                  Each question has a time limit based on your difficulty level. (Easy: 20s | Medium: 30s | Hard: 50s | Mix: 60s)
                </div>
                <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100">
                  <span className="font-bold text-amber-500 mr-2">Rule 3:</span>
                  If you complete your answer early, say <span className="font-bold">&ldquo;Answer Done&rdquo;</span>.
                </div>
                <div className="p-4 rounded-2xl bg-green-50/50 border border-green-100">
                  <span className="font-bold text-green-500 mr-2">Rule 4:</span>
                  Your score and detailed feedback will be shown after all questions.
                </div>
              </div>

              <div className="flex justify-center pt-2">
                <Button className="w-full h-14 rounded-2xl" onClick={() => setShowRules(false)}>
                  Got It
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Exit Modal */}
      <AnimatePresence>
        {showExitModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
              onClick={() => setShowExitModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-sm max-h-[92vh] overflow-y-auto bg-white/90 backdrop-blur-xl border border-white rounded-2xl sm:rounded-[2.5rem] shadow-2xl p-6 sm:p-8 space-y-6 sm:space-y-8 text-center"
            >
              <div className="space-y-2">
                <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
                <h3 className="text-2xl font-black text-slate-800">Exit Nova AI Mode?</h3>
                <p className="text-sm text-slate-500">Are you sure you want to exit? Your progress for the current sequence will be paused.</p>
              </div>
              
              <div className="space-y-3 pt-2">
                <Button 
                  className="w-full h-14 rounded-2xl bg-rose-500 hover:bg-rose-600 border-none shadow-lg shadow-rose-500/30 text-white" 
                  onClick={() => {
                    clearUserSession();
                    router.push('/mode');
                  }}
                >
                  Yes, Exit
                </Button>
                <Button 
                  variant="ghost"
                  className="w-full h-14 rounded-2xl text-slate-500 hover:text-slate-800 hover:bg-slate-100" 
                  onClick={() => setShowExitModal(false)}
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
