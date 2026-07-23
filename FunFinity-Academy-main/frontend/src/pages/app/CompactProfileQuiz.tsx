import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FunfinityIcon } from '@/components/brand/FunfinityLogo';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// Quiz questions combining Learning DNA and Academic Profile
const quizQuestions = [
  {
    id: 1,
    category: 'Learning Style',
    question: 'How do you prefer to learn new concepts?',
    type: 'single',
    options: [
      { value: 'visual', label: 'Visual - diagrams, charts, videos' },
      { value: 'auditory', label: 'Auditory - lectures, discussions' },
      { value: 'kinesthetic', label: 'Hands-on - experiments, practice' },
      { value: 'reading', label: 'Reading - textbooks, articles' }
    ]
  },
  {
    id: 2,
    category: 'Learning Style',
    question: 'When studying, do you prefer:',
    type: 'single',
    options: [
      { value: 'alone', label: 'Studying alone' },
      { value: 'group', label: 'Group study sessions' },
      { value: 'mixed', label: 'Mix of both depending on topic' }
    ]
  },
  {
    id: 3,
    category: 'Interests',
    question: 'Which subjects interest you most? (Select all that apply)',
    type: 'multi',
    options: [
      { value: 'math', label: 'Mathematics' },
      { value: 'science', label: 'Science (Physics, Chemistry, Biology)' },
      { value: 'humanities', label: 'Humanities (History, Literature)' },
      { value: 'arts', label: 'Arts & Creative' },
      { value: 'technology', label: 'Technology & Programming' },
      { value: 'languages', label: 'Languages' }
    ]
  },
  {
    id: 4,
    category: 'Goals',
    question: 'What are your primary academic goals?',
    type: 'multi',
    options: [
      { value: 'college', label: 'College admission' },
      { value: 'career', label: 'Career preparation' },
      { value: 'personal', label: 'Personal growth' },
      { value: 'grades', label: 'Improve grades' },
      { value: 'skills', label: 'Learn new skills' }
    ]
  },
  {
    id: 5,
    category: 'Academic',
    question: 'What is your current grade level?',
    type: 'single',
    options: [
      { value: 'middle', label: 'Middle School (6-8)' },
      { value: 'freshman', label: 'High School Freshman (9)' },
      { value: 'sophomore', label: 'High School Sophomore (10)' },
      { value: 'junior', label: 'High School Junior (11)' },
      { value: 'senior', label: 'High School Senior (12)' },
      { value: 'college', label: 'College/University' }
    ]
  },
  {
    id: 6,
    category: 'Academic',
    question: 'What type of school do you attend?',
    type: 'single',
    options: [
      { value: 'public', label: 'Public School' },
      { value: 'private', label: 'Private School' },
      { value: 'charter', label: 'Charter School' },
      { value: 'homeschool', label: 'Homeschool' },
      { value: 'other', label: 'Other' }
    ]
  },
  {
    id: 7,
    category: 'Academic',
    question: 'What is your intended major or field of study?',
    type: 'single',
    options: [
      { value: 'stem', label: 'STEM (Science, Technology, Engineering, Math)' },
      { value: 'business', label: 'Business & Economics' },
      { value: 'arts', label: 'Arts & Humanities' },
      { value: 'health', label: 'Health & Medicine' },
      { value: 'undecided', label: 'Undecided/Exploring' }
    ]
  },
  {
    id: 8,
    category: 'Study Habits',
    question: 'How many hours per week do you typically study?',
    type: 'single',
    options: [
      { value: '0-5', label: '0-5 hours' },
      { value: '5-10', label: '5-10 hours' },
      { value: '10-15', label: '10-15 hours' },
      { value: '15-20', label: '15-20 hours' },
      { value: '20+', label: '20+ hours' }
    ]
  }
];

const QUIZ_DURATION = 5 * 60; // 5 minutes in seconds

