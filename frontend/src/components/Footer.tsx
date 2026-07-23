import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Mail, Phone, MapPin, ExternalLink, ArrowRight, Sparkles } from "lucide-react";
import { FunfinityIcon } from "@/components/brand/FunfinityLogo";
import { CONTACT_EMAIL, CONTACT_PHONE } from "@/config/constants";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const footerLinks = {
  Learn: ["How It Works", "Subjects", "Pricing", "For Schools"],
  Company: ["About Us", "Our Philosophy", "Careers", "Press"],
  Support: ["Help Center", "Contact", "Community", "Status"],
  Legal: ["Privacy", "Terms", "Refunds", "Accessibility", "Do Not Sell/Share My Info", "Cookie Policy"],
};

const footerContent: Record<string, { title: string; content: string; sections?: Array<{ heading: string; items: string[] }> }> = {
  "How It Works": {
    title: "How It Works",
    content: "Discover how Funfinity Academy transforms learning into an immersive adventure through our innovative approach.",
    sections: [
      {
        heading: "Getting Started",
        items: ["Create your free account", "Complete your Learning DNA assessment", "Explore personalized learning paths", "Start your first interactive lesson"]
      },
      {
        heading: "Learning Features",
        items: ["AI-powered study assistance", "Interactive quizzes and assessments", "Real-time progress tracking", "Collaborative study groups"]
      }
    ]
  },
  "Subjects": {
    title: "Subjects",
    content: "Explore our comprehensive curriculum covering all major subjects with interactive, engaging content.",
    sections: [
      {
        heading: "Core Subjects",
        items: ["Mathematics", "Science", "English Language Arts", "Social Studies"]
      },
      {
        heading: "Advanced Learning",
        items: ["Computer Science", "Foreign Languages", "Arts & Music", "Physical Education"]
      }
    ]
  },
  "Pricing": {
    title: "Pricing",
    content: "Choose the plan that fits your learning journey. Flexible options for individuals, families, and schools.",
    sections: [
      {
        heading: "Individual Plans",
        items: ["Free Starter - Basic access to core features", "Pro Monthly - Full access with AI assistance", "Pro Annual - Best value with all features"]
      },
      {
        heading: "School Plans",
        items: ["Classroom - For single teachers", "School - For entire institutions", "District - For multiple schools"]
      }
    ]
  },
  "For Schools": {
    title: "For Schools",
    content: "Empower your school with cutting-edge educational technology that engages students and supports teachers.",
    sections: [
      {
        heading: "Features",
        items: ["Teacher dashboard and analytics", "Student progress monitoring", "Custom curriculum alignment", "Assessment tools"]
      },
      {
        heading: "Support",
        items: ["Dedicated account manager", "Professional development", "Technical support", "Implementation assistance"]
      }
    ]
  },
  "About Us": {
    title: "About Us",
    content: "Funfinity Academy was founded with a simple mission: to make learning an adventure that every student can enjoy and excel at.",
    sections: [
      {
        heading: "Our Story",
        items: ["Founded by educators and technologists", "Driven by passion for accessible education", "Committed to student success", "Continuously innovating"]
      },
      {
        heading: "Our Team",
        items: ["Expert educators", "Experienced developers", "Learning scientists", "Support specialists"]
      }
    ]
  },
  "Our Philosophy": {
    title: "Our Philosophy",
    content: "We believe learning should be calm, immersive, and intentional. Our approach focuses on deep understanding over rote memorization.",
    sections: [
      {
        heading: "Core Principles",
        items: ["Calm learning environments", "Immersive experiences", "Intentional curriculum design", "Personalized pathways"]
      },
      {
        heading: "Research-Based",
        items: ["Cognitive science research", "Learning psychology", "Educational best practices", "Student-centered design"]
      }
    ]
  },
  "Careers": {
    title: "Careers",
    content: "Join our team and help shape the future of education. We're always looking for passionate individuals who want to make a difference.",
    sections: [
      {
        heading: "Open Positions",
        items: ["Software Engineers", "Curriculum Developers", "Learning Designers", "Customer Success"]
      },
      {
        heading: "Why Join Us",
        items: ["Mission-driven work", "Competitive compensation", "Flexible remote work", "Professional development"]
      }
    ]
  },
  "Press": {
    title: "Press",
    content: "Stay updated with the latest news, announcements, and media coverage about Funfinity Academy.",
    sections: [
      {
        heading: "Recent Coverage",
        items: ["TechCrunch Feature", "EdTech Review", "Education Weekly", "Local News"]
      },
      {
        heading: "Press Resources",
        items: ["Press kit downloads", "Brand assets", "Executive bios", "Contact for media inquiries"]
      }
    ]
  },
  "Help Center": {
    title: "Help Center",
    content: "Find answers to common questions and get the support you need to succeed with Funfinity Academy.",
    sections: [
      {
        heading: "Popular Topics",
        items: ["Account setup", "Subscription management", "Technical troubleshooting", "Learning features"]
      },
      {
        heading: "Getting Help",
        items: ["Search our knowledge base", "Submit a support ticket", "Live chat support", "Community forums"]
      }
    ]
  },
  "Contact": {
    title: "Contact",
    content: "We're here to help. Reach out to us with any questions, feedback, or support needs.",
    sections: [
      {
        heading: "Contact Options",
        items: [`Email: ${CONTACT_EMAIL}`, `Phone: ${CONTACT_PHONE}`, "Location: San Francisco, CA", "Response time: Within 24 hours"]
      },
      {
        heading: "Office Hours",
        items: ["Monday - Friday: 9AM - 6PM PST", "Saturday: 10AM - 4PM PST", "Sunday: Closed", "Holidays: Check calendar"]
      }
    ]
  },
  "Community": {
    title: "Community",
    content: "Connect with fellow learners, share experiences, and grow together in our vibrant learning community.",
    sections: [
      {
        heading: "Community Features",
        items: ["Study groups", "Discussion forums", "Peer support", "Success stories"]
      },
      {
        heading: "Get Involved",
        items: ["Join discussions", "Share your journey", "Help others learn", "Attend virtual events"]
      }
    ]
  },
  "Status": {
    title: "System Status",
    content: "Check the current status of all Funfinity Academy services and systems.",
    sections: [
      {
        heading: "Service Status",
        items: ["Platform: Operational", "AI Services: Operational", "Database: Operational", "CDN: Operational"]
      },
      {
        heading: "Recent Incidents",
        items: ["No incidents in the last 30 days", "Scheduled maintenance: None", "Last update: Just now", "Uptime: 99.9%"]
      }
    ]
  },
  "Privacy": {
    title: "Privacy Policy",
    content: "Your privacy is important to us. Learn how we collect, use, and protect your personal information.",
    sections: [
      {
        heading: "Data Collection",
        items: ["Account information", "Learning progress", "Usage analytics", "Communication preferences"]
      },
      {
        heading: "Your Rights",
        items: ["Access your data", "Delete your account", "Opt out of marketing", "Data portability"]
      }
    ]
  },
  "Terms": {
    title: "Terms of Service",
    content: "Review the terms and conditions that govern your use of Funfinity Academy's services.",
    sections: [
      {
        heading: "Service Terms",
        items: ["Acceptable use policy", "Account responsibilities", "Payment terms", "Cancellation policy"]
      },
      {
        heading: "Legal",
        items: ["Intellectual property", "Dispute resolution", "Governing law", "Limitation of liability"]
      }
    ]
  },
  "Accessibility": {
    title: "Accessibility",
    content: "We're committed to making Funfinity Academy accessible to everyone, regardless of ability.",
    sections: [
      {
        heading: "Accessibility Features",
        items: ["Screen reader support", "Keyboard navigation", "Color contrast options", "Font size adjustments"]
      },
      {
        heading: "Standards",
        items: ["WCAG 2.1 AA compliant", "Section 508 compliant", "Regular accessibility audits", "Continuous improvement"]
      }
    ]
  },
  "Do Not Sell/Share My Info": {
    title: "Do Not Sell or Share My Personal Information",
    content: "Under the California Consumer Privacy Act (CCPA) and California Privacy Rights Act (CPRA), you have the right to opt out of the sale or sharing of your personal information.",
    sections: [
      {
        heading: "Your Rights",
        items: ["Right to know what personal information is collected", "Right to delete personal information", "Right to opt-out of sale/sharing", "Right to non-discrimination"]
      },
      {
        heading: "How to Opt Out",
        items: ["Use the toggle below to opt out", "Your preference will be saved for this browser", "You can change your preference at any time", "Opt-out applies to third-party data sharing"]
      }
    ]
  },
  "Refunds": {
    title: "Refund Policy",
    content: "We want you to be completely satisfied with your learning experience. Our refund policy is designed to be fair and transparent.",
    sections: [
      {
        heading: "Refund Eligibility",
        items: ["Free trial period available for new users", "7-day refund window for monthly subscriptions", "14-day refund window for annual subscriptions", "Refunds only available for first billing cycle"]
      },
      {
        heading: "How to Request",
        items: ["Contact support at academyfunfinity@gmail.com", "Include account email and subscription details", "Requests processed within 3-5 business days", "Refunds credited to original payment method"]
      },
      {
        heading: "Cancellation",
        items: ["Cancel anytime through account settings", "Cancellation takes effect at billing cycle end", "Annual subscriptions retain access for paid term", "Auto-renewal reminder sent 7 days before renewal"]
      }
    ]
  },
  "Privacy Policy": {
    title: "Privacy Policy",
    content: "Your privacy is important to us. Learn how we collect, use, and protect your personal information.",
    sections: [
      {
        heading: "Data Collection",
        items: ["Account information", "Learning progress", "Usage analytics", "Communication preferences"]
      },
      {
        heading: "Your Rights",
        items: ["Access your data", "Delete your account", "Opt out of marketing", "Data portability"]
      }
    ]
  },
  "Terms of Service": {
    title: "Terms of Service",
    content: "Review the terms and conditions that govern your use of Funfinity Academy's services.",
    sections: [
      {
        heading: "Service Terms",
        items: ["Acceptable use policy", "Account responsibilities", "Payment terms", "Cancellation policy"]
      },
      {
        heading: "Legal",
        items: ["Intellectual property", "Dispute resolution", "Governing law", "Limitation of liability"]
      }
    ]
  },
  "Cookie Policy": {
    title: "Cookie Policy",
    content: "Learn about how we use cookies and similar technologies to enhance your experience and comply with GDPR requirements.",
    sections: [
      {
        heading: "Cookie Types",
        items: ["Essential cookies for platform functionality", "Analytics cookies for performance monitoring", "Marketing cookies for personalized content", "Preference cookies for user settings"]
      },
      {
        heading: "Your Choices",
        items: ["Accept or reject non-essential cookies", "Manage cookie preferences anytime", "Clear cookies through browser settings", "Opt-out of targeted advertising"]
      }
    ]
  },
};

