/**
 * Hyper-Engaging Student Experience - Streak Preservation
 * Duolingo-style streak mechanics with visual feedback and retention psychology
 * Zero-latency optimistic updates with fluid animations
 */

import { useEffect, useState } from 'react';
import { useGamificationStore } from '@/store/useGamificationStore';
import { Flame, Shield, Clock, Zap, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export function StreakPreservation() {
  const { currentStreak, longestStreak, useStreakFreeze, incrementStreak } = useGamificationStore();
  const [showStreakAnimation, setShowStreakAnimation] = useState(false);
  const [timeUntilReset, setTimeUntilReset] = useState(24 * 60 * 60 * 1000); // 24 hours in ms

  // Calculate time until streak reset
  useEffect(() => {
    const calculateTimeUntilReset = () => {
      const now = new Date();
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);
      return endOfDay.getTime() - now.getTime();
    };

    setTimeUntilReset(calculateTimeUntilReset());

    const interval = setInterval(() => {
      setTimeUntilReset(calculateTimeUntilReset());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Trigger streak animation on mount or streak change
  useEffect(() => {
    if (currentStreak > 0) {
      setShowStreakAnimation(true);
      const timer = setTimeout(() => setShowStreakAnimation(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [currentStreak]);

  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const handleIncrementStreak = async () => {
    await incrementStreak();
  };

  const handleUseStreakFreeze = () => {
    useStreakFreeze();
  };

  const streakPercentage = Math.min(100, (currentStreak / 30) * 100);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Main Streak Display */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-3xl p-8 shadow-2xl"
      >
        {/* Animated background particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full"
              animate={{
                y: [0, -100, 0],
                x: [0, Math.random() * 100 - 50, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 flex items-center justify-between">
          {/* Streak Counter */}
          <div className="flex items-center gap-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStreak}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="relative"
              >
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <Flame className={cn(
                    "w-12 h-12",
                    currentStreak >= 7 ? "text-yellow-300" : "text-white",
                    showStreakAnimation && "animate-pulse"
                  )} />
                </div>
                {showStreakAnimation && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    exit={{ scale: 0 }}
                    className="absolute inset-0 bg-white/30 rounded-2xl"
                  />
                )}
              </motion.div>
            </AnimatePresence>

            <div className="text-white">
              <motion.p
                key={currentStreak}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-5xl font-bold"
              >
                {currentStreak}
              </motion.p>
              <p className="text-white/80 text-sm font-medium">
                Day Streak
              </p>
            </div>
          </div>

          {/* Streak Progress */}
          <div className="flex-1 mx-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/80 text-sm font-medium">
                Progress to 30-day badge
              </span>
              <span className="text-white text-sm font-bold">
                {currentStreak}/30
              </span>
            </div>
            <div className="h-3 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-white rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${streakPercentage}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Longest Streak */}
          <div className="text-right text-white">
            <div className="flex items-center gap-2 justify-end">
              <Trophy className="w-5 h-5 text-yellow-300" />
              <span className="text-2xl font-bold">{longestStreak}</span>
            </div>
            <p className="text-white/80 text-sm font-medium">
              Best
            </p>
          </div>
        </div>
      </motion.div>

      {/* Time Until Reset */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">
                Streak resets in
              </p>
              <p className="text-sm text-gray-600">
                Complete a lesson to maintain your streak
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">
              {formatTime(timeUntilReset)}
            </p>
            <p className="text-sm text-gray-600">
              remaining
            </p>
          </div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleIncrementStreak}
          className="flex items-center justify-center gap-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-shadow min-h-[56px]"
        >
          <Zap className="w-5 h-5" />
          <span>Complete Lesson</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleUseStreakFreeze}
          className="flex items-center justify-center gap-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-4 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-shadow min-h-[56px]"
        >
          <Shield className="w-5 h-5" />
          <span>Use Streak Freeze</span>
        </motion.button>
      </div>

      {/* Milestone Badges */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
      >
        <h3 className="font-semibold text-gray-900 mb-4">
          Streak Milestones
        </h3>
        <div className="grid grid-cols-5 gap-2">
          {[7, 14, 21, 30, 60].map((milestone, index) => {
            const isUnlocked = currentStreak >= milestone;
            const isNext = !isUnlocked && (index === 0 || currentStreak >= [7, 14, 21, 30, 60][index - 1]);
            
            return (
              <motion.div
                key={milestone}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className={cn(
                  "relative flex flex-col items-center justify-center p-3 rounded-xl transition-all",
                  isUnlocked
                    ? "bg-gradient-to-br from-yellow-400 to-orange-500 text-white"
                    : isNext
                    ? "bg-blue-100 text-blue-600 ring-2 ring-blue-500"
                    : "bg-gray-100 text-gray-400"
                )}
              >
                <Flame className="w-6 h-6 mb-1" />
                <span className="text-xs font-bold">{milestone}</span>
                {isUnlocked && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center"
                  >
                    <span className="text-white text-xs">✓</span>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}

/**
 * XP Progress Bar Component
 * Visual feedback for XP gains with smooth animations
 */
export function XPProgressBar() {
  const { xp, level, xpToNextLevel, xpProgress } = useGamificationStore();

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
            <Trophy className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">
              Level {level}
            </p>
            <p className="text-sm text-gray-600">
              {xp} XP
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">
            {xpToNextLevel} XP to next level
          </p>
        </div>
      </div>

      <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${xpProgress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </motion.div>
  );
}
