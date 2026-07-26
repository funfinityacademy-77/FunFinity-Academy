/**
 * Auto-Moderation System with Tiered Penalties
 * Provides content filtering, violation detection, and penalty enforcement
 */

export type ViolationSeverity = 'low' | 'medium' | 'high' | 'critical';
export type PenaltyType = 'warning' | 'timeout' | 'restriction' | 'ban';

export interface ModerationResult {
  isViolation: boolean;
  severity?: ViolationSeverity;
  penalty?: PenaltyType;
  reason?: string;
  filteredContent?: string;
}

export interface ModerationConfig {
  enableProfanityFilter: boolean;
  enableHarassmentDetection: boolean;
  enableSpamDetection: boolean;
  enableLinkFilter: boolean;
  maxMessageLength: number;
  maxMessagesPerMinute: number;
}

const DEFAULT_CONFIG: ModerationConfig = {
  enableProfanityFilter: true,
  enableHarassmentDetection: true,
  enableSpamDetection: true,
  enableLinkFilter: true,
  maxMessageLength: 2000,
  maxMessagesPerMinute: 10,
};

// Profanity list (expandable)
const PROFANITY_PATTERNS = [
  /\b(fuck|shit|damn|hell|crap|ass|bitch|bastard|dick|piss)\b/gi,
  // Add more patterns as needed
];

// Harassment patterns
const HARASSMENT_PATTERNS = [
  /\b(kill\s+yourself|go\s+die|stupid|idiot|retard|dumb)\b/gi,
  /\b(hate\s+you|loser|pathetic|worthless)\b/gi,
  // Add more patterns as needed
];

// Spam patterns
const SPAM_PATTERNS = [
  /(.)\1{4,}/g, // Repeated characters
  /(https?:\/\/[^\s]+)/gi, // URLs
  /\b(buy\s+now|free\s+money|click\s+here|winner|congratulations)\b/gi,
];

// Link patterns
const LINK_PATTERNS = [
  /(https?:\/\/[^\s]+)/gi,
  /(www\.[^\s]+)/gi,
];

/**
 * Detects violations in content based on configured rules
 */
export function detectViolation(
  content: string,
  config: ModerationConfig = DEFAULT_CONFIG
): ModerationResult {
  if (!content || !content.trim()) {
    return { isViolation: false };
  }

  // Check message length
  if (content.length > config.maxMessageLength) {
    return {
      isViolation: true,
      severity: 'low',
      penalty: 'warning',
      reason: 'Message exceeds maximum length',
    };
  }

  let filteredContent = content;
  let violations: { severity: ViolationSeverity; reason: string }[] = [];

  // Profanity filter
  if (config.enableProfanityFilter) {
    for (const pattern of PROFANITY_PATTERNS) {
      const matches = content.match(pattern);
      if (matches) {
        violations.push({ severity: 'medium', reason: 'Profanity detected' });
        filteredContent = filteredContent.replace(pattern, '***');
      }
    }
  }

  // Harassment detection
  if (config.enableHarassmentDetection) {
    for (const pattern of HARASSMENT_PATTERNS) {
      const matches = content.match(pattern);
      if (matches) {
        violations.push({ severity: 'high', reason: 'Harassment detected' });
        filteredContent = filteredContent.replace(pattern, '***');
      }
    }
  }

  // Spam detection
  if (config.enableSpamDetection) {
    for (const pattern of SPAM_PATTERNS) {
      const matches = content.match(pattern);
      if (matches) {
        violations.push({ severity: 'medium', reason: 'Spam pattern detected' });
      }
    }
  }

  // Link filter
  if (config.enableLinkFilter) {
    for (const pattern of LINK_PATTERNS) {
      const matches = content.match(pattern);
      if (matches) {
        violations.push({ severity: 'low', reason: 'External link detected' });
      }
    }
  }

  if (violations.length === 0) {
    return { isViolation: false };
  }

  // Determine highest severity
  const severityOrder: ViolationSeverity[] = ['low', 'medium', 'high', 'critical'];
  const highestSeverity = violations.reduce((highest, violation) => {
    return severityOrder.indexOf(violation.severity) > severityOrder.indexOf(highest)
      ? violation.severity
      : highest;
  }, 'low' as ViolationSeverity);

  // Determine penalty based on severity
  const penalty = determinePenalty(highestSeverity);

  return {
    isViolation: true,
    severity: highestSeverity,
    penalty,
    reason: violations[0].reason,
    filteredContent: filteredContent !== content ? filteredContent : undefined,
  };
}

