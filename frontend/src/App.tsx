import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import ConsentLoader from "@/lib/consentScriptLoader";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, useNavigationType } from "react-router-dom";
import { ThemeProvider } from "@/hooks/use-theme";
import { NotificationProvider } from "@/hooks/use-notifications";
import { AccessibilityProvider } from "@/hooks/use-accessibility";
import { AnnouncementProvider } from "@/hooks/use-announcements";
import { AuthProvider } from "@/hooks/use-auth";
import { CareerProvider } from "@/hooks/use-career";
import { LearningDNAProvider } from "@/hooks/use-learning-dna";
import { StudentPreferencesProvider } from "@/hooks/use-student-preferences";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SkeletonLoader } from "@/components/ui/skeleton-loader";
import { Suspense, useEffect, useState, lazy } from "react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { AgeGate } from "@/components/compliance/AgeGate";
import { ParentalConsent, ParentalConsentData } from "@/components/compliance/ParentalConsent";
import { AppLayout } from "./components/layout/AppLayout";
import { AdminLayout } from "./components/layout/AdminLayout";

// Code-splitting: Lazy load pages to reduce initial bundle size by ~40%
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const DemoSimulation = lazy(() => import("./pages/DemoSimulation"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ErrorPage = lazy(() => import("./pages/ErrorPage"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const RefundPolicy = lazy(() => import("./pages/RefundPolicy"));
const Contact = lazy(() => import("./pages/Contact"));
const AccountBanned = lazy(() => import("./pages/AccountBanned"));
const StudentResources = lazy(() => import("./pages/StudentResources"));
const BugReport = lazy(() => import("./pages/app/BugReport"));

// Student App pages - code split
const Dashboard = lazy(() => import("./pages/app/Dashboard"));
const Courses = lazy(() => import("./pages/app/Courses"));
const CourseDetail = lazy(() => import("./pages/app/CourseDetail"));
const VideoPlayer = lazy(() => import("./pages/app/VideoPlayer"));
const CodingConsole = lazy(() => import("./pages/app/CodingConsole"));
const MyLearning = lazy(() => import("./pages/app/MyLearning"));
const Quizzes = lazy(() => import("./pages/app/Quizzes"));
const LiveClasses = lazy(() => import("./pages/app/LiveClasses"));
const Chat = lazy(() => import("./pages/app/Chat"));
const Leaderboard = lazy(() => import("./pages/app/Leaderboard"));
const Forums = lazy(() => import("./pages/app/Forums"));
const MasterCalendar = lazy(() => import("./pages/app/MasterCalendar"));
const Analytics = lazy(() => import("./pages/app/Analytics"));
const Bookmarks = lazy(() => import("./pages/app/Bookmarks"));
const Profile = lazy(() => import("./pages/app/Profile"));
const StudentSettings = lazy(() => import("./pages/app/StudentSettings"));
const HelpCenter = lazy(() => import("./pages/app/HelpCenter"));
const Notes = lazy(() => import("./pages/app/Notes"));
const AIToolkit = lazy(() => import("./pages/app/AIToolkit"));
const CareerPathfinder = lazy(() => import("./pages/app/CareerPathfinder"));
const CareerOpportunities = lazy(() => import("./pages/app/CareerOpportunities"));
const CareerExperience = lazy(() => import("./pages/app/CareerExperience"));
const CareerRoadmap = lazy(() => import("./pages/app/CareerRoadmap"));
const CareerPortfolio = lazy(() => import("./pages/app/CareerPortfolio"));
const LearningDNAQuestionnaire = lazy(() => import("./pages/app/LearningDNAQuestionnaire"));
const Badges = lazy(() => import("./pages/app/Badges"));
const Announcements = lazy(() => import("./pages/app/Announcements"));
const CourseMap = lazy(() => import("./pages/app/CourseMap"));
const CollegeUniversity = lazy(() => import("./pages/app/CollegeUniversity"));
const AcademicProfile = lazy(() => import("./pages/app/AcademicProfile"));
const StudyPlanner = lazy(() => import("./pages/app/StudyPlanner"));
const BackupSettings = lazy(() => import("./pages/app/settings/BackupSettings"));
const WelcomeGateway = lazy(() => import("./pages/app/WelcomeGateway"));
const CompactProfileQuiz = lazy(() => import("./pages/app/CompactProfileQuiz"));
const ProfileSummary = lazy(() => import("./pages/app/ProfileSummary"));
const InteractiveTour = lazy(() => import("./pages/app/InteractiveTour"));
const SecurityHold = lazy(() => import("./pages/app/SecurityHold"));

// Admin pages - code split
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics"));
const AdminCourses = lazy(() => import("./pages/admin/AdminCourses"));
const AdminAnnouncements = lazy(() => import("./pages/admin/AdminAnnouncements"));
const AdminActivityLogs = lazy(() => import("./pages/admin/AdminActivityLogs"));
const AdminEnrollments = lazy(() => import("./pages/admin/AdminEnrollments"));
const AdminReports = lazy(() => import("./pages/admin/AdminReports"));
const AdminBilling = lazy(() => import("./pages/admin/AdminBilling"));
const AdminLocalization = lazy(() => import("./pages/admin/AdminLocalization"));
const AdminRestrictions = lazy(() => import("./pages/admin/AdminRestrictions"));
const AdminClasses = lazy(() => import("./pages/admin/AdminClasses"));
const AdminGradebook = lazy(() => import("./pages/admin/AdminGradebook"));
const AdminLive = lazy(() => import("./pages/admin/AdminLive"));
const AdminStudentProgress = lazy(() => import("./pages/admin/AdminStudentProgress"));
const AdminCourseBuilder = lazy(() => import("./pages/admin/AdminCourseBuilder"));
const AdminResources = lazy(() => import("./pages/admin/AdminResources"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminMessages = lazy(() => import("./pages/admin/AdminMessages"));
const AdminSecurity = lazy(() => import("./pages/admin/AdminSecurity"));
const AdminMapEditor = lazy(() => import("./pages/admin/AdminMapEditor"));
const AdminQuizManager = lazy(() => import("./pages/admin/AdminQuizManager"));
const AdminAutomation = lazy(() => import("./pages/admin/AdminAutomation"));
const AdminBugReports = lazy(() => import("./pages/admin/AdminBugReports"));
const AdminCollegeUniversity = lazy(() => import("./pages/admin/AdminCollegeUniversity"));
const AdminAcademicProfiles = lazy(() => import("./pages/admin/AdminAcademicProfiles"));
const AdminFeedback = lazy(() => import("./pages/admin/AdminFeedback"));
const AdminBackgrounds = lazy(() => import("./pages/admin/AdminBackgrounds"));
const AdminNotifications = lazy(() => import("./pages/admin/AdminNotifications"));

const queryClient = new QueryClient();

// Scroll position restoration component
function ScrollRestoration() {
  const location = useLocation();

  useEffect(() => {
    // Preserve scroll position - don't scroll to top on navigation
    // This allows users to stay where they are when clicking sidebar links
    return;
  }, [location]);

  return null;
}

function InitConsentScripts() {
  useEffect(() => {
    // Initialize scripts if consent already stored
    ConsentLoader.initFromStoredConsent();
    const off = ConsentLoader.attachConsentListener();
    return () => { if (off) off(); };
  }, []);

  return null;
}

// Component to determine skeleton type based on route
function RouteSkeleton() {
  const location = useLocation();
  const path = location.pathname;

  // Determine skeleton type based on route
  if (path === '/app' || path === '/app/') return <SkeletonLoader type="dashboard" />;
  if (path.startsWith('/app/courses')) return <SkeletonLoader type="card" count={3} />;
  if (path.startsWith('/app/settings')) return <SkeletonLoader type="page" />;
  if (path.startsWith('/app/learning-dna')) return <SkeletonLoader type="page" />;
  if (path.startsWith('/app/ai')) return <SkeletonLoader type="page" />;
  if (path.startsWith('/app/career')) return <SkeletonLoader type="card" count={3} />;
  if (path.startsWith('/app/quizzes')) return <SkeletonLoader type="list" count={5} />;
  if (path.startsWith('/app/live-classes')) return <SkeletonLoader type="card" count={3} />;
  if (path.startsWith('/app/forums')) return <SkeletonLoader type="list" count={5} />;
  if (path.startsWith('/app/calendar')) return <SkeletonLoader type="page" />;
  if (path.startsWith('/app/notes')) return <SkeletonLoader type="list" count={5} />;
  if (path.startsWith('/app/badges')) return <SkeletonLoader type="card" count={4} />;
  if (path.startsWith('/app/leaderboard')) return <SkeletonLoader type="table" />;
  if (path.startsWith('/app/profile')) return <SkeletonLoader type="page" />;
  if (path.startsWith('/admin')) return <SkeletonLoader type="dashboard" />;
  if (path === '/auth') return <SkeletonLoader type="page" />;
  
  return <SkeletonLoader type="page" />;
}



const App = () => {
  const [ageVerified, setAgeVerified] = useState(false);
  const [parentalConsentRequired, setParentalConsentRequired] = useState(false);
  const [parentalConsentCompleted, setParentalConsentCompleted] = useState(false);

  const handleAgeVerified = () => {
    setAgeVerified(true);
  };

  const handleParentalConsentRequired = () => {
    setParentalConsentRequired(true);
  };

  const handleParentalConsentComplete = (consentData: ParentalConsentData) => {
    setParentalConsentCompleted(true);
    setParentalConsentRequired(false);
    setAgeVerified(true);
    console.log('Parental consent completed:', consentData);
  };

  const handleParentalConsentCancel = () => {
    setParentalConsentRequired(false);
    // User declined consent, redirect to home or show message
  };

  return (
    <>
      <AgeGate 
        onVerified={handleAgeVerified}
        onParentalConsentRequired={handleParentalConsentRequired}
      />
      <ParentalConsent
        isOpen={parentalConsentRequired}
        onComplete={handleParentalConsentComplete}
        onCancel={handleParentalConsentCancel}
      />
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <NotificationProvider>
              <AccessibilityProvider>
                <AnnouncementProvider>
                  <CareerProvider>
                    <LearningDNAProvider>
                      <StudentPreferencesProvider>
                        <Toaster />
                        <Sonner />
                        {/* Initialize consent-aware third-party scripts */}
                        <InitConsentScripts />
                        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                          <ScrollRestoration />
                          <Suspense fallback={<RouteSkeleton />}>
                            <div className="spacing-compact" role="application">
                              <Routes>
                                <Route path="/" element={<Index />} />
                                <Route path="/auth" element={<Auth />} />
                                <Route path="/reset-password" element={<ResetPassword />} />
                                <Route path="/demo" element={<DemoSimulation />} />
                                <Route path="/privacy" element={<PrivacyPolicy />} />
                                <Route path="/terms" element={<TermsOfService />} />
                                <Route path="/refunds" element={<RefundPolicy />} />
                                <Route path="/contact" element={<Contact />} />
                                <Route path="/bug-report" element={<BugReport />} />
                                <Route path="/account-banned" element={<AccountBanned />} />
                                <Route path="/error" element={<ErrorPage />} />



                              {/* Student Platform - Welcome Gateway (no onboarding check) */}
                              <Route path="/app/welcome-gateway" element={<ProtectedRoute allowedRoles={['student', 'admin']} requireOnboarding={false}><WelcomeGateway /></ProtectedRoute>} />
                              <Route path="/app/compact-profile-quiz" element={<ProtectedRoute allowedRoles={['student', 'admin']} requireOnboarding={false}><CompactProfileQuiz /></ProtectedRoute>} />
                              <Route path="/app/profile-summary" element={<ProtectedRoute allowedRoles={['student', 'admin']} requireOnboarding={false}><ProfileSummary /></ProtectedRoute>} />
                              <Route path="/app/interactive-tour" element={<ProtectedRoute allowedRoles={['student', 'admin']} requireOnboarding={false}><InteractiveTour /></ProtectedRoute>} />
                              <Route path="/app/security-hold" element={<ProtectedRoute allowedRoles={['student', 'admin']} requireOnboarding={false}><SecurityHold /></ProtectedRoute>} />

                              {/* Student Platform - Main App (with onboarding check) */}
                              <Route path="/app" element={<ProtectedRoute allowedRoles={['student', 'admin']}><AppLayout /></ProtectedRoute>}>
                                <Route index element={<Dashboard />} />
                                <Route path="courses" element={<Courses />} />
                                <Route path="courses/:id" element={<CourseDetail />} />
                                <Route path="courses/:id/learn" element={<VideoPlayer />} />
                                <Route path="courses/:id/code" element={<CodingConsole />} />
                                <Route path="courses/:id/map" element={<CourseMap />} />
                                <Route path="my-learning" element={<MyLearning />} />
                                <Route path="quizzes" element={<Quizzes />} />
                                <Route path="notes" element={<Notes />} />
                                <Route path="live-classes" element={<LiveClasses />} />
                                <Route path="chat" element={<Chat />} />
                                <Route path="leaderboard" element={<Leaderboard />} />
                                <Route path="forums" element={<Forums />} />
                                <Route path="calendar" element={<MasterCalendar />} />
                                <Route path="analytics" element={<Analytics />} />
                                <Route path="bookmarks" element={<Bookmarks />} />
                                <Route path="profile" element={<Profile />} />
                                <Route path="settings" element={<StudentSettings />} />
                                <Route path="settings/backup" element={<BackupSettings />} />
                                <Route path="ai" element={<AIToolkit />} />
                                <Route path="career/pathfinder" element={<CareerPathfinder />} />
                                <Route path="career/opportunities" element={<CareerOpportunities />} />
                                <Route path="career/experience" element={<CareerExperience />} />
                                <Route path="career/roadmap" element={<CareerRoadmap />} />
                                <Route path="career/portfolio" element={<CareerPortfolio />} />
                                <Route path="learning-dna" element={<LearningDNAQuestionnaire />} />
                                <Route path="college-university" element={<CollegeUniversity />} />
                                <Route path="academic-profile" element={<AcademicProfile />} />
                                <Route path="study-planner" element={<StudyPlanner />} />
                                <Route path="badges" element={<Badges />} />
                                <Route path="announcements" element={<Announcements />} />
                                <Route path="bug-report" element={<BugReport />} />
                                <Route path="help" element={<HelpCenter />} />
                                <Route path="resources" element={<StudentResources />} />
                              </Route>

                              {/* Admin Portal */}
                              <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout /></ProtectedRoute>}>
                                <Route index element={<AdminDashboard />} />
                                <Route path="users" element={<AdminUsers />} />
                                <Route path="analytics" element={<AdminAnalytics />} />
                                <Route path="courses" element={<AdminCourses />} />
                                <Route path="announcements" element={<AdminAnnouncements />} />
                                <Route path="messages" element={<AdminMessages />} />
                                <Route path="logs" element={<AdminActivityLogs />} />
                                <Route path="enrollments" element={<AdminEnrollments />} />
                                <Route path="reports" element={<AdminReports />} />
                                <Route path="billing" element={<AdminBilling />} />
                                <Route path="localization" element={<AdminLocalization />} />
                                <Route path="restrictions" element={<AdminRestrictions />} />
                                <Route path="classes" element={<AdminClasses />} />
                                <Route path="map-editor" element={<AdminMapEditor />} />
                                <Route path="quiz-manager" element={<AdminQuizManager />} />
                                <Route path="gradebook" element={<AdminGradebook />} />
                                <Route path="live" element={<AdminLive />} />
                                <Route path="student-progress" element={<AdminStudentProgress />} />
                                <Route path="resources" element={<AdminResources />} />
                                <Route path="settings" element={<AdminSettings />} />
                                <Route path="security" element={<AdminSecurity />} />
                                <Route path="automation" element={<AdminAutomation />} />
                                <Route path="bug-reports" element={<AdminBugReports />} />
                                <Route path="college-university" element={<AdminCollegeUniversity />} />
                                <Route path="academic-profiles" element={<AdminAcademicProfiles />} />
                                <Route path="feedback" element={<AdminFeedback />} />
                                <Route path="backgrounds" element={<AdminBackgrounds />} />
                                <Route path="notifications" element={<AdminNotifications />} />
                                <Route path="help" element={<HelpCenter />} />
                              </Route>

                              <Route path="*" element={<NotFound />} />
                            </Routes>
                        </div>
                          </Suspense>
                        </BrowserRouter>
                      </StudentPreferencesProvider>
                    </LearningDNAProvider>
                  </CareerProvider>
                </AnnouncementProvider>
              </AccessibilityProvider>
            </NotificationProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
      <SpeedInsights />
    </>
  );
};

export default App;
