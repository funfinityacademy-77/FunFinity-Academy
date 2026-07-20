import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Send, X, ChevronRight, ChevronLeft, Sparkles, Heart, Trophy, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { apiClient } from '@/lib/api-client';

interface FeedbackData {
  rating: number;
  review: string;
  experience: string;
  recommendations: string[];
  wouldRecommend: boolean;
}

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<{
    data: FeedbackData;
    onUpdate: (data: Partial<FeedbackData>) => void;
    onNext: () => void;
    onPrevious: () => void;
    isLast: boolean;
    isFirst: boolean;
  }>;
}

export function ExperienceFeedback({ onComplete }: { onComplete: () => void }) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [feedbackData, setFeedbackData] = useState<FeedbackData>({
    rating: 0,
    review: '',
    experience: '',
    recommendations: [],
    wouldRecommend: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const updateFeedbackData = (updates: Partial<FeedbackData>) => {
    setFeedbackData(prev => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmitFeedback();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmitFeedback = async () => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      // Save the review to database
      await apiClient.post('/api/announcements', {
        type: 'review',
        title: 'User Experience Review',
        content: feedbackData.review,
        rating: feedbackData.rating,
        user_id: user.id,
        published: true,
        priority: 'medium',
        metadata: {
          experience: feedbackData.experience,
          recommendations: feedbackData.recommendations,
          wouldRecommend: feedbackData.wouldRecommend,
          completed_at: new Date().toISOString()
        }
      });

      // Mark user as having completed feedback
      await apiClient.put(`/api/users/${user.id}/profile`, {
        has_completed_feedback: true,
        feedback_completed_at: new Date().toISOString()
      });

      setShowCelebration(true);
      setTimeout(() => {
        onComplete();
      }, 3000);

    } catch (error) {
      console.error('Failed to submit feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const CurrentStepComponent = onboardingSteps[currentStep].component;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <AnimatePresence mode="wait">
        {showCelebration ? (
          <motion.div
            key="celebration"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="bg-background rounded-3xl p-8 max-w-md w-full text-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-16 h-16 mx-auto mb-4"
            >
              <Trophy className="w-full h-full text-yellow-400" />
            </motion.div>
            <h2 className="text-2xl font-bold mb-2">Thank You! 🎉</h2>
            <p className="text-muted-foreground mb-4">
              Your feedback helps us create a better learning experience for everyone.
            </p>
            <div className="flex justify-center gap-2 mb-4">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                </motion.div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Unlocking your premium experience...
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="feedback"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-background rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Share Your Experience</h2>
                <p className="text-muted-foreground">
                  Help us improve by sharing your thoughts
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.history.back()}
                className="rounded-full"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">
                  Step {currentStep + 1} of {onboardingSteps.length}
                </span>
                <span className="text-sm font-medium">
                  {Math.round(((currentStep + 1) / onboardingSteps.length) * 100)}%
                </span>
              </div>
              <Progress 
                value={((currentStep + 1) / onboardingSteps.length) * 100} 
                className="h-2"
              />
            </div>

            {/* Step Content */}
            <div className="mb-8">
              <CurrentStepComponent
                data={feedbackData}
                onUpdate={updateFeedbackData}
                onNext={handleNext}
                onPrevious={handlePrevious}
                isLast={currentStep === onboardingSteps.length - 1}
                isFirst={currentStep === 0}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Step 1: Rating Component
const RatingStep = ({ 
  data, 
  onUpdate, 
  onNext, 
  onPrevious, 
  isLast, 
  isFirst 
}: {
  data: FeedbackData;
  onUpdate: (data: Partial<FeedbackData>) => void;
  onNext: () => void;
  onPrevious: () => void;
  isLast: boolean;
  isFirst: boolean;
}) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center"
        >
          <Star className="w-8 h-8 text-primary" />
        </motion.div>
        <h3 className="text-xl font-semibold mb-2">How would you rate your experience?</h3>
        <p className="text-muted-foreground">
          Your rating helps us understand your satisfaction level
        </p>
      </div>

      <div className="flex justify-center gap-4">
        {[1, 2, 3, 4, 5].map((rating) => (
          <motion.button
            key={rating}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onUpdate({ rating })}
            className={`p-3 rounded-full transition-all ${
              data.rating >= rating
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            <Star className={`w-8 h-8 ${data.rating >= rating ? 'fill-current' : ''}`} />
          </motion.button>
        ))}
      </div>

      {data.rating > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <Badge variant="secondary" className="mb-4">
            {data.rating === 5 && 'Excellent!'}
            {data.rating === 4 && 'Great!'}
            {data.rating === 3 && 'Good'}
            {data.rating === 2 && 'Needs Improvement'}
            {data.rating === 1 && 'Poor'}
          </Badge>
        </motion.div>
      )}

      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={isFirst}
          className="rounded-full"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        <Button
          onClick={onNext}
          disabled={data.rating === 0}
          className="rounded-full"
        >
          {isLast ? 'Submit' : 'Next'}
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

// Step 2: Review Component
const ReviewStep = ({ 
  data, 
  onUpdate, 
  onNext, 
  onPrevious, 
  isLast, 
  isFirst 
}: {
  data: FeedbackData;
  onUpdate: (data: Partial<FeedbackData>) => void;
  onNext: () => void;
  onPrevious: () => void;
  isLast: boolean;
  isFirst: boolean;
}) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center"
        >
          <Heart className="w-8 h-8 text-primary" />
        </motion.div>
        <h3 className="text-xl font-semibold mb-2">Tell us more about your experience</h3>
        <p className="text-muted-foreground">
          What did you like most? What could be improved?
        </p>
      </div>

      <div className="space-y-4">
        <Textarea
          placeholder="Share your thoughts and experiences..."
          value={data.review}
          onChange={(e) => onUpdate({ review: e.target.value })}
          className="min-h-[120px] resize-none"
        />
        <div className="text-right">
          <span className="text-sm text-muted-foreground">
            {data.review.length}/500 characters
          </span>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={isFirst}
          className="rounded-full"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        <Button
          onClick={onNext}
          disabled={data.review.trim().length === 0}
          className="rounded-full"
        >
          {isLast ? 'Submit' : 'Next'}
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

// Step 3: Experience Component
const ExperienceStep = ({ 
  data, 
  onUpdate, 
  onNext, 
  onPrevious, 
  isLast, 
  isFirst 
}: {
  data: FeedbackData;
  onUpdate: (data: Partial<FeedbackData>) => void;
  onNext: () => void;
  onPrevious: () => void;
  isLast: boolean;
  isFirst: boolean;
}) => {
  const experienceOptions = [
    'Amazing learning journey',
    'Challenging but rewarding',
    'Exceeded expectations',
    'Good value for time',
    'Helped me grow',
    'Fun and engaging'
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center"
        >
          <Target className="w-8 h-8 text-primary" />
        </motion.div>
        <h3 className="text-xl font-semibold mb-2">How would you describe your experience?</h3>
        <p className="text-muted-foreground">
          Choose the option that best describes your journey
        </p>
      </div>

      <div className="grid gap-3">
        {experienceOptions.map((option) => (
          <motion.button
            key={option}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onUpdate({ experience: option })}
            className={`p-4 rounded-xl border text-left transition-all ${
              data.experience === option
                ? 'border-primary bg-primary/10'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span>{option}</span>
              {data.experience === option && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-6 h-6 rounded-full bg-primary flex items-center justify-center"
                >
                  <Sparkles className="w-3 h-3 text-primary-foreground" />
                </motion.div>
              )}
            </div>
          </motion.button>
        ))}
      </div>

      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={isFirst}
          className="rounded-full"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        <Button
          onClick={onNext}
          disabled={data.experience === ''}
          className="rounded-full"
        >
          {isLast ? 'Submit' : 'Next'}
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

// Step 4: Final Confirmation
const ConfirmationStep = ({ 
  data, 
  onUpdate, 
  onNext, 
  onPrevious, 
  isLast, 
  isFirst 
}: {
  data: FeedbackData;
  onUpdate: (data: Partial<FeedbackData>) => void;
  onNext: () => void;
  onPrevious: () => void;
  isLast: boolean;
  isFirst: boolean;
}) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center"
        >
          <Send className="w-8 h-8 text-primary" />
        </motion.div>
        <h3 className="text-xl font-semibold mb-2">Ready to share your feedback?</h3>
        <p className="text-muted-foreground">
          Review your responses before submitting
        </p>
      </div>

      <div className="bg-muted/50 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">Rating:</span>
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < data.rating
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
        
        {data.experience && (
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">Experience:</span>
            <Badge variant="secondary">{data.experience}</Badge>
          </div>
        )}
        
        {data.review && (
          <div>
            <span className="text-sm font-medium">Review:</span>
            <p className="text-sm text-muted-foreground mt-1">{data.review}</p>
          </div>
        )}
      </div>

      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={isFirst}
          className="rounded-full"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        <Button
          onClick={onNext}
          className="rounded-full"
        >
          Submit Feedback
          <Send className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

const onboardingSteps: OnboardingStep[] = [
  {
    id: 'rating',
    title: 'Rate Your Experience',
    description: 'How satisfied are you with the platform?',
    component: RatingStep
  },
  {
    id: 'review',
    title: 'Share Your Thoughts',
    description: 'Tell us about your experience in detail',
    component: ReviewStep
  },
  {
    id: 'experience',
    title: 'Describe Your Journey',
    description: 'How would you characterize your learning experience?',
    component: ExperienceStep
  },
  {
    id: 'confirmation',
    title: 'Review & Submit',
    description: 'Confirm your feedback before submission',
    component: ConfirmationStep
  }
];

// Hook to check if user needs to complete feedback
export function useFeedbackRequired() {
  const { user } = useAuth();
  const [isRequired, setIsRequired] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const checkFeedbackStatus = async () => {
      try {
        const profile = await apiClient.get<any | null>(`/api/users/${user.id}/profile`);

        // Check if user is new (created within last 7 days) and hasn't completed feedback
        const isNewUser = new Date(profile?.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const needsFeedback = !profile?.has_completed_feedback && isNewUser;

        setIsRequired(needsFeedback);
      } catch (error) {
        console.error('Error checking feedback status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkFeedbackStatus();
  }, [user]);

  return { isRequired, isLoading };
}
