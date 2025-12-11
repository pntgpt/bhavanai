/**
 * Type definitions for the Bhavan.ai marketing website
 * These types ensure type safety across components and utilities
 */

/**
 * UTM Parameters for marketing attribution
 * Used to track campaign performance and user sources
 */
export interface UTMParams {
  source?: string;
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
}

/**
 * Button variants for consistent styling
 */
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';

/**
 * Button sizes
 */
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Form types for tracking submissions
 */
export type FormType = 'eligibility' | 'signup' | 'contact' | 'newsletter';

/**
 * Analytics event categories
 */
export type EventCategory = 'engagement' | 'conversion' | 'navigation';

/**
 * Analytics event structure
 */
export interface AnalyticsEvent {
  eventName: string;
  eventCategory: EventCategory;
  eventLabel?: string;
  eventValue?: number;
  customParams?: Record<string, any>;
}
