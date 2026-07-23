import { motion, useAnimation, useInView } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import { Star, Quote, CheckCircle2, Sparkles, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';

interface SiteRating {
  id: string;
  rating: number;
  review: string;
  display_name: string;
  is_featured: boolean;
  is_verified: boolean;
  helpful_count: number;
  created_at: string;
}

interface RatingCardProps {
  rating: SiteRating;
  index: number;
}

const RatingCard = ({ rating, index }: RatingCardProps) => {
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (isInView) {
      controls.start({
        opacity: 1,
        scale: 1,
        transition: {
          duration: 0.5,
          delay: (index % 5) * 0.1,
          ease: "easeOut"
        }
      });
    }
  }, [isInView, controls, index]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3.5 h-3.5 ${i < rating
            ? 'fill-primary text-primary drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]'
            : 'text-muted-foreground/30'
          }`}
      />
    ));
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={controls}
      whileHover={{ y: -5, scale: 1.02 }}
      className="relative group h-[220px] w-[350px] mx-3"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
      <div className="relative h-full w-full glass-card p-6 border border-white/10 flex flex-col justify-between overflow-hidden group-hover:border-primary/30 transition-colors duration-300">
        <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
          <Quote className="w-20 h-20 text-primary rotate-12" />
        </div>

        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
              <span className="text-lg font-bold text-primary">{rating.display_name.charAt(0)}</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-display font-bold text-foreground text-sm truncate">{rating.display_name}</h4>
                {rating.is_verified && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-0.5 mt-0.5">
                {renderStars(rating.rating)}
              </div>
            </div>
          </div>

          <p className="text-muted-foreground text-[13px] leading-relaxed line-clamp-3 italic">
            "{rating.review}"
          </p>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/30">
          <span className="text-[10px] text-muted-foreground/60 uppercase tracking-widest font-medium">
            {new Date(rating.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric'
            })}
          </span>
          <div className="flex items-center gap-1.5 text-[10px] text-primary/80 font-bold bg-primary/5 px-2 py-1 rounded-full border border-primary/10">
            <Sparkles className="w-3 h-3" />
            Verified Success
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const MarqueeRow = ({ ratings, direction = "left", speed = 40, onHover }: { ratings: SiteRating[], direction?: "left" | "right", speed?: number, onHover?: (isHovering: boolean) => void }) => {
  const [isPaused, setIsPaused] = useState(false);
  const [hoverSpeed, setHoverSpeed] = useState(speed);
  const duplicatedRatings = [...ratings, ...ratings, ...ratings];

  const handleMouseEnter = () => {
    setIsPaused(true);
    setHoverSpeed(speed * 5); // Slow down to 5x slower when hovering
    onHover?.(true);
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
    setHoverSpeed(speed); // Return to normal speed
    onHover?.(false);
  };

  return (
    <div 
      className="flex py-3 overflow-hidden"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        className="flex shrink-0 gap-2"
        animate={{
          x: direction === "left" 
            ? [0, -ratings.length * 374] // 350px card + 24px gap
            : [-ratings.length * 374, 0]
        }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: ratings.length * (hoverSpeed / ratings.length),
            ease: "linear",
          }
        }}
        style={{
          animationPlayState: isPaused ? "paused" : "running"
        }}
      >
        {duplicatedRatings.map((rating, index) => (
          <RatingCard key={`${rating.id}-${direction}-${index}`} rating={rating} index={index} />
        ))}
      </motion.div>
    </div>
  );
};

export function RollingExperienceWall() {
  const [ratings, setRatings] = useState<SiteRating[]>([]);
  const [loading, setLoading] = useState(true);
  const [anyHovering, setAnyHovering] = useState(false);

  useEffect(() => {
    const generateDemoRatings = () => {
      const testimonials = [
        { name: "Sarah Johnson", review: "The AI Tutor completely changed how I study calculus. I went from failing to getting A's in just 3 weeks!", rating: 5 },
        { name: "Michael Chen", review: "Learning DNA assessment was spot-on. The personalized study plan actually works for my ADHD.", rating: 5 },
        { name: "Emily Rodriguez", review: "Finally found a platform that adapts to my learning style. The 3D visualizations make physics so much easier.", rating: 5 },
        { name: "David Kim", review: "The gamification keeps me motivated. I've completed more lessons in 2 months than I did all last year.", rating: 5 },
        { name: "Jessica Williams", review: "As a working student, the flexible scheduling is perfect. I can study during lunch breaks and actually retain information.", rating: 5 },
        { name: "Ryan Thompson", review: "The community features helped me find study partners. We aced our finals together!", rating: 5 },
        { name: "Amanda Foster", review: "My daughter went from hating math to loving it. The AI explanations are so clear and patient.", rating: 5 },
        { name: "Christopher Lee", review: "The career matching feature helped me discover my passion for data science. Now I'm pursuing a degree in it!", rating: 5 },
        { name: "Nicole Martinez", review: "I tried 5 different learning platforms before FunFinity. This one actually understands how I learn.", rating: 5 },
        { name: "Brandon Scott", review: "The progress tracking is incredible. I can see exactly where I need to improve and the platform adapts accordingly.", rating: 5 },
        { name: "Taylor Anderson", review: "The mobile app is perfect for studying on the go. I use it during my commute every day.", rating: 5 },
        { name: "Kevin Patel", review: "My grades improved by 2 letter grades in one semester. The personalized learning paths are no joke.", rating: 5 },
        { name: "Rachel Green", review: "The AI doesn't just give answers - it teaches you how to think. That's the real value here.", rating: 5 },
        { name: "Daniel Wright", review: "As someone with dyslexia, the accessibility features are game-changing. I can finally learn at my own pace.", rating: 5 },
        { name: "Olivia Brown", review: "The live classes are amazing. Real teachers who actually care and use the AI tools to enhance learning.", rating: 5 },
        { name: "James Wilson", review: "I was skeptical about AI learning, but this proved me wrong. It's like having a personal tutor 24/7.", rating: 5 },
        { name: "Sophie Davis", review: "The college matching feature found universities I never would have considered. Perfect fit for my learning style.", rating: 5 },
        { name: "Andrew Garcia", review: "The spaced repetition system actually works. I remember everything I learn now.", rating: 5 },
        { name: "Megan Taylor", review: "My son has autism and this platform accommodates his needs perfectly. He's thriving academically now.", rating: 5 },
        { name: "Joshua Miller", review: "The achievement system keeps me coming back. I've earned 50+ badges and I'm still going strong.", rating: 5 },
      ];

      return Array.from({ length: 90 }, (_, i) => {
        const testimonial = testimonials[i % testimonials.length];
        
        return {
          id: `demo-${i}`,
          rating: testimonial.rating,
          review: testimonial.review,
          display_name: testimonial.name,
          is_verified: true,
          is_featured: i % 5 === 0,
          helpful_count: Math.floor(Math.random() * 100) + 20,
          created_at: new Date(Date.now() - Math.random() * 1000000000).toISOString()
        };
      });
    };

    setRatings(generateDemoRatings());
    setLoading(false);
  }, []);

  if (loading) return null;

  // Split ratings for different rows
  const row1 = ratings.filter((_, i) => i % 3 === 0);
  const row2 = ratings.filter((_, i) => i % 3 === 1);
  const row3 = ratings.filter((_, i) => i % 3 === 2);
  
  // Ensure we have enough items for each row
  const rowData1 = row1.length > 0 ? row1 : ratings;
  const rowData2 = row2.length > 0 ? row2 : ratings;
  const rowData3 = row3.length > 0 ? row3 : ratings;

  return (
    <section className="py-24 relative overflow-hidden bg-background">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent opacity-50" />
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16 space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest">
            <Users className="w-3 h-3" />
            Social Proof
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight">
            Loved by <span className="text-gradient-brand">Visionary</span> Students
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-base">
            See how the next generation of leaders is leveraging FunFinity to master complex subjects with ease.
          </p>
        </motion.div>
      </div>

      <div className="relative">
        <MarqueeRow ratings={rowData1} direction="left" speed={70} onHover={(isHovering) => setAnyHovering(isHovering)} />
        <MarqueeRow ratings={rowData2} direction="right" speed={90} onHover={(isHovering) => setAnyHovering(isHovering)} />
        <MarqueeRow ratings={rowData3} direction="left" speed={80} onHover={(isHovering) => setAnyHovering(isHovering)} />

        {/* Edge masks */}
        <div className="absolute inset-y-0 left-0 w-[15%] bg-gradient-to-r from-background to-transparent z-20 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-[15%] bg-gradient-to-l from-background to-transparent z-20 pointer-events-none" />
      </div>

      <div className="container mx-auto px-6 mt-16 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="inline-flex flex-col items-center gap-4 p-8 rounded-3xl glass-card border border-primary/10"
        >
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-2">
            <Users className="w-8 h-8 text-primary" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-foreground">Join the elite learning community</p>
            <p className="text-xs text-muted-foreground">Start your personalized journey today</p>
          </div>
          <Button variant="hero" size="lg" className="mt-2" asChild>
            <Link to="/auth">Sign Up Now — It's Free</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
