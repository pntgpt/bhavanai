'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';

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
  const [serviceData, setServiceData] = useState<any>(null);

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) {
      setReferenceNumber(ref);
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

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Message - Requirements 5.1, 5.2 */}
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
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
          </div>

          {/* Success Heading */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Payment Successful!
          </h1>

          {/* Reference Number - Requirement 5.2 */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 mb-1">Order Reference Number</p>
            <p className="text-2xl font-mono font-bold text-primary-600">
              {referenceNumber}
            </p>
          </div>

          {/* Next Steps - Requirements 5.3, 5.4 */}
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

          {/* Estimated Timeline - Requirement 5.4 */}
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

          {/* Action Buttons - Requirement 5.5 */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="primary"
              size="md"
              onClick={downloadReceipt}
              disabled={!serviceData}
            >
              Download Receipt
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={() => router.push(`/services/track?ref=${referenceNumber}`)}
            >
              Track Your Request
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={() => router.push('/')}
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
