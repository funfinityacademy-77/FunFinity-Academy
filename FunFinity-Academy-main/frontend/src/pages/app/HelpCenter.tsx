import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, BookOpen, MessageSquare, Mail, ChevronDown, ChevronRight, ExternalLink, HelpCircle, Rocket, Gamepad2, Users2, Lock, CreditCard, X, Send, Minimize2, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CONTACT_EMAIL } from "@/config/constants";

const categories = [
  { icon: Rocket, label: "Getting Started", articles: 8, color: "text-cyan" },
  { icon: BookOpen, label: "Courses & Content", articles: 12, color: "text-primary" },
  { icon: Gamepad2, label: "Quizzes & Assessments", articles: 6, color: "text-magenta" },
  { icon: Users2, label: "Parent Portal", articles: 5, color: "text-orange" },
  { icon: Lock, label: "Account & Security", articles: 7, color: "text-cyan" },
  { icon: CreditCard, label: "Billing & Plans", articles: 4, color: "text-primary" },
];

const faqs = [
  { q: "How does adaptive learning work?", a: "Our Learning DNA engine observes your learning patterns — focus style, peak times, preferred modality — and adjusts content delivery accordingly. It's transparent and you can override any suggestion." },
  { q: "Is my child's data safe?", a: "Absolutely. We follow strict privacy guidelines, never sell data, and give parents full visibility into what's tracked and why. You can export or delete data at any time." },
  { q: "Can I use Funfinity offline?", a: "Yes! Download lessons and resources for offline access. Your progress syncs when you reconnect." },
  { q: "How are certificates verified?", a: "Each certificate has a unique credential ID that can be verified online. Certificates are also shareable on LinkedIn and other platforms." },
  { q: "What subjects are available?", a: "We cover Mathematics, Science (Physics, Chemistry, Biology), Coding, History, Geography, Languages, Arts, and more. Our curriculum is interconnected so ideas flow across domains." },
];

export default function HelpCenter() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isChatMinimized, setIsChatMinimized] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: "support", text: "Hi! Welcome to FunFinity Academy support. How can I help you today?" }
  ]);

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      setChatMessages([...chatMessages, { id: Date.now(), sender: "user", text: chatMessage }]);
      setChatMessage("");
      
      // Simulate support response
      setTimeout(() => {
        setChatMessages(prev => [...prev, { 
          id: Date.now() + 1, 
          sender: "support", 
          text: "Thank you for your message! Our support team will get back to you shortly. In the meantime, feel free to browse our help articles above." 
        }]);
      }, 1000);
    }
  };

  const handleEmailClick = () => {
    const subject = encodeURIComponent("Support Request - FunFinity Academy");
    const body = encodeURIComponent("Hi FunFinity Academy Support Team,\n\nI need help with:\n\n[Please describe your issue here]\n\nThank you!");
    window.open(`mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">
          Help <span className="text-gradient-brand">Center</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1 mb-6">Find answers and get support</p>
        <div className="max-w-lg mx-auto flex items-center gap-2 px-4 py-3 rounded-xl glass-card">
          <Search className="w-5 h-5 text-muted-foreground" />
          <input type="text" placeholder="Search help articles..." className="bg-transparent text-sm outline-none w-full text-foreground placeholder:text-muted-foreground" aria-label="Search help" />
        </div>
      </motion.div>

      {/* Categories */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {categories.map((cat, i) => (
          <motion.button
            key={cat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i }}
            className="platform-card p-4 text-left hover:shadow-medium transition-shadow group"
          >
            <div className={cn("w-10 h-10 rounded-xl bg-secondary/50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform", cat.color)}>
              <cat.icon className="w-5 h-5" />
            </div>
            <p className="font-medium text-foreground text-sm">{cat.label}</p>
            <p className="text-xs text-muted-foreground">{cat.articles} articles</p>
          </motion.button>
        ))}
      </div>

      {/* FAQs */}
      <section>
        <h2 className="font-display text-lg font-semibold text-foreground mb-4">Frequently Asked Questions</h2>
        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <div key={i} className="platform-card overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-4 text-left"
                aria-expanded={openFaq === i}
              >
                <span className="font-medium text-foreground text-sm">{faq.q}</span>
                {openFaq === i ? <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />}
              </button>
              {openFaq === i && (
                <div className="px-4 pb-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <div className="platform-card p-6 text-center">
        <HelpCircle className="w-8 h-8 text-cyan mx-auto mb-2" />
        <h3 className="font-display font-semibold text-foreground mb-1">Still need help?</h3>
        <p className="text-sm text-muted-foreground mb-4">Our support team is here for you</p>
        <div className="flex justify-center gap-3">
          <Button variant="hero" size="sm" onClick={() => setIsChatOpen(true)}><MessageSquare className="w-3 h-3 mr-1" /> Live Chat</Button>
          <Button variant="outline" size="sm" onClick={handleEmailClick}><Mail className="w-3 h-3 mr-1" /> Email Us</Button>
        </div>
      </div>

      {/* Live Chat Widget */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={cn(
              "fixed bottom-4 right-4 w-80 sm:w-96 bg-background border border-border rounded-2xl shadow-2xl z-50",
              isChatMinimized ? "h-14" : "h-[500px]"
            )}
          >
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan to-primary flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground text-sm">FunFinity Support</h4>
                  <p className="text-xs text-muted-foreground">Online • Typically replies in minutes</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsChatMinimized(!isChatMinimized)}
                  className="p-1 hover:bg-secondary rounded-lg transition-colors"
                >
                  {isChatMinimized ? <Maximize2 className="w-4 h-4 text-muted-foreground" /> : <Minimize2 className="w-4 h-4 text-muted-foreground" />}
                </button>
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="p-1 hover:bg-secondary rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Chat Messages */}
            {!isChatMinimized && (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-3 h-[360px]">
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex",
                        msg.sender === "user" ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[80%] rounded-2xl px-4 py-2 text-sm",
                          msg.sender === "user"
                            ? "bg-gradient-to-r from-cyan to-primary text-white"
                            : "bg-secondary text-foreground"
                        )}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chat Input */}
                <div className="p-4 border-t border-border">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                      placeholder="Type your message..."
                      className="flex-1 px-3 py-2 text-sm bg-secondary rounded-lg outline-none focus:ring-2 focus:ring-cyan/50 text-foreground placeholder:text-muted-foreground"
                    />
                    <Button
                      size="sm"
                      onClick={handleSendMessage}
                      className="px-3"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
