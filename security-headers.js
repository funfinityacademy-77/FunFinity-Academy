// ============================================================================
// OWASP SECURITY HEADERS CONFIGURATION
// ============================================================================
// This configuration implements OWASP-recommended security headers for Next.js
// applications. Each header is documented with its purpose and protection mechanism.
//
// Headers included:
// - Content Security Policy (CSP)
// - Strict-Transport-Security (HSTS)
// - X-Frame-Options (Clickjacking protection)
// - X-Content-Type-Options (MIME sniffing protection)
// - X-XSS-Protection (XSS filter)
// - Referrer-Policy (Referrer information control)
// - Permissions-Policy (Feature policy)
// ============================================================================

/**
 * Content Security Policy (CSP) Configuration
 * 
 * PURPOSE: Prevents Cross-Site Scripting (XSS), data injection attacks, and
 * unauthorized content loading by specifying which content sources are trusted.
 * 
 * PROTECTION MECHANISM: Whitelists allowed sources for scripts, styles, images,
 * fonts, and other content types. Browser blocks any content from non-whitelisted sources.
 * 
 * DIRECTIVES EXPLAINED:
 * - default-src 'self': Only allow content from same origin by default
 * - script-src 'self' 'unsafe-eval' 'unsafe-inline': Allow scripts from same origin
 *   (unsafe-inline needed for inline scripts in development, remove in production)
 * - style-src 'self' 'unsafe-inline': Allow styles from same origin
 * - img-src 'self' data: blob: https: *.supabase.co *.cloudinary.com: Allow images
 *   from trusted sources and Supabase/Cloudinary CDNs
 * - font-src 'self' data: Allow fonts from same origin and data URIs
 * - connect-src 'self' https: *.supabase.co *.googleapis.com: Allow API calls to
 *   trusted domains
 * - frame-src 'none': Block all iframes (prevent clickjacking)
 * - media-src 'self' blob: https: *.cloudinary.com: Allow media from trusted sources
 * - worker-src 'self' blob: Allow web workers from same origin
 * - base-uri 'self': Restrict base URL to same origin
 * - form-action 'self': Restrict form submissions to same origin
 * - frame-ancestors 'none': Prevent embedding in other sites (clickjacking)
 * - upgrade-insecure-requests: Automatically upgrade HTTP to HTTPS
 * - block-all-mixed-content: Block loading mixed HTTP/HTTPS content
 */
const CSP_DIRECTIVES = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https: *.supabase.co *.cloudinary.com",
  "font-src 'self' data:",
  "connect-src 'self' https: *.supabase.co *.googleapis.com wss://*.supabase.co",
  "frame-src 'none'",
  "media-src 'self' blob: https: *.cloudinary.com",
  "worker-src 'self' blob:",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
  "block-all-mixed-content",
];

/**
 * Generate CSP header string
 */
export function getCSPHeader() {
  return CSP_DIRECTIVES.join('; ');
}

/**
 * ============================================================================
 * NEXT.JS CONFIGURATION WITH SECURITY HEADERS
 * ============================================================================
 * Add this to your next.config.js file
 */

