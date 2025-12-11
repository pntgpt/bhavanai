'use client';

import { useEffect } from 'react';
import { initPerformanceMonitoring } from '@/lib/performance';

/**
 * PerformanceMonitor Component
 * 
 * Client-side component that initializes performance monitoring
 * and tracks Core Web Vitals for the application.
 * 
 * This component should be included in the root layout to ensure
 * performance metrics are tracked across all pages.
 * 
 * Tracks:
 * - LCP (Largest Contentful Paint)
 * - FID (First Input Delay)
 * - CLS (Cumulative Layout Shift)
 * - Page load times
 * - Long tasks (in development)
 * 
 * Requirements: 12.2 (Lighthouse score > 90)
 */
const PerformanceMonitor: React.FC = () => {
  useEffect(() => {
    // Initialize performance monitoring on mount
    initPerformanceMonitoring();

    // Track Web Vitals if available
    if (typeof window !== 'undefined' && 'web-vitals' in window) {
      // Web Vitals library would be imported here if installed
      // For now, we rely on the browser's native Performance API
    }
  }, []);

  // This component doesn't render anything
  return null;
};

export default PerformanceMonitor;
