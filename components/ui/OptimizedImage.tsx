'use client';

import React, { useState, useEffect, useRef } from 'react';

/**
 * OptimizedImage Component
 * 
 * A performance-optimized image component that implements:
 * - Lazy loading for below-the-fold images (Requirement 12.4)
 * - Responsive image breakpoints (Requirement 12.3)
 * - Loading states and placeholders
 * - Intersection Observer for efficient lazy loading
 * - Aspect ratio preservation to prevent layout shifts
 * 
 * This component is designed for static export compatibility
 * and provides better performance than standard img tags.
 * 
 * Requirements: 12.2, 12.3, 12.4, 12.5
 */

export interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean; // Load immediately (for above-the-fold images)
  aspectRatio?: string; // e.g., "16/9", "4/3", "1/1"
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  sizes?: string; // Responsive sizes attribute
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * OptimizedImage component with lazy loading and responsive support
 */
const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  aspectRatio,
  objectFit = 'cover',
  sizes,
  onLoad,
  onError,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority); // Load immediately if priority
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  /**
   * Intersection Observer for lazy loading
   * Only loads images when they're about to enter the viewport
   * Requirement 12.4: Lazy loading for below-the-fold images
   */
  useEffect(() => {
    if (priority || !imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before image enters viewport
        threshold: 0.01,
      }
    );

    observer.observe(imgRef.current);

    return () => {
      observer.disconnect();
    };
  }, [priority]);

  /**
   * Handle image load success
   */
  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  /**
   * Handle image load error
   */
  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  /**
   * Calculate aspect ratio padding for container
   */
  const getAspectRatioPadding = (): string => {
    if (aspectRatio) {
      const [w, h] = aspectRatio.split('/').map(Number);
      return `${(h / w) * 100}%`;
    }
    if (width && height) {
      return `${(height / width) * 100}%`;
    }
    return '100%';
  };

  /**
   * Generate srcset for responsive images
   * Requirement 12.3: Responsive image breakpoints
   */
  const generateSrcSet = (): string => {
    if (!src) return '';
    
    // For static export, we'll use the same image
    // In production, you'd generate multiple sizes
    const breakpoints = [640, 750, 828, 1080, 1200, 1920];
    return breakpoints.map(w => `${src} ${w}w`).join(', ');
  };

  /**
   * Default sizes attribute for responsive images
   */
  const defaultSizes = sizes || '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
      style={{
        paddingBottom: aspectRatio || (width && height) ? getAspectRatioPadding() : undefined,
      }}
    >
      {/* Loading placeholder */}
      {!isLoaded && !hasError && (
        <div
          className="absolute inset-0 bg-gray-200 animate-pulse"
          aria-hidden="true"
        />
      )}

      {/* Error placeholder */}
      {hasError && (
        <div
          className="absolute inset-0 bg-gray-100 flex items-center justify-center"
          role="img"
          aria-label={`Failed to load image: ${alt}`}
        >
          <svg
            className="w-12 h-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      )}

      {/* Actual image - only render when in view or priority */}
      {isInView && !hasError && (
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          srcSet={generateSrcSet()}
          sizes={defaultSizes}
          onLoad={handleLoad}
          onError={handleError}
          className={`absolute inset-0 w-full h-full transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            objectFit,
          }}
        />
      )}
    </div>
  );
};

export default OptimizedImage;
