import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { FunfinityLogoSVG } from './FunfinityLogoSVG';

interface FunfinityLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon' | 'text';
  animated?: boolean;
}

const sizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16'
};

export function FunfinityLogo({ 
  className, 
  size = 'md', 
  variant = 'full',
  animated = false 
}: FunfinityLogoProps) {
  const LogoIcon = () => (
    <FunfinityLogoSVG className={cn(sizeClasses[size], className)} size={size} />
  );

  const LogoText = () => (
    <span className="font-display font-bold bg-gradient-to-r from-cyan via-orange to-magenta bg-clip-text text-transparent">
      FunFinity
    </span>
  );

  if (variant === 'icon') {
    if (animated) {
      return (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <LogoIcon />
        </motion.div>
      );
    }
    return <LogoIcon />;
  }

  if (variant === 'text') {
    return <LogoText />;
  }

  // Full logo with icon and text
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {animated ? (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <LogoIcon />
        </motion.div>
      ) : (
        <LogoIcon />
      )}
      <LogoText />
    </div>
  );
}

// Smaller icon-only version for use in headers
export function FunfinityIcon({ className, size = 'md', animated = false }: Omit<FunfinityLogoProps, 'variant'>) {
  return <FunfinityLogo className={className} size={size} variant="icon" animated={animated} />;
}
