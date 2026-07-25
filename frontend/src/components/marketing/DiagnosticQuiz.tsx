import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, Target, TrendingUp, BookOpen, Sparkles, 
  ChevronRight, CheckCircle2, ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  category: 'math' | 'science' | 'language' | 'logic';
}

interface QuizResult {
  score: number;
  total: number;
  categoryScores: Record<string, number>;
  strengths: string[];
  areasForImprovement: string[];
  recommendedPath: string;
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "1",
    question: "What is 15% of 200?",
    options: ["25", "30", "35", "40"],
    correctIndex: 1,
    category: "math",
  },
  {
    id: "2",
    question: "Which planet is known as the Red Planet?",
    options: ["Venus", "Mars", "Jupiter", "Saturn"],
    correctIndex: 1,
    category: "science",
  },
  {
    id: "3",
    question: "Complete the analogy: Book is to Reading as Fork is to...",
    options: ["Kitchen", "Eating", "Spoon", "Plate"],
    correctIndex: 1,
    category: "language",
  },
  {
    id: "4",
    question: "If all Bloops are Razzies and all Razzies are Lazzies, then all Bloops are definitely Lazzies?",
    options: ["True", "False", "Cannot determine", "Sometimes"],
    correctIndex: 0,
    category: "logic",
  },
  {
    id: "5",
    question: "What is the value of x in: 2x + 5 = 15?",
    options: ["5", "10", "7", "8"],
    correctIndex: 0,
    category: "math",
  },
];

export default function DiagnosticQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);

  const handleAnswer = (optionIndex: number) => {
    setAnswers({ ...answers, [QUIZ_QUESTIONS[currentQuestion].id]: optionIndex });
    
    if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateResult();
    }
  };

  const calculateResult = () => {
    let score = 0;
    const categoryScores: Record<string, { correct: number; total: number }> = {};

    QUIZ_QUESTIONS.forEach((q) => {
      if (!categoryScores[q.category]) {
        categoryScores[q.category] = { correct: 0, total: 0 };
      }
      categoryScores[q.category].total++;

      if (answers[q.id] === q.correctIndex) {
        score++;
        categoryScores[q.category].correct++;
      }
    });

    const strengths: string[] = [];
    const areasForImprovement: string[] = [];

    Object.entries(categoryScores).forEach(([category, scores]) => {
      const percentage = (scores.correct / scores.total) * 100;
      if (percentage >= 75) {
        strengths.push(category);
      } else if (percentage < 50) {
        areasForImprovement.push(category);
      }
    });

    let recommendedPath = "General Learning";
    if (strengths.includes("math") && strengths.includes("science")) {
      recommendedPath = "STEM Track";
    } else if (strengths.includes("language")) {
      recommendedPath = "Language Arts Track";
    } else if (strengths.includes("logic")) {
      recommendedPath = "Critical Thinking Track";
    }

    setResult({
      score,
      total: QUIZ_QUESTIONS.length,
      categoryScores: Object.fromEntries(
        Object.entries(categoryScores).map(([cat, scores]) => [
          cat,
          Math.round((scores.correct / scores.total) * 100),
        ])
      ),
      strengths,
      areasForImprovement,
      recommendedPath,
    });
    setShowResult(true);
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResult(false);
    setResult(null);
  };

  if (showResult && result) {
    return (
      <Card className="border-border/50 shadow-xl">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-4">
              <Brain className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">Your Learning Profile</h3>
            <p className="text-sm text-muted-foreground">
              Based on your diagnostic quiz results
            </p>
          </div>

          <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-4 mb-6 border border-border/30">
            <div className="text-center">
              <p className="text-4xl font-bold text-foreground mb-1">
                {result.score}/{result.total}
              </p>
              <p className="text-sm text-muted-foreground">Questions Correct</p>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <p className="text-sm font-semibold text-foreground mb-2">Recommended Path</p>
              <Badge className="text-sm px-3 py-1">{result.recommendedPath}</Badge>
            </div>

            {result.strengths.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  Strengths
                </p>
                <div className="flex flex-wrap gap-2">
                  {result.strengths.map((strength) => (
                    <Badge key={strength} variant="secondary" className="capitalize">
                      {strength}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {result.areasForImprovement.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4 text-amber-500" />
                  Areas to Improve
                </p>
                <div className="flex flex-wrap gap-2">
                  {result.areasForImprovement.map((area) => (
                    <Badge key={area} variant="outline" className="capitalize">
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Button className="w-full gap-2" size="lg">
              <Sparkles className="w-4 h-4" />
              Start Your Personalized Journey
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button variant="outline" className="w-full" onClick={resetQuiz}>
              Retake Quiz
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 shadow-xl">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-foreground">Quick Diagnostic Quiz</h3>
            <p className="text-xs text-muted-foreground">
              Question {currentQuestion + 1} of {QUIZ_QUESTIONS.length}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-secondary/50 rounded-full h-2 mb-6">
          <div
            className="bg-primary h-2 rounded-full transition-all"
            style={{ width: `${((currentQuestion + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
          />
        </div>

        <div className="space-y-4">
          <div className="bg-secondary/30 rounded-lg p-4 border border-border/30">
            <p className="text-base font-medium text-foreground mb-1">
              {QUIZ_QUESTIONS[currentQuestion].question}
            </p>
            <Badge variant="outline" className="text-xs capitalize">
              {QUIZ_QUESTIONS[currentQuestion].category}
            </Badge>
          </div>

          <div className="space-y-2">
            {QUIZ_QUESTIONS[currentQuestion].options.map((option, index) => (
              <Button
                key={index}
                variant="outline"
                className="w-full justify-start text-left h-auto py-3 px-4"
                onClick={() => handleAnswer(index)}
              >
                <span className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs font-medium">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span>{option}</span>
                </span>
              </Button>
            ))}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-border/30">
          <p className="text-xs text-muted-foreground text-center">
            This helps us personalize your learning experience
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
