import { useState } from "react";
import { motion } from "framer-motion";
import { Bug, Send, AlertTriangle, CheckCircle, XCircle, Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const severityLevels = [
  { value: "low", label: "Low", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", description: "Minor issue, doesn't affect core functionality" },
  { value: "medium", label: "Medium", color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20", description: "Noticeable issue, affects some features" },
  { value: "high", label: "High", color: "bg-orange-500/10 text-orange-500 border-orange-500/20", description: "Major issue, affects important features" },
  { value: "critical", label: "Critical", color: "bg-red-500/10 text-red-500 border-red-500/20", description: "Blocks core functionality, needs immediate attention" },
];

const bugCategories = [
  { value: "ui", label: "UI/UX", description: "Visual issues, layout problems, design inconsistencies" },
  { value: "performance", label: "Performance", description: "Slow loading, crashes, memory issues" },
  { value: "functionality", label: "Functionality", description: "Features not working as expected" },
  { value: "security", label: "Security", description: "Security vulnerabilities, data privacy concerns" },
  { value: "content", label: "Content", description: "Incorrect information, typos, missing content" },
  { value: "other", label: "Other", description: "Any other type of issue" },
];

export default function BugReport() {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    steps: "",
    severity: "medium",
    category: "functionality",
    email: "",
    attachments: [] as File[],
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({ ...prev, attachments: [...prev.attachments, ...files] }));
  };

  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSubmitted(true);
      toast({
        title: "Bug report submitted",
        description: "Thank you for helping us improve the platform!",
      });
    } catch (error) {
      toast({
        title: "Submission failed",
        description: "There was an error submitting your bug report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="platform-card p-12 text-center border-primary/20"
        >
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-display font-bold text-foreground mb-2">
            Bug Report Submitted
          </h2>
          <p className="text-muted-foreground mb-6">
            Thank you for your feedback! Our team will review your report and get back to you if needed.
          </p>
          <Button
            onClick={() => {
              setSubmitted(false);
              setFormData({
                title: "",
                description: "",
                steps: "",
                severity: "medium",
                category: "functionality",
                email: "",
                attachments: [],
              });
            }}
            variant="hero"
          >
            Submit Another Report
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center border border-destructive/20">
            <Bug className="w-5 h-5 text-destructive" />
          </div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">
            <span className="text-gradient-destructive">Bug Report</span>
          </h1>
        </div>
        <p className="text-muted-foreground text-sm ml-1">
          Help us improve by reporting issues you encounter
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="platform-card p-6 lg:p-8 border-destructive/10"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-semibold">
              Bug Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Brief summary of the issue"
              className="h-12 rounded-xl border-border/50 bg-secondary/40 focus:bg-background transition-all"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-semibold">
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Describe the bug in detail..."
              rows={4}
              className="rounded-xl border-border/50 bg-secondary/40 focus:bg-background transition-all resize-none"
              required
            />
          </div>

          {/* Steps to Reproduce */}
          <div className="space-y-2">
            <Label htmlFor="steps" className="text-sm font-semibold">
              Steps to Reproduce
            </Label>
            <Textarea
              id="steps"
              value={formData.steps}
              onChange={(e) => handleInputChange("steps", e.target.value)}
              placeholder="1. Go to...&#10;2. Click on...&#10;3. See error..."
              rows={3}
              className="rounded-xl border-border/50 bg-secondary/40 focus:bg-background transition-all resize-none"
            />
          </div>

          {/* Severity */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Severity Level</Label>
            <div className="grid grid-cols-2 gap-3">
              {severityLevels.map((level) => (
                <button
                  key={level.value}
                  type="button"
                  onClick={() => handleInputChange("severity", level.value)}
                  className={cn(
                    "p-4 rounded-xl border text-left transition-all",
                    formData.severity === level.value
                      ? level.color
                      : "border-border/40 bg-secondary/40 hover:border-border/60"
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className={cn(
                      "w-3 h-3 rounded-full",
                      formData.severity === level.value ? "bg-current" : "bg-border"
                    )} />
                    <span className="font-semibold text-sm">{level.label}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-tight">{level.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Category</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {bugCategories.map((category) => (
                <button
                  key={category.value}
                  type="button"
                  onClick={() => handleInputChange("category", category.value)}
                  className={cn(
                    "p-3 rounded-xl border text-left transition-all",
                    formData.category === category.value
                      ? "bg-primary/10 border-primary/30 text-primary"
                      : "border-border/40 bg-secondary/40 hover:border-border/60"
                  )}
                >
                  <span className="font-semibold text-xs">{category.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-semibold">
              Email (Optional)
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="your.email@example.com"
              className="h-12 rounded-xl border-border/50 bg-secondary/40 focus:bg-background transition-all"
            />
            <p className="text-[11px] text-muted-foreground">
              Provide your email if you'd like us to follow up on this issue
            </p>
          </div>

          {/* Attachments */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Attachments (Optional)</Label>
            <div className="border-2 border-dashed border-border/40 rounded-xl p-6 text-center hover:border-primary/40 transition-colors">
              <input
                type="file"
                id="attachments"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                accept="image/*,.pdf,.txt,.doc,.docx"
              />
              <label htmlFor="attachments" className="cursor-pointer">
                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Drag and drop files or click to upload
                </p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Images, PDFs, text files (max 10MB each)
                </p>
              </label>
            </div>
            {formData.attachments.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.attachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/40 border border-border/40"
                  >
                    <span className="text-xs text-foreground max-w-[150px] truncate">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeAttachment(index)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="hero"
            size="lg"
            className="w-full h-14 rounded-2xl text-base font-bold shadow-lg shadow-destructive/20 hover:shadow-destructive/40 active:scale-[0.98] transition-all"
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
    </div>
  );
}
