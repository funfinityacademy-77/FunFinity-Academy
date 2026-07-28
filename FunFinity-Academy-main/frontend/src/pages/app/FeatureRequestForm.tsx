import { useState } from "react";
import { motion } from "framer-motion";
import { Lightbulb, Send, Loader2, Star, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import type { Feedback } from "@/types/database";

interface FeatureRequestFormProps {
  onSuccess: () => void;
}

const priorityLevels = [
  { value: "low", label: "Low", description: "Nice to have, not urgent" },
  { value: "medium", label: "Medium", description: "Would improve experience" },
  { value: "high", label: "High", description: "Important improvement" },
  { value: "critical", label: "Critical", description: "Essential for platform" },
];

const featureCategories = [
  { value: "learning", label: "Learning Tools" },
  { value: "ui", label: "User Interface" },
  { value: "performance", label: "Performance" },
  { value: "integration", label: "Integrations" },
  { value: "content", label: "Content" },
  { value: "other", label: "Other" },
];

export default function FeatureRequestForm({ onSuccess }: FeatureRequestFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    useCase: "",
    priority: "medium",
    category: "learning",
    email: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide a title and description for the feature request.",
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
        type: "feature",
        category: formData.category,
        subject: formData.title,
        message: `${formData.description}\n\nUse Case:\n${formData.useCase}`,
        status: "pending",
        priority: formData.priority as "low" | "medium" | "high",
        admin_response: null,
        rating: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('feedback').insert(feedbackData);
      
      if (error) throw error;
      
      toast({
        title: "Feature request submitted",
        description: "Thank you for your suggestion! Our team will review it carefully.",
      });
      onSuccess();
    } catch (error) {
      console.error("Error submitting feature request:", error);
      toast({
        title: "Submission failed",
        description: "There was an error submitting your request. Please try again.",
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
      className="platform-card p-6 lg:p-8 border-primary/10"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
          <Lightbulb className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">Feature Request</h2>
          <p className="text-sm text-muted-foreground">Suggest new features or improvements</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Feature Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Brief summary of the feature"
            className="bg-secondary/50 border-border/30"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe the feature in detail..."
            rows={4}
            className="bg-secondary/50 border-border/30 resize-none"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="useCase">Use Case</Label>
          <Textarea
            id="useCase"
            value={formData.useCase}
            onChange={(e) => setFormData(prev => ({ ...prev, useCase: e.target.value }))}
            placeholder="How would this feature help you? What problem would it solve?"
            rows={3}
            className="bg-secondary/50 border-border/30 resize-none"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Priority Level</Label>
            <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}>
              <SelectTrigger className="bg-secondary/50 border-border/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {priorityLevels.map((level) => (
                  <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
              <SelectTrigger className="bg-secondary/50 border-border/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {featureCategories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>{category.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              Submit Feature Request
            </>
          )}
        </Button>
      </form>
    </motion.div>
  );
}
