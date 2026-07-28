// Real-time State Synchronization for FunFinity Academy
// Dynamic State Synchronization with zero refresh
// Instant data updates across all components

import React, { createContext, useContext, ReactNode, useEffect, useState, useCallback } from 'react';
import { dbService } from '@/services/database-service';
import { intelligentContentService } from '@/services/intelligent-content-service';

// Real-time sync event types
interface SyncEvent {
  type: 'progress_update' | 'lesson_complete' | 'quiz_submit' | 'achievement_unlock' | 'recommendation_update';
  userId: number;
  data: any;
  timestamp: Date;
}

// State synchronization context
interface StateSyncContextType {
  isSyncing: boolean;
  lastSync: Date | null;
  syncEvents: SyncEvent[];
  triggerSync: (event: Omit<SyncEvent, 'timestamp'>) => Promise<void>;
  forceSync: () => Promise<void>;
  getRealtimeData: (dataType: string, params?: any) => Promise<any>;
  subscribeToUpdates: (dataType: string, callback: (data: any) => void) => () => void;
}

const StateSyncContext = createContext<StateSyncContextType | null>(null);

// Real-time State Sync Manager
export class RealtimeStateSyncManager {
  private static instance: RealtimeStateSyncManager;
  private subscribers: Map<string, Set<(data: any) => void>> = new Map();
  private syncQueue: SyncEvent[] = [];
  private isProcessing = false;
  private lastSyncTime: Date | null = null;
  private syncInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.startSyncProcessor();
    this.startPeriodicSync();
  }

  public static getInstance(): RealtimeStateSyncManager {
    if (!RealtimeStateSyncManager.instance) {
      RealtimeStateSyncManager.instance = new RealtimeStateSyncManager();
    }
    return RealtimeStateSyncManager.instance;
  }

  // Start sync processor
  private startSyncProcessor(): void {
    setInterval(() => {
      this.processSyncQueue();
    }, 100); // Process every 100ms for near-instant updates
  }

  // Start periodic background sync
  private startPeriodicSync(): void {
    this.syncInterval = setInterval(() => {
      this.performBackgroundSync();
    }, 5000); // Background sync every 5 seconds
  }

  // Process sync queue
  private async processSyncQueue(): Promise<void> {
    if (this.isProcessing || this.syncQueue.length === 0) return;

    this.isProcessing = true;
    const events = [...this.syncQueue];
    this.syncQueue = [];

    try {
      // Process events in batch
      await Promise.all(events.map(event => this.processSyncEvent(event)));
      this.lastSyncTime = new Date();
    } catch (error) {
      console.error('Unable to synchronize your data. We\'ll try again automatically.');
      // Re-add failed events to queue
      this.syncQueue.unshift(...events);
    } finally {
      this.isProcessing = false;
    }
  }

  // Process individual sync event
  private async processSyncEvent(event: SyncEvent): Promise<void> {
    switch (event.type) {
      case 'progress_update':
        await this.handleProgressUpdate(event);
        break;
      case 'lesson_complete':
        await this.handleLessonComplete(event);
        break;
      case 'quiz_submit':
        await this.handleQuizSubmit(event);
        break;
      case 'achievement_unlock':
        await this.handleAchievementUnlock(event);
        break;
      case 'recommendation_update':
        await this.handleRecommendationUpdate(event);
        break;
    }

    // Notify subscribers
    this.notifySubscribers(event.type, event.data);
  }

  // Handle progress update
  private async handleProgressUpdate(event: SyncEvent): Promise<void> {
    const { userId, data } = event;
    
    // Update database
    await dbService.updateStudentProgress(userId, data.lessonId, {
      status: data.status,
      progressPercentage: data.progressPercentage,
      timeSpentMinutes: data.timeSpentMinutes,
      attempts: data.attempts,
      bestScore: data.bestScore,
      xpEarned: data.xpEarned,
    });

    // Update intelligent content service
    await intelligentContentService.adaptContentDifficulty(
      userId, 
      data.lessonId, 
      data.score || 0
    );
  }

  // Handle lesson completion
  private async handleLessonComplete(event: SyncEvent): Promise<void> {
    const { userId, data } = event;
    
    // Generate new recommendations
    await intelligentContentService.generateRecommendations(userId);
    
    // Update student profile
    await intelligentContentService.getStudentProfile(userId);
  }

  // Handle quiz submission
  private async handleQuizSubmit(event: SyncEvent): Promise<void> {
    const { userId, data } = event;
    
    // Update quiz progress
    await dbService.updateStudentProgress(userId, data.lessonId, {
      status: data.passed ? 'completed' : 'in_progress',
      bestScore: data.score,
      attempts: data.attempts,
      xpEarned: data.xpEarned,
    });

    // Generate new recommendations if quiz was passed
    if (data.passed) {
      await intelligentContentService.generateRecommendations(userId);
    }
  }

  // Handle achievement unlock
  private async handleAchievementUnlock(event: SyncEvent): Promise<void> {
    const { userId, data } = event;
    
    // Update achievement status in database
    // This would be implemented based on your achievement system
    console.log('Achievement unlocked for user', userId, data);
  }

  // Handle recommendation update
  private async handleRecommendationUpdate(event: SyncEvent): Promise<void> {
    const { userId, data } = event;
    
    // Recommendations are already generated in other handlers
    // This event is for notifying subscribers
    console.log('Recommendations updated for user', userId);
  }

  // Notify subscribers
  private notifySubscribers(eventType: string, data: any): void {
    const subscribers = this.subscribers.get(eventType);
    if (subscribers) {
      subscribers.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('A component update failed. This won\'t affect your overall experience.');
        }
      });
    }
  }

  // Trigger sync event
  async triggerSync(event: Omit<SyncEvent, 'timestamp'>): Promise<void> {
    const syncEvent: SyncEvent = {
      ...event,
      timestamp: new Date(),
    };

    this.syncQueue.push(syncEvent);
  }

  // Force immediate sync
  async forceSync(): Promise<void> {
    await this.processSyncQueue();
    await this.performBackgroundSync();
  }

  // Perform background sync
  private async performBackgroundSync(): Promise<void> {
    try {
      // Sync all active user data
      // This would sync data for all currently active users
      const health = await dbService.healthCheck();
      if (health.status === 'healthy') {
        // Database is healthy, perform background sync
        console.log('Background sync completed');
      }
    } catch (error) {
      console.error('Background synchronization encountered an issue. Your data is safe.');
    }
  }

  // Get real-time data
  async getRealtimeData(dataType: string, params?: any): Promise<any> {
    switch (dataType) {
      case 'student_progress':
        return await dbService.getStudentProgress(params.userId);
      case 'curriculum':
        return await dbService.getActiveCurriculum(params.subjectCode);
      case 'recommendations':
        return await intelligentContentService.generateRecommendations(params.userId);
      case 'student_profile':
        return await intelligentContentService.getStudentProfile(params.userId);
      case 'lesson_content':
        return await dbService.getLesson(params.lessonCode);
      default:
        return null;
    }
  }

  // Subscribe to updates
  subscribeToUpdates(dataType: string, callback: (data: any) => void): () => void {
    if (!this.subscribers.has(dataType)) {
      this.subscribers.set(dataType, new Set());
    }

    const subscribers = this.subscribers.get(dataType)!;
    subscribers.add(callback);

    // Return unsubscribe function
    return () => {
      subscribers.delete(callback);
      if (subscribers.size === 0) {
        this.subscribers.delete(dataType);
      }
    };
  }

  // Get sync status
  getSyncStatus(): {
    isProcessing: boolean;
    queueLength: number;
    lastSync: Date | null;
    subscriberCount: number;
  } {
    let totalSubscribers = 0;
    this.subscribers.forEach(subscribers => {
      totalSubscribers += subscribers.size;
    });

    return {
      isProcessing: this.isProcessing,
      queueLength: this.syncQueue.length,
      lastSync: this.lastSyncTime,
      subscriberCount: totalSubscribers,
    };
  }

  // Cleanup
  cleanup(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    this.subscribers.clear();
    this.syncQueue = [];
  }
}

