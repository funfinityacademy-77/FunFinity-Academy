import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { productionThemes } from "@/config/production-theme";
import { useTheme } from "@/hooks/use-theme";
import { FunfinityLogoSVG } from "@/components/brand/FunfinityLogoSVG";

export default function ErrorPage() {
  const [countdown, setCountdown] = useState(30);
  const { theme: activeTheme } = useTheme();
  const theme = productionThemes[activeTheme] || productionThemes.light;
  const primary = theme.primary[500];
  const accent = theme.primary[400] || theme.primary[600];
  const highlight = theme.primary[300] || theme.primary[700];

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: theme.neutral[0] }}>
      {/* Floating Orbs - Subtle */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-10 left-10 w-32 h-32 rounded-full blur-3xl"
        style={{ background: `${primary}22` }}
      />
      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.4, 0.6, 0.4],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-10 right-10 w-48 h-48 rounded-full blur-3xl"
        style={{ background: `${accent}22` }}
      />

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-2xl w-full text-center px-2"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mb-4 sm:mb-6 flex justify-center"
        >
          <div className="w-20 h-20 sm:w-32 sm:h-32 rounded-2xl flex items-center justify-center shadow-2xl" style={{ background: theme.neutral[0], border: `2px solid ${theme.neutral[200]}` }}>
            <FunfinityLogoSVG className="w-14 h-14 sm:w-24 sm:h-24" size="xl" />
          </div>
        </motion.div>

        {/* Error Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 150 }}
          className="mb-4 sm:mb-6 flex justify-center"
        >
          <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full flex items-center justify-center" style={{ background: theme.neutral[0], border: `2px solid ${theme.neutral[200]}` }}>
            <AlertTriangle className="w-8 h-8 sm:w-12 sm:h-12" style={{ color: primary }} />
          </div>
        </motion.div>

        {/* Error Message */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-2 sm:mb-4 font-display"
          style={{ color: theme.neutral[900] }}
        >
          Oops!
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-lg sm:text-xl lg:text-2xl mb-3 sm:mb-6 font-medium"
          style={{ color: theme.neutral[700] }}
        >
          Something went wrong
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-sm sm:text-base lg:text-lg mb-4 sm:mb-8 max-w-lg mx-auto"
          style={{ color: theme.neutral[600] }}
        >
          We're experiencing some technical difficulties. Our team has been notified and is working to fix the issue.
        </motion.p>

        {/* Countdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mb-4 sm:mb-8"
        >
          <p className="text-xs sm:text-sm mb-2" style={{ color: theme.neutral[600] }}>Auto-refreshing in</p>
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full" style={{ background: theme.neutral[0], border: `2px solid ${theme.neutral[200]}` }}>
            <span className="text-2xl sm:text-3xl font-bold" style={{ color: theme.neutral[900] }}>{countdown}</span>
          </div>
          <p className="text-xs mt-2" style={{ color: theme.neutral[500] }}>seconds</p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center"
        >
          <Button
            onClick={handleRefresh}
            className="rounded-2xl h-10 sm:h-12 px-6 sm:px-8 font-semibold shadow-lg text-sm sm:text-base"
            style={{ background: primary, color: theme.neutral[0] }}
          >
            <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
            Refresh Page
          </Button>
          <Button
            onClick={handleGoHome}
            variant="outline"
            className="rounded-2xl h-10 sm:h-12 px-6 sm:px-8 font-semibold text-sm sm:text-base"
            style={{ background: 'transparent', border: `2px solid ${theme.neutral[300]}`, color: theme.neutral[900] }}
            onMouseEnter={(e) => e.currentTarget.style.background = theme.neutral[50]}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <Home className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
            Back to Home
          </Button>
        </motion.div>

        {/* Additional Info */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-xs mt-6 sm:mt-12"
          style={{ color: theme.neutral[400] }}
        >
          Error Code: 500 | Reference ID: {Date.now().toString(36).toUpperCase()}
        </motion.p>
      </motion.div>

      {/* Bottom Status Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <div className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full" style={{ background: theme.neutral[0], border: `1px solid ${theme.neutral[200]}` }}>
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: primary }} />
          <span className="text-xs sm:text-sm font-medium" style={{ color: theme.neutral[700] }}>Site Under Maintenance</span>
        </div>
      </motion.div>
    </div>
  );
}