export default function CompactProfileQuiz() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string | string[]>>({});
  const [timeLeft, setTimeLeft] = useState(QUIZ_DURATION);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Auto-submit when time runs out
  useEffect(() => {
    if (timeLeft === 0 && !isSubmitting) {
      handleSubmit();
    }
  }, [timeLeft, isSubmitting]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (questionId: number, value: string) => {
    const question = quizQuestions.find(q => q.id === questionId);
    if (question?.type === 'single') {
      setAnswers(prev => ({ ...prev, [questionId]: value }));
    }
  };

  const handleMultiAnswer = (questionId: number, value: string) => {
    setAnswers(prev => {
      const current = prev[questionId] as string[] || [];
      if (current.includes(value)) {
        return { ...prev, [questionId]: current.filter(v => v !== value) };
      }
      return { ...prev, [questionId]: [...current, value] };
    });
  };

  const handleNext = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const saveProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      // Update Learning DNA profile
      await supabase
        .from('learning_dna_profiles')
        .upsert({
          user_id: user!.id,
          learning_style: data.learning_style,
          interests: data.interests,
          goals: data.goals,
          completed: true
        }, { onConflict: 'user_id' });

      // Update Academic Profile
      await supabase
        .from('academic_profiles')
        .upsert({
          user_id: user!.id,
          grade_level: data.grade_level,
          school_type: data.school_type,
          intended_major: data.intended_major,
          extracurriculars: {},
          achievements: {},
          courses: {}
        }, { onConflict: 'user_id' });

      // Mark profile as complete
      await supabase
        .from('profiles')
        .update({ dna_complete: true })
        .eq('id', user!.id);
    }
  });

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    // Compile answers
    const profileData = {
      learning_style: answers[1] || 'mixed',
      study_preference: answers[2] || 'mixed',
      interests: answers[3] || [],
      goals: answers[4] || [],
      grade_level: answers[5] || 'undecided',
      school_type: answers[6] || 'public',
      intended_major: answers[7] || 'undecided',
      study_hours: answers[8] || '5-10'
    };

    try {
      await saveProfileMutation.mutateAsync(profileData);
      navigate('/app/profile-summary');
    } catch (error) {
      console.error('Failed to save profile:', error);
      setIsSubmitting(false);
    }
  };

  const currentQ = quizQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / quizQuestions.length) * 100;
  const isTimeCritical = timeLeft < 60;

  return (
    <div className="min-h-screen bg-background flex flex-col p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FunfinityIcon size="lg" className="text-primary" />
          <div>
            <h1 className="font-display text-lg font-bold text-foreground">Profile Setup</h1>
            <p className="text-xs text-muted-foreground">Question {currentQuestion + 1} of {quizQuestions.length}</p>
          </div>
        </div>

        {/* Timer */}
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${isTimeCritical ? 'bg-destructive/10 text-destructive' : 'bg-secondary/50'}`}>
          <Clock className="w-4 h-4" />
          <span className="font-mono font-semibold">{formatTime(timeLeft)}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-secondary rounded-full mb-2 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-accent"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      <p className="text-xs text-muted-foreground text-center mb-6">
        This shapes your custom Success Roadmap in real-time
      </p>

      {/* Question Card */}
      <motion.div
        key={currentQuestion}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="glass-card rounded-2xl border border-border/50 p-6 md:p-8 max-w-3xl mx-auto w-full"
      >
        <div className="mb-2">
          <span className="text-xs font-medium text-accent uppercase tracking-wider">
            {currentQ.category}
          </span>
        </div>

        <h2 className="font-display text-xl md:text-2xl font-bold text-foreground mb-6">
          {currentQ.question}
        </h2>

        <div className="space-y-3">
          {currentQ.options.map((option) => {
            const isSelected = currentQ.type === 'single'
              ? answers[currentQ.id] === option.value
              : (answers[currentQ.id] as string[])?.includes(option.value);

            return (
              <button
                key={option.value}
                onClick={() => {
                  if (currentQ.type === 'single') {
                    handleAnswer(currentQ.id, option.value);
                  } else {
                    handleMultiAnswer(currentQ.id, option.value);
                  }
                }}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/10'
                    : 'border-border/50 hover:border-border hover:bg-secondary/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">{option.label}</span>
                  {isSelected && <Check className="w-5 h-5 text-primary" />}
                </div>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6 max-w-3xl mx-auto w-full">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          className="gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>

        {currentQuestion === quizQuestions.length - 1 ? (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || Object.keys(answers).length === 0}
            className="gap-2"
            variant="hero"
          >
            {isSubmitting ? 'Submitting...' : 'Complete Setup'}
            <Check className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            disabled={!answers[currentQ.id]}
            className="gap-2"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
