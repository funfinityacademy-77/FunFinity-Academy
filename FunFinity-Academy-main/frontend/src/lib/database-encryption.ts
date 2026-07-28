/**
 * Database Encryption Utility for FunFinity Academy
 * Provides encryption for sensitive database fields
 */

import { encrypt, decrypt, hash } from './encryption';

// Database encryption key (in production, this should be stored securely)
const DB_ENCRYPTION_KEY = 'funfinity_db_encryption_key_v1';

/**
 * Sensitive field names that should be encrypted
 */
export const SENSITIVE_FIELDS = [
  'email',
  'phone',
  'password',
  'ssn',
  'credit_card',
  'bank_account',
  'address',
  'secret_key',
  'api_key',
  'token',
  'personal_notes',
  'emergency_contacts',
] as const;

/**
 * Encrypts a sensitive field value before storing in database
 */
export async function encryptField(value: string): Promise<string> {
  try {
    return await encrypt(value, DB_ENCRYPTION_KEY);
  } catch (error) {
    console.error('Failed to encrypt field:', error);
    throw new Error('Failed to encrypt field');
  }
}

/**
 * Decrypts a sensitive field value after retrieving from database
 */
export async function decryptField(encryptedValue: string): Promise<string> {
  try {
    return await decrypt(encryptedValue, DB_ENCRYPTION_KEY);
  } catch (error) {
    console.error('Failed to decrypt field:', error);
    throw new Error('Failed to decrypt field');
  }
}

/**
 * Encrypts an object's sensitive fields
 */
export async function encryptSensitiveFields<T extends Record<string, any>>(
  data: T,
  customSensitiveFields?: string[]
): Promise<T> {
  const sensitiveFields = customSensitiveFields || SENSITIVE_FIELDS;
  const encryptedData = { ...data };

  for (const field of sensitiveFields) {
    if (encryptedData[field] && typeof encryptedData[field] === 'string') {
      try {
        encryptedData[field] = await encryptField(encryptedData[field]);
      } catch (error) {
        console.error(`Failed to encrypt field ${field}:`, error);
      }
    }
  }

  return encryptedData;
}

/**
 * Decrypts an object's sensitive fields
 */
export async function decryptSensitiveFields<T extends Record<string, any>>(
  data: T,
  customSensitiveFields?: string[]
): Promise<T> {
  const sensitiveFields = customSensitiveFields || SENSITIVE_FIELDS;
  const decryptedData = { ...data };

  for (const field of sensitiveFields) {
    if (decryptedData[field] && typeof decryptedData[field] === 'string') {
      try {
        // Check if the value is encrypted (base64 encoded)
        if (isEncrypted(decryptedData[field])) {
          decryptedData[field] = await decryptField(decryptedData[field]);
        }
      } catch (error) {
        console.error(`Failed to decrypt field ${field}:`, error);
        // Keep original value if decryption fails
      }
    }
  }

  return decryptedData;
}

/**
 * Checks if a string is encrypted (base64 encoded)
 */
function isEncrypted(value: string): boolean {
  try {
    // Basic check for base64 encoding
    const base64Regex = /^[A-Za-z0-9+/={20,}=*$/;
    return base64Regex.test(value) && value.length > 20;
  } catch {
    return false;
  }
}

/**
 * Hashes sensitive data for comparison without storing the actual value
 */
export async function hashSensitiveData(value: string): Promise<string> {
  return await hash(value);
}

/**
 * Verifies if a value matches a hashed value
 */
export async function verifySensitiveData(value: string, hashedValue: string): Promise<boolean> {
  const hashed = await hashSensitiveData(value);
  return hashed === hashedValue;
}

/**
 * Sanitizes data by removing sensitive fields
 */
export function sanitizeData<T extends Record<string, any>>(
  data: T,
  customSensitiveFields?: string[]
): Partial<T> {
  const sensitiveFields = customSensitiveFields || SENSITIVE_FIELDS;
  const sanitized = { ...data };

  for (const field of sensitiveFields) {
    delete sanitized[field];
  }

  return sanitized;
}

/**
 * Masks sensitive data for logging or display
 */
export function maskSensitiveData(value: string, visibleChars: number = 4): string {
  if (!value || value.length <= visibleChars) {
    return '*'.repeat(value.length);
  }
  return value.substring(0, visibleChars) + '*'.repeat(value.length - visibleChars);
}
