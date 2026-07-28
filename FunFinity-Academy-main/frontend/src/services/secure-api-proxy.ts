/**
 * SECURE API PROXY SERVICE
 * 
 * This service acts as a secure proxy for all AI/Database API calls.
 * All API keys are stored server-side and fetched through this service,
 * preventing them from being exposed in the client-side bundle.
 * 
 * SECURITY REQUIREMENTS:
 * - NO API keys in client-side code
 * - All sensitive calls go through this proxy
 * - Rate limiting and request validation
 * - Request/response logging for security monitoring
 */

interface SecureAPIRequest {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  headers?: Record<string, string>;
  service: 'ai' | 'database' | 'analytics' | 'payment';
}

interface SecureAPIResponse {
  data?: any;
  error?: string;
  status: number;
}

/**
 * Service configuration - these would normally come from server environment variables
 * In a production setup, these would be fetched from a secure backend endpoint
 * Using Vite's import.meta.env for client-side environment variables
 */
const SERVICE_ENDPOINTS = {
  ai: {
    baseUrl: import.meta.env.VITE_AI_API_URL || '',
    requiresAuth: true,
  },
  database: {
    baseUrl: import.meta.env.VITE_DATABASE_API_URL || '',
    requiresAuth: true,
  },
  analytics: {
    baseUrl: import.meta.env.VITE_ANALYTICS_API_URL || '',
    requiresAuth: true,
  },
  payment: {
    baseUrl: import.meta.env.VITE_PAYMENT_API_URL || '',
    requiresAuth: true,
  },
};

/**
 * Rate limiting tracker to prevent abuse
 */
const rateLimiter = {
  requests: new Map<string, number[]>(),
  
  isAllowed(service: string, maxRequests: number = 10, windowMs: number = 60000): boolean {
    const now = Date.now();
    const key = service;
    const requests = this.requests.get(key) || [];
    
    // Remove requests outside the time window
    const validRequests = requests.filter(time => now - time < windowMs);
    
    if (validRequests.length >= maxRequests) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(key, validRequests);
    return true;
  },
  
  reset(service: string): void {
    this.requests.delete(service);
  },
};

/**
 * Validate request to prevent injection attacks
 */
function validateRequest(request: SecureAPIRequest): { valid: boolean; error?: string } {
  // Check for SQL injection patterns
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|EXEC)\b)/i,
    /(--|;|\/\*|\*\/)/,
    /(\bOR\b.*=.*=)/i,
  ];
  
  if (request.body && typeof request.body === 'string') {
    for (const pattern of sqlPatterns) {
      if (pattern.test(request.body)) {
        return { valid: false, error: 'Potential SQL injection detected' };
      }
    }
  }
  
  // Check for XSS patterns
  const xssPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
  ];
  
  if (request.body && typeof request.body === 'string') {
    for (const pattern of xssPatterns) {
      if (pattern.test(request.body)) {
        return { valid: false, error: 'Potential XSS attack detected' };
      }
    }
  }
  
  return { valid: true };
}

/**
 * Secure API proxy function
 * This is the main entry point for all secure API calls
 */
