/**
 * Screen Reader Announcer Hook
 * Provides live region announcements for form validation and dynamic content
 * WCAG 2.2 SC 4.1.3 - Status Messages
 */

import { useEffect, useRef } from 'react';

export function useScreenReaderAnnouncer() {
  const announcerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Create live region element if it doesn't exist
    if (!announcerRef.current) {
      announcerRef.current = document.createElement('div');
      announcerRef.current.setAttribute('role', 'status');
      announcerRef.current.setAttribute('aria-live', 'polite');
      announcerRef.current.setAttribute('aria-atomic', 'true');
      announcerRef.current.style.position = 'absolute';
      announcerRef.current.style.left = '-10000px';
      announcerRef.current.style.width = '1px';
      announcerRef.current.style.height = '1px';
      announcerRef.current.style.overflow = 'hidden';
      document.body.appendChild(announcerRef.current);
    }

    return () => {
      if (announcerRef.current && document.body.contains(announcerRef.current)) {
        document.body.removeChild(announcerRef.current);
      }
    };
  }, []);

  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite'): void => {
    if (!announcerRef.current) return;

    // Update aria-live based on priority
    announcerRef.current.setAttribute('aria-live', priority);
    
    // Clear previous content and set new message
    announcerRef.current.textContent = '';
    
    // Use setTimeout to ensure screen readers pick up the change
    setTimeout(() => {
      if (announcerRef.current) {
        announcerRef.current.textContent = message;
      }
    }, 100);
  };

  const announceError = (fieldName: string, errorMessage: string): void => {
    announce(`Error in ${fieldName}: ${errorMessage}`, 'assertive');
  };

  const announceSuccess = (message: string): void => {
    announce(message, 'polite');
  };

  const announceProgress = (message: string): void => {
    announce(message, 'polite');
  };

  return {
    announce,
    announceError,
    announceSuccess,
    announceProgress,
  };
}

/**
 * Accessible Form Field Hook
 * Combines validation with screen reader announcements
 */
export function useAccessibleFormField() {
  const { announceError, announceSuccess } = useScreenReaderAnnouncer();

  const announceValidation = (
    fieldName: string,
    isValid: boolean,
    errorMessage?: string
  ): void => {
    if (isValid) {
      announceSuccess(`${fieldName} is valid`);
    } else if (errorMessage) {
      announceError(fieldName, errorMessage);
    }
  };

  return {
    announceValidation,
  };
}
