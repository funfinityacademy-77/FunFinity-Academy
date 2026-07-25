/**
 * SECURITY HEADERS & RATE LIMITING MIDDLEWARE
 * 
 * This middleware implements:
 * 1. Content Security Policy (CSP) headers globally
 * 2. Rate limiting for password reset and login endpoints
 * 3. Security headers for XSS protection
 * 4. Frame protection to prevent clickjacking
 */

interface SecurityHeaders {
  'Content-Security-Policy': string;
  'X-Frame-Options': string;
  'X-Content-Type-Options': string;
  'X-XSS-Protection': string;
  'Referrer-Policy': string;
  'Permissions-Policy': string;
  'Strict-Transport-Security': string;
}

/**
 * Generate Content Security Policy headers
 * Prevents XSS attacks by controlling which resources can be loaded
 */
export function generateCSPHeaders(): SecurityHeaders {
  const cspDirectives = [
    // Default to same-origin for most content types
    "default-src 'self'",
    
    // Script sources - allow inline scripts for development
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com",
    
    // Style sources - allow inline styles
    "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com",
    
    // Image sources - allow data URLs and external images
    "img-src 'self' data: blob: https: https://cdn.jsdelivr.net",
    
    // Connect sources - allow API calls
    "connect-src 'self' https://*.supabase.co https://*.vercel.app wss://*.supabase.co",
    
    // Font sources
    "font-src 'self' data: https://cdn.jsdelivr.net",
    
    // Object sources - block plugins
    "object-src 'none'",
    
    // Base URI - prevent base tag injection
    "base-uri 'self'",
    
    // Form action - restrict form submissions
    "form-action 'self'",
    
    // Frame ancestors - prevent clickjacking
    "frame-ancestors 'none'",
    
    // Upgrade insecure requests
    "upgrade-insecure-requests",
  ];

  return {
    'Content-Security-Policy': cspDirectives.join('; '),
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=(), payment=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  };
}

/**
 * Rate limiter to prevent brute-force attacks
 */
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 5, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  /**
   * Check if request is allowed
   */
  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(identifier) || [];

    // Remove requests outside the time window
    const validRequests = requests.filter(time => now - time < this.windowMs);

    if (validRequests.length >= this.maxRequests) {
      return false;
    }

    validRequests.push(now);
    this.requests.set(identifier, validRequests);
    return true;
  }

  /**
   * Get remaining requests for identifier
   */
  getRemainingRequests(identifier: string): number {
    const now = Date.now();
    const requests = this.requests.get(identifier) || [];
    const validRequests = requests.filter(time => now - time < this.windowMs);
    return Math.max(0, this.maxRequests - validRequests.length);
  }

  /**
   * Reset rate limit for identifier
   */
  reset(identifier: string): void {
    this.requests.delete(identifier);
  }

  /**
   * Clean up old entries
   */
  cleanup(): void {
    const now = Date.now();
    for (const [identifier, requests] of this.requests.entries()) {
      const validRequests = requests.filter(time => now - time < this.windowMs);
      if (validRequests.length === 0) {
        this.requests.delete(identifier);
      } else {
        this.requests.set(identifier, validRequests);
      }
    }
  }
}

// Rate limiters for different endpoints
const loginRateLimiter = new RateLimiter(5, 60000); // 5 requests per minute
const passwordResetRateLimiter = new RateLimiter(3, 3600000); // 3 requests per hour
const signupRateLimiter = new RateLimiter(3, 3600000); // 3 requests per hour
const apiRateLimiter = new RateLimiter(100, 60000); // 100 requests per minute

/**
 * Check rate limit for login endpoint
 */
export function checkLoginRateLimit(identifier: string): { allowed: boolean; remaining: number } {
  return {
    allowed: loginRateLimiter.isAllowed(identifier),
    remaining: loginRateLimiter.getRemainingRequests(identifier),
  };
}

/**
 * Check rate limit for password reset endpoint
 */
export function checkPasswordResetRateLimit(identifier: string): { allowed: boolean; remaining: number } {
  return {
    allowed: passwordResetRateLimiter.isAllowed(identifier),
    remaining: passwordResetRateLimiter.getRemainingRequests(identifier),
  };
}

/**
 * Check rate limit for signup endpoint
 */
export function checkSignupRateLimit(identifier: string): { allowed: boolean; remaining: number } {
  return {
    allowed: signupRateLimiter.isAllowed(identifier),
    remaining: signupRateLimiter.getRemainingRequests(identifier),
  };
}

/**
 * Check rate limit for general API endpoints
 */
export function checkAPIRateLimit(identifier: string): { allowed: boolean; remaining: number } {
  return {
    allowed: apiRateLimiter.isAllowed(identifier),
    remaining: apiRateLimiter.getRemainingRequests(identifier),
  };
}

/**
 * Apply security headers to response
 */
export function applySecurityHeaders(): SecurityHeaders {
  return generateCSPHeaders();
}

/**
 * Get client identifier for rate limiting
 * Uses IP address or user ID if available
 */
export function getClientIdentifier(request: Request): string {
  // Try to get IP from headers
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0] || realIp || 'unknown';

  // If user is authenticated, use user ID instead
  const authHeader = request.headers.get('authorization');
  if (authHeader) {
    // Extract user ID from token (simplified)
    return `user:${authHeader.substring(0, 10)}`;
  }

  return `ip:${ip}`;
}

/**
 * Security middleware function
 * Apply this to all requests for comprehensive security
 */
export async function securityMiddleware(request: Request): Promise<{
  headers: SecurityHeaders;
  rateLimit: { allowed: boolean; remaining: number };
}> {
  const headers = applySecurityHeaders();
  const identifier = getClientIdentifier(request);
  const rateLimit = checkAPIRateLimit(identifier);

  return {
    headers,
    rateLimit,
  };
}

/**
 * Periodic cleanup of rate limiter data
 * Run this every few minutes to prevent memory leaks
 */
export function cleanupRateLimiters(): void {
  loginRateLimiter.cleanup();
  passwordResetRateLimiter.cleanup();
  signupRateLimiter.cleanup();
  apiRateLimiter.cleanup();
}

// Auto-cleanup every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(cleanupRateLimiters, 300000);
}
