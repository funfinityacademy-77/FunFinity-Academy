import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Dna, Sliders, RefreshCw, User, Network } from "lucide-react";

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

export function LearningDNASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-12 md:py-16 relative overflow-hidden bg-secondary/30">
      {/* Background elements */}
      <div className="absolute bottom-0 right-0 w-[300px] sm:w-[400px] md:w-[600px] h-[300px] sm:h-[400px] md:h-[600px] bg-glow-magenta opacity-20" />
      <div className="absolute top-1/2 left-0 w-[200px] sm:w-[300px] md:w-[400px] h-[200px] sm:h-[300px] md:h-[400px] bg-glow-accent opacity-15" />

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

          {/* Right Features */}
          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
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
      </div>
    </section>
  );
}
