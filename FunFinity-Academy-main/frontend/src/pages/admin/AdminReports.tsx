import { motion } from "framer-motion";
import { FileText, Download, BarChart3, Users, DollarSign, BookOpen, Calendar, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from "recharts";

const revenueData = [
  { month: "Sep", revenue: 0 }, { month: "Oct", revenue: 0 }, { month: "Nov", revenue: 0 },
  { month: "Dec", revenue: 0 }, { month: "Jan", revenue: 0 }, { month: "Feb", revenue: 0 },
];

const performanceData = [
  { week: "W1", avgScore: 0, submissions: 0 }, { week: "W2", avgScore: 0, submissions: 0 },
  { week: "W3", avgScore: 0, submissions: 0 }, { week: "W4", avgScore: 0, submissions: 0 },
  { week: "W5", avgScore: 0, submissions: 0 }, { week: "W6", avgScore: 0, submissions: 0 },
];

const reports: any[] = [];

const reportTypeColor: Record<string, string> = {
  Performance: "bg-cyan/10 text-cyan border-cyan/20",
  Enrollment: "bg-primary/10 text-primary border-primary/20",
  Financial: "bg-accent/10 text-accent border-accent/20",
  Academic: "bg-magenta/10 text-magenta border-magenta/20",
};

const fadeIn = (d: number) => ({ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, delay: d } });

export default function AdminReports() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <motion.div {...fadeIn(0)}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Advanced Reporting</h1>
            <p className="text-muted-foreground text-sm mt-1">Generate, view, and export comprehensive platform reports</p>
          </div>
          <div className="flex gap-2">
            <Button variant="heroOutline" size="default"><Calendar className="w-4 h-4 mr-2" /> Schedule Report</Button>
            <Button variant="hero" size="default"><FileText className="w-4 h-4 mr-2" /> Generate Report</Button>
          </div>
        </div>
      </motion.div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div {...fadeIn(0.1)} className="platform-card p-6">
          <h2 className="font-display text-base font-semibold text-foreground mb-4">Revenue Trend</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} formatter={(v: number) => [`$${v.toLocaleString()}`, "Revenue"]} />
              <Area type="monotone" dataKey="revenue" stroke="hsl(var(--accent))" fill="hsl(var(--accent) / 0.1)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div {...fadeIn(0.2)} className="platform-card p-6">
          <h2 className="font-display text-base font-semibold text-foreground mb-4">Performance & Submissions</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              <Bar dataKey="submissions" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Export */}
      <motion.div {...fadeIn(0.3)} className="platform-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-base font-semibold text-foreground">Quick Export</h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            { label: "User Performance", format: "CSV", desc: "All students with scores, progress, activity" },
            { label: "Enrollment Stats", format: "PDF", desc: "Enrollment by course, date, and status" },
            { label: "Revenue Report", format: "Excel", desc: "Monthly revenue, billing, and invoices" },
          ].map((exp) => (
            <button key={exp.label} className="platform-card p-4 text-left hover:border-primary/30 transition-colors group">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-foreground">{exp.label}</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">{exp.format}</span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">{exp.desc}</p>
              <span className="text-xs text-primary flex items-center gap-1 group-hover:underline">
                <Download className="w-3 h-3" /> Download
              </span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Generated Reports */}
      <motion.div {...fadeIn(0.4)}>
        <h2 className="font-display text-lg font-semibold text-foreground mb-3">Generated Reports</h2>
        <div className="space-y-2">
          {reports.length === 0 ? (
            <div className="platform-card p-12 flex flex-col items-center justify-center text-center">
              <FileText className="w-12 h-12 text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground text-sm">No reports generated</p>
            </div>
          ) : (
            reports.map((r, i) => (
              <motion.div key={r.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.04 }}
                className="platform-card p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                  <r.icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{r.title}</p>
                  <p className="text-xs text-muted-foreground">{r.pages} pages · Generated {r.generated}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${reportTypeColor[r.type]} hidden sm:inline-flex`}>{r.type}</span>
                <div className="flex gap-2 shrink-0">
                  <Button variant="ghost" size="sm" className="text-primary"><Download className="w-3 h-3 mr-1" /> PDF</Button>
                  <Button variant="ghost" size="sm" className="text-primary"><Download className="w-3 h-3 mr-1" /> CSV</Button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}
