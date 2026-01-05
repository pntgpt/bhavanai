/**
 * Service Request Tracking Page
 * 
 * Allows customers to track their service request status using reference number.
 * Displays current status, timeline, and estimated next steps.
 * 
 * Requirements: 9.1, 9.2, 9.3, 9.5
 */

import { Suspense } from 'react';
import ServiceTrackingPage from './ServiceTrackingPage';

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ServiceTrackingPage />
    </Suspense>
  );
}
