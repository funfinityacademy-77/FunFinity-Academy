import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  image: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  category: string;
  earned: boolean;
  earnedAt?: string;
  progress?: number;
  maxProgress?: number;
}

interface GamificationStats {
  points: number;
  level: number;
  xp: number;
  xpToNextLevel: number;
  streak: number;
  longestStreak: number;
  lastActivityDate: string;
  totalSessions: number;
  totalStudyTime: number;
  badges: Badge[];
}

interface GamificationContextType {
  stats: GamificationStats;
  loading: boolean;
  addPoints: (points: number, reason: string) => Promise<void>;
  updateStreak: () => Promise<void>;
  checkBadgeProgress: (badgeId: string, progress: number) => Promise<void>;
  earnBadge: (badgeId: string) => Promise<void>;
  getLevelProgress: () => number;
}

const GamificationContext = createContext<GamificationContextType>({
  stats: {
    points: 0,
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    streak: 0,
    longestStreak: 0,
    lastActivityDate: "",
    totalSessions: 0,
    totalStudyTime: 0,
    badges: [],
  },
  loading: true,
  addPoints: async () => {},
  updateStreak: async () => {},
  checkBadgeProgress: async () => {},
  earnBadge: async () => {},
  getLevelProgress: () => 0,
});

const BADGES: Omit<Badge, "earned" | "earnedAt" | "progress" | "maxProgress">[] = [
  {
    id: "first-login",
    name: "First Steps",
    description: "Logged in for the first time",
    icon: "🎯",
    image: "",
    rarity: "common",
    category: "Onboarding"
  },
  {
    id: "profile-complete",
    name: "Identity Established",
    description: "Completed your learning profile",
    icon: "👤",
    image: "",
    rarity: "common",
    category: "Onboarding"
  },
  {
    id: "first-course",
    name: "Course Pioneer",
    description: "Enrolled in your first course",
    icon: "🚀",
    image: "",
    rarity: "common",
    category: "Onboarding"
  },
  {
    id: "streak-3",
    name: "3-Day Streak",
    description: "Maintained a 3-day learning streak",
    icon: "🔥",
    image: "",
    rarity: "common",
    category: "Streak"
  },
  {
    id: "streak-7",
    name: "Week Warrior",
    description: "Maintained a 7-day learning streak",
    icon: "⚡",
    image: "",
    rarity: "rare",
    category: "Streak"
  },
  {
    id: "streak-14",
    name: "Fortnight Fighter",
    description: "Maintained a 14-day learning streak",
    icon: "💪",
    image: "",
    rarity: "rare",
    category: "Streak"
  },
  {
    id: "streak-30",
    name: "Monthly Master",
    description: "Maintained a 30-day learning streak",
    icon: "🏆",
    image: "",
    rarity: "epic",
    category: "Streak"
  },
  {
    id: "streak-60",
    name: "Streak Champion",
    description: "Maintained a 60-day learning streak",
    icon: "👑",
    image: "",
    rarity: "epic",
    category: "Streak"
  },
  {
    id: "streak-100",
    name: "Century Streak",
    description: "Maintained a 100-day learning streak",
    icon: "🌟",
    image: "",
    rarity: "legendary",
    category: "Streak"
  },
  {
    id: "quiz-master-10",
    name: "Quiz Novice",
    description: "Completed 10 quizzes",
    icon: "📝",
    image: "",
    rarity: "common",
    category: "Quizzes"
  },
  {
    id: "quiz-master-50",
    name: "Quiz Expert",
    description: "Completed 50 quizzes",
    icon: "🎓",
    image: "",
    rarity: "rare",
    category: "Quizzes"
  },
  {
    id: "quiz-master-100",
    name: "Quiz Legend",
    description: "Completed 100 quizzes",
    icon: "👑",
    image: "",
    rarity: "epic",
    category: "Quizzes"
  },
  {
    id: "quiz-master-250",
    name: "Quiz Master",
    description: "Completed 250 quizzes",
    icon: "🏅",
    image: "",
    rarity: "legendary",
    category: "Quizzes"
  },
  {
    id: "perfect-score",
    name: "Perfectionist",
    description: "Scored 100% on a quiz",
    icon: "💯",
    image: "",
    rarity: "rare",
    category: "Quizzes"
  },
  {
    id: "perfect-streak-5",
    name: "Perfect Streak",
    description: "Scored 100% on 5 consecutive quizzes",
    icon: "🎯",
    image: "",
    rarity: "epic",
    category: "Quizzes"
  },
  {
    id: "speed-demon",
    name: "Speed Demon",
    description: "Completed a quiz in under 1 minute",
    icon: "⚡",
    image: "",
    rarity: "rare",
    category: "Quizzes"
  },
  {
    id: "quiz-all-categories",
    name: "Category Master",
    description: "Completed quizzes in all categories",
    icon: "📚",
    image: "",
    rarity: "epic",
    category: "Quizzes"
  },
  {
    id: "early-bird",
    name: "Early Bird",
    description: "Logged in before 8 AM",
    icon: "🌅",
    image: "",
    rarity: "common",
    category: "Time"
  },
  {
    id: "night-owl",
    name: "Night Owl",
    description: "Logged in after 10 PM",
    icon: "🦉",
    image: "",
    rarity: "common",
    category: "Time"
  },
  {
    id: "weekend-warrior",
    name: "Weekend Warrior",
    description: "Studied on both Saturday and Sunday",
    icon: "⚔️",
    image: "",
    rarity: "rare",
    category: "Time"
  },
  {
    id: "midnight-oil",
    name: "Midnight Oil",
    description: "Studied past midnight",
    icon: "🌙",
    image: "",
    rarity: "rare",
    category: "Time"
  },
  {
    id: "explorer",
    name: "Explorer",
    description: "Visited all course sections",
    icon: "🗺️",
    image: "",
    rarity: "rare",
    category: "Exploration"
  },
  {
    id: "pathfinder",
    name: "Pathfinder",
    description: "Completed the career pathfinder quiz",
    icon: "🧭",
    image: "",
    rarity: "rare",
    category: "Exploration"
  },
  {
    id: "college-explorer",
    name: "College Explorer",
    description: "Explored 10+ colleges",
    icon: "🎓",
    image: "",
    rarity: "common",
    category: "Exploration"
  },
  {
    id: "resource-collector",
    name: "Resource Collector",
    description: "Accessed 50+ learning resources",
    icon: "📦",
    image: "",
    rarity: "rare",
    category: "Exploration"
  },
  {
    id: "social-butterfly",
    name: "Social Butterfly",
    description: "Engaged with 10 community posts",
    icon: "🦋",
    image: "",
    rarity: "common",
    category: "Community"
  },
  {
    id: "helpful-hand",
    name: "Helpful Hand",
    description: "Helped 5 other students",
    icon: "🤝",
    image: "",
    rarity: "rare",
    category: "Community"
  },
  {
    id: "mentor",
    name: "Mentor",
    description: "Mentored 10 students",
    icon: "🌟",
    image: "",
    rarity: "epic",
    category: "Community"
  },
  {
    id: "community-leader",
    name: "Community Leader",
    description: "Reached top 10 in community rankings",
    icon: "👑",
    image: "",
    rarity: "legendary",
    category: "Community"
  },
  {
    id: "level-5",
    name: "Rising Star",
    description: "Reached level 5",
    icon: "⭐",
    image: "",
    rarity: "common",
    category: "Levels"
  },
  {
    id: "level-10",
    name: "Achiever",
    description: "Reached level 10",
    icon: "🌟",
    image: "",
    rarity: "rare",
    category: "Levels"
  },
  {
    id: "level-25",
    name: "Champion",
    description: "Reached level 25",
    icon: "💎",
    image: "",
    rarity: "epic",
    category: "Levels"
  },
  {
    id: "level-50",
    name: "Legend",
    description: "Reached level 50",
    icon: "👑",
    image: "",
    rarity: "legendary",
    category: "Levels"
  },
  {
    id: "level-100",
    name: "Immortal",
    description: "Reached level 100",
    icon: "🏆",
    image: "",
    rarity: "legendary",
    category: "Levels"
  },
  {
    id: "study-hour-1",
    name: "Focused Learner",
    description: "Studied for 1 hour total",
    icon: "📚",
    image: "",
    rarity: "common",
    category: "Study Time"
  },
  {
    id: "study-hour-10",
    name: "Dedicated Student",
    description: "Studied for 10 hours total",
    icon: "🎓",
    image: "",
    rarity: "rare",
    category: "Study Time"
  },
  {
    id: "study-hour-50",
    name: "Scholar",
    description: "Studied for 50 hours total",
    icon: "🏅",
    image: "",
    rarity: "epic",
    category: "Study Time"
  },
  {
    id: "study-hour-100",
    name: "Master Scholar",
    description: "Studied for 100 hours total",
    icon: "🎖️",
    image: "",
    rarity: "legendary",
    category: "Study Time"
  },
  {
    id: "study-hour-500",
    name: "Study Sage",
    description: "Studied for 500 hours total",
    icon: "📖",
    image: "",
    rarity: "legendary",
    category: "Study Time"
  },
  {
    id: "course-complete-1",
    name: "Course Graduate",
    description: "Completed your first course",
    icon: "🎓",
    image: "",
    rarity: "rare",
    category: "Courses"
  },
  {
    id: "course-complete-5",
    name: "Course Master",
    description: "Completed 5 courses",
    icon: "📚",
    image: "",
    rarity: "epic",
    category: "Courses"
  },
  {
    id: "course-complete-10",
    name: "Course Legend",
    description: "Completed 10 courses",
    icon: "🏆",
    image: "",
    rarity: "legendary",
    category: "Courses"
  },
  {
    id: "all-subjects",
    name: "Renaissance Student",
    description: "Completed courses in all subjects",
    icon: "🎨",
    image: "",
    rarity: "legendary",
    category: "Courses"
  },
  {
    id: "first-assignment",
    name: "Task Initiate",
    description: "Submitted your first assignment",
    icon: "📝",
    image: "",
    rarity: "common",
    category: "Assignments"
  },
  {
    id: "assignment-perfect",
    name: "Assignment Ace",
    description: "Got a perfect score on an assignment",
    icon: "💯",
    image: "",
    rarity: "rare",
    category: "Assignments"
  },
  {
    id: "assignment-streak-10",
    name: "Consistent Contributor",
    description: "Submitted 10 assignments in a row",
    icon: "🔥",
    image: "",
    rarity: "epic",
    category: "Assignments"
  },
  {
    id: "feedback-giver",
    name: "Constructive Critic",
    description: "Provided feedback on 5 courses",
    icon: "💬",
    image: "",
    rarity: "common",
    category: "Community"
  },
  {
    id: "badge-collector-10",
    name: "Badge Hunter",
    description: "Collected 10 badges",
    icon: "🏅",
    image: "",
    rarity: "rare",
    category: "Badges"
  },
  {
    id: "badge-collector-25",
    name: "Badge Master",
    description: "Collected 25 badges",
    icon: "🎖️",
    image: "",
    rarity: "epic",
    category: "Badges"
  },
  {
    id: "badge-collector-50",
    name: "Badge Legend",
    description: "Collected 50 badges",
    icon: "👑",
    image: "",
    rarity: "legendary",
    category: "Badges"
  },
  {
    id: "xp-1000",
    name: "XP Pioneer",
    description: "Earned 1,000 total XP",
    icon: "✨",
    image: "",
    rarity: "common",
    category: "XP"
  },
  {
    id: "xp-10000",
    name: "XP Master",
    description: "Earned 10,000 total XP",
    icon: "💫",
    image: "",
    rarity: "rare",
    category: "XP"
  },
  {
    id: "xp-50000",
    name: "XP Legend",
    description: "Earned 50,000 total XP",
    icon: "🌟",
    image: "",
    rarity: "epic",
    category: "XP"
  },
  {
    id: "xp-100000",
    name: "XP Immortal",
    description: "Earned 100,000 total XP",
    icon: "🏆",
    image: "",
    rarity: "legendary",
    category: "XP"
  },
  {
    id: "social-first-post",
    name: "Voice Heard",
    description: "Made your first community post",
    icon: "💬",
    image: "",
    rarity: "common",
    category: "Social"
  },
  {
    id: "social-10-likes",
    name: "Liked",
    description: "Received 10 likes on your posts",
    icon: "❤️",
    image: "",
    rarity: "common",
    category: "Social"
  },
  {
    id: "social-50-likes",
    name: "Popular",
    description: "Received 50 likes on your posts",
    icon: "🌟",
    image: "",
    rarity: "rare",
    category: "Social"
  },
  {
    id: "learning-path-complete",
    name: "Path Complete",
    description: "Completed a full learning path",
    icon: "🎯",
    image: "",
    rarity: "epic",
    category: "Learning"
  },
  {
    id: "learning-all-paths",
    name: "Master of All",
    description: "Completed all learning paths",
    icon: "👑",
    image: "",
    rarity: "legendary",
    category: "Learning"
  },
  {
    id: "challenge-first",
    name: "Challenger",
    description: "Completed your first challenge",
    icon: "🏆",
    image: "",
    rarity: "common",
    category: "Challenges"
  },
  {
    id: "challenge-10",
    name: "Challenge Seeker",
    description: "Completed 10 challenges",
    icon: "⚔️",
    image: "",
    rarity: "rare",
    category: "Challenges"
  },
  {
    id: "challenge-50",
    name: "Challenge Master",
    description: "Completed 50 challenges",
    icon: "🛡️",
    image: "",
    rarity: "epic",
    category: "Challenges"
  },
  {
    id: "event-first",
    name: "Event Goer",
    description: "Attended your first live event",
    icon: "🎪",
    image: "",
    rarity: "common",
    category: "Events"
  },
  {
    id: "event-10",
    name: "Event Regular",
    description: "Attended 10 live events",
    icon: "🎭",
    image: "",
    rarity: "rare",
    category: "Events"
  },
  {
    id: "event-host",
    name: "Event Host",
    description: "Hosted a community event",
    icon: "🎤",
    image: "",
    rarity: "epic",
    category: "Events"
  },
  {
    id: "notes-first",
    name: "Note Taker",
    description: "Created your first study note",
    icon: "📝",
    image: "",
    rarity: "common",
    category: "Learning"
  },
  {
    id: "notes-50",
    name: "Note Master",
    description: "Created 50 study notes",
    icon: "📚",
    image: "",
    rarity: "rare",
    category: "Learning"
  },
  {
    id: "notes-shared",
    name: "Knowledge Sharer",
    description: "Shared your notes with others",
    icon: "🤝",
    image: "",
    rarity: "rare",
    category: "Social"
  },
  {
    id: "perfect-attendance",
    name: "Perfect Attendance",
    description: "Logged in 30 days in a row",
    icon: "📅",
    image: "",
    rarity: "epic",
    category: "Streak"
  },
  {
    id: "quick-learner",
    name: "Quick Learner",
    description: "Completed a course in under 24 hours",
    icon: "⚡",
    image: "",
    rarity: "rare",
    category: "Courses"
  },
  {
    id: "review-first",
    name: "Reviewer",
    description: "Left your first course review",
    icon: "⭐",
    image: "",
    rarity: "common",
    category: "Community"
  },
  {
    id: "review-25",
    name: "Critic",
    description: "Left 25 course reviews",
    icon: "📝",
    image: "",
    rarity: "rare",
    category: "Community"
  },
  {
    id: "achievement-streak",
    name: "Achievement Streak",
    description: "Earned 5 badges in one day",
    icon: "🎖️",
    image: "",
    rarity: "epic",
    category: "Badges"
  },
];