const securityHeaders = [
  // ============================================================================
  // CONTENT SECURITY POLICY (CSP)
  // ============================================================================
  {
    key: 'Content-Security-Policy',
    value: getCSPHeader(),
  },

  // ============================================================================
  // STRICT-TRANSPORT-SECURITY (HSTS)
  // ============================================================================
  // PURPOSE: Enforces HTTPS connections to prevent protocol downgrade attacks
  // and man-in-the-middle attacks.
  //
  // PROTECTION MECHANISM: Tells browsers to only use HTTPS for future requests
  // to this domain, preventing attackers from forcing HTTP connections.
  //
  // max-age=31536000: HSTS policy valid for 1 year (31536000 seconds)
  // includeSubDomains: Apply HSTS to all subdomains
  // preload: Allow domain to be included in browser HSTS preload list
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains; preload',
  },

  // ============================================================================
  // X-FRAME-OPTIONS
  // ============================================================================
  // PURPOSE: Prevents clickjacking attacks by blocking page embedding in iframes.
  //
  // PROTECTION MECHANISM: Tells browsers not to render the page in a frame,
  // iframe, or object, preventing attackers from overlaying invisible buttons
  // on legitimate content.
  //
  // DENY: Completely blocks framing (most secure)
  // SAMEORIGIN: Only allows framing from same origin (alternative)
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },

  // ============================================================================
  // X-CONTENT-TYPE-OPTIONS
  // ============================================================================
  // PURPOSE: Prevents MIME-type sniffing attacks.
  //
  // PROTECTION MECHANISM: Prevents browsers from interpreting files as a different
  // MIME type than what is specified by the Content-Type header, preventing
  // attackers from uploading malicious scripts disguised as images.
  //
  // nosniff: Disables MIME-type sniffing
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },

  // ============================================================================
  // X-XSS-PROTECTION
  // ============================================================================
  // PURPOSE: Enables browser's built-in XSS filter (legacy support).
  //
  // PROTECTION MECHANISM: Activates browser's XSS filtering mechanism to detect
  // and block reflected XSS attacks. Note: CSP provides better protection.
  //
  // 1; mode=block: Enable XSS filter and block page if attack detected
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },

  // ============================================================================
  // REFERRER-POLICY
  // ============================================================================
  // PURPOSE: Controls how much referrer information is sent with requests.
  //
  // PROTECTION MECHANISM: Prevents leaking sensitive information in URLs
  // when navigating from secure pages to external sites.
  //
  // strict-origin-when-cross-origin: Send full referrer for same-origin requests,
  // only origin for cross-origin requests (balances privacy and functionality)
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },

  // ============================================================================
  // PERMISSIONS-POLICY (formerly Feature Policy)
  // ============================================================================
  // PURPOSE: Controls which browser features and APIs can be used.
  //
  // PROTECTION MECHANISM: Disables potentially dangerous features that could
  // be exploited, such as geolocation, camera, microphone, etc.
  //
  // camera=(), microphone=(), geolocation=(): Disable camera, mic, and location
  // (self): Allow only on same origin if needed
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },

  // ============================================================================
  // CONTENT-Security-Policy-Report-Only (Development Mode)
  // ============================================================================
  // PURPOSE: Reports CSP violations without blocking content (for testing).
  //
  // PROTECTION MECHANISM: Allows developers to test CSP policies before enforcing
  // them in production by receiving violation reports.
  //
  // Remove this header in production and use regular CSP instead
  {
    key: 'Content-Security-Policy-Report-Only',
    value: process.env.NODE_ENV === 'development' ? getCSPHeader() : '',
  },

  // ============================================================================
  // CROSS-ORIGIN-OPENER-POLICY (COOP)
  // ============================================================================
  // PURPOSE: Isolates the current document from cross-origin windows.
  //
  // PROTECTION MECHANISM: Prevents cross-origin attacks like Spectre by
  // controlling which cross-origin documents can open the current document.
  //
  // same-origin: Only allow same-origin documents to open this page
  {
    key: 'Cross-Origin-Opener-Policy',
    value: 'same-origin',
  },

  // ============================================================================
  // CROSS-ORIGIN-EMBEDDER-POLICY (COEP)
  // ============================================================================
  // PURPOSE: Controls embedding of cross-origin resources.
  //
  // PROTECTION MECHANISM: Works with COOP to enable process-per-site-instance
  // isolation, providing additional protection against side-channel attacks.
  //
  // require-corp: Require documents to have COOP header to embed this page
  {
    key: 'Cross-Origin-Embedder-Policy',
    value: 'require-corp',
  },

  // ============================================================================
  // X-DNS-PREFETCH-CONTROL
  // ============================================================================
  // PURPOSE: Controls DNS prefetching to prevent information leakage.
  //
  // PROTECTION MECHANISM: Prevents browsers from prefetching DNS for domains
  // that the user might not actually visit, protecting privacy.
  //
  // on: Enable DNS prefetching for performance (change to 'off' for maximum privacy)
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },

  // ============================================================================
  // CACHE-CONTROL (For sensitive endpoints)
  // ============================================================================
  // PURPOSE: Controls caching behavior for sensitive content.
  //
  // PROTECTION MECHANISM: Prevents caching of sensitive data in browsers or
  // intermediate proxies, ensuring users always get fresh data.
  //
  // no-store: Do not store any part of request/response
  // no-cache: Revalidate with origin server before using cached content
  // must-revalidate: Revalidate stale content with origin server
  {
    key: 'Cache-Control',
    value: 'no-store, no-cache, must-revalidate',
  },

  // ============================================================================
  // PRAGMA (Legacy cache control)
  // ============================================================================
  // PURPOSE: Legacy header for HTTP/1.0 clients.
  //
  // PROTECTION MECHANISM: Ensures older clients also respect no-cache directive.
  {
    key: 'Pragma',
    value: 'no-cache',
  },
];

