import { motion } from "framer-motion";
import { Database, RefreshCw, Home, AlertTriangle, Wifi, Clock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FunfinityIcon } from "@/components/brand/FunfinityLogo";

interface SupabaseErrorProps {
  errorType?: 'connection' | 'timeout' | 'database' | 'auth';
  errorMessage?: string;
}

const errorConfig = {
  connection: {
    icon: Wifi,
    title: "Connection Failed",
    description: "Unable to connect to our servers. Please check your internet connection.",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20"
  },
  timeout: {
    icon: Clock,
    title: "Request Timeout",
    description: "The request took too long to complete. Please try again.",
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20"
  },
  database: {
    icon: Database,
    title: "Database Error",
    description: "We're experiencing database issues. Our team has been notified.",
    color: "text-red-500",
    bg: "bg-red-500/10",
    border: "border-red-500/20"
  },
  auth: {
    icon: Shield,
    title: "Authentication Error",
    description: "There was an issue with your session. Please log in again.",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20"
  }
};

export default function SupabaseError({ errorType = 'connection', errorMessage }: SupabaseErrorProps) {
  const [countdown, setCountdown] = useState(15);
  const config = errorConfig[errorType];
  const Icon = config.icon;

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-[100px]"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
            opacity: [0.4, 0.3, 0.4]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-gradient-to-tl from-accent/20 to-transparent rounded-full blur-[120px]"
        />
      </div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-2xl w-full text-center px-4"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mb-6 flex justify-center"
        >
          <div className="w-20 h-20 rounded-2xl bg-card border border-border/50 flex items-center justify-center shadow-2xl">
            <FunfinityIcon size="xl" className="w-12 h-12 text-primary" />
          </div>
        </motion.div>

        {/* Error Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 150 }}
          className="mb-6 flex justify-center"
        >
          <div className={cn("w-20 h-20 rounded-full flex items-center justify-center border-2", config.border, config.bg)}>
            <Icon className={cn("w-10 h-10", config.color)} />
          </div>
        </motion.div>

        {/* Error Message */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-4xl sm:text-5xl font-bold mb-4 font-display text-foreground"
        >
          {config.title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-lg text-muted-foreground mb-6 max-w-lg mx-auto"
        >
          {config.description}
        </motion.p>

        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20"
          >
            <p className="text-sm text-destructive font-mono">{errorMessage}</p>
          </motion.div>
        )}

        {/* Countdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-8"
        >
          <p className="text-sm text-muted-foreground mb-2">Auto-refreshing in</p>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-card border-2 border-border/50">
            <span className="text-3xl font-bold text-foreground">{countdown}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">seconds</p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button
            onClick={handleRefresh}
            className="rounded-2xl h-12 px-8 font-semibold shadow-lg text-base"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Page
          </Button>
          <Button
            asChild
            variant="outline"
            className="rounded-2xl h-12 px-8 font-semibold text-base"
          >
            <Link to="/">
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </motion.div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 pt-6 border-t border-border/50"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Troubleshooting Tips</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            <div className="p-3 rounded-lg bg-secondary/30">
              <p className="text-xs font-semibold text-foreground mb-1">Check Connection</p>
              <p className="text-xs text-muted-foreground">Verify your internet is working</p>
            </div>
            <div className="p-3 rounded-lg bg-secondary/30">
              <p className="text-xs font-semibold text-foreground mb-1">Clear Cache</p>
              <p className="text-xs text-muted-foreground">Try clearing browser cache</p>
            </div>
            <div className="p-3 rounded-lg bg-secondary/30">
              <p className="text-xs font-semibold text-foreground mb-1">Contact Support</p>
              <p className="text-xs text-muted-foreground">If issue persists, reach out</p>
            </div>
          </div>
        </motion.div>

        {/* Footer Info */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="text-xs text-muted-foreground mt-6"
        >
          Error Code: {errorType.toUpperCase()} | Reference ID: {Date.now().toString(36).toUpperCase()}
        </motion.p>
      </motion.div>
    </div>
  );
}

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}
