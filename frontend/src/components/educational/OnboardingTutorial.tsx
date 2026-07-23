import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  Target, 
  Trophy, 
  Zap,
  Brain,
  Rocket,
  Star,
  CheckCircle,
  Play,
  Users,
  BookOpen,
  Gamepad2
} from 'lucide-react';
import { AnimatedCard, AnimatedButton, FloatingBadge, useGamifiedTheme } from './GamifiedTheme';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action?: string;
  highlight?: string;
  position?: 'center' | 'left' | 'right';
}

interface OnboardingProps {
  onComplete: () => void;
  skipTutorial?: boolean;
}

export function OnboardingTutorial({ onComplete, skipTutorial = false }: OnboardingProps) {
  const { theme, animationsEnabled } = useGamifiedTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showTutorial, setShowTutorial] = useState(!skipTutorial);

  const tutorialSteps: TutorialStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Funfinity Academy!',
      description: 'Your personalized learning adventure begins here. Let\'s explore the amazing features waiting for you!',
      icon: <Sparkles className="w-8 h-8" />,
      position: 'center'
    },
    {
      id: 'gamification',
      title: 'Learn & Earn Rewards',
      description: 'Complete lessons, earn XP points, level up, and unlock amazing achievements as you progress through your learning journey.',
      icon: <Trophy className="w-8 h-8" />,
      highlight: 'xp-system',
      position: 'left'
    },
    {
      id: 'interactive',
      title: 'Interactive Learning',
      description: 'Experience engaging video lessons, hands-on coding exercises, quizzes, and virtual simulations that make learning fun!',
      icon: <Gamepad2 className="w-8 h-8" />,
      highlight: 'learning-modules',
      position: 'right'
    },
    {
      id: 'progress',
      title: 'Track Your Progress',
      description: 'Monitor your learning streak, completed lessons, time spent, and achievements all in one beautiful dashboard.',
      icon: <Target className="w-8 h-8" />,
      highlight: 'progress-dashboard',
      position: 'center'
    },
    {
      id: 'parent',
      title: 'Parent Connection',
      description: 'Link with your parents to share your progress and get support. They can monitor your learning journey and help you succeed!',
      icon: <Users className="w-8 h-8" />,
      highlight: 'parent-linking',
      position: 'left'
    },
    {
      id: 'ready',
      title: 'Ready to Start?',
      description: 'You\'re all set! Begin your educational adventure and unlock your full potential with Funfinity Academy.',
      icon: <Rocket className="w-8 h-8" />,
      action: 'start-learning',
      position: 'center'
    }
  ];

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setIsCompleted(true);
    setTimeout(() => {
      setShowTutorial(false);
      onComplete();
    }, 1000);
  };

  const handleSkip = () => {
    setShowTutorial(false);
    onComplete();
  };

  const getStepPosition = () => {
    const step = tutorialSteps[currentStep];
    switch (step.position) {
      case 'left':
        return 'items-start text-left';
      case 'right':
        return 'items-end text-right';
      default:
        return 'items-center text-center';
    }
  };

  if (!showTutorial) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <AnimatePresence mode="wait">
        {!isCompleted ? (
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            className="max-w-2xl mx-4"
          >
            <AnimatedCard className="p-8">
              <div className={`space-y-6 ${getStepPosition()}`}>
                {/* Step Icon */}
                <motion.div
                  animate={animationsEnabled ? {
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0],
                  } : {}}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto"
                >
                  <div className="text-white">
                    {tutorialSteps[currentStep].icon}
                  </div>
                </motion.div>

                {/* Step Content */}
                <div className="space-y-4">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    {tutorialSteps[currentStep].title}
                  </h2>
                  <p className="text-lg text-purple-200 leading-relaxed">
                    {tutorialSteps[currentStep].description}
                  </p>
                </div>

                {/* Progress Indicator */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-purple-300">
                    <span>Step {currentStep + 1} of {tutorialSteps.length}</span>
                    <span>{Math.round(((currentStep + 1) / tutorialSteps.length) * 100)}%</span>
                  </div>
                  <div className="w-full bg-purple-900/30 rounded-full h-2">
                    <motion.div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4">
                  <div>
                    {currentStep > 0 && (
                      <AnimatedButton
                        variant="ghost"
                        onClick={handlePrevious}
                        className="flex items-center"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Previous
                      </AnimatedButton>
                    )}
                  </div>

                  <div className="flex items-center space-x-4">
                    {currentStep < tutorialSteps.length - 1 && (
                      <AnimatedButton
                        variant="ghost"
                        onClick={handleSkip}
                        className="text-purple-300"
                      >
                        Skip Tutorial
                      </AnimatedButton>
                    )}
                    
                    <AnimatedButton
                      variant="primary"
                      onClick={handleNext}
                      className="flex items-center"
                    >
                      {currentStep === tutorialSteps.length - 1 ? (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Start Learning
                        </>
                      ) : (
                        <>
                          Next
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </AnimatedButton>
                  </div>
                </div>
              </div>
            </AnimatedCard>
          </motion.div>
        ) : (
          <motion.div
            key="completed"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="text-center"
          >
            <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Tutorial Complete!</h2>
            <p className="text-purple-200">You're ready to start your learning adventure!</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Interactive Guide Component
export function InteractiveGuide({ children, step, isActive }: { 
  children: React.ReactNode; 
  step: string; 
  isActive: boolean;
}) {
  const { animationsEnabled } = useGamifiedTheme();

  return (
    <motion.div
      animate={isActive && animationsEnabled ? {
        scale: [1, 1.05, 1],
        boxShadow: ['0 0 0 0 rgba(147, 51, 234, 0.7)', '0 0 0 20px rgba(147, 51, 234, 0)', '0 0 0 0 rgba(147, 51, 234, 0)'],
      } : {}}
      transition={{
        duration: 2,
        repeat: isActive ? Infinity : 0,
        ease: "easeInOut"
      }}
      className="relative"
    >
      {children}
      {isActive && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white px-3 py-1 rounded-lg text-sm whitespace-nowrap"
        >
          Click here to {step}
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-purple-600 rotate-45"></div>
        </motion.div>
      )}
    </motion.div>
  );
}

// Feature Tour Component
export function FeatureTour({ features }: { features: Array<{ name: string; description: string; icon: React.ReactNode }> }) {
  const [activeFeature, setActiveFeature] = useState(0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {features.map((feature, index) => (
        <motion.div
          key={feature.name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          onMouseEnter={() => setActiveFeature(index)}
          className="relative"
        >
          <AnimatedCard delay={index * 0.1} className={`cursor-pointer transition-all duration-300 ${
            activeFeature === index ? 'ring-2 ring-purple-500 scale-105' : ''
          }`}>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                {feature.icon}
              </div>
              <div>
                <h3 className="font-semibold text-lg">{feature.name}</h3>
                <p className="text-sm text-purple-200">{feature.description}</p>
              </div>
            </div>
          </AnimatedCard>
        </motion.div>
      ))}
    </div>
  );
}

// Achievement Unlock Animation
export function AchievementUnlock({ achievement, onComplete }: { 
  achievement: { title: string; description: string; icon: React.ReactNode; rarity: string };
  onComplete: () => void;
}) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      onComplete();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const getRarityColors = () => {
    switch (achievement.rarity) {
      case 'Legendary': return 'from-yellow-400 to-orange-500';
      case 'Epic': return 'from-purple-400 to-pink-500';
      case 'Rare': return 'from-blue-400 to-cyan-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: -50 }}
          className="fixed top-8 right-8 z-50 max-w-sm"
        >
          <AnimatedCard className="border-2 bg-gradient-to-r from-purple-800/50 to-pink-800/50">
            <div className="flex items-center space-x-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className={`w-16 h-16 bg-gradient-to-r ${getRarityColors()} rounded-full flex items-center justify-center`}
              >
                <div className="text-white text-2xl">
                  {achievement.icon}
                </div>
              </motion.div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <h4 className="font-bold text-white">Achievement Unlocked!</h4>
                </div>
                <h5 className="font-semibold text-purple-100">{achievement.title}</h5>
                <p className="text-sm text-purple-200">{achievement.description}</p>
              </div>
            </div>
          </AnimatedCard>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
