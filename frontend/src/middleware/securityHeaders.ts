/**
 * Security Headers Middleware
 * Configures strict Content Security Policy (CSP), HSTS, and other security headers
 * OWASP A5: Security Misconfiguration mitigation
 */

export interface SecurityHeadersConfig {
  enableCSP: boolean;
  enableHSTS: boolean;
  reportOnly: boolean;
  reportURI?: string;
}

const defaultConfig: SecurityHeadersConfig = {
  enableCSP: true,
  enableHSTS: true,
  reportOnly: false,
};

/**
 * Content Security Policy configuration
 * Restricts sources for scripts, styles, images, fonts, etc.
 */
const getCSPHeaders = (config: SecurityHeadersConfig): Record<string, string> => {
  const cspDirectives = [
    // Default to self only for most resources
    "default-src 'self'",
    
    // Allow scripts from self and Supabase
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.supabase.co https://cdn.jsdelivr.net",
    
    // Allow styles from self and inline styles (needed for Tailwind)
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    
    // Allow images from self, data URLs, Supabase, and CDN
    "img-src 'self' data: blob: https://*.supabase.co https://images.unsplash.com https://cdn.jsdelivr.net",
    
    // Allow fonts from self and Google Fonts
    "font-src 'self' data: https://fonts.gstatic.com https://fonts.googleapis.com",
    
    // Allow connections to self and Supabase
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.vercel.app",
    
    // Allow media from self and Supabase
    "media-src 'self' https://*.supabase.co",
    
    // Allow object-src none (prevent plugins)
    "object-src 'none'",
    
    // Base URI to self
    "base-uri 'self'",
    
    // Form action to self
    "form-action 'self'",
    
    // Frame ancestors (prevent clickjacking)
    "frame-ancestors 'none'",
    
    // Report URI for CSP violations
    config.reportURI ? `report-uri ${config.reportURI}` : '',
  ].filter(Boolean).join('; ');

  const headerName = config.reportOnly ? 'Content-Security-Policy-Report-Only' : 'Content-Security-Policy';
  
  return {
    [headerName]: cspDirectives,
  };
};

/**
 * HTTP Strict Transport Security configuration
 * Forces HTTPS connections
 */
const getHSTSHeaders = (config: SecurityHeadersConfig): Record<string, string> => {
  if (!config.enableHSTS) return {};
  
  return {
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  };
};

/**
 * Other security headers
 */
const getStandardSecurityHeaders = (): Record<string, string> => {
  return {
    // Prevent MIME type sniffing
    'X-Content-Type-Options': 'nosniff',
    
    // Prevent clickjacking
    'X-Frame-Options': 'DENY',
    
    // Enable XSS protection
    'X-XSS-Protection': '1; mode=block',
    
    // Referrer policy
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    
    // Permissions policy (formerly Feature Policy)
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
    
    // Cross-Origin Resource Sharing
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
};

/**
 * Get all security headers
 */
export function getSecurityHeaders(config: Partial<SecurityHeadersConfig> = {}): Record<string, string> {
  const finalConfig = { ...defaultConfig, ...config };
  
  return {
    ...getCSPHeaders(finalConfig),
    ...getHSTSHeaders(finalConfig),
    ...getStandardSecurityHeaders(),
  };
}

/**
 * Express middleware for security headers
 */
export function securityHeadersMiddleware(req: any, res: any, next: any): void {
  const headers = getSecurityHeaders();
  
  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value);
  }
  
  next();
}

/**
 * React Router compatible function to set security headers via meta tags
 */
export function injectSecurityMetaTags(): void {
  const headers = getSecurityHeaders();
  
  // Inject CSP via meta tag for client-side
  const cspMeta = document.createElement('meta');
  const cspHeader = Object.entries(headers).find(([key]) => key.includes('Content-Security-Policy'));
  
  if (cspHeader) {
    cspMeta.httpEquiv = cspHeader[0];
    cspMeta.content = cspHeader[1];
    document.head.appendChild(cspMeta);
  }
}

/**
 * Mask PII in logs and error messages
 */
export function maskPII(data: any): any {
  if (!data || typeof data !== 'object') return data;
  
  const sensitiveFields = [
    'email', 'password', 'token', 'apiKey', 'secret', 'ssn',
    'creditCard', 'phone', 'address', 'name', 'displayName',
  ];
  
  const masked: any = Array.isArray(data) ? [] : {};
  
  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();
    
    if (sensitiveFields.some(field => lowerKey.includes(field.toLowerCase()))) {
      // Mask sensitive data
      if (typeof value === 'string') {
        masked[key] = value.length > 4 
          ? `${value.substring(0, 2)}${'*'.repeat(value.length - 4)}${value.substring(value.length - 2)}`
          : '****';
      } else {
        masked[key] = '[REDACTED]';
      }
    } else if (typeof value === 'object' && value !== null) {
      masked[key] = maskPII(value);
    } else {
      masked[key] = value;
    }
  }
  
  return masked;
}

/**
 * Sanitize error messages before logging
 */
export function sanitizeError(error: Error): string {
  const message = error.message || '';
  
  // Remove potential PII from error messages
  return message
    .replace(/email:\s*[^\s@]+@[^\s@]+/gi, 'email: [REDACTED]')
    .replace(/token:\s*[^\s]+/gi, 'token: [REDACTED]')
    .replace(/password:\s*[^\s]+/gi, 'password: [REDACTED]')
    .replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}/g, '[EMAIL]')
    .replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[PHONE]');
}
