'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import { SignupData } from '@/types';
import { validateEmail, validatePhone, validateRequired, validateNumeric } from '@/lib/validation';
import { submitForm, getFormErrorMessage } from '@/lib/forms';
import Button from '@/components/ui/Button';

/**
 * SignupForm Component
 * 
 * Full registration form for early access to Bhavan.ai platform.
 * Collects comprehensive user information including name, contact details,
 * current living situation, and consent preferences.
 * Implements GDPR/India privacy compliance with explicit consent checkboxes.
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
 */

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  city?: string;
  currentRent?: string;
  livingType?: string;
  privacyConsent?: string;
}

// Indian cities where Bhavan.ai operates or plans to operate
const CITIES = [
  'Bangalore',
  'Mumbai',
  'Delhi',
  'Pune',
  'Hyderabad',
  'Chennai',
  'Kolkata',
  'Ahmedabad',
  'Gurgaon',
  'Noida',
];

// Living type options
const LIVING_TYPES: Array<{ value: SignupData['livingType']; label: string }> = [
  { value: 'solo', label: 'Living Alone' },
  { value: 'shared', label: 'Shared Apartment' },
  { value: 'coliving', label: 'Co-living Space' },
  { value: 'family', label: 'With Family' },
];

interface SignupFormProps {
  onSuccess?: () => void;
  inline?: boolean;
}

