import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import EligibilityForm from '@/components/forms/EligibilityForm';
import { CheckCircle, Users, Home, TrendingUp } from 'lucide-react';
import type { Metadata } from 'next';

/**
 * Eligibility Checker Page
 * 
 * This page contains the eligibility form to check if users qualify
 * for fractional home ownership with Bhavan.ai.
 * 
 * Includes explanatory content about eligibility criteria and the benefits
 * of co-ownership through Bhavan.ai's platform.
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5
 */

export const metadata: Metadata = {
  title: 'Check Your Eligibility - Bhavan.ai',
  description: 'See if you qualify for fractional home ownership with Bhavan.ai. Quick eligibility check based on your city, income, and preferences.',
};

export default function EligibilityPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-primary-50 to-white py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h1 className="font-serif font-bold text-4xl md:text-5xl text-gray-900 mb-6">
                Check Your Eligibility
              </h1>
              <p className="font-sans text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
                Find out if you qualify for fractional home ownership with Bhavan.ai. 
                Answer a few quick questions and we'll get back to you within 2 business days.
              </p>
            </div>
          </div>
        </section>

        {/* Eligibility Criteria Section */}
        <section className="py-12 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-serif font-bold text-3xl text-gray-900 text-center mb-12">
              Who Can Apply?
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Criteria Card 1 */}
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="font-sans font-semibold text-lg text-gray-900 mb-2">
                  Age 18+
                </h3>
                <p className="font-sans text-sm text-gray-600">
                  You must be at least 18 years old to apply for co-ownership
                </p>
              </div>

              {/* Criteria Card 2 */}
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="font-sans font-semibold text-lg text-gray-900 mb-2">
                  Stable Income
                </h3>
                <p className="font-sans text-sm text-gray-600">
                  Regular monthly income to support down payment and EMI contributions
                </p>
              </div>

              {/* Criteria Card 3 */}
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="font-sans font-semibold text-lg text-gray-900 mb-2">
                  2-5 Co-owners
                </h3>
                <p className="font-sans text-sm text-gray-600">
                  Willing to co-own a home with 1-4 other compatible buyers
                </p>
              </div>

              {/* Criteria Card 4 */}
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Home className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="font-sans font-semibold text-lg text-gray-900 mb-2">
                  Available Cities
                </h3>
                <p className="font-sans text-sm text-gray-600">
                  Currently available in major Indian metros with expansion planned
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Form Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8 text-center">
              <h2 className="font-serif font-bold text-3xl text-gray-900 mb-4">
                Complete Your Eligibility Check
              </h2>
              <p className="font-sans text-gray-600">
                Fill out the form below and our team will review your information. 
                We'll reach out within 2 business days with next steps.
              </p>
            </div>
            <EligibilityForm />
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-serif font-bold text-3xl text-gray-900 text-center mb-12">
              Why Choose Bhavan.ai?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="font-serif font-bold text-4xl text-primary-600 mb-2">
                  50%
                </div>
                <p className="font-sans text-gray-600">
                  Lower down payment when you co-own with others
                </p>
              </div>
              <div className="text-center">
                <div className="font-serif font-bold text-4xl text-primary-600 mb-2">
                  100%
                </div>
                <p className="font-sans text-gray-600">
                  Legal compliance with SPV structure and documentation
                </p>
              </div>
              <div className="text-center">
                <div className="font-serif font-bold text-4xl text-primary-600 mb-2">
                  24/7
                </div>
                <p className="font-sans text-gray-600">
                  Exit flexibility through our secondary marketplace
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-serif font-bold text-3xl text-gray-900 text-center mb-12">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="font-sans font-semibold text-lg text-gray-900 mb-2">
                  What happens after I submit the eligibility form?
                </h3>
                <p className="font-sans text-gray-600">
                  Our team will review your information and assess your eligibility based on 
                  your financial profile and preferences. We'll reach out within 2 business days 
                  with next steps, which may include a detailed application or matching process.
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="font-sans font-semibold text-lg text-gray-900 mb-2">
                  Is there any cost to check eligibility?
                </h3>
                <p className="font-sans text-gray-600">
                  No, checking your eligibility is completely free. There are no charges until 
                  you decide to proceed with the co-ownership process and form an SPV.
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="font-sans font-semibold text-lg text-gray-900 mb-2">
                  What if I don't meet the eligibility criteria?
                </h3>
                <p className="font-sans text-gray-600">
                  If you don't currently meet our criteria, we'll provide feedback on what you 
                  can work on to become eligible in the future. You can also join our waitlist 
                  to stay updated as we expand to new cities and adjust our criteria.
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="font-sans font-semibold text-lg text-gray-900 mb-2">
                  How do you match co-owners?
                </h3>
                <p className="font-sans text-gray-600">
                  We use a combination of financial compatibility, lifestyle preferences, and 
                  location requirements to match co-owners. Our algorithm ensures that all 
                  co-owners have aligned goals and compatible financial profiles.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
