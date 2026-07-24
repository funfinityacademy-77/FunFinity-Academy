import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, FileText, Shield, Scale, Gavel, BookOpen, CheckCircle, X, ArrowRight, Play, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface PopupCard {
  id: string;
  icon: typeof FileText;
  title: string;
  description: string;
  details: string[];
  color: string;
  action?: {
    label: string;
    href: string;
  };
}

const popupCards: PopupCard[] = [
  {
    id: "terms",
    icon: FileText,
    title: "Terms of Service",
    description: "Our commitment to transparency and fair practices",
    details: [
      "Clear and straightforward terms for all users",
      "No hidden fees or surprise charges",
      "Transparent data usage policies",
      "Easy cancellation and account management",
      "Regular updates with user notification"
    ],
    color: "from-blue-500/20 to-cyan-500/20"
  },
  {
    id: "privacy",
    icon: Shield,
    title: "Privacy Policy",
    description: "Your data security is our highest priority",
    details: [
      "End-to-end encryption for all communications",
      "Zero data selling to third parties",
      "GDPR and CCPA compliant practices",
      "Regular security audits and penetration testing",
      "User-controlled data deletion options"
    ],
    color: "from-green-500/20 to-emerald-500/20"
  },
  {
    id: "compliance",
    icon: Scale,
    title: "Legal Compliance",
    description: "Operating within full regulatory frameworks",
    details: [
      "FERPA compliant for educational records",
      "COPPA compliant for student privacy",
      "SOC 2 Type II certified infrastructure",
      "Regular compliance reviews and updates",
      "Transparent reporting to authorities"
    ],
    color: "from-purple-500/20 to-pink-500/20"
  },
  {
    id: "academic",
    icon: BookOpen,
    title: "Academic Integrity",
    description: "Upholding the highest standards of education",
    details: [
      "Plagiarism detection and prevention tools",
      "Honor code enforcement and monitoring",
      "Original content verification systems",
      "Fair assessment and grading practices",
      "Academic honesty training modules"
    ],
    color: "from-orange-500/20 to-yellow-500/20"
  },
  {
    id: "dispute",
    icon: Gavel,
    title: "Dispute Resolution",
    description: "Fair and transparent conflict resolution",
    details: [
      "Clear escalation procedures for disputes",
      "Independent mediation services available",
      "Transparent decision-making process",
      "Right to appeal with documented reasoning",
      "Time-bound resolution commitments"
    ],
    color: "from-red-500/20 to-rose-500/20"
  },
  {
    id: "signup",
    icon: Sparkles,
    title: "Sign Up Free",
    description: "Begin your learning journey today",
    details: [
      "No credit card required to start",
      "Free exploration period available",
      "Access to all basic features",
      "Personalized learning assessment",
      "Cancel anytime, no questions asked"
    ],
    color: "from-cyan-500/20 to-teal-500/20",
    action: {
      label: "Create Account",
      href: "/auth"
    }
  },
  {
    id: "demo",
    icon: Play,
    title: "Try Demo",
    description: "Experience the platform before committing",
    details: [
      "Interactive demo simulation",
      "Explore course content",
      "Test AI-powered features",
      "No registration required",
      "Full platform preview"
    ],
    color: "from-pink-500/20 to-purple-500/20",
    action: {
      label: "Start Demo",
      href: "/demo"
    }
  }
];

export function LegalPopupSection() {
  const [activePopup, setActivePopup] = useState<string | null>(null);

  return (
    <section className="relative py-16 bg-gradient-to-b from-background to-secondary/30">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">
            Trust & <span className="text-gradient-brand">Transparency</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our commitment to legal excellence and ethical practices ensures a safe, reliable learning environment for everyone.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {popupCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.button
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onClick={() => setActivePopup(card.id)}
                className="group relative p-6 rounded-2xl bg-background border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg text-left"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl`} />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-secondary/80 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-display font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {card.description}
                  </p>
                  <div className="flex items-center gap-1 mt-3 text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Learn more</span>
                    <ChevronRight className="w-3 h-3" />
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence>
          {activePopup && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setActivePopup(null)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
              >
                <div className="bg-background rounded-3xl border border-border/50 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto w-full max-w-2xl">
                  {(() => {
                    const card = popupCards.find(c => c.id === activePopup);
                    if (!card) return null;
                    const Icon = card.icon;
                    return (
                      <>
                        <div className={`relative p-8 bg-gradient-to-br ${card.color}`}>
                          <button
                            onClick={() => setActivePopup(null)}
                            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <div className="flex items-center gap-4 mb-4">
                            <div className="w-16 h-16 rounded-2xl bg-background/80 backdrop-blur-sm flex items-center justify-center">
                              <Icon className="w-8 h-8 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-display text-2xl font-bold text-foreground">
                                {card.title}
                              </h3>
                              <p className="text-muted-foreground">{card.description}</p>
                            </div>
                          </div>
                        </div>

                        <div className="p-8">
                          <h4 className="font-display font-bold text-foreground mb-4 text-lg">
                            Key Commitments
                          </h4>
                          <ul className="space-y-3">
                            {card.details.map((detail, index) => (
                              <motion.li
                                key={index}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-start gap-3"
                              >
                                <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                                <span className="text-sm text-foreground leading-relaxed">
                                  {detail}
                                </span>
                              </motion.li>
                            ))}
                          </ul>

                          <div className="mt-8 pt-6 border-t border-border/50">
                            <p className="text-xs text-muted-foreground mb-4">
                              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                            <div className="flex gap-3">
                              <Button variant="hero" size="sm" onClick={() => setActivePopup(null)}>
                                I Understand
                              </Button>
                              {card.action && (
                                <Button variant="outline" size="sm" asChild>
                                  <Link to={card.action.href} onClick={() => setActivePopup(null)}>
                                    {card.action.label}
                                  </Link>
                                </Button>
                              )}
                              <Button variant="ghost" size="sm" asChild>
                                <a href={`/${card.id.toLowerCase().replace(' ', '-')}`}>View Full Document</a>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-8 pt-8 border-t border-border/30"
        >
          <p className="text-xs text-muted-foreground">
            By using FunFinity Academy, you agree to our Terms of Service and Privacy Policy.
            We are committed to protecting your rights and providing a transparent, fair learning environment.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
