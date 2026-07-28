/**
 * ACTIVITY LOGS SERVICE
 * 
 * This service wires activity logs to real database data instead of mock data.
 * It provides a comprehensive logging system for tracking user actions across the platform.
 */

import { supabase } from "@/lib/supabase";
import { db } from "@/lib/database-client";

export interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface ActivityLogFilters {
  userId?: string;
  action?: string;
  entityType?: string;
  entityId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

/**
 * Log an activity to the database
 */
export async function logActivity(data: {
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('activity_logs').insert({
      user_id: data.userId,
      action: data.action,
      entity_type: data.entityType,
      entity_id: data.entityId,
      details: data.details,
      ip_address: data.ipAddress,
      user_agent: data.userAgent,
    });

    if (error) {
      console.error('Failed to log activity:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Activity log error:', error);
    return { success: false, error: 'Failed to log activity' };
  }
}

/**
 * Fetch activity logs with filters
 */
export async function fetchActivityLogs(
  filters: ActivityLogFilters
): Promise<{ data: ActivityLog[]; error: string | null }> {
  try {
    let query = db.from<ActivityLog>('activity_logs');

    // Apply filters
    if (filters.userId) {
      query = query.eq('user_id', filters.userId);
    }
    if (filters.action) {
      query = query.eq('action', filters.action);
    }
    if (filters.entityType) {
      query = query.eq('entity_type', filters.entityType);
    }
    if (filters.entityId) {
      query = query.eq('entity_id', filters.entityId);
    }
    if (filters.startDate) {
      query = query.gte('created_at', filters.startDate.toISOString());
    }
    if (filters.endDate) {
      query = query.lte('created_at', filters.endDate.toISOString());
    }

    // Apply pagination
    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    if (filters.offset) {
      query = query.offset(filters.offset);
    }

    // Order by most recent first
    query = query.withOptions({ cache: false });

    const result = await query.execute();

    if (result.error) {
      return { data: [], error: result.error };
    }

    return { data: result.data || [], error: null };
  } catch (error) {
    console.error('Failed to fetch activity logs:', error);
    return { data: [], error: 'Failed to fetch activity logs' };
  }
}

/**
 * Get activity log statistics
 */
export async function getActivityLogStats(
  userId?: string,
  startDate?: Date,
  endDate?: Date
): Promise<{
  totalLogs: number;
  actionCounts: Record<string, number>;
  entityTypeCounts: Record<string, number>;
  error: string | null;
}> {
  try {
    let query = db.from<ActivityLog>('activity_logs');

    if (userId) {
      query = query.eq('user_id', userId);
    }
    if (startDate) {
      query = query.gte('created_at', startDate.toISOString());
    }
    if (endDate) {
      query = query.lte('created_at', endDate.toISOString());
    }

    const result = await query.execute();

    if (result.error) {
      return {
        totalLogs: 0,
        actionCounts: {},
        entityTypeCounts: {},
        error: result.error,
      };
    }

    const logs = result.data || [];

    // Calculate statistics
    const actionCounts: Record<string, number> = {};
    const entityTypeCounts: Record<string, number> = {};

    logs.forEach(log => {
      actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
      entityTypeCounts[log.entity_type] = (entityTypeCounts[log.entity_type] || 0) + 1;
    });

    return {
      totalLogs: logs.length,
      actionCounts,
      entityTypeCounts,
      error: null,
    };
  } catch (error) {
    console.error('Failed to get activity log stats:', error);
    return {
      totalLogs: 0,
      actionCounts: {},
      entityTypeCounts: {},
      error: 'Failed to get statistics',
    };
  }
}

/**
 * Delete old activity logs (cleanup)
 */
export async function cleanupOldLogs(daysToKeep: number = 90): Promise<{
  success: boolean;
  deletedCount: number;
  error?: string;
}> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const { data, error, count } = await supabase
      .from('activity_logs')
      .delete()
      .lt('created_at', cutoffDate.toISOString());

    if (error) {
      return { success: false, deletedCount: 0, error: error.message };
    }

    return {
      success: true,
      deletedCount: data?.length || 0,
    };
  } catch (error) {
    console.error('Failed to cleanup old logs:', error);
    return { success: false, deletedCount: 0, error: 'Failed to cleanup logs' };
  }
}

