import { encrypt, decrypt } from './encryption';

export interface StudentBackupData {
  version: string;
  user_id: string;
  email: string;
  timestamp: string;
  data: {
    profile: any;
    learning_dna: any;
    career_profile: any;
    academic_profile: any;
    gamification_stats: any;
    notes: any[];
    bookmarks: any[];
    calendar_events: any[];
    milestones: any[];
  };
}

/**
 * Encrypt and backup all student data to a downloadable JSON file
 * The file is encrypted with the user's password and cannot be decrypted without it
 */
export async function createEncryptedBackup(
  userId: string,
  email: string,
  password: string,
  data: Partial<StudentBackupData['data']>
): Promise<Blob> {
  const backupData: StudentBackupData = {
    version: '1.0',
    user_id: userId,
    email: email,
    timestamp: new Date().toISOString(),
    data: data as any
  };

  const jsonString = JSON.stringify(backupData);
  const encryptedData = await encrypt(jsonString, password);

  // Create a blob with the encrypted data
  const blob = new Blob([encryptedData], { type: 'application/json' });
  return blob;
}

/**
 * Decrypt and restore student data from an encrypted backup file
 * Requires the correct password to decrypt
 */
export async function restoreEncryptedBackup(
  file: File,
  password: string,
  expectedEmail: string
): Promise<StudentBackupData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const encryptedData = e.target?.result as string;
        const decryptedJson = await decrypt(encryptedData, password);
        const backupData: StudentBackupData = JSON.parse(decryptedJson);

        // Verify email matches for security
        if (backupData.email !== expectedEmail) {
          throw new Error('Backup file does not match your account email');
        }

        resolve(backupData);
      } catch (error) {
        reject(new Error('Failed to decrypt backup. Incorrect password or corrupted file.'));
      }
    };

    reader.onerror = () => reject(new Error('Failed to read backup file'));
    reader.readAsText(file);
  });
}

/**
 * Download the encrypted backup file
 */
export function downloadBackup(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generate a backup filename with timestamp
 */
export function generateBackupFilename(email: string): string {
  const date = new Date().toISOString().split('T')[0];
  const sanitizedEmail = email.replace(/[^a-zA-Z0-9]/g, '_');
  return `funfinity_backup_${sanitizedEmail}_${date}.json`;
}