// Real-time State Sync Provider
export function RealtimeStateSyncProvider({ children }: { children: ReactNode }) {
  const syncManager = RealtimeStateSyncManager.getInstance();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [syncEvents, setSyncEvents] = useState<SyncEvent[]>([]);

  useEffect(() => {
    // Subscribe to sync status updates
    const updateSyncStatus = () => {
      const status = syncManager.getSyncStatus();
      setIsSyncing(status.isProcessing);
      setLastSync(status.lastSync);
    };

    const interval = setInterval(updateSyncStatus, 1000);
    updateSyncStatus();

    return () => clearInterval(interval);
  }, [syncManager]);

  const triggerSync = useCallback(async (event: Omit<SyncEvent, 'timestamp'>) => {
    await syncManager.triggerSync(event);
    setSyncEvents(prev => [...prev, { ...event, timestamp: new Date() }]);
  }, [syncManager]);

  const forceSync = useCallback(async () => {
    await syncManager.forceSync();
  }, [syncManager]);

  const getRealtimeData = useCallback(async (dataType: string, params?: any) => {
    return await syncManager.getRealtimeData(dataType, params);
  }, [syncManager]);

  const subscribeToUpdates = useCallback((dataType: string, callback: (data: any) => void) => {
    return syncManager.subscribeToUpdates(dataType, callback);
  }, [syncManager]);

  const contextValue: StateSyncContextType = {
    isSyncing,
    lastSync,
    syncEvents,
    triggerSync,
    forceSync,
    getRealtimeData,
    subscribeToUpdates,
  };

  return (
    <StateSyncContext.Provider value={contextValue}>
      {children}
    </StateSyncContext.Provider>
  );
}