/**
 * Common action types for consistent logging
 */
export const ACTION_TYPES = {
  // User actions
  USER_LOGIN: 'user.login',
  USER_LOGOUT: 'user.logout',
  USER_REGISTER: 'user.register',
  USER_UPDATE_PROFILE: 'user.update_profile',
  USER_CHANGE_PASSWORD: 'user.change_password',
  
  // Course actions
  COURSE_ENROLL: 'course.enroll',
  COURSE_UNENROLL: 'course.unenroll',
  COURSE_COMPLETE: 'course.complete',
  COURSE_START: 'course.start',
  COURSE_UPDATE: 'course.update',
  COURSE_DELETE: 'course.delete',
  
  // Assignment actions
  ASSIGNMENT_SUBMIT: 'assignment.submit',
  ASSIGNMENT_GRADE: 'assignment.grade',
  ASSIGNMENT_CREATE: 'assignment.create',
  ASSIGNMENT_UPDATE: 'assignment.update',
  ASSIGNMENT_DELETE: 'assignment.delete',
  
  // Quiz actions
  QUIZ_START: 'quiz.start',
  QUIZ_COMPLETE: 'quiz.complete',
  QUIZ_RETAKE: 'quiz.retake',
  
  // Discussion actions
  DISCUSSION_CREATE: 'discussion.create',
  DISCUSSION_REPLY: 'discussion.reply',
  DISCUSSION_DELETE: 'discussion.delete',
  DISCUSSION_UPDATE: 'discussion.update',
  
  // Admin actions
  ADMIN_USER_BAN: 'admin.user_ban',
  ADMIN_USER_UNBAN: 'admin.user_unban',
  ADMIN_USER_UPDATE: 'admin.user_update',
  ADMIN_COURSE_CREATE: 'admin.course_create',
  ADMIN_COURSE_UPDATE: 'admin.course_update',
  ADMIN_COURSE_DELETE: 'admin.course_delete',
  ADMIN_SETTINGS_UPDATE: 'admin.settings_update',
  
  // System actions
  SYSTEM_BACKUP: 'system.backup',
  SYSTEM_MAINTENANCE: 'system.maintenance',
  SYSTEM_ERROR: 'system.error',
} as const;

/**
 * Entity types for consistent logging
 */
export const ENTITY_TYPES = {
  USER: 'user',
  COURSE: 'course',
  ASSIGNMENT: 'assignment',
  QUIZ: 'quiz',
  DISCUSSION: 'discussion',
  COMMENT: 'comment',
  ENROLLMENT: 'enrollment',
  SUBMISSION: 'submission',
  GRADE: 'grade',
  BADGE: 'badge',
  ACHIEVEMENT: 'achievement',
  NOTIFICATION: 'notification',
  SETTINGS: 'settings',
} as const;

/**
 * Helper function to log common actions
 */
export async function logCommonAction(data: {
  userId: string;
  action: keyof typeof ACTION_TYPES;
  entityType: keyof typeof ENTITY_TYPES;
  entityId: string;
  details?: Record<string, any>;
}): Promise<{ success: boolean; error?: string }> {
  return logActivity({
    userId: data.userId,
    action: ACTION_TYPES[data.action],
    entityType: ENTITY_TYPES[data.entityType],
    entityId: data.entityId,
    details: data.details,
  });
}

/**
 * Get client IP address (for logging)
 */
export function getClientIPAddress(): string | null {
  // In a real implementation, this would come from request headers
  // For client-side, we can't reliably get the IP
  return null;
}

/**
 * Get user agent (for logging)
 */
export function getUserAgent(): string {
  if (typeof window !== 'undefined') {
    return navigator.userAgent;
  }
  return 'Unknown';
}
