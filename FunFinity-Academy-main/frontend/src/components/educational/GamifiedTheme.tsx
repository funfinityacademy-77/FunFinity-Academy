import React, { createContext, useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ThemeContextType {
  theme: 'light' | 'dark' | 'cosmic';
  setTheme: (theme: 'light' | 'dark' | 'cosmic') => void;
  accentColor: string;
  setAccentColor: (color: string) => void;
  animationsEnabled: boolean;
  setAnimationsEnabled: (enabled: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const themes = {
  light: {
    primary: 'from-blue-400 to-purple-600',
    secondary: 'from-green-400 to-blue-500',
    accent: 'from-orange-400 to-pink-500',
    background: 'bg-gradient-to-br from-blue-50 to-purple-50',
    card: 'bg-white/80 backdrop-blur-sm border-white/20',
    text: 'text-gray-800'
  },
  dark: {
    primary: 'from-blue-600 to-purple-800',
    secondary: 'from-green-600 to-blue-700',
    accent: 'from-orange-500 to-pink-600',
    background: 'bg-gradient-to-br from-gray-900 to-purple-900',
    card: 'bg-gray-800/80 backdrop-blur-sm border-gray-700/50',
    text: 'text-gray-100'
  },
  cosmic: {
    primary: 'from-purple-500 via-pink-500 to-indigo-500',
    secondary: 'from-cyan-400 to-blue-600',
    accent: 'from-yellow-400 to-orange-500',
    background: 'bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900',
    card: 'bg-purple-800/40 backdrop-blur-md border-purple-600/30',
    text: 'text-purple-100'
  }
};

export function GamifiedThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark' | 'cosmic'>('cosmic');
  const [accentColor, setAccentColor] = useState('purple');
  const [animationsEnabled, setAnimationsEnabled] = useState(true);

  return (
    <ThemeContext.Provider value={{
      theme, setTheme, accentColor, setAccentColor, animationsEnabled, setAnimationsEnabled
    }}>
      <div className={`min-h-screen transition-all duration-500 ${themes[theme].background}`}>
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          {/* Animated background particles */}
          {animationsEnabled && (
            <>
              <motion.div
                className="absolute w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
                animate={{
                  x: [0, 100, 0],
                  y: [0, -100, 0],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{ top: '10%', left: '10%' }}
              />
              <motion.div
                className="absolute w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"
                animate={{
                  x: [0, -100, 0],
                  y: [0, 100, 0],
                  scale: [1, 0.8, 1],
                }}
                transition={{
                  duration: 15,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{ bottom: '20%', right: '10%' }}
              />
              <motion.div
                className="absolute w-80 h-80 bg-pink-500/20 rounded-full blur-3xl"
                animate={{
                  x: [0, 50, -50, 0],
                  y: [0, 50, -50, 0],
                }}
                transition={{
                  duration: 25,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{ top: '50%', left: '50%' }}
              />
            </>
          )}
        </div>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useGamifiedTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useGamifiedTheme must be used within GamifiedThemeProvider');
  return context;
}

// Animated Card Component
export function AnimatedCard({
  children,
  className = '',
  delay = 0,
  hover = true
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  hover?: boolean;
}) {
  const { theme, animationsEnabled } = useGamifiedTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={hover && animationsEnabled ? {
        scale: 1.02,
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
      } : {}}
      className={`${themes[theme].card} rounded-2xl p-6 transition-all duration-300 ${className}`}
    >
      {children}
    </motion.div>
  );
}

// Animated Button Component
export function AnimatedButton({
  children,
  onClick,
  variant = 'primary',
  className = '',
  disabled = false
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost';
  className?: string;
  disabled?: boolean;
}) {
  const { theme, animationsEnabled } = useGamifiedTheme();

  const getVariantClasses = () => {
    switch (variant) {
      case 'ghost':
        return 'bg-transparent hover:bg-purple-800/30 text-purple-300';
      case 'primary':
        return `bg-gradient-to-r ${themes[theme].primary} text-white`;
      case 'secondary':
        return `bg-gradient-to-r ${themes[theme].secondary} text-white`;
      case 'accent':
        return `bg-gradient-to-r ${themes[theme].accent} text-white`;
      default:
        return `bg-gradient-to-r ${themes[theme].primary} text-white`;
    }
  };

  return (
    <motion.button
      whileHover={animationsEnabled && !disabled ? { scale: 1.05 } : {}}
      whileTap={animationsEnabled && !disabled ? { scale: 0.95 } : {}}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${getVariantClasses()}
        font-semibold py-3 px-6 rounded-xl
        shadow-lg hover:shadow-xl transition-all duration-300
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {children}
    </motion.button>
  );
}

// Floating Badge Component
export function FloatingBadge({
  children,
  color = 'purple',
  animate = true
}: {
  children: React.ReactNode;
  color?: string;
  animate?: boolean;
}) {
  return (
    <motion.div
      animate={animate ? {
        y: [0, -5, 0],
      } : {}}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className={`
        inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
        bg-${color}-500/20 text-${color}-300 border border-${color}-500/30
        backdrop-blur-sm
      `}
    >
      {children}
    </motion.div>
  );
}
