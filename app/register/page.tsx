import { Metadata } from 'next';
import RegistrationForm from '@/components/forms/RegistrationForm';

/**
 * Registration Page
 * 
 * Registration page for backend users (Broker, CA, Lawyer).
 * Creates pending user accounts that require admin approval.
 * Not linked from the marketing site - accessed directly by professionals.
 * 
 * Requirements: 22.1, 22.2, 22.4
 */

export const metadata: Metadata = {
  title: 'Register | Bhavan.ai',
  description: 'Register for a Bhavan.ai professional account',
  robots: 'noindex, nofollow', // Prevent search engines from indexing registration page
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <h1 className="font-serif text-4xl font-bold text-gray-900 mb-2">
            Bhavan.ai
          </h1>
          <p className="font-sans text-gray-600">
            Professional Account Registration
          </p>
        </div>

        {/* Registration Form */}
        <RegistrationForm />

        {/* Additional Links */}
        <div className="mt-6 text-center">
          <p className="font-sans text-sm text-gray-600">
            Already have an account?{' '}
            <a 
              href="/login" 
              className="text-primary-600 hover:text-primary-700 font-medium hover:underline"
            >
              Sign in here
            </a>
          </p>
        </div>

        {/* Back to Home */}
        <div className="mt-4 text-center">
          <a 
            href="/" 
            className="font-sans text-sm text-gray-500 hover:text-gray-700 hover:underline"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
