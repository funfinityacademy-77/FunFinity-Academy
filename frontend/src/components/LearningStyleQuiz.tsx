import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Brain, BookOpen, Users, Code, Palette, Music, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface QuizAnswer {
  questionId: number;
  answer: string;
}

interface QuizResult {
  learningStyle: string;
  recommendedSubjects: string[];
  description: string;
}

const quizQuestions = [
  {
    id: 1,
    question: "How do you prefer to learn new concepts?",
    icon: Brain,
    options: [
      { value: "visual", label: "Seeing diagrams and charts", icon: Palette },
      { value: "auditory", label: "Listening to explanations", icon: Music },
      { value: "kinesthetic", label: "Hands-on practice", icon: Code },
      { value: "reading", label: "Reading textbooks", icon: BookOpen },
    ],
  },
  {
    id: 2,
    question: "What type of activities do you enjoy most?",
    icon: Users,
    options: [
      { value: "group", label: "Collaborative projects", icon: Users },
      { value: "solo", label: "Independent study", icon: BookOpen },
      { value: "creative", label: "Artistic expression", icon: Palette },
      { value: "analytical", label: "Problem-solving", icon: Code },
    ],
  },
  {
    id: 3,
    question: "Which subjects interest you the most?",
    icon: BookOpen,
    options: [
      { value: "stem", label: "Science, Technology, Engineering, Math", icon: Code },
      { value: "humanities", label: "Literature, History, Philosophy", icon: BookOpen },
      { value: "arts", label: "Visual Arts, Music, Drama", icon: Palette },
      { value: "social", label: "Psychology, Sociology, Politics", icon: Users },
    ],
  },
];

const learningStyleResults: Record<string, QuizResult> = {
  "visual-stem": {
    learningStyle: "Visual STEM Learner",
    recommendedSubjects: ["Computer Science", "Physics", "Engineering", "Data Science"],
    description: "You learn best through visual representations and hands-on technical projects.",
  },
  "auditory-humanities": {
    learningStyle: "Auditory Humanities Learner",
    recommendedSubjects: ["Literature", "History", "Philosophy", "Debate"],
    description: "You excel at absorbing information through discussions and lectures.",
  },
  "kinesthetic-arts": {
    learningStyle: "Kinesthetic Arts Learner",
    recommendedSubjects: ["Digital Art", "Music Theory", "Drama", "Creative Writing"],
    description: "You thrive when learning through creative expression and physical engagement.",
  },
  "reading-social": {
    learningStyle: "Reading Social Learner",
    recommendedSubjects: ["Psychology", "Sociology", "Political Science", "Economics"],
    description: "You prefer deep reading and understanding human behavior and systems.",
  },
  "default": {
    learningStyle: "Balanced Learner",
    recommendedSubjects: ["Computer Science", "Literature", "Psychology", "Digital Art"],
    description: "You have a versatile learning style and can adapt to various subjects.",
  },
};

