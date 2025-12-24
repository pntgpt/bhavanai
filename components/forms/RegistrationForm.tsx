'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import { RegistrationData } from '@/types';
import { validateEmail, validatePhone, validateRequired } from '@/lib/validation';
import Button from '@/components/ui/Button';

/**
 * RegistrationForm Component
 * 
 * Registration form for backend users (Broker, CA, Lawyer).
 * Creates pending user accounts that require admin approval.
 * Implements client-side validation with inline error messages.
 * 
 * Requirements: 22.1, 22.2, 22.4
 */

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  userType?: string;
}

// User type options
const USER_TYPES: Array<{ value: RegistrationData['userType']; label: string; description: string }> = [
  { 
    value: 'broker', 
    label: 'Broker', 
    description: 'Real estate broker managing property listings' 
  },
  { 
    value: 'ca', 
    label: 'Chartered Accountant', 
    description: 'CA providing financial services' 
  },
  { 
    value: 'lawyer', 
    label: 'Lawyer', 
    description: 'Legal professional providing legal services' 
  },
];

interface RegistrationFormProps {
  onSuccess?: () => void;
}

export default function RegistrationForm({ onSuccess }: RegistrationFormProps) {
  // Form state
  const [formData, setFormData] = useState<Partial<RegistrationData>>({
    name: '',
    email: '',
    phone: '',
    userType: undefined,
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
  const validateField = (name: keyof RegistrationData, value: any): string | undefined => {
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
      
      case 'userType':
        return !validateRequired(value) ? 'Please select a user type' : undefined;
      
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
      'userType',
    ];

    fieldsToValidate.forEach((key) => {
      const error = validateField(key as keyof RegistrationData, formData[key as keyof RegistrationData]);
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
    const { name, value } = e.target;
    
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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
      // Submit registration to API
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Registration failed. Please try again.');
      }

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
        userType: undefined,
      });
      setErrors({});
    } catch (error) {
      // Show error message
      setSubmitError(
        error instanceof Error 
          ? error.message 
          : 'Registration failed. Please try again.'
      );
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
            Registration Received
          </h3>
          <p className="font-sans text-gray-600 mb-6">
            Thank you for registering. Our team will reach out to you shortly.
          </p>
          <p className="font-sans text-sm text-gray-500">
            Your account is pending approval. You will receive an email once your account is activated.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="font-serif font-bold text-3xl text-gray-900 mb-2">
            Create Account
          </h2>
          <p className="font-sans text-gray-600">
            Register to access the Bhavan.ai platform
          </p>
        </div>

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
            autoComplete="name"
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
            autoComplete="email"
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
            autoComplete="tel"
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

        {/* User Type Selection */}
        <div>
          <label htmlFor="userType" className="block font-sans font-medium text-gray-700 mb-2">
            I am a <span className="text-red-500">*</span>
          </label>
          <select
            id="userType"
            name="userType"
            value={formData.userType || ''}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-md font-sans focus:outline-none focus:ring-2 transition-colors ${
              errors.userType
                ? 'border-red-500 focus:ring-red-200'
                : 'border-gray-300 focus:border-primary-500 focus:ring-primary-200'
            }`}
          >
            <option value="">Select your role</option>
            {USER_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label} - {type.description}
              </option>
            ))}
          </select>
          {errors.userType && (
            <p className="mt-1 text-sm text-red-600 font-sans">{errors.userType}</p>
          )}
        </div>

        {/* Information Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <p className="text-sm text-blue-800 font-sans leading-relaxed">
            <strong>Note:</strong> Your account will be pending approval after registration. 
            Our team will review your application and reach out to you shortly with your login credentials.
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
            {isSubmitting ? 'Submitting...' : 'Register'}
          </Button>
        </div>
      </div>
    </form>
  );
}
