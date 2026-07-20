import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  XCircle,
  Lightbulb,
  Brain,
  Zap,
  Target,
  Award,
  Star,
  Trophy,
  Volume2,
  VolumeX,
  BookOpen,
  Video,
  FileText,
  Code,
  Palette,
  Clock
} from 'lucide-react';
import { AnimatedCard, AnimatedButton, FloatingBadge, useGamifiedTheme } from './GamifiedTheme';
import { useAppStore, appActions } from '@/store/AppStore';
import { mockApi } from '@/services/apiService';

interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'reading' | 'quiz' | 'interactive' | 'coding';
  content: string;
  duration: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  completed: boolean;
  xpReward: number;
  icon: React.ReactNode;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  points: number;
}

interface InteractiveElement {
  type: 'drag-drop' | 'matching' | 'simulation';
  content: any;
}

export function InteractiveLearningModule() {
  const { theme, animationsEnabled } = useGamifiedTheme();
  const { state, dispatch } = useAppStore();
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [volume, setVolume] = useState(true);
  const [currentModule, setCurrentModule] = useState<'math' | 'science' | 'coding'>('math');
  const [currentStep, setCurrentStep] = useState(0);
  const [codeOutput, setCodeOutput] = useState('');
  const [isRunningCode, setIsRunningCode] = useState(false);

  const lessons: Record<string, Lesson[]> = {
    math: [
      {
        id: '1',
        title: 'Introduction to Algebra',
        type: 'video',
        content: 'Learn the basics of algebraic expressions and equations...',
        duration: '15 min',
        difficulty: 'Easy',
        completed: false,
        xpReward: 50,
        icon: <Brain className="w-5 h-5" />
      },
      {
        id: '2',
        title: 'Solving Linear Equations',
        type: 'interactive',
        content: 'Interactive practice with step-by-step equation solving...',
        duration: '20 min',
        difficulty: 'Medium',
        completed: false,
        xpReward: 75,
        icon: <Target className="w-5 h-5" />
      },
      {
        id: '3',
        title: 'Algebra Quiz',
        type: 'quiz',
        content: 'Test your knowledge with comprehensive quiz...',
        duration: '10 min',
        difficulty: 'Medium',
        completed: false,
        xpReward: 100,
        icon: <Award className="w-5 h-5" />
      }
    ],
    science: [
      {
        id: '1',
        title: 'Chemistry Basics',
        type: 'video',
        content: 'Introduction to atoms, molecules, and chemical reactions...',
        duration: '18 min',
        difficulty: 'Easy',
        completed: false,
        xpReward: 60,
        icon: <Lightbulb className="w-5 h-5" />
      },
      {
        id: '2',
        title: 'Virtual Lab Simulation',
        type: 'interactive',
        content: 'Conduct virtual chemistry experiments safely...',
        duration: '25 min',
        difficulty: 'Hard',
        completed: false,
        xpReward: 120,
        icon: <Zap className="w-5 h-5" />
      }
    ],
    coding: [
      {
        id: '1',
        title: 'Python Fundamentals',
        type: 'coding',
        content: 'Learn Python basics with interactive coding exercises...',
        duration: '30 min',
        difficulty: 'Easy',
        completed: false,
        xpReward: 80,
        icon: <Code className="w-5 h-5" />
      },
      {
        id: '2',
        title: 'Build Your First Game',
        type: 'interactive',
        content: 'Create a simple game using Python...',
        duration: '45 min',
        difficulty: 'Medium',
        completed: false,
        xpReward: 150,
        icon: <Palette className="w-5 h-5" />
      }
    ]
  };

  const quizQuestions: QuizQuestion[] = [
    {
      id: '1',
      question: 'What is the value of x in the equation: 2x + 5 = 15?',
      options: ['x = 5', 'x = 10', 'x = 7.5', 'x = 3'],
      correctAnswer: 0,
      explanation: '2x + 5 = 15 → 2x = 10 → x = 5',
      points: 10
    },
    {
      id: '2',
      question: 'Which of the following is a quadratic equation?',
      options: ['y = 2x + 3', 'y = x² + 4x + 4', 'y = 3x³ - 2x', 'y = 1/x'],
      correctAnswer: 1,
      explanation: 'A quadratic equation has the form ax² + bx + c = 0',
      points: 15
    },
    {
      id: '3',
      question: 'What is the solution to: (x - 3)² = 16?',
      options: ['x = 7', 'x = -1', 'x = 7 or -1', 'x = 19'],
      correctAnswer: 2,
      explanation: '(x - 3)² = 16 → x - 3 = ±4 → x = 7 or x = -1',
      points: 20
    }
  ];

  const handleStepClick = (stepIndex: number) => {
    setCurrentStep(stepIndex);
    dispatch(appActions.addNotification(`Step ${stepIndex + 1} selected`, 'info'));
    // Could reveal step content or navigate to step details
  };

  const handleCodeRun = async (code: string) => {
    try {
      setIsRunningCode(true);
      // Simulate code execution
      await new Promise(resolve => setTimeout(resolve, 2000));
      setCodeOutput('Hello, World!\nCode executed successfully!');
      dispatch(appActions.addNotification('Code executed successfully!', 'success'));
    } catch (error) {
      setCodeOutput('Error: Code execution failed');
      dispatch(appActions.addNotification('Code execution failed', 'error'));
    } finally {
      setIsRunningCode(false);
    }
  };

  const handleVideoPlay = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      simulateProgress();
      dispatch(appActions.addNotification('Video started', 'info'));
    } else {
      dispatch(appActions.addNotification('Video paused', 'info'));
    }
  };

  const handleLessonComplete = async (lessonId: string, xp: number) => {
    try {
      dispatch(appActions.setLoading(true));
      const response = await mockApi.mockCompleteLesson(lessonId, xp);

      if (response.success) {
        dispatch(appActions.completeLesson(lessonId, xp));
        dispatch(appActions.addNotification(`Lesson completed! Earned ${xp} XP`, 'success'));

        // Check for new achievements
        if (state.studentStats?.completedLessons === 10) {
          dispatch(appActions.unlockAchievement('first-10-lessons'));
          dispatch(appActions.addNotification('Achievement unlocked: First 10 Lessons!', 'success'));
        }
      }
    } catch (error) {
      dispatch(appActions.setError('Failed to complete lesson'));
    } finally {
      dispatch(appActions.setLoading(false));
    }
  };

  const startLesson = (lesson: Lesson) => {
    setCurrentLesson(lesson);
    setProgress(0);
    setShowQuiz(false);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setCurrentStep(0);
    setCodeOutput('');

    dispatch(appActions.setCurrentLesson(lesson));
    dispatch(appActions.addNotification(`Started ${lesson.title}`, 'info'));

    if (lesson.type === 'video') {
      setIsPlaying(true);
      simulateProgress();
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    setShowResult(true);

    const question = quizQuestions[0]; // Simplified for demo
    if (answerIndex === question.correctAnswer) {
      setScore(score + question.points);
      dispatch(appActions.addNotification(`Correct! +${question.points} points`, 'success'));
    } else {
      dispatch(appActions.addNotification('Incorrect answer. Try again!', 'error'));
    }
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-5 h-5" />;
      case 'reading': return <BookOpen className="w-5 h-5" />;
      case 'quiz': return <Award className="w-5 h-5" />;
      case 'interactive': return <Target className="w-5 h-5" />;
      case 'coding': return <Code className="w-5 h-5" />;
      default: return <BookOpen className="w-5 h-5" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'Medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'Hard': return 'text-red-400 bg-red-500/20 border-red-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Interactive Learning Center
          </h1>
          <p className="text-purple-200">Choose your learning path and start your adventure</p>
        </div>

        <div className="flex items-center space-x-4">
          <FloatingBadge>
            <Trophy className="w-4 h-4 mr-1" />
            {score} points earned
          </FloatingBadge>
          <AnimatedButton
            variant="ghost"
            onClick={() => setVolume(!volume)}
            className="p-2"
          >
            {volume ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </AnimatedButton>
        </div>
      </motion.div>

      {/* Module Selection */}
      <div className="flex space-x-2 p-1 bg-purple-800/20 rounded-xl">
        {(['math', 'science', 'coding'] as const).map((module) => (
          <motion.button
            key={module}
            whileHover={animationsEnabled ? { scale: 1.05 } : {}}
            whileTap={animationsEnabled ? { scale: 0.95 } : {}}
            onClick={() => setCurrentModule(module)}
            className={`
              flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300
              ${currentModule === module
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                : 'text-purple-200 hover:text-white hover:bg-purple-700/30'
              }
            `}
          >
            <div className="flex items-center justify-center space-x-2">
              {module === 'math' && <Brain className="w-5 h-5" />}
              {module === 'science' && <Lightbulb className="w-5 h-5" />}
              {module === 'coding' && <Code className="w-5 h-5" />}
              <span>{module.charAt(0).toUpperCase() + module.slice(1)}</span>
            </div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {!currentLesson ? (
          <motion.div
            key="lessons"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {lessons[currentModule].map((lesson, index) => (
              <AnimatedCard key={lesson.id} delay={index * 0.1}>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                      {getLessonIcon(lesson.type)}
                    </div>
                    <FloatingBadge color={lesson.difficulty === 'Easy' ? 'green' : lesson.difficulty === 'Medium' ? 'yellow' : 'red'}>
                      {lesson.difficulty}
                    </FloatingBadge>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg">{lesson.title}</h3>
                    <p className="text-sm text-purple-200 mt-1">{lesson.content}</p>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4 text-purple-200">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {lesson.duration}
                      </div>
                      <div className="flex items-center">
                        <Zap className="w-4 h-4 mr-1" />
                        {lesson.xpReward} XP
                      </div>
                    </div>
                  </div>

                  <AnimatedButton
                    variant="primary"
                    className="w-full"
                    onClick={() => startLesson(lesson)}
                  >
                    {lesson.completed ? 'Review' : 'Start Lesson'}
                  </AnimatedButton>
                </div>
              </AnimatedCard>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="lesson"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="max-w-4xl mx-auto"
          >
            <AnimatedCard>
              <div className="space-y-6">
                {/* Lesson Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <AnimatedButton
                      variant="ghost"
                      onClick={() => setCurrentLesson(null)}
                      className="p-2"
                    >
                      <RotateCcw className="w-5 h-5" />
                    </AnimatedButton>
                    <div>
                      <h2 className="text-2xl font-bold">{currentLesson.title}</h2>
                      <p className="text-purple-200">{currentLesson.content}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <FloatingBadge>
                      <Zap className="w-4 h-4 mr-1" />
                      {currentLesson.xpReward} XP
                    </FloatingBadge>
                  </div>
                </div>

                {/* Lesson Content Based on Type */}
                {currentLesson.type === 'video' && (
                  <div className="space-y-4">
                    <div className="aspect-video bg-purple-900/30 rounded-xl flex items-center justify-center">
                      <div className="text-center space-y-4">
                        <motion.div
                          animate={isPlaying ? {
                            rotate: 360,
                          } : {}}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "linear"
                          }}
                          className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto"
                        >
                          <Video className="w-10 h-10 text-purple-400" />
                        </motion.div>

                        <AnimatedButton
                          variant="primary"
                          onClick={handleVideoPlay}
                          className="px-8"
                        >
                          {isPlaying ? <Pause className="w-5 h-5 mr-2" /> : <Play className="w-5 h-5 mr-2" />}
                          {isPlaying ? 'Pause' : 'Play'}
                        </AnimatedButton>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progress</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="w-full bg-purple-900/30 rounded-full h-3">
                        <motion.div
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {currentLesson.type === 'interactive' && (
                  <div className="space-y-6">
                    <div className="bg-purple-900/20 rounded-xl p-8">
                      <h3 className="text-xl font-semibold mb-4">Interactive Exercise</h3>
                      <div className="space-y-4">
                        <p className="text-purple-200">
                          Solve the equation step by step. Click on the steps to reveal the solution:
                        </p>

                        <div className="space-y-3">
                          {['2x + 5 = 15', '2x = 15 - 5', '2x = 10', 'x = 10 ÷ 2', 'x = 5'].map((step, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.5 }}
                              className="p-3 bg-purple-800/30 rounded-lg border border-purple-600/30 cursor-pointer hover:bg-purple-700/30 transition-all duration-300"
                              onClick={() => handleStepClick(index)}
                            >
                              <code className="text-purple-100">{step}</code>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  </div>
                )}

              {currentLesson.type === 'quiz' && (
                <div className="space-y-6">
                  <div className="bg-purple-900/20 rounded-xl p-8">
                    <h3 className="text-xl font-semibold mb-6">Knowledge Check</h3>

                    {!showQuiz ? (
                      <div className="text-center space-y-4">
                        <p className="text-purple-200">Ready to test your knowledge?</p>
                        <AnimatedButton
                          variant="primary"
                          onClick={() => {
                            setShowQuiz(true);
                            dispatch(appActions.addNotification('Quiz started!', 'info'));
                          }}
                          className="px-8"
                        >
                          Start Quiz
                        </AnimatedButton>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {quizQuestions.map((question, qIndex) => (
                          <div key={question.id} className="space-y-4">
                            <h4 className="font-semibold">{question.question}</h4>
                            <div className="grid grid-cols-1 gap-3">
                              {question.options.map((option, oIndex) => (
                                <motion.button
                                  key={oIndex}
                                  whileHover={animationsEnabled ? { scale: 1.02 } : {}}
                                  whileTap={animationsEnabled ? { scale: 0.98 } : {}}
                                  onClick={() => handleAnswerSelect(oIndex)}
                                  disabled={showResult}
                                  className={`
                                      p-4 rounded-lg border-2 text-left transition-all duration-300
                                      ${selectedAnswer === oIndex
                                      ? showResult && oIndex === question.correctAnswer
                                        ? 'border-green-500 bg-green-500/20'
                                        : showResult
                                          ? 'border-red-500 bg-red-500/20'
                                          : 'border-purple-500 bg-purple-500/20'
                                      : 'border-purple-600/30 hover:border-purple-500/50'
                                    }
                                    `}
                                >
                                  <div className="flex items-center justify-between">
                                    <span>{option}</span>
                                    {showResult && oIndex === question.correctAnswer && (
                                      <CheckCircle className="w-5 h-5 text-green-400" />
                                    )}
                                    {showResult && selectedAnswer === oIndex && oIndex !== question.correctAnswer && (
                                      <XCircle className="w-5 h-5 text-red-400" />
                                    )}
                                  </div>
                                </motion.button>
                              ))}
                            </div>

                            {showResult && selectedAnswer === question.correctAnswer && (
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-3 bg-green-500/20 border border-green-500/30 rounded-lg"
                              >
                                <p className="text-green-400">
                                  <CheckCircle className="w-4 h-4 inline mr-2" />
                                  Correct! {question.explanation}
                                </p>
                              </motion.div>
                            )}

                            {showResult && selectedAnswer !== null && selectedAnswer !== question.correctAnswer && (
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg"
                              >
                                <p className="text-yellow-400">
                                  <Lightbulb className="w-4 h-4 inline mr-2" />
                                  {question.explanation}
                                </p>
                              </motion.div>
                            )}
                          </div>
                        ))}

                        {showResult && (
                          <div className="text-center space-y-4">
                            <div className="text-2xl font-bold">
                              Score: {score} / {quizQuestions.reduce((sum, q) => sum + q.points, 0)} points
                            </div>
                            <AnimatedButton
                              variant="primary"
                              onClick={() => {
                                if (currentLesson) {
                                  handleLessonComplete(currentLesson.id, currentLesson.xpReward);
                                }
                              }}
                              className="px-8"
                            >
                              Complete Lesson
                            </AnimatedButton>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {currentLesson.type === 'coding' && (
                <div className="space-y-6">
                  <div className="bg-purple-900/20 rounded-xl p-8">
                    <h3 className="text-xl font-semibold mb-4">Coding Challenge</h3>
                    <div className="space-y-4">
                      <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm">
                        <div className="text-green-400"># Welcome to Python Basics!</div>
                        <div className="text-blue-400">print</div>
                        <div className="text-yellow-300">("Hello, World!")</div>
                        <div className="text-purple-400"># Try changing the message above</div>
                      </div>

                      <div className="flex space-x-4">
                        <AnimatedButton variant="primary">
                          <Play className="w-4 h-4 mr-2" />
                          Run Code
                        </AnimatedButton>
                        <AnimatedButton variant="secondary">
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Reset
                        </AnimatedButton>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </AnimatedCard>
          </motion.div>
        )}
    </AnimatePresence>
    </div >
  );
}
