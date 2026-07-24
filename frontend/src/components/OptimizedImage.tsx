import React, { useState } from 'react';
import Image, { ImageProps } from 'next/image';
import { cn } from '@/lib/utils';

// ============================================================================
// OPTIMIZED IMAGE COMPONENT WITH LAZY LOADING
// ============================================================================
// This component wraps Next.js Image with optimized lazy loading for global users
// on low-bandwidth networks.
//
// Features:
// - Progressive loading with blur placeholder
// - Lazy loading for below-fold images
// - Priority loading for above-fold images
// - Responsive sizing with srcset
// - WebP/AVIF format support
// - Error handling with fallback
// - Loading state indicator
// ============================================================================

interface OptimizedImageProps extends Omit<ImageProps, 'blurDataURL'> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  lazy?: boolean;
  fallback?: React.ReactNode;
  showLoading?: boolean;
  className?: string;
}

export function OptimizedImage({
  src,
  alt,
  width = 800,
  height = 600,
  priority = false,
  lazy = true,
  fallback,
  showLoading = true,
  className,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Generate a simple blur placeholder
  const generateBlurPlaceholder = (w: number, h: number): string => {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.fillStyle = '#e5e7eb';
      ctx.fillRect(0, 0, w, h);
      
      // Add some noise for better blur effect
      for (let i = 0; i < 100; i++) {
        ctx.fillStyle = `rgba(0, 0, 0, ${Math.random() * 0.1})`;
        ctx.fillRect(
          Math.random() * w,
          Math.random() * h,
          Math.random() * 10,
          Math.random() * 10
        );
      }
    }
    
    return canvas.toDataURL('image/jpeg', 0.1);
  };

  const blurDataURL = typeof window !== 'undefined' 
    ? generateBlurPlaceholder(10, 10) 
    : 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwDsQA//Z';

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  if (hasError && fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {isLoading && showLoading && (
        <div className="absolute inset-0 bg-muted animate-pulse" aria-hidden="true" />
      )}
      
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        loading={lazy ? 'lazy' : 'eager'}
        placeholder="blur"
        blurDataURL={blurDataURL}
        onLoad={handleLoad}
        onError={handleError}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100'
        )}
        {...props}
      />
      
      {hasError && !fallback && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground"
          role="img"
          aria-label={alt}
        >
          <span className="text-sm">Image not available</span>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// RESPONSIVE IMAGE COMPONENT FOR DIFFERENT BREAKPOINTS
// ============================================================================

interface ResponsiveImageProps {
  src: string;
  alt: string;
  mobileWidth?: number;
  mobileHeight?: number;
  tabletWidth?: number;
  tabletHeight?: number;
  desktopWidth?: number;
  desktopHeight?: number;
  priority?: boolean;
  className?: string;
}

export function ResponsiveImage({
  src,
  alt,
  mobileWidth = 400,
  mobileHeight = 300,
  tabletWidth = 800,
  tabletHeight = 600,
  desktopWidth = 1200,
  desktopHeight = 900,
  priority = false,
  className,
}: ResponsiveImageProps) {
  return (
    <picture className={className}>
      <source
        media="(min-width: 1024px)"
        srcSet={`${src}?w=${desktopWidth}&h=${desktopHeight}&q=80`}
      />
      <source
        media="(min-width: 768px)"
        srcSet={`${src}?w=${tabletWidth}&h=${tabletHeight}&q=80`}
      />
      <OptimizedImage
        src={src}
        alt={alt}
        width={mobileWidth}
        height={mobileHeight}
        priority={priority}
        sizes="100vw"
      />
    </picture>
  );
}

// ============================================================================
// AVATAR IMAGE COMPONENT
// ============================================================================

interface AvatarImageProps {
  src: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeMap = {
  sm: { width: 32, height: 32 },
  md: { width: 48, height: 48 },
  lg: { width: 64, height: 64 },
  xl: { width: 96, height: 96 },
};

export function AvatarImage({
  src,
  alt,
  size = 'md',
  className,
}: AvatarImageProps) {
  const { width, height } = sizeMap[size];

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={size === 'sm' || size === 'md'}
      lazy={false}
      className={cn('rounded-full object-cover', className)}
      sizes="(max-width: 768px) 32px, 48px"
    />
  );
}

// ============================================================================
// HERO IMAGE COMPONENT (Priority Loading)
// ============================================================================

interface HeroImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}

export function HeroImage({
  src,
  alt,
  width = 1920,
  height = 1080,
  className,
}: HeroImageProps) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={true}
      lazy={false}
      showLoading={false}
      className={className}
      sizes="100vw"
    />
  );
}

// ============================================================================
// GALLERY IMAGE COMPONENT (Lazy Loading)
// ============================================================================

interface GalleryImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  onClick?: () => void;
  className?: string;
}

export function GalleryImage({
  src,
  alt,
  width = 600,
  height = 400,
  onClick,
  className,
}: GalleryImageProps) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={false}
      lazy={true}
      className={cn('cursor-pointer hover:opacity-90 transition-opacity', className)}
      onClick={onClick}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    />
  );
}

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/*
// Basic usage
<OptimizedImage
  src="/images/course-thumbnail.jpg"
  alt="Course thumbnail"
  width={800}
  height={600}
/>

// With priority loading (above fold)
<HeroImage
  src="/images/hero-banner.jpg"
  alt="Welcome to FunFinity Academy"
/>

// Responsive image
<ResponsiveImage
  src="/images/dashboard-preview.png"
  alt="Dashboard preview"
  mobileWidth={400}
  mobileHeight={300}
  tabletWidth={800}
  tabletHeight={600}
  desktopWidth={1200}
  desktopHeight={900}
/>

// Avatar
<AvatarImage
  src="/avatars/user-123.jpg"
  alt="User avatar"
  size="lg"
/>

// Gallery image
<GalleryImage
  src="/images/gallery-1.jpg"
  alt="Gallery item 1"
  onClick={() => openLightbox(1)}
/>
*/