export function LearningStyleQuiz() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

  const handleAnswer = (answer: string) => {
    const newAnswers = [...answers, { questionId: quizQuestions[currentStep].id, answer }];
    setAnswers(newAnswers);

    if (currentStep < quizQuestions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      calculateResult(newAnswers);
    }
  };

  const calculateResult = (finalAnswers: QuizAnswer[]) => {
    const styleKey = `${finalAnswers[0]?.answer}-${finalAnswers[2]?.answer}`;
    const result = learningStyleResults[styleKey] || learningStyleResults.default;
    setQuizResult(result);
    setShowResult(true);
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setAnswers([]);
    setShowResult(false);
    setQuizResult(null);
  };

  const handleGetStarted = () => {
    window.location.href = "/auth";
  };

  const progress = ((currentStep + 1) / quizQuestions.length) * 100;

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-blue/5 via-orange/5 to-pink/5" aria-label="Learning Style Quiz">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 sm:mb-12"
          >
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-3 sm:mb-4">
              Discover Your <span className="text-gradient-brand">Learning Style</span>
            </h2>
            <p className="text-sm sm:text-base text-foreground/80 max-w-xl mx-auto">
              Answer 3 quick questions to get personalized course recommendations tailored to how you learn best.
            </p>
          </motion.div>

          {/* Quiz Card */}
          <Card className="glass-card-heavy p-6 sm:p-8 lg:p-10 border-2 border-border/50">
            {/* Progress Bar */}
            {!showResult && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-6 sm:mb-8"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs sm:text-sm font-medium text-foreground/70">
                    Question {currentStep + 1} of {quizQuestions.length}
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-primary">
                    {Math.round(progress)}%
                  </span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue via-orange to-pink"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              {!showResult ? (
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                >
                  {/* Question */}
                  <div className="mb-6 sm:mb-8">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue/20 to-orange/20 border border-blue/30 flex items-center justify-center">
                        {(() => {
                          const Icon = quizQuestions[currentStep].icon;
                          return <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-blue" />;
                        })()}
                      </div>
                      <h3 className="font-display text-lg sm:text-xl lg:text-2xl font-bold text-foreground">
                        {quizQuestions[currentStep].question}
                      </h3>
                    </div>
                  </div>

                  {/* Options */}
                  <div className="space-y-3 sm:space-y-4">
                    {quizQuestions[currentStep].options.map((option, index) => (
                      <motion.button
                        key={option.value}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        onClick={() => handleAnswer(option.value)}
                        className="w-full group relative overflow-hidden rounded-xl border-2 border-border/50 bg-card/50 hover:bg-card hover:border-primary/50 transition-all duration-300 p-4 sm:p-5 text-left focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
                        aria-label={`Select: ${option.label}`}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue/5 via-orange/5 to-pink/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="relative flex items-center gap-3 sm:gap-4">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-secondary/50 group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                            {(() => {
                              const Icon = option.icon;
                              return <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-foreground/70 group-hover:text-primary transition-colors" />;
                            })()}
                          </div>
                          <span className="font-medium text-foreground text-sm sm:text-base">{option.label}</span>
                          <ChevronRight className="w-5 h-5 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
                        </div>
                      </motion.button>
                    ))}
                  </div>

                  {/* Navigation */}
                  <div className="flex items-center justify-between mt-6 sm:mt-8 pt-4 border-t border-border/50">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (currentStep > 0) {
                          setCurrentStep(currentStep - 1);
                          setAnswers(answers.slice(0, -1));
                        }
                      }}
                      disabled={currentStep === 0}
                      className="focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Back
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      {currentStep + 1} / {quizQuestions.length}
                    </span>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="text-center"
                >
                  {/* Success Icon */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2, type: "spring" }}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-green/20 to-blue/20 border-2 border-green/30 flex items-center justify-center mx-auto mb-6"
                  >
                    <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-green-500" />
                  </motion.div>

                  {/* Result */}
                  <h3 className="font-display text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4">
                    Your Learning Style: <span className="text-gradient-brand">{quizResult?.learningStyle}</span>
                  </h3>
                  <p className="text-sm sm:text-base text-foreground/80 mb-6 sm:mb-8 max-w-lg mx-auto">
                    {quizResult?.description}
                  </p>

                  {/* Recommended Subjects */}
                  <div className="mb-6 sm:mb-8">
                    <h4 className="font-semibold text-foreground mb-3 sm:mb-4 text-sm sm:text-base">
                      Recommended Subjects for You:
                    </h4>
                    <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                      {quizResult?.recommendedSubjects.map((subject, index) => (
                        <motion.span
                          key={subject}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                          className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-gradient-to-r from-blue/20 via-orange/20 to-pink/20 border border-blue/30 text-xs sm:text-sm font-medium text-foreground"
                        >
                          {subject}
                        </motion.span>
                      ))}
                    </div>
                  </div>

                  {/* CTA Buttons */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                    <Button
                      variant="hero"
                      size="lg"
                      onClick={handleGetStarted}
                      className="w-full sm:w-auto group focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    >
                      Start Learning Now
                      <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={handleRestart}
                      className="w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      Retake Quiz
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </div>
      </div>
    </section>
  );
}