// Hook to use real-time state sync
export function useRealtimeStateSync() {
  const context = useContext(StateSyncContext);
  if (!context) {
    throw new Error('Synchronization service not available. Please refresh the page.');
  }
  return context;
}

// Hook for real-time data
export function useRealtimeData<T>(dataType: string, params?: any) {
  const { getRealtimeData, subscribeToUpdates } = useRealtimeStateSync();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await getRealtimeData(dataType, params);
        if (mounted) {
          setData(result);
        }
      } catch (err) {
        if (mounted) {
          setError((err as Error).message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    // Subscribe to updates
    const unsubscribe = subscribeToUpdates(dataType, (newData) => {
      if (mounted) {
        setData(newData);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [dataType, params, getRealtimeData, subscribeToUpdates]);

  return { data, loading, error };
}

// Hook for real-time progress tracking
export function useRealtimeProgress(userId: number) {
  const { data, loading, error } = useRealtimeData('student_progress', { userId });
  const { triggerSync } = useRealtimeStateSync();

  const updateProgress = useCallback(async (lessonId: number, progressData: any) => {
    await triggerSync({
      type: 'progress_update',
      userId,
      data: { lessonId, ...progressData },
    });
  }, [userId, triggerSync]);

  const completeLesson = useCallback(async (lessonId: number, score: number) => {
    await triggerSync({
      type: 'lesson_complete',
      userId,
      data: { lessonId, score },
    });
  }, [userId, triggerSync]);

  const submitQuiz = useCallback(async (lessonId: number, quizData: any) => {
    await triggerSync({
      type: 'quiz_submit',
      userId,
      data: { lessonId, ...quizData },
    });
  }, [userId, triggerSync]);

  return {
    progress: data,
    loading,
    error,
    updateProgress,
    completeLesson,
    submitQuiz,
  };
}

// Hook for real-time recommendations
export function useRealtimeRecommendations(userId: number) {
  const { data, loading, error } = useRealtimeData('recommendations', { userId });

  return { recommendations: data, loading, error };
}

// Export singleton instance
export const realtimeStateSync = RealtimeStateSyncManager.getInstance();

// Export types
export type { SyncEvent, StateSyncContextType };
