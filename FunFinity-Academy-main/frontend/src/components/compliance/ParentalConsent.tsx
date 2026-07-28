import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, FileText, User, Mail, Phone, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface ParentalConsentProps {
  isOpen: boolean;
  onComplete: (consentData: ParentalConsentData) => void;
  onCancel: () => void;
}

export interface ParentalConsentData {
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  relationship: string;
  consentGiven: boolean;
  dataProcessingAgreement: boolean;
  marketingConsent: boolean;
  signature: string;
  signedAt: string;
}

export function ParentalConsent({ isOpen, onComplete, onCancel }: ParentalConsentProps) {
  const [formData, setFormData] = useState<ParentalConsentData>({
    parentName: '',
    parentEmail: '',
    parentPhone: '',
    relationship: '',
    consentGiven: false,
    dataProcessingAgreement: false,
    marketingConsent: false,
    signature: '',
    signedAt: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.parentName.trim()) {
      newErrors.parentName = 'Parent/guardian name is required';
    }

    if (!formData.parentEmail.trim()) {
      newErrors.parentEmail = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.parentEmail)) {
      newErrors.parentEmail = 'Invalid email format';
    }

    if (!formData.parentPhone.trim()) {
      newErrors.parentPhone = 'Phone number is required';
    }

    if (!formData.relationship.trim()) {
      newErrors.relationship = 'Relationship to child is required';
    }

    if (!formData.consentGiven) {
      newErrors.consentGiven = 'You must provide consent for your child to use this platform';
    }

    if (!formData.dataProcessingAgreement) {
      newErrors.dataProcessingAgreement = 'You must agree to the Data Processing Agreement';
    }

    if (!formData.signature.trim()) {
      newErrors.signature = 'Electronic signature is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (validateForm()) {
      const consentData: ParentalConsentData = {
        ...formData,
        signedAt: new Date().toISOString(),
      };

      // Store consent in localStorage for demo purposes
      localStorage.setItem('funfinity-parental-consent', JSON.stringify(consentData));
      
      onComplete(consentData);
    }

    setIsSubmitting(false);
  };

  const handleInputChange = (field: keyof ParentalConsentData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-2xl border-2 border-primary/20 bg-gradient-to-br from-background to-primary/5 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-full bg-primary/10">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <DialogTitle className="text-2xl font-bold">Parental Consent Required</DialogTitle>
          </div>
          <DialogDescription className="text-base">
            Your child is under 13 years old. Under COPPA regulations, we need your consent before they can use our platform.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Parent Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Parent/Guardian Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="parentName">Full Name *</Label>
                <Input
                  id="parentName"
                  value={formData.parentName}
                  onChange={(e) => handleInputChange('parentName', e.target.value)}
                  placeholder="John Doe"
                  className={errors.parentName ? 'border-destructive' : ''}
                />
                {errors.parentName && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.parentName}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="relationship">Relationship to Child *</Label>
                <Input
                  id="relationship"
                  value={formData.relationship}
                  onChange={(e) => handleInputChange('relationship', e.target.value)}
                  placeholder="Parent, Guardian, etc."
                  className={errors.relationship ? 'border-destructive' : ''}
                />
                {errors.relationship && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.relationship}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="parentEmail">Email Address *</Label>
                <Input
                  id="parentEmail"
                  type="email"
                  value={formData.parentEmail}
                  onChange={(e) => handleInputChange('parentEmail', e.target.value)}
                  placeholder="parent@example.com"
                  className={errors.parentEmail ? 'border-destructive' : ''}
                />
                {errors.parentEmail && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.parentEmail}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="parentPhone">Phone Number *</Label>
                <Input
                  id="parentPhone"
                  type="tel"
                  value={formData.parentPhone}
                  onChange={(e) => handleInputChange('parentPhone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className={errors.parentPhone ? 'border-destructive' : ''}
                />
                {errors.parentPhone && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.parentPhone}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Data Processing Agreement */}
          <div className="space-y-4 p-4 rounded-lg bg-muted/50 border border-border">
            <h3 className="font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Data Processing Agreement
            </h3>

            <div className="text-sm text-muted-foreground space-y-2 max-h-40 overflow-y-auto p-2 bg-background rounded">
              <p><strong>1. Data Collection:</strong> We collect only the minimum data necessary for educational purposes, including learning progress, quiz results, and basic profile information.</p>
              <p><strong>2. Data Usage:</strong> Your child's data will be used solely for providing educational services and improving our platform. It will never be sold to third parties.</p>
              <p><strong>3. Data Security:</strong> All data is encrypted at rest and in transit using industry-standard encryption (AES-256).</p>
              <p><strong>4. Parental Rights:</strong> You have the right to review, modify, or delete your child's data at any time by contacting our support team.</p>
              <p><strong>5. Data Retention:</strong> Data will be retained only as long as necessary for educational purposes or as required by law.</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="dataProcessingAgreement"
                  checked={formData.dataProcessingAgreement}
                  onCheckedChange={(checked) => handleInputChange('dataProcessingAgreement', checked as boolean)}
                  className={errors.dataProcessingAgreement ? 'border-destructive' : ''}
                />
                <Label htmlFor="dataProcessingAgreement" className="text-sm cursor-pointer">
                  I have read and agree to the Data Processing Agreement above *
                </Label>
              </div>
              {errors.dataProcessingAgreement && (
                <p className="text-xs text-destructive flex items-center gap-1 ml-7">
                  <AlertCircle className="w-3 h-3" />
                  {errors.dataProcessingAgreement}
                </p>
              )}

              <div className="flex items-start gap-3">
                <Checkbox
                  id="consentGiven"
                  checked={formData.consentGiven}
                  onCheckedChange={(checked) => handleInputChange('consentGiven', checked as boolean)}
                  className={errors.consentGiven ? 'border-destructive' : ''}
                />
                <Label htmlFor="consentGiven" className="text-sm cursor-pointer">
                  I give consent for my child to use FunFinity Academy's educational platform *
                </Label>
              </div>
              {errors.consentGiven && (
                <p className="text-xs text-destructive flex items-center gap-1 ml-7">
                  <AlertCircle className="w-3 h-3" />
                  {errors.consentGiven}
                </p>
              )}

              <div className="flex items-start gap-3">
                <Checkbox
                  id="marketingConsent"
                  checked={formData.marketingConsent}
                  onCheckedChange={(checked) => handleInputChange('marketingConsent', checked as boolean)}
                />
                <Label htmlFor="marketingConsent" className="text-sm cursor-pointer">
                  I consent to receive educational updates and promotional materials (optional)
                </Label>
              </div>
            </div>
          </div>

          {/* Electronic Signature */}
          <div className="space-y-2">
            <Label htmlFor="signature">Electronic Signature *</Label>
            <Input
              id="signature"
              value={formData.signature}
              onChange={(e) => handleInputChange('signature', e.target.value)}
              placeholder="Type your full name to sign"
              className={errors.signature ? 'border-destructive' : ''}
            />
            <p className="text-xs text-muted-foreground">
              By typing your name above, you electronically sign this consent form and agree to its terms.
            </p>
            {errors.signature && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.signature}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : 'Submit Consent'}
            </Button>
          </div>

          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div className="text-xs text-muted-foreground space-y-1">
                <p className="font-medium">Your consent is secure</p>
                <p>This consent form is encrypted and stored securely. You can withdraw consent at any time by contacting our support team or through your parental dashboard.</p>
              </div>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
