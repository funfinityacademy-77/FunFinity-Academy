import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, UserCheck, Bot, BarChart3, ShieldCheck, Sparkles, Trophy, Target, Zap, Brain, Calendar, Award } from "lucide-react";

const features = [
  {
    title: "Personalized Learning DNA",
    description: "Our intelligent system adapts to your unique learning style, whether you have ADHD, dyslexia, or just prefer specific teaching methods. Complete the Learning DNA quiz for a fully customized experience.",
    icon: Sparkles,
    color: "bg-cyan-500/20 text-cyan-500",
    stats: "11+ Learning Styles Supported"
  },
  {
    title: "AI-Powered Study Assistant",
    description: "Get 24/7 help with your studies through our advanced AI assistant. Ask questions, get explanations, and receive personalized study recommendations across all subjects.",
    icon: Bot,
    color: "bg-purple-500/20 text-purple-500",
    stats: "Instant AI Responses"
  },
  {
    title: "Gamified Learning Journey",
    description: "Earn XP, unlock badges, and maintain streaks as you progress. Track your achievements on the leaderboard and compete with peers in a healthy, motivating environment.",
    icon: Trophy,
    color: "bg-orange-500/20 text-orange-500",
    stats: "50+ Achievements to Unlock"
  },
  {
    title: "Interactive Course Maps",
    description: "Navigate through interconnected subjects with our visual course maps. See how different topics connect and build upon each other for deeper understanding.",
    icon: Target,
    color: "bg-magenta-500/20 text-magenta-500",
    stats: "40+ Course Modules"
  },
  {
    title: "Real-time Progress Analytics",
    description: "Parents and students can monitor growth instantly with deep performance metrics. Track quiz scores, study time, and learning patterns to identify strengths and areas for improvement.",
    icon: BarChart3,
    color: "bg-green-500/20 text-green-500",
    stats: "Detailed Performance Reports"
  },
  {
    title: "Live Classes & Events",
    description: "Join interactive live sessions with expert instructors. Participate in real-time discussions, Q&A sessions, and collaborative learning activities with fellow students.",
    icon: Calendar,
    color: "bg-blue-500/20 text-blue-500",
    stats: "Weekly Live Sessions"
  },
  {
    title: "Secure & Private Platform",
    description: "A safe, COPPA-compliant environment designed specifically for students. All communications are moderated, and parental controls ensure a secure learning experience.",
    icon: ShieldCheck,
    color: "bg-red-500/20 text-red-500",
    stats: "COPPA & GDPR Compliant"
  },
  {
    title: "Adaptive Learning Paths",
    description: "The system automatically adjusts difficulty based on your performance. Struggling with a concept? Get extra practice. Excelling? Move ahead with advanced challenges.",
    icon: Brain,
    color: "bg-indigo-500/20 text-indigo-500",
    stats: "Dynamic Difficulty Adjustment"
  },
];

export function FeatureSlideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % features.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const ActiveIcon = features[currentIndex].icon;

  return (
    <div className="relative h-full w-full overflow-hidden flex flex-col justify-center p-12 lg:p-20">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="relative z-10"
        >
          <div className={`mb-8 inline-flex h-16 w-16 items-center justify-center rounded-2xl ${features[currentIndex].color} shadow-lg`}>
            <ActiveIcon className="h-8 w-8" />
          </div>
          
          <h2 className="mb-6 font-display text-4xl lg:text-5xl font-bold leading-tight text-foreground">
            {features[currentIndex].title}
          </h2>
          
          <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-lg mb-6">
            {features[currentIndex].description}
          </p>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border/50">
            <Zap className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-foreground">{features[currentIndex].stats}</span>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-12 lg:bottom-20 flex gap-2">
        {features.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === currentIndex ? "w-8 bg-primary" : "w-2 bg-border hover:bg-primary/50"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
