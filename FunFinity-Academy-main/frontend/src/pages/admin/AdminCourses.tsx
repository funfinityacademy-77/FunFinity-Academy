import { motion } from "framer-motion";
import { Search, PlusCircle, CheckCircle, Clock, XCircle, MoreVertical, BookOpen, Users, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchCourses } from "@/lib/data-service";
import { Skeleton } from "@/components/ui/skeleton";
import CourseBuilderModal from "./AdminCourseBuilder";

const statusColor: Record<string, string> = {
  Published: "text-green-600 bg-green-50 border-green-200",
  Review: "text-orange bg-orange/10 border-orange/20",
  Draft: "text-muted-foreground bg-secondary border-border",
};

const statusIcon: Record<string, React.ReactNode> = {
  Published: <CheckCircle className="w-3 h-3" />,
  Review: <Clock className="w-3 h-3" />,
  Draft: <XCircle className="w-3 h-3" />,
};

export default function AdminCourses() {
  const [filter, setFilter] = useState("All");
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const { data: courses, isLoading } = useQuery({
    queryKey: ["admin-courses"],
    queryFn: async () => {
      const result = await fetchCourses();
      return result?.data || [];
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
  
  const filtered = filter === "All" ? courses : courses.filter(c => c.status === filter);

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

        <div className="platform-card p-4 flex flex-wrap items-center gap-3 mb-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-secondary/50 border border-border/30 flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input type="text" placeholder="Search courses..." className="bg-transparent text-sm outline-none w-full text-foreground placeholder:text-muted-foreground" />
          </div>
          <div className="flex gap-2">
            {["All", "Published", "Review", "Draft"].map(s => (
              <button key={s} onClick={() => setFilter(s)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${filter === s ? "bg-primary/10 text-primary border-primary/30" : "border-border/30 text-muted-foreground hover:text-foreground hover:bg-secondary/50"}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.length === 0 ? (
            <div className="col-span-full platform-card p-12 flex flex-col items-center justify-center text-center">
              <BookOpen className="w-12 h-12 text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground text-sm">No courses available</p>
            </div>
          ) : (
            filtered.map((course, i) => (
              <motion.div key={course.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="platform-card p-4 hover:shadow-medium transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-brand-soft flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-primary" />
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusColor[course.status]}`}>
                    {statusIcon[course.status]} {course.status}
                  </span>
                </div>
                <h3 className="font-semibold text-foreground text-sm mb-1">{course.title}</h3>
                <p className="text-xs text-muted-foreground mb-3">{course.subject} · by {course.teacher}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" />{course.students} students</span>
                  <span>{course.lessons} lessons</span>
                </div>
                  <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-border/20">
                    <button className="w-full py-1.5 rounded-lg text-xs font-bold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all flex items-center justify-center gap-2 group">
                      <ShieldCheck className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                      Run AI Vibe Check
                    </button>
                    <div className="flex gap-2">
                      <button className="flex-1 py-1.5 rounded-lg text-xs font-medium bg-green-50 text-green-600 border border-green-200 hover:bg-green-100 transition-colors">Approve</button>
                      <button className="flex-1 py-1.5 rounded-lg text-xs font-medium bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 transition-colors">Reject</button>
                    </div>
                  </div>
              </motion.div>
            ))
          )}
        </div>
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
