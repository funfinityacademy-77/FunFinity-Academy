import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Users, BookOpen, Award } from "lucide-react";

const enrollmentData = [
  { month: "Sep", students: 0 }, { month: "Oct", students: 0 }, { month: "Nov", students: 0 },
  { month: "Dec", students: 0 }, { month: "Jan", students: 0 }, { month: "Feb", students: 0 },
];

const completionData = [
  { week: "W1", rate: 0 }, { week: "W2", rate: 0 }, { week: "W3", rate: 0 },
  { week: "W4", rate: 0 }, { week: "W5", rate: 0 }, { week: "W6", rate: 0 },
];

const subjectData = [
  { name: "Mathematics", value: 1, color: "#00d4ff" }, // 1 to prevent pie chart error, visually near zero
  { name: "Science", value: 1, color: "#ff6b35" },
  { name: "Literature", value: 1, color: "#c835d4" },
  { name: "Coding", value: 1, color: "#22c55e" },
];

const kpis = [
  { label: "Avg Session Time", value: "0 min", icon: TrendingUp, color: "cyan" },
  { label: "DAU", value: "0", icon: Users, color: "magenta" },
  { label: "Course Completions", value: "0", icon: BookOpen, color: "orange" },
  { label: "Certs Issued", value: "0", icon: Award, color: "cyan" },
];

const fadeIn = (d: number) => ({ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, delay: d } });

export default function AdminAnalytics() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <motion.div {...fadeIn(0)}>
        <h1 className="font-display text-2xl font-bold text-foreground">Platform Analytics</h1>
        <p className="text-muted-foreground text-sm mt-1">Comprehensive platform performance and engagement data</p>
      </motion.div>

      <motion.div {...fadeIn(0.1)} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className="platform-card p-4">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-${k.color}/10 mb-3`}>
              <k.icon className={`w-4 h-4 text-${k.color}`} />
            </div>
            <p className="font-display text-xl font-bold text-foreground">{k.value}</p>
            <p className="text-xs text-muted-foreground">{k.label}</p>
          </div>
        ))}
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div {...fadeIn(0.2)} className="platform-card p-6">
          <h2 className="font-display text-base font-semibold text-foreground mb-4">Monthly Enrollments</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={enrollmentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              <Bar dataKey="students" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div {...fadeIn(0.3)} className="platform-card p-6">
          <h2 className="font-display text-base font-semibold text-foreground mb-4">Completion Rate Trend</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={completionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              <Line type="monotone" dataKey="rate" stroke="hsl(var(--accent))" strokeWidth={2} dot={{ fill: "hsl(var(--accent))", r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div {...fadeIn(0.4)} className="platform-card p-6">
          <h2 className="font-display text-base font-semibold text-foreground mb-4">Subject Distribution</h2>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width={180} height={180}>
              <PieChart>
                <Pie data={subjectData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                  {subjectData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 flex-1">
              {subjectData.map((s) => (
                <div key={s.name} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
                  <span className="text-sm text-foreground flex-1">{s.name}</span>
                  <span className="text-sm font-bold text-foreground">{s.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div {...fadeIn(0.5)} className="platform-card p-6">
          <h2 className="font-display text-base font-semibold text-foreground mb-4">Z-Score Analytics</h2>
          <div className="space-y-4">
            {[
              { label: "Mathematics", score: 0, color: "bg-cyan" },
              { label: "Science", score: 0, color: "bg-orange" },
              { label: "Literature", score: 0, color: "bg-magenta" },
              { label: "Coding", score: 0, color: "bg-primary" },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-foreground">{item.label}</span>
                  <span className={`text-sm font-bold ${item.score >= 0 ? "text-green-600" : "text-destructive"}`}>
                    {item.score >= 0 ? "+" : ""}{item.score.toFixed(1)}σ
                  </span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full`} style={{ width: `${Math.min(100, (item.score + 2) / 4 * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground mt-4">Standardized performance scores relative to platform average</p>
        </motion.div>
      </div>
    </div>
  );
}
