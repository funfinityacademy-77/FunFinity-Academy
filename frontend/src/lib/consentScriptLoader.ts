// Lightweight consent-aware third-party script loader
// Listens for `funfinity:cookie-consent-changed` and initializes trackers only after opt-in

export function initConsentScriptsFromPreferences(preferences: { essential?: boolean; analytics?: boolean; marketing?: boolean } | null) {
  if (!preferences) return;

  // Analytics initialization
  if (preferences.analytics) {
    initAnalytics();
  }

  // Marketing / Ads initialization (placeholder)
  if (preferences.marketing) {
    initMarketing();
  }
}

export function attachConsentListener() {
  if (typeof window === 'undefined') return;

  const handler = (e: Event) => {
    try {
      // event.detail should contain the preferences object
      // @ts-ignore
      const detail = e instanceof CustomEvent ? e.detail : null;
      initConsentScriptsFromPreferences(detail);
    } catch (err) {
      // ignore
    }
  };

  window.addEventListener('funfinity:cookie-consent-changed', handler as EventListener);
  return () => window.removeEventListener('funfinity:cookie-consent-changed', handler as EventListener);
}

function initAnalytics() {
  if (typeof window === 'undefined') return;
  if ((window as any).__funfinity_analytics_initialized) return;
  (window as any).__funfinity_analytics_initialized = true;

  // Example placeholder: initialize Google Analytics or other providers here
  // e.g. load script tag for gtag.js or initialize Mixpanel
  // This intentionally does not include any real keys - add integration code here.
  try {
    console.info('[ConsentLoader] Initializing analytics (placeholder)');
    // Example: dynamically inject a script tag
    // const s = document.createElement('script'); s.src = 'https://www.googletagmanager.com/gtag/js?id=G-XXXX'; s.async = true; document.head.appendChild(s);
    // window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', 'G-XXXX');
  } catch (err) {
    console.warn('[ConsentLoader] analytics init failed', err);
  }
}

function initMarketing() {
  if (typeof window === 'undefined') return;
  if ((window as any).__funfinity_marketing_initialized) return;
  (window as any).__funfinity_marketing_initialized = true;

  console.info('[ConsentLoader] Initializing marketing scripts (placeholder)');
  // Insert marketing tags here (ads, personalization) after explicit consent
}

// Helper to check stored consent and initialize accordingly
export function initFromStoredConsent() {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem('funfinity_cookie_consent');
    const prefs = raw ? JSON.parse(raw) : null;
    initConsentScriptsFromPreferences(prefs);
  } catch (e) {
    // ignore
  }
}

export default {
  initConsentScriptsFromPreferences,
  attachConsentListener,
  initFromStoredConsent,
};
