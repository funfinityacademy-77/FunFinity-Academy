import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Flame, Users, Award, Shield, BookOpen } from "lucide-react";
import { FunfinityIcon } from "@/components/brand/FunfinityLogo";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { CountUp } from "@/components/ui/count-up";
import { useRealtimeStats } from "@/hooks/use-realtime-stats";

type SubjectTheme = "math" | "science" | "social" | "english" | "other";

const subjectColor: Record<SubjectTheme, string> = {
  math: "bg-subject-math",
  science: "bg-subject-science",
  social: "bg-subject-social",
  english: "bg-subject-english",
  other: "bg-subject-other",
};

const subjectTextColor: Record<SubjectTheme, string> = {
  math: "text-subject-math",
  science: "text-subject-science",
  social: "text-subject-social",
  english: "text-subject-english",
  other: "text-subject-other",
};

const subjectBarColor: Record<SubjectTheme, string> = {
  math: "hsl(0, 72%, 50%)",
  science: "hsl(28, 90%, 52%)",
  social: "hsl(30, 50%, 38%)",
  english: "hsl(215, 80%, 50%)",
  other: "hsl(150, 60%, 38%)",
};

const courseCards = [
  { 
    title: "AP Calculus BC", 
    desc: "Advanced calculus", 
    progress: 78, 
    xp: "2,450", 
    theme: "math" as SubjectTheme 
  },
  { 
    title: "Physics I", 
    desc: "Mechanics & waves", 
    progress: 62, 
    xp: "1,890", 
    theme: "science" as SubjectTheme 
  },
  { 
    title: "World History", 
    desc: "Civilizations & empires", 
    progress: 45, 
    xp: "1,200", 
    theme: "social" as SubjectTheme 
  },
  { 
    title: "Creative Writing", 
    desc: "Stories & expression", 
    progress: 88, 
    xp: "3,100", 
    theme: "english" as SubjectTheme 
  },
  { 
    title: "Digital Art", 
    desc: "Design fundamentals", 
    progress: 34, 
    xp: "890", 
    theme: "other" as SubjectTheme 
  },
  { 
    title: "Computer Science", 
    desc: "Algorithms & logic", 
    progress: 56, 
    xp: "1,650", 
    theme: "other" as SubjectTheme 
  },
  { 
    title: "Chemistry", 
    desc: "Reactions & elements", 
    progress: 71, 
    xp: "2,100", 
    theme: "science" as SubjectTheme 
  },
  { 
    title: "Music Theory", 
    desc: "Rhythm & harmony", 
    progress: 29, 
    xp: "720", 
    theme: "other" as SubjectTheme 
  },
];

