import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Check, ChevronRight, Brain, Target, BookOpen, Users, Zap, Eye, Sparkles, Dna, MessageSquare, Send, X, Bot, Lightbulb, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLearningDNA, generateRecommendations, LearningDNAProfile } from "@/hooks/use-learning-dna";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAIReactions } from "@/components/ReactionSystem";
import { FirstTimeTour } from "@/components/onboarding/FirstTimeTour";
import SupportChatWidget from "@/components/support-chat/SupportChatWidget";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/lib/supabase";
import { DNASkeleton } from "@/components/skeletons/DNASkeleton";

// Stable Unsplash images — always visible on any network
const IMG = {
  needs: "",
  style: "",
  focus: "",
  subjects: "",
  goals: "",
  comfort: "",
  done: "",
};

const STEPS = [
  { id: "needs", title: "Learning Differences", subtitle: "Select everything that applies — this stays private and is only used to personalise your experience.", img: IMG.needs, icon: Brain },
  { id: "style", title: "How You Learn Best", subtitle: "Understanding your learning style helps us deliver content in the most effective format for you.", img: IMG.style, icon: BookOpen },
  { id: "focus", title: "Focus & Energy", subtitle: "Tell us about your concentration patterns so we can structure sessions around your natural rhythm.", img: IMG.focus, icon: Zap },
  { id: "subjects", title: "Your Interests", subtitle: "Pick every subject or topic you are curious about — you can always add more later.", img: IMG.subjects, icon: Target },
  { id: "goals", title: "Your Goals", subtitle: "What do you want to achieve? Select all that resonate with you.", img: IMG.goals, icon: Sparkles },
  { id: "comfort", title: "Comfort & Accessibility", subtitle: "Customise how content looks and feels to reduce strain and improve clarity.", img: IMG.comfort, icon: Eye },
  { id: "review", title: "Your Learning DNA", subtitle: "Here is your personalised profile. Every recommendation is built on your answers.", img: IMG.done, icon: Users },
];

// ── Multi-select data ──────────────────────────────────────────────────────
const NEEDS_OPTIONS = [
  { key: "has_adhd", label: "ADHD / Attention Difficulties", desc: "Trouble sustaining focus, impulsivity, hyperactivity" },
  { key: "has_dyslexia", label: "Dyslexia", desc: "Reading, spelling, or word-processing challenges" },
  { key: "has_anxiety", label: "Learning or Test Anxiety", desc: "Performance pressure, worry, or test-related stress" },
  { key: "has_dyscalculia", label: "Dyscalculia", desc: "Difficulty with numbers, sequences, or math concepts" },
  { key: "has_asd", label: "Autism Spectrum", desc: "Sensory sensitivity, routine preference, social focus" },
  { key: "_none", label: "None of the above", desc: "I prefer standard learning without adjustments" },
];

const STYLE_OPTIONS = [
  { key: "style_visual", label: "Visual Learner", desc: "I learn best from diagrams, charts, videos, and images" },
  { key: "style_reading", label: "Reading & Writing", desc: "I prefer text-heavy content, notes, and written summaries" },
  { key: "style_auditory", label: "Auditory Learner", desc: "Listening to explanations and discussions works best for me" },
  { key: "style_kinesthetic", label: "Hands-On / Practice", desc: "I retain information by doing, building, and experimenting" },
  { key: "style_social", label: "Collaborative", desc: "I thrive in group work, peer discussions, and team projects" },
  { key: "style_solo", label: "Independent Study", desc: "I focus best when working alone at my own pace" },
];

const FOCUS_MODES = [
  { value: "deep", label: "Deep Focus", desc: "Extended, immersive sessions of 45+ minutes with full concentration" },
  { value: "burst", label: "Burst Mode", desc: "Short, intense sprints of 10–15 minutes with frequent resets" },
  { value: "steady", label: "Steady Flow", desc: "Consistent, moderate sessions of 25–30 minutes — the Pomodoro zone" },
  { value: "flex", label: "Flexible", desc: "My focus varies daily — I need an adaptive schedule" },
];