const XP_PER_LEVEL = 100;
const XP_MULTIPLIER = 1.5;

export function GamificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [stats, setStats] = useState<GamificationStats>({
    points: 0,
    level: 1,
    xp: 0,
    xpToNextLevel: XP_PER_LEVEL,
    streak: 0,
    longestStreak: 0,
    lastActivityDate: "",
    totalSessions: 0,
    totalStudyTime: 0,
    badges: BADGES.map(b => ({ ...b, earned: false })),
  });
  const [loading, setLoading] = useState(true);

  // Load gamification data from localStorage
  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const loadData = () => {
      try {
        const savedStats = localStorage.getItem(`gamification_${user.id}`);
        if (savedStats) {
          const parsed = JSON.parse(savedStats);
          setStats(prev => ({
            ...prev,
            ...parsed,
            badges: BADGES.map(badge => {
              const savedBadge = parsed.badges?.find((b: Badge) => b.id === badge.id);
              return savedBadge ? { ...badge, ...savedBadge } : { ...badge, earned: false };
            }),
          }));
        }
      } catch (error) {
        console.error("Error loading gamification data:", error);
      }
      setLoading(false);
    };

    loadData();
  }, [user?.id]);

  const saveStats = (newStats: GamificationStats) => {
    if (user?.id) {
      localStorage.setItem(`gamification_${user.id}`, JSON.stringify(newStats));
    }
    setStats(newStats);
  };

  const addPoints = useCallback(async (points: number, reason: string) => {
    if (!user?.id) return;

    setStats(prev => {
      const newXP = prev.xp + points;
      let newLevel = prev.level;
      let newXPTotal = newXP;

      // Check for level up
      while (newXPTotal >= prev.xpToNextLevel) {
        newXPTotal -= prev.xpToNextLevel;
        newLevel++;
        
        // Check for level badges
        const levelBadge = BADGES.find(b => b.id === `level-${newLevel}`);
        if (levelBadge) {
          toast.success(`🎉 Level Up! You're now level ${newLevel}!`, {
            description: `You earned the "${levelBadge.name}" badge!`,
          });
        }
      }

      const newStats = {
        ...prev,
        points: prev.points + points,
        xp: newXPTotal,
        level: newLevel,
        xpToNextLevel: Math.floor(XP_PER_LEVEL * Math.pow(XP_MULTIPLIER, newLevel - 1)),
      };

      saveStats(newStats);
      
      toast.success(`+${points} XP`, {
        description: reason,
      });

      return newStats;
    });
  }, [user?.id]);

  const updateStreak = useCallback(async () => {
    if (!user?.id) return;

    setStats(prev => {
      const today = new Date().toDateString();
      const lastActivity = prev.lastActivityDate;
      
      let newStreak = prev.streak;
      let newLongestStreak = prev.longestStreak;

      if (lastActivity === today) {
        // Already logged in today, no change
        return prev;
      }

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (lastActivity === yesterday.toDateString()) {
        // Consecutive day
        newStreak++;
        newLongestStreak = Math.max(newLongestStreak, newStreak);
        
        // Check for streak badges
        const streakBadge = BADGES.find(b => b.id === `streak-${newStreak}`);
        if (streakBadge) {
          toast.success(`🔥 ${newStreak} Day Streak!`, {
            description: `You earned the "${streakBadge.name}" badge!`,
          });
        }
      } else if (lastActivity !== today) {
        // Streak broken
        newStreak = 1;
      }

      const newStats = {
        ...prev,
        streak: newStreak,
        longestStreak: newLongestStreak,
        lastActivityDate: today,
        totalSessions: prev.totalSessions + 1,
      };

      saveStats(newStats);
      return newStats;
    });
  }, [user?.id]);

  const checkBadgeProgress = useCallback(async (badgeId: string, progress: number) => {
    if (!user?.id) return;

    setStats(prev => {
      const badgeIndex = prev.badges.findIndex(b => b.id === badgeId);
      if (badgeIndex === -1) return prev;

      const badge = prev.badges[badgeIndex];
      if (badge.earned) return prev;

      const maxProgress = badge.maxProgress || 1;
      const newProgress = Math.min(progress, maxProgress);
      
      const newBadges = [...prev.badges];
      newBadges[badgeIndex] = {
        ...badge,
        progress: newProgress,
      };

      // Auto-earn if progress is complete
      if (newProgress >= maxProgress) {
        newBadges[badgeIndex] = {
          ...newBadges[badgeIndex],
          earned: true,
          earnedAt: new Date().toISOString(),
        };

        toast.success(`🏆 Badge Earned!`, {
          description: `You earned the "${badge.name}" badge!`,
        });
      }

      const newStats = {
        ...prev,
        badges: newBadges,
      };

      saveStats(newStats);
      return newStats;
    });
  }, [user?.id]);

  const earnBadge = useCallback(async (badgeId: string) => {
    if (!user?.id) return;

    setStats(prev => {
      const badgeIndex = prev.badges.findIndex(b => b.id === badgeId);
      if (badgeIndex === -1) return prev;

      const badge = prev.badges[badgeIndex];
      if (badge.earned) return prev;

      const newBadges = [...prev.badges];
      newBadges[badgeIndex] = {
        ...badge,
        earned: true,
        earnedAt: new Date().toISOString(),
      };

      const newStats = {
        ...prev,
        badges: newBadges,
      };

      saveStats(newStats);
      
      toast.success(`🏆 Badge Earned!`, {
        description: `You earned the "${badge.name}" badge!`,
      });

      return newStats;
    });
  }, [user?.id]);

  const getLevelProgress = useCallback(() => {
    return (stats.xp / stats.xpToNextLevel) * 100;
  }, [stats.xp, stats.xpToNextLevel]);

  return (
    <GamificationContext.Provider
      value={{
        stats,
        loading,
        addPoints,
        updateStreak,
        checkBadgeProgress,
        earnBadge,
        getLevelProgress,
      }}
    >
      {children}
    </GamificationContext.Provider>
  );
}

export const useGamification = () => useContext(GamificationContext);
