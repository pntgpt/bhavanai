/**
 * Service Purchase Page
 * 
 * Displays service details and purchase form for customers to buy services.
 * Handles the complete purchase flow from form submission to payment processing.
 * 
 * Requirements: 2.2, 2.3, 3.1, 3.2, 3.3, 3.5, 4.1, 4.2
 */

import { Suspense } from 'react';
import ServicePurchasePage from './ServicePurchasePage';

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
      <ServicePurchasePage />
    </Suspense>
  );
}
