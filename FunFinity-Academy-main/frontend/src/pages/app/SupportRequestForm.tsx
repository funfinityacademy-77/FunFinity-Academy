import { useState } from "react";
import { motion } from "framer-motion";
import { HelpCircle, Send, Loader2, User, CreditCard, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import type { Feedback } from "@/types/database";

interface SupportRequestFormProps {
  onSuccess: () => void;
}

const supportCategories = [
  { value: "account", label: "Account Issues", icon: User },
  { value: "billing", label: "Billing & Payments", icon: CreditCard },
  { value: "technical", label: "Technical Support", icon: Settings },
  { value: "other", label: "Other", icon: HelpCircle },
];

const urgencyLevels = [
  { value: "low", label: "Low", description: "Not urgent" },
  { value: "medium", label: "Medium", description: "Within 24-48 hours" },
  { value: "high", label: "High", description: "Within 24 hours" },
  { value: "urgent", label: "Urgent", description: "Immediate attention needed" },
];

export default function SupportRequestForm({ onSuccess }: SupportRequestFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    category: "account",
    subject: "",
    description: "",
    urgency: "medium",
    email: "",
    phone: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subject.trim() || !formData.description.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide a subject and description for your support request.",
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
        type: "support",
        category: formData.category,
        subject: formData.subject,
        message: `${formData.description}\n\nPhone: ${formData.phone || "Not provided"}`,
        status: "pending",
        priority: formData.urgency === "urgent" ? "high" : (formData.urgency as "low" | "medium" | "high"),
        admin_response: null,
        rating: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('feedback').insert(feedbackData);
      
      if (error) throw error;
      
      toast({
        title: "Support request submitted",
        description: "Our support team will get back to you shortly!",
      });
      onSuccess();
    } catch (error) {
      console.error("Error submitting support request:", error);
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
      className="platform-card p-6 lg:p-8 border-emerald/10"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-emerald/10 flex items-center justify-center border border-emerald/20">
          <HelpCircle className="w-5 h-5 text-emerald" />
        </div>
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">Support Request</h2>
          <p className="text-sm text-muted-foreground">Get help with account, billing, or technical issues</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
            <SelectTrigger className="bg-secondary/50 border-border/30">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {supportCategories.map((category) => {
                const Icon = category.icon;
                return (
                  <SelectItem key={category.value} value={category.value}>
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      {category.label}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="subject">Subject *</Label>
          <Input
            id="subject"
            value={formData.subject}
            onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
            placeholder="Brief summary of your issue"
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
            placeholder="Describe your issue in detail..."
            rows={4}
            className="bg-secondary/50 border-border/30 resize-none"
            required
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Urgency Level</Label>
            <Select value={formData.urgency} onValueChange={(value) => setFormData(prev => ({ ...prev, urgency: value }))}>
              <SelectTrigger className="bg-secondary/50 border-border/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {urgencyLevels.map((level) => (
                  <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="your.email@example.com"
              className="bg-secondary/50 border-border/30"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone (Optional)</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            placeholder="+1 (555) 123-4567"
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
              Submit Support Request
            </>
          )}
        </Button>
      </form>
    </motion.div>
  );
}
