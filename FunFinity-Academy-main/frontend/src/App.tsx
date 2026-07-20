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
import { Suspense, useEffect, useState } from "react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import DemoSimulation from "./pages/DemoSimulation";
import NotFound from "./pages/NotFound";
import ErrorPage from "./pages/ErrorPage";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import RefundPolicy from "./pages/RefundPolicy";
import Contact from "./pages/Contact";
import AccountBanned from "./pages/AccountBanned";
import StudentResources from "./pages/StudentResources";
import { AppLayout } from "./components/layout/AppLayout";
import { AdminLayout } from "./components/layout/AdminLayout";

// Student App pages
import Dashboard from "./pages/app/Dashboard";
import Courses from "./pages/app/Courses";
import CourseDetail from "./pages/app/CourseDetail";
import VideoPlayer from "./pages/app/VideoPlayer";
import CodingConsole from "./pages/app/CodingConsole";
import MyLearning from "./pages/app/MyLearning";
import Quizzes from "./pages/app/Quizzes";
import LiveClasses from "./pages/app/LiveClasses";
import Chat from "./pages/app/Chat";
import Leaderboard from "./pages/app/Leaderboard";
import Forums from "./pages/app/Forums";
import MasterCalendar from "./pages/app/MasterCalendar";
import Analytics from "./pages/app/Analytics";
import Bookmarks from "./pages/app/Bookmarks";
import Profile from "./pages/app/Profile";
import StudentSettings from "./pages/app/StudentSettings";
import HelpCenter from "./pages/app/HelpCenter";
import Notes from "./pages/app/Notes";
import AIToolkit from "./pages/app/AIToolkit";
import CareerPathfinder from "./pages/app/CareerPathfinder";
import CareerOpportunities from "./pages/app/CareerOpportunities";
import CareerExperience from "./pages/app/CareerExperience";
import CareerRoadmap from "./pages/app/CareerRoadmap";
import CareerPortfolio from "./pages/app/CareerPortfolio";
import LearningDNAQuestionnaire from "./pages/app/LearningDNAQuestionnaire";
import Badges from "./pages/app/Badges";
import Announcements from "./pages/app/Announcements";
import BugReport from "./pages/app/BugReport";
import CalendarPage from "./pages/app/CalendarPage";
import CourseMap from "./pages/app/CourseMap";
import CollegeUniversity from "./pages/app/CollegeUniversity";
import AcademicProfile from "./pages/app/AcademicProfile";
import StudyPlanner from "./pages/app/StudyPlanner";
import BackupSettings from "./pages/app/settings/BackupSettings";
import WelcomeGateway from "./pages/app/WelcomeGateway";
import CompactProfileQuiz from "./pages/app/CompactProfileQuiz";
import ProfileSummary from "./pages/app/ProfileSummary";
import InteractiveTour from "./pages/app/InteractiveTour";
import SecurityHold from "./pages/app/SecurityHold";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminCourses from "./pages/admin/AdminCourses";
import AdminAnnouncements from "./pages/admin/AdminAnnouncements";
import AdminActivityLogs from "./pages/admin/AdminActivityLogs";
import AdminEnrollments from "./pages/admin/AdminEnrollments";
import AdminReports from "./pages/admin/AdminReports";
import AdminBilling from "./pages/admin/AdminBilling";
import AdminLocalization from "./pages/admin/AdminLocalization";
import AdminRestrictions from "./pages/admin/AdminRestrictions";
import AdminClasses from "./pages/admin/AdminClasses";
import AdminGradebook from "./pages/admin/AdminGradebook";
import AdminLive from "./pages/admin/AdminLive";
import AdminStudentProgress from "./pages/admin/AdminStudentProgress";
import AdminCourseBuilder from "./pages/admin/AdminCourseBuilder";
import AdminResources from "./pages/admin/AdminResources";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminMessages from "./pages/admin/AdminMessages";
import AdminSecurity from "./pages/admin/AdminSecurity";
import AdminMapEditor from "./pages/admin/AdminMapEditor";
import AdminQuizManager from "./pages/admin/AdminQuizManager";
import AdminAutomation from "./pages/admin/AdminAutomation";
import AdminBugReports from "./pages/admin/AdminBugReports";
import AdminCollegeUniversity from "./pages/admin/AdminCollegeUniversity";
import AdminAcademicProfiles from "./pages/admin/AdminAcademicProfiles";
import AdminFeedback from "./pages/admin/AdminFeedback";
import AdminBackgrounds from "./pages/admin/AdminBackgrounds";
import AdminNotifications from "./pages/admin/AdminNotifications";

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
  return (
    <>
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
                                <Route path="calendar-page" element={<CalendarPage />} />
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
