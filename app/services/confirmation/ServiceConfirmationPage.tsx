'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { appendAffiliateId } from '@/lib/affiliate';

/**
 * ServiceConfirmationPage Component
 * 
 * Displays confirmation message after successful service purchase.
 * Shows reference number and next steps information.
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
 */

export default function ServiceConfirmationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [referenceNumber, setReferenceNumber] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [serviceData, setServiceData] = useState<any>(null);
  const [retrying, setRetrying] = useState(false);
  const [retryError, setRetryError] = useState<string | null>(null);

  useEffect(() => {
    const ref = searchParams.get('ref');
    const status = searchParams.get('status');
    if (ref) {
      setReferenceNumber(ref);
      setPaymentStatus(status);
      // Fetch service request data for receipt
      fetchServiceData(ref);
    }
  }, [searchParams]);

  /**
   * Fetch service request data for receipt generation
   * Requirement 5.5
   */
  const fetchServiceData = async (ref: string) => {
    try {
      const response = await fetch(`/api/services/requests/${ref}`);
      const data = await response.json();
      if (data.success) {
        setServiceData(data.request);
      }
    } catch (error) {
      console.error('Failed to fetch service data:', error);
    }
  };

  /**
   * Format timestamp to readable date
   */
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  /**
   * Format currency
   */
  const formatCurrency = (amount: number, currency: string): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  /**
   * Retry payment for failed service request
   * Creates a new payment session and redirects to payment gateway
   */
  const handleRetryPayment = async () => {
    if (!referenceNumber) return;

    setRetrying(true);
    setRetryError(null);

    try {
      const response = await fetch('/api/services/payment/retry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ referenceNumber }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to retry payment');
      }

      // Redirect to payment gateway
      window.location.href = data.paymentUrl;
    } catch (error: any) {
      console.error('Failed to retry payment:', error);
      setRetryError(error.message || 'Failed to retry payment. Please try again.');
      setRetrying(false);
    }
  };

  /**
   * Download receipt as text file
   * Requirement 5.5
   */
  const downloadReceipt = () => {
    if (!serviceData || !referenceNumber) return;

    const receiptContent = `
BHAVAN.AI - SERVICE PURCHASE RECEIPT
=====================================

Reference Number: ${referenceNumber}
Date: ${formatDate(serviceData.createdAt)}

CUSTOMER INFORMATION
--------------------
Name: ${serviceData.customer.name}
Email: ${serviceData.customer.email}
Phone: ${serviceData.customer.phone}

SERVICE DETAILS
---------------
Service: ${serviceData.service.name}
${serviceData.serviceTier ? `Package: ${serviceData.serviceTier.name}` : ''}

PAYMENT INFORMATION
-------------------
Amount: ${formatCurrency(serviceData.payment.amount, serviceData.payment.currency)}
Payment Status: ${serviceData.payment.status}
${serviceData.payment.transactionId ? `Transaction ID: ${serviceData.payment.transactionId}` : ''}
${serviceData.payment.completedAt ? `Payment Date: ${formatDate(serviceData.payment.completedAt)}` : ''}

CURRENT STATUS
--------------
Status: ${serviceData.statusLabel}
Last Updated: ${formatDate(serviceData.updatedAt)}

For any queries, please contact support@bhavan.ai
Reference this number in all correspondence: ${referenceNumber}

Thank you for choosing Bhavan.ai!
    `.trim();

    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bhavan-receipt-${referenceNumber}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!referenceNumber) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <p className="text-gray-600">Loading confirmation...</p>
        </div>
      </div>
    );
  }

  // Determine if payment was successful based on status or serviceData
  // Priority: URL status parameter (most recent) > database status
  const isPaymentSuccessful =
    paymentStatus === 'success' ||
    (!paymentStatus &&
      serviceData?.payment?.status === 'completed' &&
      serviceData?.status !== 'cancelled');
  const isPaymentFailed =
    paymentStatus === 'failed' ||
    (!paymentStatus &&
      (serviceData?.payment?.status === 'failed' ||
        (serviceData?.status === 'cancelled' &&
          serviceData?.payment?.status !== 'refunded')));
  const isPaymentRefunded =
    paymentStatus === 'refunded' ||
    (!paymentStatus && serviceData?.payment?.status === 'refunded');

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success/Failure Message */}
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          {/* Icon - changes based on status */}
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
            isPaymentSuccessful ? 'bg-green-100' : 
            isPaymentRefunded ? 'bg-yellow-100' : 
            'bg-red-100'
          }`}>
            {isPaymentSuccessful ? (
              <svg
                className="w-10 h-10 text-green-600"
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
            ) : isPaymentRefunded ? (
              <svg
                className="w-10 h-10 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                />
              </svg>
            ) : (
              <svg
                className="w-10 h-10 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            )}
          </div>

          {/* Heading - changes based on status */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            {isPaymentSuccessful ? 'Payment Successful!' : 
             isPaymentRefunded ? 'Payment Refunded' : 
             'Payment Failed'}
          </h1>

          {/* Status message */}
          <p className="text-gray-600 mb-6">
            {isPaymentSuccessful ? 
              'Your payment has been processed successfully. We\'ll be in touch soon!' :
             isPaymentRefunded ?
              'Your payment has been refunded. The amount will be credited to your account within 5-7 business days.' :
              'Unfortunately, your payment could not be processed. Please try again or contact support.'}
          </p>

          {/* Reference Number */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <p className="text-xs sm:text-sm text-gray-600 mb-1">Order Reference Number</p>
            <p className="text-xl sm:text-2xl font-mono font-bold text-primary-600 break-all">
              {referenceNumber}
            </p>
          </div>

          {/* Next Steps - only show for successful payments */}
          {isPaymentSuccessful && (
            <div className="text-left mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">What Happens Next?</h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-primary-600 font-semibold">1</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Email Confirmation</h3>
                    <p className="text-sm text-gray-600">
                      You'll receive a confirmation email within 5 minutes with your order details and receipt.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-primary-600 font-semibold">2</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Team Contact</h3>
                    <p className="text-sm text-gray-600">
                      Our team will reach out to you within 24-48 hours to schedule your consultation and discuss your requirements.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-primary-600 font-semibold">3</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Service Delivery</h3>
                    <p className="text-sm text-gray-600">
                      Your assigned professional will work with you to deliver the service according to your selected package.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Failed payment next steps */}
          {isPaymentFailed && (
            <div className="text-left mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">What You Can Do</h2>
              
              {/* Retry Error Message */}
              {retryError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start">
                    <svg
                      className="w-5 h-5 text-red-600 mr-2 mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div className="text-left">
                      <p className="text-sm font-medium text-red-900">Retry Failed</p>
                      <p className="text-sm text-red-700">{retryError}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-primary-600 font-semibold">1</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Try Again</h3>
                    <p className="text-sm text-gray-600">
                      Click the "Try Again" button below to retry the payment for this service request. You won't need to re-enter your information.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-primary-600 font-semibold">2</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Contact Support</h3>
                    <p className="text-sm text-gray-600">
                      If you continue to experience issues, please contact our support team with your reference number.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Refunded payment info */}
          {isPaymentRefunded && (
            <div className="text-left mb-8">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <svg
                    className="w-5 h-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div className="text-left">
                    <p className="text-sm font-medium text-yellow-900">Refund Processing</p>
                    <p className="text-sm text-yellow-700">
                      Your refund is being processed. The amount will be credited back to your original payment method within 5-7 business days.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Estimated Timeline - only for successful payments */}
          {isPaymentSuccessful && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="text-left">
                  <p className="text-sm font-medium text-blue-900">Estimated Contact Time</p>
                  <p className="text-sm text-blue-700">
                    Our team typically reaches out within 24-48 hours during business days (Monday-Saturday, 9 AM - 6 PM IST)
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {isPaymentSuccessful && (
              <Button
                variant="primary"
                size="md"
                onClick={downloadReceipt}
                disabled={!serviceData}
                className="w-full sm:w-auto"
              >
                Download Receipt
              </Button>
            )}
            {isPaymentSuccessful && (
              <Button
                variant="outline"
                size="md"
                onClick={() => router.push(appendAffiliateId(`/services/track?ref=${referenceNumber}`))}
                className="w-full sm:w-auto"
              >
                Track Your Request
              </Button>
            )}
            {isPaymentFailed && (
              <Button
                variant="primary"
                size="md"
                onClick={handleRetryPayment}
                disabled={retrying}
                className="w-full sm:w-auto"
              >
                {retrying ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Retrying...
                  </>
                ) : (
                  'Try Again'
                )}
              </Button>
            )}
            <Button
              variant="outline"
              size="md"
              onClick={() => router.push(appendAffiliateId('/'))}
              className="w-full sm:w-auto"
            >
              Return to Home
            </Button>
          </div>

          {/* Support Information */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Questions about your order?{' '}
              <a
                href="mailto:support@bhavan.ai"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Contact Support
              </a>
            </p>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Please save your reference number ({referenceNumber}) for future correspondence.
          </p>
        </div>
      </div>
    </div>
  );
}
