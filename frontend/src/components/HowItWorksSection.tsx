import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Map, Compass, Mountain, Sunrise } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Compass,
    title: "Complete Learning DNA Assessment",
    description:
      "Take our adaptive questionnaire that analyzes your learning preferences, strengths, and areas for growth. Results guide personalized content recommendations.",
    color: "cyan",
  },
  {
    number: "02",
    icon: Map,
    title: "Explore Personalized Curriculum",
    description:
      "Access a curriculum tailored to your profile. Courses adapt in real-time based on your progress, engagement patterns, and performance metrics.",
    color: "orange",
  },
  {
    number: "03",
    icon: Mountain,
    title: "Engage with Interactive Content",
    description:
      "Learn through hands-on exercises, AI-powered tutoring, and collaborative projects. Track progress with detailed analytics and milestone achievements.",
    color: "magenta",
  },
  {
    number: "04",
    icon: Sunrise,
    title: "Achieve Mastery & Recognition",
    description:
      "Earn certificates, badges, and skill endorsements. Build a comprehensive academic portfolio that showcases your learning journey and accomplishments.",
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
    <section id="how-it-works" className="py-12 md:py-16 relative overflow-hidden">
      {/* Background */}
      <div className="absolute top-1/2 right-0 w-[300px] sm:w-[400px] md:w-[500px] h-[300px] sm:h-[400px] md:h-[500px] bg-glow-accent opacity-20" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-2xl mx-auto mb-10 sm:mb-12 md:mb-16"
        >
          <span className="text-sm font-medium text-accent uppercase tracking-wider mb-4 block">
            The Journey
          </span>
          <h2 className="font-display text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 text-foreground">
            How the <span className="text-gradient-brand">adventure unfolds</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            A structured learning journey designed for measurable outcomes. Each step builds upon the previous, ensuring comprehensive skill development.
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
