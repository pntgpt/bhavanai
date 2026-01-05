'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { appendAffiliateId } from '@/lib/affiliate';

/**
 * ServiceTrackingPage Component
 * 
 * Allows customers to track their service request status using reference number.
 * Displays current status, timeline, and estimated next steps.
 * 
 * Requirements: 9.1, 9.2, 9.3, 9.5
 */

interface ServiceRequest {
  id: string;
  referenceNumber: string;
  service: {
    id: string;
    name: string;
    description: string;
    category: string;
  };
  serviceTier: {
    id: string;
    name: string;
    price: number;
  } | null;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  payment: {
    amount: number;
    currency: string;
    status: string;
    transactionId: string | null;
    completedAt: number | null;
  };
  status: string;
  statusLabel: string;
  createdAt: number;
  updatedAt: number;
}

interface StatusTimelineItem {
  status: string;
  statusLabel: string;
  timestamp: number;
  description: string;
}

interface TrackingResponse {
  success: boolean;
  request: ServiceRequest;
  timeline: StatusTimelineItem[];
  estimatedNextStep: string;
  error?: string;
}

export default function ServiceTrackingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [inputRef, setInputRef] = useState<string>('');
  const [trackingData, setTrackingData] = useState<TrackingResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if reference number is in URL
  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) {
      setReferenceNumber(ref);
      setInputRef(ref);
      fetchTrackingData(ref);
    }
  }, [searchParams]);

  /**
   * Fetch tracking data from API
   * Requirement 9.2
   */
  const fetchTrackingData = async (ref: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/services/requests/${ref}`);
      const data: TrackingResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch tracking data');
      }

      setTrackingData(data);
      setReferenceNumber(ref);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch tracking data');
      setTrackingData(null);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle form submission
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputRef.trim()) {
      fetchTrackingData(inputRef.trim());
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
    if (!trackingData) return;

    const { request } = trackingData;
    const receiptContent = `
BHAVAN.AI - SERVICE PURCHASE RECEIPT
=====================================

Reference Number: ${request.referenceNumber}
Date: ${formatDate(request.createdAt)}

CUSTOMER INFORMATION
--------------------
Name: ${request.customer.name}
Email: ${request.customer.email}
Phone: ${request.customer.phone}

SERVICE DETAILS
---------------
Service: ${request.service.name}
${request.serviceTier ? `Package: ${request.serviceTier.name}` : ''}

PAYMENT INFORMATION
-------------------
Amount: ${formatCurrency(request.payment.amount, request.payment.currency)}
Payment Status: ${request.payment.status}
${request.payment.transactionId ? `Transaction ID: ${request.payment.transactionId}` : ''}
${request.payment.completedAt ? `Payment Date: ${formatDate(request.payment.completedAt)}` : ''}

CURRENT STATUS
--------------
Status: ${request.statusLabel}
Last Updated: ${formatDate(request.updatedAt)}

For any queries, please contact support@bhavan.ai
Reference this number in all correspondence: ${request.referenceNumber}

Thank you for choosing Bhavan.ai!
    `.trim();

    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bhavan-receipt-${request.referenceNumber}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header - Requirement 12.1, 12.5 */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Track Your Service Request
          </h1>
          <p className="text-base sm:text-lg text-gray-600">
            Enter your reference number to check the status of your service request
          </p>
        </div>

        {/* Reference Number Input Form - Requirement 9.1, 12.2 */}
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8 mb-8">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="referenceNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Reference Number
              </label>
              <input
                type="text"
                id="referenceNumber"
                value={inputRef}
                onChange={(e) => setInputRef(e.target.value)}
                placeholder="Enter your reference number"
                autoComplete="off"
                inputMode="text"
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>
            <div className="sm:self-end">
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={loading || !inputRef.trim()}
              >
                {loading ? 'Tracking...' : 'Track Request'}
              </Button>
            </div>
          </form>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading tracking information...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="w-6 h-6 text-red-600"
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
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-red-800">Request Not Found</h3>
                <p className="mt-2 text-sm text-red-700">{error}</p>
                <p className="mt-2 text-sm text-gray-600">
                  Please check your reference number and try again. If you continue to experience issues,
                  contact our support team at support@bhavan.ai
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tracking Data Display - Requirements 9.2, 9.3, 9.5 */}
        {trackingData && !loading && (
          <div className="space-y-6">
            {/* Service Request Summary - Requirement 12.5 */}
            <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                    {trackingData.request.service.name}
                  </h2>
                  {trackingData.request.serviceTier && (
                    <p className="text-base sm:text-lg text-gray-600">
                      {trackingData.request.serviceTier.name}
                    </p>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadReceipt}
                  className="w-full sm:w-auto"
                >
                  Download Receipt
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Reference Number</h3>
                  <p className="text-base sm:text-lg font-mono font-semibold text-gray-900 break-all">
                    {trackingData.request.referenceNumber}
                  </p>
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Amount Paid</h3>
                  <p className="text-base sm:text-lg font-semibold text-gray-900">
                    {formatCurrency(
                      trackingData.request.payment.amount,
                      trackingData.request.payment.currency
                    )}
                  </p>
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Purchase Date</h3>
                  <p className="text-base sm:text-lg text-gray-900">
                    {formatDate(trackingData.request.createdAt)}
                  </p>
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Current Status</h3>
                  <p className="text-base sm:text-lg font-semibold text-primary-600">
                    {trackingData.request.statusLabel}
                  </p>
                </div>
              </div>
            </div>

            {/* Status Timeline - Requirement 9.3, 12.5 */}
            <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-6">Status Timeline</h2>
              <div className="space-y-6">
                {trackingData.timeline.map((item, index) => (
                  <div key={index} className="flex items-start">
                    {/* Timeline dot and line */}
                    <div className="flex flex-col items-center mr-3 sm:mr-4">
                      <div
                        className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${
                          index === trackingData.timeline.length - 1
                            ? 'bg-primary-600'
                            : 'bg-green-600'
                        }`}
                      ></div>
                      {index < trackingData.timeline.length - 1 && (
                        <div className="w-0.5 h-full bg-gray-300 mt-2" style={{ minHeight: '40px' }}></div>
                      )}
                    </div>

                    {/* Timeline content */}
                    <div className="flex-1 pb-6">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0 mb-1">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                          {item.statusLabel}
                        </h3>
                        <span className="text-xs sm:text-sm text-gray-500">
                          {formatDate(item.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm sm:text-base text-gray-600">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Estimated Next Steps - Requirement 9.5 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start">
                <svg
                  className="w-6 h-6 text-blue-600 mr-3 mt-0.5 flex-shrink-0"
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
                <div>
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">What's Next?</h3>
                  <p className="text-blue-800">{trackingData.estimatedNextStep}</p>
                </div>
              </div>
            </div>

            {/* Support Information - Requirement 12.4 */}
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Need Help?</h3>
              <p className="text-gray-600 mb-4">
                If you have any questions about your service request, our support team is here to help.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href="mailto:support@bhavan.ai"
                  className="inline-flex items-center justify-center px-6 py-3 min-h-[44px] bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 transition-colors"
                >
                  Email Support
                </a>
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => router.push(appendAffiliateId('/'))}
                  className="w-full sm:w-auto"
                >
                  Return to Home
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
