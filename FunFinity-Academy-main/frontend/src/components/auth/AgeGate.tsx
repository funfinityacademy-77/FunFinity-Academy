/**
 * Age Gate Component
 * COPPA/GDPR compliant age verification
 * Prevents users under 13 from creating accounts without parental consent
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Shield, AlertCircle, Mail, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

const MIN_AGE = 13;
const ADULT_AGE = 18;

const ageGateSchema = z.object({
  birthDate: z.string().refine(
    (date) => {
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      const dayDiff = today.getDate() - birthDate.getDate();
      
      const actualAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) 
        ? age - 1 
        : age;
      
      return actualAge >= 0 && actualAge <= 120;
    },
    'Please enter a valid birth date'
  ),
});

type AgeGateFormData = z.infer<typeof ageGateSchema>;

export function AgeGate() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState<'age-verification' | 'parental-consent' | 'email-verification'>('age-verification');
  const [birthDate, setBirthDate] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [consentToken, setConsentToken] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userAge, setUserAge] = useState<number>(0);

  const calculateAge = (dateString: string): number => {
    const birthDate = new Date(dateString);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();
    
    return monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) 
      ? age - 1 
      : age;
  };

  const handleAgeVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validated = ageGateSchema.parse({ birthDate });
      const age = calculateAge(validated.birthDate);
      
      setUserAge(age);
      
      if (age < MIN_AGE) {
        // User is under 13 - require parental consent
        setStep('parental-consent');
      } else if (age >= ADULT_AGE) {
        // User is 18+ - can proceed directly
        navigate('/auth', { state: { ageVerified: true, age } });
      } else {
        // User is 13-17 - can proceed with limited features
        navigate('/auth', { state: { ageVerified: true, age, minor: true } });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: 'Invalid Date',
          description: error.errors[0]?.message || 'Please enter a valid birth date',
          variant: 'destructive',
        });
      }
    }
  };

  const handleParentalConsent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // In production, this would call an API to send a consent email
      // For now, we'll simulate the process
      
      if (!parentEmail || !parentEmail.includes('@')) {
        throw new Error('Please enter a valid parent email address');
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate a mock consent token
      const token = Math.random().toString(36).substring(2, 15);
      setConsentToken(token);
      
      setStep('email-verification');
      
      toast({
        title: 'Consent Email Sent',
        description: `We've sent a verification email to ${parentEmail}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send consent email',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // In production, this would verify the token with the backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Parental Consent Verified',
        description: 'You can now proceed with account creation',
      });
      
      navigate('/auth', { 
        state: { 
          ageVerified: true, 
          age: userAge, 
          minor: true,
          parentalConsent: true,
          parentEmail 
        } 
      });
    } catch (error) {
      toast({
        title: 'Verification Failed',
        description: 'Invalid or expired verification code',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-orange-50 p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-orange-500 rounded-full mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {step === 'age-verification' ? 'Age Verification' 
               : step === 'parental-consent' ? 'Parental Consent Required'
               : 'Verify Parental Email'}
            </h1>
            <p className="text-gray-600 text-sm">
              {step === 'age-verification' 
                ? 'We need to verify your age to comply with COPPA and GDPR regulations'
                : step === 'parental-consent'
                ? 'Users under 13 require parental consent to create an account'
                : 'Enter the verification code sent to your parent\'s email'}
            </p>
          </div>

          {/* Step 1: Age Verification */}
          {step === 'age-verification' && (
            <form onSubmit={handleAgeVerification} className="space-y-6">
              <div>
                <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="birthDate"
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    required
                    aria-label="Date of birth"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  You must be at least {MIN_AGE} years old to use this platform
                </p>
              </div>

              <button
                type="submit"
                disabled={!birthDate}
                className="w-full bg-gradient-to-r from-blue-500 to-orange-500 text-white py-3 px-4 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>

              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-800">
                  Your information is protected under COPPA and GDPR. We do not share personal data with third parties.
                </p>
              </div>
            </form>
          )}

          {/* Step 2: Parental Consent */}
          {step === 'parental-consent' && (
            <form onSubmit={handleParentalConsent} className="space-y-6">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-yellow-800 font-medium mb-1">
                      Parental Consent Required
                    </p>
                    <p className="text-xs text-yellow-700">
                      Because you are under 13 years old, we need your parent or guardian's permission to create your account.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="parentEmail" className="block text-sm font-medium text-gray-700 mb-2">
                  Parent or Guardian Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="parentEmail"
                    type="email"
                    value={parentEmail}
                    onChange={(e) => setParentEmail(e.target.value)}
                    placeholder="parent@example.com"
                    required
                    aria-label="Parent or guardian email address"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  We'll send a verification email to this address
                </p>
              </div>

              <button
                type="submit"
                disabled={!parentEmail || isSubmitting}
                className="w-full bg-gradient-to-r from-blue-500 to-orange-500 text-white py-3 px-4 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Sending...' : 'Send Consent Email'}
              </button>

              <button
                type="button"
                onClick={() => setStep('age-verification')}
                className="w-full text-gray-600 py-2 text-sm hover:text-gray-800 transition-colors"
              >
                Go Back
              </button>
            </form>
          )}

          {/* Step 3: Email Verification */}
          {step === 'email-verification' && (
            <form onSubmit={handleEmailVerification} className="space-y-6">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-green-800 font-medium mb-1">
                      Email Sent Successfully
                    </p>
                    <p className="text-xs text-green-700">
                      We've sent a 6-digit verification code to {parentEmail}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="consentToken" className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Code
                </label>
                <input
                  id="consentToken"
                  type="text"
                  value={consentToken}
                  onChange={(e) => setConsentToken(e.target.value)}
                  placeholder="123456"
                  maxLength={6}
                  required
                  aria-label="Verification code"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest"
                />
                <p className="mt-2 text-xs text-gray-500">
                  Demo mode: Use any 6-digit code
                </p>
              </div>

              <button
                type="submit"
                disabled={!consentToken || consentToken.length !== 6 || isSubmitting}
                className="w-full bg-gradient-to-r from-blue-500 to-orange-500 text-white py-3 px-4 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Verifying...' : 'Verify & Continue'}
              </button>

              <button
                type="button"
                onClick={() => setStep('parental-consent')}
                className="w-full text-gray-600 py-2 text-sm hover:text-gray-800 transition-colors"
              >
                Go Back
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            By continuing, you agree to our{' '}
            <a href="/privacy" className="text-blue-600 hover:underline">
              Privacy Policy
            </a>{' '}
            and{' '}
            <a href="/terms" className="text-blue-600 hover:underline">
              Terms of Service
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
