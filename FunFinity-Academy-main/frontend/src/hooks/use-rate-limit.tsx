import { useState, useCallback, useRef } from 'react';

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
}

export function useRateLimit(config: RateLimitConfig = { maxAttempts: 5, windowMs: 60000 }) {
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimeRemaining, setLockTimeRemaining] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const resetAttempts = useCallback(() => {
    setAttempts(0);
    setIsLocked(false);
    setLockTimeRemaining(0);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const checkRateLimit = useCallback((): { allowed: boolean; remainingAttempts: number } => {
    if (isLocked) {
      return { allowed: false, remainingAttempts: 0 };
    }

    if (attempts >= config.maxAttempts) {
      setIsLocked(true);
      const lockEndTime = Date.now() + config.windowMs;
      
      // Set up countdown
      intervalRef.current = setInterval(() => {
        const remaining = Math.max(0, lockEndTime - Date.now());
        setLockTimeRemaining(remaining);
        if (remaining === 0) {
          resetAttempts();
        }
      }, 1000);

      // Auto-reset after window
      timeoutRef.current = setTimeout(() => {
        resetAttempts();
      }, config.windowMs);

      return { allowed: false, remainingAttempts: 0 };
    }

    return { allowed: true, remainingAttempts: config.maxAttempts - attempts };
  }, [attempts, isLocked, config, resetAttempts]);

  const recordAttempt = useCallback(() => {
    setAttempts(prev => prev + 1);
  }, []);

  return {
    attempts,
    isLocked,
    lockTimeRemaining,
    checkRateLimit,
    recordAttempt,
    resetAttempts
  };
}
