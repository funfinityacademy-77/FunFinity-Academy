import { motion, useAnimation, useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight, User } from 'lucide-react';
import { useRealtimeReviews } from '@/hooks/use-realtime-stats';
import { Button } from './button';

interface TestimonialCardProps {
  testimonial: {
    id: string;
    userName: string;
    userAvatar?: string;
    rating: number;
    review: string;
    createdAt: string;
    verified: boolean;
  };
  index: number;
}

const TestimonialCard = ({ testimonial, index }: TestimonialCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 min-w-[350px] max-w-[400px] shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border border-border/50">
            <User className="w-6 h-6 text-primary" />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-semibold text-foreground truncate">
              {testimonial.userName}
            </h4>
            {testimonial.verified && (
              <div className="flex-shrink-0 w-4 h-4 rounded-full bg-green-500/20 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-green-500" />
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-1 mb-3">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < testimonial.rating
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
            <span className="text-sm text-muted-foreground ml-1">
              {testimonial.rating}.0
            </span>
          </div>
          
          <p className="text-muted-foreground text-sm leading-relaxed line-clamp-4">
            "{testimonial.review}"
          </p>
          
          <div className="mt-3 text-xs text-muted-foreground">
            {new Date(testimonial.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export function InfiniteTestimonials() {
  const { reviews, isLoading } = useRealtimeReviews();
  const [duplicatedReviews, setDuplicatedReviews] = useState<any[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const isInView = useInView(containerRef, { once: false, amount: 0.3 });

  // Duplicate reviews for infinite scroll effect
  useEffect(() => {
    if (reviews.length > 0) {
      const duplicated = [...reviews, ...reviews, ...reviews];
      setDuplicatedReviews(duplicated);
    }
  }, [reviews]);

  // Infinite scroll animation
  useEffect(() => {
    if (isInView && !isPaused && duplicatedReviews.length > 0) {
      controls.start({
        x: [0, -((duplicatedReviews.length / 3) * 400)], // Move by one set width
        transition: {
          x: {
            repeat: Infinity,
            repeatType: 'loop',
            duration: 30,
            ease: 'linear',
          },
        },
      });
    } else if (isPaused) {
      controls.stop();
    }
  }, [isInView, isPaused, duplicatedReviews, controls]);

  const handlePrevious = () => {
    controls.start({
      x: `+=400`,
      transition: { duration: 0.5, ease: 'easeInOut' },
    });
  };

  const handleNext = () => {
    controls.start({
      x: `-=${400}`,
      transition: { duration: 0.5, ease: 'easeInOut' },
    });
  };

  if (isLoading) {
    return (
      <div className="py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">What Our Students Say</h2>
            <p className="text-muted-foreground">Loading testimonials...</p>
          </div>
          <div className="flex gap-6 justify-center">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="w-80 h-48 bg-muted rounded-2xl" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="py-16">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <Quote className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-4">Be the First to Share Your Experience</h2>
            <p className="text-muted-foreground mb-6">
              Join our community and help others discover the joy of learning
            </p>
            <Button>Get Started</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-b from-background via-background/50 to-secondary/20">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            What Our <span className="text-gradient-brand">Students</span> Say
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Real experiences from real learners who transformed their education journey
          </p>
        </motion.div>

        {/* Navigation Buttons */}
        <div className="flex justify-center gap-4 mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevious}
            className="rounded-full"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPaused(!isPaused)}
            className="rounded-full"
          >
            {isPaused ? 'Play' : 'Pause'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            className="rounded-full"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        {/* Infinite Scroll Container */}
        <div 
          ref={containerRef}
          className="relative overflow-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <motion.div
            className="flex gap-6"
            animate={controls}
            style={{ width: `${duplicatedReviews.length * 400}px` }}
          >
            {duplicatedReviews.map((testimonial, index) => (
              <div key={`${testimonial.id}-${index}`} className="flex-shrink-0">
                <TestimonialCard testimonial={testimonial} index={index} />
              </div>
            ))}
          </motion.div>
        </div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-8 px-6 py-3 bg-background/50 backdrop-blur-sm border border-border/50 rounded-full">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-400" />
              <span className="font-semibold">{reviews.length}</span>
              <span className="text-sm text-muted-foreground">Reviews</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-2">
              <span className="font-semibold">
                {reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length}
              </span>
              <span className="text-sm text-muted-foreground">Avg Rating</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-2">
              <span className="font-semibold">98%</span>
              <span className="text-sm text-muted-foreground">Would Recommend</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
