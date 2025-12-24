'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import { LoginCredentials } from '@/types';
import { validateEmail, validateRequired } from '@/lib/validation';
import Button from '@/components/ui/Button';

/**
 * LoginForm Component
 * 
 * Secure login form for backend users (Admin, Broker, CA, Lawyer).
 * Implements client-side validation with inline error messages.
 * Handles authentication state and redirects to role-specific dashboards.
 * 
 * Requirements: 21.1, 21.4
 */

interface FormErrors {
  email?: string;
  password?: string;
}

interface LoginFormProps {
  onSuccess?: (user: any) => void;
  error?: string;
}

export default function LoginForm({ onSuccess, error: externalError }: LoginFormProps) {
  // Form state
  const [formData, setFormData] = useState<LoginCredentials>({
    email: '',
    password: '',
  });

  // Validation errors
  const [errors, setErrors] = useState<FormErrors>({});

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(externalError || null);

  /**
   * Validates a single field
   */
  const validateField = (name: keyof LoginCredentials, value: any): string | undefined => {
    switch (name) {
      case 'email':
        if (!validateRequired(value)) return 'Email is required';
        if (!validateEmail(value)) return 'Please enter a valid email address';
        return undefined;
      
      case 'password':
        if (!validateRequired(value)) return 'Password is required';
        if (typeof value === 'string' && value.length < 6) {
          return 'Password must be at least 6 characters';
        }
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

    // Validate each required field
    const fieldsToValidate: Array<keyof FormErrors> = ['email', 'password'];

    fieldsToValidate.forEach((key) => {
      const error = validateField(key, formData[key]);
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
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
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
    setSubmitError(null);

    // Validate form
    if (!validateForm()) {
      return;
    }

    // Set submitting state
    setIsSubmitting(true);

    try {
      // Submit login credentials to API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Login failed. Please check your credentials.');
      }

      // Call onSuccess callback if provided
      if (onSuccess && result.user) {
        onSuccess(result.user);
      } else if (result.user) {
        // Redirect to role-specific dashboard
        const dashboardRoutes: Record<string, string> = {
          admin: '/dashboard/admin',
          broker: '/dashboard/broker',
          ca: '/dashboard/ca',
          lawyer: '/dashboard/lawyer',
        };
        
        const redirectPath = dashboardRoutes[result.user.role] || '/dashboard';
        window.location.href = redirectPath;
      }
    } catch (error) {
      // Show error message
      setSubmitError(
        error instanceof Error 
          ? error.message 
          : 'Login failed. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="font-serif font-bold text-3xl text-gray-900 mb-2">
            Welcome Back
          </h2>
          <p className="font-sans text-gray-600">
            Sign in to access your dashboard
          </p>
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

        {/* Password */}
        <div>
          <label htmlFor="password" className="block font-sans font-medium text-gray-700 mb-2">
            Password <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            autoComplete="current-password"
            className={`w-full px-4 py-2 border rounded-md font-sans focus:outline-none focus:ring-2 transition-colors ${
              errors.password
                ? 'border-red-500 focus:ring-red-200'
                : 'border-gray-300 focus:border-primary-500 focus:ring-primary-200'
            }`}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600 font-sans">{errors.password}</p>
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
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </Button>
        </div>
      </div>
    </form>
  );
}
