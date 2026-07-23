/**
 * Parent Transparency Feed
 * Executive-level data tracking for parents with clean statistical visualizations
 * Optimized for fast rendering and immediate clarity
 */

import { useState, useMemo } from 'react';
import { Clock, TrendingUp, BookOpen, Target, AlertCircle, ChevronRight, Calendar, BarChart3, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StudentData {
  id: string;
  name: string;
  grade: string;
  weeklyTimeSpent: number; // in minutes
  subjectPerformance: SubjectPerformance[];
  strengths: string[];
  weaknesses: string[];
  streak: number;
  lastActive: string;
}

interface SubjectPerformance {
  subject: string;
  score: number;
  trend: 'up' | 'down' | 'stable';
  timeSpent: number;
}

interface TransparencyFeedProps {
  studentData: StudentData;
}

export function ParentTransparencyFeed({ studentData }: TransparencyFeedProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'semester'>('week');
  const [activeTab, setActiveTab] = useState<'overview' | 'subjects' | 'progress'>('overview');

  const totalWeeklyTime = useMemo(() => {
    return studentData.subjectPerformance.reduce((sum, subject) => sum + subject.timeSpent, 0);
  }, [studentData.subjectPerformance]);

  const averageScore = useMemo(() => {
    const scores = studentData.subjectPerformance.map(s => s.score);
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }, [studentData.subjectPerformance]);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1">{studentData.name}'s Progress</h1>
            <p className="text-white/80">Grade {studentData.grade} • Last active {studentData.lastActive}</p>
          </div>
          <div className="flex items-center gap-2 bg-white/20 rounded-xl px-4 py-2">
            <Clock className="w-5 h-5" />
            <span className="font-semibold">{studentData.streak} day streak</span>
          </div>
        </div>
      </div>

      {/* Period Selector */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
        {(['week', 'month', 'semester'] as const).map((period) => (
          <button
            key={period}
            onClick={() => setSelectedPeriod(period)}
            className={cn(
              "flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all",
              selectedPeriod === period
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            {period.charAt(0).toUpperCase() + period.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-gray-200">
        {(['overview', 'subjects', 'progress'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "relative py-3 px-4 text-sm font-medium transition-colors",
              activeTab === tab
                ? "text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {activeTab === tab && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
              />
            )}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard
              icon={<Clock className="w-6 h-6" />}
              label="Time This Week"
              value={formatTime(totalWeeklyTime)}
              trend="+12%"
              trendUp
              color="blue"
            />
            <MetricCard
              icon={<Target className="w-6 h-6" />}
              label="Average Score"
              value={`${Math.round(averageScore)}%`}
              trend="+5%"
              trendUp
              color="green"
            />
            <MetricCard
              icon={<BookOpen className="w-6 h-6" />}
              label="Modules Completed"
              value="12"
              trend="+2"
              trendUp
              color="purple"
            />
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Strengths
              </h3>
              <div className="space-y-3">
                {studentData.strengths.map((strength, index) => (
                  <motion.div
                    key={strength}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3 p-3 bg-green-50 rounded-lg"
                  >
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-sm text-gray-700">{strength}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                Areas for Improvement
              </h3>
              <div className="space-y-3">
                {studentData.weaknesses.map((weakness, index) => (
                  <motion.div
                    key={weakness}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg"
                  >
                    <div className="w-2 h-2 bg-orange-500 rounded-full" />
                    <span className="text-sm text-gray-700">{weakness}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subjects Tab */}
      {activeTab === 'subjects' && (
        <div className="space-y-4">
          {studentData.subjectPerformance.map((subject, index) => (
            <motion.div
              key={subject.subject}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{subject.subject}</h3>
                    <p className="text-sm text-gray-600">{formatTime(subject.timeSpent)} this week</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-gray-900">{subject.score}%</span>
                  <div
                    className={cn(
                      "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                      subject.trend === 'up'
                        ? "bg-green-100 text-green-700"
                        : subject.trend === 'down'
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-700"
                    )}
                  >
                    {subject.trend === 'up' && <TrendingUp className="w-3 h-3" />}
                    {subject.trend === 'down' && <TrendingUp className="w-3 h-3 rotate-180" />}
                    {subject.trend}
                  </div>
                </div>
              </div>

              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${subject.score}%` }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Progress Tab */}
      {activeTab === 'progress' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              Weekly Activity
            </h3>
            <div className="grid grid-cols-7 gap-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                const isActive = index < 5; // Simulated active days
                return (
                  <div
                    key={day}
                    className={cn(
                      "flex flex-col items-center gap-2 p-3 rounded-xl",
                      isActive ? "bg-blue-50" : "bg-gray-50"
                    )}
                  >
                    <span className="text-xs text-gray-600">{day}</span>
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center",
                        isActive ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-400"
                      )}
                    >
                      {isActive ? <Check className="w-4 h-4" /> : '-'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">Recent Achievements</h3>
            <div className="space-y-3">
              {[
                { badge: '🎯', title: 'First Steps Complete', date: '2 days ago' },
                { badge: '🔥', title: '7-Day Streak', date: '1 week ago' },
                { badge: '📚', title: 'Module Master', date: '2 weeks ago' },
              ].map((achievement, index) => (
                <motion.div
                  key={achievement.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl"
                >
                  <span className="text-2xl">{achievement.badge}</span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{achievement.title}</p>
                    <p className="text-sm text-gray-600">{achievement.date}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend: string;
  trendUp: boolean;
  color: 'blue' | 'green' | 'purple';
}

function MetricCard({ icon, label, value, trend, trendUp, color }: MetricCardProps) {
  const colorStyles = {
    blue: 'from-blue-500 to-cyan-500',
    green: 'from-green-500 to-emerald-500',
    purple: 'from-purple-500 to-pink-500',
  };

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br", colorStyles[color])}>
          <span className="text-white">{icon}</span>
        </div>
        <div
          className={cn(
            "flex items-center gap-1 text-sm font-medium",
            trendUp ? "text-green-600" : "text-red-600"
          )}
        >
          {trendUp ? <TrendingUp className="w-4 h-4" /> : <TrendingUp className="w-4 h-4 rotate-180" />}
          {trend}
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-600 mt-1">{label}</p>
    </motion.div>
  );
}
