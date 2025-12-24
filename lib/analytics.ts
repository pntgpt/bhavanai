/**
 * Google Analytics 4 Integration
 * 
 * Provides utilities for initializing GA4 and tracking custom events.
 * All analytics calls are wrapped in try-catch blocks to ensure graceful
 * failure if GA4 fails to load or if there are tracking errors.
 * 
 * This module handles:
 * - GA4 initialization
 * - Custom event tracking for CTA clicks
 * - Form conversion tracking
 * - UTM parameter persistence
 */

import { UTMParams } from '@/types';
import { getCurrentUTMParams, storeUTMParams } from './utm';

/**
 * Type definitions for Google Analytics gtag function
 */
declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string | Date,
      config?: Record<string, any>
    ) => void;
    dataLayer?: any[];
  }
}

/**
 * Analytics event categories
 */
export type EventCategory = 'engagement' | 'conversion' | 'navigation';

/**
 * Analytics event interface
 */
export interface AnalyticsEvent {
  eventName: string;
  eventCategory: EventCategory;
  eventLabel?: string;
  eventValue?: number;
  customParams?: Record<string, any>;
}

/**
 * Form types for conversion tracking
 */
export type FormType = 'eligibility' | 'signup' | 'contact' | 'newsletter';

/**
 * CTA identifiers for tracking
 */
export type CTAIdentifier = 
  | 'hero_get_early_access'
  | 'hero_signup_now'
  | 'hero_signup_whatsapp'
  | 'hero_how_it_works'
  | 'how_it_works_see_eligibility'
  | 'header_get_early_access'
  | 'header_signup_whatsapp'
  | 'footer_newsletter'
  | 'team_contact'
  | 'roadmap_get_early_access';

/**
 * Checks if Google Analytics is loaded and available
 * 
 * @returns true if gtag function is available, false otherwise
 */
export function isAnalyticsAvailable(): boolean {
  return typeof window !== 'undefined' && typeof window.gtag === 'function';
}

/**
 * Initializes Google Analytics 4
 * Should be called once when the app loads
 * 
 * @param measurementId - GA4 Measurement ID (e.g., 'G-XXXXXXXXXX')
 */
export function initializeAnalytics(measurementId: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    // Initialize dataLayer if it doesn't exist
    window.dataLayer = window.dataLayer || [];
    
    // Define gtag function
    window.gtag = function gtag() {
      window.dataLayer?.push(arguments);
    };

    // Set the current timestamp
    window.gtag('js', new Date());

    // Configure GA4 with measurement ID
    window.gtag('config', measurementId, {
      send_page_view: true,
      anonymize_ip: true, // Privacy-friendly
    });

    // Capture and store UTM parameters on initialization
    const utmParams = getCurrentUTMParams();
    if (Object.keys(utmParams).length > 0) {
      storeUTMParams(utmParams);
      
      // Send UTM parameters to GA4
      window.gtag('set', measurementId, {
        campaign_source: utmParams.source,
        campaign_medium: utmParams.medium,
        campaign_name: utmParams.campaign,
        campaign_term: utmParams.term,
        campaign_content: utmParams.content,
      });
    }

    console.log('Google Analytics initialized:', measurementId);
  } catch (error) {
    // Fail silently - analytics should never break the user experience
    console.warn('Failed to initialize Google Analytics:', error);
  }
}

/**
 * Tracks a custom event in Google Analytics
 * 
 * @param event - Analytics event object with name, category, and optional parameters
 */
export function trackEvent(event: AnalyticsEvent): void {
  if (!isAnalyticsAvailable()) {
    console.warn('Analytics not available, event not tracked:', event.eventName);
    return;
  }

  try {
    const { eventName, eventCategory, eventLabel, eventValue, customParams } = event;

    // Build event parameters
    const eventParams: Record<string, any> = {
      event_category: eventCategory,
    };

    if (eventLabel) {
      eventParams.event_label = eventLabel;
    }

    if (eventValue !== undefined) {
      eventParams.value = eventValue;
    }

    // Add custom parameters
    if (customParams) {
      Object.assign(eventParams, customParams);
    }

    // Send event to GA4
    window.gtag!('event', eventName, eventParams);

    console.log('Analytics event tracked:', eventName, eventParams);
  } catch (error) {
    // Fail silently
    console.warn('Failed to track analytics event:', error);
  }
}

