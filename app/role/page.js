'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Briefcase, Sparkles, ChevronDown, Search, Check } from 'lucide-react';
import PageWrapper from '@/components/PageWrapper';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Chip from '@/components/ui/Chip';
import { setItem, getItem } from '@/lib/storage';
import { SKILLS_CATALOG } from '@/lib/skillsCatalog';

const ROLES = [
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Data Analyst',
  'QA Engineer',
  'UI/UX Designer Intern',
  'DevOps Intern',
  'Mobile Developer',
  'Security Researcher'
];

export default function RolePage() {
  const [role, setRole] = useState('');
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAiDerived, setIsAiDerived] = useState(false);
  
  // Autocomplete State
  const [suggestions, setSuggestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const router = useRouter();

  useEffect(() => {
    // Priority:
    // 1. Existing role confirmation object
    // 2. Freshly extracted AI suggested role
    // 3. Fallback (empty/manual selection)
    
    const confirmed = getItem('mockify_role');
    const aiRole = getItem('mockify_suggested_role');
    const aiSkills = getItem('mockify_candidate_skills');
    
    if (confirmed) {
      setRole(confirmed.role);
      setSkills(confirmed.skills || []);
      setIsAiDerived(true); 
    } else if (aiRole) {
      setRole(aiRole);
      setSkills(Array.isArray(aiSkills) ? aiSkills : []);
      setIsAiDerived(true);
    } else {
      setIsAiDerived(false);
      setRole(''); // Force manual selection
      setSkills([]);
    }
    
    setIsLoading(false);
  }, []);

  // Filter suggestions based on input
  useEffect(() => {
    if (newSkill.trim() === '') {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const filtered = SKILLS_CATALOG.filter(s => 
      s.toLowerCase().includes(newSkill.toLowerCase()) && 
      !skills.includes(s)
    ).slice(0, 10);

    setSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
    setActiveIndex(-1);
  }, [newSkill, skills]);

  const addSkill = (skillToTab) => {
    const skillToAdd = skillToTab || newSkill.trim();
    const validSkill = SKILLS_CATALOG.find(s => s.toLowerCase() === skillToAdd.toLowerCase());

    if (validSkill && !skills.includes(validSkill)) {
      setSkills(prev => [...prev, validSkill]);
      setNewSkill('');
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0) {
        addSkill(suggestions[activeIndex]);
      } else if (suggestions.length > 0) {
        addSkill(suggestions[0]);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const removeSkill = (skillToRemove) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleNext = () => {
    if (!role) return;
    setItem('mockify_role', { role, skills });
    setItem('mockify_candidate_skills', skills);
    router.push('/difficulty');
  };

  if (isLoading) return null;

  const canAdd = SKILLS_CATALOG.some(s => s.toLowerCase() === newSkill.trim().toLowerCase()) && !skills.includes(newSkill.trim());

  return (
    <PageWrapper className="max-w-3xl mx-auto px-4 py-20 w-full relative">
      <div className="space-y-10">
        <div className="text-center space-y-2 lg:space-y-3">
          {isAiDerived ? (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] lg:text-xs font-bold border border-amber-100 mb-1 lg:mb-2">
              <Sparkles className="w-3 h-3" /> AI SUGGESTION
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-50 text-slate-400 rounded-full text-[10px] lg:text-xs font-bold border border-slate-100 mb-1 lg:mb-2 uppercase tracking-widest">
              Manual Setup
            </div>
          )}
          <h1 className="text-2xl lg:text-4xl font-bold text-slate-800 tracking-tight">Confirm Your Role</h1>
          <p className="text-sm lg:text-lg text-slate-500">
            {isAiDerived 
              ? "We've identified this from your profile. Ensure your skills are accurate."
              : "We couldn’t detect your role. Please select manually."}
          </p>
        </div>

        <Card className="p-4 lg:p-8 space-y-6 lg:space-y-8 overflow-visible">
          {/* Role Selection */}
          <div className="space-y-3 lg:space-y-4">
            <label className="text-xs lg:text-sm font-bold text-slate-400 uppercase tracking-wider">Target Role</label>
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`w-full flex items-center justify-between p-3 lg:p-5 rounded-xl lg:rounded-2xl border transition-all group ${role ? 'bg-slate-50 border-slate-200 hover:border-primary' : 'bg-white border-dashed border-slate-300 hover:border-slate-400'}`}
              >
                <div className="flex items-center gap-3 lg:gap-4">
                  <div className={`p-2 lg:p-3 rounded-lg lg:rounded-xl shadow-sm border ${role ? 'bg-white border-slate-100 text-primary' : 'bg-slate-50 border-slate-100 text-slate-300'}`}>
                    <Briefcase className="w-4 h-4 lg:w-5 lg:h-5" />
                  </div>
                  <span className={`text-base lg:text-xl font-bold ${role ? 'text-slate-800' : 'text-slate-400'}`}>
                    {role || 'Select your role...'}
                  </span>
                </div>
                <ChevronDown className={`w-4 h-4 lg:w-5 lg:h-5 text-slate-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white/90 backdrop-blur-xl rounded-2xl border border-slate-100 shadow-2xl z-[70] max-h-[280px] overflow-y-auto"
                  >
                    <div className="py-2">
                      {ROLES.map((r) => (
                        <button
                          key={r}
                          onClick={() => { setRole(r); setIsDropdownOpen(false); }}
                          className={`w-full text-left px-6 py-4 text-sm lg:text-base hover:bg-blue-50 transition-colors ${role === r ? 'text-primary font-bold bg-blue-50/50' : 'text-slate-600'}`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Skills Management */}
          <div className="space-y-3 lg:space-y-4">
            <label className="text-xs lg:text-sm font-bold text-slate-400 uppercase tracking-wider">Technical Skills</label>
            
            <div className="flex flex-wrap gap-2 p-4 lg:p-6 bg-slate-50/30 rounded-xl lg:rounded-3xl border border-slate-100 min-h-[100px] lg:min-h-[140px] items-start content-start">
              <AnimatePresence>
                {skills.map((skill) => (
                  <motion.div
                    key={skill}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <Chip label={skill} onRemove={() => removeSkill(skill)} className="text-xs lg:text-sm bg-white/80 border-white" />
                  </motion.div>
                ))}
              </AnimatePresence>
              {skills.length === 0 && <p className="text-slate-300 text-sm italic">Add at least 3-5 skills for a better interview.</p>}
            </div>

            <div className="relative">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <Search className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search skills (e.g. Docker, React)..."
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                    className="w-full pl-11 pr-5 py-3 lg:py-4 text-sm lg:text-lg bg-white rounded-xl lg:rounded-2xl border border-slate-200 focus:border-primary focus:ring-8 focus:ring-primary/5 outline-none transition-all placeholder:text-slate-300"
                  />
                </div>
                <Button 
                  onClick={() => addSkill()}
                  variant={canAdd ? 'default' : 'secondary'}
                  className={`px-6 lg:px-8 rounded-xl lg:rounded-2xl h-auto transition-all ${!canAdd && 'opacity-50 grayscale'}`}
                  disabled={!canAdd}
                >
                  <Plus className="w-5 h-5 lg:w-6 lg:h-6" />
                </Button>
              </div>

              {/* Autocomplete Dropdown */}
              <AnimatePresence>
                {showSuggestions && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute bottom-full left-0 right-0 mb-3 bg-white/95 backdrop-blur-2xl rounded-2xl sm:rounded-3xl border border-white shadow-[0_-20px_50px_rgba(0,0,0,0.1)] z-[60] overflow-hidden"
                  >
                    <div className="max-h-64 overflow-y-auto p-2 scrollbar-hide">
                      {suggestions.map((s, idx) => (
                        <button
                          key={s}
                          onClick={() => addSkill(s)}
                          onMouseEnter={() => setActiveIndex(idx)}
                          className={`
                            w-full text-left px-4 py-3 rounded-xl lg:rounded-2xl flex items-center justify-between transition-all
                            ${idx === activeIndex ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]' : 'text-slate-600 hover:bg-slate-50'}
                          `}
                        >
                          <span className="font-bold text-sm lg:text-base">{s}</span>
                          {idx === activeIndex && <Check className="w-4 h-4" />}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <p className="text-[10px] lg:text-xs text-slate-400 mt-2 ml-1">Only skills from our validated catalog can be added.</p>
          </div>
        </Card>

        <div className="sticky bottom-0 z-[80] pt-4 pb-10 -mx-4 px-4 bg-gradient-to-t from-white via-white/90 to-transparent backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" className="flex-1 h-12 lg:h-14 rounded-full text-sm lg:text-base border-slate-200 bg-white/50" onClick={() => router.back()}>
              Back
            </Button>
            <Button className="flex-1 lg:flex-[2] h-12 lg:h-14 rounded-full text-sm lg:text-base shadow-lg shadow-primary/20" onClick={handleNext}>
              Confirm & Select Difficulty
            </Button>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
