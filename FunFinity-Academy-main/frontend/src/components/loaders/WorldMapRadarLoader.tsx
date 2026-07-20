import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface WorldMapRadarLoaderProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const RADAR_POINTS = 8;
const RADAR_RADIUS = 40;

export function WorldMapRadarLoader({ size = "md", className }: WorldMapRadarLoaderProps) {
  const sizeClasses = {
    sm: "w-20 h-20",
    md: "w-32 h-32",
    lg: "w-48 h-48",
  };

  const dotSize = {
    sm: 2,
    md: 3,
    lg: 4,
  };

  return (
    <div className={cn("relative flex items-center justify-center", sizeClasses[size], className)}>
      {/* Radar circles */}
      {[1, 2, 3].map((ring) => (
        <motion.div
          key={`ring-${ring}`}
          className="absolute rounded-full border border-cyan/30"
          style={{
            width: `${ring * 33}%`,
            height: `${ring * 33}%`,
          }}
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: ring * 0.2,
          }}
        />
      ))}

      {/* Radar sweep line */}
      <motion.div
        className="absolute rounded-full border-t-2 border-cyan"
        style={{
          width: "100%",
          height: "100%",
          borderTopColor: "hsl(var(--cyan))",
          borderRightColor: "transparent",
          borderBottomColor: "transparent",
          borderLeftColor: "transparent",
        }}
        animate={{
          rotate: [0, 360],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Radar points (simulating college locations) */}
      {Array.from({ length: RADAR_POINTS }).map((_, i) => {
        const angle = (i / RADAR_POINTS) * Math.PI * 2;
        const distance = 0.3 + Math.random() * 0.4;
        const x = Math.cos(angle) * RADAR_RADIUS * distance;
        const y = Math.sin(angle) * RADAR_RADIUS * distance;
        
        return (
          <motion.div
            key={`point-${i}`}
            className="absolute rounded-full bg-magenta shadow-glow-magenta"
            style={{
              width: dotSize[size],
              height: dotSize[size],
              left: `calc(50% + ${x}px)`,
              top: `calc(50% + ${y}px)`,
            }}
            animate={{
              opacity: [0.4, 1, 0.4],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.3,
            }}
          />
        );
      })}

      {/* Center point */}
      <motion.div
        className="absolute rounded-full bg-cyan shadow-glow-cyan"
        style={{
          width: dotSize[size] * 2,
          height: dotSize[size] * 2,
        }}
        animate={{
          opacity: [0.6, 1, 0.6],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Scanning effect overlay */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: "conic-gradient(from 0deg, transparent 0deg, rgba(6, 182, 212, 0.1) 180deg, transparent 360deg)",
        }}
        animate={{
          rotate: [0, 360],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>
  );
}

interface CollegeSearchLoaderProps {
  message?: string;
  className?: string;
}

export function CollegeSearchLoader({ message = "Searching colleges worldwide...", className }: CollegeSearchLoaderProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center space-y-6", className)}>
      <WorldMapRadarLoader size="lg" />
      <div className="text-center space-y-2">
        <motion.p
          className="text-sm font-medium text-foreground"
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {message}
        </motion.p>
        <motion.div
          className="flex items-center justify-center gap-1"
          animate={{
            opacity: [0.3, 1, 0.3],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <span className="w-1 h-1 bg-cyan rounded-full" />
          <span className="w-1 h-1 bg-cyan rounded-full" style={{ animationDelay: "0.2s" }} />
          <span className="w-1 h-1 bg-cyan rounded-full" style={{ animationDelay: "0.4s" }} />
        </motion.div>
      </div>
    </div>
  );
}