/**
 * Tracks a CTA button click
 * 
 * @param ctaId - Identifier for the CTA button
 * @param ctaText - Text displayed on the CTA button
 */
export function trackCTAClick(ctaId: CTAIdentifier, ctaText: string): void {
  trackEvent({
    eventName: 'cta_click',
    eventCategory: 'engagement',
    eventLabel: ctaId,
    customParams: {
      cta_text: ctaText,
      cta_id: ctaId,
    },
  });
}

/**
 * Tracks a form conversion (successful submission)
 * 
 * @param formType - Type of form submitted
 * @param formData - Optional form data to include in tracking (non-PII only)
 */
export function trackFormConversion(
  formType: FormType,
  formData?: Record<string, any>
): void {
  // Get current UTM parameters for attribution
  const utmParams = getCurrentUTMParams();

  // Build conversion parameters
  const conversionParams: Record<string, any> = {
    form_type: formType,
  };

  // Add UTM parameters for attribution
  if (utmParams.source) conversionParams.utm_source = utmParams.source;
  if (utmParams.medium) conversionParams.utm_medium = utmParams.medium;
  if (utmParams.campaign) conversionParams.utm_campaign = utmParams.campaign;
  if (utmParams.term) conversionParams.utm_term = utmParams.term;
  if (utmParams.content) conversionParams.utm_content = utmParams.content;

  // Add non-PII form data if provided
  if (formData) {
    // Only include safe, non-PII data
    const safeFields = ['city', 'ageRange', 'coOwnerCount', 'livingType'];
    safeFields.forEach(field => {
      if (formData[field] !== undefined) {
        conversionParams[field] = formData[field];
      }
    });
  }

  trackEvent({
    eventName: 'form_submission',
    eventCategory: 'conversion',
    eventLabel: formType,
    eventValue: 1, // Each conversion has value of 1
    customParams: conversionParams,
  });
}

/**
 * Tracks a page view
 * Useful for single-page applications or manual page view tracking
 * 
 * @param pagePath - Path of the page being viewed
 * @param pageTitle - Title of the page
 */
export function trackPageView(pagePath: string, pageTitle: string): void {
  if (!isAnalyticsAvailable()) {
    return;
  }

  try {
    window.gtag!('event', 'page_view', {
      page_path: pagePath,
      page_title: pageTitle,
    });

    console.log('Page view tracked:', pagePath);
  } catch (error) {
    console.warn('Failed to track page view:', error);
  }
}

/**
 * Tracks a navigation event
 * 
 * @param destination - Where the user is navigating to
 * @param source - Where the navigation originated from
 */
export function trackNavigation(destination: string, source: string): void {
  trackEvent({
    eventName: 'navigation',
    eventCategory: 'navigation',
    eventLabel: destination,
    customParams: {
      destination,
      source,
    },
  });
}

/**
 * Tracks a scroll-to-section event
 * 
 * @param sectionId - ID of the section being scrolled to
 */
export function trackScrollToSection(sectionId: string): void {
  trackEvent({
    eventName: 'scroll_to_section',
    eventCategory: 'engagement',
    eventLabel: sectionId,
    customParams: {
      section_id: sectionId,
    },
  });
}

/**
 * Tracks a download event
 * 
 * @param fileName - Name of the file being downloaded
 * @param fileType - Type of file (e.g., 'pdf', 'doc')
 */
export function trackDownload(fileName: string, fileType: string): void {
  trackEvent({
    eventName: 'file_download',
    eventCategory: 'engagement',
    eventLabel: fileName,
    customParams: {
      file_name: fileName,
      file_type: fileType,
    },
  });
}

/**
 * Tracks an external link click
 * 
 * @param url - URL of the external link
 * @param linkText - Text of the link
 */
export function trackExternalLink(url: string, linkText: string): void {
  trackEvent({
    eventName: 'external_link_click',
    eventCategory: 'engagement',
    eventLabel: url,
    customParams: {
      link_url: url,
      link_text: linkText,
    },
  });
}

/**
 * Sets user properties in Google Analytics
 * Useful for segmentation and analysis
 * 
 * @param properties - User properties to set (non-PII only)
 */
export function setUserProperties(properties: Record<string, any>): void {
  if (!isAnalyticsAvailable()) {
    return;
  }

  try {
    window.gtag!('set', 'user_properties', properties);
    console.log('User properties set:', properties);
  } catch (error) {
    console.warn('Failed to set user properties:', error);
  }
}
