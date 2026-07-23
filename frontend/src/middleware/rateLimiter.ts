/**
 * Edge Rate Limiting Middleware
 * Token bucket algorithm for rate limiting authentication routes
 * Limits: 5 requests per 5 minutes per IP address
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private store: Map<string, RateLimitEntry> = new Map();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number = 5, windowMs: number = 5 * 60 * 1000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    
    // Clean up expired entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key);
      }
    }
  }

  private getClientIdentifier(ip: string, userAgent?: string): string {
    // Use IP + user agent hash for better identification
    const identifier = userAgent ? `${ip}:${userAgent}` : ip;
    return this.hash(identifier);
  }

  private hash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }

  checkLimit(ip: string, userAgent?: string): { allowed: boolean; remaining: number; resetTime: number } {
    const key = this.getClientIdentifier(ip, userAgent);
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || now > entry.resetTime) {
      // Create new entry or reset expired entry
      const newEntry: RateLimitEntry = {
        count: 1,
        resetTime: now + this.windowMs,
      };
      this.store.set(key, newEntry);
      
      return {
        allowed: true,
        remaining: this.maxRequests - 1,
        resetTime: newEntry.resetTime,
      };
    }

    if (entry.count >= this.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
      };
    }

    entry.count++;
    this.store.set(key, entry);

    return {
      allowed: true,
      remaining: this.maxRequests - entry.count,
      resetTime: entry.resetTime,
    };
  }

  reset(ip: string, userAgent?: string): void {
    const key = this.getClientIdentifier(ip, userAgent);
    this.store.delete(key);
  }
}

// Singleton instance
export const rateLimiter = new RateLimiter(5, 5 * 60 * 1000); // 5 requests per 5 minutes

/**
 * Express middleware for rate limiting
 */
export function rateLimitMiddleware(req: any, res: any, next: any): void {
  const ip = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
  const userAgent = req.headers['user-agent'];

  const result = rateLimiter.checkLimit(ip, userAgent);

  // Set rate limit headers
  res.setHeader('X-RateLimit-Limit', '5');
  res.setHeader('X-RateLimit-Remaining', result.remaining.toString());
  res.setHeader('X-RateLimit-Reset', new Date(result.resetTime).toISOString());

  if (!result.allowed) {
    res.status(429).json({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
    });
    return;
  }

  next();
}

/**
 * React Router compatible rate limiter for client-side API calls
 */
export async function checkRateLimit(): Promise<{ allowed: boolean; retryAfter?: number }> {
  try {
    const ip = await getClientIP();
    const userAgent = navigator.userAgent;
    
    const result = rateLimiter.checkLimit(ip, userAgent);
    
    if (!result.allowed) {
      return {
        allowed: false,
        retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
      };
    }
    
    return { allowed: true };
  } catch (error) {
    // If we can't determine IP, allow the request (fail open)
    console.error('Rate limit check failed:', error);
    return { allowed: true };
  }
}

async function getClientIP(): Promise<string> {
  // In a real deployment, this would call an API to get the client's IP
  // For now, return a placeholder
  return '127.0.0.1';
}
