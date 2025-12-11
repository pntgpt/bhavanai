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

/**
 * Eligibility form data structure
 */
export interface EligibilityData {
  city: string;
  ageRange: string;
  monthlyRent: number;
  monthlySalary: number;
  coOwnerCount: number;
  email: string;
  phone: string;
  utmParams?: UTMParams;
}

/**
 * Signup form data structure
 */
export interface SignupData {
  name: string;
  email: string;
  phone: string;
  city: string;
  currentRent: number;
  livingType: 'solo' | 'shared' | 'coliving' | 'family';
  privacyConsent: boolean;
  marketingConsent: boolean;
  utmParams?: UTMParams;
}

/**
 * Contact form data structure
 */
export interface ContactData {
  name: string;
  email: string;
  subject: string;
  message: string;
  utmParams?: UTMParams;
}

/**
 * Newsletter form data structure
 */
export interface NewsletterData {
  email: string;
  utmParams?: UTMParams;
}

/**
 * Form submission request structure
 */
export interface FormSubmissionRequest {
  formType: FormType;
  data: EligibilityData | SignupData | ContactData | NewsletterData;
  timestamp: string;
  utmParams?: UTMParams;
}

/**
 * Form submission response structure
 */
export interface FormSubmissionResponse {
  success: boolean;
  message: string;
  leadId?: string;
}

/**
 * Form validation error structure
 */
export interface FormValidationError {
  field: string;
  message: string;
}
