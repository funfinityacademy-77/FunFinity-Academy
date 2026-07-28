/**
 * PII SCRUBBING MIDDLEWARE FOR CHAT
 * 
 * This utility scrubs Personally Identifiable Information (PII) from chat messages
 * and discussion forums before storing them in the database.
 * 
 * PII TYPES SCRUBBED:
 * - Email addresses
 * - Phone numbers (US and international formats)
 * - Social media handles
 * - Physical addresses
 * - Credit card numbers
 * - SSN patterns
 * - URLs that might contain personal info
 */

interface ScrubbedResult {
  sanitizedText: string;
  detectedPII: string[];
  confidence: 'low' | 'medium' | 'high';
}

/**
 * Regex patterns for PII detection
 */
const PII_PATTERNS = {
  // Email addresses
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  
  // US phone numbers (various formats)
  phoneUS: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g,
  
  // International phone numbers
  phoneIntl: /\b\+?(\d{1,3})?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\b/g,
  
  // Social media handles (Twitter, Instagram, etc.)
  socialHandle: /@([a-zA-Z0-9_]{1,15})/g,
  
  // Credit card numbers (basic pattern)
  creditCard: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,
  
  // SSN pattern (US)
  ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
  
  // URLs that might contain personal info
  url: /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g,
  
  // IP addresses
  ipAddress: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g,
  
  // Physical address patterns (basic)
  address: /\d+\s+[A-Za-z]+\s+(Street|St|Avenue|Ave|Road|Rd|Lane|Ln|Drive|Dr|Boulevard|Blvd|Court|Ct|Place|Pl|Way|Circle|Cir)[,\s]*/gi,
};

/**
 * Replacement text for scrubbed PII
 */
const REPLACEMENTS = {
  email: '[EMAIL_REDACTED]',
  phoneUS: '[PHONE_REDACTED]',
  phoneIntl: '[PHONE_REDACTED]',
  socialHandle: '[HANDLE_REDACTED]',
  creditCard: '[CARD_REDACTED]',
  ssn: '[SSN_REDACTED]',
  url: '[URL_REDACTED]',
  ipAddress: '[IP_REDACTED]',
  address: '[ADDRESS_REDACTED]',
};

/**
 * Main PII scrubbing function
 * Detects and redacts PII from text
 */
export function scrubPII(text: string): ScrubbedResult {
  let sanitizedText = text;
  const detectedPII: string[] = [];
  let confidence: 'low' | 'medium' | 'high' = 'low';

  // Check each PII pattern
  for (const [type, pattern] of Object.entries(PII_PATTERNS)) {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(match => {
        // Avoid duplicates
        if (!detectedPII.includes(match)) {
          detectedPII.push(match);
        }
      });
      
      // Replace with redaction text
      sanitizedText = sanitizedText.replace(pattern, REPLACEMENTS[type as keyof typeof REPLACEMENTS]);
      
      // Increase confidence based on PII type
      if (type === 'email' || type === 'ssn' || type === 'creditCard') {
        confidence = 'high';
      } else if (confidence === 'low') {
        confidence = 'medium';
      }
    }
  }

  return {
    sanitizedText,
    detectedPII,
    confidence,
  };
}

/**
 * Check if text contains PII without scrubbing
 */
export function containsPII(text: string): boolean {
  for (const pattern of Object.values(PII_PATTERNS)) {
    if (pattern.test(text)) {
      return true;
    }
  }
  return false;
}

/**
 * Get PII detection summary
 */
export function getPIISummary(text: string): {
  hasPII: boolean;
  piiTypes: string[];
  count: number;
} {
  const detectedTypes: string[] = [];
  let count = 0;

  for (const [type, pattern] of Object.entries(PII_PATTERNS)) {
    const matches = text.match(pattern);
    if (matches) {
      detectedTypes.push(type);
      count += matches.length;
    }
  }

  return {
    hasPII: count > 0,
    piiTypes: detectedTypes,
    count,
  };
}

/**
 * Advanced PII scrubbing with context awareness
 * This version preserves certain contexts (e.g., example.com in documentation)
 */
