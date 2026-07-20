import { motion, HTMLMotionProps } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface PremiumButtonProps extends HTMLMotionProps<'button'> {
  children: ReactNode;
  variant?: 'default' | 'outline' | 'ghost' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  ripple?: boolean;
}

export function PremiumButton({
  children,
  variant = 'default',
  size = 'md',
  className,
  icon,
  iconPosition = 'left',
  ripple = true,
  ...props
}: PremiumButtonProps) {
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-2.5 text-base',
    lg: 'px-8 py-3 text-lg'
  };

  const variantClasses = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    outline: 'border-2 border-primary text-primary hover:bg-primary/10',
    ghost: 'text-foreground hover:bg-accent/50',
    gradient: 'bg-gradient-to-r from-primary to-accent text-white hover:opacity-90'
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        'relative overflow-hidden rounded-lg font-medium transition-all duration-300',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {/* Ripple effect */}
      {ripple && (
        <motion.span
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ x: '-100%' }}
          whileHover={{ x: '100%' }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        />
      )}
      
      {/* Glow effect on hover */}
      <motion.span
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0"
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />

      <span className="relative flex items-center gap-2">
        {icon && iconPosition === 'left' && (
          <motion.span
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {icon}
          </motion.span>
        )}
        {children}
        {icon && iconPosition === 'right' && (
          <motion.span
            initial={{ x: 10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {icon}
          </motion.span>
        )}
      </span>
    </motion.button>
  );
}

// Premium card with hover effects
interface PremiumCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  onClick?: () => void;
}

export function PremiumCard({ children, className, hover = true, glow = false, onClick }: PremiumCardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -4, scale: 1.01 } : {}}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      onClick={onClick}
      className={cn(
        'relative overflow-hidden rounded-xl border border-border/20 bg-card p-6',
        'transition-all duration-300',
        hover && 'cursor-pointer hover:border-primary/30 hover:shadow-premium',
        glow && 'hover:shadow-glow-accent',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {/* Gradient overlay on hover */}
      {hover && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0"
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}
      
      {/* Shimmer effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0"
        whileHover={{ opacity: 1, x: ['-100%', '100%'] }}
        transition={{ duration: 0.6 }}
      />

      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

// Premium input with focus effects
interface PremiumInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onAnimationStart'> {
  label?: string;
  error?: string;
  icon?: ReactNode;
}

export function PremiumInput({ label, error, icon, className, ...props }: PremiumInputProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {icon}
          </div>
        )}
        <motion.div
          whileFocus={{ scale: 1.01 }}
          transition={{ duration: 0.2 }}
        >
          <input
            className={cn(
              'w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground',
              'transition-all duration-200 focus:outline-none',
              'focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background',
              'focus:border-primary/50',
              'placeholder:text-muted-foreground',
              icon && 'pl-10',
              error && 'border-destructive focus:ring-destructive',
              className
            )}
            {...props}
          />
        </motion.div>
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-destructive"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}
