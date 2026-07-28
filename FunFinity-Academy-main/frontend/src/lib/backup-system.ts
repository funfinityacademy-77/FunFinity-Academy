// Backup System for FunFinity Academy
// Handles codebase and Supabase backups with email notifications

import { CONTACT_EMAIL } from "@/config/constants";

export interface BackupConfig {
  id: string;
  name: string;
  type: 'codebase' | 'supabase' | 'database' | 'full';
  enabled: boolean;
  schedule: 'daily' | 'weekly' | 'monthly' | 'manual';
  lastBackup?: string;
  nextBackup?: string;
  retentionDays: number;
}

export interface BackupLog {
  id: string;
  configId: string;
  type: BackupConfig['type'];
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt: string;
  completedAt?: string;
  size?: number;
  location?: string;
  error?: string;
  emailSent: boolean;
}

export interface BackupNotification {
  id: string;
  recipient: string;
  type: 'success' | 'failure' | 'scheduled';
  subject: string;
  body: string;
  sentAt: string;
  status: 'pending' | 'sent' | 'failed';
}

const backupConfigs: BackupConfig[] = [
  {
    id: 'codebase-daily',
    name: 'Daily Codebase Backup',
    type: 'codebase',
    enabled: true,
    schedule: 'daily',
    retentionDays: 30,
  },
  {
    id: 'supabase-daily',
    name: 'Daily Supabase Backup',
    type: 'supabase',
    enabled: true,
    schedule: 'daily',
    retentionDays: 30,
  },
  {
    id: 'database-weekly',
    name: 'Weekly Database Backup',
    type: 'database',
    enabled: true,
    schedule: 'weekly',
    retentionDays: 90,
  },
  {
    id: 'full-backup-monthly',
    name: 'Monthly Full Backup',
    type: 'full',
    enabled: true,
    schedule: 'monthly',
    retentionDays: 365,
  },
];

class BackupSystem {
  private static instance: BackupSystem;
  private backupLogs: BackupLog[] = [];
  private notifications: BackupNotification[] = [];
  private readonly adminEmail = CONTACT_EMAIL;
  private readonly senderEmail = CONTACT_EMAIL;

  private constructor() {
    this.loadBackupLogs();
    this.loadNotifications();
  }

  static getInstance(): BackupSystem {
    if (!BackupSystem.instance) {
      BackupSystem.instance = new BackupSystem();
    }
    return BackupSystem.instance;
  }