function OrbitingCourseCards() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((p) => (p + 1) % courseCards.length);
      setRotation((p) => p - (360 / courseCards.length));
    }, 5000); // Slower, more intentional transition
    return () => clearInterval(interval);
  }, []);

  const radius = 190;
  const centerX = 210;
  const centerY = 210;

  return (
    <div className="relative w-[420px] h-[420px] mx-auto">
      {/* Center hub */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-gradient-to-br from-blue/20 via-orange/20 to-pink/20 border-2 border-blue/30 flex flex-col items-center justify-center z-10 shadow-medium">
        <FunfinityIcon size="sm" className="text-blue mb-1" />
        <span className="text-[10px] font-semibold text-foreground">50+ Courses</span>
      </div>

      {/* Orbit ring */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] rounded-full border-2 border-dashed border-gradient-to-r from-blue/30 via-orange/30 to-pink/30" />

      {/* Orbiting cards */}
      <motion.div
        className="absolute inset-0"
        animate={{ rotate: rotation }}
        transition={{ duration: 2, ease: "anticipate" }} // Smoother, more organic movement
      >
        {courseCards.map((course, i) => {
          const angle = (i * 360) / courseCards.length;
          const rad = (angle * Math.PI) / 180;
          const x = centerX + radius * Math.cos(rad) - 65;
          const y = centerY + radius * Math.sin(rad) - 42;

          return (
            <motion.div
              key={course.title}
              className="absolute w-[130px]"
              style={{ left: x, top: y }}
              animate={{ rotate: -rotation }}
              transition={{ duration: 2, ease: "anticipate" }}
              onClick={() => {
                setActiveIndex(i);
                setRotation(-angle + (i * 360) / courseCards.length - (i * 360) / courseCards.length);
              }}
            >
              <motion.div
                whileHover={{ scale: 1.08 }}
                className={`platform-card p-2.5 cursor-pointer transition-all duration-300 ${i === activeIndex ? "ring-2 ring-offset-1 shadow-medium" : "hover:shadow-soft opacity-80"
                  }`}
                style={i === activeIndex ? {
                  "--tw-ring-color": subjectBarColor[course.theme],
                } as React.CSSProperties : undefined}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div className={`w-8 h-8 rounded-lg overflow-hidden shrink-0 shadow-soft border border-white/20 bg-card flex items-center justify-center`}>
                    <FunfinityIcon size="sm" className="text-foreground" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-display font-bold text-foreground text-[10px] leading-tight truncate">{course.title}</h3>
                    <p className="text-[8px] text-muted-foreground truncate">{course.desc}</p>
                  </div>
                </div>

                <div className="mb-1">
                  <div className="flex items-center justify-between text-[8px] mb-0.5">
                    <span className="text-muted-foreground">Progress</span>
                    <span className={`font-bold ${subjectTextColor[course.theme]}`}>{course.progress}%</span>
                  </div>
                  <div className="h-1 bg-secondary rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: subjectBarColor[course.theme] }}
                      initial={{ width: "0%" }}
                      animate={{ width: `${course.progress}%` }}
                      transition={{ duration: 1, delay: 0.2 + i * 0.08, ease: "easeOut" }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[8px]">
                  <span className={`font-semibold ${subjectTextColor[course.theme]}`}>{course.xp} XP</span>
                  <span className="text-accent flex items-center gap-0.5 font-semibold">
                    {Math.floor(course.progress / 6)} <Flame className="w-2 h-2 fill-accent" />
                  </span>
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}

export function HeroSection() {
  const { stats, isLoading } = useRealtimeStats();

  const trustStats = [
    { icon: Users, value: stats.studentsCount, label: "Students", suffix: "+" },
    { icon: BookOpen, value: stats.coursesCount, label: "Courses", suffix: "+" },
    { icon: Award, value: stats.averageRating, label: "Rating", suffix: "/5", decimals: 1 },
    { icon: Shield, value: stats.userBenefits, label: "User Benefits", suffix: "+" },
  ];

  return (
    <section className="relative min-h-[90vh] sm:min-h-[85vh] md:min-h-[80vh] flex flex-col justify-center overflow-hidden pt-16 sm:pt-16" aria-label="Hero section - Funfinity Academy learning platform">
      <div className="absolute inset-0 bg-gradient-to-br from-blue/10 via-orange/10 to-pink/10" aria-hidden="true" />
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue/30 rounded-full blur-3xl opacity-50" aria-hidden="true" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-pink/30 rounded-full blur-3xl opacity-50" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-orange/30 rounded-full blur-3xl opacity-40" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10 flex-1 flex items-center">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-6xl mx-auto w-full">
          {/* Left - Copy */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-gradient-to-r from-blue/20 via-orange/20 to-pink/20 backdrop-blur-sm border-2 border-blue/30 mb-3 sm:mb-5"
            >
              <Sparkles className="w-3.5 h-3.5 text-orange" />
              <span className="text-xs font-medium text-foreground">
                Where curiosity meets depth
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4 sm:mb-6 leading-[1.2]"
            >
              AI-Powered Coding Academy
              <br />
              <span className="text-gradient-brand">For Kids Ages 10-16</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-sm sm:text-base md:text-lg text-foreground max-w-lg mb-6 sm:mb-8 leading-relaxed font-medium"
            >
              Master coding, math, and science through interactive AI-powered lessons designed specifically for students ages 10-16.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="flex flex-col sm:flex-row items-start gap-2 sm:gap-3 mb-6 sm:mb-8"
            >
              <Button
                variant="hero"
                size="lg"
                className="group bg-gradient-to-r from-blue-dark to-orange-dark hover:from-blue hover:to-orange text-white font-extrabold shadow-xl shadow-blue/30 border-2 border-white/20 hover:border-white/40 transition-all hover:scale-105 text-sm sm:text-base"
                asChild
              >
                <Link to="/auth">
                  Start Learning Now - Free
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-border/30 text-muted-foreground hover:text-foreground hover:bg-secondary/30 font-medium transition-all"
                asChild
              >
                <Link to="/demo">
                  Watch Demo
                </Link>
              </Button>
            </motion.div>

            {/* Risk Reversal Copy */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex items-center gap-2 text-xs text-muted-foreground"
            >
              <Shield className="w-3.5 h-3.5 text-green-500" />
              <span>No credit card required. Cancel anytime.</span>
            </motion.div>

            {/* Subject color legend */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-foreground"
            >
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-blue shadow-glow-blue" />
                <span className="font-medium">Math</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-orange shadow-glow-orange" />
                <span className="font-medium">Science</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-pink shadow-glow-pink" />
                <span className="font-medium">Social Studies</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-blue shadow-glow-blue" />
                <span className="font-medium">English</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-orange shadow-glow-orange" />
                <span className="font-medium">Other</span>
              </div>
            </motion.div>
          </div>

          {/* Right - Orbiting Course Cards */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="hidden lg:block"
          >
            <OrbitingCourseCards />
          </motion.div>
        </div>
      </div>

      {/* Trust Stats Strip */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
        className="relative z-10 border-t-2 border-blue/20 bg-gradient-to-r from-blue/10 via-orange/10 to-pink/10 backdrop-blur-sm"
        aria-label="Trust statistics"
      >
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex flex-wrap justify-center gap-6 sm:gap-8 md:gap-16">
            {trustStats.map((stat, index) => (
              <div key={stat.label} className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                  index === 0 ? 'bg-blue/20 border border-blue/30' :
                  index === 1 ? 'bg-orange/20 border border-orange/30' :
                  index === 2 ? 'bg-pink/20 border border-pink/30' :
                  'bg-blue/20 border border-blue/30'
                }`} aria-hidden="true">
                  <stat.icon className={`w-4 h-4 ${
                    index === 0 ? 'text-blue' :
                    index === 1 ? 'text-orange' :
                    index === 2 ? 'text-pink' :
                    'text-blue'
                  }`} />
                </div>
                <div>
                  <p className="font-display text-lg font-bold text-foreground leading-none" aria-label={`${stat.label}: ${stat.value}${stat.suffix || ''}`}>
                    <CountUp
                      end={stat.value}
                      duration={2}
                      delay={0.8 + index * 0.1}
                      suffix={stat.suffix}
                      decimals={stat.decimals || 0}
                    />
                  </p>
                  <p className="text-[11px] text-foreground mt-0.5 font-medium">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Social Proof & Trust Badges */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="relative z-10 border-t border-border/30 bg-background/80 backdrop-blur-sm py-6 sm:py-8"
      >
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-4 sm:mb-6">
            <p className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wider">Trusted by students worldwide</p>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 md:gap-8 lg:gap-12">
            {[
              { name: "Featured in TechCrunch", icon: "📰" },
              { name: "EdTech Award Winner", icon: "🏆" },
              { name: "4.8/5 Rating", icon: "⭐" },
              { name: "GDPR Compliant", icon: "🔒" },
              { name: "COPPA Safe", icon: "🛡️" },
            ].map((badge, index) => (
              <motion.div
                key={badge.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.9 + index * 0.1 }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary/50 border border-border/30"
              >
                <span className="text-xl">{badge.icon}</span>
                <span className="text-sm font-medium text-foreground">{badge.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
