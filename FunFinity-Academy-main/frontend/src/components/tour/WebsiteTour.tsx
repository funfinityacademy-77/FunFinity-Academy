import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft, Check, BookOpen, Bot, MessageSquare, User, LayoutDashboard, Award } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TourSlide {
  icon: any;
  title: string;
  description: string;
}

const tourSlides: TourSlide[] = [
  {
    icon: LayoutDashboard,
    title: "Welcome to FunFinity Academy",
    description: "Your personalized learning platform designed to help you achieve your educational goals through interactive courses, AI-powered assistance, and community support."
  },
  {
    icon: BookOpen,
    title: "Explore Courses",
    description: "Browse our extensive library of courses across various subjects. Enroll in courses that match your interests and track your progress through lessons, quizzes, and assignments."
  },
  {
    icon: Bot,
    title: "AI-Powered Learning",
    description: "Get personalized help from our AI Assistant. Ask questions, get explanations, receive study recommendations, and enhance your learning experience with intelligent support."
  },
  {
    icon: MessageSquare,
    title: "24/7 Chat",
    description: "Need help? Our support team is always available through the chat widget. Get assistance with technical issues, course questions, or any other concerns."
  },
  {
    icon: User,
    title: "Your Learning Journey",
    description: "Track your progress, earn badges, participate in leaderboards, and customize your learning experience. Your journey is unique, and we're here to support you every step of the way."
  }
];

export default function WebsiteTour() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if tour has been completed
    const tourCompleted = localStorage.getItem('website-tour-completed');
    if (!tourCompleted) {
      setIsOpen(true);
    }
  }, []);

  const handleNext = () => {
    if (currentSlide < tourSlides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('website-tour-completed', 'true');
    setIsOpen(false);
  };

  const handleSkip = () => {
    localStorage.setItem('website-tour-completed', 'true');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  const slide = tourSlides[currentSlide];
  const Icon = slide.icon;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={handleSkip}
        />

        {/* Slideshow Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-2xl"
        >
          <div className="platform-card overflow-hidden">
            {/* Close Button */}
            <button
              onClick={handleSkip}
              className="absolute top-4 right-4 p-2 rounded-full bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Slide Content */}
            <div className="p-8 md:p-12 text-center space-y-6">
              {/* Icon */}
              <motion.div
                key={currentSlide}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-brand text-white shadow-2xl mb-4"
              >
                <Icon className="w-10 h-10" />
              </motion.div>

              {/* Title */}
              <motion.h2
                key={`title-${currentSlide}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="font-display text-3xl md:text-4xl font-bold text-foreground"
              >
                {slide.title}
              </motion.h2>

              {/* Description */}
              <motion.p
                key={`desc-${currentSlide}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-lg mx-auto"
              >
                {slide.description}
              </motion.p>

              {/* Progress Indicators */}
              <div className="flex justify-center gap-2 pt-4">
                {tourSlides.map((_, i) => (
                  <motion.button
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    className={`h-2 rounded-full transition-all ${
                      i === currentSlide 
                        ? 'w-8 bg-primary' 
                        : 'w-2 bg-secondary hover:bg-secondary/70'
                    }`}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.2 }}
                  />
                ))}
              </div>

              {/* Navigation Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center justify-center gap-4 pt-6"
              >
                <Button
                  onClick={handlePrevious}
                  disabled={currentSlide === 0}
                  variant="outline"
                  size="lg"
                  className="min-w-[120px]"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" /> Previous
                </Button>
                <Button
                  onClick={handleNext}
                  size="lg"
                  className="min-w-[120px] bg-gradient-brand hover:opacity-90"
                >
                  {currentSlide === tourSlides.length - 1 ? (
                    <>
                      Get Started <Check className="w-4 h-4 ml-2" />
                    </>
                  ) : (
                    <>
                      Next <ChevronRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </motion.div>

              {/* Skip Link */}
              <button
                onClick={handleSkip}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors underline"
              >
                Skip tour
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
