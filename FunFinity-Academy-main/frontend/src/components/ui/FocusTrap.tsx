/**
 * Focus Trap Component
 * Traps keyboard focus within a modal or dialog for accessibility
 * WCAG 2.2 SC 2.1.1 - Keyboard
 */

import { useEffect, useRef, useCallback } from 'react';

interface FocusTrapProps {
  active: boolean;
  children: React.ReactNode;
  onEscape?: () => void;
}

export function FocusTrap({ active, children, onEscape }: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return [];
    
    const focusableSelectors = [
      'button:not([disabled])',
      '[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
    ];
    
    const elements = containerRef.current.querySelectorAll(focusableSelectors.join(', '));
    return Array.from(elements) as HTMLElement[];
  }, []);

  const trapFocus = useCallback((e: KeyboardEvent) => {
    if (!active || !containerRef.current) return;

    const focusableElements = getFocusableElements();
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.key === 'Tab') {
      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    } else if (e.key === 'Escape' && onEscape) {
      onEscape();
    }
  }, [active, getFocusableElements, onEscape]);

  useEffect(() => {
    if (!active) {
      // Restore focus when trap is deactivated
      if (previousActiveElementRef.current) {
        previousActiveElementRef.current.focus();
      }
      return;
    }

    // Store previously focused element
    previousActiveElementRef.current = document.activeElement as HTMLElement;

    // Focus first focusable element
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    // Add event listener
    document.addEventListener('keydown', trapFocus);

    return () => {
      document.removeEventListener('keydown', trapFocus);
    };
  }, [active, trapFocus, getFocusableElements]);

  return (
    <div ref={containerRef} role="dialog" aria-modal="true">
      {children}
    </div>
  );
}
