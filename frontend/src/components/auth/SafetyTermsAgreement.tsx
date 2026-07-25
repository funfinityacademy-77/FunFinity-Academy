import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, FileText, ChevronDown, ChevronUp, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SafetyTermsAgreementProps {
  onAgree: () => void;
  onDisagree: () => void;
}

const SAFETY_TERMS = [
  {
    id: "age-requirements",
    title: "Age Requirements",
    content: "I confirm that I am at least 13 years old, or if under 13, I have obtained verifiable parental consent to use this platform in accordance with COPPA regulations.",
  },
  {
    id: "guardian-authorization",
    title: "Guardian Authorization",
    content: "I understand that if I am under 18, my parent or legal guardian has reviewed and approved my use of FunFinity Academy and accepts responsibility for my online activities.",
  },
  {
    id: "communication-codes",
    title: "Communication Codes",
    content: "I agree to communicate respectfully with other users, refrain from sharing personal information, and report any inappropriate behavior to platform administrators.",
  },
  {
    id: "zero-tolerance",
    title: "Zero-Tolerance Policies",
    content: "I understand that harassment, bullying, hate speech, and any form of discrimination are strictly prohibited and will result in immediate account termination.",
  },
];

export default function SafetyTermsAgreement({ onAgree, onDisagree }: SafetyTermsAgreementProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [agreedTerms, setAgreedTerms] = useState<Set<string>>(new Set());
  const [allAgreed, setAllAgreed] = useState(false);

  const toggleSection = (id: string) => {
    setExpandedSection(expandedSection === id ? null : id);
  };

  const toggleAgreement = (id: string) => {
    const newAgreed = new Set(agreedTerms);
    if (newAgreed.has(id)) {
      newAgreed.delete(id);
    } else {
      newAgreed.add(id);
    }
    setAgreedTerms(newAgreed);
    setAllAgreed(newAgreed.size === SAFETY_TERMS.length);
  };

  const handleAgreeAll = () => {
    const allIds = new Set(SAFETY_TERMS.map(t => t.id));
    setAgreedTerms(allIds);
    setAllAgreed(true);
  };

  const handleDisagreeAll = () => {
    setAgreedTerms(new Set());
    setAllAgreed(false);
  };

  return (
    <Card className="border-border/50 shadow-lg">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-foreground">Safety & Platform Guidelines</h3>
            <p className="text-xs text-muted-foreground">Required for account creation</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleAgreeAll}
            className="text-xs"
          >
            Agree to All
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDisagreeAll}
            className="text-xs"
          >
            Clear Selections
          </Button>
        </div>

        {/* Terms List */}
        <div className="space-y-3 mb-6">
          {SAFETY_TERMS.map((term) => (
            <motion.div
              key={term.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-border/30 rounded-lg overflow-hidden"
            >
              <button
                type="button"
                onClick={() => toggleSection(term.id)}
                className="w-full flex items-center gap-3 p-3 hover:bg-secondary/30 transition-colors text-left"
              >
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleAgreement(term.id);
                  }}
                  className={cn(
                    "w-5 h-5 rounded border-2 flex items-center justify-center transition-colors cursor-pointer",
                    agreedTerms.has(term.id)
                      ? "bg-primary border-primary text-primary-foreground"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  {agreedTerms.has(term.id) && <Check className="w-3 h-3" />}
                </div>
                <span className="flex-1 text-sm font-medium text-foreground">
                  {term.title}
                </span>
                {expandedSection === term.id ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </button>

              <AnimatePresence>
                {expandedSection === term.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-3 pb-3"
                  >
                    <div className="bg-secondary/30 rounded-lg p-3 text-sm text-muted-foreground">
                      {term.content}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Agreement Status */}
        <div className={cn(
          "text-center text-sm font-medium mb-4",
          allAgreed ? "text-emerald-500" : "text-muted-foreground"
        )}>
          {allAgreed ? (
            <span className="flex items-center justify-center gap-2">
              <Check className="w-4 h-4" />
              All terms agreed to
            </span>
          ) : (
            <span>
              {agreedTerms.size} of {SAFETY_TERMS.length} terms agreed to
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onDisagree}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={onAgree}
            disabled={!allAgreed}
            className="flex-1"
          >
            Continue
          </Button>
        </div>
      </div>
    </Card>
  );
}
