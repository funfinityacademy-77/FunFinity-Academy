import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Quote, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  avatar: string;
  rating: number;
  highlight: string;
}

const testimonials: Testimonial[] = [
  {
    id: "1",
    quote:
      "For the first time, my daughter looks forward to learning. The calm environment removed all the anxiety she used to feel with flashy apps. She's building real understanding, not just completing tasks.",
    author: "Sarah Mitchell",
    role: "Parent of 10-year-old",
    avatar: "👩‍💼",
    rating: 5,
    highlight: "Anxiety-free learning",
  },
  {
    id: "2",
    quote:
      "As an educator with 15 years experience, I've never seen a platform that so deeply respects how children actually learn. The interconnected curriculum mirrors how real understanding develops.",
    author: "Dr. James Chen",
    role: "Education Researcher",
    avatar: "👨‍🏫",
    rating: 5,
    highlight: "Research-backed design",
  },
  {
    id: "3",
    quote:
      "The Learning DNA feature transformed our homeschool journey. Instead of fighting my son's natural rhythms, the platform works with them. Morning math, afternoon creativity—exactly as he thrives.",
    author: "Maria Rodriguez",
    role: "Homeschool Parent",
    avatar: "👩‍👦",
    rating: 5,
    highlight: "Personalized rhythms",
  },
  {
    id: "4",
    quote:
      "What struck me most is the transparency. I can see exactly how personalization works, and my kids understand why they're learning what they're learning. That agency changes everything.",
    author: "David Park",
    role: "Parent of two",
    avatar: "👨‍👧‍👦",
    rating: 5,
    highlight: "Transparent AI",
  },
  {
    id: "5",
    quote:
      "This platform understands that sustainable education isn't about engagement metrics—it's about depth. My students show genuine curiosity, not just dopamine-driven clicking.",
    author: "Prof. Emily Watson",
    role: "Child Psychology Expert",
    avatar: "👩‍⚕️",
    rating: 5,
    highlight: "Healthy engagement",
  },
];

function TestimonialCard({
  testimonial,
  isActive,
}: {
  testimonial: Testimonial;
  isActive: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{
        opacity: isActive ? 1 : 0.5,
        scale: isActive ? 1 : 0.95,
      }}
      transition={{ duration: 0.5 }}
      className={cn(
        "glass-card rounded-xl p-5 border transition-all duration-500",
        isActive
          ? "border-accent/30 shadow-glow-accent"
          : "border-border/30"
      )}
    >
      <div className="mb-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center">
          <Quote className="w-5 h-5 text-primary-foreground" />
        </div>
      </div>

      <div className="mb-2">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent border border-accent/20">
          {testimonial.highlight}
        </span>
      </div>

      <blockquote className="text-sm text-foreground leading-relaxed mb-4 font-body">
        "{testimonial.quote}"
      </blockquote>

      {/* Rating */}
      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={cn(
              "w-4 h-4",
              i < testimonial.rating
                ? "text-orange fill-orange"
                : "text-muted-foreground"
            )}
          />
        ))}
      </div>

      {/* Author */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-2xl">
          {testimonial.avatar}
        </div>
        <div>
          <div className="font-display font-semibold text-foreground">
            {testimonial.author}
          </div>
          <div className="text-sm text-muted-foreground">{testimonial.role}</div>
        </div>
      </div>
    </motion.div>
  );
}

export function TestimonialsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [activeIndex, setActiveIndex] = useState(0);

  const nextTestimonial = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="py-12 md:py-16 relative overflow-hidden bg-background">
      {/* Background */}
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-glow-accent opacity-20 -translate-y-1/2" />
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-glow-cyan opacity-15" />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <span className="text-sm font-medium text-accent uppercase tracking-wider mb-4 block">
            Trusted by Families
          </span>
          <h2 className="font-display text-2xl md:text-4xl font-bold mb-3 text-foreground">
            Stories of <span className="text-gradient-brand">Transformation</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real experiences from parents and educators who've witnessed the
            difference intentional learning design makes.
          </p>
        </motion.div>

        {/* Desktop: Grid view */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-6 mb-8">
          {testimonials.slice(0, 3).map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
            >
              <TestimonialCard testimonial={testimonial} isActive={true} />
            </motion.div>
          ))}
        </div>

        {/* Additional testimonials row */}
        <div className="hidden lg:grid lg:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {testimonials.slice(3).map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
            >
              <TestimonialCard testimonial={testimonial} isActive={true} />
            </motion.div>
          ))}
        </div>

        {/* Mobile/Tablet: Carousel */}
        <div className="lg:hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <TestimonialCard
              testimonial={testimonials[activeIndex]}
              isActive={true}
            />
          </motion.div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <Button
              variant="outline"
              size="icon"
              onClick={prevTestimonial}
              className="rounded-full"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            {/* Dots */}
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all duration-300",
                    index === activeIndex
                      ? "w-6 bg-accent"
                      : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  )}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={nextTestimonial}
              className="rounded-full"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-10 flex flex-wrap justify-center gap-6 text-center"
        >
          {[
            { value: "10,000+", label: "Families Enrolled" },
            { value: "4.9/5", label: "Parent Satisfaction" },
            { value: "95%", label: "Return Rate" },
            { value: "Zero", label: "Manipulative Patterns" },
          ].map((stat) => (
            <div key={stat.label} className="px-6">
              <div className="font-display text-2xl md:text-3xl font-bold text-gradient-brand">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
