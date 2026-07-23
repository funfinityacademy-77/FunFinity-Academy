/**
 * Secure Storage Utility for FunFinity Academy
 * Provides encrypted storage for sensitive tokens and data
 */

import { encrypt, decrypt, generateKey } from './encryption';

// Master encryption key (in production, this should be stored securely)
const STORAGE_KEY = 'funfinity_storage_key';
const SESSION_PREFIX = 'funfinity_session_';
const TOKEN_PREFIX = 'funfinity_token_';

/**
 * Initialize secure storage with a master key
 */
export function initSecureStorage(): string {
  let masterKey = localStorage.getItem(STORAGE_KEY);
  if (!masterKey) {
    masterKey = generateKey();
    localStorage.setItem(STORAGE_KEY, masterKey);
  }
  return masterKey;
}

/**
 * Get the master encryption key
 */
function getMasterKey(): string {
  const key = localStorage.getItem(STORAGE_KEY);
  if (!key) {
    throw new Error('Secure storage not initialized. Call initSecureStorage() first.');
  }
  return key;
}

/**
 * Securely store a token
 */
export async function setSecureToken(tokenType: string, token: string): Promise<void> {
  try {
    const masterKey = getMasterKey();
    const encrypted = await encrypt(token, masterKey);
    localStorage.setItem(`${TOKEN_PREFIX}${tokenType}`, encrypted);
  } catch (error) {
    console.error('Failed to securely store token:', error);
    throw new Error('Failed to securely store token');
  }
}

/**
 * Retrieve and decrypt a token
 */
export async function getSecureToken(tokenType: string): Promise<string | null> {
  try {
    const masterKey = getMasterKey();
    const encrypted = localStorage.getItem(`${TOKEN_PREFIX}${tokenType}`);
    if (!encrypted) return null;
    
    return await decrypt(encrypted, masterKey);
  } catch (error) {
    console.error('Failed to securely retrieve token:', error);
    return null;
  }
}

/**
 * Remove a secure token
 */
export function removeSecureToken(tokenType: string): void {
  localStorage.removeItem(`${TOKEN_PREFIX}${tokenType}`);
}

/**
 * Clear all secure tokens
 */
export function clearSecureTokens(): void {
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith(TOKEN_PREFIX)) {
      localStorage.removeItem(key);
    }
  });
}

/**
 * Securely store session data
 */
export async function setSessionData(key: string, data: any): Promise<void> {
  try {
    const masterKey = getMasterKey();
    const encrypted = await encrypt(data, masterKey);
    sessionStorage.setItem(`${SESSION_PREFIX}${key}`, encrypted);
  } catch (error) {
    console.error('Failed to securely store session data:', error);
    throw new Error('Failed to securely store session data');
  }
}

/**
 * Retrieve and decrypt session data
 */
export async function getSessionData(key: string): Promise<any> {
  try {
    const masterKey = getMasterKey();
    const encrypted = sessionStorage.getItem(`${SESSION_PREFIX}${key}`);
    if (!encrypted) return null;
    
    const decrypted = await decrypt(encrypted, masterKey);
    try {
      return JSON.parse(decrypted);
    } catch {
      return decrypted;
    }
  } catch (error) {
    console.error('Failed to securely retrieve session data:', error);
    return null;
  }
}

/**
 * Remove session data
 */
export function removeSessionData(key: string): void {
  sessionStorage.removeItem(`${SESSION_PREFIX}${key}`);
}

/**
 * Clear all session data
 */
export function clearSessionData(): void {
  const keys = Object.keys(sessionStorage);
  keys.forEach(key => {
    if (key.startsWith(SESSION_PREFIX)) {
      sessionStorage.removeItem(key);
    }
  });
}

/**
 * Wipe all secure storage data
 */
export function wipeSecureStorage(): void {
  clearSecureTokens();
  clearSessionData();
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Check if secure storage is initialized
 */
export function isSecureStorageInitialized(): boolean {
  return localStorage.getItem(STORAGE_KEY) !== null;
}
