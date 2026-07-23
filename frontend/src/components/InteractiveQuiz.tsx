import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Play, Clock, ChevronRight, ArrowRight, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QuizOption {
  id: string;
  text: string;
  is_correct: boolean;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
  explanation: string;
  wrong_answer_explanation: string;
  video_timestamp?: number;
}

interface QuizProps {
  questions: QuizQuestion[];
  onComplete: (score: number, total: number) => void;
  videoUrl?: string;
}

export default function InteractiveQuiz({ questions, onComplete, videoUrl }: QuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  const handleOptionSelect = (optionId: string) => {
    if (answered) return;
    
    setSelectedOption(optionId);
    const option = currentQuestion.options.find(opt => opt.id === optionId);
    const correct = option?.is_correct || false;
    
    setIsCorrect(correct);
    setShowFeedback(true);
    setAnswered(true);
    
    if (correct) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setShowFeedback(false);
      setAnswered(false);
    } else {
      onComplete(score, questions.length);
    }
  };

  const handleVideoTimestamp = () => {
    if (currentQuestion.video_timestamp) {
      // Call the video player jump function if available
      if ((window as any).videoPlayerJump) {
        (window as any).videoPlayerJump(currentQuestion.video_timestamp);
      } else {
        console.log(`Video player not available. Would jump to timestamp: ${currentQuestion.video_timestamp}s`);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-slate-950 min-h-screen text-white">
      {/* Progress Bar */}
      <div className="h-1 bg-slate-800">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
          className="h-full bg-gradient-to-r from-cyan to-purple"
        />
      </div>

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Main Question Area - 70% width */}
        <div className={cn(
          "flex-1 p-8 transition-all duration-500",
          showFeedback ? "w-[70%]" : "w-full"
        )}>
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-cyan/20 flex items-center justify-center">
                <span className="text-cyan font-bold">{currentIndex + 1}</span>
              </div>
              <span className="text-slate-400">of {questions.length}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Clock className="w-4 h-4" />
              <span className="text-sm">Unlimited Time</span>
            </div>
          </div>

          {/* Question */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            key={currentIndex}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold mb-4">{currentQuestion.question}</h2>
          </motion.div>

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedOption === option.id;
              const isOptionCorrect = option.is_correct;
              
              let optionStyle = "border-slate-700 bg-slate-900/50 hover:border-cyan/50";
              let icon = null;
              
              if (showFeedback) {
                if (isSelected && isOptionCorrect) {
                  optionStyle = "border-green-500 bg-green-900/20";
                  icon = <CheckCircle2 className="w-5 h-5 text-green-500" />;
                } else if (isSelected && !isOptionCorrect) {
                  optionStyle = "border-red-500 bg-red-900/20";
                  icon = <XCircle className="w-5 h-5 text-red-500" />;
                } else if (isOptionCorrect) {
                  optionStyle = "border-green-500 bg-green-900/20";
                  icon = <CheckCircle2 className="w-5 h-5 text-green-500" />;
                }
              } else if (isSelected) {
                optionStyle = "border-cyan bg-cyan/10";
              }

              return (
                <motion.button
                  key={option.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleOptionSelect(option.id)}
                  disabled={answered}
                  className={cn(
                    "w-full p-4 rounded-xl border-2 flex items-center justify-between transition-all",
                    optionStyle,
                    answered ? "cursor-not-allowed" : "cursor-pointer"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center font-bold",
                      isSelected ? "bg-cyan text-white" : "bg-slate-800 text-slate-400"
                    )}>
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className="text-left">{option.text}</span>
                  </div>
                  {icon}
                </motion.button>
              );
            })}
          </div>

          {/* Next Button */}
          {showFeedback && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8"
            >
              <Button
                onClick={handleNext}
                size="lg"
                className="w-full bg-gradient-to-r from-cyan to-purple hover:opacity-90"
              >
                {currentIndex < questions.length - 1 ? (
                  <>
                    Next Question
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  <>
                    See Results
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </motion.div>
          )}
        </div>

        {/* Feedback Panel - 30% width */}
        <AnimatePresence>
          {showFeedback && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "30%", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-slate-900/50 border-l border-slate-800 p-6 overflow-hidden"
            >
              <div className="w-full">
                {/* Feedback Header */}
                <div className={cn(
                  "flex items-center gap-3 mb-6 p-4 rounded-xl",
                  isCorrect ? "bg-green-900/20 border border-green-500/30" : "bg-red-900/20 border border-red-500/30"
                )}>
                  {isCorrect ? (
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-500" />
                  )}
                  <span className="font-bold text-lg">
                    {isCorrect ? "Correct!" : "Incorrect"}
                  </span>
                </div>

                {/* Explanation */}
                <div className="space-y-4">
                  {isCorrect ? (
                    <div className="bg-slate-800/50 p-4 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="w-4 h-4 text-cyan" />
                        <span className="font-semibold text-cyan">Explanation</span>
                      </div>
                      <p className="text-slate-300 text-sm">{currentQuestion.explanation}</p>
                    </div>
                  ) : (
                    <>
                      <div className="bg-red-900/20 p-4 rounded-xl border border-red-500/30">
                        <div className="flex items-center gap-2 mb-2">
                          <XCircle className="w-4 h-4 text-red-500" />
                          <span className="font-semibold text-red-400">Why this is wrong</span>
                        </div>
                        <p className="text-slate-300 text-sm">{currentQuestion.wrong_answer_explanation}</p>
                      </div>
                      
                      <div className="bg-green-900/20 p-4 rounded-xl border border-green-500/30">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          <span className="font-semibold text-green-400">Correct explanation</span>
                        </div>
                        <p className="text-slate-300 text-sm">{currentQuestion.explanation}</p>
                      </div>
                    </>
                  )}

                  {/* Video Timestamp */}
                  {currentQuestion.video_timestamp && videoUrl && (
                    <div className="bg-purple-900/20 p-4 rounded-xl border border-purple-500/30">
                      <div className="flex items-center gap-2 mb-2">
                        <Play className="w-4 h-4 text-purple" />
                        <span className="font-semibold text-purple">Video Moment</span>
                      </div>
                      <p className="text-slate-300 text-sm mb-3">
                        This question relates to {Math.floor(currentQuestion.video_timestamp / 60)}:{(currentQuestion.video_timestamp % 60).toString().padStart(2, '0')} in the video
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleVideoTimestamp}
                        className="w-full border-purple/50 text-purple hover:bg-purple/20"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Jump to Video
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
