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
  const [birthDay, setBirthDay] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [error, setError] = useState("");
  const [step, setStep] = useState<AgeGateStep>("verification");
  const [parentEmail, setParentEmail] = useState("");
  const [childName, setChildName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lastAttemptTime, setLastAttemptTime] = useState(0);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const currentDay = new Date().getDate();
  // Pick theme colors based on the active app theme
  const { theme: activeTheme } = useTheme();
  const theme = productionThemes[activeTheme] || productionThemes.light;
  const primary = theme.primary[500];
  const accent = theme.primary[400] || theme.primary[600];
  const highlight = theme.primary[300] || theme.primary[700];

  useEffect(() => {
    // Check if user has already verified
    const verified = localStorage.getItem('age-verified');
    const verifiedBirthDate = localStorage.getItem('age-verified-birthdate');
    
    if (verified === 'true' && verifiedBirthDate) {
      const birthDate = new Date(verifiedBirthDate);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear() - 
                 (today.getMonth() < birthDate.getMonth() || 
                  (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate()) ? 1 : 0);
      
      if (age >= MIN_AGE) {
        setIsVerified(true);
      } else {
        // User was previously verified but is now under age (edge case)
        localStorage.removeItem('age-verified');
        localStorage.removeItem('age-verified-birthdate');
        localStorage.removeItem('age-verified-device-id');
      }
    }
    
    // Load rate limiting data
    const storedAttempts = localStorage.getItem('age-gate-attempts');
    const storedLastAttempt = localStorage.getItem('age-gate-last-attempt');
    if (storedAttempts) setAttempts(parseInt(storedAttempts));
    if (storedLastAttempt) setLastAttemptTime(parseInt(storedLastAttempt));
  }, [currentYear, currentMonth, currentDay]);

  // Generate device fingerprint
  const generateDeviceFingerprint = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return 'unknown';
    
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('FunFinity Academy', 2, 15);
    
    const fingerprint = canvas.toDataURL() + 
                       navigator.userAgent + 
                       navigator.language + 
                       screen.colorDepth + 
                       new Date().getTimezoneOffset();
    
    return btoa(fingerprint).substring(0, 32);
  };

  const handleVerification = () => {
    setError("");

    // Rate limiting check
    const now = Date.now();
    const timeSinceLastAttempt = now - lastAttemptTime;
    const cooldownPeriod = 60000; // 1 minute cooldown
    
    if (attempts >= 5 && timeSinceLastAttempt < cooldownPeriod) {
      setIsRateLimited(true);
      const remainingTime = Math.ceil((cooldownPeriod - timeSinceLastAttempt) / 1000);
      setError(`Too many attempts. Please wait ${remainingTime} seconds before trying again.`);
      return;
    }
    
    if (timeSinceLastAttempt >= cooldownPeriod) {
      // Reset attempts after cooldown
      setAttempts(0);
      setLastAttemptTime(now);
    }

    // Validate all date fields
    if (!birthDay || !birthMonth || !birthYear) {
      setError("Please enter your complete birth date (day, month, and year)");
      return;
    }

    const day = parseInt(birthDay);
    const month = parseInt(birthMonth);
    const year = parseInt(birthYear);

    // Enhanced realistic validation
    if (isNaN(day) || isNaN(month) || isNaN(year)) {
      setError("Please enter valid numbers for your birth date");
      return;
    }

    if (day < 1 || day > 31) {
      setError("Please enter a valid day (1-31)");
      return;
    }

    if (month < 1 || month > 12) {
      setError("Please enter a valid month (1-12)");
      return;
    }

    if (year < 1920 || year > currentYear) {
      setError(`Please enter a valid birth year between 1920 and ${currentYear}`);
      return;
    }

    // Check if the date is valid (e.g., no February 30)
    const inputDate = new Date(year, month - 1, day);
    if (inputDate.getDate() !== day || inputDate.getMonth() !== month - 1 || inputDate.getFullYear() !== year) {
      setError("Please enter a valid calendar date");
      return;
    }

    // Calculate exact age
    const today = new Date();
    const birthDate = new Date(year, month - 1, day);
    const age = today.getFullYear() - birthDate.getFullYear() - 
               (today.getMonth() < birthDate.getMonth() || 
                (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate()) ? 1 : 0);

    // Prevent obviously fake entries (e.g., future dates, unrealistic ages)
    if (age > 120) {
      setError("Please enter a realistic birth date");
      setAttempts(prev => prev + 1);
      setLastAttemptTime(now);
      localStorage.setItem('age-gate-attempts', String(attempts + 1));
      localStorage.setItem('age-gate-last-attempt', String(now));
      return;
    }

    // Check for suspicious patterns in day/month/year
    const dayStr = day.toString();
    const monthStr = month.toString();
    const yearStr = year.toString();
    
    // Detect repeated patterns (e.g., 11/11/1111, 01/01/2000)
    if ((/^(\d)\1+$/.test(dayStr) && /^(\d)\1+$/.test(monthStr)) || 
        /^(01|11|12)$/.test(dayStr) && /^(01|11|12)$/.test(monthStr) && /^(2000|2001|1990|1995|1985)$/.test(yearStr)) {
      setError("Please enter your actual birth date");
      setAttempts(prev => prev + 1);
      setLastAttemptTime(now);
      localStorage.setItem('age-gate-attempts', String(attempts + 1));
      localStorage.setItem('age-gate-last-attempt', String(now));
      return;
    }

    // Check for sequential patterns (e.g., 01/02/2003)
    if ((day === 1 && month === 2 && year === 2003) ||
        (day === 12 && month === 12 && year === 2012) ||
        (day === 1 && month === 1 && year === 2000)) {
      setError("Please verify your actual birth date");
      setAttempts(prev => prev + 1);
      setLastAttemptTime(now);
      localStorage.setItem('age-gate-attempts', String(attempts + 1));
      localStorage.setItem('age-gate-last-attempt', String(now));
      return;
    }

    // Check for common test dates
    if (age < 18 && (day === 1 && month === 1)) {
      setError("Please verify your actual birth date");
      setAttempts(prev => prev + 1);
      setLastAttemptTime(now);
      localStorage.setItem('age-gate-attempts', String(attempts + 1));
      localStorage.setItem('age-gate-last-attempt', String(now));
      return;
    }

    if (age < MIN_AGE) {
      // User is under 13, trigger parental consent flow
      setStep("parental_consent");
      setAttempts(prev => prev + 1);
      setLastAttemptTime(now);
      localStorage.setItem('age-gate-attempts', String(attempts + 1));
      localStorage.setItem('age-gate-last-attempt', String(now));
      return;
    }

    // User is 13 or older, allow access with enhanced security
    const deviceId = generateDeviceFingerprint();
    localStorage.setItem('age-verified', 'true');
    localStorage.setItem('age-verified-birthdate', birthDate.toISOString());
    localStorage.setItem('age-verified-timestamp', Date.now().toString());
    localStorage.setItem('age-verified-age', age.toString());
    localStorage.setItem('age-verified-device-id', deviceId);
    localStorage.setItem('age-gate-attempts', '0'); // Reset on success
    localStorage.setItem('age-gate-last-attempt', '0');
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
      const birthDateStr = `${birthYear}-${birthMonth.padStart(2, '0')}-${birthDay.padStart(2, '0')}`;
      const resp = await requestParentalConsent(childName.trim(), parentEmail.trim(), birthDateStr);
      // Store that parental consent was requested
      localStorage.setItem('parental-consent-requested', 'true');
      localStorage.setItem('parental-consent-email', parentEmail);
      localStorage.setItem('child-name', childName.trim());
      localStorage.setItem('child-birthdate', birthDateStr);
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
    setBirthDay("");
    setBirthMonth("");
    setBirthYear("");
    setError("");
    setIsRateLimited(false);
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
                  <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2" style={{ color: theme.neutral[900] }}>
                    What is your date of birth?
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="number"
                        value={birthDay}
                        onChange={(e) => setBirthDay(e.target.value)}
                        placeholder="DD"
                        min="1"
                        max="31"
                        className="w-full pl-3 pr-3 py-2 sm:py-3 rounded-xl focus:outline-none focus:ring-2 transition-colors text-sm sm:text-base text-center"
                        style={{ background: theme.neutral[50], border: `2px solid ${theme.neutral[300]}`, color: theme.neutral[900] }}
                        aria-label="Birth day"
                        aria-invalid={!!error}
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs" style={{ color: theme.neutral[400] }}>Day</span>
                    </div>
                    <div className="relative flex-1">
                      <input
                        type="number"
                        value={birthMonth}
                        onChange={(e) => setBirthMonth(e.target.value)}
                        placeholder="MM"
                        min="1"
                        max="12"
                        className="w-full pl-3 pr-3 py-2 sm:py-3 rounded-xl focus:outline-none focus:ring-2 transition-colors text-sm sm:text-base text-center"
                        style={{ background: theme.neutral[50], border: `2px solid ${theme.neutral[300]}`, color: theme.neutral[900] }}
                        aria-label="Birth month"
                        aria-invalid={!!error}
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs" style={{ color: theme.neutral[400] }}>Month</span>
                    </div>
                    <div className="relative flex-1">
                      <input
                        type="number"
                        value={birthYear}
                        onChange={(e) => setBirthYear(e.target.value)}
                        placeholder="YYYY"
                        min="1920"
                        max={currentYear}
                        className="w-full pl-3 pr-3 py-2 sm:py-3 rounded-xl focus:outline-none focus:ring-2 transition-colors text-sm sm:text-base text-center"
                        style={{ background: theme.neutral[50], border: `2px solid ${theme.neutral[300]}`, color: theme.neutral[900] }}
                        aria-label="Birth year"
                        aria-invalid={!!error}
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs" style={{ color: theme.neutral[400] }}>Year</span>
                    </div>
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

                {isRateLimited && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl p-3 sm:p-4"
                    style={{ background: `${theme.warning}22`, borderColor: `${theme.warning}44` }}
                    role="alert"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: theme.warning }} />
                      <p className="text-xs sm:text-sm text-center" style={{ color: theme.warning }}>
                        Security measure activated. Multiple failed attempts detected. Please wait before trying again.
                      </p>
                    </div>
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
