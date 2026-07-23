import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight, ChevronLeft, Sparkles, X,
  BookOpen, Brain, Users, Trophy, LayoutDashboard, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { apiClient } from '@/lib/api-client';

// ── Tour steps (4 quick slides) ────────────────────────────────────────────
const STEPS = [
  {
    id: 'welcome',
    icon: Sparkles,
    color: 'from-violet-500 to-indigo-600',
    title: 'Welcome to FunFinity! 🎉',
    description:
      "You've set up your Learning DNA. Let's take a 30-second tour of the key features so you know exactly where everything lives.",
    visual: (
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: BookOpen, label: 'Courses' },
          { icon: Brain, label: 'AI Tutor' },
          { icon: Users, label: 'Community' },
        ].map(({ icon: Icon, label }) => (
          <div key={label} className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white/10">
            <Icon className="w-7 h-7 text-white" />
            <span className="text-xs font-semibold text-white/80">{label}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'navigate',
    icon: LayoutDashboard,
    color: 'from-cyan-500 to-blue-600',
    title: 'Navigation Sidebar',
    description:
      'Everything lives in the left sidebar — Courses, Discussions, Notes, Live Classes, and your Profile. Tap any icon to jump straight there.',
    visual: (
      <div className="flex gap-3 items-start">
        {/* Fake mini-sidebar */}
        <div className="flex flex-col gap-2 p-3 rounded-2xl bg-white/10 min-w-[56px] items-center">
          {[BookOpen, Users, Brain, Trophy, LayoutDashboard].map((Icon, i) => (
            <div key={i} className={`w-8 h-8 rounded-xl flex items-center justify-center ${i === 0 ? 'bg-white/30' : 'bg-white/10'}`}>
              <Icon className="w-4 h-4 text-white" />
            </div>
          ))}
        </div>
        <div className="flex-1 space-y-2">
          {['Dashboard', 'Courses', 'AI Tutor', 'Community', 'Progress'].map((item, i) => (
            <div key={item} className={`h-8 rounded-xl flex items-center px-3 ${i === 0 ? 'bg-white/25' : 'bg-white/10'}`}>
              <span className="text-xs font-medium text-white/80">{item}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'learn',
    icon: Brain,
    color: 'from-emerald-500 to-teal-600',
    title: 'AI-Powered Learning',
    description:
      'Your AI Tutor adapts to your Learning DNA — asking questions, explaining concepts at your level, and tracking your progress automatically.',
    visual: (
      <div className="space-y-2">
        {[
          { from: true,  text: 'Can you explain photosynthesis?' },
          { from: false, text: 'Sure! Think of leaves as tiny solar panels that convert sunlight into food…' },
        ].map(({ from, text }, i) => (
          <div key={i} className={`flex ${from ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${from ? 'bg-white/30 text-white' : 'bg-white/15 text-white/80'}`}>
              {!from && <Brain className="w-3 h-3 inline mr-1 mb-0.5 text-emerald-200" />}
              {text}
            </div>
          </div>
        ))}
        <div className="flex items-center gap-2 mt-2 bg-white/10 rounded-xl px-3 py-2">
          <Zap className="w-3 h-3 text-emerald-300" />
          <span className="text-[10px] text-white/60">Personalised to your Learning DNA</span>
        </div>
      </div>
    ),
  },
  {
    id: 'ready',
    icon: Trophy,
    color: 'from-amber-500 to-orange-600',
    title: "You're All Set! 🚀",
    description:
      "That's the essentials covered. Explore at your own pace — every feature is designed around your unique learning style. Let's go!",
    visual: (
      <div className="flex flex-col items-center gap-3">
        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center"
        >
          <Trophy className="w-10 h-10 text-white" />
        </motion.div>
        <div className="flex gap-2">
          {['🧠', '🎯', '🚀', '⭐', '🏆'].map((e, i) => (
            <motion.span
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1 * i, type: 'spring' }}
              className="text-2xl"
            >
              {e}
            </motion.span>
          ))}
        </div>
      </div>
    ),
  },
];

// ── Component ──────────────────────────────────────────────────────────────
export function FirstTimeTour({ onComplete }: { onComplete: () => void }) {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [finishing, setFinishing] = useState(false);

  const current = STEPS[step];
  const Icon = current.icon;
  const isLast = step === STEPS.length - 1;

  const finish = async () => {
    if (finishing) return;
    setFinishing(true);
    onComplete();
  };

  const next = () => (isLast ? finish() : setStep(s => s + 1));
  const prev = () => setStep(s => Math.max(0, s - 1));

  return (
    /* ── Full-screen dark backdrop ── */
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(8px)' }}>

      {/* ── Tour card ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16, scale: 0.97 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
          className="w-full max-w-md relative"
        >
          {/* Card shell */}
          <div className="rounded-3xl overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.8)] border border-white/10">

            {/* Gradient header */}
            <div className={`bg-gradient-to-br ${current.color} p-7 space-y-5`}>
              {/* Top row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold tracking-widest text-white/60 uppercase">
                      Step {step + 1} of {STEPS.length}
                    </p>
                    <h2 className="font-bold text-white text-lg leading-tight">{current.title}</h2>
                  </div>
                </div>
                {/* Skip / close */}
                <button
                  onClick={finish}
                  className="w-8 h-8 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
                  aria-label="Skip tour"
                >
                  <X className="w-4 h-4 text-white/80" />
                </button>
              </div>

              {/* Visual preview */}
              <div className="rounded-2xl bg-black/20 backdrop-blur-md p-4">
                {current.visual}
              </div>
            </div>

            {/* White/glass bottom section */}
            <div className="bg-background/95 backdrop-blur-xl p-5 space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {current.description}
              </p>

              {/* Progress dots */}
              <div className="flex items-center justify-center gap-1.5">
                {STEPS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setStep(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === step ? 'w-7 bg-primary' : i < step ? 'w-2 bg-primary/35' : 'w-2 bg-secondary'
                    }`}
                    aria-label={`Go to step ${i + 1}`}
                  />
                ))}
              </div>

              {/* Nav buttons */}
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prev}
                  disabled={step === 0}
                  className="rounded-xl flex-1 h-10 border-border/40 disabled:opacity-30"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>

                <Button
                  size="sm"
                  onClick={next}
                  disabled={finishing}
                  className="rounded-xl flex-[2] h-10 font-semibold group bg-primary hover:bg-primary/90"
                >
                  {finishing
                    ? 'Opening...'
                    : isLast
                    ? 'Start Exploring 🚀'
                    : 'Next'}
                  {!isLast && !finishing && (
                    <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
                  )}
                </Button>
              </div>

              {/* Fast skip link */}
              {!isLast && (
                <button
                  onClick={finish}
                  className="w-full text-center text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors py-1"
                >
                  Skip tour entirely
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ── Hook to check if user needs to complete tour ───────────────────────────
export function useTourRequired() {
  const { user } = useAuth();
  const [isRequired, setIsRequired] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Run once when user is available
  const check = async (uid: string) => {
    try {
      // localStorage first (no API needed)
      const lsKey = `funfinity_onboarding_${uid}`;
      const cached = JSON.parse(localStorage.getItem(lsKey) || '{}');
      if ('dna_complete' in cached) {
        setIsRequired(!!cached.dna_complete && !cached.has_completed_tour);
        setIsLoading(false);
        return;
      }
      // Fallback: API
      const data = await apiClient.get<any | null>(`/api/users/${uid}/profile`);
      setIsRequired(!!data?.dna_complete && !data?.has_completed_tour);
    } catch {
      // no-op
    } finally {
      setIsLoading(false);
    }
  };

  // useEffect replacement — fire once
  useState(() => { if (user) check(user.id); });

  return { isRequired, isLoading };
}
