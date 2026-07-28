import { motion } from "framer-motion";
import { FileText, Download, BarChart3, Users, BookOpen, Calendar, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const gradeData = [
  { course: "Algebra", A: 8, B: 12, C: 6, D: 2 },
  { course: "Calculus", A: 5, B: 9, C: 5, D: 3 },
  { course: "Statistics", A: 10, B: 10, C: 4, D: 1 },
  { course: "Geometry", A: 2, B: 4, C: 4, D: 2 },
];

const reports = [
  { id: 1, title: "Algebra Foundations - Grade Report Q1", generated: "Feb 20", students: 28, type: "Grade" },
  { id: 2, title: "Advanced Calculus - Progress Summary", generated: "Feb 18", students: 22, type: "Progress" },
  { id: 3, title: "Statistics 101 - Completion Report", generated: "Feb 15", students: 25, type: "Completion" },
  { id: 4, title: "All Classes - At-Risk Student Report", generated: "Feb 12", students: 10, type: "Risk" },
];

const typeColor: Record<string, string> = {
  Grade: "bg-cyan/10 text-cyan border-cyan/20",
  Progress: "bg-primary/10 text-primary border-primary/20",
  Completion: "bg-accent/10 text-accent border-accent/20",
  Risk: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function TeacherReports() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Grade Reports</h1>
            <p className="text-muted-foreground text-sm mt-1">Generate and export grade reports for your classes</p>
          </div>
          <Button variant="hero" size="default"><FileText className="w-4 h-4 mr-2" /> Generate Report</Button>
        </div>

        {/* Grade Distribution Chart */}
        <div className="platform-card p-6 mb-4">
          <h2 className="font-display text-base font-semibold text-foreground mb-4">Grade Distribution by Course</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={gradeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="course" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              <Bar dataKey="A" fill="#22c55e" radius={[2, 2, 0, 0]} />
              <Bar dataKey="B" fill="#00d4ff" radius={[2, 2, 0, 0]} />
              <Bar dataKey="C" fill="#ff6b35" radius={[2, 2, 0, 0]} />
              <Bar dataKey="D" fill="#ef4444" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-3 justify-center">
            {[{ l: "A (90+)", c: "#22c55e" }, { l: "B (80-89)", c: "#00d4ff" }, { l: "C (70-79)", c: "#ff6b35" }, { l: "D (<70)", c: "#ef4444" }].map(g => (
              <div key={g.l} className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full" style={{ background: g.c }} /><span className="text-[10px] text-muted-foreground">{g.l}</span></div>
            ))}
          </div>
        </div>

        {/* Quick Export */}
        <div className="grid sm:grid-cols-3 gap-3 mb-4">
          {[
            { label: "Full Gradebook", format: "CSV", desc: "All students, all assignments, all scores" },
            { label: "Progress Report", format: "PDF", desc: "Per-student progress summary with charts" },
            { label: "At-Risk Report", format: "PDF", desc: "Students below 70% with activity data" },
          ].map((e) => (
            <button key={e.label} className="platform-card p-4 text-left hover:border-primary/30 transition-colors group">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-foreground">{e.label}</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">{e.format}</span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">{e.desc}</p>
              <span className="text-xs text-primary flex items-center gap-1 group-hover:underline"><Download className="w-3 h-3" /> Download</span>
            </button>
          ))}
        </div>

        {/* Generated Reports */}
        <h2 className="font-display text-lg font-semibold text-foreground mb-3">Recent Reports</h2>
        <div className="space-y-2">
          {reports.map((r, i) => (
            <motion.div key={r.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
              className="platform-card p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{r.title}</p>
                <p className="text-xs text-muted-foreground">{r.students} students · Generated {r.generated}</p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${typeColor[r.type]} hidden sm:inline-flex`}>{r.type}</span>
              <Button variant="ghost" size="sm" className="text-primary"><Download className="w-3 h-3 mr-1" /> PDF</Button>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
