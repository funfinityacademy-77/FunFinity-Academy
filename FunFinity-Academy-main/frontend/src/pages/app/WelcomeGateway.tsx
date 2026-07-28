import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Shield, Clock, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FunfinityIcon } from '@/components/brand/FunfinityLogo';

export default function WelcomeGateway() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-glow-cyan opacity-20" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-glow-magenta opacity-15" />
      
      <div className="relative z-10 max-w-2xl w-full">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex justify-center mb-8"
        >
          <FunfinityIcon size="xl" className="text-primary" />
        </motion.div>

        {/* Welcome Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass-card rounded-3xl border border-border/50 p-8 md:p-12"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-accent uppercase tracking-wider">
                Welcome to FunFinity Academy
              </span>
            </div>

            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Let's Build Your Learning Profile
            </h1>

            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Before you can access your dashboard, we need to create your personalized learning experience. 
              This quick setup will help us tailor content specifically for you.
            </p>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="flex flex-col items-center text-center p-4 rounded-xl bg-secondary/30">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground text-sm mb-1">5 Minutes</h3>
                <p className="text-xs text-muted-foreground">Quick assessment</p>
              </div>

              <div className="flex flex-col items-center text-center p-4 rounded-xl bg-secondary/30">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground text-sm mb-1">Personalized</h3>
                <p className="text-xs text-muted-foreground">Tailored content</p>
              </div>

              <div className="flex flex-col items-center text-center p-4 rounded-xl bg-secondary/30">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground text-sm mb-1">Secure</h3>
                <p className="text-xs text-muted-foreground">Your data protected</p>
              </div>
            </div>

            {/* What to expect */}
            <div className="bg-secondary/20 rounded-xl p-4 mb-8">
              <h3 className="font-semibold text-foreground mb-3 text-sm">What you'll complete:</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <span>Learning DNA assessment - discover your unique learning style</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <span>Academic profile - your grades, interests, and goals</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <span>Interactive tour - learn how to navigate the platform</span>
                </li>
              </ul>
            </div>

            {/* CTA Button */}
            <Button 
              asChild 
              size="lg" 
              className="w-full group"
              variant="hero"
            >
              <Link to="/app/compact-profile-quiz">
                Start Your Profile Setup
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>

            <p className="text-xs text-muted-foreground text-center mt-4">
              You can complete this setup at any time. Your progress will be saved automatically.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
