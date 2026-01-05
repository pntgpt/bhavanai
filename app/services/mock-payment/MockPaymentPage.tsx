'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';

/**
 * Mock Payment Page
 * 
 * Interactive page for testing payment flows.
 * Allows manual control of payment outcomes (success, failure, refund).
 */
export default function MockPaymentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [paymentData, setPaymentData] = useState<any>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get client secret from URL
    const clientSecret = searchParams.get('clientSecret');
    
    if (!clientSecret) {
      setError('No payment information found');
      return;
    }

    try {
      // Decode the mock client secret
      if (!clientSecret.startsWith('mock_secret_')) {
        setError('Invalid payment information');
        return;
      }

      const encodedData = clientSecret.replace('mock_secret_', '');
      const decodedData = atob(encodedData);
      const data = JSON.parse(decodedData);
      
      setPaymentData(data);
    } catch (err) {
      console.error('Failed to decode payment data:', err);
      setError('Failed to load payment information');
    }
  }, [searchParams]);

  const handlePaymentAction = async (action: 'success' | 'failed' | 'refunded') => {
    if (!paymentData) return;

    setProcessing(true);
    setError(null);

    try {
      // Map action to event type
      const eventType = `payment.${action}`;

      // Create webhook payload
      const webhookPayload = {
        event: eventType,
        data: {
          transactionId: paymentData.transactionId,
          amount: paymentData.amount,
          currency: paymentData.currency,
          metadata: paymentData.metadata,
        },
      };

      // Generate signature (simple mock signature)
      const webhookSecret = 'mock_webhook_secret_12345';
      const payloadString = JSON.stringify(webhookPayload);
      const signature = `mock_sig_${btoa(payloadString + webhookSecret).substring(0, 32)}`;

      // Send webhook to our backend
      const response = await fetch('/api/services/payment/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-webhook-signature': signature,
        },
        body: JSON.stringify(webhookPayload),
      });

      if (!response.ok) {
        throw new Error('Failed to process payment');
      }

      const result = await response.json();

      if (result.success) {
        // Redirect to confirmation page
        const referenceNumber = paymentData.metadata.reference_number;
        router.push(`/services/confirmation?ref=${referenceNumber}&status=${action}`);
      } else {
        throw new Error(result.error || 'Payment processing failed');
      }
    } catch (err: any) {
      console.error('Payment action failed:', err);
      setError(err.message || 'Failed to process payment');
      setProcessing(false);
    }
  };

  if (error && !paymentData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => router.push('/')} variant="primary">
              Return Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!paymentData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading payment information...</p>
          </div>
        </div>
      </div>
    );
  }

  const formatAmount = (amount: number, currency: string) => {
    const value = amount / 100; // Convert from smallest unit
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-4">
            <svg
              className="h-8 w-8 text-yellow-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Test Payment Gateway</h1>
          <p className="text-gray-600">
            This is a mock payment page for testing. Choose how you want the payment to proceed.
          </p>
        </div>

        {/* Payment Details */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Amount:</span>
              <span className="font-semibold text-gray-900">
                {formatAmount(paymentData.amount, paymentData.currency)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Customer:</span>
              <span className="font-semibold text-gray-900">{paymentData.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Email:</span>
              <span className="font-semibold text-gray-900">{paymentData.customerEmail}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Description:</span>
              <span className="font-semibold text-gray-900">{paymentData.description}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Reference:</span>
              <span className="font-mono text-sm text-gray-900">
                {paymentData.metadata.reference_number}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Transaction ID:</span>
              <span className="font-mono text-sm text-gray-900">
                {paymentData.transactionId}
              </span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <svg
                className="h-5 w-5 text-red-400 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Payment Outcome:</h3>
          
          <button
            onClick={() => handlePaymentAction('success')}
            disabled={processing}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
            {processing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <svg
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Payment Success
              </>
            )}
          </button>

          <button
            onClick={() => handlePaymentAction('failed')}
            disabled={processing}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
            {processing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <svg
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Payment Failed
              </>
            )}
          </button>

          <button
            onClick={() => handlePaymentAction('refunded')}
            disabled={processing}
            className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
            {processing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <svg
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                  />
                </svg>
                Simulate Refund
              </>
            )}
          </button>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <svg
              className="h-5 w-5 text-blue-400 mr-2 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Testing Mode</p>
              <p>
                This is a mock payment gateway for development and testing. No real payment will be
                processed. Choose an outcome to simulate the payment flow and test how your
                application handles different scenarios.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
