import { useState } from "react";
import { motion } from "framer-motion";
import { Bug, Send, Loader2, Upload, X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import type { Feedback } from "@/types/database";

interface BugReportFormProps {
  onSuccess: () => void;
}

const severityLevels = [
  { value: "low", label: "Low", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
  { value: "medium", label: "Medium", color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
  { value: "high", label: "High", color: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
  { value: "critical", label: "Critical", color: "bg-red-500/10 text-red-500 border-red-500/20" },
];

const bugCategories = [
  { value: "ui", label: "UI/UX" },
  { value: "performance", label: "Performance" },
  { value: "functionality", label: "Functionality" },
  { value: "security", label: "Security" },
  { value: "content", label: "Content" },
  { value: "other", label: "Other" },
];

export default function BugReportForm({ onSuccess }: BugReportFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    steps: "",
    severity: "medium",
    category: "functionality",
    email: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide a title and description for the bug report.",
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
        type: "bug",
        category: formData.category,
        subject: formData.title,
        message: `${formData.description}\n\nSteps to reproduce:\n${formData.steps}`,
        status: "pending",
        priority: formData.severity as "low" | "medium" | "high",
        admin_response: null,
        rating: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('feedback').insert(feedbackData);
      
      if (error) throw error;
      
      toast({
        title: "Bug report submitted",
        description: "Thank you for helping us improve the platform! Our team will review it shortly.",
      });
      onSuccess();
    } catch (error) {
      console.error("Error submitting bug report:", error);
      toast({
        title: "Submission failed",
        description: "There was an error submitting your bug report. Please try again.",
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
      className="platform-card p-6 lg:p-8 border-destructive/10"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center border border-destructive/20">
          <Bug className="w-5 h-5 text-destructive" />
        </div>
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">Bug Report</h2>
          <p className="text-sm text-muted-foreground">Report technical issues or unexpected behavior</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Bug Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Brief summary of the issue"
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
            placeholder="Describe the bug in detail..."
            rows={4}
            className="bg-secondary/50 border-border/30 resize-none"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="steps">Steps to Reproduce</Label>
          <Textarea
            id="steps"
            value={formData.steps}
            onChange={(e) => setFormData(prev => ({ ...prev, steps: e.target.value }))}
            placeholder="1. Go to...&#10;2. Click on...&#10;3. See error..."
            rows={3}
            className="bg-secondary/50 border-border/30 resize-none"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Severity Level</Label>
            <Select value={formData.severity} onValueChange={(value) => setFormData(prev => ({ ...prev, severity: value }))}>
              <SelectTrigger className="bg-secondary/50 border-border/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {severityLevels.map((level) => (
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
                {bugCategories.map((category) => (
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
              Submit Bug Report
            </>
          )}
        </Button>
      </form>
    </motion.div>
  );
}
