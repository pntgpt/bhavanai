/**
 * Performance Monitoring Utilities
 * 
 * Provides utilities for tracking Core Web Vitals and performance metrics.
 * Integrates with Google Analytics to track real user performance data.
 * 
 * Core Web Vitals tracked:
 * - LCP (Largest Contentful Paint): Loading performance
 * - FID (First Input Delay): Interactivity
 * - CLS (Cumulative Layout Shift): Visual stability
 * 
 * Requirements: 12.2 (Lighthouse score > 90)
 */

/**
 * Report Web Vitals to analytics
 * This function can be called from app/layout.tsx to track performance
 */
export function reportWebVitals(metric: any) {
  try {
    // Send to Google Analytics if available (only in production)
    if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', metric.name, {
        event_category: 'Web Vitals',
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        event_label: metric.id,
        non_interaction: true,
      });
    }

    // Log to console in development
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Web Vitals] ${metric.name}:`, metric.value);
    }
  } catch (error) {
    // Fail silently - don't break the app if analytics fails
    console.error('Error reporting web vitals:', error);
  }
}

/**
 * Performance observer for tracking long tasks
 * Helps identify performance bottlenecks
 */
export function observeLongTasks() {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
    return;
  }

  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        // Log tasks that take longer than 50ms
        if (entry.duration > 50) {
          console.warn(`Long task detected: ${entry.duration.toFixed(2)}ms`);
        }
      }
    });

    observer.observe({ entryTypes: ['longtask'] });
  } catch (error) {
    // PerformanceObserver might not be supported
    console.error('Error setting up performance observer:', error);
  }
}

/**
 * Measure and log page load performance
 */
export function measurePageLoad() {
  if (typeof window === 'undefined' || !window.performance) {
    return;
  }

  // Wait for page to fully load
  window.addEventListener('load', () => {
    setTimeout(() => {
      const perfData = window.performance.timing;
      const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
      const connectTime = perfData.responseEnd - perfData.requestStart;
      const renderTime = perfData.domComplete - perfData.domLoading;

      console.log('Performance Metrics:', {
        pageLoadTime: `${pageLoadTime}ms`,
        connectTime: `${connectTime}ms`,
        renderTime: `${renderTime}ms`,
      });

      // Send to analytics if available
      if ((window as any).gtag) {
        (window as any).gtag('event', 'page_load_time', {
          event_category: 'Performance',
          value: pageLoadTime,
          non_interaction: true,
        });
      }
    }, 0);
  });
}

/**
 * Prefetch resources for better performance
 * Can be used to preload critical resources
 */
export function prefetchResource(url: string, type: 'script' | 'style' | 'image' | 'fetch' = 'fetch') {
  if (typeof window === 'undefined') {
    return;
  }

  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.as = type;
  link.href = url;
  document.head.appendChild(link);
}

/**
 * Preconnect to external domains for faster resource loading
 */
export function preconnectDomain(domain: string) {
  if (typeof window === 'undefined') {
    return;
  }

  const link = document.createElement('link');
  link.rel = 'preconnect';
  link.href = domain;
  document.head.appendChild(link);
}

/**
 * Initialize performance monitoring
 * Call this from the root layout or app component
 */
export function initPerformanceMonitoring() {
  if (typeof window === 'undefined') {
    return;
  }

  // Preconnect to Google Analytics
  preconnectDomain('https://www.google-analytics.com');
  preconnectDomain('https://www.googletagmanager.com');

  // Measure page load
  measurePageLoad();

  // Observe long tasks in development
  if (process.env.NODE_ENV === 'development') {
    observeLongTasks();
  }
}

/**
 * Check if the user prefers reduced motion
 * Use this to disable animations for accessibility
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Get connection speed information
 * Useful for adaptive loading strategies
 */
export function getConnectionSpeed(): 'slow' | 'fast' | 'unknown' {
  if (typeof window === 'undefined' || !('connection' in navigator)) {
    return 'unknown';
  }

  const connection = (navigator as any).connection;
  const effectiveType = connection?.effectiveType;

  if (effectiveType === 'slow-2g' || effectiveType === '2g') {
    return 'slow';
  }

  if (effectiveType === '3g' || effectiveType === '4g') {
    return 'fast';
  }

  return 'unknown';
}
