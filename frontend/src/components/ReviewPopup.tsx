import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, X, Send, Sparkles, ThumbsUp, MessageSquare, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { toast as sonnerToast } from "sonner";

interface ReviewPopupProps {
  triggerAfterMinutes?: number;
  triggerAfterSessions?: number;
  triggerAfterXP?: number;
}

export function ReviewPopup({ triggerAfterMinutes = 30, triggerAfterSessions = 5, triggerAfterXP = 100 }: ReviewPopupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [hoveredStar, setHoveredStar] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const { user } = useAuth();
  const qc = useQueryClient();

  // Check if review should be triggered
  const { data: userStats } = useQuery({
    queryKey: ["user-stats-for-review", user?.id],
    queryFn: async () => {
      const data = await apiClient.get<any>(`/api/users/${user!.id}/stats`);
      return data;
    },
    enabled: !!user && !dismissed,
    refetchInterval: 60000, // Check every minute
  });

  // Check if review should be shown
  useEffect(() => {
    if (dismissed || !userStats || isOpen) return;

    const shouldShow = 
      (userStats.totalMinutesSpent >= triggerAfterMinutes) ||
      (userStats.sessionsCompleted >= triggerAfterSessions) ||
      (userStats.totalXP >= triggerAfterXP);

    if (shouldShow) {
      // Check if already reviewed
      const lastReview = localStorage.getItem(`last-review-${user?.id}`);
      const reviewCooldown = 30 * 24 * 60 * 60 * 1000; // 30 days in ms
      
      if (!lastReview || (Date.now() - parseInt(lastReview)) > reviewCooldown) {
        setIsOpen(true);
      }
    }
  }, [userStats, triggerAfterMinutes, triggerAfterSessions, triggerAfterXP, dismissed, isOpen, user?.id]);

  const submitReview = useMutation({
    mutationFn: async (reviewData: { rating: number; feedback: string }) => {
      await apiClient.post(`/api/users/${user!.id}/review`, reviewData);
    },
    onSuccess: () => {
      sonnerToast.success("Thank you for your feedback!");
      localStorage.setItem(`last-review-${user?.id}`, Date.now().toString());
      setIsOpen(false);
      setRating(0);
      setFeedback("");
      setDismissed(true);
    },
    onError: (e: Error) => {
      sonnerToast.error("Failed to submit review. Please try again.");
    },
  });

  const handleDismiss = () => {
    localStorage.setItem(`last-review-${user?.id}`, Date.now().toString());
    setIsOpen(false);
    setDismissed(true);
  };

  const handleSubmit = () => {
    if (rating === 0) {
      sonnerToast.error("Please select a rating");
      return;
    }
    submitReview.mutate({ rating, feedback });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-background border border-border rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
        >
          {/* Header */}
          <div className="relative bg-gradient-to-br from-primary/20 via-accent/20 to-magenta/20 p-6">
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-foreground" />
            </button>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-primary/30 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-foreground">
                  How's your experience?
                </h3>
                <p className="text-sm text-muted-foreground">
                  Help us improve FunFinity Academy
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* User Stats Summary */}
            {userStats && (
              <div className="grid grid-cols-3 gap-3 p-4 bg-secondary/30 rounded-xl">
                <div className="text-center">
                  <Award className="w-5 h-5 text-primary mx-auto mb-1" />
                  <p className="text-lg font-bold text-foreground">{userStats.totalXP || 0}</p>
                  <p className="text-xs text-muted-foreground">XP Earned</p>
                </div>
                <div className="text-center">
                  <MessageSquare className="w-5 h-5 text-cyan mx-auto mb-1" />
                  <p className="text-lg font-bold text-foreground">{userStats.sessionsCompleted || 0}</p>
                  <p className="text-xs text-muted-foreground">Sessions</p>
                </div>
                <div className="text-center">
                  <ThumbsUp className="w-5 h-5 text-magenta mx-auto mb-1" />
                  <p className="text-lg font-bold text-foreground">{Math.floor((userStats.totalMinutesSpent || 0) / 60)}h</p>
                  <p className="text-xs text-muted-foreground">Time Spent</p>
                </div>
              </div>
            )}

            {/* Rating */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Rate your experience</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(0)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={cn(
                        "w-8 h-8",
                        (hoveredStar || rating) >= star
                          ? "fill-primary text-primary"
                          : "text-muted-foreground"
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Feedback */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Tell us more (optional)
              </label>
              <Textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="What did you like? What can we improve?"
                className="min-h-[100px] resize-none"
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground text-right">
                {feedback.length}/500
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleDismiss}
                className="flex-1"
                disabled={submitReview.isPending}
              >
                Maybe Later
              </Button>
              <Button
                variant="hero"
                onClick={handleSubmit}
                className="flex-1"
                disabled={submitReview.isPending || rating === 0}
              >
                {submitReview.isPending ? (
                  "Submitting..."
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" /> Submit Review
                  </>
                )}
              </Button>
            </div>

            {/* Skip link */}
            <button
              onClick={handleDismiss}
              className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Don't ask me again
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
