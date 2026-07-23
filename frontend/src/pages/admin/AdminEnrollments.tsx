import { useState } from "react";
import { motion } from "framer-motion";
import { Search, PlusCircle, CheckCircle2, Clock, XCircle, Download, Users, BookOpen, ArrowRight, Award } from "lucide-react";
import { FunfinityIcon } from "@/components/brand/FunfinityLogo";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const enrollments: any[] = [];

const statusStyle: Record<string, string> = {
  Active: "text-cyan bg-cyan/10 border-cyan/20",
  "At Risk": "text-destructive bg-destructive/10 border-destructive/20",
  Completed: "text-green-600 bg-green-50 border-green-200",
  Pending: "text-accent bg-accent/10 border-accent/20",
};

const statusIcon: Record<string, React.ReactNode> = {
  Active: <CheckCircle2 className="w-3 h-3" />,
  "At Risk": <XCircle className="w-3 h-3" />,
  Completed: <CheckCircle2 className="w-3 h-3" />,
  Pending: <Clock className="w-3 h-3" />,
};

export default function AdminEnrollments() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const filtered = enrollments.filter(e =>
    (filter === "All" || e.status === filter) &&
    (e.student.toLowerCase().includes(search.toLowerCase()) || e.course.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Enrollment Management</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage student-course enrollments and track progress</p>
          </div>
          <div className="flex gap-2">
            <Button variant="heroOutline" size="default"><Download className="w-4 h-4 mr-2" /> Export</Button>
            <Button variant="hero" size="default"><PlusCircle className="w-4 h-4 mr-2" /> Enroll Student</Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {[
            { label: "Total Enrollments", value: "0", icon: Award, color: "primary" },
            { label: "Active Students", value: "0", icon: Users, color: "cyan" },
            { label: "Courses Offered", value: "0", icon: BookOpen, color: "accent" },
            { label: "Completion Rate", value: "0%", icon: CheckCircle2, color: "magenta" },
          ].map((s) => (
            <div key={s.label} className="platform-card p-4">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-${s.color}/10 mb-3`}>
                <s.icon className={`w-4 h-4 text-${s.color}`} />
              </div>
              <p className="font-display text-xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="platform-card p-4 flex flex-wrap items-center gap-3 mb-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-secondary/50 border border-border/30 flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input value={search} onChange={e => setSearch(e.target.value)} type="text" placeholder="Search students or courses..."
              className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full" />
          </div>
          <div className="flex gap-2">
            {["All", "Active", "At Risk", "Completed", "Pending"].map(s => (
              <button key={s} onClick={() => setFilter(s)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${filter === s ? "bg-primary/10 text-primary border-primary/30" : "border-border/30 text-muted-foreground hover:text-foreground hover:bg-secondary/50"}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="platform-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/30 bg-secondary/20">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Student</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Course</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Enrolled</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Progress</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <BookOpen className="w-12 h-12 text-muted-foreground/30 mb-3" />
                        <p className="text-muted-foreground text-sm">No enrollments found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((e, i) => (
                    <motion.tr key={e.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                      className="border-b border-border/20 hover:bg-secondary/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center text-white text-xs font-bold shrink-0">{e.avatar}</div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{e.student}</p>
                            <p className="text-[10px] text-muted-foreground truncate">{e.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3"><span className="text-sm text-foreground">{e.course}</span></td>
                      <td className="px-4 py-3 hidden md:table-cell"><span className="text-xs text-muted-foreground">{e.enrolledAt}</span></td>
                      <td className="px-4 py-3 hidden lg:table-cell w-32">
                        <div className="flex items-center gap-2">
                          <Progress value={e.progress} className="h-1.5 flex-1" />
                          <span className="text-xs text-muted-foreground">{e.progress}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusStyle[e.status]}`}>
                          {statusIcon[e.status]} {e.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button className="text-xs text-primary hover:underline flex items-center gap-0.5">View <ArrowRight className="w-3 h-3" /></button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-border/20 bg-secondary/10">
            <p className="text-xs text-muted-foreground">Showing {filtered.length} of {enrollments.length} enrollments</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
