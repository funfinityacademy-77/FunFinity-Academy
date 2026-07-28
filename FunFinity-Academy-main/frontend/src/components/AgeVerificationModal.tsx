import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Shield, Calendar, User, Mail, Phone, CheckCircle2, AlertTriangle, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ParentalConsentData {
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  relationship: string;
  consentGiven: boolean;
  safetyGuidelinesAccepted: boolean;
}

interface AgeVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: (isMinor: boolean, consentData?: ParentalConsentData) => void;
}

const STORAGE_KEY = "funfinity_age_verified";
const CONSENT_STORAGE_KEY = "funfinity_parental_consent";

export function AgeVerificationModal({ isOpen, onClose, onVerified }: AgeVerificationModalProps) {
  const [step, setStep] = useState<"dob" | "consent" | "success">("dob");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [age, setAge] = useState<number | null>(null);
  const [isMinor, setIsMinor] = useState(false);
  const [consentData, setConsentData] = useState<ParentalConsentData>({
    parentName: "",
    parentEmail: "",
    parentPhone: "",
    relationship: "parent",
    consentGiven: false,
    safetyGuidelinesAccepted: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if already verified
  useEffect(() => {
    const verified = localStorage.getItem(STORAGE_KEY);
    if (verified === "true") {
      onVerified(false);
      onClose();
    }
  }, [onVerified, onClose]);

  const calculateAge = (dob: string): number | null => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let calculatedAge = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      calculatedAge--;
    }
    
    return calculatedAge;
  };

  const handleDOBSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!dateOfBirth) {
      newErrors.dateOfBirth = "Date of birth is required";
    } else {
      const calculatedAge = calculateAge(dateOfBirth);
      if (calculatedAge === null || calculatedAge < 0 || calculatedAge > 120) {
        newErrors.dateOfBirth = "Please enter a valid date of birth";
      } else {
        setAge(calculatedAge);
        setIsMinor(calculatedAge < 13);
        
        if (calculatedAge < 13) {
          setStep("consent");
        } else {
          localStorage.setItem(STORAGE_KEY, "true");
          onVerified(false);
          onClose();
        }
      }
    }

    setErrors(newErrors);
  };

  const handleConsentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!consentData.parentName.trim()) {
      newErrors.parentName = "Parent/guardian name is required";
    }
    if (!consentData.parentEmail.trim()) {
      newErrors.parentEmail = "Parent email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(consentData.parentEmail)) {
      newErrors.parentEmail = "Please enter a valid email address";
    }
    if (!consentData.parentPhone.trim()) {
      newErrors.parentPhone = "Parent phone number is required";
    }
    if (!consentData.safetyGuidelinesAccepted) {
      newErrors.safetyGuidelinesAccepted = "You must accept the safety guidelines";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsSubmitting(true);
      
      // Simulate API call to store consent
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Store consent locally
      localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify({
        ...consentData,
        childDOB: dateOfBirth,
        timestamp: new Date().toISOString(),
      }));
      localStorage.setItem(STORAGE_KEY, "true");
      
      setIsSubmitting(false);
      setStep("success");
      
      setTimeout(() => {
        onVerified(true, consentData);
        onClose();
      }, 2000);
    }
  };

  const handleInputChange = (field: keyof ParentalConsentData, value: string | boolean) => {
    setConsentData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="age-verification-title"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-background/80 backdrop-blur-md" />
          
          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25 }}
            className="relative z-10 w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="glass-card-heavy border-2 border-border/50 p-6 sm:p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue/20 to-orange/20 border border-blue/30 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-blue" />
                  </div>
                  <div>
                    <h2 id="age-verification-title" className="font-display text-xl font-bold text-foreground">
                      Age Verification
                    </h2>
                    <p className="text-sm text-muted-foreground">COPPA Compliance</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Progress Steps */}
              <div className="flex items-center gap-2 mb-6">
                <div className={`flex-1 h-1 rounded-full transition-colors ${step === "dob" ? "bg-primary" : "bg-primary"}`} />
                <div className={`flex-1 h-1 rounded-full transition-colors ${step === "consent" || step === "success" ? "bg-primary" : "bg-secondary"}`} />
                <div className={`flex-1 h-1 rounded-full transition-colors ${step === "success" ? "bg-primary" : "bg-secondary"}`} />
              </div>

              {/* Step Content */}
              <AnimatePresence mode="wait">
                {step === "dob" && (
                  <motion.div
                    key="dob"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="mb-6">
                      <div className="flex items-start gap-3 p-4 rounded-xl bg-blue/10 border border-blue/20 mb-4">
                        <AlertTriangle className="w-5 h-5 text-blue mt-0.5 shrink-0" />
                        <p className="text-sm text-foreground/90">
                          To comply with COPPA regulations, we need to verify your age before you can create an account.
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        Please enter your date of birth to continue.
                      </p>
                    </div>

                    <form onSubmit={handleDOBSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="dob" className="text-sm font-medium mb-2 block">
                          Date of Birth
                        </Label>
                        <Input
                          id="dob"
                          type="date"
                          value={dateOfBirth}
                          onChange={(e) => setDateOfBirth(e.target.value)}
                          max={new Date().toISOString().split('T')[0]}
                          className={`focus:outline-none focus:ring-2 focus:ring-primary ${errors.dateOfBirth ? 'border-red-500' : ''}`}
                          aria-invalid={!!errors.dateOfBirth}
                          aria-describedby={errors.dateOfBirth ? "dob-error" : undefined}
                        />
                        {errors.dateOfBirth && (
                          <p id="dob-error" className="text-sm text-red-500 mt-1" role="alert">
                            {errors.dateOfBirth}
                          </p>
                        )}
                      </div>

                      <Button
                        type="submit"
                        variant="hero"
                        size="lg"
                        className="w-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                        disabled={!dateOfBirth}
                      >
                        Continue
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </form>
                  </motion.div>
                )}

                {step === "consent" && (
                  <motion.div
                    key="consent"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="mb-6">
                      <div className="flex items-start gap-3 p-4 rounded-xl bg-orange/10 border border-orange/20 mb-4">
                        <User className="w-5 h-5 text-orange mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm text-foreground/90 font-medium mb-1">
                            Parental Consent Required
                          </p>
                          <p className="text-xs text-foreground/70">
                            Since you are under 13, we need verifiable parental consent before you can create an account.
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        Please have your parent or guardian complete the form below.
                      </p>
                    </div>

                    <form onSubmit={handleConsentSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="parentName" className="text-sm font-medium mb-2 block">
                          Parent/Guardian Name
                        </Label>
                        <Input
                          id="parentName"
                          type="text"
                          value={consentData.parentName}
                          onChange={(e) => handleInputChange("parentName", e.target.value)}
                          placeholder="Full legal name"
                          className={`focus:outline-none focus:ring-2 focus:ring-primary ${errors.parentName ? 'border-red-500' : ''}`}
                          aria-invalid={!!errors.parentName}
                        />
                        {errors.parentName && (
                          <p className="text-sm text-red-500 mt-1" role="alert">
                            {errors.parentName}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="parentEmail" className="text-sm font-medium mb-2 block">
                          Parent Email
                        </Label>
                        <Input
                          id="parentEmail"
                          type="email"
                          value={consentData.parentEmail}
                          onChange={(e) => handleInputChange("parentEmail", e.target.value)}
                          placeholder="parent@example.com"
                          className={`focus:outline-none focus:ring-2 focus:ring-primary ${errors.parentEmail ? 'border-red-500' : ''}`}
                          aria-invalid={!!errors.parentEmail}
                        />
                        {errors.parentEmail && (
                          <p className="text-sm text-red-500 mt-1" role="alert">
                            {errors.parentEmail}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="parentPhone" className="text-sm font-medium mb-2 block">
                          Parent Phone Number
                        </Label>
                        <Input
                          id="parentPhone"
                          type="tel"
                          value={consentData.parentPhone}
                          onChange={(e) => handleInputChange("parentPhone", e.target.value)}
                          placeholder="(555) 123-4567"
                          className={`focus:outline-none focus:ring-2 focus:ring-primary ${errors.parentPhone ? 'border-red-500' : ''}`}
                          aria-invalid={!!errors.parentPhone}
                        />
                        {errors.parentPhone && (
                          <p className="text-sm text-red-500 mt-1" role="alert">
                            {errors.parentPhone}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="relationship" className="text-sm font-medium mb-2 block">
                          Relationship
                        </Label>
                        <select
                          id="relationship"
                          value={consentData.relationship}
                          onChange={(e) => handleInputChange("relationship", e.target.value)}
                          className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="parent">Parent</option>
                          <option value="guardian">Legal Guardian</option>
                          <option value="teacher">Teacher</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      {/* Safety Guidelines Checkbox */}
                      <div className="p-4 rounded-xl bg-secondary/50 border border-border/50">
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            id="safetyGuidelines"
                            checked={consentData.safetyGuidelinesAccepted}
                            onChange={(e) => handleInputChange("safetyGuidelinesAccepted", e.target.checked)}
                            className="mt-1 w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary"
                            aria-invalid={!!errors.safetyGuidelinesAccepted}
                          />
                          <div className="flex-1">
                            <Label htmlFor="safetyGuidelines" className="text-sm font-medium cursor-pointer">
                              I have read and accept the Safety & Platform Guidelines
                            </Label>
                            <p className="text-xs text-muted-foreground mt-1">
                              This includes understanding our community guidelines, privacy policy, and terms of service.
                            </p>
                          </div>
                        </div>
                        {errors.safetyGuidelinesAccepted && (
                          <p className="text-sm text-red-500 mt-2" role="alert">
                            {errors.safetyGuidelinesAccepted}
                          </p>
                        )}
                      </div>

                      <Button
                        type="submit"
                        variant="hero"
                        size="lg"
                        className="w-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Processing..." : "Submit Consent"}
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </form>
                  </motion.div>
                )}

                {step === "success" && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4 }}
                    className="text-center py-8"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.2, type: "spring" }}
                      className="w-20 h-20 rounded-full bg-gradient-to-br from-green/20 to-blue/20 border-2 border-green/30 flex items-center justify-center mx-auto mb-6"
                    >
                      <CheckCircle2 className="w-10 h-10 text-green-500" />
                    </motion.div>

                    <h3 className="font-display text-2xl font-bold mb-3">
                      Verification Complete
                    </h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      {isMinor 
                        ? "Parental consent has been verified. You can now create your account."
                        : "Age verification complete. You can now create your account."
                      }
                    </p>

                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                      <Shield className="w-4 h-4" />
                      <span>COPPA Compliant</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
