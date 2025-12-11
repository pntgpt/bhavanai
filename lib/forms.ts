/**
 * Form Submission Utilities
 * 
 * Provides functions for handling form submissions, including data formatting,
 * API communication, error handling, and retry logic.
 * 
 * These utilities ensure consistent form submission behavior across all forms
 * and provide robust error handling for network issues and server errors.
 */

import {
  FormType,
  FormSubmissionRequest,
  FormSubmissionResponse,
  EligibilityData,
  SignupData,
  ContactData,
  NewsletterData,
  UTMParams,
} from '@/types';
import { getCurrentUTMParams } from './utm';

/**
 * Configuration for form submission
 */
interface FormSubmissionConfig {
  endpoint?: string;
  timeout?: number;
  maxRetries?: number;
  retryDelay?: number;
}

/**
 * Default configuration values
 */
const DEFAULT_CONFIG: Required<FormSubmissionConfig> = {
  endpoint: process.env.NEXT_PUBLIC_FORM_ENDPOINT || '/api/submit-form',
  timeout: 30000, // 30 seconds
  maxRetries: 3,
  retryDelay: 1000, // 1 second
};

/**
 * Custom error class for form submission errors
 */
export class FormSubmissionError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public isNetworkError: boolean = false,
    public isTimeout: boolean = false
  ) {
    super(message);
    this.name = 'FormSubmissionError';
  }
}

/**
 * Formats form data into the standard submission request format
 * Automatically includes UTM parameters and timestamp
 * 
 * @param formType - Type of form being submitted
 * @param data - Form data to format
 * @param utmParams - Optional UTM parameters (will use stored if not provided)
 * @returns Formatted form submission request
 */
export function formatFormData(
  formType: FormType,
  data: EligibilityData | SignupData | ContactData | NewsletterData,
  utmParams?: UTMParams
): FormSubmissionRequest {
  // Get UTM params from storage if not provided
  const finalUTMParams = utmParams || getCurrentUTMParams();

  return {
    formType,
    data: {
      ...data,
      utmParams: finalUTMParams,
    },
    timestamp: new Date().toISOString(),
    utmParams: finalUTMParams,
  };
}

/**
 * Delays execution for a specified time
 * Used for retry logic
 * 
 * @param ms - Milliseconds to delay
 * @returns Promise that resolves after delay
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Makes a fetch request with timeout support
 * 
 * @param url - URL to fetch
 * @param options - Fetch options
 * @param timeout - Timeout in milliseconds
 * @returns Promise with fetch response
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout: number
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new FormSubmissionError(
        'Request is taking longer than expected. Please try again.',
        undefined,
        false,
        true
      );
    }
    throw error;
  }
}

/**
 * Submits form data to the configured endpoint with retry logic
 * 
 * @param formType - Type of form being submitted
 * @param data - Form data to submit
 * @param config - Optional configuration overrides
 * @returns Promise with submission response
 * @throws FormSubmissionError if submission fails after all retries
 */
export async function submitForm(
  formType: FormType,
  data: EligibilityData | SignupData | ContactData | NewsletterData,
  config: FormSubmissionConfig = {}
): Promise<FormSubmissionResponse> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const formattedData = formatFormData(formType, data);

  let lastError: Error | null = null;
  let attempt = 0;

  while (attempt < finalConfig.maxRetries) {
    attempt++;

    try {
      const response = await fetchWithTimeout(
        finalConfig.endpoint,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formattedData),
        },
        finalConfig.timeout
      );

      // Handle successful response
      if (response.ok) {
        const result: FormSubmissionResponse = await response.json();
        return result;
      }

      // Handle error responses
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || 'Form submission failed';

      throw new FormSubmissionError(
        errorMessage,
        response.status,
        false,
        false
      );
    } catch (error) {
      lastError = error as Error;

      // Don't retry on client errors (4xx) except 408 (timeout) and 429 (rate limit)
      if (
        error instanceof FormSubmissionError &&
        error.statusCode &&
        error.statusCode >= 400 &&
        error.statusCode < 500 &&
        error.statusCode !== 408 &&
        error.statusCode !== 429
      ) {
        throw error;
      }

      // If this was the last attempt, throw the error
      if (attempt >= finalConfig.maxRetries) {
        break;
      }

      // Wait before retrying (exponential backoff)
      const delayTime = finalConfig.retryDelay * Math.pow(2, attempt - 1);
      await delay(delayTime);
    }
  }

  // All retries failed
  if (lastError instanceof FormSubmissionError) {
    throw lastError;
  }

  // Network or unknown error
  throw new FormSubmissionError(
    'Connection error. Please check your internet and try again.',
    undefined,
    true,
    false
  );
}

