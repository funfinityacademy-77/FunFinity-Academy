/**
 * Dynamic A4 Viewport Component
 * Precise A4 aspect ratio (1:1.414) with container queries for responsive scaling
 * Ensures identical output across desktop previews and printed PDFs
 */

import { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface A4ViewportProps {
  children: React.ReactNode;
  className?: string;
  scale?: number;
  onScaleChange?: (scale: number) => void;
}

const A4_ASPECT_RATIO = 1 / 1.414; // A4 paper aspect ratio

export function A4Viewport({ children, className, scale: externalScale, onScaleChange }: A4ViewportProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [internalScale, setInternalScale] = useState(1);
  const [containerWidth, setContainerWidth] = useState(0);

  const scale = externalScale ?? internalScale;

  // Calculate optimal scale based on available space
  useEffect(() => {
    if (!containerRef.current || externalScale !== undefined) return;

    const updateScale = () => {
      const container = containerRef.current;
      if (!container) return;

      const parentWidth = container.parentElement?.clientWidth || window.innerWidth;
      const parentHeight = window.innerHeight - 200; // Account for header/footer

      // Base A4 dimensions (in pixels, assuming 96 DPI)
      const baseWidth = 794; // A4 width at 96 DPI
      const baseHeight = 1123; // A4 height at 96 DPI

      // Calculate scale to fit within parent
      const scaleX = parentWidth / baseWidth;
      const scaleY = parentHeight / baseHeight;
      const optimalScale = Math.min(scaleX, scaleY, 1); // Never scale up beyond 1

      setInternalScale(Math.max(0.3, optimalScale)); // Minimum scale of 0.3
      setContainerWidth(parentWidth);
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [externalScale]);

  // Notify parent of scale changes
  useEffect(() => {
    if (onScaleChange && externalScale === undefined) {
      onScaleChange(internalScale);
    }
  }, [internalScale, onScaleChange, externalScale]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'w-full flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden',
        className
      )}
      style={{
        minHeight: '600px',
      }}
    >
      <div
        className="bg-white shadow-2xl transition-transform duration-200 ease-out"
        style={{
          aspectRatio: `${A4_ASPECT_RATIO}`,
          width: '100%',
          maxWidth: '794px',
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
        }}
      >
        {/* Container query wrapper for dynamic text scaling */}
        <div
          className="@container w-full h-full"
          style={{
            containerType: 'inline-size',
          }}
        >
          {/* Dynamic content area with container-query-based typography */}
          <div
            className="w-full h-full p-8"
            style={{
              // Base font size scales with container
              fontSize: 'clamp(12px, 2cqw, 16px)',
              lineHeight: '1.6',
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * A4 Page Content Wrapper
 * Provides consistent spacing and typography for A4 content
 */
export function A4PageContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'w-full h-full flex flex-col',
        className
      )}
      style={{
        // Container query-based typography
        fontSize: 'clamp(14px, 2.5cqw, 18px)',
      }}
    >
      {children}
    </div>
  );
}

/**
 * A4 Section Component
 * Creates semantic sections within the A4 page
 */
export function A4Section({ 
  children, 
  className,
  title 
}: { 
  children: React.ReactNode; 
  className?: string;
  title?: string;
}) {
  return (
    <section
      className={cn('mb-6', className)}
      style={{
        // Container query-based spacing
        marginBottom: 'clamp(1rem, 2cqw, 1.5rem)',
      }}
    >
      {title && (
        <h2
          className="font-bold text-gray-900 mb-3"
          style={{
            fontSize: 'clamp(16px, 3cqw, 24px)',
          }}
        >
          {title}
        </h2>
      )}
      {children}
    </section>
  );
}

/**
 * A4 Text Block
 * Optimized text rendering for A4 output
 */
export function A4Text({ 
  children, 
  className,
  size = 'base'
}: { 
  children: React.ReactNode; 
  className?: string;
  size?: 'sm' | 'base' | 'lg' | 'xl';
}) {
  const sizeStyles = {
    sm: 'clamp(12px, 2cqw, 14px)',
    base: 'clamp(14px, 2.5cqw, 16px)',
    lg: 'clamp(16px, 3cqw, 20px)',
    xl: 'clamp(20px, 4cqw, 28px)',
  };

  return (
    <p
      className={cn('text-gray-800 leading-relaxed', className)}
      style={{
        fontSize: sizeStyles[size],
      }}
    >
      {children}
    </p>
  );
}

/**
 * A4 Grid Layout
 * Responsive grid that maintains proportions on A4
 */
export function A4Grid({ 
  children, 
  cols = 2,
  gap = 'medium',
  className 
}: { 
  children: React.ReactNode; 
  cols?: 1 | 2 | 3;
  gap?: 'small' | 'medium' | 'large';
  className?: string;
}) {
  const gapStyles = {
    small: 'clamp(0.5rem, 1cqw, 0.75rem)',
    medium: 'clamp(0.75rem, 1.5cqw, 1rem)',
    large: 'clamp(1rem, 2cqw, 1.5rem)',
  };

  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
  };

  return (
    <div
      className={cn('grid', gridCols[cols], className)}
      style={{
        gap: gapStyles[gap],
      }}
    >
      {children}
    </div>
  );
}

/**
 * A4 Print Styles
 * Injects print-specific styles for perfect PDF output
 */
export function A4PrintStyles() {
  return (
    <style>
      {`
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          .no-print {
            display: none !important;
          }
          
          /* Ensure A4 viewport prints at full scale */
          [data-a4-viewport] {
            transform: scale(1) !important;
            width: 210mm !important;
            height: 297mm !important;
            max-width: none !important;
          }
        }
      `}
    </style>
  );
}