// Skeleton Loading Component
function FooterSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 w-32 bg-slate-700/50 rounded" />
      <div className="h-4 w-48 bg-slate-700/30 rounded" />
      <div className="space-y-2 mt-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-3 w-24 bg-slate-700/20 rounded" />
        ))}
      </div>
    </div>
  );
}

export function Footer() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLink, setSelectedLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);

  // Simulate loading
  useEffect(() => {
    setTimeout(() => setLoading(false), 1500);
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }
    setSubscribing(true);
    // Simulate API call
    setTimeout(() => {
      setSubscribing(false);
      setEmail('');
      alert('Thank you for subscribing to our newsletter!');
    }, 1000);
  };

  const handleLinkClick = (link: string) => {
    setSelectedLink(link);
    setIsModalOpen(true);
  };

  return (
    <>
      <footer
        className="border-t border-border/50 bg-gradient-to-b from-secondary/30 to-background cursor-pointer transition-all hover:bg-secondary/40"
        role="contentinfo"
        aria-label="Site footer"
      >
        <div className="container mx-auto px-6 py-12">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
              <div className="col-span-2 md:col-span-1">
                <FooterSkeleton />
              </div>
              {[1, 2, 3, 4].map((i) => (
                <div key={i}>
                  <FooterSkeleton />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
              {/* Brand Column */}
              <div className="col-span-2 md:col-span-1">
                <div className="flex items-center gap-3 mb-4">
                  <FunfinityIcon 
                    size="xl"
                    className="transition-transform hover:scale-105 drop-shadow-lg" 
                  />
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed mb-4">
                  Turning learning into adventure. A calm, immersive space for deep understanding.
                </p>
                <Button
                  variant="hero"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsModalOpen(true);
                  }}
                  className="w-full group"
                >
                  Explore More
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>

              {/* Link Columns */}
              {Object.entries(footerLinks).map(([category, links]) => (
                <div key={category}>
                  <h4 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    {category}
                  </h4>
                  <ul className="space-y-2">
                    {links.map((link) => (
                      <li key={link}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLinkClick(link);
                          }}
                          className="text-sm text-muted-foreground hover:text-primary hover:translate-x-1 transition-all text-left w-full focus:outline-none focus:ring-2 focus:ring-primary/50 rounded py-2 px-2"
                        >
                          {link}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* Bottom Bar */}
          <div className="mt-10 pt-6 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              <p className="mb-1 text-foreground/90">© 2026 FunFinity Academy, Inc. All rights reserved.</p>
              <p className="text-xs mb-1">Corporate Address: 123 Innovation Way, Suite 400, San Francisco, CA 94107</p>
              <p className="text-xs">Contact: academyfunfinity@gmail.com | Response Time: &lt; 24 Hours</p>
              <p className="text-xs mt-1 text-primary font-medium">Billing Terms: 14-Day Money-Back Guarantee. Cancel anytime via account settings.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleLinkClick("Privacy Policy");
                }}
                className="text-xs font-medium"
              >
                Privacy Policy
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleLinkClick("Terms of Service");
                }}
                className="text-xs font-medium"
              >
                Terms of Service
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleLinkClick("Do Not Sell/Share My Info");
                }}
                className="text-xs font-medium"
              >
                Do Not Sell/Share My Info
              </Button>
            </div>
          </div>
        </div>
      </footer>

      {/* Modal Popup */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setIsModalOpen(false)}
          >
            {/* Blurred Background */}
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" />
            
            {/* Modal Content */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25 }}
              className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-y-auto platform-card"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-slate-900/95 backdrop-blur-md border-b border-border/30 p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <FunfinityIcon 
                    size="lg"
                    className="transition-transform hover:scale-105 drop-shadow-lg" 
                  />
                  <div>
                    <h2 className="font-display text-xl font-bold text-foreground">Funfinity Academy</h2>
                    <p className="text-sm text-muted-foreground">Turning learning into adventure</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-full"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-8">
                {/* Selected Link Content */}
                {selectedLink && footerContent[selectedLink] && (
                  <div className="glass-card p-6 rounded-2xl">
                    <div className="flex items-center gap-4 mb-4">
                      <Sparkles className="w-6 h-6 text-primary" />
                      <h3 className="font-display text-xl font-bold text-foreground">{footerContent[selectedLink].title}</h3>
                    </div>
                    <p className="text-muted-foreground mb-6">{footerContent[selectedLink].content}</p>
                    
                    {footerContent[selectedLink].sections && (
                      <div className="space-y-6">
                        {footerContent[selectedLink].sections.map((section, idx) => (
                          <div key={idx} className="space-y-3">
                            <h4 className="font-semibold text-foreground text-sm uppercase tracking-wider">{section.heading}</h4>
                            <ul className="space-y-2">
                              {section.items.map((item, itemIdx) => (
                                <li key={itemIdx} className="flex items-start gap-2 text-sm text-muted-foreground">
                                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex gap-3 mt-6">
                      <Button variant="hero" size="default" onClick={() => setIsModalOpen(false)}>
                        Got it
                      </Button>
                      <Button variant="outline" size="default" onClick={() => setIsModalOpen(false)}>
                        Learn More
                      </Button>
                    </div>
                  </div>
                )}

                {/* Quick Links Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                  {Object.entries(footerLinks).map(([category, links]) => (
                    <div key={category} className="glass-card p-5 rounded-2xl">
                      <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                        <ArrowRight className="w-4 h-4 text-primary" />
                        {category}
                      </h3>
                      <div className="space-y-2">
                        {links.map((link) => (
                          <button
                            key={link}
                            onClick={() => setSelectedLink(link)}
                            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground hover:text-primary transition-colors group w-full text-left"
                          >
                            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            {link}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Contact Section */}
                <div className="glass-card p-6 rounded-2xl">
                  <h3 className="font-display font-semibold text-foreground mb-4">Get in Touch</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
                      <Mail className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Email</p>
                        <p className="text-sm font-medium text-foreground">{CONTACT_EMAIL}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
                      <Phone className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Phone</p>
                        <p className="text-sm font-medium text-foreground">{CONTACT_PHONE}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
                      <MapPin className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Location</p>
                        <p className="text-sm font-medium text-foreground">San Francisco, CA</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Newsletter */}
                <div className="glass-card p-6 rounded-2xl">
                  <h3 className="font-display font-semibold text-foreground mb-2">Stay Updated</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Subscribe to our newsletter for the latest updates and learning resources.
                  </p>
                  <form onSubmit={handleSubscribe} className="flex gap-3">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1 px-4 py-2 rounded-xl bg-background border border-border/30 text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
                    />
                    <Button variant="hero" size="default" type="submit" disabled={subscribing}>
                      {subscribing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Subscribe"}
                    </Button>
                  </form>
                </div>

                {/* Legal Links */}
                <div className="flex flex-wrap gap-4 pt-4 border-t border-border/30">
                  <button
                    onClick={() => setSelectedLink("Privacy Policy")}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Privacy Policy
                  </button>
                  <button
                    onClick={() => setSelectedLink("Terms of Service")}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Terms of Service
                  </button>
                  <button
                    onClick={() => setSelectedLink("Accessibility")}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Accessibility
                  </button>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-border/30 text-center">
                <p className="text-sm text-muted-foreground">
                  © 2026 Funfinity Academy. All rights reserved.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
