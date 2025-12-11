/**
 * Form Validation Utilities
 * 
 * Provides validation functions for form inputs to ensure data quality
 * and prevent invalid submissions. All validation functions return boolean
 * values indicating whether the input is valid.
 * 
 * These validators are used across all forms (eligibility, signup, contact)
 * to maintain consistent validation logic.
 */

/**
 * Validates email address format
 * Uses a comprehensive regex pattern that covers most valid email formats
 * 
 * @param email - The email address to validate
 * @returns true if email format is valid, false otherwise
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }

  // Trim whitespace
  const trimmedEmail = email.trim();

  // Check minimum length
  if (trimmedEmail.length < 3) {
    return false;
  }

  // Email regex pattern
  // Matches: user@example.com, user.name+tag@example.co.uk, etc.
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  return emailRegex.test(trimmedEmail);
}

/**
 * Validates Indian phone number format
 * Accepts formats: 9876543210, +919876543210, 91-9876543210
 * 
 * @param phone - The phone number to validate
 * @returns true if phone format is valid, false otherwise
 */
export function validatePhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') {
    return false;
  }

  // Remove all spaces, hyphens, and parentheses
  const cleanedPhone = phone.replace(/[\s\-()]/g, '');

  // Indian phone number patterns:
  // 10 digits: 9876543210
  // With country code: +919876543210 or 919876543210
  const phoneRegex = /^(\+91|91)?[6-9]\d{9}$/;
  
  return phoneRegex.test(cleanedPhone);
}

/**
 * Validates that a required field is not empty
 * Checks for null, undefined, empty strings, and whitespace-only strings
 * 
 * @param value - The value to validate
 * @returns true if value is present and not empty, false otherwise
 */
export function validateRequired(value: any): boolean {
  if (value === null || value === undefined) {
    return false;
  }

  if (typeof value === 'string') {
    return value.trim().length > 0;
  }

  if (typeof value === 'number') {
    return !isNaN(value);
  }

  return true;
}

/**
 * Validates numeric input
 * Ensures the value is a valid number and optionally within a range
 * 
 * @param value - The value to validate (can be string or number)
 * @param min - Optional minimum value (inclusive)
 * @param max - Optional maximum value (inclusive)
 * @returns true if value is a valid number within range, false otherwise
 */
export function validateNumeric(
  value: string | number,
  min?: number,
  max?: number
): boolean {
  // Convert to number if string
  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  // Check if it's a valid number
  if (isNaN(numValue) || !isFinite(numValue)) {
    return false;
  }

  // Check minimum value
  if (min !== undefined && numValue < min) {
    return false;
  }

  // Check maximum value
  if (max !== undefined && numValue > max) {
    return false;
  }

  return true;
}

/**
 * Validates that a value is within a specific range
 * Used for numeric inputs like co-owner count, age range, etc.
 * 
 * @param value - The numeric value to validate
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @returns true if value is within range, false otherwise
 */
export function validateRange(value: number, min: number, max: number): boolean {
  return validateNumeric(value, min, max);
}

/**
 * Validates minimum string length
 * Useful for text fields that require a minimum number of characters
 * 
 * @param value - The string to validate
 * @param minLength - Minimum required length
 * @returns true if string meets minimum length, false otherwise
 */
export function validateMinLength(value: string, minLength: number): boolean {
  if (!value || typeof value !== 'string') {
    return false;
  }

  return value.trim().length >= minLength;
}

/**
 * Validates maximum string length
 * Useful for text fields that have a character limit
 * 
 * @param value - The string to validate
 * @param maxLength - Maximum allowed length
 * @returns true if string is within max length, false otherwise
 */
export function validateMaxLength(value: string, maxLength: number): boolean {
  if (!value || typeof value !== 'string') {
    return true; // Empty values are valid for max length check
  }

  return value.trim().length <= maxLength;
}

/**
 * Validates that a value is one of the allowed options
 * Useful for dropdown selections and radio buttons
 * 
 * @param value - The value to validate
 * @param allowedValues - Array of allowed values
 * @returns true if value is in allowed list, false otherwise
 */
export function validateEnum<T>(value: T, allowedValues: T[]): boolean {
  return allowedValues.includes(value);
}

/**
 * Validation error message generator
 * Provides user-friendly error messages for validation failures
 */
export const validationMessages = {
  required: (fieldName: string) => `${fieldName} is required`,
  email: 'Please enter a valid email address',
  phone: 'Please enter a valid Indian phone number (10 digits)',
  numeric: (fieldName: string) => `${fieldName} must be a valid number`,
  min: (fieldName: string, min: number) => 
    `${fieldName} must be at least ${min}`,
  max: (fieldName: string, max: number) => 
    `${fieldName} must be at most ${max}`,
  range: (fieldName: string, min: number, max: number) => 
    `${fieldName} must be between ${min} and ${max}`,
  minLength: (fieldName: string, length: number) => 
    `${fieldName} must be at least ${length} characters`,
  maxLength: (fieldName: string, length: number) => 
    `${fieldName} must be at most ${length} characters`,
};

/**
 * Composite validation function for form fields
 * Runs multiple validators and returns the first error message
 * 
 * @param value - The value to validate
 * @param validators - Array of validator functions
 * @returns Error message if validation fails, null if valid
 */
export function validateField(
  value: any,
  validators: Array<{ validate: () => boolean; message: string }>
): string | null {
  for (const validator of validators) {
    if (!validator.validate()) {
      return validator.message;
    }
  }
  return null;
}
