import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, ShieldCheck, AlertTriangle, Mail, ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

interface AgeVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAgeVerified: (isUnder13: boolean, dateOfBirth?: Date) => void;
  onParentalConsentRequest?: (parentEmail: string) => void;
}

export default function AgeVerificationModal({
  isOpen,
  onClose,
  onAgeVerified,
  onParentalConsentRequest,
}: AgeVerificationModalProps) {
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [showParentalConsent, setShowParentalConsent] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const calculateAge = (dob: string): number => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const handleAgeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!dateOfBirth) {
      setError("Please enter your date of birth");
      return;
    }

    const age = calculateAge(dateOfBirth);
    
    if (age < 0) {
      setError("Invalid date of birth");
      return;
    }

    if (age < 13) {
      // COPPA compliance: User is under 13, require parental consent
      setShowParentalConsent(true);
    } else {
      // User is 13 or older, can proceed
      onAgeVerified(false, new Date(dateOfBirth));
      onClose();
    }
  };

  const handleParentalConsentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!parentEmail) {
      setError("Please enter a parent's email address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(parentEmail)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);
    
    // Simulate sending parental consent request
    setTimeout(() => {
      onParentalConsentRequest?.(parentEmail);
      onAgeVerified(true, new Date(dateOfBirth));
      setIsSubmitting(false);
      onClose();
    }, 1500);
  };

  const handleCancel = () => {
    setShowParentalConsent(false);
    setParentEmail("");
    setError("");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <Card className="w-full max-w-md shadow-2xl border-border/50 overflow-hidden">
              <div className="relative">
                {/* Header */}
                <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-6 border-b border-border/30">
                  <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <ShieldCheck className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground">
                        {showParentalConsent ? "Parental Consent Required" : "Age Verification"}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        COPPA Compliance Required
                      </p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {!showParentalConsent ? (
                    <form onSubmit={handleAgeSubmit} className="space-y-4">
                      <div className="bg-secondary/30 border border-border/30 rounded-lg p-4 mb-4">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                          <div className="text-sm text-muted-foreground">
                            <p className="font-medium text-foreground mb-1">COPPA Compliance Notice</p>
                            <p>
                              To comply with the Children's Online Privacy Protection Act (COPPA), 
                              we must verify your age before you can create an account.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="dob" className="text-sm font-semibold">
                          Date of Birth
                        </Label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="dob"
                            type="date"
                            value={dateOfBirth}
                            onChange={(e) => setDateOfBirth(e.target.value)}
                            max={new Date().toISOString().split('T')[0]}
                            className="pl-10"
                            required
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Your date of birth is used solely for age verification and is not stored.
                        </p>
                      </div>

                      {error && (
                        <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                          {error}
                        </div>
                      )}

                      <div className="flex gap-3 pt-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={onClose}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button type="submit" className="flex-1 gap-2">
                          Continue
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <form onSubmit={handleParentalConsentSubmit} className="space-y-4">
                      <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mb-4">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                          <div className="text-sm text-muted-foreground">
                            <p className="font-medium text-foreground mb-1">Under 13 Detected</p>
                            <p>
                              Based on your date of birth, you are under 13 years old. 
                              We require verifiable parental consent before you can create an account.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="parentEmail" className="text-sm font-semibold">
                          Parent's Email Address
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="parentEmail"
                            type="email"
                            placeholder="parent@example.com"
                            value={parentEmail}
                            onChange={(e) => setParentEmail(e.target.value)}
                            className="pl-10"
                            required
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          We'll send a consent request to your parent's email address.
                        </p>
                      </div>

                      {error && (
                        <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                          {error}
                        </div>
                      )}

                      <div className="flex gap-3 pt-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleCancel}
                          disabled={isSubmitting}
                          className="flex-1"
                        >
                          Back
                        </Button>
                        <Button 
                          type="submit" 
                          className="flex-1 gap-2"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? "Sending..." : "Request Consent"}
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </form>
                  )}
                </div>

                {/* Footer */}
                <div className="bg-secondary/30 border-t border-border/30 p-4">
                  <div className="text-xs text-muted-foreground text-center">
                    <p className="mb-1">
                      <strong>FunFinity Academy Safety & Platform Guidelines</strong>
                    </p>
                    <p>
                      By continuing, you agree to our Age Requirements, Guardian Authorization, 
                      Communication Codes, and Zero-Tolerance policies.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
