'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import { EligibilityData } from '@/types';
import { validateEmail, validatePhone, validateRequired, validateNumeric } from '@/lib/validation';
import { submitForm, getFormErrorMessage } from '@/lib/forms';
import Button from '@/components/ui/Button';

/**
 * EligibilityForm Component
 * 
 * Interactive form for checking user eligibility for fractional home ownership.
 * Collects city, age range, financial information, co-owner preferences, and contact details.
 * Implements client-side validation with inline error messages and UTM parameter capture.
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5
 */

interface FormErrors {
  city?: string;
  ageRange?: string;
  monthlyRent?: string;
  monthlySalary?: string;
  coOwnerCount?: string;
  email?: string;
  phone?: string;
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

// Age range options
const AGE_RANGES = [
  '18-25',
  '26-30',
  '31-35',
  '36-40',
  '41-50',
  '50+',
];

export default function EligibilityForm() {
  // Form state
  const [formData, setFormData] = useState<Partial<EligibilityData>>({
    city: '',
    ageRange: '',
    monthlyRent: undefined,
    monthlySalary: undefined,
    coOwnerCount: 3, // Default to middle value
    email: '',
    phone: '',
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
  const validateField = (name: keyof EligibilityData, value: any): string | undefined => {
    switch (name) {
      case 'city':
        return !validateRequired(value) ? 'Please select a city' : undefined;
      
      case 'ageRange':
        return !validateRequired(value) ? 'Please select your age range' : undefined;
      
      case 'monthlyRent':
        if (!validateRequired(value)) return 'Monthly rent is required';
        if (!validateNumeric(value, 1)) return 'Please enter a valid rent amount';
        return undefined;
      
      case 'monthlySalary':
        if (!validateRequired(value)) return 'Monthly salary is required';
        if (!validateNumeric(value, 1)) return 'Please enter a valid salary amount';
        return undefined;
      
      case 'coOwnerCount':
        if (!validateRequired(value)) return 'Please select number of co-owners';
        if (!validateNumeric(value, 2, 5)) return 'Co-owner count must be between 2 and 5';
        return undefined;
      
      case 'email':
        if (!validateRequired(value)) return 'Email is required';
        if (!validateEmail(value)) return 'Please enter a valid email address';
        return undefined;
      
      case 'phone':
        if (!validateRequired(value)) return 'Phone number is required';
        if (!validatePhone(value)) return 'Please enter a valid Indian phone number (10 digits)';
        return undefined;
      
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

    // Validate each field (excluding utmParams which is auto-captured)
    const fieldsToValidate: Array<keyof FormErrors> = [
      'city',
      'ageRange',
      'monthlyRent',
      'monthlySalary',
      'coOwnerCount',
      'email',
      'phone',
    ];

    fieldsToValidate.forEach((key) => {
      const error = validateField(key as keyof EligibilityData, formData[key as keyof EligibilityData]);
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
    
    // Convert numeric inputs to numbers
    const processedValue = type === 'number' ? parseFloat(value) || undefined : value;
    
    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));

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
      await submitForm('eligibility', formData as EligibilityData);

      // Show success message
      setSubmitSuccess(true);

      // Reset form
      setFormData({
        city: '',
        ageRange: '',
        monthlyRent: undefined,
        monthlySalary: undefined,
        coOwnerCount: 3,
        email: '',
        phone: '',
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
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
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
            Thank You!
          </h3>
          <p className="font-sans text-gray-600 mb-6">
            Thanks! We'll review your information and reach out within 2 business days.
          </p>
          <Button
            variant="primary"
            size="md"
            onClick={() => setSubmitSuccess(false)}
          >
            Check Another Eligibility
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
      <div className="space-y-6">
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

        {/* Age Range Selection */}
        <div>
          <label htmlFor="ageRange" className="block font-sans font-medium text-gray-700 mb-2">
            Age Range <span className="text-red-500">*</span>
          </label>
          <select
            id="ageRange"
            name="ageRange"
            value={formData.ageRange}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-md font-sans focus:outline-none focus:ring-2 transition-colors ${
              errors.ageRange
                ? 'border-red-500 focus:ring-red-200'
                : 'border-gray-300 focus:border-primary-500 focus:ring-primary-200'
            }`}
          >
            <option value="">Select your age range</option>
            {AGE_RANGES.map((range) => (
              <option key={range} value={range}>
                {range}
              </option>
            ))}
          </select>
          {errors.ageRange && (
            <p className="mt-1 text-sm text-red-600 font-sans">{errors.ageRange}</p>
          )}
        </div>

        {/* Monthly Rent */}
        <div>
          <label htmlFor="monthlyRent" className="block font-sans font-medium text-gray-700 mb-2">
            Monthly Rent (₹) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="monthlyRent"
            name="monthlyRent"
            value={formData.monthlyRent || ''}
            onChange={handleChange}
            placeholder="e.g., 25000"
            min="0"
            step="1000"
            className={`w-full px-4 py-2 border rounded-md font-sans focus:outline-none focus:ring-2 transition-colors ${
              errors.monthlyRent
                ? 'border-red-500 focus:ring-red-200'
                : 'border-gray-300 focus:border-primary-500 focus:ring-primary-200'
            }`}
          />
          {errors.monthlyRent && (
            <p className="mt-1 text-sm text-red-600 font-sans">{errors.monthlyRent}</p>
          )}
        </div>

        {/* Monthly Salary */}
        <div>
          <label htmlFor="monthlySalary" className="block font-sans font-medium text-gray-700 mb-2">
            Monthly Salary (₹) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="monthlySalary"
            name="monthlySalary"
            value={formData.monthlySalary || ''}
            onChange={handleChange}
            placeholder="e.g., 80000"
            min="0"
            step="1000"
            className={`w-full px-4 py-2 border rounded-md font-sans focus:outline-none focus:ring-2 transition-colors ${
              errors.monthlySalary
                ? 'border-red-500 focus:ring-red-200'
                : 'border-gray-300 focus:border-primary-500 focus:ring-primary-200'
            }`}
          />
          {errors.monthlySalary && (
            <p className="mt-1 text-sm text-red-600 font-sans">{errors.monthlySalary}</p>
          )}
        </div>

        {/* Co-owner Count */}
        <div>
          <label htmlFor="coOwnerCount" className="block font-sans font-medium text-gray-700 mb-2">
            Preferred Number of Co-owners <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center space-x-4">
            {[2, 3, 4, 5].map((count) => (
              <label key={count} className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="coOwnerCount"
                  value={count}
                  checked={formData.coOwnerCount === count}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      coOwnerCount: parseInt(e.target.value),
                    }));
                    if (errors.coOwnerCount) {
                      setErrors((prev) => ({ ...prev, coOwnerCount: undefined }));
                    }
                  }}
                  className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 font-sans text-gray-700">{count}</span>
              </label>
            ))}
          </div>
          {errors.coOwnerCount && (
            <p className="mt-1 text-sm text-red-600 font-sans">{errors.coOwnerCount}</p>
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
            {isSubmitting ? 'Checking Eligibility...' : 'Check Eligibility'}
          </Button>
        </div>

        {/* Privacy Notice */}
        <p className="text-xs text-gray-500 font-sans text-center">
          By submitting this form, you agree to our{' '}
          <a href="/privacy" className="text-primary-600 hover:underline">
            Privacy Policy
          </a>
          . We'll use your information to assess eligibility and contact you about Bhavan.ai.
        </p>
      </div>
    </form>
  );
}
