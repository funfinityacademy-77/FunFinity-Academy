/**
 * Backup Service
 * Handles data export and import for user backup/restore functionality
 */

import { supabase } from './supabase';
import { useAuth } from '@/hooks/use-auth';

export interface BackupData {
  version: string;
  timestamp: string;
  user: {
    id: string;
    email: string;
    display_name: string;
    role: string;
  };
  profile?: any;
  learning_dna?: any;
  notes?: any[];
  bookmarks?: any[];
  enrollments?: any[];
  course_progress?: any[];
}

/**
 * Export user data to JSON backup file
 */
export async function exportBackup(userId: string): Promise<BackupData> {
  try {
    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    // Get learning DNA profile
    const { data: learningDna } = await supabase
      .from('learning_dna_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Get notes
    const { data: notes } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId);

    // Get bookmarks
    const { data: bookmarks } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('user_id', userId);

    // Get enrollments
    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('*')
      .eq('user_id', userId);

    // Get course progress
    const { data: courseProgress } = await supabase
      .from('course_progress')
      .select('*')
      .eq('user_id', userId);

    const backupData: BackupData = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      user: {
        id: userId,
        email: profile?.email || '',
        display_name: profile?.display_name || '',
        role: profile?.role || 'student'
      },
      profile,
      learning_dna: learningDna,
      notes: notes || [],
      bookmarks: bookmarks || [],
      enrollments: enrollments || [],
      course_progress: courseProgress || []
    };

    return backupData;
  } catch (error) {
    console.error('Backup export failed:', error);
    throw new Error('Failed to export backup data');
  }
}

/**
 * Download backup data as JSON file
 */
export function downloadBackup(backupData: BackupData, filename?: string): void {
  const jsonString = JSON.stringify(backupData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `funfinity-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Import backup data from JSON file
 */
export async function importBackup(file: File): Promise<BackupData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const backupData = JSON.parse(event.target?.result as string);
        
        // Validate backup structure
        if (!backupData.version || !backupData.user || !backupData.timestamp) {
          throw new Error('Invalid backup file format');
        }
        
        resolve(backupData);
      } catch (error) {
        reject(new Error('Failed to parse backup file'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read backup file'));
    };
    
    reader.readAsText(file);
  });
}

/**
 * Restore backup data to Supabase
 */
export async function restoreBackup(backupData: BackupData, currentUserId: string): Promise<void> {
  try {
    // Verify user ID matches (security check)
    if (backupData.user.id !== currentUserId) {
      throw new Error('Backup file does not belong to current user');
    }

    // Restore profile
    if (backupData.profile) {
      await supabase
        .from('profiles')
        .upsert({
          ...backupData.profile,
          id: currentUserId,
          updated_at: new Date().toISOString()
        });
    }

    // Restore learning DNA
    if (backupData.learning_dna) {
      await supabase
        .from('learning_dna_profiles')
        .upsert({
          ...backupData.learning_dna,
          user_id: currentUserId,
          updated_at: new Date().toISOString()
        });
    }

    // Restore notes
    if (backupData.notes && backupData.notes.length > 0) {
      for (const note of backupData.notes) {
        await supabase
          .from('notes')
          .upsert({
            ...note,
            user_id: currentUserId,
            updated_at: new Date().toISOString()
          });
      }
    }

    // Restore bookmarks
    if (backupData.bookmarks && backupData.bookmarks.length > 0) {
      for (const bookmark of backupData.bookmarks) {
        await supabase
          .from('bookmarks')
          .upsert({
            ...bookmark,
            user_id: currentUserId,
            updated_at: new Date().toISOString()
          });
      }
    }

    // Restore enrollments
    if (backupData.enrollments && backupData.enrollments.length > 0) {
      for (const enrollment of backupData.enrollments) {
        await supabase
          .from('enrollments')
          .upsert({
            ...enrollment,
            user_id: currentUserId,
            updated_at: new Date().toISOString()
          });
      }
    }

    // Restore course progress
    if (backupData.course_progress && backupData.course_progress.length > 0) {
      for (const progress of backupData.course_progress) {
        await supabase
          .from('course_progress')
          .upsert({
            ...progress,
            user_id: currentUserId,
            updated_at: new Date().toISOString()
          });
      }
    }
  } catch (error) {
    console.error('Backup restore failed:', error);
    throw new Error('Failed to restore backup data');
  }
}

/**
 * Get backup file info
 */
export function getBackupFileInfo(file: File): { name: string; size: string; type: string } {
  const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
  return {
    name: file.name,
    size: `${sizeInMB} MB`,
    type: file.type || 'application/json'
  };
}