/**
 * ============================================================================
 * NEXT.JS CONFIGURATION INTEGRATION
 * ============================================================================
 * Add this to your next.config.js file in the headers() function
 */

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
      // Additional headers for static assets
      {
        source: '/:all*(svg|jpg|png|webp|avif)',
        locale: false,
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:all*(js|css)',
        locale: false,
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

/**
 * ============================================================================
 * CSP VIOLATION REPORTING
 * ============================================================================
 * To enable CSP violation reporting, add this to your CSP directives:
 * report-uri /api/csp-violation-report
 * report-to csp-endpoint
 * 
 * Then create an API endpoint to receive reports:
 */

/*
// pages/api/csp-violation-report.ts
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const report = req.body;

  // Log violation for monitoring
  console.error('CSP Violation:', {
    'document-uri': report['csp-report']['document-uri'],
    'violated-directive': report['csp-report']['violated-directive'],
    'blocked-uri': report['csp-report']['blocked-uri'],
  });

  // Store in database for analysis
  await supabase.from('security_events').insert({
    event_type: 'csp_violation',
    details: report,
  });

  res.status(204).end();
}
*/

/**
 * ============================================================================
 * DEVELOPMENT VS PRODUCTION CONFIGURATION
 * ============================================================================
 * 
 * DEVELOPMENT:
 * - Use Content-Security-Policy-Report-Only to test policies
 * - Allow unsafe-inline and unsafe-eval for development tools
 * - Enable detailed error messages
 * 
 * PRODUCTION:
 * - Use strict Content-Security-Policy
 * - Remove unsafe-inline and unsafe-eval (use nonce or hash instead)
 * - Minimize error messages to prevent information leakage
 */

export function getProductionCSP(nonce) {
  const productionDirectives = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}'`, // Use nonce for inline scripts
    "style-src 'self' 'nonce-${nonce}'", // Use nonce for inline styles
    "img-src 'self' data: blob: https: *.supabase.co *.cloudinary.com",
    "font-src 'self' data:",
    "connect-src 'self' https: *.supabase.co *.googleapis.com wss://*.supabase.co",
    "frame-src 'none'",
    "media-src 'self' blob: https: *.cloudinary.com",
    "worker-src 'self' blob:",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
    "block-all-mixed-content",
  ];

  return productionDirectives.join('; ');
}

/**
 * ============================================================================
 * SECURITY HEADER TESTING
 * ============================================================================
 * Test your security headers using:
 * 
 * 1. OWASP ZAP: https://www.zaproxy.org/
 * 2. Security Headers: https://securityheaders.com/
 * 3. Mozilla Observatory: https://observatory.mozilla.org/
 * 4. Lighthouse: Built into Chrome DevTools
 * 
 * Expected scores:
 * - Security Headers: A+
 * - Mozilla Observatory: A or A+
 * - Lighthouse Security: 90+
 */

/**
 * ============================================================================
 * HEADER EXPLANATION SUMMARY
 * ============================================================================
 * 
 * HEADER | THREAT PROTECTED | SEVERITY
 * -------|------------------|----------
 * CSP | XSS, data injection | Critical
 * HSTS | MITM, protocol downgrade | Critical
 * X-Frame-Options | Clickjacking | High | 
 * X-Content-Type-Options | MIME sniffing | Medium
 * X-XSS-Protection | Reflected XSS | Low (legacy)
 * Referrer-Policy | Information leakage | Medium
 * Permissions-Policy | Feature abuse | Medium
 * COOP/COEP | Side-channel attacks | High
 * 
 * All headers work together to provide defense-in-depth security.
 */
