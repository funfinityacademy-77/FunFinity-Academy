import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Compass, ArrowLeft, RotateCcw, Sparkles, Trophy, TrendingUp, Zap, Star, Microscope, Palette, BarChart3, HeartPulse, Hammer, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useCareer, quizQuestions, CareerCluster } from "@/hooks/use-career";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const clusterColors: Record<CareerCluster, string> = {
  STEM: "bg-gradient-to-r from-cyan/20 to-cyan/10 text-cyan border-cyan/30 hover:border-cyan/50",
  Arts: "bg-gradient-to-r from-magenta/20 to-magenta/10 text-magenta border-magenta/30 hover:border-magenta/50",
  Business: "bg-gradient-to-r from-orange/20 to-orange/10 text-orange border-orange/30 hover:border-orange/50",
  Healthcare: "bg-gradient-to-r from-emerald/20 to-emerald/10 text-emerald border-emerald/30 hover:border-emerald/50 dark:from-emerald/30 dark:to-emerald/20 dark:text-emerald-400",
  Trades: "bg-gradient-to-r from-amber/20 to-amber/10 text-amber border-amber/30 hover:border-amber/50 dark:from-amber/30 dark:to-amber/20 dark:text-amber-400",
  "Public Service": "bg-gradient-to-r from-blue/20 to-blue/10 text-blue border-blue/30 hover:border-blue/50 dark:from-blue/30 dark:to-blue/20 dark:text-blue-400",
};

const clusterIcons: Record<CareerCluster, typeof Microscope> = {
  STEM: Microscope, Arts: Palette, Business: BarChart3, Healthcare: HeartPulse, Trades: Hammer, "Public Service": Building2,
};

const clusterDescriptions: Record<CareerCluster, string> = {
  STEM: "Science, Technology, Engineering & Math — You love solving complex problems and innovating with data and systems.",
  Arts: "Creative Arts & Design — You express yourself through visual, performing, or literary arts.",
  Business: "Business & Entrepreneurship — You thrive on strategy, leadership, and financial thinking.",
  Healthcare: "Healthcare & Life Sciences — You're driven to heal, research, and care for others.",
  Trades: "Skilled Trades & Engineering — You excel with hands-on work, building and fixing real-world systems.",
  "Public Service": "Government, Law & Education — You want to serve communities and shape public policy.",
};

const personalityDescriptions: Record<string, string> = {
  "The Innovator": "You see possibilities where others see problems. Your analytical mind and creative thinking make you a natural problem-solver who pushes boundaries.",
  "The Creator": "You bring beauty and meaning to the world through your artistic vision. Your creativity inspires others and transforms ordinary into extraordinary.",
  "The Strategist": "You think three steps ahead. Your business acumen and leadership skills make you a natural at turning ideas into successful ventures.",
  "The Healer": "You have a deep empathy for others and a desire to make a difference. Your compassion drives you to care, cure, and comfort.",
  "The Builder": "You make things work. Your practical skills and attention to detail mean you can construct, repair, and improve the world around you.",
  "The Advocate": "You stand up for what's right. Your sense of justice and community drives you to create positive change through service and leadership.",
};

