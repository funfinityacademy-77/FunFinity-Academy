import React from 'react';
import { GamifiedThemeProvider } from '@/components/educational/GamifiedTheme';
import { AppStoreProvider } from '@/store/AppStore';
import { AppRouter } from '@/components/educational/AppRouter';

export default function DemoEducationalApp() {
  return (
    <AppStoreProvider>
      <GamifiedThemeProvider>
        <AppRouter />
      </GamifiedThemeProvider>
    </AppStoreProvider>
  );
}

{/* Feature Highlights */ }
<div className="px-4 mt-8">
  <div className="bg-purple-900/30 rounded-xl p-4">
    <h3 className="font-semibold text-purple-200 mb-3">Quick Stats</h3>
    <div className="space-y-2 text-sm">
      <div className="flex items-center justify-between">
        <span className="text-purple-300">Level</span>
        <FloatingBadge color="yellow">12</FloatingBadge>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-purple-300">Streak</span>
        <FloatingBadge color="green">7 days</FloatingBadge>
      </div>
    </div>
  </div>
</div>

{/* Main Content */ }
< main className="ml-64 pt-20" >
  <div className="min-h-screen">
    {renderCurrentView()}
  </div>
</main >

{/* Floating Action Buttons */ }
< div className="fixed bottom-8 right-8 space-y-3" >
  <motion.div
    animate={{
      scale: [1, 1.1, 1],
    }}
    transition={{
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }}
  >
    <AnimatedButton
      variant="primary"
      className="w-14 h-14 rounded-full shadow-2xl"
      onClick={() => setCurrentView('learning-module')}
    >
      <Rocket className="w-6 h-6" />
    </AnimatedButton>
  </motion.div>

  {
    userRole === 'student' && (
      <AnimatedButton
        variant="accent"
        className="w-14 h-14 rounded-full shadow-2xl"
        onClick={() => setCurrentView('student-dashboard')}
      >
        <Trophy className="w-6 h-6" />
      </AnimatedButton>
    )
  }
</div >

{/* Demo Info Banner */ }
< motion.div
  initial={{ opacity: 0, y: 20 }
  }
  animate={{ opacity: 1, y: 0 }}
  className="fixed bottom-8 left-80 max-w-md"
>
  <div className="bg-purple-900/80 backdrop-blur-md border border-purple-700/30 rounded-xl p-4">
    <div className="flex items-center space-x-3">
      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
        <Gamepad2 className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1">
        <p className="font-semibold text-purple-100">Interactive Demo</p>
        <p className="text-xs text-purple-200">
          Explore the advanced educational features with gamification and analytics
        </p>
      </div>
    </div>
  </div>
</motion.div >
      </div >
    </GamifiedThemeProvider >
  );
}
