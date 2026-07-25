import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, TrendingDown, BookOpen, Clock, Target, 
  Award, AlertCircle, Calendar, BarChart3, Users, 
  Settings, Bell, ChevronRight, Star
} from "lucide-react";
import { cn } from "@/lib/utils";
import ProfileAvatar from "@/components/profile/ProfileAvatar";

interface ChildData {
  id: string;
  name: string;
  email: string;
  grade: string;
  avatar?: string;
  dailyLearningMinutes: number;
  weeklyGoal: number;
  streak: number;
  coursesEnrolled: number;
  coursesCompleted: number;
  averageScore: number;
  skillGaps: string[];
  activeSubscription: boolean;
  lastActive: Date;
}

interface ParentDashboardProps {
  childId?: string;
}

const sampleChildData: ChildData = {
  id: "1",
  name: "Alex Johnson",
  email: "alex.johnson@example.com",
  grade: "10th Grade",
  dailyLearningMinutes: 45,
  weeklyGoal: 300,
  streak: 7,
  coursesEnrolled: 5,
  coursesCompleted: 2,
  averageScore: 87,
  skillGaps: ["Algebra", "Chemistry"],
  activeSubscription: true,
  lastActive: new Date(),
};

/**
 * Parent Portal Dashboard
 * Aggregated, read-only analytical dashboard for parents to track their child's
 * daily learning metrics, skill gaps, and active subscriptions.
 */
export default function ParentDashboard({ childId }: ParentDashboardProps) {
  const [childData, setChildData] = useState<ChildData>(sampleChildData);
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month" | "year">("week");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data fetch
    setTimeout(() => setLoading(false), 1000);
  }, [childId]);

  const weeklyProgress = (childData.dailyLearningMinutes * 7) / childData.weeklyGoal * 100;
  const isOnTrack = weeklyProgress >= 80;

  const metrics = [
    {
      label: "Daily Learning",
      value: `${childData.dailyLearningMinutes} min`,
      target: `${Math.round(childData.weeklyGoal / 7)} min`,
      trend: childData.dailyLearningMinutes >= 45 ? "up" : "down",
      icon: Clock,
      color: "text-blue-500",
    },
    {
      label: "Courses Completed",
      value: childData.coursesCompleted,
      target: childData.coursesEnrolled,
      trend: "up",
      icon: BookOpen,
      color: "text-green-500",
    },
    {
      label: "Average Score",
      value: `${childData.averageScore}%`,
      target: "85%",
      trend: childData.averageScore >= 85 ? "up" : "down",
      icon: Target,
      color: "text-purple-500",
    },
    {
      label: "Current Streak",
      value: `${childData.streak} days`,
      target: "7 days",
      trend: childData.streak >= 7 ? "up" : "down",
      icon: Award,
      color: "text-orange-500",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/30 bg-secondary/5">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <ProfileAvatar name={childData.name} email={childData.email} size="lg" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">{childData.name}</h1>
                <p className="text-sm text-muted-foreground">{childData.grade} • Parent Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" size="sm">
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Period Selector */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center gap-2 mb-6">
          {(["week", "month", "year"] as const).map((period) => (
            <Button
              key={period}
              variant={selectedPeriod === period ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setSelectedPeriod(period)}
              className="capitalize"
            >
              {period}
            </Button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading dashboard...</div>
        ) : (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {metrics.map((metric) => (
                <Card key={metric.label} className="border-border/30">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <metric.icon className={cn("w-5 h-5", metric.color)} />
                      {metric.trend === "up" ? (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                    <p className="text-2xl font-bold text-foreground">{metric.value}</p>
                    <p className="text-xs text-muted-foreground">{metric.label}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Target: {metric.target}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Weekly Progress */}
            <Card className="border-border/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground">Weekly Learning Progress</h3>
                  <Badge variant={isOnTrack ? "default" : "destructive"}>
                    {isOnTrack ? "On Track" : "Behind"}
                  </Badge>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Weekly Goal</span>
                    <span className="font-medium">{childData.weeklyGoal} min</span>
                  </div>
                  <div className="w-full bg-secondary/50 rounded-full h-3">
                    <div
                      className={cn(
                        "h-3 rounded-full transition-all",
                        isOnTrack ? "bg-green-500" : "bg-orange-500"
                      )}
                      style={{ width: `${Math.min(weeklyProgress, 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Current Progress</span>
                    <span className="font-medium">{Math.round(weeklyProgress)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Skill Gaps */}
              <Card className="border-border/30">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertCircle className="w-5 h-5 text-amber-500" />
                    <h3 className="font-semibold text-foreground">Skill Gaps</h3>
                  </div>
                  {childData.skillGaps.length > 0 ? (
                    <div className="space-y-2">
                      {childData.skillGaps.map((gap) => (
                        <div
                          key={gap}
                          className="flex items-center justify-between p-3 rounded-lg bg-amber-500/10 border border-amber-500/20"
                        >
                          <span className="text-sm font-medium">{gap}</span>
                          <Button variant="outline" size="sm" className="h-8">
                            View Resources
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No skill gaps detected</p>
                  )}
                </CardContent>
              </Card>

              {/* Subscription Status */}
              <Card className="border-border/30">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Star className="w-5 h-5 text-yellow-500" />
                    <h3 className="font-semibold text-foreground">Subscription Status</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Status</span>
                      <Badge variant={childData.activeSubscription ? "default" : "secondary"}>
                        {childData.activeSubscription ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Plan</span>
                      <span className="text-sm font-medium">Premium</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Renewal Date</span>
                      <span className="text-sm font-medium">Dec 15, 2024</span>
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-2">
                      Manage Subscription
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="border-border/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground">Recent Activity</h3>
                  <Button variant="ghost" size="sm">
                    View All
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
                <div className="space-y-3">
                  {[
                    { action: "Completed Mathematics Quiz", time: "2 hours ago", type: "achievement" },
                    { action: "Started Chemistry Course", time: "Yesterday", type: "progress" },
                    { action: "Earned 'Quick Learner' Badge", time: "2 days ago", type: "badge" },
                  ].map((activity) => (
                    <div
                      key={activity.action}
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/30"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center",
                            activity.type === "achievement" && "bg-green-500/20 text-green-500",
                            activity.type === "progress" && "bg-blue-500/20 text-blue-500",
                            activity.type === "badge" && "bg-yellow-500/20 text-yellow-500"
                          )}
                        >
                          {activity.type === "achievement" && <Target className="w-4 h-4" />}
                          {activity.type === "progress" && <BookOpen className="w-4 h-4" />}
                          {activity.type === "badge" && <Award className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{activity.action}</p>
                          <p className="text-xs text-muted-foreground">{activity.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-border/30">
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Button variant="outline" size="sm" className="gap-2">
                    <BarChart3 className="w-4 h-4" />
                    View Reports
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Calendar className="w-4 h-4" />
                    Schedule
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Users className="w-4 h-4" />
                    Contact Teacher
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Settings className="w-4 h-4" />
                    Account Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
