import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Upload, Lock, AlertTriangle, CheckCircle2, Shield, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { 
  createEncryptedBackup, 
  restoreEncryptedBackup, 
  downloadBackup, 
  generateBackupFilename 
} from '@/lib/backup-encryption';
import { supabase } from '@/lib/supabase';

export default function BackupSettings() {
  const { user } = useAuth();
  const [backupPassword, setBackupPassword] = useState('');
  const [restorePassword, setRestorePassword] = useState('');
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch all student data for backup
  const { data: profileData } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const data = await apiClient.get<any | null>(`/api/users/${user!.id}/profile`);
      return data;
    },
    enabled: !!user,
  });

  const { data: learningDNAData } = useQuery({
    queryKey: ['learning-dna', user?.id],
    queryFn: async () => {
      const data = await apiClient.get<any | null>(`/api/users/${user!.id}/learning-dna`);
      return data;
    },
    enabled: !!user,
  });

  const { data: careerProfileData } = useQuery({
    queryKey: ['career-profile', user?.id],
    queryFn: async () => {
      const data = await apiClient.get<any | null>(`/api/users/${user!.id}/career-profile`);
      return data;
    },
    enabled: !!user,
  });

  const { data: notesData } = useQuery({
    queryKey: ['notes', user?.id],
    queryFn: async () => {
      const { data } = await supabase.from('notes').select('*').eq('user_id', user!.id);
      return data;
    },
    enabled: !!user,
  });

  const { data: bookmarksData } = useQuery({
    queryKey: ['bookmarks', user?.id],
    queryFn: async () => {
      const { data } = await supabase.from('bookmarks').select('*').eq('user_id', user!.id);
      return data;
    },
    enabled: !!user,
  });

  const { data: calendarEventsData } = useQuery({
    queryKey: ['calendar-events', user?.id],
    queryFn: async () => {
      const { data } = await supabase.from('calendar_events').select('*').eq('user_id', user!.id);
      return data;
    },
    enabled: !!user,
  });

  const { data: gamificationStats } = useQuery({
    queryKey: ['gamification-stats', user?.id],
    queryFn: async () => {
      const { data } = await supabase.from('gamification_stats').select('*').eq('user_id', user!.id).single();
      return data;
    },
    enabled: !!user,
  });

  const handleCreateBackup = async () => {
    if (!backupPassword || backupPassword.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters' });
      return;
    }

    if (!user?.email) {
      setMessage({ type: 'error', text: 'User email not found' });
      return;
    }

    setIsCreatingBackup(true);
    setMessage(null);

    try {
      const backupData = {
        profile: profileData,
        learning_dna: learningDNAData,
        career_profile: careerProfileData,
        academic_profile: null, // Add when implemented
        gamification_stats: gamificationStats,
        notes: notesData || [],
        bookmarks: bookmarksData || [],
        calendar_events: calendarEventsData || [],
        milestones: [], // Add when implemented
      };

      const blob = await createEncryptedBackup(user.id, user.email, backupPassword, backupData);
      const filename = generateBackupFilename(user.email);
      downloadBackup(blob, filename);

      setMessage({ type: 'success', text: 'Backup created and downloaded successfully' });
      setBackupPassword('');
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to create backup. Please try again.' });
      console.error('Backup error:', error);
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const handleRestoreBackup = async () => {
    if (!restorePassword || !restoreFile) {
      setMessage({ type: 'error', text: 'Please provide password and select a backup file' });
      return;
    }

    if (!user?.email) {
      setMessage({ type: 'error', text: 'User email not found' });
      return;
    }

    setIsRestoring(true);
    setMessage(null);

    try {
      const backupData = await restoreEncryptedBackup(restoreFile, restorePassword, user.email);

      // Restore data to backend
      // This is a simplified version - in production, you'd want more sophisticated merge logic
      if (backupData.data.profile) {
        await supabase.from('profiles').upsert(backupData.data.profile);
      }
      if (backupData.data.learning_dna) {
        await supabase.from('learning_dna_profiles').upsert(backupData.data.learning_dna);
      }
      if (backupData.data.career_profile) {
        await supabase.from('career_profiles').upsert(backupData.data.career_profile);
      }
      if (backupData.data.gamification_stats) {
        await supabase.from('gamification_stats').upsert(backupData.data.gamification_stats);
      }

      setMessage({ type: 'success', text: 'Backup restored successfully' });
      setRestorePassword('');
      setRestoreFile(null);
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to restore backup' });
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
          <Shield className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Encrypted Backup & Restore</h1>
          <p className="text-sm text-muted-foreground">Securely backup and restore your student data</p>
        </div>
      </div>

      {/* Security Notice */}
      <Card className="p-4 border-orange/30 bg-orange/5">
        <div className="flex items-start gap-3">
          <Lock className="w-5 h-5 text-orange shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-foreground mb-1">Military-Grade Encryption</h3>
            <p className="text-sm text-muted-foreground">
              Your backup is encrypted with AES-256 encryption. The file cannot be decrypted without your password. 
              Store your password securely - it cannot be recovered.
            </p>
          </div>
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Create Backup */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Download className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Create Backup</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Encryption Password</label>
                <Input
                  type="password"
                  placeholder="Enter a strong password (min 8 characters)"
                  value={backupPassword}
                  onChange={(e) => setBackupPassword(e.target.value)}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  This password is required to decrypt your backup later
                </p>
              </div>

              <div className="p-3 bg-secondary/30 rounded-lg space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Profile & Settings</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Learning DNA</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Career Profile</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Notes & Bookmarks</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Calendar Events</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Gamification Stats</span>
                </div>
              </div>

              <Button
                onClick={handleCreateBackup}
                disabled={isCreatingBackup || !backupPassword}
                className="w-full"
              >
                {isCreatingBackup ? 'Creating Backup...' : 'Download Encrypted Backup'}
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Restore Backup */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Upload className="w-5 h-5 text-cyan" />
              <h2 className="text-lg font-semibold text-foreground">Restore Backup</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Select Backup File</label>
                <Input
                  type="file"
                  accept=".json"
                  onChange={(e) => setRestoreFile(e.target.files?.[0] || null)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Decryption Password</label>
                <Input
                  type="password"
                  placeholder="Enter the password used to create this backup"
                  value={restorePassword}
                  onChange={(e) => setRestorePassword(e.target.value)}
                  className="w-full"
                />
              </div>

              <Card className="p-3 bg-orange/5 border-orange/30">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground">
                    Restoring will overwrite existing data. This action cannot be undone.
                  </p>
                </div>
              </Card>

              <Button
                onClick={handleRestoreBackup}
                disabled={isRestoring || !restorePassword || !restoreFile}
                variant="outline"
                className="w-full"
              >
                {isRestoring ? 'Restoring...' : 'Restore from Backup'}
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Message Display */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <AlertTriangle className="w-5 h-5" />
          )}
          <span className="text-sm">{message.text}</span>
        </motion.div>
      )}
    </div>
  );
}
