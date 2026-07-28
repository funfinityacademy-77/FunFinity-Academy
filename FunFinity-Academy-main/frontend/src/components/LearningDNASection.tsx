import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Dna, Sliders, RefreshCw, Network, BookOpen, Code, Globe, Zap, Brain, Target, TrendingUp } from "lucide-react";

const features = [
  {
    icon: Dna,
    title: "Evolving Understanding",
    description:
      "Your learning profile grows with you, adapting to how you engage, not just what you complete.",
  },
  {
    icon: Sliders,
    title: "Transparent Control",
    description:
      "See exactly how personalization works. Adjust, reset, or explore manually anytime.",
  },
  {
    icon: RefreshCw,
    title: "Rhythm Recognition",
    description:
      "Discover your natural focus patterns. The system supports your rhythm, never fights it.",
  },
  {
    icon: Network,
    title: "Interconnected Learning",
    description:
      "Connect concepts across subjects. Build a knowledge network that strengthens over time.",
  },
];

// Dynamic icon network visualization
const networkIcons = [
  { icon: BookOpen, position: { top: '10%', left: '20%' }, color: 'text-blue' },
  { icon: Code, position: { top: '15%', left: '70%' }, color: 'text-orange' },
  { icon: Globe, position: { top: '50%', left: '10%' }, color: 'text-pink' },
  { icon: Zap, position: { top: '45%', left: '75%' }, color: 'text-blue' },
  { icon: Brain, position: { top: '75%', left: '30%' }, color: 'text-orange' },
  { icon: Target, position: { top: '80%', left: '65%' }, color: 'text-pink' },
  { icon: TrendingUp, position: { top: '30%', left: '45%' }, color: 'text-blue' },
];

export function LearningDNASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-8 sm:py-10 md:py-16 relative overflow-hidden bg-secondary/30">
      {/* Background elements */}
      <div className="absolute bottom-0 right-0 w-[150px] sm:w-[250px] md:w-[500px] h-[150px] sm:h-[250px] md:h-[600px] bg-glow-magenta opacity-20" />
      <div className="absolute top-1/2 left-0 w-[100px] sm:w-[200px] md:w-[400px] h-[100px] sm:h-[200px] md:h-[400px] bg-glow-accent opacity-15" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-10 items-center">
          {/* Left Content */}
          <motion.div
            ref={ref}
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-sm font-medium text-accent uppercase tracking-wider mb-4 block">
              Personalization
            </span>
            <h2 className="font-display text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 text-foreground">
              Your <span className="text-gradient-brand">Learning DNA</span>
            </h2>
            <p className="text-base sm:text-lg text-foreground/80 leading-relaxed mb-6 sm:mb-8">
              Our AI adapts to your unique learning style, creating a personalized experience that evolves with you.
            </p>
          </motion.div>

          {/* Right - Dynamic Icon Network Visualization */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative h-[300px] sm:h-[350px] md:h-[400px] glass-card rounded-2xl overflow-hidden"
          >
            {/* Animated connection lines */}
            <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 400 400">
              <defs>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="hsl(220 85% 50%)" />
                  <stop offset="50%" stopColor="hsl(30 85% 45%)" />
                  <stop offset="100%" stopColor="hsl(330 75% 45%)" />
                </linearGradient>
              </defs>
              <motion.line
                x1="80" y1="40" x2="280" y2="60"
                stroke="url(#lineGradient)"
                strokeWidth="2"
                initial={{ pathLength: 0 }}
                animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
                transition={{ duration: 1.5, delay: 0.5 }}
              />
              <motion.line
                x1="40" y1="200" x2="300" y2="180"
                stroke="url(#lineGradient)"
                strokeWidth="2"
                initial={{ pathLength: 0 }}
                animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
                transition={{ duration: 1.5, delay: 0.7 }}
              />
              <motion.line
                x1="120" y1="300" x2="260" y2="320"
                stroke="url(#lineGradient)"
                strokeWidth="2"
                initial={{ pathLength: 0 }}
                animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
                transition={{ duration: 1.5, delay: 0.9 }}
              />
              <motion.line
                x1="180" y1="120" x2="180" y2="280"
                stroke="url(#lineGradient)"
                strokeWidth="2"
                initial={{ pathLength: 0 }}
                animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
                transition={{ duration: 1.5, delay: 1.1 }}
              />
            </svg>

            {/* Floating icons */}
            {networkIcons.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={index}
                  className="absolute w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-background/80 backdrop-blur-sm border border-border/50 flex items-center justify-center shadow-soft"
                  style={item.position}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={isInView ? { 
                    opacity: 1, 
                    scale: 1,
                    y: [0, -10, 0]
                  } : { opacity: 0, scale: 0 }}
                  transition={{ 
                    duration: 0.5, 
                    delay: 0.3 + index * 0.15,
                    y: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                  }}
                >
                  <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${item.color}`} />
                </motion.div>
              );
            })}

            {/* Center hub */}
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-blue/20 via-orange/20 to-pink/20 border-2 border-blue/30 flex items-center justify-center"
              initial={{ opacity: 0, scale: 0 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Network className="w-8 h-8 sm:w-10 sm:h-10 text-gradient-brand" />
            </motion.div>
          </motion.div>
        </div>

        {/* Feature Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-8 sm:mt-12">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
              className="p-4 sm:p-5 rounded-xl bg-card/60 backdrop-blur-sm border border-foreground/20 hover:border-accent/30 transition-all duration-300"
            >
              <feature.icon className="w-8 h-8 text-accent mb-3" />
              <h3 className="font-display font-semibold mb-2 text-foreground">
                {feature.title}
              </h3>
              <p className="text-sm text-foreground/70 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
