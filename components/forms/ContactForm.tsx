'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import { ContactData } from '@/types';
import { validateEmail, validateRequired, validateMinLength } from '@/lib/validation';
import { submitForm, getFormErrorMessage } from '@/lib/forms';
import Button from '@/components/ui/Button';
import { getCurrentAffiliateId } from '@/lib/affiliate';

/**
 * ContactForm Component
 * 
 * Simple contact form for general inquiries to the Bhavan.ai team.
 * Collects name, email, subject, and message fields.
 * Implements client-side validation with inline error messages.
 * 
 * Requirements: 10.3, 10.5
 */

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

interface ContactFormProps {
  onSuccess?: () => void;
  inline?: boolean;
  propertyId?: string; // Optional property ID for property-specific contact tracking
}

export default function ContactForm({ onSuccess, inline = false, propertyId }: ContactFormProps) {
  // Form state
  const [formData, setFormData] = useState<Partial<ContactData>>({
    name: '',
    email: '',
    subject: '',
    message: '',
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
  const validateField = (name: keyof ContactData, value: any): string | undefined => {
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
      
      case 'subject':
        if (!validateRequired(value)) return 'Subject is required';
        if (typeof value === 'string' && value.trim().length < 3) {
          return 'Subject must be at least 3 characters';
        }
        return undefined;
      
      case 'message':
        if (!validateRequired(value)) return 'Message is required';
        if (!validateMinLength(value, 10)) {
          return 'Message must be at least 10 characters';
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
    const fieldsToValidate: Array<keyof FormErrors> = [
      'name',
      'email',
      'subject',
      'message',
    ];

    fieldsToValidate.forEach((key) => {
      const error = validateField(key as keyof ContactData, formData[key as keyof ContactData]);
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
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
   * Tracks property_contact event if propertyId is provided
   * 
   * Requirements: 4.1, 4.2, 4.3, 4.4
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
      // If propertyId is provided, track property_contact event (Requirements 4.1, 4.2)
      if (propertyId) {
        const affiliateId = getCurrentAffiliateId();
        
        try {
          await fetch('/api/tracking/event', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              affiliate_id: affiliateId,
              event_type: 'property_contact',
              property_id: propertyId,
              // user_id would be included here if user is authenticated (Requirement 4.3)
              metadata: {
                contact_method: 'contact_form',
                subject: formData.subject,
              },
            }),
          });
        } catch (trackingError) {
          // Log error but don't block form submission
          console.error('Failed to track property contact event:', trackingError);
        }
      }

      // Submit form with UTM capture
      await submitForm('contact', formData as ContactData);

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
        subject: '',
        message: '',
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
            Message Received!
          </h3>
          <p className="font-sans text-gray-600 mb-6">
            Message received. Our team will respond within 24 hours.
          </p>
          <Button
            variant="primary"
            size="md"
            onClick={() => setSubmitSuccess(false)}
          >
            Send Another Message
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
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Your name"
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

        {/* Subject */}
        <div>
          <label htmlFor="subject" className="block font-sans font-medium text-gray-700 mb-2">
            Subject <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            placeholder="What is this about?"
            className={`w-full px-4 py-2 border rounded-md font-sans focus:outline-none focus:ring-2 transition-colors ${
              errors.subject
                ? 'border-red-500 focus:ring-red-200'
                : 'border-gray-300 focus:border-primary-500 focus:ring-primary-200'
            }`}
          />
          {errors.subject && (
            <p className="mt-1 text-sm text-red-600 font-sans">{errors.subject}</p>
          )}
        </div>

        {/* Message */}
        <div>
          <label htmlFor="message" className="block font-sans font-medium text-gray-700 mb-2">
            Message <span className="text-red-500">*</span>
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Tell us more about your inquiry..."
            rows={6}
            className={`w-full px-4 py-2 border rounded-md font-sans focus:outline-none focus:ring-2 transition-colors resize-y ${
              errors.message
                ? 'border-red-500 focus:ring-red-200'
                : 'border-gray-300 focus:border-primary-500 focus:ring-primary-200'
            }`}
          />
          {errors.message && (
            <p className="mt-1 text-sm text-red-600 font-sans">{errors.message}</p>
          )}
        </div>

        {/* Privacy Notice */}
        <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
          <p className="text-xs text-gray-600 font-sans leading-relaxed">
            <strong>Privacy Notice:</strong> By submitting this form, you consent to Bhavan.ai processing your contact information to respond to your inquiry. Your data will be handled in accordance with our{' '}
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
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </Button>
        </div>
      </div>
    </form>
  );
}
