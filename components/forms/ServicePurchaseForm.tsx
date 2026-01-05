'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import { Service, ServiceTier } from '@/types';
import { validateEmail, validatePhone, validateRequired, validateMinLength } from '@/lib/validation';
import Button from '@/components/ui/Button';
import PaymentButton from '@/components/ui/PaymentButton';

/**
 * ServicePurchaseForm Component
 * 
 * Form for collecting customer information and service requirements.
 * Implements real-time validation and integrates with payment gateway.
 * 
 * Requirements: 2.2, 2.3, 3.1, 3.2, 3.3, 3.5, 4.1, 4.2
 * 
 * Properties validated:
 * - Property 6: Form validation correctness
 * - Property 7: Error message generation for incomplete forms
 * - Property 8: Payment button state based on form validity
 */

interface FormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  requirements?: string;
  selectedTier?: string;
}

interface PurchaseFormData {
  fullName: string;
  email: string;
  phone: string;
  requirements: string;
  serviceId: string;
  serviceTierId?: string;
}

interface ServicePurchaseFormProps {
  service: Service;
  affiliateCode?: string;
  onSuccess: (referenceNumber: string) => void;
  onError: (error: string) => void;
}

/**
 * ServicePurchaseForm component
 * Collects customer information and handles service purchase
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.5
 */
