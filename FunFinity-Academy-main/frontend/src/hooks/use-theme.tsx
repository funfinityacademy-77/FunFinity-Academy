import { createContext, useContext, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Theme = "light" | "dark" | "cosmic";

const ThemeContext = createContext<{
  theme: Theme;
  toggleTheme: () => void;
  isThemeChanging: boolean;
}>({ theme: "light", toggleTheme: () => {}, isThemeChanging: false });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("theme") as Theme;
      if (stored) return stored;
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return "light";
  });
  const [isThemeChanging, setIsThemeChanging] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setIsThemeChanging(true);
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
    setTimeout(() => setIsThemeChanging(false), 400);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isThemeChanging }}>
      {children}
      <AnimatePresence>
        {isThemeChanging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9999] bg-background flex items-center justify-center"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 180, 360]
              }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
