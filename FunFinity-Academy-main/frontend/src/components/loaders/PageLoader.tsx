import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageLoaderProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function PageLoader({ message = "Syncing data...", size = "md", className }: PageLoaderProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  const textSize = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  return (
    <div className={cn("flex flex-col items-center justify-center p-8", className)}>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative"
      >
        <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
        {/* Glow effect */}
        <div className={cn(
          "absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse",
          sizeClasses[size]
        )} />
      </motion.div>
      
      {message && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={cn("text-muted-foreground mt-4 font-medium", textSize[size])}
        >
          {message}
        </motion.p>
      )}
    </div>
  );
}
