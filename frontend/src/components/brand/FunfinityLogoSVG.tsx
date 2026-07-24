import { cn } from '@/lib/utils';

interface FunfinityLogoSVGProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16'
};

export function FunfinityLogoSVG({ className, size = 'md' }: FunfinityLogoSVGProps) {
  return (
    <img
      src="/logo.png"
      alt="Funfinity Academy Logo"
      className={cn(sizeClasses[size], className, "object-contain")}
    />
  );
}