export default function SignupForm({ onSuccess, inline = false }: SignupFormProps) {
  // Form state
  const [formData, setFormData] = useState<Partial<SignupData>>({
    name: '',
    email: '',
    phone: '',
    city: '',
    currentRent: undefined,
    livingType: undefined,
    privacyConsent: false,
    marketingConsent: false,
  });

  // Validation errors
  const [errors, setErrors] = useState<FormErrors>({});

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  /**
   * Validates a single field
   */
  const validateField = (name: keyof SignupData, value: any): string | undefined => {
    switch (name) {
      case 'name':
        if (!validateRequired(value)) return 'Name is required';
        if (typeof value === 'string' && value.trim().length < 2) {
          return 'Name must be at least 2 characters';
        }
        return undefined;
      
      case 'email':
        if (!validateRequired(value)) return 'Email is required';
        if (!validateEmail(value)) return 'Please enter a valid email address';
        return undefined;
      
      case 'phone':
        if (!validateRequired(value)) return 'Phone number is required';
        if (!validatePhone(value)) return 'Please enter a valid Indian phone number (10 digits)';
        return undefined;
      
      case 'city':
        return !validateRequired(value) ? 'Please select a city' : undefined;
      
      case 'currentRent':
        if (!validateRequired(value)) return 'Current rent is required';
        if (!validateNumeric(value, 1)) return 'Please enter a valid rent amount';
        return undefined;
      
      case 'livingType':
        return !validateRequired(value) ? 'Please select your current living type' : undefined;
      
      case 'privacyConsent':
        return value !== true ? 'You must accept the privacy policy to continue' : undefined;
      
      default:
        return undefined;
    }
  };

  /**
   * Validates all form fields
   */
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    // Validate each required field
    const fieldsToValidate: Array<keyof FormErrors> = [
      'name',
      'email',
      'phone',
      'city',
      'currentRent',
      'livingType',
      'privacyConsent',
    ];

    fieldsToValidate.forEach((key) => {
      const error = validateField(key as keyof SignupData, formData[key as keyof SignupData]);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  /**
   * Handles input changes
   */
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Handle checkbox inputs
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      // Convert numeric inputs to numbers
      const processedValue = type === 'number' ? parseFloat(value) || undefined : value;
      
      setFormData((prev) => ({
        ...prev,
        [name]: processedValue,
      }));
    }

    // Clear error for this field when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }

    // Clear submission error
    if (submitError) {
      setSubmitError(null);
    }
  };

  /**
   * Handles form submission
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Reset submission state
    setSubmitSuccess(false);
    setSubmitError(null);

    // Validate form
    if (!validateForm()) {
      return;
    }

    // Set submitting state
    setIsSubmitting(true);

    try {
      // Submit form with UTM capture
      await submitForm('signup', formData as SignupData);

      // Show success message
      setSubmitSuccess(true);

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        city: '',
        currentRent: undefined,
        livingType: undefined,
        privacyConsent: false,
        marketingConsent: false,
      });
      setErrors({});
    } catch (error) {
      // Show error message
      setSubmitError(getFormErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show success message
  if (submitSuccess) {
    return (
      <div className={`bg-white rounded-lg ${inline ? 'p-6' : 'shadow-lg p-8'} max-w-2xl mx-auto`}>
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="font-serif font-bold text-2xl text-gray-900 mb-2">
            You're on the List!
          </h3>
          <p className="font-sans text-gray-600 mb-6">
            You're on the list! We'll notify you when Bhavan.ai launches in your city.
          </p>
          <Button
            variant="primary"
            size="md"
            onClick={() => setSubmitSuccess(false)}
          >
            Sign Up Another Person
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`bg-white rounded-lg ${inline ? 'p-6' : 'shadow-lg p-8'} max-w-2xl mx-auto`}>
      <div className="space-y-6">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block font-sans font-medium text-gray-700 mb-2">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="John Doe"
            className={`w-full px-4 py-2 border rounded-md font-sans focus:outline-none focus:ring-2 transition-colors ${
              errors.name
                ? 'border-red-500 focus:ring-red-200'
                : 'border-gray-300 focus:border-primary-500 focus:ring-primary-200'
            }`}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600 font-sans">{errors.name}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block font-sans font-medium text-gray-700 mb-2">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="your.email@example.com"
            className={`w-full px-4 py-2 border rounded-md font-sans focus:outline-none focus:ring-2 transition-colors ${
              errors.email
                ? 'border-red-500 focus:ring-red-200'
                : 'border-gray-300 focus:border-primary-500 focus:ring-primary-200'
            }`}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600 font-sans">{errors.email}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block font-sans font-medium text-gray-700 mb-2">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="9876543210"
            className={`w-full px-4 py-2 border rounded-md font-sans focus:outline-none focus:ring-2 transition-colors ${
              errors.phone
                ? 'border-red-500 focus:ring-red-200'
                : 'border-gray-300 focus:border-primary-500 focus:ring-primary-200'
            }`}
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600 font-sans">{errors.phone}</p>
          )}
        </div>

        {/* City Selection */}
        <div>
          <label htmlFor="city" className="block font-sans font-medium text-gray-700 mb-2">
            City <span className="text-red-500">*</span>
          </label>
          <select
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-md font-sans focus:outline-none focus:ring-2 transition-colors ${
              errors.city
                ? 'border-red-500 focus:ring-red-200'
                : 'border-gray-300 focus:border-primary-500 focus:ring-primary-200'
            }`}
          >
            <option value="">Select your city</option>
            {CITIES.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
          {errors.city && (
            <p className="mt-1 text-sm text-red-600 font-sans">{errors.city}</p>
          )}
        </div>

        {/* Current Rent */}
        <div>
          <label htmlFor="currentRent" className="block font-sans font-medium text-gray-700 mb-2">
            Current Monthly Rent (₹) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="currentRent"
            name="currentRent"
            value={formData.currentRent || ''}
            onChange={handleChange}
            placeholder="e.g., 25000"
            min="0"
            step="1000"
            className={`w-full px-4 py-2 border rounded-md font-sans focus:outline-none focus:ring-2 transition-colors ${
              errors.currentRent
                ? 'border-red-500 focus:ring-red-200'
                : 'border-gray-300 focus:border-primary-500 focus:ring-primary-200'
            }`}
          />
          {errors.currentRent && (
            <p className="mt-1 text-sm text-red-600 font-sans">{errors.currentRent}</p>
          )}
        </div>

        {/* Living Type */}
        <div>
          <label htmlFor="livingType" className="block font-sans font-medium text-gray-700 mb-2">
            Current Living Situation <span className="text-red-500">*</span>
          </label>
          <select
            id="livingType"
            name="livingType"
            value={formData.livingType || ''}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-md font-sans focus:outline-none focus:ring-2 transition-colors ${
              errors.livingType
                ? 'border-red-500 focus:ring-red-200'
                : 'border-gray-300 focus:border-primary-500 focus:ring-primary-200'
            }`}
          >
            <option value="">Select your living situation</option>
            {LIVING_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          {errors.livingType && (
            <p className="mt-1 text-sm text-red-600 font-sans">{errors.livingType}</p>
          )}
        </div>

        {/* Privacy Consent */}
        <div className="space-y-4 pt-2">
          <div className="flex items-start">
            <input
              type="checkbox"
              id="privacyConsent"
              name="privacyConsent"
              checked={formData.privacyConsent}
              onChange={handleChange}
              className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1"
            />
            <label htmlFor="privacyConsent" className="ml-3 font-sans text-sm text-gray-700">
              I agree to the{' '}
              <a href="/privacy" className="text-primary-600 hover:underline" target="_blank" rel="noopener noreferrer">
                Privacy Policy
              </a>{' '}
              and{' '}
              <a href="/terms" className="text-primary-600 hover:underline" target="_blank" rel="noopener noreferrer">
                Terms of Service
              </a>
              . I understand that my data will be processed in accordance with GDPR and Indian data protection laws.{' '}
              <span className="text-red-500">*</span>
            </label>
          </div>
          {errors.privacyConsent && (
            <p className="text-sm text-red-600 font-sans ml-7">{errors.privacyConsent}</p>
          )}

          {/* Marketing Consent (Optional) */}
          <div className="flex items-start">
            <input
              type="checkbox"
              id="marketingConsent"
              name="marketingConsent"
              checked={formData.marketingConsent}
              onChange={handleChange}
              className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1"
            />
            <label htmlFor="marketingConsent" className="ml-3 font-sans text-sm text-gray-700">
              I would like to receive updates, news, and promotional materials from Bhavan.ai via email and SMS. (Optional)
            </label>
          </div>
        </div>

        {/* GDPR/India Privacy Notice */}
        <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
          <p className="text-xs text-gray-600 font-sans leading-relaxed">
            <strong>Privacy Notice:</strong> By submitting this form, you consent to Bhavan.ai collecting and processing your personal data for the purpose of providing early access to our platform. Your data will be stored securely and will not be shared with third parties without your explicit consent. You have the right to access, correct, or delete your data at any time by contacting us at{' '}
            <a href="mailto:privacy@bhavan.ai" className="text-primary-600 hover:underline">
              privacy@bhavan.ai
            </a>
            . For more information, please review our{' '}
            <a href="/privacy" className="text-primary-600 hover:underline" target="_blank" rel="noopener noreferrer">
              Privacy Policy
            </a>
            .
          </p>
        </div>

        {/* Submit Error */}
        {submitError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-800 font-sans">{submitError}</p>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-4">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={isSubmitting}
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? 'Submitting...' : 'Get Early Access'}
          </Button>
        </div>
      </div>
    </form>
  );
}
