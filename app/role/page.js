'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Briefcase, Sparkles, ChevronDown } from 'lucide-react';
import PageWrapper from '@/components/PageWrapper';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Chip from '@/components/ui/Chip';
import { setItem, getItem } from '@/lib/storage';

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

const DEFAULT_SKILLS = ['React', 'JavaScript', 'Tailwind CSS', 'Next.js', 'Problem Solving'];

export default function RolePage() {
  const [role, setRole] = useState(ROLES[0]);
  const [skills, setSkills] = useState(DEFAULT_SKILLS);
  const [newSkill, setNewSkill] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const saved = getItem('mockify_role');
    if (saved) {
      setRole(saved.role);
      setSkills(saved.skills);
    }
  }, []);

  const addSkill = (e) => {
    e.preventDefault();
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleNext = () => {
    setItem('mockify_role', { role, skills });
    router.push('/difficulty');
  };

  return (
    <PageWrapper className="max-w-3xl mx-auto px-4 py-20 w-full">
      <div className="space-y-10">
        <div className="text-center space-y-2 lg:space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] lg:text-xs font-bold border border-amber-100 mb-1 lg:mb-2">
            <Sparkles className="w-3 h-3" /> AI SUGGESTION
          </div>
          <h1 className="text-2xl lg:text-4xl font-bold text-slate-800 tracking-tight">Confirm Your Role</h1>
          <p className="text-sm lg:text-lg text-slate-500">
            We've identified this role from your resume. Feel free to adjust it.
          </p>
        </div>

        <Card className="p-4 lg:p-8 space-y-6 lg:space-y-8">
          {/* Role Selection */}
          <div className="space-y-3 lg:space-y-4">
            <label className="text-xs lg:text-sm font-bold text-slate-400 uppercase tracking-wider">Target Role</label>
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full flex items-center justify-between p-3 lg:p-5 bg-slate-50 rounded-xl lg:rounded-2xl border border-slate-200 text-left hover:border-primary transition-all group"
              >
                <div className="flex items-center gap-3 lg:gap-4">
                  <div className="p-2 lg:p-3 bg-white rounded-lg lg:rounded-xl shadow-sm border border-slate-100 text-primary">
                    <Briefcase className="w-4 h-4 lg:w-5 lg:h-5" />
                  </div>
                  <span className="text-base lg:text-xl font-bold text-slate-800">{role}</span>
                </div>
                <ChevronDown className={`w-4 h-4 lg:w-5 lg:h-5 text-slate-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    style={{ overflow: 'hidden' }}
                    className="relative bg-white rounded-xl lg:rounded-2xl border border-slate-100 shadow-xl z-10"
                  >
                    <div className="py-1 lg:py-2">
                      {ROLES.map((r) => (
                        <button
                          key={r}
                          onClick={() => { setRole(r); setIsDropdownOpen(false); }}
                          className={`w-full text-left px-4 lg:px-6 py-2 lg:py-4 text-sm lg:text-base hover:bg-slate-50 transition-colors ${role === r ? 'text-primary font-bold bg-blue-50/50' : 'text-slate-600'}`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <p className="text-[10px] lg:text-xs text-slate-400 mt-2 ml-1 italic">If this role feels incorrect, choose manually from the list.</p>
            </div>
          </div>

          {/* Skills Management */}
          <div className="space-y-3 lg:space-y-4">
            <label className="text-xs lg:text-sm font-bold text-slate-400 uppercase tracking-wider">Skills for Interview</label>
            <div className="flex flex-wrap gap-2 p-4 lg:p-6 bg-slate-50/50 rounded-xl lg:rounded-2xl border border-slate-100 min-h-[80px] lg:min-h-[120px]">
              {skills.map((skill) => (
                <Chip key={skill} label={skill} onRemove={() => removeSkill(skill)} className="text-xs lg:text-sm" />
              ))}
              {skills.length === 0 && <p className="text-slate-300 text-xs lg:text-sm italic">No skills added yet...</p>}
            </div>

            <form onSubmit={addSkill} className="flex gap-2">
              <input
                type="text"
                placeholder="Add a new skill (e.g. Docker)..."
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                className="flex-1 px-4 lg:px-5 py-2 lg:py-3 text-sm lg:text-base bg-white rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all"
              />
              <Button type="submit" variant="secondary" className="px-4 lg:px-5 rounded-xl h-auto">
                <Plus className="w-4 h-4 lg:w-5 lg:h-5" />
              </Button>
            </form>
          </div>
        </Card>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button variant="outline" className="flex-1 h-12 lg:h-14 rounded-full text-sm lg:text-base" onClick={() => router.back()}>
            Back
          </Button>
          <Button className="flex-1 lg:flex-[2] h-12 lg:h-14 rounded-full text-sm lg:text-base" onClick={handleNext}>
            Confirm & Select Difficulty
          </Button>
        </div>
      </div>
    </PageWrapper>
  );
}