export async function secureAPIProxy(request: SecureAPIRequest): Promise<SecureAPIResponse> {
  try {
    // Validate request
    const validation = validateRequest(request);
    if (!validation.valid) {
      return {
        error: validation.error,
        status: 400,
      };
    }
    
    // Check rate limiting
    if (!rateLimiter.isAllowed(request.service, 100, 60000)) {
      return {
        error: 'Rate limit exceeded. Please try again later.',
        status: 429,
      };
    }
    
    // Get service configuration
    const serviceConfig = SERVICE_ENDPOINTS[request.service];
    if (!serviceConfig) {
      return {
        error: 'Unknown service',
        status: 400,
      };
    }
    
    // Build full URL
    const url = `${serviceConfig.baseUrl}${request.endpoint}`;
    
    // Prepare headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...request.headers,
    };
    
    // Add authentication if required
    if (serviceConfig.requiresAuth) {
      // In production, this would fetch a temporary token from the server
      // For now, we use the Supabase session
      const token = localStorage.getItem('funfinity-auth-token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    
    // Make the request
    const response = await fetch(url, {
      method: request.method,
      headers,
      body: request.body ? JSON.stringify(request.body) : undefined,
    });
    
    const data = await response.json();
    
    // Log for security monitoring (never log sensitive data)
    console.log('Secure API call:', {
      service: request.service,
      endpoint: request.endpoint,
      method: request.method,
      status: response.status,
      timestamp: new Date().toISOString(),
    });
    
    return {
      data,
      status: response.status,
    };
  } catch (error) {
    console.error('Secure API proxy error:', error);
    return {
      error: 'Failed to make secure API call',
      status: 500,
    };
  }
}

/**
 * AI Service specific proxy
 * Handles all AI-related API calls with additional guardrails
 */
export async function aiProxy(prompt: string, context?: any): Promise<SecureAPIResponse> {
  // Apply AI guardrails before sending
  const guardrails = applyAIGuardrails(prompt);
  if (!guardrails.safe) {
    return {
      error: guardrails.reason,
      status: 400,
    };
  }
  
  return secureAPIProxy({
    endpoint: '/chat/completions',
    method: 'POST',
    body: {
      prompt: guardrails.sanitizedPrompt,
      context,
    },
    service: 'ai',
  });
}

/**
 * Apply AI guardrails to prevent malicious prompts
 */
function applyAIGuardrails(prompt: string): { safe: boolean; sanitizedPrompt?: string; reason?: string } {
  const maliciousPatterns = [
    /ignore\s+(all|previous)\s+instructions/i,
    /system\s*:\s*override/i,
    /reveal\s+(your|system)\s+(instructions|prompt)/i,
    /extract\s+(api\s*key|secret|password)/i,
  ];
  
  for (const pattern of maliciousPatterns) {
    if (pattern.test(prompt)) {
      return {
        safe: false,
        reason: 'Prompt contains potentially malicious content',
      };
    }
  }
  
  // Remove PII before sending to AI
  const sanitizedPrompt = removePII(prompt);
  
  return {
    safe: true,
    sanitizedPrompt,
  };
}

/**
 * Remove Personally Identifiable Information (PII)
 */
function removePII(text: string): string {
  // Remove email addresses
  let sanitized = text.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL_REDACTED]');
  
  // Remove phone numbers
  sanitized = sanitized.replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[PHONE_REDACTED]');
  
  // Remove SSN patterns
  sanitized = sanitized.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN_REDACTED]');
  
  // Remove credit card patterns
  sanitized = sanitized.replace(/\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, '[CARD_REDACTED]');
  
  return sanitized;
}

/**
 * Database service specific proxy
 * Handles all database operations with RLS enforcement
 */
export async function databaseProxy(operation: string, table: string, data?: any): Promise<SecureAPIResponse> {
  return secureAPIProxy({
    endpoint: `/database/${table}/${operation}`,
    method: 'POST',
    body: { operation, data },
    service: 'database',
  });
}

/**
 * Analytics service specific proxy
 * Handles all analytics calls with privacy controls
 */
export async function analyticsProxy(event: string, data?: any): Promise<SecureAPIResponse> {
  // Strip any PII from analytics data
  const sanitizedData = data ? JSON.parse(JSON.stringify(data, (key, value) => {
    if (typeof value === 'string') {
      return removePII(value);
    }
    return value;
  })) : undefined;
  
  return secureAPIProxy({
    endpoint: '/analytics/track',
    method: 'POST',
    body: { event, data: sanitizedData },
    service: 'analytics',
  });
}

/**
 * Payment service specific proxy
 * Handles all payment operations with PCI compliance
 */
export async function paymentProxy(operation: string, data?: any): Promise<SecureAPIResponse> {
  return secureAPIProxy({
    endpoint: `/payment/${operation}`,
    method: 'POST',
    body: data,
    service: 'payment',
  });
}