export default function ServicePurchaseForm({
  service,
  affiliateCode,
  onSuccess,
  onError,
}: ServicePurchaseFormProps) {
  // Selected tier state
  const [selectedTier, setSelectedTier] = useState<ServiceTier | null>(
    service.pricing.tiers?.[0] || null
  );

  // Form state - Requirement 3.1
  const [formData, setFormData] = useState<Partial<PurchaseFormData>>({
    fullName: '',
    email: '',
    phone: '',
    requirements: '',
    serviceId: service.id,
    serviceTierId: service.pricing.tiers?.[0]?.id,
  });

  // Validation errors
  const [errors, setErrors] = useState<FormErrors>({});

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  /**
   * Validates a single field
   * Property 6: Form validation correctness
   * For any input value, the validation function SHALL return the correct 
   * validation result (valid/invalid) based on the field type
   * 
   * Requirements: 3.2
   */
  const validateField = (name: keyof PurchaseFormData, value: any): string | undefined => {
    switch (name) {
      case 'fullName':
        if (!validateRequired(value)) return 'Full name is required';
        if (typeof value === 'string' && value.trim().length < 2) {
          return 'Full name must be at least 2 characters';
        }
        return undefined;

      case 'email':
        if (!validateRequired(value)) return 'Email is required';
        if (!validateEmail(value)) return 'Please enter a valid email address';
        return undefined;

      case 'phone':
        if (!validateRequired(value)) return 'Phone number is required';
        if (!validatePhone(value)) return 'Please enter a valid Indian phone number';
        return undefined;

      case 'requirements':
        if (!validateRequired(value)) return 'Service requirements are required';
        if (!validateMinLength(value, 20)) {
          return 'Please provide at least 20 characters describing your requirements';
        }
        return undefined;

      default:
        return undefined;
    }
  };

  /**
   * Validates all form fields
   * Property 7: Error message generation for incomplete forms
   * For any incomplete form submission, error messages SHALL be generated 
   * for all missing required fields
   * 
   * Requirements: 3.3
   */
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    // Validate each required field
    const fieldsToValidate: Array<keyof FormErrors> = [
      'fullName',
      'email',
      'phone',
      'requirements',
    ];

    fieldsToValidate.forEach((key) => {
      const error = validateField(key as keyof PurchaseFormData, formData[key as keyof PurchaseFormData]);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    });

    // Validate tier selection for services with tiers
    if (service.pricing.tiers && service.pricing.tiers.length > 0 && !selectedTier) {
      newErrors.selectedTier = 'Please select a service tier';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  /**
   * Checks if form is valid for enabling payment button
   * Property 8: Payment button state based on form validity
   * For any form state, the payment button SHALL be enabled if and only if 
   * all form fields are valid
   * 
   * Requirements: 3.5
   */
  const isFormValid = (): boolean => {
    return (
      validateRequired(formData.fullName) &&
      validateEmail(formData.email || '') &&
      validatePhone(formData.phone || '') &&
      validateMinLength(formData.requirements || '', 20) &&
      (!service.pricing.tiers || selectedTier !== null)
    );
  };

  /**
   * Handles input changes with real-time validation
   * Requirements: 3.2
   */
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Perform real-time validation as user types
    const fieldError = validateField(name as keyof PurchaseFormData, value);
    setErrors((prev) => ({
      ...prev,
      [name]: fieldError,
    }));

    // Clear submission error
    if (submitError) {
      setSubmitError(null);
    }
  };

  /**
   * Handles tier selection
   */
  const handleTierSelect = (tier: ServiceTier) => {
    setSelectedTier(tier);
    setFormData((prev) => ({
      ...prev,
      serviceTierId: tier.id,
    }));

    // Clear tier selection error
    if (errors.selectedTier) {
      setErrors((prev) => ({
        ...prev,
        selectedTier: undefined,
      }));
    }
  };

  /**
   * Handles payment success
   * Requirements: 4.2
   */
  const handlePaymentSuccess = (referenceNumber: string) => {
    onSuccess(referenceNumber);
  };

  /**
   * Handles payment error
   * Requirements: 4.2
   */
  const handlePaymentError = (error: string) => {
    setSubmitError(error);
    onError(error);
  };

  /**
   * Get selected price
   */
  const getSelectedPrice = (): number => {
    if (selectedTier) {
      return selectedTier.price;
    }
    return service.pricing.amount;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Purchase Details</h2>

      {/* Tier Selection - Requirement 1.4, 12.4 */}
      {service.pricing.tiers && service.pricing.tiers.length > 0 && (
        <div className="mb-8">
          <label className="block font-sans font-medium text-gray-700 mb-4">
            Select Package <span className="text-red-500">*</span>
          </label>
          <div className="space-y-4">
            {service.pricing.tiers.map((tier) => (
              <div
                key={tier.id}
                onClick={() => handleTierSelect(tier)}
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all min-h-[44px] ${
                  selectedTier?.id === tier.id
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-200 hover:border-primary-300'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="tier"
                      checked={selectedTier?.id === tier.id}
                      onChange={() => handleTierSelect(tier)}
                      className="mr-3 h-5 w-5 text-primary-600 focus:ring-primary-500"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900">{tier.name}</h3>
                      <p className="text-2xl font-bold text-primary-600 mt-1">
                        ₹{tier.price.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                </div>
                <ul className="ml-7 mt-3 space-y-2">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start text-sm text-gray-600">
                      <svg
                        className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0"
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
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          {errors.selectedTier && (
            <p className="mt-2 text-sm text-red-600 font-sans">{errors.selectedTier}</p>
          )}
        </div>
      )}

      <form className="space-y-6">
        {/* Full Name - Requirement 3.1, 12.2 */}
        <div>
          <label htmlFor="fullName" className="block font-sans font-medium text-gray-700 mb-2">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Enter your full name"
            autoComplete="name"
            className={`w-full px-4 py-3 text-base border rounded-md font-sans focus:outline-none focus:ring-2 transition-colors ${
              errors.fullName
                ? 'border-red-500 focus:ring-red-200'
                : 'border-gray-300 focus:border-primary-500 focus:ring-primary-200'
            }`}
          />
          {errors.fullName && (
            <p className="mt-1 text-sm text-red-600 font-sans">{errors.fullName}</p>
          )}
        </div>

        {/* Email - Requirement 3.1, 3.2, 12.2 */}
        <div>
          <label htmlFor="email" className="block font-sans font-medium text-gray-700 mb-2">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="your.email@example.com"
            autoComplete="email"
            inputMode="email"
            className={`w-full px-4 py-3 text-base border rounded-md font-sans focus:outline-none focus:ring-2 transition-colors ${
              errors.email
                ? 'border-red-500 focus:ring-red-200'
                : 'border-gray-300 focus:border-primary-500 focus:ring-primary-200'
            }`}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600 font-sans">{errors.email}</p>
          )}
        </div>

        {/* Phone - Requirement 3.1, 3.2, 12.2 */}
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
            inputMode="tel"
            pattern="[0-9]*"
            className={`w-full px-4 py-3 text-base border rounded-md font-sans focus:outline-none focus:ring-2 transition-colors ${
              errors.phone
                ? 'border-red-500 focus:ring-red-200'
                : 'border-gray-300 focus:border-primary-500 focus:ring-primary-200'
            }`}
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600 font-sans">{errors.phone}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Enter 10-digit Indian mobile number
          </p>
        </div>

        {/* Requirements - Requirement 3.1, 3.4, 12.2 */}
        <div>
          <label htmlFor="requirements" className="block font-sans font-medium text-gray-700 mb-2">
            Service Requirements <span className="text-red-500">*</span>
          </label>
          <textarea
            id="requirements"
            name="requirements"
            value={formData.requirements}
            onChange={handleChange}
            placeholder="Please describe your requirements in detail. For example: property location, transaction type, specific concerns, timeline, etc."
            rows={6}
            className={`w-full px-4 py-3 text-base border rounded-md font-sans focus:outline-none focus:ring-2 transition-colors resize-y ${
              errors.requirements
                ? 'border-red-500 focus:ring-red-200'
                : 'border-gray-300 focus:border-primary-500 focus:ring-primary-200'
            }`}
          />
          {errors.requirements && (
            <p className="mt-1 text-sm text-red-600 font-sans">{errors.requirements}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Minimum 20 characters. The more details you provide, the better we can assist you.
          </p>
        </div>

        {/* Submit Error */}
        {submitError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-800 font-sans">{submitError}</p>
          </div>
        )}

        {/* Payment Button - Requirements 3.5, 4.1, 4.2 */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
            <span className="text-2xl font-bold text-primary-600">
              ₹{getSelectedPrice().toLocaleString('en-IN')}
            </span>
          </div>

          <PaymentButton
            service={service}
            selectedTier={selectedTier}
            customerData={formData as PurchaseFormData}
            affiliateCode={affiliateCode}
            disabled={!isFormValid()}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
          />

          <p className="mt-4 text-xs text-gray-500 text-center">
            By proceeding with payment, you agree to our{' '}
            <a href="/terms" className="text-primary-600 hover:underline" target="_blank">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-primary-600 hover:underline" target="_blank">
              Privacy Policy
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}
