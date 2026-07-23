/**
 * Secure API Client for FunFinity Academy
 * Provides encrypted API request/response handling
 */

import { encrypt, decrypt, hash } from './encryption';

// Encryption key for API communications
const API_ENCRYPTION_KEY = 'funfinity_api_encryption_key_v1';

/**
 * Encrypts API request data
 */
async function encryptRequestData(data: any): Promise<string> {
  try {
    const dataString = JSON.stringify(data);
    return await encrypt(dataString, API_ENCRYPTION_KEY);
  } catch (error) {
    console.error('Failed to encrypt request data:', error);
    throw new Error('Failed to encrypt request data');
  }
}

/**
 * Decrypts API response data
 */
async function decryptResponseData(encryptedData: string): Promise<any> {
  try {
    const decrypted = await decrypt(encryptedData, API_ENCRYPTION_KEY);
    return JSON.parse(decrypted);
  } catch (error) {
    console.error('Failed to decrypt response data:', error);
    throw new Error('Failed to decrypt response data');
  }
}

/**
 * Generates a request signature for authentication
 */
async function generateRequestSignature(method: string, url: string, body: any): Promise<string> {
  const timestamp = Date.now().toString();
  const dataString = `${method}:${url}:${timestamp}:${JSON.stringify(body)}`;
  return await hash(dataString);
}

/**
 * Secure fetch wrapper with encryption
 */
export async function secureFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const timestamp = Date.now();
  const method = options.method || 'GET';
  
  // Add security headers
  const secureHeaders: HeadersInit = {
    ...options.headers,
    'X-Request-Timestamp': timestamp.toString(),
    'X-Request-ID': crypto.randomUUID(),
    'X-Client-Version': '1.0.0',
  };

  // Encrypt request body if present
  let body = options.body;
  if (body && typeof body === 'object') {
    try {
      const encryptedBody = await encryptRequestData(body);
      secureHeaders['Content-Type'] = 'application/json';
      secureHeaders['X-Encrypted-Body'] = 'true';
      body = JSON.stringify({ encrypted: encryptedBody });
    } catch (error) {
      console.warn('Failed to encrypt request body, sending unencrypted:', error);
    }
  }

  // Generate request signature
  try {
    const signature = await generateRequestSignature(method.toString(), url, body || {});
    secureHeaders['X-Request-Signature'] = signature;
  } catch (error) {
    console.warn('Failed to generate request signature:', error);
  }

  // Make the request
  const response = await fetch(url, {
    ...options,
    headers: secureHeaders,
    body,
  });

  return response;
}

/**
 * Decrypts API response if encrypted
 */
export async function decryptResponse(response: Response): Promise<any> {
  const contentType = response.headers.get('Content-Type') || '';
  const isEncrypted = response.headers.get('X-Encrypted-Body') === 'true';

  if (!isEncrypted) {
    return response.json();
  }

  try {
    const data = await response.json();
    if (data.encrypted) {
      return await decryptResponseData(data.encrypted);
    }
    return data;
  } catch (error) {
    console.error('Failed to decrypt response:', error);
    // Fallback to regular JSON parsing
    return response.json();
  }
}

/**
 * Rate limiting store
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Checks if a request should be rate limited
 */
export function checkRateLimit(endpoint: string, maxRequests: number = 100, windowMs: number = 60000): boolean {
  const now = Date.now();
  const key = endpoint;
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

/**
 * Clears expired rate limit entries
 */
export function clearExpiredRateLimits(): void {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

// Clear expired rate limits every minute
if (typeof setInterval !== 'undefined') {
  setInterval(clearExpiredRateLimits, 60000);
}
