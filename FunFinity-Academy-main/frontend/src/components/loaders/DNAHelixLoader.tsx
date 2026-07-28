import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface DNAHelixLoaderProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const STRAND_COUNT = 10;
const HELIX_RADIUS = 30;

export function DNAHelixLoader({ size = "md", className }: DNAHelixLoaderProps) {
  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  };

  const dotSize = {
    sm: 3,
    md: 4,
    lg: 5,
  };

  return (
    <div className={cn("relative flex items-center justify-center", sizeClasses[size], className)}>
      {/* Strand 1 - Cyan */}
      {Array.from({ length: STRAND_COUNT }).map((_, i) => {
        const angle = (i / STRAND_COUNT) * Math.PI * 2;
        const x = Math.cos(angle) * HELIX_RADIUS;
        const y = Math.sin(angle) * HELIX_RADIUS * 0.5;
        const z = Math.sin(angle) * HELIX_RADIUS;
        
        return (
          <motion.div
            key={`strand1-${i}`}
            className="absolute rounded-full bg-cyan shadow-glow-cyan"
            style={{
              width: dotSize[size],
              height: dotSize[size],
              left: `calc(50% + ${x}px)`,
              top: `calc(50% + ${y}px)`,
              opacity: 0.6 + (z / HELIX_RADIUS) * 0.4,
              scale: 0.8 + (z / HELIX_RADIUS) * 0.4,
            }}
            animate={{
              y: [y, y - 20, y],
              opacity: [0.6 + (z / HELIX_RADIUS) * 0.4, 0.3, 0.6 + (z / HELIX_RADIUS) * 0.4],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.1,
            }}
          />
        );
      })}

      {/* Strand 2 - Magenta (offset) */}
      {Array.from({ length: STRAND_COUNT }).map((_, i) => {
        const angle = ((i + STRAND_COUNT / 2) / STRAND_COUNT) * Math.PI * 2;
        const x = Math.cos(angle) * HELIX_RADIUS;
        const y = Math.sin(angle) * HELIX_RADIUS * 0.5;
        const z = Math.sin(angle) * HELIX_RADIUS;
        
        return (
          <motion.div
            key={`strand2-${i}`}
            className="absolute rounded-full bg-magenta shadow-glow-magenta"
            style={{
              width: dotSize[size],
              height: dotSize[size],
              left: `calc(50% + ${x}px)`,
              top: `calc(50% + ${y}px)`,
              opacity: 0.6 + (z / HELIX_RADIUS) * 0.4,
              scale: 0.8 + (z / HELIX_RADIUS) * 0.4,
            }}
            animate={{
              y: [y, y + 20, y],
              opacity: [0.6 + (z / HELIX_RADIUS) * 0.4, 0.3, 0.6 + (z / HELIX_RADIUS) * 0.4],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.1,
            }}
          />
        );
      })}

      {/* Connecting lines */}
      <svg className="absolute inset-0 w-full h-full" style={{ zIndex: -1 }}>
        {Array.from({ length: STRAND_COUNT }).map((_, i) => {
          const angle1 = (i / STRAND_COUNT) * Math.PI * 2;
          const angle2 = ((i + STRAND_COUNT / 2) / STRAND_COUNT) * Math.PI * 2;
          
          const x1 = Math.cos(angle1) * HELIX_RADIUS;
          const y1 = Math.sin(angle1) * HELIX_RADIUS * 0.5;
          const x2 = Math.cos(angle2) * HELIX_RADIUS;
          const y2 = Math.sin(angle2) * HELIX_RADIUS * 0.5;
          
          return (
            <motion.line
              key={`line-${i}`}
              x1={`calc(50% + ${x1}px)`}
              y1={`calc(50% + ${y1}px)`}
              x2={`calc(50% + ${x2}px)`}
              y2={`calc(50% + ${y2}px)`}
              stroke="url(#gradient)"
              strokeWidth="1"
              opacity="0.3"
              animate={{
                opacity: [0.3, 0.1, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.1,
              }}
            />
          );
        })}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--cyan))" />
            <stop offset="50%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--magenta))" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