export function scrubPIIWithContext(text: string, allowExamples: boolean = true): ScrubbedResult {
  let result = scrubPII(text);

  // If examples are allowed, restore common example domains
  if (allowExamples) {
    result.sanitizedText = result.sanitizedText
      .replace(/\[EMAIL_REDACTED\]/g, (match) => {
        // Check if it's a common example email
        if (text.match(/example\.com|test\.com|demo\.com/i)) {
          return text.match(/example\.com|test\.com|demo\.com/i)?.[0] || match;
        }
        return match;
      });
  }

  return result;
}

/**
 * Sanitize chat message before sending to server
 * This is the main function to use in chat components
 */
export function sanitizeChatMessage(message: string): {
  sanitized: string;
  hasPII: boolean;
  warning?: string;
} {
  const result = scrubPII(message);

  if (result.detectedPII.length > 0) {
    return {
      sanitized: result.sanitizedText,
      hasPII: true,
      warning: `Personal information was detected and removed from your message (${result.detectedPII.length} item${result.detectedPII.length > 1 ? 's' : ''}).`,
    };
  }

  return {
    sanitized: result.sanitizedText,
    hasPII: false,
  };
}

/**
 * Sanitize discussion forum post
 */
export function sanitizeForumPost(content: string): {
  sanitized: string;
  hasPII: boolean;
  detectedTypes: string[];
} {
  const result = scrubPII(content);
  const summary = getPIISummary(content);

  return {
    sanitized: result.sanitizedText,
    hasPII: summary.hasPII,
    detectedTypes: summary.piiTypes,
  };
}

/**
 * Batch sanitize multiple messages
 */
export function batchSanitizeMessages(messages: string[]): Array<{
  original: string;
  sanitized: string;
  hasPII: boolean;
}> {
  return messages.map(msg => {
    const result = sanitizeChatMessage(msg);
    return {
      original: msg,
      sanitized: result.sanitized,
      hasPII: result.hasPII,
    };
  });
}

/**
 * Validate that text is safe to send
 * Returns true if no PII detected
 */
export function isTextSafe(text: string): boolean {
  return !containsPII(text);
}

/**
 * Get user-friendly warning message for detected PII
 */
export function getPIIWarning(detectedTypes: string[]): string {
  const typeWarnings: Record<string, string> = {
    email: 'email address',
    phoneUS: 'phone number',
    phoneIntl: 'phone number',
    socialHandle: 'social media handle',
    creditCard: 'credit card number',
    ssn: 'social security number',
    url: 'URL',
    ipAddress: 'IP address',
    address: 'physical address',
  };

  const uniqueTypes = [...new Set(detectedTypes)];
  const warnings = uniqueTypes.map(type => typeWarnings[type] || type);

  if (warnings.length === 1) {
    return `Your message contains a ${warnings[0]} which has been removed for your privacy.`;
  }

  return `Your message contains ${warnings.join(', ')} which have been removed for your privacy.`;
}

/**
 * PII detection for AI Assistant prompts
 * Additional guardrails for AI interactions
 */
export function sanitizeAIPrompt(prompt: string): {
  sanitized: string;
  hasPII: boolean;
  blocked: boolean;
  reason?: string;
} {
  const result = scrubPII(prompt);

  // Block if high-confidence PII detected
  if (result.confidence === 'high') {
    return {
      sanitized: result.sanitizedText,
      hasPII: true,
      blocked: true,
      reason: 'Your prompt contains sensitive personal information and cannot be processed.',
    };
  }

  // Additional AI-specific checks
  const maliciousPatterns = [
    /ignore\s+(all|previous)\s+instructions/i,
    /system\s*:\s*override/i,
    /reveal\s+(your|system)\s+(instructions|prompt)/i,
    /extract\s+(api\s*key|secret|password)/i,
  ];

  for (const pattern of maliciousPatterns) {
    if (pattern.test(prompt)) {
      return {
        sanitized: result.sanitizedText,
        hasPII: result.detectedPII.length > 0,
        blocked: true,
        reason: 'Your prompt contains potentially malicious content.',
      };
    }
  }

  return {
    sanitized: result.sanitizedText,
    hasPII: result.detectedPII.length > 0,
    blocked: false,
  };
}
