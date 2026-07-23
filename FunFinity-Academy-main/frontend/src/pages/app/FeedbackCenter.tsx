import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bug, Lightbulb, MessageSquare, AlertTriangle, Star, 
  Send, CheckCircle, ArrowRight, ChevronRight, Sparkles,
  HelpCircle, FileText, Settings, Users, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import BugReportForm from "./BugReportForm";
import FeatureRequestForm from "./FeatureRequestForm";
import GeneralFeedbackForm from "./GeneralFeedbackForm";
import SupportRequestForm from "./SupportRequestForm";

type ReportType = "bug" | "feature" | "feedback" | "support" | null;

const reportTypes = [
  {
    id: "bug" as const,
    title: "Bug Report",
    description: "Report technical issues, errors, or unexpected behavior",
    icon: Bug,
    color: "bg-destructive/10 text-destructive border-destructive/20",
    badge: "Technical"
  },
  {
    id: "feature" as const,
    title: "Feature Request",
    description: "Suggest new features or improvements to existing ones",
    icon: Lightbulb,
    color: "bg-primary/10 text-primary border-primary/20",
    badge: "Product"
  },
  {
    id: "feedback" as const,
    title: "General Feedback",
    description: "Share your thoughts, suggestions, or general comments",
    icon: MessageSquare,
    color: "bg-cyan/10 text-cyan border-cyan/20",
    badge: "General"
  },
  {
    id: "support" as const,
    title: "Support Request",
    description: "Get help with account issues, billing, or other support needs",
    icon: HelpCircle,
    color: "bg-emerald/10 text-emerald border-emerald/20",
    badge: "Support"
  }
];

export default function FeedbackCenter() {
  const [selectedType, setSelectedType] = useState<ReportType>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submittedType, setSubmittedType] = useState<string>("");

  const handleBack = () => {
    setSelectedType(null);
  };

  const handleSuccess = (type: string) => {
    setSubmitted(true);
    setSubmittedType(type);
    setSelectedType(null);
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
            Submission Successful
          </h2>
          <p className="text-muted-foreground mb-6">
            Thank you for your {submittedType}! Our team will review it and get back to you if needed.
          </p>
          <Button
            onClick={() => {
              setSubmitted(false);
              setSubmittedType("");
            }}
            variant="hero"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Submit Another
          </Button>
        </motion.div>
      </div>
    );
  }

  if (selectedType) {
    return (
      <div className="max-w-3xl mx-auto">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="mb-6"
        >
          <ChevronRight className="w-4 h-4 mr-2 rotate-180" />
          Back to Options
        </Button>
        
        <AnimatePresence mode="wait">
          {selectedType === "bug" && (
            <motion.div
              key="bug"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <BugReportForm onSuccess={() => handleSuccess("bug report")} />
            </motion.div>
          )}
          {selectedType === "feature" && (
            <motion.div
              key="feature"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <FeatureRequestForm onSuccess={() => handleSuccess("feature request")} />
            </motion.div>
          )}
          {selectedType === "feedback" && (
            <motion.div
              key="feedback"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <GeneralFeedbackForm onSuccess={() => handleSuccess("feedback")} />
            </motion.div>
          )}
          {selectedType === "support" && (
            <motion.div
              key="support"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <SupportRequestForm onSuccess={() => handleSuccess("support request")} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center border border-primary/20">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">
            <span className="text-gradient-brand">Feedback Center</span>
          </h1>
        </div>
        <p className="text-muted-foreground text-sm ml-1">
          Help us improve by sharing your thoughts, reporting issues, or suggesting new features
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid md:grid-cols-2 gap-4"
      >
        {reportTypes.map((type, index) => {
          const Icon = type.icon;
          return (
            <motion.div
              key={type.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              <Card
                className={cn(
                  "glass-card border-border/30 h-full cursor-pointer transition-all hover:shadow-medium hover:border-primary/30 group",
                  type.color
                )}
                onClick={() => setSelectedType(type.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-background/50 flex items-center justify-center border border-border/30 group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <Badge variant="secondary" className="text-[10px]">
                      {type.badge}
                    </Badge>
                  </div>
                  
                  <h3 className="font-display font-semibold text-foreground text-lg mb-2 group-hover:text-primary transition-colors">
                    {type.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    {type.description}
                  </p>
                  
                  <div className="flex items-center text-sm font-medium text-primary group-hover:translate-x-1 transition-transform">
                    Get Started
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="platform-card p-6 border-primary/10 bg-gradient-to-br from-primary/5 to-accent/5"
      >
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-1">Quick Tips</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Be as specific as possible when describing issues</li>
              <li>• Include screenshots or steps to reproduce bugs</li>
              <li>• For feature requests, explain how it would help you</li>
              <li>• Check existing requests before submitting new ones</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
