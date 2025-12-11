import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

/**
 * Eligibility Checker Page
 * 
 * This page will contain the eligibility form to check if users qualify
 * for fractional home ownership with Bhavan.ai.
 * 
 * Will be fully implemented in task 7.
 * For now, this is a placeholder page.
 */
export default function EligibilityPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="text-center">
            <h1 className="font-serif font-bold text-4xl md:text-5xl text-gray-900 mb-6">
              Check Your Eligibility
            </h1>
            <p className="font-sans text-lg text-gray-600 mb-8">
              Eligibility form will be implemented in task 7.
            </p>
            <p className="font-sans text-sm text-gray-500">
              This is a placeholder page for navigation purposes.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
