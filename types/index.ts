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
export type FormType = 'signup' | 'contact' | 'newsletter';

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
  data: SignupData | ContactData | NewsletterData;
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

/**
 * Property type for real estate listings
 */
export type PropertyType = 'apartment' | 'villa' | 'penthouse' | 'studio';

/**
 * Property status
 */
export type PropertyStatus = 'available' | 'filling' | 'sold';

/**
 * Property data structure for listings
 */
export interface Property {
  id: string;
  title: string;
  location: string;
  city: string;
  address: string;
  price: number;
  pricePerShare: number;
  size: number; // in sq ft
  bedrooms: number;
  bathrooms: number;
  propertyType: PropertyType;
  totalCoOwnerSlots: number;
  availableSlots: number;
  images: string[];
  description: string;
  amenities: string[];
  status: PropertyStatus;
  featured?: boolean;
}

/**
 * Property filter options
 */
export interface PropertyFilters {
  city?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  propertyType?: PropertyType;
  minBedrooms?: number;
}
