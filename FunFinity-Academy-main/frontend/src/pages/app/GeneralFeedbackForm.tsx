import { useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Send, Loader2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import type { Feedback } from "@/types/database";
import { cn } from "@/lib/utils";

interface GeneralFeedbackFormProps {
  onSuccess: () => void;
}

const feedbackTypes = [
  { value: "general", label: "General Feedback" },
  { value: "suggestion", label: "Suggestion" },
  { value: "compliment", label: "Compliment" },
  { value: "concern", label: "Concern" },
  { value: "other", label: "Other" },
];

export default function GeneralFeedbackForm({ onSuccess }: GeneralFeedbackFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [formData, setFormData] = useState({
    type: "general",
    subject: "",
    message: "",
    email: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.message.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide your feedback message.",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);

    try {
      const feedbackData: Partial<Feedback> = {
        user_id: user?.id || "anonymous",
        user_name: user?.display_name || null,
        user_email: formData.email || user?.email || null,
        type: "feedback",
        category: formData.type,
        subject: formData.subject || "General Feedback",
        message: formData.message,
        status: "pending",
        priority: "medium",
        rating: rating || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('feedback').insert(feedbackData);
      
      if (error) throw error;
      
      toast({
        title: "Feedback submitted",
        description: "Thank you for sharing your thoughts with us!",
      });
      onSuccess();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast({
        title: "Submission failed",
        description: "There was an error submitting your feedback. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="platform-card p-6 lg:p-8 border-cyan/10"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-cyan/10 flex items-center justify-center border border-cyan/20">
          <MessageSquare className="w-5 h-5 text-cyan" />
        </div>
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">General Feedback</h2>
          <p className="text-sm text-muted-foreground">Share your thoughts and suggestions</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label>Feedback Type</Label>
          <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
            <SelectTrigger className="bg-secondary/50 border-border/30">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {feedbackTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="subject">Subject (Optional)</Label>
          <Input
            id="subject"
            value={formData.subject}
            onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
            placeholder="Brief subject line"
            className="bg-secondary/50 border-border/30"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="message">Your Feedback *</Label>
          <Textarea
            id="message"
            value={formData.message}
            onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
            placeholder="Share your thoughts, suggestions, or comments..."
            rows={5}
            className="bg-secondary/50 border-border/30 resize-none"
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Rating (Optional)</Label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="p-2 hover:scale-110 transition-transform"
              >
                <Star
                  className={cn(
                    "w-6 h-6 transition-colors",
                    star <= rating ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"
                  )}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email (Optional)</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            placeholder="your.email@example.com"
            className="bg-secondary/50 border-border/30"
          />
        </div>

        <Button
          type="submit"
          variant="hero"
          size="lg"
          className="w-full"
          disabled={submitting}
        >
          {submitting ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="w-5 h-5 mr-2" />
              Submit Feedback
            </>
          )}
        </Button>
      </form>
    </motion.div>
  );
}
