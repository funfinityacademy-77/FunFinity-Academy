import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, Award, Clock, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardChartsProps {
  quizSubmissions: any[];
  studyTimeData: any[];
  courseProgress: any[];
  className?: string;
}

const COLORS = ['#06b6d4', '#ec4899', '#f97316', '#8b5cf6', '#10b981'];

export function LearningProgressChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
        <XAxis 
          dataKey="date" 
          className="text-xs text-muted-foreground"
          stroke="hsl(var(--muted-foreground))"
        />
        <YAxis 
          className="text-xs text-muted-foreground"
          stroke="hsl(var(--muted-foreground))"
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '12px',
            minWidth: '150px',
          }}
          labelStyle={{
            minWidth: '120px',
            fontWeight: 600,
          }}
          itemStyle={{
            minWidth: '120px',
          }}
        />
        <Area 
          type="monotone" 
          dataKey="progress" 
          stroke="#06b6d4" 
          fillOpacity={1} 
          fill="url(#colorProgress)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function QuizPerformanceChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
        <XAxis 
          dataKey="date" 
          className="text-xs text-muted-foreground"
          stroke="hsl(var(--muted-foreground))"
        />
        <YAxis 
          domain={[0, 100]}
          className="text-xs text-muted-foreground"
          stroke="hsl(var(--muted-foreground))"
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '12px',
            minWidth: '150px',
          }}
          labelStyle={{
            minWidth: '120px',
            fontWeight: 600,
          }}
          itemStyle={{
            minWidth: '120px',
          }}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="score" 
          stroke="#ec4899" 
          strokeWidth={2}
          dot={{ fill: '#ec4899', strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6 }}
          name="Quiz Score"
        />
        <Line 
          type="monotone" 
          dataKey="average" 
          stroke="#8b5cf6" 
          strokeWidth={2}
          strokeDasharray="5 5"
          dot={false}
          name="Class Average"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function StudyTimeChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
        <XAxis 
          dataKey="day" 
          className="text-xs text-muted-foreground"
          stroke="hsl(var(--muted-foreground))"
        />
        <YAxis 
          className="text-xs text-muted-foreground"
          stroke="hsl(var(--muted-foreground))"
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '12px',
            minWidth: '150px',
          }}
          labelStyle={{
            minWidth: '120px',
            fontWeight: 600,
          }}
          itemStyle={{
            minWidth: '120px',
          }}
        />
        <Bar dataKey="minutes" fill="#f97316" radius={[8, 8, 0, 0]} name="Study Time (min)" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function CourseDistributionChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '12px',
            minWidth: '150px',
          }}
          labelStyle={{
            minWidth: '120px',
            fontWeight: 600,
          }}
          itemStyle={{
            minWidth: '120px',
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function DashboardCharts({ quizSubmissions, studyTimeData, courseProgress, className }: DashboardChartsProps) {
  // Transform quiz submissions for chart
  const quizData = quizSubmissions?.slice(0, 10).map((sub, index) => ({
    date: new Date(sub.completed_at || sub.submitted_at).toLocaleDateString(),
    score: sub.score || 0,
    average: 75 + Math.random() * 15, // Simulated class average
  })) || [];

  // Generate study time data for last 7 days
  const studyData = studyTimeData || Array.from({ length: 7 }, (_, i) => ({
    day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
    minutes: Math.floor(Math.random() * 120) + 30,
  }));

  // Course progress distribution
  const courseDistData = courseProgress || [
    { name: 'Mathematics', value: 35 },
    { name: 'Science', value: 25 },
    { name: 'Coding', value: 20 },
    { name: 'History', value: 12 },
    { name: 'Other', value: 8 },
  ];

  // Learning progress over time
  const progressData = Array.from({ length: 10 }, (_, i) => ({
    date: new Date(Date.now() - (9 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
    progress: 20 + i * 8 + Math.random() * 5,
  }));

  return (
    <div className={cn("space-y-6", className)}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Learning Progress Chart */}
        <div className="platform-card p-6 rounded-2xl">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-cyan" />
            <h3 className="font-semibold text-foreground">Learning Progress</h3>
          </div>
          <LearningProgressChart data={progressData} />
        </div>

        {/* Quiz Performance Chart */}
        <div className="platform-card p-6 rounded-2xl">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-magenta" />
            <h3 className="font-semibold text-foreground">Quiz Performance</h3>
          </div>
          <QuizPerformanceChart data={quizData} />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Study Time Chart */}
        <div className="platform-card p-6 rounded-2xl">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-orange" />
            <h3 className="font-semibold text-foreground">Study Time (Last 7 Days)</h3>
          </div>
          <StudyTimeChart data={studyData} />
        </div>

        {/* Course Distribution Chart */}
        <div className="platform-card p-6 rounded-2xl">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-purple" />
            <h3 className="font-semibold text-foreground">Course Distribution</h3>
          </div>
          <CourseDistributionChart data={courseDistData} />
        </div>
      </motion.div>
    </div>
  );
}
