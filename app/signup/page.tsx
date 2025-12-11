import { Metadata } from 'next';
import SignupForm from '@/components/forms/SignupForm';
import { generatePageMetadata, pageMetadata } from '@/lib/seo';

/**
 * Signup/Early Access Page
 * 
 * Dedicated page for users to sign up for early access to Bhavan.ai.
 * Features comprehensive signup form with GDPR/India privacy compliance.
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 15.1, 15.2, 15.4
 */

export const metadata: Metadata = generatePageMetadata(pageMetadata.signup);

export default function SignupPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-serif font-bold text-4xl md:text-5xl text-gray-900 mb-4">
            Get Early Access
          </h1>
          <p className="font-sans text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Be among the first to experience fractional home ownership. Sign up now and we'll notify you when Bhavan.ai launches in your city.
          </p>
        </div>

        {/* Benefits Section */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="font-serif font-bold text-2xl text-gray-900 mb-6">
            Why Join Early?
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-sans font-semibold text-gray-900 mb-1">Priority Access</h3>
                <p className="font-sans text-sm text-gray-600">
                  Be the first to access the platform when it launches in your city
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-sans font-semibold text-gray-900 mb-1">Exclusive Benefits</h3>
                <p className="font-sans text-sm text-gray-600">
                  Early adopters may receive special pricing and benefits
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-sans font-semibold text-gray-900 mb-1">Better Matching</h3>
                <p className="font-sans text-sm text-gray-600">
                  More early users means better co-owner matching opportunities
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-sans font-semibold text-gray-900 mb-1">Stay Informed</h3>
                <p className="font-sans text-sm text-gray-600">
                  Get updates on product development and launch timeline
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Signup Form */}
        <SignupForm />

        {/* Additional Information */}
        <div className="mt-8 text-center">
          <p className="font-sans text-sm text-gray-600">
            Have questions?{' '}
            <a href="/faq" className="text-primary-600 hover:underline">
              Check our FAQ
            </a>{' '}
            or{' '}
            <a href="/team#contact" className="text-primary-600 hover:underline">
              contact us
            </a>
            .
          </p>
        </div>
      </div>
    </main>
  );
}
