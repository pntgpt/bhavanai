/**
 * Google Analytics Script Component
 * 
 * Loads the Google Analytics 4 script asynchronously.
 * Should be included in the root layout to ensure GA4 is available
 * throughout the application.
 * 
 * This component uses Next.js Script component for optimal loading.
 */

'use client';

import Script from 'next/script';

interface GoogleAnalyticsProps {
  measurementId?: string;
}

/**
 * GoogleAnalytics component
 * 
 * Loads the GA4 script from Google's CDN.
 * Uses Next.js Script component with afterInteractive strategy
 * to load after the page becomes interactive.
 * 
 * @param measurementId - GA4 Measurement ID (defaults to env variable)
 */
export function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  const gaId = measurementId || process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  if (!gaId) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
    </>
  );
}
