import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Save, ChevronDown, ChevronUp, Edit2, Play, Clock, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";

interface QuizOption {
  id?: string;
  text: string;
  is_correct: boolean;
}

interface QuizQuestion {
  id?: string;
  question: string;
  question_type: "multiple_choice" | "true_false" | "short_answer";
  options: QuizOption[];
  explanation: string;
  wrong_answer_explanation: string;
  video_timestamp?: number;
  order_index: number;
}

interface Quiz {
  id?: string;
  course_id: string;
  title: string;
  description: string;
  time_limit: number | null;
  passing_score: number;
  questions: QuizQuestion[];
}

export default function AdminQuizManager() {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  // Fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await apiClient.get<any[]>('/api/courses');
        setCourses(data || []);
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Fetch quizzes for selected course
  useEffect(() => {
    if (selectedCourseId) {
      fetchQuizzesForCourse(selectedCourseId);
    }
  }, [selectedCourseId]);

  const fetchQuizzesForCourse = async (courseId: string) => {
    try {
      const data = await apiClient.get<any[]>(`/api/quizzes?course_id=${courseId}`);
      setQuizzes(data || []);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    }
  };

  const loadQuizDetails = async (quizId: string) => {
    try {
      // Fetch questions with options
      const questions = await apiClient.get<any[]>(`/api/quizzes/${quizId}/questions`);
      
      // Get quiz details
      const quiz = await apiClient.get<any>(`/api/quizzes/${quizId}`);
      
      // Format questions
      const formattedQuestions = questions?.map((q: any) => ({
        id: q.id,
        question: q.question,
        question_type: q.question_type,
        options: q.quiz_options || [],
        explanation: q.explanation || '',
        wrong_answer_explanation: q.wrong_answer_explanation || '',
        video_timestamp: q.video_timestamp,
        order_index: q.order_index
      })) || [];
      
      setSelectedQuiz({
        id: quiz.id,
        course_id: quiz.course_id,
        title: quiz.title,
        description: quiz.description || '',
        time_limit: quiz.time_limit,
        passing_score: quiz.passing_score,
        questions: formattedQuestions
      });
    } catch (error) {
      console.error('Error loading quiz details:', error);
    }
  };

  const createNewQuiz = () => {
    setSelectedQuiz({
      course_id: selectedCourseId,
      title: '',
      description: '',
      time_limit: null,
      passing_score: 70,
      questions: [
        {
          question: '',
          question_type: 'multiple_choice',
          options: [
            { text: '', is_correct: false },
            { text: '', is_correct: false },
            { text: '', is_correct: false },
            { text: '', is_correct: false }
          ],
          explanation: '',
          wrong_answer_explanation: '',
          order_index: 0
        }
      ]
    });
  };

  const addQuestion = () => {
    if (!selectedQuiz) return;
    
    const newQuestion: QuizQuestion = {
      question: '',
      question_type: 'multiple_choice',
      options: [
        { text: '', is_correct: false },
        { text: '', is_correct: false },
        { text: '', is_correct: false },
        { text: '', is_correct: false }
      ],
      explanation: '',
      wrong_answer_explanation: '',
      order_index: selectedQuiz.questions.length
    };
    
    setSelectedQuiz({
      ...selectedQuiz,
      questions: [...selectedQuiz.questions, newQuestion]
    });
  };

  const removeQuestion = (index: number) => {
    if (!selectedQuiz) return;
    
    setSelectedQuiz({
      ...selectedQuiz,
      questions: selectedQuiz.questions.filter((_, i) => i !== index)
    });
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    if (!selectedQuiz) return;
    
    const updatedQuestions = [...selectedQuiz.questions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    
    setSelectedQuiz({
      ...selectedQuiz,
      questions: updatedQuestions
    });
  };

  const updateOption = (questionIndex: number, optionIndex: number, field: string, value: any) => {
    if (!selectedQuiz) return;
    
    const updatedQuestions = [...selectedQuiz.questions];
    updatedQuestions[questionIndex].options[optionIndex] = {
      ...updatedQuestions[questionIndex].options[optionIndex],
      [field]: value
    };
    
    setSelectedQuiz({
      ...selectedQuiz,
      questions: updatedQuestions
    });
  };

  const toggleQuestionExpand = (index: number) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(index.toString())) {
      newExpanded.delete(index.toString());
    } else {
      newExpanded.add(index.toString());
    }
    setExpandedQuestions(newExpanded);
  };

  const saveQuiz = async () => {
    if (!selectedQuiz || !selectedCourseId) return;

    setSaving(true);
    try {
      // Save quiz
      const quizData = await apiClient.post('/api/quizzes', {
        id: selectedQuiz.id,
        course_id: selectedCourseId,
        title: selectedQuiz.title,
        description: selectedQuiz.description,
        time_limit: selectedQuiz.time_limit,
        passing_score: selectedQuiz.passing_score
      });

      const quizId = quizData.id;

      // Delete existing questions for this quiz
      await apiClient.delete(`/api/quizzes/${quizId}/questions`);

      // Save questions and options
      for (const question of selectedQuiz.questions) {
        const questionData = await apiClient.post('/api/quiz-questions', {
          quiz_id: quizId,
          question: question.question,
          question_type: question.question_type,
          explanation: question.explanation,
          wrong_answer_explanation: question.wrong_answer_explanation,
          video_timestamp: question.video_timestamp,
          order_index: question.order_index
        });

        // Save options
        for (const option of question.options) {
          await apiClient.post('/api/quiz-options', {
            question_id: questionData.id,
            option_text: option.text,
            is_correct: option.is_correct,
            order_index: question.options.indexOf(option)
          });
        }
      }
      
      // Refresh quizzes list
      await fetchQuizzesForCourse(selectedCourseId);
      setSelectedQuiz(null);
      
    } catch (error) {
      console.error('Error saving quiz:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-cyan border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="platform-card p-6"
      >
        <h1 className="font-display text-2xl font-bold text-foreground mb-2">
          <span className="text-gradient-brand">Quiz Manager</span>
        </h1>
        <p className="text-muted-foreground text-sm">Create and manage course assessments</p>
      </motion.div>

      {/* Course Selection */}
      <div className="platform-card p-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Select Course</label>
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border/30 text-sm font-medium text-foreground outline-none focus:border-primary/50"
          >
            <option value="">-- Select a course --</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Quiz List */}
      {selectedCourseId && !selectedQuiz && (
        <div className="platform-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-foreground">Course Quizzes</h2>
            <Button variant="hero" size="sm" onClick={createNewQuiz}>
              <Plus className="w-4 h-4 mr-2" />
              Create Quiz
            </Button>
          </div>
          
          {quizzes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No quizzes created yet for this course
            </div>
          ) : (
            <div className="space-y-3">
              {quizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className="glass-card p-4 rounded-xl flex items-center justify-between"
                >
                  <div>
                    <h3 className="font-semibold text-foreground">{quiz.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {quiz.time_limit ? `${quiz.time_limit} min` : 'Unlimited time'} • {quiz.passing_score}% passing
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => loadQuizDetails(quiz.id)}
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Quiz Editor */}
      {selectedQuiz && (
        <div className="space-y-6">
          <div className="platform-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-foreground">Quiz Details</h2>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setSelectedQuiz(null)}>
                  Cancel
                </Button>
                <Button variant="hero" onClick={saveQuiz} disabled={saving}>
                  {saving ? 'Saving...' : <><Save className="w-4 h-4 mr-2" /> Save Quiz</>}
                </Button>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Quiz Title</label>
                <Input
                  value={selectedQuiz.title}
                  onChange={(e) => setSelectedQuiz({ ...selectedQuiz, title: e.target.value })}
                  placeholder="e.g., Module 1 Assessment"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Passing Score (%)</label>
                <Input
                  type="number"
                  value={selectedQuiz.passing_score}
                  onChange={(e) => setSelectedQuiz({ ...selectedQuiz, passing_score: parseInt(e.target.value) })}
                  min={0}
                  max={100}
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-foreground">Description</label>
                <Textarea
                  value={selectedQuiz.description}
                  onChange={(e) => setSelectedQuiz({ ...selectedQuiz, description: e.target.value })}
                  rows={2}
                  placeholder="Quiz description..."
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Time Limit (minutes)</label>
                <Input
                  type="number"
                  value={selectedQuiz.time_limit || ''}
                  onChange={(e) => setSelectedQuiz({ ...selectedQuiz, time_limit: e.target.value ? parseInt(e.target.value) : null })}
                  placeholder="Leave empty for unlimited time"
                />
              </div>
            </div>
          </div>

          {/* Questions Editor */}
          <div className="platform-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-foreground">Questions</h2>
              <Button variant="outline" size="sm" onClick={addQuestion}>
                <Plus className="w-4 h-4 mr-2" />
                Add Question
              </Button>
            </div>
            
            <div className="space-y-4">
              {selectedQuiz.questions.map((question, qIndex) => (
                <div key={qIndex} className="glass-card p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-cyan/20 text-cyan text-xs font-bold flex items-center justify-center">
                        {qIndex + 1}
                      </span>
                      <Input
                        value={question.question}
                        onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                        placeholder="Enter question..."
                        className="flex-1"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleQuestionExpand(qIndex)}
                        className="p-1 hover:bg-secondary/50 rounded-lg transition-colors"
                      >
                        {expandedQuestions.has(qIndex.toString()) ? (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronUp className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>
                      <button
                        onClick={() => removeQuestion(qIndex)}
                        className="p-1 hover:bg-destructive/10 rounded-lg transition-colors text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {expandedQuestions.has(qIndex.toString()) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4 pl-9"
                      >
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-muted-foreground">Question Type</label>
                          <select
                            value={question.question_type}
                            onChange={(e) => updateQuestion(qIndex, 'question_type', e.target.value)}
                            className="w-full p-2 rounded-lg glass-card text-sm text-foreground bg-transparent outline-none"
                          >
                            <option value="multiple_choice">Multiple Choice</option>
                            <option value="true_false">True/False</option>
                            <option value="short_answer">Short Answer</option>
                          </select>
                        </div>

                        {question.question_type === 'multiple_choice' && (
                          <div className="space-y-3">
                            <label className="text-xs font-medium text-muted-foreground">Options</label>
                            {question.options.map((option, oIndex) => (
                              <div key={oIndex} className="flex items-center gap-2">
                                <div className={cn(
                                  "w-6 h-6 rounded flex items-center justify-center text-xs font-bold",
                                  option.is_correct ? "bg-green-500 text-white" : "bg-slate-700 text-slate-400"
                                )}>
                                  {String.fromCharCode(65 + oIndex)}
                                </div>
                                <Input
                                  value={option.text}
                                  onChange={(e) => updateOption(qIndex, oIndex, 'text', e.target.value)}
                                  placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                                  className="flex-1"
                                />
                                <button
                                  onClick={() => updateOption(qIndex, oIndex, 'is_correct', !option.is_correct)}
                                  className={cn(
                                    "p-2 rounded-lg transition-colors",
                                    option.is_correct ? "bg-green-500 text-white" : "bg-slate-700 text-slate-400 hover:bg-slate-600"
                                  )}
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="space-y-2">
                          <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                            <CheckCircle2 className="w-3 h-3 text-green-500" />
                            Correct Answer Explanation
                          </label>
                          <Textarea
                            value={question.explanation}
                            onChange={(e) => updateQuestion(qIndex, 'explanation', e.target.value)}
                            rows={2}
                            placeholder="Explain why this is the correct answer..."
                            className="text-sm resize-none"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                            <XCircle className="w-3 h-3 text-red-500" />
                            Wrong Answer Explanation
                          </label>
                          <Textarea
                            value={question.wrong_answer_explanation}
                            onChange={(e) => updateQuestion(qIndex, 'wrong_answer_explanation', e.target.value)}
                            rows={2}
                            placeholder="Explain why wrong answers are incorrect..."
                            className="text-sm resize-none"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                            <Play className="w-3 h-3 text-purple" />
                            Video Timestamp (seconds)
                          </label>
                          <Input
                            type="number"
                            value={question.video_timestamp || ''}
                            onChange={(e) => updateQuestion(qIndex, 'video_timestamp', e.target.value ? parseInt(e.target.value) : null)}
                            placeholder="e.g., 120 (for 2:00)"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