/**
 * Gets a user-friendly error message for form submission errors
 * 
 * @param error - Error object from form submission
 * @returns User-friendly error message
 */
export function getFormErrorMessage(error: unknown): string {
  if (error instanceof FormSubmissionError) {
    if (error.isTimeout) {
      return 'Request is taking longer than expected. Please try again.';
    }

    if (error.isNetworkError) {
      return 'Connection error. Please check your internet and try again.';
    }

    if (error.statusCode && error.statusCode >= 500) {
      return 'Something went wrong. Please try again or email us at hello@bhavan.ai';
    }

    // Return the specific error message for other cases
    return error.message;
  }

  // Generic error
  return 'Something went wrong. Please try again or email us at hello@bhavan.ai';
}

/**
 * Validates eligibility form data before submission
 * 
 * @param data - Eligibility form data to validate
 * @returns Array of validation error messages (empty if valid)
 */
export function validateEligibilityData(data: Partial<EligibilityData>): string[] {
  const errors: string[] = [];

  if (!data.city || data.city.trim().length === 0) {
    errors.push('City is required');
  }

  if (!data.ageRange || data.ageRange.trim().length === 0) {
    errors.push('Age range is required');
  }

  if (!data.monthlyRent || data.monthlyRent <= 0) {
    errors.push('Monthly rent must be greater than 0');
  }

  if (!data.monthlySalary || data.monthlySalary <= 0) {
    errors.push('Monthly salary must be greater than 0');
  }

  if (!data.coOwnerCount || data.coOwnerCount < 2 || data.coOwnerCount > 5) {
    errors.push('Co-owner count must be between 2 and 5');
  }

  if (!data.email || data.email.trim().length === 0) {
    errors.push('Email is required');
  }

  if (!data.phone || data.phone.trim().length === 0) {
    errors.push('Phone number is required');
  }

  return errors;
}

/**
 * Validates signup form data before submission
 * 
 * @param data - Signup form data to validate
 * @returns Array of validation error messages (empty if valid)
 */
export function validateSignupData(data: Partial<SignupData>): string[] {
  const errors: string[] = [];

  if (!data.name || data.name.trim().length === 0) {
    errors.push('Name is required');
  }

  if (!data.email || data.email.trim().length === 0) {
    errors.push('Email is required');
  }

  if (!data.phone || data.phone.trim().length === 0) {
    errors.push('Phone number is required');
  }

  if (!data.city || data.city.trim().length === 0) {
    errors.push('City is required');
  }

  if (!data.currentRent || data.currentRent <= 0) {
    errors.push('Current rent must be greater than 0');
  }

  if (!data.livingType) {
    errors.push('Living type is required');
  }

  if (!data.privacyConsent) {
    errors.push('You must accept the privacy policy');
  }

  return errors;
}

/**
 * Validates contact form data before submission
 * 
 * @param data - Contact form data to validate
 * @returns Array of validation error messages (empty if valid)
 */
export function validateContactData(data: Partial<ContactData>): string[] {
  const errors: string[] = [];

  if (!data.name || data.name.trim().length === 0) {
    errors.push('Name is required');
  }

  if (!data.email || data.email.trim().length === 0) {
    errors.push('Email is required');
  }

  if (!data.subject || data.subject.trim().length === 0) {
    errors.push('Subject is required');
  }

  if (!data.message || data.message.trim().length === 0) {
    errors.push('Message is required');
  }

  if (data.message && data.message.trim().length < 10) {
    errors.push('Message must be at least 10 characters');
  }

  return errors;
}

/**
 * Validates newsletter form data before submission
 * 
 * @param data - Newsletter form data to validate
 * @returns Array of validation error messages (empty if valid)
 */
export function validateNewsletterData(data: Partial<NewsletterData>): string[] {
  const errors: string[] = [];

  if (!data.email || data.email.trim().length === 0) {
    errors.push('Email is required');
  }

  return errors;
}

/**
 * Sanitizes user input to prevent XSS attacks
 * Removes potentially dangerous characters and HTML tags
 * 
 * @param input - User input to sanitize
 * @returns Sanitized string
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Remove HTML tags
  let sanitized = input.replace(/<[^>]*>/g, '');

  // Remove script tags and their content
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Trim whitespace
  sanitized = sanitized.trim();

  return sanitized;
}

/**
 * Sanitizes all string fields in form data
 * 
 * @param data - Form data object to sanitize
 * @returns Sanitized form data
 */
export function sanitizeFormData<T extends Record<string, any>>(data: T): T {
  const sanitized = { ...data };

  for (const key in sanitized) {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitizeInput(sanitized[key]) as any;
    }
  }

  return sanitized;
}
