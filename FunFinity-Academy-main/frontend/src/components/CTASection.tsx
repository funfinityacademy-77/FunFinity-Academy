import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import { ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function CTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <section 
        className="py-12 md:py-16 relative overflow-hidden cursor-pointer"
        onClick={() => setIsModalOpen(true)}
      >
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan/5 via-transparent to-magenta/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[600px] md:w-[800px] h-[300px] sm:h-[450px] md:h-[600px] bg-glow-cyan opacity-20" />

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="font-display text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 text-foreground">
              Ready to transform how you{" "}
              <span className="text-gradient-brand">experience learning</span>?
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 leading-relaxed">
              Join a growing community of students who believe learning should be calm, deep, and joyful. Designed for ages 13+. 14-day free trial, no credit card required.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <Button variant="hero" size="xl" className="group" asChild>
                <Link to="/auth" onClick={(e) => e.stopPropagation()}>
                  Begin the Adventure
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button variant="outline" size="xl" className="border-2 border-border/30 text-muted-foreground hover:text-foreground hover:bg-secondary/30" asChild>
                <Link to="/demo" onClick={(e) => e.stopPropagation()}>
                  Demo Simulation
                </Link>
              </Button>
            </div>

            {/* Small trust note */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-6 sm:mt-8 text-xs sm:text-sm text-muted-foreground"
            >
              Free exploration period • No manipulative patterns • Cancel anytime
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Modal Popup */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            {/* Blur Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md"
              onClick={() => setIsModalOpen(false)}
            />
            
            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={() => setIsModalOpen(false)}
            >
              <div
                className="platform-card p-8 max-w-md w-full relative"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-secondary/60 hover:bg-secondary/80 transition-colors flex items-center justify-center shadow-soft"
                >
                  <X className="w-5 h-5 text-foreground" />
                </button>
                
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-brand flex items-center justify-center mx-auto mb-6 shadow-medium">
                    <ArrowRight className="w-10 h-10 text-white" />
                  </div>
                  
                  <h3 className="font-display text-2xl font-bold text-foreground mb-3">
                    Start Your Learning Journey
                  </h3>
                  
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    Join thousands of students experiencing personalized, AI-powered education that adapts to their unique learning style. Designed for ages 13+.
                  </p>
                  
                  <div className="space-y-3">
                    <Button variant="hero" size="lg" className="w-full" asChild>
                      <Link to="/auth" onClick={() => setIsModalOpen(false)}>
                        Sign Up Free - 14 Day Trial
                      </Link>
                    </Button>
                    <Button variant="outline" size="lg" className="w-full border-2 border-border/30 text-muted-foreground hover:text-foreground hover:bg-secondary/30" asChild>
                      <Link to="/demo" onClick={() => setIsModalOpen(false)}>
                        Try Demo First
                      </Link>
                    </Button>
                  </div>
                  
                  <p className="mt-6 text-xs text-muted-foreground">
                    No credit card required • Cancel anytime • COPPA & GDPR compliant
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
