/**
 * Unified Gamification State Engine
 * Zero-latency optimistic updates with offline persistence
 * Tracks streaks, XP, badges, and module progress
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';

// Badge definitions
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: Date;
  progress?: number;
  maxProgress?: number;
}

// Module progress tracking
export interface ModuleProgress {
  moduleId: string;
  moduleName: string;
  completedLessons: number;
  totalLessons: number;
  completedAt?: Date;
  xpEarned: number;
}

// Streak data
export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
  streakFreezeActive: boolean;
  streakFreezeCount: number;
}

// XP thresholds for levels
const XP_THRESHOLDS = [0, 100, 250, 500, 1000, 2000, 3500, 5000, 7500, 10000];

export interface GamificationState {
  // Core gamification data
  xp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  unlockedBadges: Badge[];
  availableBadges: Badge[];
  moduleProgress: ModuleProgress[];
  
  // Computed values
  xpToNextLevel: number;
  xpProgress: number;
  
  // Actions
  addXP: (amount: number) => Promise<void>;
  incrementStreak: () => Promise<void>;
  unlockBadge: (badgeId: string) => Promise<void>;
  updateModuleProgress: (moduleId: string, completedLessons: number) => Promise<void>;
  completeModule: (moduleId: string) => Promise<void>;
  useStreakFreeze: () => void;
  checkBadgeUnlocks: () => Promise<void>;
  syncWithServer: () => Promise<void>;
  resetState: () => void;
}

export const useGamificationStore = create<GamificationState>()(
  persist(
    immer((set, get) => ({
      // Initial state
      xp: 0,
      level: 1,
      currentStreak: 0,
      longestStreak: 0,
      unlockedBadges: [],
      availableBadges: [
        {
          id: 'first-lesson',
          name: 'First Steps',
          description: 'Complete your first lesson',
          icon: '🎯',
          rarity: 'common',
        },
        {
          id: 'streak-7',
          name: 'Week Warrior',
          description: 'Maintain a 7-day streak',
          icon: '🔥',
          rarity: 'rare',
        },
        {
          id: 'streak-30',
          name: 'Monthly Master',
          description: 'Maintain a 30-day streak',
          icon: '⚡',
          rarity: 'epic',
        },
        {
          id: 'xp-1000',
          name: 'Knowledge Seeker',
          description: 'Earn 1,000 XP',
          icon: '📚',
          rarity: 'rare',
        },
        {
          id: 'module-5',
          name: 'Course Champion',
          description: 'Complete 5 modules',
          icon: '🏆',
          rarity: 'epic',
        },
      ],
      moduleProgress: [],
      
      // Computed values
      get xpToNextLevel() {
        const currentLevel = get().level;
        const nextThreshold = XP_THRESHOLDS[currentLevel] || XP_THRESHOLDS[XP_THRESHOLDS.length - 1];
        return nextThreshold - get().xp;
      },
      
      get xpProgress() {
        const currentLevel = get().level;
        const currentThreshold = XP_THRESHOLDS[currentLevel - 1] || 0;
        const nextThreshold = XP_THRESHOLDS[currentLevel] || XP_THRESHOLDS[XP_THRESHOLDS.length - 1];
        const range = nextThreshold - currentThreshold;
        const currentInRange = get().xp - currentThreshold;
        return Math.min(100, Math.max(0, (currentInRange / range) * 100));
      },
      
      // Optimistic XP addition
      addXP: async (amount: number) => {
        const previousXP = get().xp;
        const previousLevel = get().level;
        
        // Optimistic update - instant UI feedback
        set((state) => {
          state.xp += amount;
          
          // Calculate new level
          let newLevel = previousLevel;
          for (let i = XP_THRESHOLDS.length - 1; i >= 0; i--) {
            if (state.xp >= XP_THRESHOLDS[i]) {
              newLevel = i + 1;
              break;
            }
          }
          state.level = newLevel;
        });
        
        try {
          // Sync with server in background
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error('No user');
          
          const { error } = await supabase
            .from('user_gamification')
            .upsert({
              user_id: user.id,
              xp: get().xp,
              level: get().level,
              updated_at: new Date().toISOString(),
            });
          
          if (error) throw error;
          
          // Check for badge unlocks
          await get().checkBadgeUnlocks();
        } catch (error) {
          console.error('Failed to sync XP:', error);
          // Rollback on error
          set((state) => {
            state.xp = previousXP;
            state.level = previousLevel;
          });
        }
      },
      
      // Optimistic streak increment
      incrementStreak: async () => {
        const previousStreak = get().currentStreak;
        const previousLongest = get().longestStreak;
        
        // Optimistic update
        set((state) => {
          state.currentStreak += 1;
          state.longestStreak = Math.max(state.longestStreak, state.currentStreak);
          state.lastActiveDate = new Date().toISOString();
        });
        
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error('No user');
          
          const { error } = await supabase
            .from('user_streaks')
            .upsert({
              user_id: user.id,
              current_streak: get().currentStreak,
              longest_streak: get().longestStreak,
              last_active_date: new Date().toISOString(),
            });
          
          if (error) throw error;
          
          // Check for streak badges
          await get().checkBadgeUnlocks();
        } catch (error) {
          console.error('Failed to sync streak:', error);
          // Rollback on error
          set((state) => {
            state.currentStreak = previousStreak;
            state.longestStreak = previousLongest;
          });
        }
      },
      
      // Unlock badge
      unlockBadge: async (badgeId: string) => {
        const badge = get().availableBadges.find(b => b.id === badgeId);
        if (!badge || get().unlockedBadges.find(b => b.id === badgeId)) return;
        
        // Optimistic update
        set((state) => {
          state.unlockedBadges.push({
            ...badge,
            unlockedAt: new Date(),
          });
        });
        
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error('No user');
          
          const { error } = await supabase
            .from('user_badges')
            .insert({
              user_id: user.id,
              badge_id: badgeId,
              unlocked_at: new Date().toISOString(),
            });
          
          if (error) throw error;
        } catch (error) {
          console.error('Failed to unlock badge:', error);
          // Rollback on error
          set((state) => {
            state.unlockedBadges = state.unlockedBadges.filter(b => b.id !== badgeId);
          });
        }
      },
      
      // Update module progress
      updateModuleProgress: async (moduleId: string, completedLessons: number) => {
        const existingProgress = get().moduleProgress.find(p => p.moduleId === moduleId);
        const previousProgress = existingProgress ? { ...existingProgress } : null;
        
        // Optimistic update
        set((state) => {
          if (existingProgress) {
            existingProgress.completedLessons = completedLessons;
          } else {
            state.moduleProgress.push({
              moduleId,
              moduleName: 'Unknown Module',
              completedLessons,
              totalLessons: 10,
              xpEarned: 0,
            });
          }
        });
        
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error('No user');
          
          const { error } = await supabase
            .from('user_module_progress')
            .upsert({
              user_id: user.id,
              module_id: moduleId,
              completed_lessons: completedLessons,
              updated_at: new Date().toISOString(),
            });
          
          if (error) throw error;
          
          // Award XP for progress
          const xpGained = completedLessons * 10;
          await get().addXP(xpGained);
        } catch (error) {
          console.error('Failed to update module progress:', error);
          // Rollback on error
          if (previousProgress) {
            set((state) => {
              const idx = state.moduleProgress.findIndex(p => p.moduleId === moduleId);
              if (idx !== -1) {
                state.moduleProgress[idx] = previousProgress;
              }
            });
          } else {
            set((state) => {
              state.moduleProgress = state.moduleProgress.filter(p => p.moduleId !== moduleId);
            });
          }
        }
      },
      
      // Complete module
      completeModule: async (moduleId: string) => {
        const existingProgress = get().moduleProgress.find(p => p.moduleId === moduleId);
        if (!existingProgress) return;
        
        const previousProgress = { ...existingProgress };
        
        // Optimistic update
        set((state) => {
          existingProgress.completedLessons = existingProgress.totalLessons;
          existingProgress.completedAt = new Date();
          existingProgress.xpEarned = 100;
        });
        
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error('No user');
          
          const { error } = await supabase
            .from('user_module_progress')
            .update({
              completed_lessons: existingProgress.totalLessons,
              completed_at: new Date().toISOString(),
              xp_earned: 100,
            })
            .eq('user_id', user.id)
            .eq('module_id', moduleId);
          
          if (error) throw error;
          
          // Award completion XP
          await get().addXP(100);
          
          // Check for module completion badge
          const completedCount = get().moduleProgress.filter(p => p.completedAt).length;
          if (completedCount >= 5) {
            await get().unlockBadge('module-5');
          }
        } catch (error) {
          console.error('Failed to complete module:', error);
          // Rollback on error
          set((state) => {
            const idx = state.moduleProgress.findIndex(p => p.moduleId === moduleId);
            if (idx !== -1) {
              state.moduleProgress[idx] = previousProgress;
            }
          });
        }
      },
      
      // Use streak freeze
      useStreakFreeze: () => {
        set((state) => {
          if (state.streakFreezeCount > 0) {
            state.streakFreezeActive = true;
            state.streakFreezeCount -= 1;
          }
        });
      },
      
      // Check for badge unlocks
      checkBadgeUnlocks: async () => {
        const state = get();
        
        // Check XP badge
        if (state.xp >= 1000) {
          await get().unlockBadge('xp-1000');
        }
        
        // Check streak badges
        if (state.currentStreak >= 7) {
          await get().unlockBadge('streak-7');
        }
        if (state.currentStreak >= 30) {
          await get().unlockBadge('streak-30');
        }
      },
      
      // Sync all data with server
      syncWithServer: async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;
          
          // Fetch gamification data
          const { data: gamification } = await supabase
            .from('user_gamification')
            .select('*')
            .eq('user_id', user.id)
            .single();
          
          if (gamification) {
            set((state) => {
              state.xp = gamification.xp || 0;
              state.level = gamification.level || 1;
            });
          }
          
          // Fetch streak data
          const { data: streak } = await supabase
            .from('user_streaks')
            .select('*')
            .eq('user_id', user.id)
            .single();
          
          if (streak) {
            set((state) => {
              state.currentStreak = streak.current_streak || 0;
              state.longestStreak = streak.longest_streak || 0;
            });
          }
          
          // Fetch badges
          const { data: badges } = await supabase
            .from('user_badges')
            .select('*, badges(*)')
            .eq('user_id', user.id);
          
          if (badges) {
            set((state) => {
              state.unlockedBadges = badges.map(b => ({
                id: b.badge_id,
                name: b.badges?.name || '',
                description: b.badges?.description || '',
                icon: b.badges?.icon || '',
                rarity: b.badges?.rarity || 'common',
                unlockedAt: new Date(b.unlocked_at),
              }));
            });
          }
        } catch (error) {
          console.error('Failed to sync with server:', error);
        }
      },
      
      // Reset state (for testing)
      resetState: () => {
        set((state) => {
          state.xp = 0;
          state.level = 1;
          state.currentStreak = 0;
          state.longestStreak = 0;
          state.unlockedBadges = [];
          state.moduleProgress = [];
        });
      },
    })),
    {
      name: 'funfinity-gamification-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        xp: state.xp,
        level: state.level,
        currentStreak: state.currentStreak,
        longestStreak: state.longestStreak,
        unlockedBadges: state.unlockedBadges,
        moduleProgress: state.moduleProgress,
      }),
    }
  )
);
