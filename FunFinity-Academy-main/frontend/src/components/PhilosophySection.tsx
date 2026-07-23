import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Brain, Eye, Clock, Layers, Shield, Sparkles } from "lucide-react";

const pillars = [
  {
    icon: Eye,
    title: "Presence Over Pages",
    description:
      "Learning happens in a continuous, navigable space—not fragmented screens. Build mental maps of knowledge that stick.",
    color: "cyan",
  },
  {
    icon: Brain,
    title: "Cognitive Design",
    description:
      "Attention is treated as precious. Silence, spacing, and restraint allow understanding to settle naturally.",
    color: "orange",
  },
  {
    icon: Clock,
    title: "Time Awareness",
    description:
      "Sessions feel complete and satisfying. Progress unfolds over weeks without pressure or artificial urgency.",
    color: "magenta",
  },
  {
    icon: Layers,
    title: "Knowledge Landscape",
    description:
      "Ideas connect across domains. Mastery emerges through pattern recognition, not isolated memorization.",
    color: "cyan",
  },
  {
    icon: Sparkles,
    title: "Understated Joy",
    description:
      "Motivation feels internal and earned. Rewards appear when meaningful, never dominating attention.",
    color: "orange",
  },
  {
    icon: Shield,
    title: "Trust by Design",
    description:
      "Every interaction is evaluated for psychological impact. Manipulative patterns are avoided entirely.",
    color: "magenta",
  },
];

const colorMap = {
  cyan: {
    bg: "bg-cyan/10",
    border: "border-cyan/30",
    icon: "text-cyan",
    glow: "group-hover:shadow-glow-cyan",
  },
  orange: {
    bg: "bg-accent/10",
    border: "border-accent/30",
    icon: "text-accent",
    glow: "group-hover:shadow-glow-accent",
  },
  magenta: {
    bg: "bg-magenta/10",
    border: "border-magenta/30",
    icon: "text-magenta",
    glow: "group-hover:shadow-[0_0_40px_-10px_hsl(310_85%_60%_/_0.4)]",
  },
};

function PillarCard({
  pillar,
  index,
}: {
  pillar: (typeof pillars)[0];
  index: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const colors = colorMap[pillar.color as keyof typeof colorMap];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className={`group glass-card p-6 rounded-2xl border ${colors.border} ${colors.glow} transition-all duration-500 hover:scale-[1.02]`}
    >
      <div
        className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center mb-4`}
      >
        <pillar.icon className={`w-6 h-6 ${colors.icon}`} />
      </div>
      <h3 className="font-display text-xl font-semibold mb-2 text-foreground">
        {pillar.title}
      </h3>
      <p className="text-muted-foreground leading-relaxed text-sm">
        {pillar.description}
      </p>
    </motion.div>
  );
}

export function PhilosophySection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="philosophy" className="py-8 sm:py-10 md:py-16 relative overflow-hidden">
      {/* Subtle background accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] sm:w-[500px] md:w-[800px] h-[200px] sm:h-[300px] md:h-[600px] bg-glow-cyan opacity-30" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto mb-6 sm:mb-8"
        >
          <span className="text-xs sm:text-sm font-medium text-cyan uppercase tracking-wider mb-2 sm:mb-4 block">
            Our Philosophy
          </span>
          <h2 className="font-display text-lg sm:text-xl md:text-2xl lg:text-4xl font-bold mb-2 sm:mb-3 text-foreground">
            Designed for how learning{" "}
            <span className="text-gradient-brand">actually works</span>
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed">
            Traditional platforms fragment attention. We create conditions where
            understanding can genuinely thrive.
          </p>
        </motion.div>

        {/* Pillars Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {pillars.map((pillar, index) => (
            <PillarCard key={pillar.title} pillar={pillar} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
