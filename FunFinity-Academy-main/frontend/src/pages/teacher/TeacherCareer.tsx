import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Clock, CheckCircle2, XCircle, Search, Eye, Award, Compass, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

interface StudentData {
  user_id: string;
  display_name: string;
  email: string;
  quiz_completed: boolean;
  personality_type: string;
  career_interests: string[];
  total_logged_hours: number;
  milestones_completed: number;
  milestones_total: number;
  roadmap_completion: number;
}

interface LogEntry {
  id: string;
  user_id: string;
  title: string;
  type: string;
  hours: number;
  date: string;
  supervisor_email: string;
  reflection: string;
  status: string;
  student_name: string;
}

export default function TeacherCareer() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [students, setStudents] = useState<StudentData[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null);
  const [studentLogs, setStudentLogs] = useState<LogEntry[]>([]);

  const fetchData = async () => {
    try {
      // Fetch all student career profiles with their profile info
      const careers = await apiClient.get<any[]>('/api/career-profiles');
      const profiles = await apiClient.get<any[]>('/api/profiles');
      const allMilestones = await apiClient.get<any[]>('/api/milestones');
      const allLogs = await apiClient.get<any[]>('/api/experience-logs');

      const profileMap = new Map((profiles || []).map(p => [p.user_id, p]));
      const milestonesByUser = new Map<string, { completed: number; total: number }>();

      (allMilestones || []).forEach(m => {
        const existing = milestonesByUser.get(m.user_id) || { completed: 0, total: 0 };
        existing.total++;
        if (m.completed) existing.completed++;
        milestonesByUser.set(m.user_id, existing);
      });

      const studentList: StudentData[] = (careers || []).map(cp => {
        const prof = profileMap.get(cp.user_id);
        const ms = milestonesByUser.get(cp.user_id) || { completed: 0, total: 7 };
        return {
          user_id: cp.user_id,
          display_name: prof?.display_name || prof?.email || "Unknown Student",
          email: prof?.email || "",
          quiz_completed: cp.quiz_completed || false,
          personality_type: cp.personality_type || "",
          career_interests: (cp.career_interests || []) as string[],
          total_logged_hours: Number(cp.total_logged_hours) || 0,
          milestones_completed: ms.completed,
          milestones_total: ms.total,
          roadmap_completion: ms.total > 0 ? Math.round((ms.completed / ms.total) * 100) : 0,
        };
      });

      const logEntries: LogEntry[] = (allLogs || []).map(l => ({
        id: l.id,
        user_id: l.user_id,
        title: l.title,
        type: l.type,
        hours: Number(l.hours),
        date: l.date,
        supervisor_email: l.supervisor_email,
        reflection: l.reflection || "",
        status: l.status,
        student_name: profileMap.get(l.user_id)?.display_name || "Unknown",
      }));

      setStudents(studentList);
      setLogs(logEntries);
    } catch (err) {
      console.error("Unable to load career information. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Poll for updates instead of realtime subscription
    const interval = setInterval(fetchData, 30000);

    return () => { clearInterval(interval); };
  }, []);

  const handleApprove = async (logId: string) => {
    if (!user) return;
    try {
      await apiClient.put(`/api/experience-logs/${logId}`, {
        status: "approved",
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      });
      toast({ title: "Approved", description: "Experience log has been approved." });
      fetchData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to approve log.", variant: "destructive" });
    }
  };

  const handleReject = async (logId: string) => {
    if (!user) return;
    try {
      await apiClient.put(`/api/experience-logs/${logId}`, {
        status: "rejected",
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      });
      toast({ title: "Rejected", description: "Experience log has been rejected." });
      fetchData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to reject log.", variant: "destructive" });
    }
  };

  const filteredStudents = students.filter(s => s.display_name.toLowerCase().includes(search.toLowerCase()));
  const pendingCount = logs.filter(l => l.status === "pending").length;
  const totalHours = students.reduce((sum, s) => sum + s.total_logged_hours, 0);
  const quizCompletedCount = students.filter(s => s.quiz_completed).length;

  const filteredLogs = logs.filter(l => filterStatus === "all" || l.status === filterStatus);

  const viewStudent = (student: StudentData) => {
    setSelectedStudent(student);
    setStudentLogs(logs.filter(l => l.user_id === student.user_id));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 sm:grid-cols-4">{[1,2,3,4].map(i => <Skeleton key={i} className="h-24" />)}</div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Career Readiness</h1>
        <p className="text-sm text-muted-foreground mt-1">Review student career progress and approve logged hours</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: "Total Students", value: students.length, icon: Users, color: "text-primary" },
          { label: "Quiz Completed", value: `${quizCompletedCount}/${students.length}`, icon: Compass, color: "text-cyan" },
          { label: "Pending Approvals", value: pendingCount, icon: Clock, color: "text-orange" },
          { label: "Total Hours Logged", value: totalHours, icon: BarChart3, color: "text-magenta" },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card className="glass-card border-border/30">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                  <stat.icon className={cn("w-5 h-5", stat.color)} />
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">{stat.value}</p>
                  <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="students" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="students">Student Overview</TabsTrigger>
          <TabsTrigger value="approvals" className="relative">
            Hour Approvals
            {pendingCount > 0 && <span className="ml-1.5 w-5 h-5 rounded-full bg-orange text-white text-[10px] inline-flex items-center justify-center font-bold">{pendingCount}</span>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="mt-6 space-y-4">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary/50 border border-border/30 max-w-md">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search students..."
              className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full" />
          </div>

          {filteredStudents.length === 0 ? (
            <Card className="glass-card border-border/30">
              <CardContent className="p-12 text-center">
                <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No students found</h3>
                <p className="text-sm text-muted-foreground">Students will appear here once they sign up and create their career profiles.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredStudents.map((student, i) => (
                <motion.div key={student.user_id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="glass-card border-border/30 hover:shadow-medium transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl bg-gradient-brand flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">
                          {student.display_name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-sm text-foreground">{student.display_name}</p>
                            {student.quiz_completed && <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">{student.personality_type}</Badge>}
                          </div>
                          <div className="flex items-center gap-4 mt-1.5 text-xs text-muted-foreground">
                            <span>{student.total_logged_hours} hrs logged</span>
                            <span>Roadmap: {student.roadmap_completion}%</span>
                          </div>
                          <Progress value={student.roadmap_completion} className="h-1.5 mt-2 max-w-xs" />
                        </div>
                        <div className="flex items-center gap-2">
                          {student.career_interests.slice(0, 2).map(c => (
                            <Badge key={c} variant="outline" className="text-[10px] hidden sm:inline-flex">{c}</Badge>
                          ))}
                          <Button variant="ghost" size="sm" onClick={() => viewStudent(student)}><Eye className="w-4 h-4" /></Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="approvals" className="mt-6 space-y-4">
          <div className="flex gap-2">
            {["all", "pending", "approved", "rejected"].map(status => (
              <Button key={status} variant={filterStatus === status ? "default" : "outline"} size="sm" onClick={() => setFilterStatus(status)}
                className="text-xs capitalize">{status}</Button>
            ))}
          </div>

          {filteredLogs.length === 0 ? (
            <Card className="glass-card border-border/30">
              <CardContent className="p-12 text-center">
                <CheckCircle2 className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">All caught up!</h3>
                <p className="text-sm text-muted-foreground">No experience logs matching this filter.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredLogs.map((log, i) => (
                <motion.div key={log.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <Card className="glass-card border-border/30">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-sm text-foreground">{log.title}</p>
                            <Badge variant={log.status === "approved" ? "default" : log.status === "rejected" ? "destructive" : "secondary"} className="text-[10px]">{log.status}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{log.student_name} • {log.type} • {log.hours} hrs • {new Date(log.date).toLocaleDateString()}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Supervisor: {log.supervisor_email}</p>
                          {log.reflection && <p className="text-xs text-muted-foreground italic mt-2 p-2 bg-secondary/30 rounded-lg">"{log.reflection}"</p>}
                        </div>
                        {log.status === "pending" && (
                          <div className="flex gap-1.5 shrink-0">
                            <Button variant="outline" size="sm" onClick={() => handleApprove(log.id)}
                              className="text-emerald-600 border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 gap-1 text-xs">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleReject(log.id)}
                              className="text-destructive border-destructive/30 hover:bg-destructive/5 gap-1 text-xs">
                              <XCircle className="w-3.5 h-3.5" /> Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Student Detail Dialog */}
      <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedStudent && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center text-primary-foreground font-bold text-sm">
                    {selectedStudent.display_name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <span className="block">{selectedStudent.display_name}</span>
                    <span className="text-xs text-muted-foreground font-normal">{selectedStudent.personality_type || "Quiz not taken"}</span>
                  </div>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 rounded-lg bg-secondary/50">
                    <p className="text-lg font-bold text-foreground">{selectedStudent.roadmap_completion}%</p>
                    <p className="text-[10px] text-muted-foreground">Roadmap</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-secondary/50">
                    <p className="text-lg font-bold text-foreground">{selectedStudent.total_logged_hours}</p>
                    <p className="text-[10px] text-muted-foreground">Hours</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-secondary/50">
                    <p className="text-lg font-bold text-foreground">{studentLogs.length}</p>
                    <p className="text-[10px] text-muted-foreground">Experiences</p>
                  </div>
                </div>
                {selectedStudent.career_interests.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedStudent.career_interests.map(c => <Badge key={c} variant="outline" className="text-xs">{c}</Badge>)}
                  </div>
                )}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-foreground">Experience Logs</h4>
                  {studentLogs.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No experiences logged yet.</p>
                  ) : (
                    studentLogs.map(log => (
                      <div key={log.id} className="p-3 rounded-lg border border-border/30 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-foreground">{log.title}</p>
                          <Badge variant={log.status === "approved" ? "default" : log.status === "rejected" ? "destructive" : "secondary"} className="text-[10px]">{log.status}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{log.type} • {log.hours} hrs • {new Date(log.date).toLocaleDateString()}</p>
                        {log.reflection && <p className="text-xs italic text-muted-foreground">"{log.reflection}"</p>}
                        {log.status === "pending" && (
                          <div className="flex gap-2 pt-1">
                            <Button variant="outline" size="sm" onClick={() => handleApprove(log.id)} className="text-xs text-emerald-600 gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Approve
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleReject(log.id)} className="text-xs text-destructive gap-1">
                              <XCircle className="w-3 h-3" /> Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
