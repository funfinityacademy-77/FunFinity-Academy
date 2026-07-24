import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X, Shield, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState({
    essential: true, // Always required
    analytics: false, // Opt-in only
    marketing: false, // Opt-in only
  });

  useEffect(() => {
    // Check if user has already responded to cookie consent
    const consent = localStorage.getItem('funfinity_cookie_consent');
    if (!consent) {
      // Small delay to ensure page is fully loaded before showing
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSavePreferences = () => {
    localStorage.setItem('funfinity_cookie_consent', JSON.stringify(preferences));
    // Notify other parts of the app that consent preferences changed
    try {
      window.dispatchEvent(new CustomEvent('funfinity:cookie-consent-changed', { detail: preferences }));
    } catch (e) {
      // ignore in non-browser environments
    }
    setIsVisible(false);
  };

  const handleAcceptAll = () => {
    const allAccepted = {
      essential: true,
      analytics: true,
      marketing: true,
    };
    localStorage.setItem('funfinity_cookie_consent', JSON.stringify(allAccepted));
    try {
      window.dispatchEvent(new CustomEvent('funfinity:cookie-consent-changed', { detail: allAccepted }));
    } catch (e) {}
    setIsVisible(false);
  };

  const handleDeclineAll = () => {
    const essentialOnly = {
      essential: true,
      analytics: false,
      marketing: false,
    };
    localStorage.setItem('funfinity_cookie_consent', JSON.stringify(essentialOnly));
    try {
      window.dispatchEvent(new CustomEvent('funfinity:cookie-consent-changed', { detail: essentialOnly }));
    } catch (e) {}
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
      >
        <div className="max-w-4xl mx-auto">
          <div className="bg-background/95 backdrop-blur-lg border border-border/50 rounded-2xl shadow-2xl p-6 md:p-8">
            <div className="flex flex-col gap-6 items-start">
              {/* Icon and Title */}
              <div className="flex items-start gap-4 w-full">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue to-orange flex items-center justify-center">
                    <Cookie className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-lg font-bold text-foreground">
                    Cookie Preferences
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    We use cookies to enhance your experience. Please choose which cookies you allow us to use.
                  </p>
                </div>
                <button
                  onClick={() => setIsVisible(false)}
                  className="flex-shrink-0 p-1 rounded-lg hover:bg-secondary/50 text-muted-foreground transition-colors"
                  aria-label="Close cookie consent"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Cookie Options */}
              <div className="space-y-3 w-full">
                {/* Essential - Always enabled */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border/30">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-blue mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">Essential Cookies</p>
                      <p className="text-xs text-muted-foreground">Required for basic functionality and security</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Always Active</span>
                    <div className="w-10 h-6 bg-blue rounded-full relative">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                    </div>
                  </div>
                </div>

                {/* Analytics - Opt-in */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border/30">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-orange mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">Analytics Cookies</p>
                      <p className="text-xs text-muted-foreground">Help us improve the platform by understanding usage</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setPreferences({ ...preferences, analytics: !preferences.analytics })}
                    className={`w-10 h-6 rounded-full relative transition-colors ${
                      preferences.analytics ? 'bg-orange' : 'bg-border'
                    }`}
                    aria-label="Toggle analytics cookies"
                  >
                    <motion.div
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-colors ${
                        preferences.analytics ? 'right-1' : 'left-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Marketing - Opt-in */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border/30">
                  <div className="flex items-start gap-3">
                    <Cookie className="w-5 h-5 text-pink mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">Marketing Cookies</p>
                      <p className="text-xs text-muted-foreground">Used for personalized content and advertising</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setPreferences({ ...preferences, marketing: !preferences.marketing })}
                    className={`w-10 h-6 rounded-full relative transition-colors ${
                      preferences.marketing ? 'bg-pink' : 'bg-border'
                    }`}
                    aria-label="Toggle marketing cookies"
                  >
                    <motion.div
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-colors ${
                        preferences.marketing ? 'right-1' : 'left-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Legal Links */}
              <div className="text-xs text-muted-foreground">
                By continuing, you agree to our use of cookies. View our{' '}
                <a href="/privacy" className="text-blue hover:underline font-medium">
                  Privacy Policy
                </a>
                {' '}and{' '}
                <a href="/terms" className="text-blue hover:underline font-medium">
                  Terms of Service
                </a>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <Button
                  onClick={handleSavePreferences}
                  className="flex-1 bg-gradient-to-r from-blue to-orange hover:from-blue/90 hover:to-orange/90 text-white font-semibold"
                >
                  Save Preferences
                </Button>
                <Button
                  onClick={handleAcceptAll}
                  variant="outline"
                  className="flex-1"
                >
                  Accept All
                </Button>
                <Button
                  onClick={handleDeclineAll}
                  variant="ghost"
                  className="flex-1 text-muted-foreground hover:text-foreground"
                >
                  Decline All
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
