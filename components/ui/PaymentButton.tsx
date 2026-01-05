'use client';

import { useState } from 'react';
import { Service, ServiceTier } from '@/types';
import Button from '@/components/ui/Button';

/**
 * PaymentButton Component
 * 
 * Handles payment gateway integration and payment processing.
 * Initiates payment flow and handles success/failure callbacks.
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5
 * 
 * Properties validated:
 * - Property 9: Payment intent data accuracy
 */

interface PurchaseFormData {
  fullName: string;
  email: string;
  phone: string;
  requirements: string;
  serviceId: string;
  serviceTierId?: string;
}

interface PaymentButtonProps {
  service: Service;
  selectedTier: ServiceTier | null;
  customerData: PurchaseFormData;
  affiliateCode?: string;
  disabled: boolean;
  onSuccess: (referenceNumber: string) => void;
  onError: (error: string) => void;
}

interface PaymentIntentResponse {
  success: boolean;
  requestId?: string;
  referenceNumber?: string;
  paymentIntent?: {
    clientSecret: string;
    amount: number;
    currency: string;
    gateway: string;
  };
  error?: string;
}

/**
 * PaymentButton component
 * Initiates payment gateway flow
 * 
 * Requirements: 4.1, 4.2
 */
export default function PaymentButton({
  service,
  selectedTier,
  customerData,
  affiliateCode,
  disabled,
  onSuccess,
  onError,
}: PaymentButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  /**
   * Initiates payment flow
   * Property 9: Payment intent data accuracy
   * For any payment initiation, the data passed to the payment gateway SHALL match 
   * the selected service amount, name, and customer details
   * 
   * Requirements: 4.1, 4.2
   */
  const handlePayment = async () => {
    setIsProcessing(true);
    setPaymentError(null);

    try {
      // Create payment intent
      const response = await fetch('/api/services/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceId: service.id,
          serviceTierId: selectedTier?.id,
          customer: {
            fullName: customerData.fullName,
            email: customerData.email,
            phone: customerData.phone,
            requirements: customerData.requirements,
          },
          affiliateCode: affiliateCode,
        }),
      });

      const data: PaymentIntentResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to create payment intent');
      }

      if (!data.paymentIntent || !data.referenceNumber) {
        throw new Error('Invalid payment intent response');
      }

      // For now, simulate payment gateway integration
      // In production, this would integrate with Razorpay/Stripe SDK
      // Requirements: 4.1, 4.3
      await simulatePaymentGateway(data.paymentIntent, data.referenceNumber);
    } catch (error: any) {
      console.error('Payment error:', error);
      const errorMessage = error.message || 'Payment failed. Please try again.';
      setPaymentError(errorMessage);
      onError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Simulates payment gateway integration
   * In production, this would be replaced with actual Razorpay/Stripe integration
   * 
   * Requirements: 4.1, 4.3, 4.4
   */
  const simulatePaymentGateway = async (
    paymentIntent: { clientSecret: string; amount: number; currency: string; gateway: string },
    referenceNumber: string
  ): Promise<void> => {
    // Check if this is a mock payment gateway
    if (paymentIntent.gateway === 'mock') {
      // Redirect to mock payment page
      const mockPaymentUrl = `/services/mock-payment?clientSecret=${encodeURIComponent(paymentIntent.clientSecret)}`;
      window.location.href = mockPaymentUrl;
      return;
    }

    // For real payment gateways (Razorpay, Stripe, etc.)
    // This would integrate with their SDK
    return new Promise((resolve, reject) => {
      // Simulate payment gateway modal/redirect
      const confirmed = window.confirm(
        `Proceed with payment of ₹${(paymentIntent.amount / 100).toLocaleString('en-IN')}?\n\n` +
        `Service: ${service.name}\n` +
        `${selectedTier ? `Package: ${selectedTier.name}\n` : ''}` +
        `Reference: ${referenceNumber}\n\n` +
        `This is a test mode. In production, you would be redirected to ${paymentIntent.gateway} payment gateway.`
      );

      if (confirmed) {
        // Simulate successful payment
        setTimeout(() => {
          onSuccess(referenceNumber);
          resolve();
        }, 1000);
      } else {
        // User cancelled payment
        reject(new Error('Payment cancelled by user'));
      }
    });
  };

  return (
    <div>
      <Button
        type="button"
        variant="primary"
        size="lg"
        loading={isProcessing}
        disabled={disabled || isProcessing}
        onClick={handlePayment}
        className="w-full"
      >
        {isProcessing ? 'Processing Payment...' : 'Proceed to Payment'}
      </Button>

      {paymentError && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-800">{paymentError}</p>
        </div>
      )}

      {/* Payment Gateway Info */}
      <div className="mt-4 flex items-center justify-center text-xs text-gray-500">
        <svg
          className="w-4 h-4 mr-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
        Secure payment processing
      </div>
    </div>
  );
}