/**
 * Determines penalty based on violation severity
 */
function determinePenalty(severity: ViolationSeverity): PenaltyType {
  switch (severity) {
    case 'low':
      return 'warning';
    case 'medium':
      return 'timeout';
    case 'high':
      return 'restriction';
    case 'critical':
      return 'ban';
    default:
      return 'warning';
  }
}

/**
 * Calculates penalty duration based on type and violation history
 */
export function calculatePenaltyDuration(
  penaltyType: PenaltyType,
  violationCount: number
): number {
  // Duration in minutes
  const baseDurations: Record<PenaltyType, number> = {
    warning: 0,
    timeout: 5,
    restriction: 30,
    ban: 1440, // 24 hours
  };

  const baseDuration = baseDurations[penaltyType];
  
  // Increase duration based on repeat violations
  const multiplier = Math.min(violationCount, 5); // Cap at 5x
  
  return baseDuration * multiplier;
}

/**
 * Checks if user is currently under penalty
 */
export function isUnderPenalty(
  penaltyEndTime: string | null
): boolean {
  if (!penaltyEndTime) return false;
  return new Date(penaltyEndTime) > new Date();
}

/**
 * Gets remaining penalty time in minutes
 */
export function getRemainingPenaltyTime(
  penaltyEndTime: string | null
): number {
  if (!penaltyEndTime) return 0;
  const remaining = new Date(penaltyEndTime).getTime() - new Date().getTime();
  return Math.max(0, Math.floor(remaining / 60000)); // Convert to minutes
}

/**
 * Formats penalty time for display
 */
export function formatPenaltyTime(minutes: number): string {
  if (minutes === 0) return 'No penalty';
  
  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours < 24) {
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours} hour${hours !== 1 ? 's' : ''}`;
  }
  
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  
  return remainingHours > 0
    ? `${days}d ${remainingHours}h`
    : `${days} day${days !== 1 ? 's' : ''}`;
}

/**
 * Rate limiter for message frequency
 */
export class MessageRateLimiter {
  private messages: number[] = [];
  private maxMessages: number;
  private windowMs: number;

  constructor(maxMessages: number = 10, windowMs: number = 60000) {
    this.maxMessages = maxMessages;
    this.windowMs = windowMs;
  }

  canSendMessage(): boolean {
    const now = Date.now();
    // Remove messages outside the time window
    this.messages = this.messages.filter(
      (timestamp) => now - timestamp < this.windowMs
    );
    
    return this.messages.length < this.maxMessages;
  }

  recordMessage(): void {
    this.messages.push(Date.now());
  }

  getRemainingTime(): number {
    if (this.messages.length < this.maxMessages) return 0;
    
    const oldestMessage = this.messages[0];
    const windowEnd = oldestMessage + this.windowMs;
    return Math.max(0, windowEnd - Date.now());
  }

  reset(): void {
    this.messages = [];
  }
}

/**
 * Moderation penalty logger
 */
export class ModerationLogger {
  private static violations: Map<string, number> = new Map();

  static logViolation(userId: string, severity: ViolationSeverity): void {
    const currentCount = this.violations.get(userId) || 0;
    this.violations.set(userId, currentCount + 1);
  }

  static getViolationCount(userId: string): number {
    return this.violations.get(userId) || 0;
  }

  static resetViolations(userId: string): void {
    this.violations.delete(userId);
  }
}

/**
 * Sanitizes content by removing potentially harmful elements
 */
export function sanitizeContent(content: string): string {
  return content
    .replace(/<script[^>]*>.*?<\/script>/gis, '') // Remove script tags
    .replace(/<iframe[^>]*>.*?<\/iframe>/gis, '') // Remove iframes
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Validates content before sending
 */
export function validateContent(
  content: string,
  config: ModerationConfig = DEFAULT_CONFIG
): { valid: boolean; error?: string } {
  if (!content || !content.trim()) {
    return { valid: false, error: 'Message cannot be empty' };
  }

  if (content.length > config.maxMessageLength) {
    return {
      valid: false,
      error: `Message exceeds maximum length of ${config.maxMessageLength} characters`,
    };
  }

  const moderationResult = detectViolation(content, config);
  if (moderationResult.isViolation) {
    return {
      valid: false,
      error: moderationResult.reason || 'Content violates community guidelines',
    };
  }

  return { valid: true };
}
