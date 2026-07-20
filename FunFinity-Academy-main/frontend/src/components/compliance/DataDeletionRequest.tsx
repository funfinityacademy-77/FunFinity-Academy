import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Shield, AlertTriangle, CheckCircle, Clock, FileText, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';

type DeletionType = 'full_deletion' | 'anonymization' | 'partial';

interface DataDeletionRequestProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
}

export function DataDeletionRequest({ isOpen, onClose, userId }: DataDeletionRequestProps) {
  const [deletionType, setDeletionType] = useState<DeletionType>('anonymization');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [requestSubmitted, setRequestSubmitted] = useState(false);

  const deletionOptions = [
    {
      value: 'anonymization' as DeletionType,
      title: 'Anonymize My Data',
      description: 'Your personal information will be replaced with anonymous data. Educational progress will be preserved for analytics.',
      icon: Shield,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20'
    },
    {
      value: 'full_deletion' as DeletionType,
      title: 'Delete All Data',
      description: 'All your data will be permanently deleted, including educational progress. This action cannot be undone.',
      icon: Trash2,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/20'
    },
    {
      value: 'partial' as DeletionType,
      title: 'Delete Specific Data',
      description: 'Choose which types of data to delete while keeping your account active.',
      icon: FileText,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/20'
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    // In production, this would call your backend API
    const deletionRequest = {
      id: crypto.randomUUID(),
      userId: userId || 'current-user',
      requestType: deletionType,
      status: 'pending',
      requestedAt: new Date().toISOString(),
      reason
    };

    console.log('Data deletion request submitted:', deletionRequest);
    localStorage.setItem('funfinity-deletion-request', JSON.stringify(deletionRequest));

    setRequestSubmitted(true);
    setIsSubmitting(false);
  };

  const handleConfirm = () => {
    setIsConfirmed(true);
  };

  const handleReset = () => {
    setRequestSubmitted(false);
    setIsConfirmed(false);
    setDeletionType('anonymization');
    setReason('');
    onClose();
  };

  if (requestSubmitted) {
    return (
      <Dialog open={isOpen} onOpenChange={handleReset}>
        <DialogContent className="sm:max-w-md border-2 border-green-500/20 bg-gradient-to-br from-background to-green-500/5">
          <div className="flex flex-col items-center text-center space-y-4 py-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="p-4 rounded-full bg-green-500/10"
            >
              <CheckCircle className="w-12 h-12 text-green-500" />
            </motion.div>
            <DialogTitle className="text-2xl font-bold">Request Submitted</DialogTitle>
            <DialogDescription className="text-base">
              Your data deletion request has been submitted successfully. You will receive a confirmation email shortly.
            </DialogDescription>
            <Alert className="w-full bg-blue-500/10 border-blue-500/20">
              <Clock className="h-4 w-4 text-blue-500" />
              <AlertDescription className="text-sm">
                Your request will be processed within 30 days as required by GDPR regulations.
              </AlertDescription>
            </Alert>
            <Button onClick={handleReset} className="w-full">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl border-2 border-primary/20 bg-gradient-to-br from-background to-primary/5 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-full bg-primary/10">
              <Trash2 className="w-6 h-6 text-primary" />
            </div>
            <DialogTitle className="text-2xl font-bold">Data Deletion Request</DialogTitle>
          </div>
          <DialogDescription className="text-base">
            Exercise your right to be forgotten under GDPR Article 17. Choose how you want your data to be handled.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Deletion Type Selection */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Select Deletion Type</Label>
            <RadioGroup value={deletionType} onValueChange={(value) => setDeletionType(value as DeletionType)}>
              {deletionOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <div key={option.value} className="flex items-start gap-3 p-4 rounded-lg border-2 transition-all hover:bg-muted/50 cursor-pointer">
                    <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className={`w-5 h-5 ${option.color}`} />
                        <Label htmlFor={option.value} className="font-semibold cursor-pointer">
                          {option.title}
                        </Label>
                      </div>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                    </div>
                  </div>
                );
              })}
            </RadioGroup>
          </div>

          {/* Data Impact Warning */}
          <Alert className="bg-red-500/10 border-red-500/20">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-sm">
              <strong>Important:</strong> Once your request is processed, this action cannot be undone. Please ensure you have exported any data you wish to keep.
            </AlertDescription>
          </Alert>

          {/* What Will Be Deleted */}
          <div className="space-y-3 p-4 rounded-lg bg-muted/50 border border-border">
            <h4 className="font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              What will be {deletionType === 'anonymization' ? 'anonymized' : 'deleted'}:
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                <span>Personal profile information (name, email, phone)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                <span>Account preferences and settings</span>
              </li>
              {deletionType === 'full_deletion' && (
                <>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    <span>Course enrollments and progress</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    <span>Quiz submissions and results</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    <span>Learning analytics and history</span>
                  </li>
                </>
              )}
              {deletionType === 'anonymization' && (
                <>
                  <li className="flex items-start gap-2">
                    <Shield className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <span>Educational progress will be preserved for analytics (anonymized)</span>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Reason for Deletion */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Deletion (Optional)</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please let us know why you're requesting data deletion..."
              rows={3}
            />
          </div>

          {/* Confirmation */}
          {!isConfirmed ? (
            <Button
              type="button"
              onClick={handleConfirm}
              className="w-full"
              variant="destructive"
            >
              I Understand, Continue
            </Button>
          ) : (
            <>
              <Alert className="bg-yellow-500/10 border-yellow-500/20">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <AlertDescription className="text-sm">
                  <strong>Final Confirmation:</strong> You are about to submit a {deletionType.replace('_', ' ')} request. This action will be processed within 30 days.
                </AlertDescription>
              </Alert>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsConfirmed(false)}
                >
                  Go Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </Button>
              </div>
            </>
          )}

          {/* GDPR Information */}
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div className="text-xs text-muted-foreground space-y-1">
                <p className="font-medium">GDPR Article 17 - Right to be Forgotten</p>
                <p>You have the right to request the deletion of your personal data. We will process your request within 30 days as required by law. You may withdraw your request at any time before processing is complete.</p>
              </div>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