const SESSION_LENGTHS = [
  { value: "short", label: "Short", desc: "10–15 minutes" },
  { value: "medium", label: "Medium", desc: "20–30 minutes" },
  { value: "long", label: "Long", desc: "45–60 minutes" },
  { value: "varied", label: "Varied", desc: "Depends on the day" },
];

const BREAK_FREQS = [
  { value: "frequent", label: "Every 10–15 min", desc: "Many short resets keep me sharp" },
  { value: "normal", label: "Every 25–30 min", desc: "Standard Pomodoro rhythm" },
  { value: "rare", label: "Every 45–60 min", desc: "I can sustain long stretches easily" },
];

const SUBJECT_OPTIONS = [
  { key: "sub_math", label: "Mathematics", desc: "Algebra, calculus, statistics, logic" },
  { key: "sub_science", label: "Science", desc: "Physics, chemistry, biology, earth sciences" },
  { key: "sub_coding", label: "Coding & Tech", desc: "Programming, web dev, AI, data science" },
  { key: "sub_languages", label: "Languages & Literacy", desc: "Reading, writing, grammar, foreign languages" },
  { key: "sub_arts", label: "Arts & Creativity", desc: "Visual arts, music, design, storytelling" },
  { key: "sub_history", label: "History & Social", desc: "History, civics, economics, geography" },
  { key: "sub_health", label: "Health & Wellness", desc: "Physical education, nutrition, mental health" },
  { key: "sub_business", label: "Business & Finance", desc: "Entrepreneurship, marketing, accounting" },
];

const GOAL_OPTIONS = [
  { key: "goal_grades", label: "Improve Academic Grades", desc: "Score higher on exams and coursework" },
  { key: "goal_career", label: "Career Preparation", desc: "Build skills for my future profession" },
  { key: "goal_skills", label: "Learn Practical Skills", desc: "Gain hands-on abilities I can use now" },
  { key: "goal_explore", label: "Explore New Subjects", desc: "Broaden my knowledge across domains" },
  { key: "goal_cert", label: "Earn Certifications", desc: "Complete recognised courses and badges" },
  { key: "goal_compete", label: "Competitive Excellence", desc: "Prepare for olympiads and competitions" },
  { key: "goal_wellbeing", label: "Support Learning Wellbeing", desc: "Reduce stress and build healthy habits" },
];

const FONT_OPTIONS = [
  { value: "default", label: "Standard", sample: "The quick brown fox", font: "font-sans" },
  { value: "serif", label: "Serif", sample: "The quick brown fox", font: "font-serif" },
  { value: "dyslexic", label: "OpenDyslexic", sample: "The quick brown fox", font: "font-mono" },
];

const COLOR_OVERLAYS = [
  { value: "none", label: "None", cls: "bg-card border-border" },
  { value: "warm", label: "Warm", cls: "bg-amber-100 dark:bg-amber-900/30" },
  { value: "cool", label: "Cool", cls: "bg-blue-100 dark:bg-blue-900/30" },
  { value: "green", label: "Green", cls: "bg-emerald-100 dark:bg-emerald-900/30" },
  { value: "rose", label: "Rose", cls: "bg-rose-100 dark:bg-rose-900/30" },
];

