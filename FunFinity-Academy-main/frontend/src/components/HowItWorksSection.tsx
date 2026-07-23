import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Map, Compass, Mountain, Sunrise } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Compass,
    title: "Discover Your Path",
    description:
      "Begin with a gentle exploration that reveals how you naturally engage with learning. No tests, no pressure—just curious discovery.",
    color: "cyan",
  },
  {
    number: "02",
    icon: Map,
    title: "Navigate the Landscape",
    description:
      "Enter an interconnected world of knowledge where subjects flow into each other. See relationships, not isolated facts.",
    color: "orange",
  },
  {
    number: "03",
    icon: Mountain,
    title: "Build Deep Understanding",
    description:
      "Engage with concepts at your own pace. The environment adapts to your rhythm, supporting focus without demanding it.",
    color: "magenta",
  },
  {
    number: "04",
    icon: Sunrise,
    title: "Watch Mastery Emerge",
    description:
      "Progress unfolds naturally over time. Confidence grows from genuine comprehension, not accumulated points.",
    color: "cyan",
  },
];

const colorClasses = {
  cyan: "text-cyan border-cyan/30 bg-cyan/10",
  orange: "text-accent border-accent/30 bg-accent/10",
  magenta: "text-magenta border-magenta/30 bg-magenta/10",
};

export function HowItWorksSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="how-it-works" className="py-8 sm:py-10 md:py-16 relative overflow-hidden">
      {/* Background */}
      <div className="absolute top-1/2 right-0 w-[150px] sm:w-[250px] md:w-[400px] h-[150px] sm:h-[250px] md:h-[500px] bg-glow-accent opacity-20" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-2xl mx-auto mb-8 sm:mb-10 md:mb-16"
        >
          <span className="text-xs sm:text-sm font-medium text-accent uppercase tracking-wider mb-2 sm:mb-4 block">
            The Journey
          </span>
          <h2 className="font-display text-lg sm:text-xl md:text-2xl lg:text-4xl font-bold mb-2 sm:mb-3 text-foreground">
            How the <span className="text-gradient-brand">adventure unfolds</span>
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed">
            Learning is not a race to completion. It's an ongoing exploration that
            respects your child's natural curiosity and pace.
          </p>
        </motion.div>

        {/* Steps Timeline */}
        <div className="max-w-4xl mx-auto">
          {steps.map((step, index) => {
            const colors = colorClasses[step.color as keyof typeof colorClasses];
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.2 + index * 0.1 }}
                className={`relative flex items-start gap-8 ${
                  index !== steps.length - 1 ? "pb-16" : ""
                }`}
              >
                {/* Timeline Line */}
                {index !== steps.length - 1 && (
                  <div className="absolute left-7 top-20 w-[1px] h-[calc(100%-1rem)] bg-border/40" />
                )}

                {/* Step Number & Icon */}
                <div
                  className={`flex-shrink-0 w-14 h-14 rounded-2xl border ${colors} flex items-center justify-center shadow-soft`}
                >
                  <step.icon className="w-6 h-6" />
                </div>

                {/* Content */}
                <div className="flex-1 pt-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`text-xs font-bold ${colors.split(" ")[0]}`}>
                      {step.number}
                    </span>
                    <h3 className="font-display text-xl font-semibold text-foreground">
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
