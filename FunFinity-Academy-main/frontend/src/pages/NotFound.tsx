import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Home, Search, ArrowLeft, Compass, MapPin, Zap, Sparkles, Ghost, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FunfinityIcon } from "@/components/brand/FunfinityLogo";
import { productionThemes } from "@/config/production-theme";
import { useTheme } from "@/hooks/use-theme";

const NotFound = () => {
  const location = useLocation();
  const { theme: activeTheme } = useTheme();
  const theme = productionThemes[activeTheme] || productionThemes.light;
  const primary = theme.primary[500];
  const accent = theme.primary[400] || theme.primary[600];
  const highlight = theme.primary[300] || theme.primary[700];

  useEffect(() => {
    console.error("Page not found. The requested resource may have been moved or doesn't exist:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center p-2 sm:p-4 relative overflow-hidden" style={{ background: theme.neutral[0] }}>
      {/* Floating Orbs - Subtle */}
      <motion.div
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.2, 0.4, 0.2],
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
          scale: [1.5, 1, 1.5],
          opacity: [0.3, 0.5, 0.3],
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
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 max-w-4xl w-full text-center px-2"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mb-4 sm:mb-6 md:mb-8 flex justify-center"
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center shadow-2xl" style={{ background: theme.neutral[0], border: `2px solid ${theme.neutral[200]}` }}>
            <FunfinityIcon size="xl" className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14" style={{ color: primary }} />
          </div>
        </motion.div>

        {/* 404 Number with Animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 150 }}
          className="mb-4 sm:mb-6 relative"
        >
          <motion.h1
            className="font-display text-5xl sm:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl font-bold tracking-tight"
            style={{ color: theme.neutral[900] }}
          >
            404
          </motion.h1>
          <motion.div
            animate={{
              rotate: [0, 10, -10, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -top-2 sm:-top-4 -right-4 sm:-right-8"
          >
            <Ghost className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16" style={{ color: theme.neutral[400] }} />
          </motion.div>
        </motion.div>

        {/* Error Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-4 sm:mb-6 md:mb-8"
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-4 font-display" style={{ color: theme.neutral[900] }}>
            Page Not Found
          </h2>
          <p className="text-sm sm:text-base lg:text-lg mb-2 max-w-2xl mx-auto" style={{ color: theme.neutral[700] }}>
            Oops! The page you're looking for has vanished into the digital void.
          </p>
          <p className="text-xs sm:text-sm" style={{ color: theme.neutral[500] }}>
            The requested path: <code className="px-2 py-1 rounded font-mono text-xs" style={{ background: theme.neutral[100], color: theme.neutral[700] }}>{location.pathname}</code>
          </p>
        </motion.div>

        {/* Helpful Information Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6 md:mb-8 max-w-3xl mx-auto"
        >
          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            className="rounded-2xl p-3 sm:p-4 md:p-6 text-center"
            style={{ background: theme.neutral[0], border: `1px solid ${theme.neutral[200]}` }}
          >
            <Compass className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 sm:mb-3" style={{ color: primary }} />
            <h3 className="font-semibold text-sm sm:text-base mb-1 sm:mb-2" style={{ color: theme.neutral[900] }}>Lost Navigation</h3>
            <p className="text-xs" style={{ color: theme.neutral[600] }}>The page may have moved or been removed</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            className="rounded-2xl p-3 sm:p-4 md:p-6 text-center"
            style={{ background: theme.neutral[0], border: `1px solid ${theme.neutral[200]}` }}
          >
            <MapPin className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 sm:mb-3" style={{ color: accent }} />
            <h3 className="font-semibold text-sm sm:text-base mb-1 sm:mb-2" style={{ color: theme.neutral[900] }}>Wrong Turn</h3>
            <p className="text-xs" style={{ color: theme.neutral[600] }}>Double-check the URL for typos</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            className="rounded-2xl p-3 sm:p-4 md:p-6 text-center"
            style={{ background: theme.neutral[0], border: `1px solid ${theme.neutral[200]}` }}
          >
            <Zap className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 sm:mb-3" style={{ color: highlight }} />
            <h3 className="font-semibold text-sm sm:text-base mb-1 sm:mb-2" style={{ color: theme.neutral[900] }}>Quick Fix</h3>
            <p className="text-xs" style={{ color: theme.neutral[600] }}>Try our search or go back home</p>
          </motion.div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4 justify-center items-center"
        >
          <Button
            asChild
            className="rounded-2xl h-10 sm:h-12 px-4 sm:px-6 md:px-8 font-semibold shadow-lg text-sm sm:text-base"
            style={{ background: primary, color: theme.neutral[0] }}
          >
            <Link to="/">
              <Home className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              Return to Home
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="rounded-2xl h-10 sm:h-12 px-4 sm:px-6 md:px-8 font-semibold text-sm sm:text-base"
            style={{ background: 'transparent', border: `2px solid ${theme.neutral[300]}`, color: theme.neutral[900] }}
            onMouseEnter={(e) => e.currentTarget.style.background = theme.neutral[50]}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <Link to="/app">
              <Compass className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              Go to Dashboard
            </Link>
          </Button>
          <Button
            onClick={() => window.history.back()}
            variant="outline"
            className="rounded-2xl h-10 sm:h-12 px-4 sm:px-6 md:px-8 font-semibold text-sm sm:text-base"
            style={{ background: 'transparent', border: `2px solid ${theme.neutral[300]}`, color: theme.neutral[900] }}
            onMouseEnter={(e) => e.currentTarget.style.background = theme.neutral[50]}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
            Go Back
          </Button>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-6 sm:mt-8 md:mt-12 pt-4 sm:pt-6 md:pt-8"
          style={{ borderTop: `1px solid ${theme.neutral[200]}` }}
        >
          <p className="text-sm mb-3 sm:mb-4" style={{ color: theme.neutral[600] }}>Looking for something specific?</p>
          <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
            <Link to="/app/courses" className="text-xs sm:text-sm flex items-center gap-2 transition-colors" style={{ color: theme.neutral[700] }}>
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" /> Courses
            </Link>
            <Link to="/app/resources" className="text-xs sm:text-sm flex items-center gap-2 transition-colors" style={{ color: theme.neutral[700] }}>
              <Search className="w-3 h-3 sm:w-4 sm:h-4" /> Resources
            </Link>
            <Link to="/app/calendar" className="text-xs sm:text-sm flex items-center gap-2 transition-colors" style={{ color: theme.neutral[700] }}>
              <Compass className="w-3 h-3 sm:w-4 sm:h-4" /> Calendar
            </Link>
            <Link to="/app/help" className="text-xs sm:text-sm flex items-center gap-2 transition-colors" style={{ color: theme.neutral[700] }}>
              <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" /> Help Center
            </Link>
          </div>
        </motion.div>

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-4 sm:mt-6 md:mt-8 text-xs"
          style={{ color: theme.neutral[400] }}
        >
          <p>Error Code: 404 | Reference ID: {Date.now().toString(36).toUpperCase()}</p>
          <p className="mt-1">If you believe this is an error, please contact support</p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFound;
