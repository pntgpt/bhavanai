import { Suspense } from 'react';
import MockPaymentPage from './MockPaymentPage';

export const metadata = {
  title: 'Test Payment - Bhavan.ai',
  description: 'Mock payment gateway for testing',
};

/**
 * Mock Payment Page Wrapper
 * Wraps the client component in Suspense to handle useSearchParams
 */
export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading payment information...</p>
            </div>
          </div>
        </div>
      }
    >
      <MockPaymentPage />
    </Suspense>
  );
}
