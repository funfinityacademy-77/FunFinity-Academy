import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, User, BookOpen, Clock, CheckCircle, AlertTriangle, 
  FileText, Settings, Eye, Download, ChevronRight, Activity, Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ParentalDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data - in production, this would come from the backend
  const childData = {
    name: 'Alex Johnson',
    age: 11,
    grade: '5th Grade',
    enrolledCourses: 3,
    completedCourses: 1,
    averageScore: 85,
    totalStudyTime: '24h 30m',
    lastActive: '2 hours ago'
  };

  const consentStatus = {
    dataProcessing: true,
    grantedDate: '2024-01-15',
    nextReview: '2024-07-15',
    marketingConsent: false
  };

  const recentActivity = [
    { type: 'course_completion', title: 'Completed: Introduction to Math', time: '2 hours ago' },
    { type: 'quiz_score', title: 'Quiz: Science - Score: 92%', time: '5 hours ago' },
    { type: 'study_session', title: 'Study Session: 45 minutes', time: '1 day ago' },
    { type: 'course_enrollment', title: 'Enrolled: History Basics', time: '2 days ago' }
  ];

  const courses = [
    { name: 'Introduction to Math', progress: 100, status: 'completed', score: 88 },
    { name: 'Science Fundamentals', progress: 65, status: 'in_progress', score: null },
    { name: 'History Basics', progress: 20, status: 'in_progress', score: null }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Shield className="w-8 h-8 text-primary" />
              Parental Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">Monitor and manage your child's educational journey</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
            <Button size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </motion.div>

        {/* Child Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-card to-primary/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{childData.name}</CardTitle>
                    <CardDescription className="text-base">
                      {childData.grade} • Age {childData.age}
                    </CardDescription>
                  </div>
                </div>
                <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-background/50 border border-border">
                  <p className="text-sm text-muted-foreground">Enrolled Courses</p>
                  <p className="text-2xl font-bold text-foreground">{childData.enrolledCourses}</p>
                </div>
                <div className="p-4 rounded-xl bg-background/50 border border-border">
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-foreground">{childData.completedCourses}</p>
                </div>
                <div className="p-4 rounded-xl bg-background/50 border border-border">
                  <p className="text-sm text-muted-foreground">Average Score</p>
                  <p className="text-2xl font-bold text-foreground">{childData.averageScore}%</p>
                </div>
                <div className="p-4 rounded-xl bg-background/50 border border-border">
                  <p className="text-sm text-muted-foreground">Study Time</p>
                  <p className="text-2xl font-bold text-foreground">{childData.totalStudyTime}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="consent">Consent</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid md:grid-cols-2 gap-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    Learning Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.title}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    Consent Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="text-sm font-medium">Data Processing Agreement</p>
                        <p className="text-xs text-muted-foreground">Signed on {consentStatus.grantedDate}</p>
                      </div>
                    </div>
                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                      Active
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
                    <div className="flex items-center gap-2">
                      <Eye className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Marketing Consent</p>
                        <p className="text-xs text-muted-foreground">
                          {consentStatus.marketingConsent ? 'Enabled' : 'Disabled'}
                        </p>
                      </div>
                    </div>
                    <Badge variant={consentStatus.marketingConsent ? 'default' : 'secondary'}>
                      {consentStatus.marketingConsent ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>

                  <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-blue-500" />
                      <p className="text-sm font-medium">Next Review Date</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{consentStatus.nextReview}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    Course Progress
                  </CardTitle>
                  <CardDescription>Track your child's learning journey across all enrolled courses</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {courses.map((course, index) => (
                    <div key={index} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{course.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {course.status === 'completed' ? 'Completed' : 'In Progress'}
                            {course.score && ` • Score: ${course.score}%`}
                          </p>
                        </div>
                        <Badge 
                          variant={course.status === 'completed' ? 'default' : 'secondary'}
                          className={course.status === 'completed' ? 'bg-green-500/10 text-green-500 border-green-500/20' : ''}
                        >
                          {course.status === 'completed' ? 'Completed' : `${course.progress}%`}
                        </Badge>
                      </div>
                      <Progress value={course.progress} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Consent Tab */}
          <TabsContent value="consent" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-2 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Data Processing Agreement
                  </CardTitle>
                  <CardDescription>Review and manage your consent preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 rounded-lg bg-muted/50 border border-border space-y-3">
                    <h4 className="font-semibold">Current Agreement</h4>
                    <p className="text-sm text-muted-foreground">
                      You have granted consent for your child to use FunFinity Academy's educational platform. 
                      This consent allows us to collect and process necessary educational data.
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Signed on {consentStatus.grantedDate}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-primary" />
                      <span>Next review: {consentStatus.nextReview}</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Consent Preferences</h4>
                    
                    <div className="flex items-center justify-between p-4 rounded-lg bg-background border border-border">
                      <div>
                        <p className="font-medium">Educational Data Processing</p>
                        <p className="text-sm text-muted-foreground">Required for platform functionality</p>
                      </div>
                      <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                        Required
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg bg-background border border-border">
                      <div>
                        <p className="font-medium">Marketing Communications</p>
                        <p className="text-sm text-muted-foreground">Receive educational updates and offers</p>
                      </div>
                      <Button variant="outline" size="sm">
                        {consentStatus.marketingConsent ? 'Disable' : 'Enable'}
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg bg-background border border-border">
                      <div>
                        <p className="font-medium">Analytics & Research</p>
                        <p className="text-sm text-muted-foreground">Contribute to platform improvement</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Manage
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium">Withdraw Consent</p>
                        <p className="text-muted-foreground mt-1">
                          You can withdraw your consent at any time. This will result in your child's account being deactivated 
                          and their data being deleted according to our data retention policy.
                        </p>
                        <Button variant="destructive" size="sm" className="mt-3">
                          Withdraw Consent
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>Detailed log of your child's platform activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 border border-border hover:bg-muted transition-colors">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          {activity.type === 'course_completion' && <CheckCircle className="w-5 h-5 text-green-500" />}
                          {activity.type === 'quiz_score' && <BookOpen className="w-5 h-5 text-primary" />}
                          {activity.type === 'study_session' && <Clock className="w-5 h-5 text-primary" />}
                          {activity.type === 'course_enrollment' && <User className="w-5 h-5 text-primary" />}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{activity.title}</p>
                          <p className="text-sm text-muted-foreground">{activity.time}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
