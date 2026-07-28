import { useCallback } from 'react';

interface AnalyticsEvent {
  event: string;
  category?: string;
  label?: string;
  value?: number;
  properties?: Record<string, any>;
}

export function useAnalytics() {
  const trackEvent = useCallback((event: AnalyticsEvent) => {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics]', event);
    }
    // Respect cookie consent: only record analytics when user opted-in
    try {
      const consentRaw = localStorage.getItem('funfinity_cookie_consent');
      const consent = consentRaw ? JSON.parse(consentRaw) : null;
      const analyticsAllowed = consent && consent.analytics === true;
      if (!analyticsAllowed) {
        // Do not record analytics when user hasn't given consent
        if (process.env.NODE_ENV === 'development') {
          console.debug('[Analytics] Skipped - no analytics consent');
        }
        return;
      }

      // Send to analytics service (placeholder for Google Analytics, Mixpanel, etc.)
      // Example: window.gtag('event', event.event, { ...event });

      // Store in localStorage for basic tracking (local-only fallback)
      const events = JSON.parse(localStorage.getItem('analytics_events') || '[]');
      events.push({
        ...event,
        timestamp: new Date().toISOString(),
        url: window.location.pathname,
      });
      // Keep only last 100 events
      if (events.length > 100) {
        events.shift();
      }
      localStorage.setItem('analytics_events', JSON.stringify(events));
    } catch (error) {
      console.error('Failed to store analytics event:', error);
    }
  }, []);

  const trackPageView = useCallback((path?: string) => {
    const page = path || window.location.pathname;
    trackEvent({
      event: 'page_view',
      category: 'navigation',
      label: page,
    });
  }, [trackEvent]);

  const trackButtonClick = useCallback((buttonName: string, location: string) => {
    trackEvent({
      event: 'button_click',
      category: 'interaction',
      label: buttonName,
      properties: { location },
    });
  }, [trackEvent]);

  const trackFormSubmit = useCallback((formName: string, success: boolean) => {
    trackEvent({
      event: 'form_submit',
      category: 'interaction',
      label: formName,
      properties: { success },
    });
  }, [trackEvent]);

  const trackError = useCallback((error: string, context?: string) => {
    trackEvent({
      event: 'error',
      category: 'system',
      label: error,
      properties: { context },
    });
  }, [trackEvent]);

  const trackFeatureUsage = useCallback((feature: string, action: string) => {
    trackEvent({
      event: 'feature_usage',
      category: 'engagement',
      label: feature,
      properties: { action },
    });
  }, [trackEvent]);

  return {
    trackEvent,
    trackPageView,
    trackButtonClick,
    trackFormSubmit,
    trackError,
    trackFeatureUsage,
  };
}
