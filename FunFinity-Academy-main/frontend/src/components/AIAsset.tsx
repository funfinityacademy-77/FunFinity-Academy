import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VIS, VisualContext, VisualType, VisualAsset } from '@/lib/visual-intelligence';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface AIAssetProps {
  context: VisualContext;
  type: VisualType;
  className?: string;
  animate?: boolean;
  onLoad?: () => void;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'custom';
}

/**
 * Intelligent AI-driven visual component.
 * Automatically fetches and renders dynamic assets based on context.
 */
export const AIAsset: React.FC<AIAssetProps> = ({
  context,
  type,
  className,
  animate = true,
  onLoad,
  size = 'md'
}) => {
  const [asset, setAsset] = useState<VisualAsset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const fetchAsset = async () => {
      try {
        const result = await VIS.getVisual(context, type);
        if (isMounted) {
          setAsset(result);
          setLoading(false);
          onLoad?.();
        }
      } catch (err) {
        if (isMounted) {
          setError(true);
          setLoading(false);
        }
      }
    };

    fetchAsset();
    return () => { isMounted = false; };
  }, [JSON.stringify(context), type]);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-32 h-32',
    xl: 'w-64 h-64',
    custom: ''
  };

  const renderContent = () => {
    if (loading) {
      return <Skeleton className={cn(sizeClasses[size], 'rounded-full', className)} />;
    }

    if (error || !asset) {
      return (
        <div className={cn(sizeClasses[size], 'flex items-center justify-center bg-muted rounded-lg', className)}>
          <span className="text-xs text-muted-foreground">!</span>
        </div>
      );
    }

    return (
      <motion.img
        key={asset.url}
        src={asset.url}
        alt={asset.alt}
        className={cn(
          'object-contain pointer-events-none select-none',
          sizeClasses[size],
          className
        )}
        initial={animate ? { scale: 0.8, opacity: 0 } : false}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      />
    );
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      <AnimatePresence mode="wait">
        {renderContent()}
      </AnimatePresence>
    </div>
  );
};
