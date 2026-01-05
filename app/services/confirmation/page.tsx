/**
 * Service Purchase Confirmation Page
 * 
 * Displays confirmation after successful service purchase.
 * Shows order reference number and next steps.
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
 */

import { Suspense } from 'react';
import ServiceConfirmationPage from './ServiceConfirmationPage';

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
      <ServiceConfirmationPage />
    </Suspense>
  );
}