  private loadBackupLogs() {
    try {
      const saved = localStorage.getItem('backup_logs');
      if (saved) {
        this.backupLogs = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading backup logs:', error);
    }
  }

  private saveBackupLogs() {
    try {
      localStorage.setItem('backup_logs', JSON.stringify(this.backupLogs));
    } catch (error) {
      console.error('Error saving backup logs:', error);
    }
  }

  private loadNotifications() {
    try {
      const saved = localStorage.getItem('backup_notifications');
      if (saved) {
        this.notifications = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading backup notifications:', error);
    }
  }

  private saveNotifications() {
    try {
      localStorage.setItem('backup_notifications', JSON.stringify(this.notifications));
    } catch (error) {
      console.error('Error saving backup notifications:', error);
    }
  }

  getBackupConfigs(): BackupConfig[] {
    return backupConfigs;
  }

  getBackupConfig(id: string): BackupConfig | undefined {
    return backupConfigs.find(c => c.id === id);
  }

  getBackupLogs(): BackupLog[] {
    return this.backupLogs;
  }

  getNotifications(): BackupNotification[] {
    return this.notifications;
  }

  async createBackup(configId: string, manual: boolean = false): Promise<BackupLog> {
    const config = this.getBackupConfig(configId);
    if (!config) {
      throw new Error(`Backup config not found: ${configId}`);
    }

    const backupLog: BackupLog = {
      id: `backup-${Date.now()}`,
      configId,
      type: config.type,
      status: 'pending',
      startedAt: new Date().toISOString(),
      emailSent: false,
    };

    this.backupLogs.push(backupLog);
    this.saveBackupLogs();

    try {
      // Update status to running
      backupLog.status = 'running';
      this.saveBackupLogs();

      // Simulate backup process based on type
      await this.performBackup(config.type, backupLog);

      // Update status to completed
      backupLog.status = 'completed';
      backupLog.completedAt = new Date().toISOString();
      this.saveBackupLogs();

      // Send success notification
      await this.sendBackupNotification(backupLog, 'success');

      // Update config last backup time
      config.lastBackup = new Date().toISOString();
      this.calculateNextBackup(config);

      return backupLog;
    } catch (error) {
      console.error('Backup failed:', error);
      backupLog.status = 'failed';
      backupLog.error = error instanceof Error ? error.message : 'Unknown error';
      backupLog.completedAt = new Date().toISOString();
      this.saveBackupLogs();

      // Send failure notification
      await this.sendBackupNotification(backupLog, 'failure');

      throw error;
    }
  }

  private async performBackup(type: BackupConfig['type'], backupLog: BackupLog): Promise<void> {
    console.log(`Starting ${type} backup...`);

    // Simulate backup process
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate backup location
    const timestamp = new Date().toISOString().split('T')[0];
    backupLog.location = `/backups/${type}/${timestamp}`;
    backupLog.size = Math.floor(Math.random() * 100000000) + 10000000; // Random size between 10MB and 100MB

    console.log(`${type} backup completed at ${backupLog.location}`);
  }

  private calculateNextBackup(config: BackupConfig): void {
    const now = new Date();
    let nextBackup: Date;

    switch (config.schedule) {
      case 'daily':
        nextBackup = new Date(now);
        nextBackup.setDate(nextBackup.getDate() + 1);
        nextBackup.setHours(2, 0, 0, 0); // 2 AM
        break;
      case 'weekly':
        nextBackup = new Date(now);
        nextBackup.setDate(nextBackup.getDate() + 7);
        nextBackup.setHours(2, 0, 0, 0);
        break;
      case 'monthly':
        nextBackup = new Date(now);
        nextBackup.setMonth(nextBackup.getMonth() + 1);
        nextBackup.setDate(1);
        nextBackup.setHours(2, 0, 0, 0);
        break;
      default:
        nextBackup = new Date(now);
        nextBackup.setDate(nextBackup.getDate() + 1);
    }

    config.nextBackup = nextBackup.toISOString();
  }

  private async sendBackupNotification(backupLog: BackupLog, type: 'success' | 'failure'): Promise<void> {
    const config = this.getBackupConfig(backupLog.configId);
    if (!config) return;

    const notification: BackupNotification = {
      id: `notification-${Date.now()}`,
      recipient: this.adminEmail,
      type,
      subject: this.buildSubject(backupLog, config, type),
      body: this.buildBody(backupLog, config, type),
      sentAt: new Date().toISOString(),
      status: 'pending',
    };

    try {
      // Simulate email sending
      console.log('Sending backup notification:', {
        to: notification.recipient,
        subject: notification.subject,
        body: notification.body,
      });

      await new Promise(resolve => setTimeout(resolve, 500));

      notification.status = 'sent';
      backupLog.emailSent = true;
      this.notifications.push(notification);
      this.saveNotifications();
      this.saveBackupLogs();
    } catch (error) {
      console.error('Failed to send backup notification:', error);
      notification.status = 'failed';
      this.notifications.push(notification);
      this.saveNotifications();
    }
  }

  private buildSubject(backupLog: BackupLog, config: BackupConfig, type: 'success' | 'failure'): string {
    const status = type === 'success' ? '✅ Success' : '❌ Failed';
    return `[FunFinity Backup] ${config.name} - ${status}`;
  }

  private buildBody(backupLog: BackupLog, config: BackupConfig, type: 'success' | 'failure'): string {
    const status = type === 'success' ? 'completed successfully' : 'failed';
    const timestamp = new Date(backupLog.startedAt).toLocaleString();

    let body = `Backup ${status}\n\n`;
    body += `Backup Details:\n`;
    body += `- Name: ${config.name}\n`;
    body += `- Type: ${config.type}\n`;
    body += `- Started: ${timestamp}\n`;

    if (type === 'success') {
      body += `- Completed: ${new Date(backupLog.completedAt!).toLocaleString()}\n`;
      body += `- Size: ${this.formatSize(backupLog.size!)}\n`;
      body += `- Location: ${backupLog.location}\n`;
      body += `- Retention: ${config.retentionDays} days\n`;
      body += `- Next Backup: ${config.nextBackup ? new Date(config.nextBackup).toLocaleString() : 'Not scheduled'}\n`;
    } else {
      body += `- Error: ${backupLog.error}\n`;
    }

    body += `\n`;
    body += `This is an automated message from FunFinity Academy Backup System.\n`;
    body += `Sender: ${this.senderEmail}\n`;

    return body;
  }

  private formatSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  async scheduleAutomaticBackups(): Promise<void> {
    const configs = this.getBackupConfigs().filter(c => c.enabled && c.schedule !== 'manual');

    for (const config of configs) {
      if (config.nextBackup) {
        const nextBackup = new Date(config.nextBackup);
        const now = new Date();

        if (now >= nextBackup) {
          console.log(`Running scheduled backup: ${config.name}`);
          await this.createBackup(config.id);
        }
      }
    }
  }

  async cleanupOldBackups(): Promise<void> {
    const now = new Date();
    const configs = this.getBackupConfigs();

    for (const config of configs) {
      const retentionDate = new Date(now);
      retentionDate.setDate(retentionDate.getDate() - config.retentionDays);

      // Find old backups for this config
      const oldBackups = this.backupLogs.filter(log => 
        log.configId === config.id && 
        new Date(log.startedAt) < retentionDate
      );

      // Remove old backups from logs
      this.backupLogs = this.backupLogs.filter(log => 
        !oldBackups.includes(log)
      );

      if (oldBackups.length > 0) {
        console.log(`Cleaned up ${oldBackups.length} old backups for ${config.name}`);
      }
    }

    this.saveBackupLogs();
  }

  getBackupStats() {
    const totalBackups = this.backupLogs.length;
    const successfulBackups = this.backupLogs.filter(b => b.status === 'completed').length;
    const failedBackups = this.backupLogs.filter(b => b.status === 'failed').length;
    const pendingBackups = this.backupLogs.filter(b => b.status === 'pending' || b.status === 'running').length;

    const totalSize = this.backupLogs
      .filter(b => b.size)
      .reduce((sum, b) => sum + (b.size || 0), 0);

    const byType: Record<string, number> = {};
    this.backupLogs.forEach(log => {
      byType[log.type] = (byType[log.type] || 0) + 1;
    });

    return {
      totalBackups,
      successfulBackups,
      failedBackups,
      pendingBackups,
      successRate: totalBackups > 0 ? (successfulBackups / totalBackups) * 100 : 0,
      totalSize,
      byType,
    };
  }

  clearLogs(): void {
    this.backupLogs = [];
    this.notifications = [];
    this.saveBackupLogs();
    this.saveNotifications();
  }
}

export const backupSystem = BackupSystem.getInstance();
