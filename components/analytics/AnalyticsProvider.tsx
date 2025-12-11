/**
 * Analytics Provider Component
 * 
 * Wraps the application and initializes Google Analytics 4.
 * Handles UTM parameter capture and persistence on mount.
 * 
 * This component should be placed high in the component tree,
 * typically in the root layout, to ensure analytics is initialized
 * before any tracking events are fired.
 */

'use client';

import { useEffect } from 'react';
import { initializeAnalytics } from '@/lib/analytics';
import { getCurrentUTMParams, storeUTMParams } from '@/lib/utm';

interface AnalyticsProviderProps {
  children: React.ReactNode;
  measurementId?: string;
}

/**
 * AnalyticsProvider component
 * 
 * Initializes Google Analytics and captures UTM parameters on mount.
 * Wraps children components to provide analytics context.
 * 
 * @param children - Child components to render
 * @param measurementId - GA4 Measurement ID (defaults to env variable)
 */
export function AnalyticsProvider({ 
  children, 
  measurementId 
}: AnalyticsProviderProps) {
  useEffect(() => {
    // Get measurement ID from props or environment variable
    const gaId = measurementId || process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

    if (!gaId) {
      console.warn('Google Analytics Measurement ID not provided');
      return;
    }

    // Initialize Google Analytics
    initializeAnalytics(gaId);

    // Capture and store UTM parameters from URL
    const utmParams = getCurrentUTMParams();
    if (Object.keys(utmParams).length > 0) {
      storeUTMParams(utmParams);
      console.log('UTM parameters captured:', utmParams);
    }
  }, [measurementId]);

  return <>{children}</>;
}
