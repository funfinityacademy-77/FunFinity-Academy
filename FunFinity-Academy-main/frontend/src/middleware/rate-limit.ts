// Rate limiting utility for API routes
// Works with custom API implementation (not Next.js)

interface RateLimitStore {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitStore>();

const RATE_LIMITS = {
  public: { maxRequests: 20, windowMs: 60000 }, // 20 requests/min
  auth: { maxRequests: 5, windowMs: 60000 }, // 5 requests/min
  authenticated: { maxRequests: 60, windowMs: 60000 }, // 60 requests/min
  llm: { maxRequests: 10, windowMs: 60000 }, // 10 requests/min
};

export function getClientIdentifier(headers: Headers): string {
  // Try to get user ID from auth header first
  const authHeader = headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return `user:${authHeader.substring(7)}`;
  }
  
  // Fall back to IP address
  const forwarded = headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0] || headers.get('x-real-ip') || 'unknown';
  return `ip:${ip}`;
}

export async function checkRateLimit(
  identifier: string,
  type: keyof typeof RATE_LIMITS = 'public'
): Promise<{ allowed: boolean; retryAfter?: number }> {
  const now = Date.now();
  const limit = RATE_LIMITS[type];
  
  const record = rateLimitStore.get(identifier);
  
  if (!record || now > record.resetTime) {
    // Create new record or reset expired one
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + limit.windowMs,
    });
    return { allowed: true };
  }
  
  if (record.count >= limit.maxRequests) {
    // Rate limit exceeded
    const retryAfter = Math.ceil((record.resetTime - now) / 1000);
    return { allowed: false, retryAfter };
  }
  
  // Increment counter
  record.count++;
  rateLimitStore.set(identifier, record);
  
  return { allowed: true };
}

// Cleanup expired entries periodically
if (typeof window === 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      if (now > record.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }, 60000); // Clean up every minute
}
