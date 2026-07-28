import { motion } from "framer-motion";
import { Search, PlusCircle, CheckCircle, Clock, XCircle, MoreVertical, BookOpen, Users, ShieldCheck, Grid, List, Filter, SortAsc, Calendar, Award, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchCourses } from "@/lib/data-service";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import CourseBuilderModal from "./AdminCourseBuilder";
import { useTheme } from "@/hooks/use-theme";

const statusColor: Record<string, string> = {
  Published: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  Review: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  Draft: "bg-muted-foreground/10 text-muted-foreground border-muted-foreground/20",
};

const statusIcon: Record<string, React.ReactNode> = {
  Published: <CheckCircle className="w-3 h-3" />,
  Review: <Clock className="w-3 h-3" />,
  Draft: <XCircle className="w-3 h-3" />,
};

export default function AdminCourses() {
  const { theme } = useTheme();
  const [filter, setFilter] = useState("All");
  const [sortBy, setSortBy] = useState("title");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const { data: courses, isLoading } = useQuery({
    queryKey: ["admin-courses"],
    queryFn: async () => {
      const result = await fetchCourses();
      return result?.data || [];
    },
    refetchInterval: 30000,
  });
  
  const filtered = courses.filter(c => 
    (filter === "All" || c.status === filter) &&
    (c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
     c.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     c.teacher?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSaveCourse = (courseData: any) => {
    console.log("Saving course:", courseData);
    // TODO: Implement actual save to Supabase
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-40 w-full rounded-xl" />
            ))}
          </div>
        </div>
      ) : (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Course Management</h1>
            <p className="text-muted-foreground text-sm mt-1">Review, approve, and manage all platform courses</p>
          </div>
          <Button variant="hero" size="default" onClick={() => setIsBuilderOpen(true)}>
            <PlusCircle className="w-4 h-4 mr-2" /> Add Course
          </Button>
        </div>

        {/* Enhanced Filters */}
        <Card className="border-border/30">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-secondary/50 border border-border/30 flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                <input 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  type="text" 
                  placeholder="Search courses by title, subject, teacher..." 
                  className="bg-transparent text-sm outline-none w-full text-foreground placeholder:text-muted-foreground" 
                />
              </div>
              
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Status</SelectItem>
                  <SelectItem value="Published">Published</SelectItem>
                  <SelectItem value="Review">Review</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="subject">Subject</SelectItem>
                  <SelectItem value="students">Students</SelectItem>
                  <SelectItem value="created">Created</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-1 border-l border-border/30 pl-3">
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="h-8 w-8 p-0"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="h-8 w-8 p-0"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border/30">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">{filtered.length} courses</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span className="text-sm text-muted-foreground">{courses.filter(c => c.status === 'Published').length} published</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-500" />
                <span className="text-sm text-muted-foreground">{courses.filter(c => c.status === 'Review').length} in review</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Courses Grid/List */}
        <Card className="border-border/30 overflow-hidden">
          <CardContent className="p-0">
            {viewMode === "grid" ? (
              <div className="p-4 grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.length === 0 ? (
                  <div className="col-span-full flex flex-col items-center justify-center py-12">
                    <BookOpen className="w-12 h-12 text-muted-foreground/30 mb-3" />
                    <p className="text-muted-foreground text-sm">No courses available</p>
                  </div>
                ) : (
                  filtered.map((course, i) => (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="relative group"
                    >
                      <Card className="cursor-pointer hover:shadow-medium transition-all overflow-hidden">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className={cn(
                              "w-12 h-12 rounded-xl flex items-center justify-center",
                              theme === 'dark' ? "bg-gradient-brand-soft" : "bg-gradient-to-br from-primary/20 to-accent/20"
                            )}>
                              <BookOpen className="w-5 h-5 text-primary" />
                            </div>
                            <Badge className={cn("text-[10px] font-medium", statusColor[course.status])}>
                              {statusIcon[course.status]}
                              <span className="ml-1">{course.status}</span>
                            </Badge>
                          </div>
                          <h3 className="font-semibold text-foreground text-sm mb-1">{course.title}</h3>
                          <p className="text-xs text-muted-foreground mb-3">{course.subject} · by {course.teacher}</p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {course.students} students
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {course.created_at ? new Date(course.created_at).toLocaleDateString() : 'N/A'}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/30 bg-secondary/20">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Course</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Subject</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Teacher</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Status</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Students</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden xl:table-cell">Created</th>
                      <th className="px-4 py-3 w-10" />
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-12 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <BookOpen className="w-12 h-12 text-muted-foreground/30 mb-3" />
                            <p className="text-muted-foreground text-sm">No courses available</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filtered.map((course, i) => (
                        <motion.tr
                          key={course.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.04 }}
                          className="border-b border-border/20 hover:bg-secondary/20 transition-colors cursor-pointer"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "w-10 h-10 rounded-lg flex items-center justify-center",
                                theme === 'dark' ? "bg-gradient-brand-soft" : "bg-gradient-to-br from-primary/20 to-accent/20"
                              )}>
                                <BookOpen className="w-4 h-4 text-primary" />
                              </div>
                              <span className="text-sm font-medium text-foreground">{course.title}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-muted-foreground">{course.subject}</span>
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            <span className="text-sm text-muted-foreground">{course.teacher}</span>
                          </td>
                          <td className="px-4 py-3 hidden sm:table-cell">
                            <Badge className={cn("text-[10px] font-medium", statusColor[course.status])}>
                              {statusIcon[course.status]}
                              <span className="ml-1">{course.status}</span>
                            </Badge>
                          </td>
                          <td className="px-4 py-3 hidden lg:table-cell">
                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {course.students}
                            </span>
                          </td>
                          <td className="px-4 py-3 hidden xl:table-cell">
                            <span className="text-sm text-muted-foreground">
                              {course.created_at ? new Date(course.created_at).toLocaleDateString() : 'N/A'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
      )}
      
      <CourseBuilderModal 
        isOpen={isBuilderOpen} 
        onClose={() => setIsBuilderOpen(false)}
        onSave={handleSaveCourse}
      />
    </div>
  );
}
