import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, Target, Brain, Zap, BookOpen, ChevronRight, ChevronLeft, Plus, Trash2, Save, Sparkles, TrendingUp, CheckCircle2, AlertCircle } from "lucide-react";
import { FunfinityIcon } from "@/components/brand/FunfinityLogo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface StudyTask {
  id: string;
  title: string;
  subject: string;
  priority: "high" | "medium" | "low";
  estimatedMinutes: number;
  deadline: string;
  completed: boolean;
  notes?: string;
}

interface StudySession {
  date: string;
  tasks: StudyTask[];
  totalMinutes: number;
  completedMinutes: number;
}

interface StudyPlan {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  goal: string;
  sessions: StudySession[];
  totalStudyHours: number;
  completedStudyHours: number;
}

const SUBJECTS = ["Mathematics", "Science", "Coding", "History", "English", "Physics", "Chemistry", "Biology"];
const PRIORITIES = ["high", "medium", "low"];

export default function StudyPlanner() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<"overview" | "create" | "sessions">("overview");
  const [studyPlans, setStudyPlans] = useState<StudyPlan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<StudyPlan | null>(null);
  
  // Create plan form state
  const [newPlan, setNewPlan] = useState({
    name: "",
    startDate: "",
    endDate: "",
    goal: "",
  });
  
  // Task creation state
  const [newTask, setNewTask] = useState({
    title: "",
    subject: "",
    priority: "medium" as "high" | "medium" | "low",
    estimatedMinutes: 60,
    deadline: "",
    notes: "",
  });

  useEffect(() => {
    loadStudyPlans();
  }, [user]);

  const loadStudyPlans = () => {
    // Simulated data - in production, this would come from the database
    const mockPlans: StudyPlan[] = [
      {
        id: "1",
        name: "Final Exam Preparation",
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        goal: "Prepare for final exams in Mathematics, Science, and Coding",
        sessions: generateMockSessions(),
        totalStudyHours: 40,
        completedStudyHours: 12,
      },
    ];
    setStudyPlans(mockPlans);
    setLoading(false);
  };

  const generateMockSessions = (): StudySession[] => {
    const sessions: StudySession[] = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      sessions.push({
        date: date.toISOString().split('T')[0],
        tasks: [
          {
            id: `${i}-1`,
            title: "Review Chapter 5",
            subject: "Mathematics",
            priority: "high",
            estimatedMinutes: 45,
            deadline: date.toISOString().split('T')[0],
            completed: i < 3,
          },
          {
            id: `${i}-2`,
            title: "Practice Problems",
            subject: "Mathematics",
            priority: "medium",
            estimatedMinutes: 30,
            deadline: date.toISOString().split('T')[0],
            completed: i < 2,
          },
        ],
        totalMinutes: 75,
        completedMinutes: i < 2 ? 75 : i < 3 ? 45 : 0,
      });
    }
    
    return sessions;
  };

  const createStudyPlan = () => {
    if (!newPlan.name || !newPlan.startDate || !newPlan.endDate || !newPlan.goal) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const plan: StudyPlan = {
      id: Date.now().toString(),
      ...newPlan,
      sessions: [],
      totalStudyHours: 0,
      completedStudyHours: 0,
    };

    setStudyPlans([...studyPlans, plan]);
    setCurrentPlan(plan);
    setCurrentView("sessions");
    
    toast({
      title: "Study plan created",
      description: "Your study plan has been created successfully.",
    });
    
    setNewPlan({ name: "", startDate: "", endDate: "", goal: "" });
  };

  const addTaskToSession = (sessionDate: string) => {
    if (!newTask.title || !newTask.subject || !newTask.deadline) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (!currentPlan) return;

    const task: StudyTask = {
      id: Date.now().toString(),
      ...newTask,
      completed: false,
    };

    const updatedPlan = { ...currentPlan };
    const sessionIndex = updatedPlan.sessions.findIndex(s => s.date === sessionDate);
    
    if (sessionIndex >= 0) {
      updatedPlan.sessions[sessionIndex].tasks.push(task);
      updatedPlan.sessions[sessionIndex].totalMinutes += newTask.estimatedMinutes;
    } else {
      updatedPlan.sessions.push({
        date: sessionDate,
        tasks: [task],
        totalMinutes: newTask.estimatedMinutes,
        completedMinutes: 0,
      });
    }

    updatedPlan.totalStudyHours = updatedPlan.sessions.reduce((acc, s) => acc + s.totalMinutes, 0) / 60;
    setCurrentPlan(updatedPlan);
    setStudyPlans(studyPlans.map(p => p.id === updatedPlan.id ? updatedPlan : p));
    
    setNewTask({
      title: "",
      subject: "",
      priority: "medium",
      estimatedMinutes: 60,
      deadline: "",
      notes: "",
    });

    toast({
      title: "Task added",
      description: "Your study task has been added successfully.",
    });
  };

  const toggleTaskComplete = (sessionDate: string, taskId: string) => {
    if (!currentPlan) return;

    const updatedPlan = { ...currentPlan };
    const session = updatedPlan.sessions.find(s => s.date === sessionDate);
    
    if (session) {
      const task = session.tasks.find(t => t.id === taskId);
      if (task) {
        task.completed = !task.completed;
        session.completedMinutes = session.tasks.reduce((acc, t) => acc + (t.completed ? t.estimatedMinutes : 0), 0);
        updatedPlan.completedStudyHours = updatedPlan.sessions.reduce((acc, s) => acc + s.completedMinutes, 0) / 60;
      }
    }

    setCurrentPlan(updatedPlan);
    setStudyPlans(studyPlans.map(p => p.id === updatedPlan.id ? updatedPlan : p));
  };

  const deleteTask = (sessionDate: string, taskId: string) => {
    if (!currentPlan) return;

    const updatedPlan = { ...currentPlan };
    const session = updatedPlan.sessions.find(s => s.date === sessionDate);
    
    if (session) {
      const taskIndex = session.tasks.findIndex(t => t.id === taskId);
      if (taskIndex >= 0) {
        const task = session.tasks[taskIndex];
        session.totalMinutes -= task.estimatedMinutes;
        session.completedMinutes -= task.completed ? task.estimatedMinutes : 0;
        session.tasks.splice(taskIndex, 1);
      }
    }

    updatedPlan.totalStudyHours = updatedPlan.sessions.reduce((acc, s) => acc + s.totalMinutes, 0) / 60;
    updatedPlan.completedStudyHours = updatedPlan.sessions.reduce((acc, s) => acc + s.completedMinutes, 0) / 60;
    
    setCurrentPlan(updatedPlan);
    setStudyPlans(studyPlans.map(p => p.id === updatedPlan.id ? updatedPlan : p));

    toast({
      title: "Task deleted",
      description: "The study task has been removed.",
    });
  };

  const generateAIStudySchedule = () => {
    if (!currentPlan) return;

    toast({
      title: "Generating schedule",
      description: "AI is analyzing your learning patterns and creating an optimal study schedule...",
    });

    // Simulate AI generation
    setTimeout(() => {
      const updatedPlan = { ...currentPlan };
      const startDate = new Date(currentPlan.startDate);
      const endDate = new Date(currentPlan.endDate);
      const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      const newSessions: StudySession[] = [];
      const subjects = SUBJECTS.slice(0, 3); // Use first 3 subjects
      
      for (let i = 0; i < Math.min(daysDiff, 14); i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        
        const dailyTasks: StudyTask[] = subjects.map((subject, idx) => ({
          id: `${i}-${idx}`,
          title: `${subject} - Study Session ${i + 1}`,
          subject,
          priority: idx === 0 ? "high" : "medium",
          estimatedMinutes: 45,
          deadline: date.toISOString().split('T')[0],
          completed: false,
        }));

        newSessions.push({
          date: date.toISOString().split('T')[0],
          tasks: dailyTasks,
          totalMinutes: dailyTasks.reduce((acc, t) => acc + t.estimatedMinutes, 0),
          completedMinutes: 0,
        });
      }

      updatedPlan.sessions = newSessions;
      updatedPlan.totalStudyHours = newSessions.reduce((acc, s) => acc + s.totalMinutes, 0) / 60;
      updatedPlan.completedStudyHours = 0;
      
      setCurrentPlan(updatedPlan);
      setStudyPlans(studyPlans.map(p => p.id === updatedPlan.id ? updatedPlan : p));

      toast({
        title: "Schedule generated",
        description: `Created ${newSessions.length} study sessions with ${newSessions.reduce((acc, s) => acc + s.tasks.length, 0)} tasks.`,
      });
    }, 1500);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-3">
            <Brain className="w-8 h-8 text-primary" />
            Algorithmic Study Planner
          </h1>
          <p className="text-muted-foreground mt-1">AI-powered long-term study scheduling</p>
        </div>
        <Button variant="hero" onClick={() => setCurrentView("create")}>
          <Plus className="w-4 h-4 mr-2" />
          New Plan
        </Button>
      </motion.div>

      {/* Overview View */}
      {currentView === "overview" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {studyPlans.length === 0 ? (
            <Card className="p-12 text-center border-dashed border-2 border-border/40">
              <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No study plans yet</h3>
              <p className="text-muted-foreground mb-6">Create your first AI-powered study plan to get started.</p>
              <Button variant="hero" onClick={() => setCurrentView("create")}>
                <Plus className="w-4 h-4 mr-2" />
                Create Study Plan
              </Button>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {studyPlans.map((plan) => (
                <Card key={plan.id} className="hover:shadow-lg transition-all cursor-pointer group">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="truncate">{plan.name}</span>
                      <Badge variant="outline" className="shrink-0">
                        {Math.round((plan.completedStudyHours / plan.totalStudyHours) * 100)}%
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">{plan.goal}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Progress</span>
                        <span>{Math.round(plan.completedStudyHours)}h / {Math.round(plan.totalStudyHours)}h</span>
                      </div>
                      <Progress value={(plan.completedStudyHours / plan.totalStudyHours) * 100} className="h-2" />
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{new Date(plan.startDate).toLocaleDateString()}</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        setCurrentPlan(plan);
                        setCurrentView("sessions");
                      }}
                    >
                      View Plan
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Create Plan View */}
      {currentView === "create" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Create New Study Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="planName">Plan Name *</Label>
                <Input
                  id="planName"
                  placeholder="e.g., Final Exam Preparation"
                  value={newPlan.name}
                  onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={newPlan.startDate}
                    onChange={(e) => setNewPlan({ ...newPlan, startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={newPlan.endDate}
                    onChange={(e) => setNewPlan({ ...newPlan, endDate: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="goal">Study Goal *</Label>
                <Textarea
                  id="goal"
                  placeholder="Describe your study goals and what you want to achieve..."
                  value={newPlan.goal}
                  onChange={(e) => setNewPlan({ ...newPlan, goal: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="flex gap-3">
                <Button variant="hero" onClick={createStudyPlan} className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  Create Plan
                </Button>
                <Button variant="outline" onClick={() => setCurrentView("overview")}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Sessions View */}
      {currentView === "sessions" && currentPlan && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Plan Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground mb-2">{currentPlan.name}</h2>
                  <p className="text-sm text-muted-foreground">{currentPlan.goal}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setCurrentView("overview")}>
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center p-3 bg-secondary/50 rounded-lg">
                  <p className="text-2xl font-bold text-primary">{Math.round(currentPlan.totalStudyHours)}h</p>
                  <p className="text-xs text-muted-foreground">Total Study Time</p>
                </div>
                <div className="text-center p-3 bg-secondary/50 rounded-lg">
                  <p className="text-2xl font-bold text-cyan">{Math.round(currentPlan.completedStudyHours)}h</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
                <div className="text-center p-3 bg-secondary/50 rounded-lg">
                  <p className="text-2xl font-bold text-magenta">{currentPlan.sessions.length}</p>
                  <p className="text-xs text-muted-foreground">Study Sessions</p>
                </div>
              </div>

              <Progress value={(currentPlan.completedStudyHours / currentPlan.totalStudyHours) * 100} className="h-3" />
              
              <div className="flex gap-3 mt-4">
                <Button variant="hero" onClick={generateAIStudySchedule} className="flex-1">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate AI Schedule
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Add Task Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Add Study Task</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="taskTitle">Task Title *</Label>
                  <Input
                    id="taskTitle"
                    placeholder="e.g., Review Chapter 5"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="taskSubject">Subject *</Label>
                  <Select value={newTask.subject} onValueChange={(value) => setNewTask({ ...newTask, subject: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {SUBJECTS.map((subject) => (
                        <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="taskPriority">Priority</Label>
                  <Select value={newTask.priority} onValueChange={(value: any) => setNewTask({ ...newTask, priority: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITIES.map((priority) => (
                        <SelectItem key={priority} value={priority}>{priority}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="taskDate">Date *</Label>
                  <Input
                    id="taskDate"
                    type="date"
                    value={newTask.deadline}
                    onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="taskDuration">Duration (minutes)</Label>
                  <Input
                    id="taskDuration"
                    type="number"
                    value={newTask.estimatedMinutes}
                    onChange={(e) => setNewTask({ ...newTask, estimatedMinutes: parseInt(e.target.value) || 60 })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="taskNotes">Notes</Label>
                  <Input
                    id="taskNotes"
                    placeholder="Optional notes..."
                    value={newTask.notes}
                    onChange={(e) => setNewTask({ ...newTask, notes: e.target.value })}
                  />
                </div>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => newTask.deadline && addTaskToSession(newTask.deadline)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Task
              </Button>
            </CardContent>
          </Card>

          {/* Study Sessions */}
          <div className="space-y-4">
            <h3 className="font-display text-lg font-semibold text-foreground">Study Sessions</h3>
            
            {currentPlan.sessions.length === 0 ? (
              <Card className="p-8 text-center">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No study sessions yet. Generate an AI schedule or add tasks manually.</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {currentPlan.sessions
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .map((session) => (
                    <Card key={session.date}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <Calendar className="w-5 h-5 text-primary" />
                            <div>
                              <p className="font-semibold text-foreground">
                                {new Date(session.date).toLocaleDateString('en-US', { 
                                  weekday: 'long', 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                })}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {session.tasks.length} tasks • {session.totalMinutes} minutes total
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={session.completedMinutes === session.totalMinutes ? "default" : "outline"}>
                              {Math.round((session.completedMinutes / session.totalMinutes) * 100)}% complete
                            </Badge>
                          </div>
                        </div>
                        
                        <Progress value={(session.completedMinutes / session.totalMinutes) * 100} className="h-2 mb-4" />
                        
                        <div className="space-y-2">
                          {session.tasks.map((task) => (
                            <div
                              key={task.id}
                              className={cn(
                                "flex items-center justify-between p-3 rounded-lg border transition-all",
                                task.completed ? "bg-primary/5 border-primary/20" : "bg-secondary/30 border-border/30"
                              )}
                            >
                              <div className="flex items-center gap-3 flex-1">
                                <button
                                  onClick={() => toggleTaskComplete(session.date, task.id)}
                                  className={cn(
                                    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                                    task.completed ? "bg-primary border-primary" : "border-border"
                                  )}
                                >
                                  {task.completed && <CheckCircle2 className="w-4 h-4 text-white" />}
                                </button>
                                <div className="flex-1">
                                  <p className={cn("font-medium", task.completed && "line-through text-muted-foreground")}>
                                    {task.title}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="outline" className="text-xs">{task.subject}</Badge>
                                    <Badge 
                                      variant="outline" 
                                      className={cn(
                                        "text-xs",
                                        task.priority === "high" && "border-destructive/50 text-destructive",
                                        task.priority === "medium" && "border-orange/50 text-orange",
                                        task.priority === "low" && "border-cyan/50 text-cyan"
                                      )}
                                    >
                                      {task.priority}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">{task.estimatedMinutes} min</span>
                                  </div>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteTask(session.date, task.id)}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
