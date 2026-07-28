import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Calendar, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const MINIMUM_AGE = 13;
const COPPA_AGE = 13;
const AGE_GATE_STORAGE_KEY = 'funfinity-age-verified';
const AGE_GATE_TIMESTAMP_KEY = 'funfinity-age-verified-timestamp';

interface AgeGateProps {
  onVerified: () => void;
  onParentalConsentRequired: () => void;
}

export function AgeGate({ onVerified, onParentalConsentRequired }: AgeGateProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Check if user has already verified their age
    const isVerified = localStorage.getItem(AGE_GATE_STORAGE_KEY);
    const timestamp = localStorage.getItem(AGE_GATE_TIMESTAMP_KEY);
    
    // Re-verify every 30 days for compliance
    if (isVerified && timestamp) {
      const verificationDate = new Date(timestamp);
      const daysSinceVerification = (Date.now() - verificationDate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysSinceVerification < 30) {
        onVerified();
        return;
      }
    }
    
    setIsOpen(true);
  }, [onVerified]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsProcessing(true);

    try {
      if (!dateOfBirth) {
        setError('Please enter your date of birth');
        setIsProcessing(false);
        return;
      }

      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      
      if (birthDate > today) {
        setError('Date of birth cannot be in the future');
        setIsProcessing(false);
        return;
      }

      if (birthDate < new Date('1900-01-01')) {
        setError('Please enter a valid date of birth');
        setIsProcessing(false);
        return;
      }

      const age = calculateAge(dateOfBirth);

      if (age < COPPA_AGE) {
        // User is under 13, require parental consent
        localStorage.setItem(AGE_GATE_STORAGE_KEY, 'pending_parental_consent');
        localStorage.setItem(AGE_GATE_TIMESTAMP_KEY, Date.now().toString());
        setIsOpen(false);
        onParentalConsentRequired();
        return;
      }

      // User is 13 or older, allow access
      localStorage.setItem(AGE_GATE_STORAGE_KEY, 'verified');
      localStorage.setItem(AGE_GATE_TIMESTAMP_KEY, Date.now().toString());
      setIsOpen(false);
      onVerified();
    } catch (err) {
      setError('Invalid date format. Please use MM/DD/YYYY');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleParentalConsent = () => {
    setIsOpen(false);
    onParentalConsentRequired();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md border-2 border-primary/20 bg-gradient-to-br from-background to-primary/5">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-full bg-primary/10">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <DialogTitle className="text-2xl font-bold">Age Verification Required</DialogTitle>
          </div>
          <DialogDescription className="text-base">
            To comply with COPPA and GDPR regulations, we need to verify your age before you can access our platform.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <label htmlFor="dob" className="text-sm font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              Date of Birth
            </label>
            <Input
              id="dob"
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="text-base"
              required
            />
            <p className="text-xs text-muted-foreground">
              You must be at least {MINIMUM_AGE} years old to use this platform.
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20"
            >
              <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </motion.div>
          )}

          <div className="flex flex-col gap-3">
            <Button
              type="submit"
              className="w-full"
              disabled={isProcessing}
            >
              {isProcessing ? 'Verifying...' : 'Verify Age'}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleParentalConsent}
            >
              I am under 13 (Parental Consent Required)
            </Button>
          </div>

          <div className="p-4 rounded-lg bg-muted/50 border border-border">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div className="text-xs text-muted-foreground space-y-1">
                <p className="font-medium">Your privacy matters</p>
                <p>We comply with COPPA and GDPR regulations. Your information is encrypted and never shared with third parties without consent.</p>
              </div>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
