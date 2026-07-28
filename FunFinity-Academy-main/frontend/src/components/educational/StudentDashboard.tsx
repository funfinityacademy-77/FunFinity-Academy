import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Trophy,
  Zap,
  Target,
  Calendar,
  Clock,
  Star,
  Flame,
  Brain,
  Rocket,
  Sparkles,
  Award,
  TrendingUp,
  Users,
  Gamepad2
} from 'lucide-react';
import { AnimatedCard, AnimatedButton, FloatingBadge, useGamifiedTheme } from './GamifiedTheme';
import { useAppStore, appActions } from '@/store/AppStore';
import { mockApi } from '@/services/apiService';

interface StudentStats {
  level: number;
  xp: number;
  xpToNext: number;
  streak: number;
  totalPoints: number;
  completedLessons: number;
  timeSpent: number;
  achievements: number;
}

interface Course {
  id: string;
  title: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
  icon: React.ReactNode;
  color: string;
  nextLesson?: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
}

export function StudentDashboard() {
  const { theme, animationsEnabled } = useGamifiedTheme();
  const { state, dispatch } = useAppStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'achievements'>('overview');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showCourseDetails, setShowCourseDetails] = useState(false);

  // Load data on component mount
  useEffect(() => {
    loadStudentData();
  }, []);

  const loadStudentData = async () => {
    try {
      // Load student stats
      const statsResponse = await mockApi.mockGetStudentStats();
      if (statsResponse.success && statsResponse.data) {
        dispatch(appActions.setStudentStats(statsResponse.data));
      }

      // Load courses
      const coursesResponse = await mockApi.mockGetCourses();
      if (coursesResponse.success && coursesResponse.data) {
        dispatch(appActions.setCourses(coursesResponse.data));
      }

      // Load achievements
      const achievementsResponse = await mockApi.mockGetAchievements();
      if (achievementsResponse.success && achievementsResponse.data) {
        dispatch(appActions.setAchievements(achievementsResponse.data));
      }
    } catch (error) {
      dispatch(appActions.setError('Failed to load student data'));
    }
  };

  const handleContinueCourse = async (course: Course) => {
    try {
      dispatch(appActions.setLoading(true));

      // Navigate to course details or next lesson
      setSelectedCourse(course);
      setShowCourseDetails(true);

      // Update course progress (simulate)
      const newProgress = Math.min(course.progress + 5, 100);
      dispatch(appActions.updateCourseProgress(course.id, newProgress));

      dispatch(appActions.addNotification(`Continuing ${course.title}`, 'success'));
    } catch (error) {
      dispatch(appActions.setError('Failed to continue course'));
    } finally {
      dispatch(appActions.setLoading(false));
    }
  };

  const handleAchievementClick = (achievement: Achievement) => {
    if (!achievement.unlocked) {
      dispatch(appActions.addNotification('Keep working to unlock this achievement!', 'info'));
    } else {
      dispatch(appActions.addNotification(`Achievement unlocked: ${achievement.title}`, 'success'));
    }
  };

  const handleViewStats = (statType: string) => {
    dispatch(appActions.addNotification(`Viewing ${statType} details`, 'info'));
    // Could open a modal or navigate to detailed stats page
  };

  const [courses, setCourses] = useState<Course[]>([
    {
      id: '1',
      title: 'Mathematics Mastery',
      progress: 75,
      totalLessons: 20,
      completedLessons: 15,
      difficulty: 'Intermediate',
      estimatedTime: '2h 30m',
      icon: <Brain className="w-5 h-5" />,
      color: 'purple',
      nextLesson: 'Advanced Algebra'
    },
    {
      id: '2',
      title: 'Science Explorer',
      progress: 60,
      totalLessons: 25,
      completedLessons: 15,
      difficulty: 'Beginner',
      estimatedTime: '3h 15m',
      icon: <Rocket className="w-5 h-5" />,
      color: 'blue',
      nextLesson: 'Chemistry Basics'
    },
    {
      id: '3',
      title: 'Creative Writing',
      progress: 40,
      totalLessons: 15,
      completedLessons: 6,
      difficulty: 'Advanced',
      estimatedTime: '1h 45m',
      icon: <BookOpen className="w-5 h-5" />,
      color: 'green',
      nextLesson: 'Story Structure'
    }
  ]);

  const [achievements] = useState<Achievement[]>([
    {
      id: '1',
      title: 'First Steps',
      description: 'Complete your first lesson',
      icon: <Star className="w-6 h-6" />,
      unlocked: true,
      rarity: 'Common'
    },
    {
      id: '2',
      title: 'Week Warrior',
      description: 'Maintain a 7-day streak',
      icon: <Flame className="w-6 h-6" />,
      unlocked: true,
      rarity: 'Rare'
    },
    {
      id: '3',
      title: 'Knowledge Seeker',
      description: 'Complete 100 lessons',
      icon: <Trophy className="w-6 h-6" />,
      unlocked: false,
      rarity: 'Epic'
    },
    {
      id: '4',
      title: 'Master Mind',
      description: 'Reach level 50',
      icon: <Award className="w-6 h-6" />,
      unlocked: false,
      rarity: 'Legendary'
    }
  ]);

  const xpProgress = (state.studentStats?.xp || 0) / (state.studentStats?.xpToNext || 1) * 100;

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Common': return 'border-gray-400 bg-gray-500/20';
      case 'Rare': return 'border-blue-400 bg-blue-500/20';
      case 'Epic': return 'border-purple-400 bg-purple-500/20';
      case 'Legendary': return 'border-yellow-400 bg-yellow-500/20';
      default: return 'border-gray-400 bg-gray-500/20';
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
        <div className="flex items-center space-x-4">
          <motion.div
            animate={animationsEnabled ? {
              rotate: [0, 5, -5, 0],
            } : {}}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center"
          >
            <Sparkles className="w-6 h-6 text-white" />
          </motion.div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Welcome back, Student!
            </h1>
            <p className="text-purple-200">Ready to continue your learning adventure?</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <FloatingBadge>
            <Flame className="w-4 h-4 mr-1" />
            {state.studentStats?.streak || 0} day streak
          </FloatingBadge>
          <FloatingBadge color="yellow">
            <Zap className="w-4 h-4 mr-1" />
            Level {state.studentStats?.level || 1}
          </FloatingBadge>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <AnimatedCard delay={0.1}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-200 text-sm">Total XP</p>
              <p className="text-2xl font-bold">{state.studentStats?.totalPoints?.toLocaleString() || 0}</p>
            </div>
            <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
              <Zap className="w-5 h-5 text-purple-400" />
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard delay={0.2}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-200 text-sm">Completed</p>
              <p className="text-2xl font-bold">{state.studentStats?.completedLessons || 0}</p>
            </div>
            <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
              <Target className="w-5 h-5 text-green-400" />
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard delay={0.3}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-200 text-sm">Time Spent</p>
              <p className="text-2xl font-bold">{state.studentStats?.timeSpent || 0}h</p>
            </div>
            <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-400" />
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard delay={0.4}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-200 text-sm">Achievements</p>
              <p className="text-2xl font-bold">{state.studentStats?.achievements || 0}</p>
            </div>
            <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
              <Trophy className="w-5 h-5 text-yellow-400" />
            </div>
          </div>
        </AnimatedCard>
      </div>

      {/* Level Progress */}
      <AnimatedCard delay={0.5}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center">
              <Rocket className="w-5 h-5 mr-2 text-purple-400" />
              Level Progress
            </h3>
            <span className="text-sm text-purple-200">
              {state.studentStats?.xp || 0} / {state.studentStats?.xpToNext || 100} XP
            </span>
          </div>
          <div className="w-full bg-purple-900/30 rounded-full h-4 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${xpProgress}%` }}
              transition={{ duration: 1, delay: 0.8 }}
            />
          </div>
          <p className="text-sm text-purple-200">
            {(state.studentStats?.xpToNext || 100) - (state.studentStats?.xp || 0)} XP to next level
          </p>
        </div>
      </AnimatedCard>

      {/* Navigation Tabs */}
      <div className="flex space-x-2 p-1 bg-purple-800/20 rounded-xl">
        {(['overview', 'courses', 'achievements'] as const).map((tab) => (
          <motion.button
            key={tab}
            whileHover={animationsEnabled ? { scale: 1.05 } : {}}
            whileTap={animationsEnabled ? { scale: 0.95 } : {}}
            onClick={() => setActiveTab(tab)}
            className={`
              flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-300
              ${activeTab === tab
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                : 'text-purple-200 hover:text-white hover:bg-purple-700/30'
              }
            `}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </motion.button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Recent Courses */}
            <AnimatedCard delay={0.6}>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-purple-400" />
                Continue Learning
              </h3>
              <div className="space-y-3">
                {courses.slice(0, 3).map((course, index) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-purple-800/20 rounded-lg hover:bg-purple-700/30 transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 bg-${course.color}-500/20 rounded-lg flex items-center justify-center`}>
                        {course.icon}
                      </div>
                      <div>
                        <p className="font-medium">{course.title}</p>
                        <p className="text-sm text-purple-200">{course.nextLesson}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{course.progress}%</p>
                      <div className="w-16 bg-purple-900/30 rounded-full h-2 mt-1">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </AnimatedCard>

            {/* Recent Achievements */}
            <AnimatedCard delay={0.7}>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-purple-400" />
                Recent Achievements
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {achievements.filter(a => a.unlocked).slice(0, 4).map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    className={`
                      p-3 rounded-lg border-2 text-center
                      ${getRarityColor(achievement.rarity)}
                      ${achievement.unlocked ? 'opacity-100' : 'opacity-50'}
                    `}
                  >
                    <div className="flex justify-center mb-2">
                      {achievement.icon}
                    </div>
                    <p className="font-medium text-sm">{achievement.title}</p>
                    <p className="text-xs text-purple-200 mt-1">{achievement.description}</p>
                  </motion.div>
                ))}
              </div>
            </AnimatedCard>
          </motion.div>
        )}

        {activeTab === 'courses' && (
          <motion.div
            key="courses"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {courses.map((course, index) => (
              <AnimatedCard key={course.id} delay={0.6 + index * 0.1}>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 bg-${course.color}-500/20 rounded-xl flex items-center justify-center`}>
                      {course.icon}
                    </div>
                    <FloatingBadge color={course.color}>
                      {course.difficulty}
                    </FloatingBadge>
                  </div>

                  <div>
                    <h4 className="font-semibold text-lg">{course.title}</h4>
                    <p className="text-sm text-purple-200 mt-1">{course.nextLesson}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progress</span>
                      <span>{course.completedLessons}/{course.totalLessons}</span>
                    </div>
                    <div className="w-full bg-purple-900/30 rounded-full h-3">
                      <motion.div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${course.progress}%` }}
                        transition={{ duration: 0.8, delay: 0.8 + index * 0.1 }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-purple-200">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {course.estimatedTime}
                    </div>
                    <AnimatedButton
                      variant="accent"
                      className="text-sm py-2 px-4"
                      onClick={() => handleContinueCourse(course)}
                      disabled={state.loading}
                    >
                      {state.loading ? 'Loading...' : 'Continue'}
                    </AnimatedButton>
                  </div>
                </div>
              </AnimatedCard>
            ))}
          </motion.div>
        )}

        {activeTab === 'achievements' && (
          <motion.div
            key="achievements"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {achievements.map((achievement, index) => (
              <AnimatedCard key={achievement.id} delay={0.6 + index * 0.1}>
                <div className={`
                  text-center p-4 rounded-lg border-2
                  ${getRarityColor(achievement.rarity)}
                  ${achievement.unlocked ? 'opacity-100' : 'opacity-50'}
                `}>
                  <motion.div
                    animate={achievement.unlocked && animationsEnabled ? {
                      y: [0, -5, 0],
                    } : {}}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: index * 0.2
                    }}
                    className="flex justify-center mb-3"
                  >
                    {achievement.icon}
                  </motion.div>
                  <h4 className="font-semibold">{achievement.title}</h4>
                  <p className="text-sm text-purple-200 mt-2">{achievement.description}</p>
                  <div className="mt-3">
                    <FloatingBadge color={achievement.rarity === 'Legendary' ? 'yellow' : achievement.rarity === 'Epic' ? 'purple' : achievement.rarity === 'Rare' ? 'blue' : 'gray'}>
                      {achievement.rarity}
                    </FloatingBadge>
                  </div>
                </div>
              </AnimatedCard>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
