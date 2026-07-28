import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore, appActions } from '@/store/AppStore';
import { StudentDashboard } from './StudentDashboard';
import { InteractiveLearningModule } from './InteractiveLearningModule';
import { AdvancedParentDashboard } from './AdvancedParentDashboard';
import { OnboardingTutorial } from './OnboardingTutorial';
import { ParentStudentLinking } from '@/components/parent/ParentStudentLinking';
import { AnimatedCard, AnimatedButton, FloatingBadge, useGamifiedTheme } from './GamifiedTheme';
import { 
  Users, 
  BookOpen, 
  Settings, 
  Sparkles,
  Rocket,
  Trophy,
  Brain,
  Zap,
  Target,
  Gamepad2,
  BarChart3,
  Shield,
  ArrowLeft,
  Home,
  LogOut,
  Bell,
  Award
} from 'lucide-react';

type ViewType = 'tutorial' | 'student-dashboard' | 'learning-module' | 'parent-dashboard' | 'parent-linking' | 'settings' | 'notifications';

interface NavigationItem {
  id: ViewType;
  title: string;
  description: string;
  icon: React.ReactNode;
  role: 'student' | 'parent' | 'admin' | 'all';
  badge?: number;
}

export function AppRouter() {
  const { theme, animationsEnabled } = useGamifiedTheme();
  const { state, dispatch } = useAppStore();
  const [currentView, setCurrentView] = useState<ViewType>('tutorial');
  const [showTutorial, setShowTutorial] = useState(true);
  const [userRole, setUserRole] = useState<'student' | 'parent'>('student');
  const [isNavigating, setIsNavigating] = useState(false);

  // Initialize with user data
  useEffect(() => {
    // Check if user has completed tutorial
    const hasCompletedTutorial = localStorage.getItem('tutorialCompleted');
    if (hasCompletedTutorial) {
      setShowTutorial(false);
      setCurrentView('student-dashboard');
    }

    // Load user role
    const savedRole = localStorage.getItem('userRole') as 'student' | 'parent';
    if (savedRole) {
      setUserRole(savedRole);
    }
  }, []);

  const navigationItems: NavigationItem[] = [
    {
      id: 'student-dashboard',
      title: 'Student Dashboard',
      description: 'Track progress, achievements, and learning journey',
      icon: <Award className="w-5 h-5" />,
      role: 'student'
    },
    {
      id: 'learning-module',
      title: 'Learning Center',
      description: 'Interactive lessons and educational content',
      icon: <BookOpen className="w-5 h-5" />,
      role: 'student'
    },
    {
      id: 'parent-dashboard',
      title: 'Parent Analytics',
      description: 'Comprehensive insights and monitoring tools',
      icon: <BarChart3 className="w-5 h-5" />,
      role: 'parent'
    },
    {
      id: 'parent-linking',
      title: 'Link Student',
      description: 'Connect parent and student accounts',
      icon: <Users className="w-5 h-5" />,
      role: 'parent'
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'View alerts and updates',
      icon: <Bell className="w-5 h-5" />,
      role: 'all',
      badge: state.notifications.length
    }
  ];

  const handleNavigation = async (viewId: ViewType) => {
    if (viewId === currentView || isNavigating) return;

    setIsNavigating(true);
    
    try {
      // Save current state before navigation
      dispatch(appActions.setCurrentView(viewId));
      
      // Simulate navigation delay for better UX
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setCurrentView(viewId);
      dispatch(appActions.addNotification(`Navigated to ${navigationItems.find(item => item.id === viewId)?.title}`, 'info'));
    } catch (error) {
      dispatch(appActions.setError('Navigation failed'));
    } finally {
      setIsNavigating(false);
    }
  };

  const handleRoleSwitch = (role: 'student' | 'parent') => {
    setUserRole(role);
    localStorage.setItem('userRole', role);
    
    // Navigate to appropriate dashboard
    if (role === 'student') {
      handleNavigation('student-dashboard');
    } else {
      handleNavigation('parent-dashboard');
    }
    
    dispatch(appActions.addNotification(`Switched to ${role} view`, 'info'));
  };

  const handleTutorialComplete = () => {
    setShowTutorial(false);
    localStorage.setItem('tutorialCompleted', 'true');
    handleNavigation('student-dashboard');
  };

  const handleLogout = () => {
    dispatch(appActions.resetState());
    localStorage.removeItem('tutorialCompleted');
    localStorage.removeItem('userRole');
    dispatch(appActions.addNotification('Logged out successfully', 'success'));
    // In a real app, this would redirect to login page
  };

  const renderCurrentView = () => {
    if (showTutorial) {
      return <OnboardingTutorial onComplete={handleTutorialComplete} />;
    }

    switch (currentView) {
      case 'student-dashboard':
        return <StudentDashboard />;
      case 'learning-module':
        return <InteractiveLearningModule />;
      case 'parent-dashboard':
        return <AdvancedParentDashboard />;
      case 'parent-linking':
        return <ParentStudentLinking />;
      case 'notifications':
        return <NotificationCenter />;
      case 'settings':
        return <SettingsView />;
      default:
        return <StudentDashboard />;
    }
  };

  const filteredNavigationItems = navigationItems.filter(item => 
    item.role === 'all' || item.role === userRole
  );

  return (
    <div className="min-h-screen relative">
      {/* Global Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 left-0 right-0 z-40 bg-purple-900/80 backdrop-blur-md border-b border-purple-700/30"
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <motion.div
              animate={animationsEnabled ? {
                rotate: [0, 5, -5, 0],
              } : {}}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="flex items-center space-x-3"
            >
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                FunFinity Academy
              </span>
            </motion.div>

            {/* Navigation Menu */}
            <div className="hidden md:flex items-center space-x-2">
              {filteredNavigationItems.map((item) => (
                <motion.button
                  key={item.id}
                  whileHover={animationsEnabled ? { scale: 1.05 } : {}}
                  whileTap={animationsEnabled ? { scale: 0.95 } : {}}
                  onClick={() => handleNavigation(item.id)}
                  disabled={isNavigating}
                  className={`
                    relative px-4 py-2 rounded-lg font-medium transition-all duration-300
                    ${currentView === item.id
                      ? 'bg-purple-700 text-white shadow-lg'
                      : 'text-purple-200 hover:bg-purple-800/50'
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                >
                  <div className="flex items-center space-x-2">
                    {item.icon}
                    <span>{item.title}</span>
                    {item.badge && item.badge > 0 && (
                      <FloatingBadge color="red" size="sm">
                        {item.badge}
                      </FloatingBadge>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              {/* Role Switcher */}
              <div className="flex items-center space-x-2 bg-purple-800/50 rounded-lg p-1">
                <AnimatedButton
                  variant={userRole === 'student' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => handleRoleSwitch('student')}
                  className="text-xs px-3 py-1"
                >
                  Student
                </AnimatedButton>
                <AnimatedButton
                  variant={userRole === 'parent' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => handleRoleSwitch('parent')}
                  className="text-xs px-3 py-1"
                >
                  Parent
                </AnimatedButton>
              </div>

              {/* Notifications */}
              <motion.button
                whileHover={animationsEnabled ? { scale: 1.1 } : {}}
                whileTap={animationsEnabled ? { scale: 0.9 } : {}}
                onClick={() => handleNavigation('notifications')}
                className="relative p-2 rounded-lg hover:bg-purple-800/50 transition-colors"
              >
                <Bell className="w-5 h-5 text-purple-200" />
                {state.notifications.length > 0 && (
                  <FloatingBadge color="red" size="sm" className="absolute -top-1 -right-1">
                    {state.notifications.length}
                  </FloatingBadge>
                )}
              </motion.button>

              {/* Logout */}
              <AnimatedButton
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-purple-200 hover:text-white"
              >
                <LogOut className="w-4 h-4" />
              </AnimatedButton>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-purple-900/80 backdrop-blur-md border-t border-purple-700/30"
      >
        <div className="flex items-center justify-around py-2">
          {filteredNavigationItems.map((item) => (
            <motion.button
              key={item.id}
              whileHover={animationsEnabled ? { scale: 1.05 } : {}}
              whileTap={animationsEnabled ? { scale: 0.95 } : {}}
              onClick={() => handleNavigation(item.id)}
              disabled={isNavigating}
              className={`
                relative flex flex-col items-center p-2 rounded-lg transition-all duration-300
                ${currentView === item.id
                  ? 'text-white'
                  : 'text-purple-200'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              {item.icon}
              <span className="text-xs mt-1">{item.title.split(' ')[0]}</span>
              {item.badge && item.badge > 0 && (
                <FloatingBadge color="red" size="sm" className="absolute top-1 right-1">
                  {item.badge}
                </FloatingBadge>
              )}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentView}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="pt-20 pb-20 md:pb-6"
        >
          {renderCurrentView()}
        </motion.div>
      </AnimatePresence>

      {/* Loading Overlay */}
      <AnimatePresence>
        {isNavigating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-purple-900/80 backdrop-blur-sm flex items-center justify-center"
          >
            <motion.div
              animate={animationsEnabled ? {
                rotate: 360,
              } : {}}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "linear"
              }}
              className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center"
            >
              <Rocket className="w-8 h-8 text-white" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Additional Components
function NotificationCenter() {
  const { state, dispatch } = useAppStore();
  const { theme, animationsEnabled } = useGamifiedTheme();

  return (
    <div className="container mx-auto px-6 py-8">
      <h2 className="text-2xl font-bold mb-6">Notifications</h2>
      
      {state.notifications.length === 0 ? (
        <AnimatedCard>
          <div className="text-center py-12">
            <Bell className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <p className="text-purple-200">No notifications yet</p>
          </div>
        </AnimatedCard>
      ) : (
        <div className="space-y-4">
          {state.notifications.map((notification) => (
            <AnimatedCard key={notification.id}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{notification.message}</p>
                  <p className="text-sm text-purple-200">
                    {new Date(notification.timestamp).toLocaleString()}
                  </p>
                </div>
                <AnimatedButton
                  variant="ghost"
                  size="sm"
                  onClick={() => dispatch(appActions.removeNotification(notification.id))}
                >
                  Dismiss
                </AnimatedButton>
              </div>
            </AnimatedCard>
          ))}
        </div>
      )}
    </div>
  );
}

function SettingsView() {
  const { state, dispatch } = useAppStore();
  const { theme, animationsEnabled } = useGamifiedTheme();

  return (
    <div className="container mx-auto px-6 py-8">
      <h2 className="text-2xl font-bold mb-6">Settings</h2>
      
      <div className="space-y-6">
        <AnimatedCard>
          <h3 className="text-lg font-semibold mb-4">Appearance</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Theme</span>
              <select
                value={theme}
                onChange={(e) => dispatch(appActions.setTheme(e.target.value as any))}
                className="bg-purple-800/50 text-white rounded-lg px-3 py-2"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="cosmic">Cosmic</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <span>Animations</span>
              <button
                onClick={() => dispatch(appActions.setAnimationsEnabled(!animationsEnabled))}
                className={`w-12 h-6 rounded-full transition-colors ${
                  animationsEnabled ? 'bg-purple-500' : 'bg-gray-600'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  animationsEnabled ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
          </div>
        </AnimatedCard>
      </div>
    </div>
  );
}
