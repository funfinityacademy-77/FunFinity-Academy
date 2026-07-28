/**
 * PII Scrubbing Middleware for Chat and Forums
 * 
 * This utility sanitizes user-generated content by redacting personally identifiable information (PII)
 * including phone numbers, email addresses, social media handles, and other sensitive data.
 * 
 * Security: All PII is scrubbed client-side before being sent to the database.
 * Compliance: GDPR and COPPA compliant data handling.
 */

interface SanitizationResult {
  sanitized: string;
  detectedPII: string[];
  piiCount: number;
}

/**
 * Regex patterns for PII detection
 */
const PII_PATTERNS = {
  // Email addresses
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/gi,
  
  // Phone numbers (US and international formats)
  phone: /(\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\b/g,
  
  // Social Security Numbers (SSN)
  ssn: /\b\d{3}[-.]?\d{2}[-.]?\d{4}\b/g,
  
  // Credit card numbers (basic pattern)
  creditCard: /\b(?:\d[ -]*?){13,16}\b/g,
  
  // Social media handles
  twitter: /@([a-zA-Z0-9_]{1,15})/g,
  instagram: /@([a-zA-Z0-9_.]{1,30})/g,
  
  // URLs (optional - can be enabled if needed)
  url: /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi,
  
  // IP addresses
  ipAddress: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
  
  // Physical addresses (basic pattern)
  address: /\d+\s+[A-Za-z\s]+,\s*[A-Za-z\s]+,\s*[A-Z]{2}\s*\d{5}/gi,
};

/**
 * Replacement text for redacted PII
 */
const REPLACEMENT_TEXT = "[REDACTED]";

/**
 * Sanitizes text by detecting and redacting PII
 * 
 * @param text - The input text to sanitize
 * @param options - Optional configuration for sanitization
 * @returns SanitizationResult with sanitized text and detected PII
 */
export function sanitizeChatMessage(
  text: string,
  options: {
    redactEmail?: boolean;
    redactPhone?: boolean;
    redactSSN?: boolean;
    redactCreditCard?: boolean;
    redactSocialHandles?: boolean;
    redactURL?: boolean;
    redactIP?: boolean;
    redactAddress?: boolean;
  } = {}
): SanitizationResult {
  const {
    redactEmail = true,
    redactPhone = true,
    redactSSN = true,
    redactCreditCard = true,
    redactSocialHandles = true,
    redactURL = false,
    redactIP = true,
    redactAddress = true,
  } = options;

  let sanitized = text;
  const detectedPII: string[] = [];

  // Redact email addresses
  if (redactEmail) {
    const emailMatches = text.match(PII_PATTERNS.email);
    if (emailMatches) {
      emailMatches.forEach(match => {
        if (!detectedPII.includes(match)) {
          detectedPII.push(match);
        }
      });
      sanitized = sanitized.replace(PII_PATTERNS.email, REPLACEMENT_TEXT);
    }
  }

  // Redact phone numbers
  if (redactPhone) {
    const phoneMatches = text.match(PII_PATTERNS.phone);
    if (phoneMatches) {
      phoneMatches.forEach(match => {
        if (!detectedPII.includes(match)) {
          detectedPII.push(match);
        }
      });
      sanitized = sanitized.replace(PII_PATTERNS.phone, REPLACEMENT_TEXT);
    }
  }

  // Redact SSNs
  if (redactSSN) {
    const ssnMatches = text.match(PII_PATTERNS.ssn);
    if (ssnMatches) {
      ssnMatches.forEach(match => {
        if (!detectedPII.includes(match)) {
          detectedPII.push(match);
        }
      });
      sanitized = sanitized.replace(PII_PATTERNS.ssn, REPLACEMENT_TEXT);
    }
  }

  // Redact credit card numbers
  if (redactCreditCard) {
    const ccMatches = text.match(PII_PATTERNS.creditCard);
    if (ccMatches) {
      ccMatches.forEach(match => {
        // Additional validation for credit card pattern
        if (isValidCreditCardNumber(match.replace(/[^0-9]/g, ''))) {
          if (!detectedPII.includes(match)) {
            detectedPII.push(match);
          }
          sanitized = sanitized.replace(match, REPLACEMENT_TEXT);
        }
      });
    }
  }

  // Redact social media handles
  if (redactSocialHandles) {
    const twitterMatches = text.match(PII_PATTERNS.twitter);
    if (twitterMatches) {
      twitterMatches.forEach(match => {
        if (!detectedPII.includes(match)) {
          detectedPII.push(match);
        }
      });
      sanitized = sanitized.replace(PII_PATTERNS.twitter, REPLACEMENT_TEXT);
    }

    const instaMatches = text.match(PII_PATTERNS.instagram);
    if (instaMatches) {
      instaMatches.forEach(match => {
        if (!detectedPII.includes(match)) {
          detectedPII.push(match);
        }
      });
      sanitized = sanitized.replace(PII_PATTERNS.instagram, REPLACEMENT_TEXT);
    }
  }

  // Redact URLs (optional)
  if (redactURL) {
    const urlMatches = text.match(PII_PATTERNS.url);
    if (urlMatches) {
      urlMatches.forEach(match => {
        if (!detectedPII.includes(match)) {
          detectedPII.push(match);
        }
      });
      sanitized = sanitized.replace(PII_PATTERNS.url, REPLACEMENT_TEXT);
    }
  }

  // Redact IP addresses
  if (redactIP) {
    const ipMatches = text.match(PII_PATTERNS.ipAddress);
    if (ipMatches) {
      ipMatches.forEach(match => {
        if (!detectedPII.includes(match)) {
          detectedPII.push(match);
        }
      });
      sanitized = sanitized.replace(PII_PATTERNS.ipAddress, REPLACEMENT_TEXT);
    }
  }

  // Redact physical addresses
  if (redactAddress) {
    const addressMatches = text.match(PII_PATTERNS.address);
    if (addressMatches) {
      addressMatches.forEach(match => {
        if (!detectedPII.includes(match)) {
          detectedPII.push(match);
        }
      });
      sanitized = sanitized.replace(PII_PATTERNS.address, REPLACEMENT_TEXT);
    }
  }

  return {
    sanitized,
    detectedPII,
    piiCount: detectedPII.length,
  };
}

/**
 * Validates if a number could be a valid credit card number using Luhn algorithm
 */
function isValidCreditCardNumber(number: string): boolean {
  if (number.length < 13 || number.length > 19) return false;
  
  let sum = 0;
  let isEven = false;
  
  for (let i = number.length - 1; i >= 0; i--) {
    let digit = parseInt(number[i], 10);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
}

/**
 * Checks if text contains any PII
 */
export function containsPII(text: string): boolean {
  const result = sanitizeChatMessage(text);
  return result.piiCount > 0;
}

/**
 * Gets a summary of PII detected in text
 */
export function getPIISummary(text: string): {
  hasEmail: boolean;
  hasPhone: boolean;
  hasSSN: boolean;
  hasCreditCard: boolean;
  hasSocialHandles: boolean;
  hasURL: boolean;
  hasIP: boolean;
  hasAddress: boolean;
  totalPII: number;
} {
  const hasEmail = PII_PATTERNS.email.test(text);
  const hasPhone = PII_PATTERNS.phone.test(text);
  const hasSSN = PII_PATTERNS.ssn.test(text);
  const hasCreditCard = PII_PATTERNS.creditCard.test(text);
  const hasSocialHandles = PII_PATTERNS.twitter.test(text) || PII_PATTERNS.instagram.test(text);
  const hasURL = PII_PATTERNS.url.test(text);
  const hasIP = PII_PATTERNS.ipAddress.test(text);
  const hasAddress = PII_PATTERNS.address.test(text);

  return {
    hasEmail,
    hasPhone,
    hasSSN,
    hasCreditCard,
    hasSocialHandles,
    hasURL,
    hasIP,
    hasAddress,
    totalPII: [hasEmail, hasPhone, hasSSN, hasCreditCard, hasSocialHandles, hasURL, hasIP, hasAddress].filter(Boolean).length,
  };
}

/**
 * React hook for real-time PII detection in form inputs
 */
export function usePIIDetection() {
  const detectPII = (text: string) => {
    return getPIISummary(text);
  };

  const sanitize = (text: string, options?: Parameters<typeof sanitizeChatMessage>[1]) => {
    return sanitizeChatMessage(text, options);
  };

  return { detectPII, sanitize, containsPII };
}
