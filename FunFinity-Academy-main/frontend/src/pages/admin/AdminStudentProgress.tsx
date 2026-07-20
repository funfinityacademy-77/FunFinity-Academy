import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { Users, TrendingUp, TrendingDown, AlertTriangle, Star, Target } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

const classPerformance = [
  { name: "Algebra", avgScore: 0, submissions: 0, atRisk: 0 },
  { name: "Calculus", avgScore: 0, submissions: 0, atRisk: 0 },
  { name: "Statistics", avgScore: 0, submissions: 0, atRisk: 0 },
  { name: "Geometry", avgScore: 0, submissions: 0, atRisk: 0 },
];

const weeklyTrend = [
  { week: "W1", algebra: 0, calculus: 0, stats: 0, geometry: 0 },
  { week: "W2", algebra: 0, calculus: 0, stats: 0, geometry: 0 },
  { week: "W3", algebra: 0, calculus: 0, stats: 0, geometry: 0 },
  { week: "W4", algebra: 0, calculus: 0, stats: 0, geometry: 0 },
];

const scoreDistribution = [
  { range: "90-100", count: 1, color: "#22c55e" }, // 1 to prevent chart error
  { range: "80-89", count: 1, color: "#00d4ff" },
  { range: "70-79", count: 1, color: "#ff6b35" },
  { range: "60-69", count: 1, color: "#c835d4" },
  { range: "< 60", count: 1, color: "#ef4444" },
];

export default function TeacherProgress() {
  const { data: enrollments, isLoading } = useQuery({
    queryKey: ["admin-enrollments-progress"],
    queryFn: async () => {
      const data = await apiClient.get<any[]>('/api/enrollments');
      return data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const { data: quizSubmissions } = useQuery({
    queryKey: ["admin-quiz-submissions"],
    queryFn: async () => {
      const data = await apiClient.get<any[]>('/api/quiz-attempts?limit=50');
      return data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Calculate real data from backend
  const classPerformance = enrollments?.reduce((acc: any, enrollment: any) => {
    const subject = enrollment.courses?.subject || "General";
    if (!acc[subject]) {
      acc[subject] = { name: subject, avgScore: 0, submissions: 0, atRisk: 0, total: 0 };
    }
    acc[subject].total++;
    acc[subject].submissions += enrollment.progress || 0;
    if (enrollment.progress < 50) {
      acc[subject].atRisk++;
    }
    return acc;
  }, {}) || {};

  const performanceData = Object.values(classPerformance || {}).map((item: any) => ({
    name: item.name,
    avgScore: item.total > 0 ? Math.round(item.submissions / item.total) : 0,
    submissions: item.total > 0 ? Math.round((item.submissions / item.total) * 100) : 0,
    atRisk: item.atRisk
  }));

  const atRiskStudents = enrollments?.filter((e: any) => e.progress < 50).map((e: any) => ({
    name: e.profiles?.display_name || "Unknown",
    course: e.courses?.title || "Unknown",
    score: e.progress || 0,
    trend: "down",
    lastActive: new Date(e.updated_at).toLocaleDateString()
  })) || [];

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 py-8">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-bold text-foreground">Student Progress</h1>
        <p className="text-muted-foreground text-sm mt-1">Track performance trends across all your classes</p>
      </motion.div>

      {/* Class Cards */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {performanceData.length > 0 ? performanceData.map((cls) => (
          <div key={cls.name} className="platform-card p-4">
            <p className="font-display text-sm font-semibold text-foreground mb-2">{cls.name}</p>
            <p className={`font-display text-2xl font-bold ${cls.avgScore >= 75 ? "text-green-600" : "text-accent"}`}>{cls.avgScore}%</p>
            <div className="flex items-center justify-between mt-2 text-[10px] text-muted-foreground">
              <span>{cls.submissions}% submitted</span>
              {cls.atRisk > 0 && <span className="text-destructive font-medium">{cls.atRisk} at risk</span>}
            </div>
            <Progress value={cls.avgScore} className="h-1.5 mt-2" />
          </div>
        )) : (
          <div className="col-span-4 platform-card p-12 flex flex-col items-center justify-center text-center">
            <Users className="w-12 h-12 text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground text-sm">No enrollment data available</p>
          </div>
        )}
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Trend */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="platform-card p-6">
          <h2 className="font-display text-base font-semibold text-foreground mb-4">Weekly Score Trend</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={weeklyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              <Line type="monotone" dataKey="algebra" stroke="#00d4ff" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="calculus" stroke="#ff6b35" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="stats" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="geometry" stroke="#c835d4" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-3 justify-center">
            {[{ label: "Algebra", color: "#00d4ff" }, { label: "Calculus", color: "#ff6b35" }, { label: "Stats", color: "#22c55e" }, { label: "Geometry", color: "#c835d4" }].map(l => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: l.color }} />
                <span className="text-[10px] text-muted-foreground">{l.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Distribution */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="platform-card p-6">
          <h2 className="font-display text-base font-semibold text-foreground mb-4">Score Distribution</h2>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={scoreDistribution} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="count">
                  {scoreDistribution.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 flex-1">
              {scoreDistribution.map((s) => (
                <div key={s.range} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
                  <span className="text-sm text-foreground flex-1">{s.range}</span>
                  <span className="text-sm font-bold text-foreground">0</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* At Risk */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <h2 className="font-display text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-destructive" /> At-Risk Students
        </h2>
        <div className="space-y-2">
          {atRiskStudents.length === 0 ? (
            <div className="platform-card p-12 flex flex-col items-center justify-center text-center">
              <Users className="w-12 h-12 text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground text-sm">No at-risk students</p>
            </div>
          ) : (
            atRiskStudents.map((s) => (
              <div key={s.name} className="platform-card p-4 border-destructive/10 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center text-destructive text-xs font-bold shrink-0">
                  {s.name.split(" ").map((n: string) => n[0]).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.course} · Last active: {s.lastActive}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-destructive">{s.score}%</span>
                  {s.trend === "down" ? <TrendingDown className="w-4 h-4 text-destructive" /> : <Target className="w-4 h-4 text-muted-foreground" />}
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}