// ── Helper components ──────────────────────────────────────────────────────
function MultiCard({ label, desc, active, onClick, className }: { label: string; desc: string; active: boolean; onClick: () => void; className?: string }) {
  return (
    <button
      onClick={(e) => { e.preventDefault(); onClick(); }}
      className={cn(
        "w-full flex items-start gap-4 p-5 rounded-2xl border text-left transition-all duration-300",
        active
          ? "border-primary bg-primary/15 shadow-glow-cyan"
          : "border-border/40 bg-card/40 backdrop-blur-md hover:border-primary/40 hover:bg-secondary/40",
        className
      )}
    >
      <div className={cn("mt-1 w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all duration-500",
        active ? "border-primary bg-primary text-primary-foreground" : "border-border/60"
      )}>
        {active && <Check className="w-4 h-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm text-foreground leading-tight">{label}</p>
        <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{desc}</p>
      </div>
    </button>
  );
}

function SingleCard({ label, desc, active, onClick }: { label: string; desc: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={(e) => { e.preventDefault(); onClick(); }}
      className={cn(
        "w-full p-5 rounded-2xl border text-left transition-all duration-300",
        active
          ? "border-primary bg-primary/15 shadow-glow-cyan"
          : "border-border/40 bg-card/40 backdrop-blur-sm hover:border-primary/40 hover:bg-secondary/40"
      )}
    >
      <p className="font-bold text-sm text-foreground">{label}</p>
      <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{desc}</p>
    </button>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <h3 className="text-sm font-bold text-foreground tracking-wide uppercase mb-3">{children}</h3>;
}

// ── Profile Display Component ─────────────────────────────────────────────────
function LearningDNAProfileDisplay({ profile, navigate }: { profile: LearningDNAProfile; navigate: any }) {
  const strategies = generateRecommendations(profile);
  const [supportChatOpen, setSupportChatOpen] = useState(false);
  const [supportMessages, setSupportMessages] = useState<{ role: 'user' | 'support'; content: string; timestamp: number }[]>([]);
  const [supportInput, setSupportInput] = useState('');
  const [supportLoading, setSupportLoading] = useState(false);
  const [systemPlan, setSystemPlan] = useState<any>(null);
  const [planLoading, setPlanLoading] = useState(false);

  // Fetch system suggested plan on mount
  useEffect(() => {
    const fetchSystemPlan = async () => {
      setPlanLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('system_suggested_plans')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (data && !error) {
          setSystemPlan(data);
        }
      } catch (error) {
        console.error('Failed to fetch system plan:', error);
      } finally {
        setPlanLoading(false);
      }
    };

    fetchSystemPlan();
  }, []);

  // Initialize support chat with welcome message
  useEffect(() => {
    setSupportMessages([{
      role: 'support',
      content: '👋 Welcome to FunFinity Academy Support!\n\nI\'m here to help you with:\n• Account and profile issues\n• Course enrollment and access\n• Learning DNA questions\n• Technical support\n• General inquiries\n\nHow can I assist you today?',
      timestamp: Date.now()
    }]);
  }, []);

  const handleSupportSend = async () => {
    if (!supportInput.trim()) return;
    
    const userMessage = { role: 'user' as const, content: supportInput, timestamp: Date.now() };
    setSupportMessages(prev => [...prev, userMessage]);
    setSupportInput('');
    setSupportLoading(true);

    // Simulate support response
    setTimeout(() => {
      let response = '';
      const lowerInput = userMessage.content.toLowerCase();
      
      if (lowerInput.includes('account') || lowerInput.includes('login') || lowerInput.includes('password')) {
        response = '🔐 **Account Support**\n\nFor account-related issues:\n• Password reset: Use the "Forgot Password" link on the login page\n• Email verification: Check your spam folder for verification emails\n• Profile updates: Go to Settings > Profile to update your information\n\nIf you\'re still having trouble, please provide your email address and I\'ll escalate this to our technical team.';
      } else if (lowerInput.includes('course') || lowerInput.includes('enroll') || lowerInput.includes('access')) {
        response = '📚 **Course Support**\n\nFor course-related questions:\n• Enrollment: Go to Courses page and click "Enroll" on any course\n• Access issues: Clear your browser cache and try again\n• Progress tracking: Check My Learning page for your course progress\n• Certificates: Available upon course completion\n\nNeed help with a specific course? Let me know which one!';
      } else if (lowerInput.includes('learning dna') || lowerInput.includes('profile') || lowerInput.includes('assessment')) {
        response = '🧬 **Learning DNA Support**\n\nYour Learning DNA profile helps personalize your learning experience:\n• It was completed during your initial signup\n• You can view it on the Learning DNA page\n• It influences course recommendations and study tips\n• Admins can generate personalized learning plans based on it\n\nWant to update your Learning DNA? Contact an admin for assistance.';
      } else if (lowerInput.includes('technical') || lowerInput.includes('bug') || lowerInput.includes('error')) {
        response = '🔧 **Technical Support**\n\nFor technical issues:\n• Clear your browser cache and cookies\n• Try using a different browser (Chrome, Firefox, Safari)\n• Check your internet connection\n• Disable browser extensions temporarily\n\nIf the issue persists, please describe:\n1. What you were trying to do\n2. What error message you received\n3. Which browser/device you\'re using\n\nThis will help me assist you faster!';
      } else if (lowerInput.includes('help') || lowerInput.includes('assist') || lowerInput.includes('question')) {
        response = '❓ **How Can I Help?**\n\nI can assist you with:\n• 📱 Account and login issues\n• 📚 Course enrollment and access\n• 🧬 Learning DNA questions\n• 🔧 Technical problems\n• 💳 Payment and billing\n• 🎓 Certificates and progress\n\nPlease let me know what you need help with, and I\'ll do my best to assist you!';
      } else {
        response = `Thank you for your message: "${userMessage.content}"\n\nI've received your inquiry and a support specialist will review it shortly. For immediate assistance with common issues, try asking about:\n• Account access\n• Course enrollment\n• Technical problems\n• Learning DNA\n\nIs there anything specific I can help you with right now?`;
      }

      setSupportMessages(prev => [...prev, { role: 'support', content: response, timestamp: Date.now() }]);
      setSupportLoading(false);
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-primary/20 shadow-lg">
            <Dna className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground tracking-tight">
              <span className="text-gradient-brand">Your Learning DNA</span>
            </h1>
            <p className="text-muted-foreground">Personalized learning profile powered by AI</p>
          </div>
        </div>
        
        <div className="glass-card p-6 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
          <p className="text-sm text-foreground leading-relaxed">
            Your Learning DNA assessment was completed during signup. This profile is used to personalize your learning experience, 
            recommend content, and optimize your study sessions. The data below is saved and used throughout the platform.
          </p>
        </div>
      </motion.div>

      {/* Support Chat Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-8 rounded-3xl border border-primary/20 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-foreground">Support Chat</h2>
              <p className="text-sm text-muted-foreground">Get help from our support team</p>
            </div>
          </div>
          <Button onClick={() => setSupportChatOpen(!supportChatOpen)} variant={supportChatOpen ? "outline" : "hero"} size="sm">
            {supportChatOpen ? <X className="w-4 h-4 mr-2" /> : <MessageSquare className="w-4 h-4 mr-2" />}
            {supportChatOpen ? 'Close Chat' : 'Open Chat'}
          </Button>
        </div>

        {supportChatOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4">
            <div className="h-80 rounded-2xl bg-black/5 border border-white/10 overflow-hidden">
              <ScrollArea className="h-full p-4">
                <div className="space-y-4">
                  {supportMessages.map((msg, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] p-4 rounded-2xl ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-white/10 border border-white/20'
                      }`}>
                        <p className="text-sm leading-relaxed whitespace-pre-line">{msg.content}</p>
                      </div>
                    </motion.div>
                  ))}
                  {supportLoading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                      <div className="bg-white/10 border border-white/20 p-4 rounded-2xl">
                        <div className="flex gap-2">
                          {[0, 1, 2].map(i => (
                            <motion.div
                              key={i}
                              animate={{ y: [0, -5, 0] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                              className="w-2 h-2 bg-primary/60 rounded-full"
                            />
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </ScrollArea>
            </div>
            <div className="flex gap-2">
              <Input
                value={supportInput}
                onChange={(e) => setSupportInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSupportSend()}
                placeholder="Type your message to support..."
                className="flex-1 bg-white/5 border-white/10"
                disabled={supportLoading}
              />
              <Button onClick={handleSupportSend} disabled={supportLoading || !supportInput.trim()} size="icon">
                {supportLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </motion.div>
        )}
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
            <p className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">Learning Style</p>
            <p className="text-lg font-bold text-foreground capitalize">{(profile as any).learning_style || 'Mixed'}</p>
            <p className="text-xs text-muted-foreground">Primary learning preference</p>
          </div>
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
            <p className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">Focus Mode</p>
            <p className="text-lg font-bold text-foreground capitalize">{(profile as any).focus_mode || 'Flexible'}</p>
            <p className="text-xs text-muted-foreground">Optimal concentration pattern</p>
          </div>
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
            <p className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">Session Length</p>
            <p className="text-lg font-bold text-foreground capitalize">{(profile as any).session_length || 'Medium'}</p>
            <p className="text-xs text-muted-foreground">Ideal study duration</p>
          </div>
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
            <p className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">Break Frequency</p>
            <p className="text-lg font-bold text-foreground capitalize">{(profile as any).break_frequency || 'Normal'}</p>
            <p className="text-xs text-muted-foreground">Recommended break interval</p>
          </div>
        </div>
      </motion.div>

      {/* Learning Profile Type */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-8 rounded-3xl border border-white/10 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
            <Target className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-foreground">Learning Profile Type</h2>
            <p className="text-sm text-muted-foreground">Your personalized learning archetype</p>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-4">
          {(profile as any).style_visual && (
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-center gap-3">
              <Eye className="w-5 h-5 text-primary/70" />
              <span className="text-sm font-bold text-foreground">Visual Learner</span>
            </div>
          )}
          {(profile as any).style_reading && (
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-primary/70" />
              <span className="text-sm font-bold text-foreground">Reading & Writing</span>
            </div>
          )}
          {(profile as any).style_auditory && (
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-center gap-3">
              <Users className="w-5 h-5 text-primary/70" />
              <span className="text-sm font-bold text-foreground">Auditory Learner</span>
            </div>
          )}
          {(profile as any).style_kinesthetic && (
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-center gap-3">
              <Zap className="w-5 h-5 text-primary/70" />
              <span className="text-sm font-bold text-foreground">Hands-On</span>
            </div>
          )}
          {(profile as any).style_social && (
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-center gap-3">
              <Users className="w-5 h-5 text-primary/70" />
              <span className="text-sm font-bold text-foreground">Collaborative</span>
            </div>
          )}
          {(profile as any).style_solo && (
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-primary/70" />
              <span className="text-sm font-bold text-foreground">Independent</span>
            </div>
          )}
        </div>
      </motion.div>


      {/* System Suggested Plan */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass-card p-8 rounded-3xl border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Lightbulb className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-foreground">System Suggested Plan</h2>
            <p className="text-sm text-muted-foreground">Personalized learning plan based on your data</p>
          </div>
        </div>

        {planLoading ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="w-4 h-4 animate-spin" />
              Your Plan is getting ready...
            </div>
          </div>
        ) : systemPlan ? (
          <div className="space-y-4">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-sm text-foreground whitespace-pre-line leading-relaxed">
                {systemPlan.plan_content}
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-right">
              Generated: {new Date(systemPlan.created_at).toLocaleString()}
            </p>
          </div>
        ) : (
          <div className="text-center py-8">
            <Lightbulb className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">No system suggested plan yet.</p>
            <p className="text-xs text-muted-foreground mt-2">An admin will generate a personalized plan for you based on your Learning DNA profile.</p>
          </div>
        )}
      </motion.div>

      {/* Action Buttons */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex justify-center">
        <Button onClick={() => setSupportChatOpen(true)} className="h-12 px-8 rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-primary/20">
          <MessageSquare className="w-4 h-4 mr-2" /> Chat with Support
        </Button>
      </motion.div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export default function LearningDNAQuestionnaire() {
  const { profile, saveProfile, saving, loading: isProfileLoading } = useLearningDNA();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { trigger } = useAIReactions();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Partial<LearningDNAProfile> & Record<string, any>>({});
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    if (Object.keys(draft).length === 0 && !isProfileLoading) {
      setDraft({ ...profile });
    }
  }, [profile, isProfileLoading]);

  const toggle = (key: string) => setDraft(p => ({ ...p, [key]: !p[key] }));
  const set = (key: string, val: any) => setDraft(p => ({ ...p, [key]: val }));

  const handleComplete = async () => {
    setIsFinalizing(true);
    await saveProfile({ ...draft, completed: true } as any);
    trigger({ state: "celebration", action: "onboarding_complete", mood: "playful" });

    // Show guided tour after DNA completion
    setTimeout(() => {
      setShowTour(true);
    }, 2500);
  };

  const handleTourComplete = () => {
    setShowTour(false);
    navigate("/app");
  };

  const next = () => {
    setStep(s => s + 1);
  };

  // If profile is already completed, show profile display instead of assessment
  if (profile.completed) {
    return <LearningDNAProfileDisplay profile={profile} navigate={navigate} />;
  }

  // Show tour after completion
  if (showTour) {
    return <FirstTimeTour onComplete={handleTourComplete} />;
  }

  if (isProfileLoading) {
    return <DNASkeleton />;
  }

  const strategies = generateRecommendations(draft as any);
  const current = STEPS[step];
  const Icon = current.icon;

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-8 relative">
      {/* Decorative background blobs for premium feel */}
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-accent/10 rounded-full blur-[100px] pointer-events-none" />

      <AnimatePresence>
        {isFinalizing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-background/90 backdrop-blur-xl flex flex-col items-center justify-center text-center p-6"
          >
            <motion.div
              animate={{ rotate: 360, scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="w-24 h-24 mb-8 relative"
            >
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
              <Dna className="w-full h-full text-primary relative z-10" />
            </motion.div>
            <h2 className="text-3xl font-display font-bold mb-4 bg-clip-text text-transparent bg-gradient-brand">
              Synthesizing Your Learning Universe
            </h2>
            <p className="text-muted-foreground max-w-sm">
              We're calibrating the platform to match your unique DNA. Your journey begins in a moment...
            </p>

            <div className="mt-12 flex gap-2">
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -10, 0], opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                  className="w-3 h-3 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary),0.5)]"
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Progress ── */}
      <div className="flex items-center gap-1.5">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center gap-1.5 flex-1">
            <div className={cn(
              "w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all duration-300 shrink-0",
              i < step ? "bg-primary text-primary-foreground" :
                i === step ? "bg-primary text-primary-foreground ring-4 ring-primary/20" :
                  "bg-secondary text-muted-foreground"
            )}>
              {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn("flex-1 h-0.5 rounded-full transition-all duration-500", i < step ? "bg-primary" : "bg-border")} />
            )}
          </div>
        ))}
      </div>

      {/* ── Step header with AI image ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.35 }}
          className="space-y-5"
        >
          {/* AI icon banner */}
          <div className="relative w-full h-48 rounded-2xl overflow-hidden shadow-lg bg-gradient-to-br from-primary/10 via-primary/5 to-accent/5 border border-primary/20">
            <div className="absolute inset-0 flex items-center justify-center">
              <Icon className="w-24 h-24 text-primary/30" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
            <div className="absolute bottom-4 left-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/90 backdrop-blur-md flex items-center justify-center">
                <Icon className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <p className="font-display font-bold text-lg text-foreground leading-tight">{current.title}</p>
                <p className="text-xs text-muted-foreground">{`Step ${step + 1} of ${STEPS.length}`}</p>
              </div>
            </div>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">{current.subtitle}</p>

          {/* ── Step content ── */}

          {/* Step 0: Learning Differences */}
          {step === 0 && (
            <div className="space-y-2">
              <SectionLabel>Select all that apply</SectionLabel>
              {NEEDS_OPTIONS.map(o => (
                <MultiCard
                  key={o.key}
                  label={o.label}
                  desc={o.desc}
                  active={o.key === "_none"
                    ? !["has_adhd", "has_dyslexia", "has_anxiety", "has_dyscalculia", "has_asd"].some(k => !!draft[k])
                    : !!draft[o.key]
                  }
                  onClick={() => {
                    if (o.key === "_none") {
                      setDraft(p => ({
                        ...p,
                        has_adhd: false,
                        has_dyslexia: false,
                        has_anxiety: false,
                        has_dyscalculia: false,
                        has_asd: false
                      }));
                    } else {
                      toggle(o.key);
                    }
                  }}
                  className={cn(
                    o.key === "_none" && "mt-4 opacity-70 hover:opacity-100"
                  )}
                />
              ))}
            </div>
          )}

          {/* Step 1: Learning Style */}
          {step === 1 && (
            <div className="space-y-2">
              <SectionLabel>Select all that describe you</SectionLabel>
              {STYLE_OPTIONS.map(o => (
                <MultiCard key={o.key} label={o.label} desc={o.desc} active={!!draft[o.key]} onClick={() => toggle(o.key)} />
              ))}
            </div>
          )}

          {/* Step 2: Focus & Energy */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <SectionLabel>Focus Mode</SectionLabel>
                {FOCUS_MODES.map(fm => (
                  <SingleCard key={fm.value} label={fm.label} desc={fm.desc} active={draft.focus_mode === fm.value} onClick={() => set("focus_mode", fm.value)} />
                ))}
              </div>
              <div className="space-y-2">
                <SectionLabel>Preferred Session Length</SectionLabel>
                <div className="grid grid-cols-2 gap-2">
                  {SESSION_LENGTHS.map(sl => (
                    <SingleCard key={sl.value} label={sl.label} desc={sl.desc} active={draft.session_length === sl.value} onClick={() => set("session_length", sl.value)} />
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <SectionLabel>Break Frequency</SectionLabel>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {BREAK_FREQS.map(bf => (
                    <SingleCard key={bf.value} label={bf.label} desc={bf.desc} active={draft.break_frequency === bf.value} onClick={() => set("break_frequency", bf.value)} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Subjects */}
          {step === 3 && (
            <div className="space-y-2">
              <SectionLabel>Select all that interest you</SectionLabel>
              <div className="grid sm:grid-cols-2 gap-2">
                {SUBJECT_OPTIONS.map(o => (
                  <MultiCard key={o.key} label={o.label} desc={o.desc} active={!!draft[o.key]} onClick={() => toggle(o.key)} />
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Goals */}
          {step === 4 && (
            <div className="space-y-2">
              <SectionLabel>Select all that resonate</SectionLabel>
              {GOAL_OPTIONS.map(o => (
                <MultiCard key={o.key} label={o.label} desc={o.desc} active={!!draft[o.key]} onClick={() => toggle(o.key)} />
              ))}
            </div>
          )}

          {/* Step 5: Comfort */}
          {step === 5 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <SectionLabel>Reading Font</SectionLabel>
                <div className="grid grid-cols-3 gap-2">
                  {FONT_OPTIONS.map(f => (
                    <button key={f.value} onClick={() => set("preferred_font", f.value)}
                      className={cn("p-3 rounded-xl border text-center transition-all",
                        draft.preferred_font === f.value ? "border-primary bg-primary/8 ring-1 ring-primary/30" : "border-border/40 hover:border-primary/40")}>
                      <p className={cn("text-lg font-bold text-foreground mb-1", f.font)}>{f.sample.substring(0, 3)}</p>
                      <p className="text-[10px] text-muted-foreground">{f.label}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <SectionLabel>Color Overlay for Reading</SectionLabel>
                <div className="grid grid-cols-5 gap-2">
                  {COLOR_OVERLAYS.map(co => (
                    <button key={co.value} onClick={() => set("color_overlay", co.value)}
                      className={cn("flex flex-col items-center gap-1 p-2 rounded-xl border transition-all",
                        draft.color_overlay === co.value ? "border-primary ring-2 ring-primary/30" : "border-border/40")}>
                      <div className={cn("w-8 h-8 rounded-lg border border-border/30", co.cls)} />
                      <span className="text-[10px] font-medium text-muted-foreground">{co.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <SectionLabel>Visual Preferences</SectionLabel>
                {[
                  { key: "reduced_motion", label: "Reduced Motion", desc: "Minimise animations for comfort" },
                  { key: "high_contrast", label: "High Contrast", desc: "Increase text/background contrast" },
                ].map(opt => (
                  <button key={opt.key}
                    onClick={() => setDraft(d => ({ ...d, [opt.key]: !d[opt.key] }))}
                    className={cn("w-full flex items-center justify-between p-4 rounded-xl border transition-all",
                      draft[opt.key] ? "border-primary bg-primary/8" : "border-border/40 hover:border-primary/40")}>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{opt.label}</p>
                      <p className="text-xs text-muted-foreground">{opt.desc}</p>
                    </div>
                    <div className={cn("w-10 h-6 rounded-full relative transition-colors", draft[opt.key] ? "bg-primary" : "bg-secondary")}>
                      <span className={cn("absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all", draft[opt.key] ? "left-5" : "left-1")} />
                    </div>
                  </button>
                ))}
              </div>
              <div className="space-y-2">
                <SectionLabel>Content Density</SectionLabel>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: "minimal", label: "Minimal", desc: "Fewer items per view" },
                    { value: "standard", label: "Standard", desc: "Balanced layout" },
                    { value: "detailed", label: "Detailed", desc: "More info at once" },
                  ].map(cd => (
                    <SingleCard key={cd.value} label={cd.label} desc={cd.desc} active={draft.content_density === cd.value} onClick={() => set("content_density", cd.value)} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Review */}
          {step === 6 && (
            <div className="space-y-4">
              {/* Summary cards */}
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="platform-card p-4 space-y-2">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Focus Mode</p>
                  <p className="font-bold text-foreground capitalize">{draft.focus_mode || "Not set"}</p>
                </div>
                <div className="platform-card p-4 space-y-2">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Session Length</p>
                  <p className="font-bold text-foreground capitalize">{draft.session_length || "Not set"}</p>
                </div>
                <div className="platform-card p-4 space-y-2">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Break Frequency</p>
                  <p className="font-bold text-foreground capitalize">{draft.break_frequency || "Not set"}</p>
                </div>
                <div className="platform-card p-4 space-y-2">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Font</p>
                  <p className="font-bold text-foreground capitalize">{draft.preferred_font === "dyslexic" ? "OpenDyslexic" : draft.preferred_font || "Standard"}</p>
                </div>
              </div>

              {/* Selected needs */}
              {["has_adhd", "has_dyslexia", "has_anxiety", "has_dyscalculia", "has_asd"].some(k => draft[k]) && (
                <div className="platform-card p-4 space-y-2">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Identified Needs</p>
                  <div className="flex flex-wrap gap-2">
                    {["has_adhd", "has_dyslexia", "has_anxiety", "has_dyscalculia", "has_asd"].filter(k => draft[k]).map(k => (
                      <span key={k} className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
                        {k.replace("has_", "").charAt(0).toUpperCase() + k.replace("has_", "").slice(1)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* AI recommendations */}
              <div className="platform-card p-4 space-y-3 border-primary/20">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Personalised Strategies</p>
                <ul className="space-y-2">
                  {strategies.slice(0, 8).map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <ChevronRight className="w-3.5 h-3.5 mt-0.5 text-primary shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* ── Navigation ── */}
      <div className="flex items-center justify-between pt-2 border-t border-border/30">
        <Button variant="ghost" size="sm" onClick={() => setStep(s => s - 1)} disabled={step === 0}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        {step < STEPS.length - 1 ? (
          <Button variant="hero" size="sm" onClick={next}>
            Continue <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button variant="hero" size="sm" onClick={handleComplete} disabled={saving}>
            {saving ? "Saving..." : "Save & Start Learning"} <Sparkles className="w-4 h-4 ml-1" />
          </Button>
        )}
      </div>

      {/* Support Chat for Learning DNA assistance */}
      <SupportChatWidget
        supabaseUrl={import.meta.env.VITE_SUPABASE_URL || ''}
        supabaseKey={import.meta.env.VITE_SUPABASE_ANON_KEY || ''}
        primaryColor="#3B82F6"
        textColor="#1F2937"
        bubbleBackground="#F3F4F6"
      />
    </div>
  );
}
