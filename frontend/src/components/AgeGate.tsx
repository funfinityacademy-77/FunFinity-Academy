import { useState, useEffect } from "react";
import { requestParentalConsent } from "@/lib/parentalConsentClient";
import { productionThemes } from "@/config/production-theme";
import { useTheme } from "@/hooks/use-theme";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Lock, Calendar, Mail, ArrowRight, User, AlertCircle } from "lucide-react";

const MIN_AGE = 13;

type AgeGateStep = "verification" | "parental_consent" | "parent_email" | "consent_sent";

export function AgeGate() {
  const [isVerified, setIsVerified] = useState(false);
  const [birthYear, setBirthYear] = useState("");
  const [error, setError] = useState("");
  const [step, setStep] = useState<AgeGateStep>("verification");
  const [parentEmail, setParentEmail] = useState("");
  const [childName, setChildName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const currentYear = new Date().getFullYear();
  // Pick theme colors based on the active app theme
  const { theme: activeTheme } = useTheme();
  const theme = productionThemes[activeTheme] || productionThemes.light;
  const primary = theme.primary[500];
  const accent = theme.primary[400] || theme.primary[600];
  const highlight = theme.primary[300] || theme.primary[700];

  useEffect(() => {
    // Check if user has already verified
    const verified = localStorage.getItem('age-verified');
    const verifiedYear = localStorage.getItem('age-verified-year');
    
    if (verified === 'true' && verifiedYear) {
      const age = currentYear - parseInt(verifiedYear);
      if (age >= MIN_AGE) {
        setIsVerified(true);
      } else {
        // User was previously verified but is now under age (edge case)
        localStorage.removeItem('age-verified');
        localStorage.removeItem('age-verified-year');
      }
    }
  }, [currentYear]);

  const handleVerification = () => {
    setError("");

    if (!birthYear) {
      setError("Please enter your birth year");
      return;
    }

    const year = parseInt(birthYear);

    // Enhanced realistic validation
    if (isNaN(year) || year < 1920 || year > currentYear) {
      setError("Please enter a valid birth year between 1920 and " + currentYear);
      return;
    }

    // Prevent obviously fake entries (e.g., future years, unrealistic ages)
    const age = currentYear - year;
    if (age > 120) {
      setError("Please enter a realistic birth year");
      return;
    }

    // Check for suspicious patterns (e.g., 1111, 1234, 0000)
    const yearStr = year.toString();
    if (/^(\d)\1+$/.test(yearStr) || /^(1234|4321|1111|0000|9999|8888|7777|6666|5555|4444|3333|2222)$/.test(yearStr)) {
      setError("Please enter your actual birth year");
      return;
    }

    // Additional validation: check for common test years
    const testYears = [2000, 2001, 1990, 1995, 1985];
    if (testYears.includes(year) && age < 18) {
      setError("Please verify your actual birth year");
      return;
    }

    if (age < MIN_AGE) {
      // User is under 13, trigger parental consent flow
      setStep("parental_consent");
      return;
    }

    // User is 13 or older, allow access
    localStorage.setItem('age-verified', 'true');
    localStorage.setItem('age-verified-year', year.toString());
    localStorage.setItem('age-verified-timestamp', Date.now().toString());
    localStorage.setItem('age-verified-age', age.toString());
    setIsVerified(true);
  };

  const handleParentalConsent = () => {
    setStep("parent_email");
  };

  const handleParentEmailSubmit = async () => {
    setError("");

    if (!parentEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parentEmail)) {
      setError("Please enter a valid parent email address");
      return;
    }

    if (!childName || childName.trim().length < 2) {
      setError("Please enter your name");
      return;
    }

    setIsSubmitting(true);
    try {
      const resp = await requestParentalConsent(childName.trim(), parentEmail.trim(), parseInt(birthYear || String(currentYear)));
      // Store that parental consent was requested
      localStorage.setItem('parental-consent-requested', 'true');
      localStorage.setItem('parental-consent-email', parentEmail);
      localStorage.setItem('child-name', childName.trim());
      // Optionally store token for later verification
      if (resp?.token) localStorage.setItem('parental-consent-token', resp.token);
      setIsSubmitting(false);
      setStep("consent_sent");
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err?.message || 'Failed to request parental consent');
    }
  };

  const handleReturnToVerification = () => {
    setStep("verification");
    setBirthYear("");
    setError("");
  };

  if (isVerified) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4"
      style={{ background: theme.neutral[0] }}
    >
      <AnimatePresence mode="wait">
        {/* Step 1: Age Verification */}
        {step === "verification" && (
          <motion.div
            key="verification"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md mx-2 sm:mx-4"
          >
            <div className="rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl" style={{ background: theme.neutral[0], border: `2px solid ${theme.neutral[200]}` }}>
              {/* Icon */}
              <div className="flex justify-center mb-4 sm:mb-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center" style={{ background: `${primary}22` }}>
                  <Shield className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: primary }} />
                </div>
              </div>

              {/* Title */}
              <h1 className="text-xl sm:text-2xl font-bold text-center mb-2 sm:mb-3" style={{ color: theme.neutral[900] }}>
                Age Verification Required
              </h1>

              {/* Description */}
              <p className="text-center text-xs sm:text-sm mb-4 sm:mb-6 leading-relaxed" style={{ color: theme.neutral[600] }}>
                To comply with COPPA and GDPR regulations, we need to verify that you are at least {MIN_AGE} years old before accessing FunFinity Academy.
              </p>

              {/* Form */}
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label htmlFor="birthYear" className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2" style={{ color: theme.neutral[900] }}>
                    What year were you born?
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5" style={{ color: theme.neutral[500] }} />
                    <input
                      id="birthYear"
                      type="number"
                      value={birthYear}
                      onChange={(e) => setBirthYear(e.target.value)}
                      placeholder="YYYY"
                      min="1900"
                      max={currentYear}
                      className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 rounded-xl focus:outline-none focus:ring-2 transition-colors text-sm sm:text-base"
                      style={{ background: theme.neutral[50], border: `2px solid ${theme.neutral[300]}`, color: theme.neutral[900] }}
                      aria-label="Birth year"
                      aria-invalid={!!error}
                      aria-describedby={error ? "birthYear-error" : undefined}
                    />
                  </div>
                </div>

                {error && (
                  <motion.div
                    id="birthYear-error"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl p-2 sm:p-3"
                    style={{ background: `${theme.error}22`, borderColor: `${theme.error}44` }}
                    role="alert"
                  >
                    <p className="text-xs sm:text-sm text-center" style={{ color: theme.error }}>{error}</p>
                  </motion.div>
                )}

                <button
                  onClick={handleVerification}
                  className="w-full font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-xl transition-colors shadow-lg text-sm sm:text-base focus:outline-none focus:ring-2"
                  style={{ background: primary, color: theme.neutral[0] }}
                >
                  Continue to Platform
                </button>
              </div>

              {/* Footer Info */}
              <div className="mt-4 sm:mt-6 pt-4 sm:pt-6" style={{ borderTop: `1px solid ${theme.neutral[200]}` }}>
                <div className="flex items-center justify-center gap-2 text-xs" style={{ color: theme.neutral[500] }}>
                  <Lock className="w-3 h-3" />
                  <span className="text-xs sm:text-sm">Your information is processed securely and in accordance with our Privacy Policy</span>
                </div>
              </div>

              {/* Privacy Link */}
              <div className="mt-3 sm:mt-4 text-center">
                <a
                  href="/privacy"
                  className="text-xs underline transition-colors"
                  style={{ color: theme.neutral[600] }}
                  onMouseEnter={(e) => e.currentTarget.style.color = theme.neutral[900]}
                  onMouseLeave={(e) => e.currentTarget.style.color = theme.neutral[600]}
                >
                  View Privacy Policy
                </a>
              </div>
            </div>

            {/* Corporate Info */}
            <div className="mt-4 sm:mt-6 text-center">
              <p className="text-xs" style={{ color: theme.neutral[400] }}>
                FunFinity Academy • Contact: academyfunfinity@gmail.com
              </p>
            </div>
          </motion.div>
        )}

        {/* Step 2: Parental Consent Required */}
        {step === "parental_consent" && (
          <motion.div
            key="parental_consent"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md mx-2 sm:mx-4"
          >
            <div className="rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl" style={{ background: theme.neutral[0], border: `2px solid ${theme.neutral[200]}` }}>
              {/* Icon */}
              <div className="flex justify-center mb-4 sm:mb-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center" style={{ background: `${theme.warning}22` }}>
                  <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: theme.warning }} />
                </div>
              </div>

              {/* Title */}
              <h1 className="text-xl sm:text-2xl font-bold text-center mb-2 sm:mb-3" style={{ color: theme.neutral[900] }}>
                Parental Consent Required
              </h1>

              {/* Description */}
              <p className="text-center text-xs sm:text-sm mb-4 sm:mb-6 leading-relaxed" style={{ color: theme.neutral[600] }}>
                You indicated you are under {MIN_AGE} years old. To comply with COPPA regulations, we need verifiable parental consent before you can create an account.
              </p>

              {/* Info Box */}
              <div className="rounded-xl p-3 sm:p-4 mb-4 sm:mb-6" style={{ background: theme.neutral[50] }}>
                <p className="text-xs sm:text-sm leading-relaxed" style={{ color: theme.neutral[700] }}>
                  <strong style={{ color: theme.neutral[900] }}>What happens next:</strong><br />
                  1. Your parent or guardian will receive an email<br />
                  2. They can review our privacy practices<br />
                  3. They must approve your account creation
                </p>
              </div>

              {/* Actions */}
              <div className="space-y-2 sm:space-y-3">
                <button
                  onClick={handleParentalConsent}
                  className="w-full font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-xl transition-colors shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base focus:outline-none focus:ring-2"
                  style={{ background: primary, color: theme.neutral[0] }}
                >
                  Request Parental Consent
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" style={{ color: theme.neutral[0] }} />
                </button>
                <button
                  onClick={handleReturnToVerification}
                  className="w-full font-medium py-2 sm:py-3 px-4 sm:px-6 rounded-xl transition-colors text-sm sm:text-base"
                  style={{ background: 'transparent', border: `2px solid ${theme.neutral[300]}`, color: theme.neutral[900] }}
                  onMouseEnter={(e) => e.currentTarget.style.background = theme.neutral[50]}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  I entered the wrong year
                </button>
              </div>

              {/* Footer Info */}
              <div className="mt-4 sm:mt-6 pt-4 sm:pt-6" style={{ borderTop: `1px solid ${theme.neutral[200]}` }}>
                <div className="flex items-center justify-center gap-2 text-xs" style={{ color: theme.neutral[500] }}>
                  <Lock className="w-3 h-3" />
                  <span className="text-xs sm:text-sm">Protected by COPPA compliance standards</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 3: Parent Email Collection */}
        {step === "parent_email" && (
          <motion.div
            key="parent_email"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md mx-2 sm:mx-4"
          >
            <div className="rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl" style={{ background: theme.neutral[0], border: `2px solid ${theme.neutral[200]}` }}>
              {/* Icon */}
              <div className="flex justify-center mb-4 sm:mb-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center" style={{ background: `${accent}22` }}>
                  <Mail className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: accent }} />
                </div>
              </div>

              {/* Title */}
              <h1 className="text-xl sm:text-2xl font-bold text-center mb-2 sm:mb-3" style={{ color: theme.neutral[900] }}>
                Parent Contact Information
              </h1>

              {/* Description */}
              <p className="text-center text-xs sm:text-sm mb-4 sm:mb-6 leading-relaxed" style={{ color: theme.neutral[600] }}>
                Please provide your parent's or guardian's email address so we can send them the consent request.
              </p>

              {/* Form */}
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label htmlFor="childName" className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2" style={{ color: theme.neutral[900] }}>
                    Your Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5" style={{ color: theme.neutral[500] }} />
                    <input
                      id="childName"
                      type="text"
                      value={childName}
                      onChange={(e) => setChildName(e.target.value)}
                      placeholder="Your first name"
                      className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 rounded-xl focus:outline-none focus:ring-2 transition-colors text-sm sm:text-base"
                      style={{ background: theme.neutral[50], border: `2px solid ${theme.neutral[300]}`, color: theme.neutral[900] }}
                      aria-label="Child name"
                      aria-invalid={!!error}
                      aria-describedby={error ? "parentEmail-error" : undefined}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="parentEmail" className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2" style={{ color: theme.neutral[900] }}>
                    Parent's Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5" style={{ color: theme.neutral[500] }} />
                    <input
                      id="parentEmail"
                      type="email"
                      value={parentEmail}
                      onChange={(e) => setParentEmail(e.target.value)}
                      placeholder="parent@example.com"
                      className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 rounded-xl focus:outline-none focus:ring-2 transition-colors text-sm sm:text-base"
                      style={{ background: theme.neutral[50], border: `2px solid ${theme.neutral[300]}`, color: theme.neutral[900] }}
                      aria-label="Parent email"
                      aria-invalid={!!error}
                      aria-describedby={error ? "parentEmail-error" : undefined}
                    />
                  </div>
                </div>

                {error && (
                  <motion.div
                    id="parentEmail-error"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl p-2 sm:p-3"
                    style={{ background: `${theme.error}22`, borderColor: `${theme.error}44` }}
                    role="alert"
                  >
                    <p className="text-xs sm:text-sm text-center" style={{ color: theme.error }}>{error}</p>
                  </motion.div>
                )}

                <button
                  onClick={handleParentEmailSubmit}
                  disabled={isSubmitting}
                  className="w-full font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-xl transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base focus:outline-none focus:ring-2"
                  style={{ background: primary, color: theme.neutral[0] }}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full animate-spin" style={{ border: `2px solid ${primary}`, borderTopColor: 'transparent' }} />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Consent Request
                      <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" style={{ color: theme.neutral[0] }} />
                    </>
                  )}
                </button>

                <button
                  onClick={handleReturnToVerification}
                  className="w-full font-medium py-2 sm:py-3 px-4 sm:px-6 rounded-xl transition-colors text-sm sm:text-base"
                  style={{ background: 'transparent', border: `2px solid ${theme.neutral[300]}`, color: theme.neutral[900] }}
                  onMouseEnter={(e) => e.currentTarget.style.background = theme.neutral[50]}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  Back
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 4: Consent Sent */}
        {step === "consent_sent" && (
          <motion.div
            key="consent_sent"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md mx-2 sm:mx-4"
          >
            <div className="rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl" style={{ background: theme.neutral[0], border: `2px solid ${theme.neutral[200]}` }}>
              {/* Icon */}
              <div className="flex justify-center mb-4 sm:mb-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center" style={{ background: `${theme.success}22` }}>
                  <Mail className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: theme.success }} />
                </div>
              </div>

              {/* Title */}
              <h1 className="text-xl sm:text-2xl font-bold text-center mb-2 sm:mb-3" style={{ color: theme.neutral[900] }}>
                Consent Request Sent!
              </h1>

              {/* Description */}
              <p className="text-center text-xs sm:text-sm mb-4 sm:mb-6 leading-relaxed" style={{ color: theme.neutral[600] }}>
                We've sent a consent request to <strong>{parentEmail}</strong>. Your parent or guardian will receive instructions on how to approve your account.
              </p>

              {/* Info Box */}
              <div className="rounded-xl p-3 sm:p-4 mb-4 sm:mb-6" style={{ background: theme.neutral[50] }}>
                <p className="text-xs sm:text-sm leading-relaxed" style={{ color: theme.neutral[700] }}>
                  <strong style={{ color: theme.neutral[900] }}>What to do next:</strong><br />
                  • Check your parent's email inbox<br />
                  • The consent link expires in 7 days<br />
                  • Your parent can contact us at academyfunfinity@gmail.com
                </p>
              </div>

              {/* Action */}
              <button
                onClick={handleReturnToVerification}
                className="w-full font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-xl transition-colors shadow-lg text-sm sm:text-base"
                style={{ background: primary, color: theme.neutral[0] }}
              >
                Return to Home
              </button>

              {/* Footer Info */}
              <div className="mt-4 sm:mt-6 pt-4 sm:pt-6" style={{ borderTop: `1px solid ${theme.neutral[200]}` }}>
                <div className="flex items-center justify-center gap-2 text-xs" style={{ color: theme.neutral[500] }}>
                  <Lock className="w-3 h-3" />
                  <span className="text-xs sm:text-sm">Questions? Contact us at academyfunfinity@gmail.com</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