export default function CareerPathfinder() {
  const { profile, completeQuiz, resetQuiz } = useCareer();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, "A" | "B">>({});
  const [scores, setScores] = useState<Record<CareerCluster, number>>({
    STEM: 0, Arts: 0, Business: 0, Healthcare: 0, Trades: 0, "Public Service": 0,
  });
  const [showResults, setShowResults] = useState(profile.quizCompleted);
  const [selectedOption, setSelectedOption] = useState<"A" | "B" | null>(null);

  const handleAnswer = (choice: "A" | "B", clusters: CareerCluster[]) => {
    setSelectedOption(choice);

    // Undo previous answer for this step if going back
    const prevAnswer = answers[step];
    const newScores = { ...scores };
    if (prevAnswer) {
      const prevQ = quizQuestions[step];
      const prevClusters = prevAnswer === "A" ? prevQ.optionA.clusters : prevQ.optionB.clusters;
      prevClusters.forEach(c => { newScores[c] -= 1; });
    }
    clusters.forEach(c => { newScores[c] += 1; });
    setScores(newScores);
    setAnswers({ ...answers, [step]: choice });

    setTimeout(() => {
      setSelectedOption(null);
      if (step < quizQuestions.length - 1) {
        setStep(step + 1);
      } else {
        completeQuiz(newScores);
        setShowResults(true);
      }
    }, 400);
  };

  const handleRetake = () => {
    resetQuiz();
    setStep(0);
    setAnswers({});
    setScores({ STEM: 0, Arts: 0, Business: 0, Healthcare: 0, Trades: 0, "Public Service": 0 });
    setShowResults(false);
  };

  // === RESULTS SCREEN ===
  if (showResults && profile.quizCompleted) {
    const sorted = Object.entries(profile.quizResults).sort(([, a], [, b]) => b - a);
    const maxScore = Math.max(sorted[0][1], 1);
    const topCluster = sorted[0][0] as CareerCluster;

    return (
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Hero Result */}
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", damping: 20 }} className="text-center space-y-6">
          <motion.div 
            initial={{ rotate: -10, scale: 0.8 }} 
            animate={{ rotate: 0, scale: 1 }} 
            transition={{ type: "spring", damping: 10, delay: 0.1 }}
            className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-primary via-primary/80 to-accent shadow-2xl shadow-primary/25 mb-4 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
            <Trophy className="w-12 h-12 text-primary-foreground relative z-10" />
          </motion.div>
          <div>
            <h1 className="text-4xl sm:text-5xl font-display font-bold text-foreground mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              You are {profile.personalityType}!
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto text-base leading-relaxed">{personalityDescriptions[profile.personalityType] || "You have a unique blend of interests!"}</p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {profile.careerInterests.map(c => {
              const Icon = clusterIcons[c];
              return (
                <motion.span 
                  key={c} 
                  initial={{ opacity: 0, y: 10, scale: 0.9 }} 
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.2 + profile.careerInterests.indexOf(c) * 0.1, type: "spring" }}
                  className={cn("flex items-center gap-1.5 px-4 py-2 rounded-full border text-sm font-medium transition-all hover:scale-105 hover:shadow-lg cursor-pointer", clusterColors[c])}
                >
                  <Icon className="w-4 h-4" /> {c}
                </motion.span>
              );
            })}
          </div>
        </motion.div>

        {/* Detailed Scores */}
        <Card className="glass-card border-border/30 overflow-hidden shadow-lg">
          <CardContent className="p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <motion.div 
                initial={{ scale: 0 }} 
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.3 }}
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center"
              >
                <TrendingUp className="w-5 h-5 text-primary" />
              </motion.div>
              <h2 className="font-semibold text-foreground text-xl">Career Cluster Breakdown</h2>
            </div>
            {sorted.map(([cluster, score], i) => {
              const pct = (score / maxScore) * 100;
              const isTop = i < 3;
              const Icon = clusterIcons[cluster as CareerCluster];
              return (
                <motion.div key={cluster} initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.12 }} className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", isTop ? "bg-gradient-to-br from-primary/20 to-accent/20" : "bg-secondary/50")}>
                        <Icon className={cn("w-4 h-4", isTop ? "text-primary" : "text-muted-foreground")} />
                      </div>
                      <span className={cn("font-medium text-base", isTop ? "text-foreground" : "text-muted-foreground")}>{cluster}</span>
                      {i === 0 && (
                        <motion.div 
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ delay: 0.5 + i * 0.12, type: "spring" }}
                        >
                          <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                        </motion.div>
                      )}
                    </span>
                    <span className="text-muted-foreground font-mono text-sm font-semibold">{score} pts</span>
                  </div>
                  <div className="relative h-4 rounded-full bg-secondary/50 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }} 
                      animate={{ width: `${pct}%` }} 
                      transition={{ delay: i * 0.12 + 0.3, duration: 0.8, ease: "easeOut" }}
                      className={cn("h-full rounded-full relative overflow-hidden", 
                        i === 0 ? "bg-gradient-to-r from-primary to-accent shadow-lg shadow-primary/30" : 
                        i < 3 ? "bg-gradient-to-r from-primary/70 to-accent/70" : "bg-muted-foreground/30"
                      )}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
                    </motion.div>
                  </div>
                  {isTop && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.12 + 0.5 }}
                      className="text-sm text-muted-foreground leading-relaxed pl-10"
                    >
                      {clusterDescriptions[cluster as CareerCluster]}
                    </motion.p>
                  )}
                </motion.div>
              );
            })}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button variant="outline" onClick={handleRetake} className="gap-2"><RotateCcw className="w-4 h-4" /> Retake Quiz</Button>
          <Button variant="hero" onClick={() => navigate("/app/career/opportunities")} className="gap-2"><Sparkles className="w-4 h-4" /> Explore Opportunities</Button>
          <Button variant="outline" onClick={() => navigate("/app/career/roadmap")} className="gap-2"><Zap className="w-4 h-4" /> View Roadmap</Button>
        </motion.div>
      </div>
    );
  }

  // === QUIZ SCREEN ===
  const q = quizQuestions[step];
  const progress = ((step) / quizQuestions.length) * 100;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-brand shadow-lg mb-2">
          <Compass className="w-8 h-8 text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-display font-bold text-foreground">Pathfinder Quiz</h1>
        <p className="text-muted-foreground">Choose the activity that excites you more!</p>
      </motion.div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span className="font-medium">Question {step + 1} of {quizQuestions.length}</span>
          <span className="font-mono">{Math.round(progress)}% complete</span>
        </div>
        <Progress value={progress} className="h-2.5" />
        {/* Step indicators */}
        <div className="flex gap-1 justify-center pt-1">
          {quizQuestions.map((_, i) => (
            <button key={i} onClick={() => i <= answeredCount && setStep(i)}
              className={cn("w-2 h-2 rounded-full transition-all", i === step ? "w-6 bg-primary" : i < answeredCount ? "bg-primary/40" : "bg-border")} />
          ))}
        </div>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.25 }}>
          <p className="text-center text-xl font-semibold text-foreground mb-8">Would you rather...</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {(["A", "B"] as const).map((choice) => {
              const option = choice === "A" ? q.optionA : q.optionB;
              const isSelected = selectedOption === choice || answers[step] === choice;
              return (
                <motion.button key={choice} onClick={() => handleAnswer(choice, option.clusters)}
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  className={cn(
                    "relative p-6 rounded-2xl border-2 text-left transition-all duration-200 group",
                    isSelected ? "border-primary bg-primary/5 shadow-lg" : "border-border/40 bg-card hover:border-primary/40 hover:shadow-medium"
                  )}>
                  <div className={cn(
                    "absolute top-3 right-3 w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all",
                    isSelected ? "border-primary bg-primary text-primary-foreground" : "border-border/50 text-muted-foreground"
                  )}>{choice}</div>
                  <p className="text-foreground font-medium text-base pr-8 leading-relaxed">{option.text}</p>
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {option.clusters.map(c => {
                      const ClusterIcon = clusterIcons[c];
                      return (
                        <span key={c} className={cn("flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border font-medium", clusterColors[c])}>
                          <ClusterIcon className="w-3 h-3" /> {c}
                        </span>
                      );
                    })}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {step > 0 && (
        <div className="text-center">
          <Button variant="ghost" size="sm" onClick={() => setStep(step - 1)} className="gap-1.5">
            <ArrowLeft className="w-4 h-4" /> Previous Question
          </Button>
        </div>
      )}
    </div>
  );
}
