import { Metadata } from 'next';
import LoginForm from '@/components/forms/LoginForm';

/**
 * Login Page
 * 
 * Secure login page for backend users (Admin, Broker, CA, Lawyer).
 * Provides authentication interface with email and password inputs.
 * Redirects authenticated users to their role-specific dashboard.
 * 
 * Requirements: 21.1
 */

export const metadata: Metadata = {
  title: 'Login | Bhavan.ai',
  description: 'Sign in to access your Bhavan.ai dashboard',
  robots: 'noindex, nofollow', // Prevent search engines from indexing login page
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <h1 className="font-serif text-4xl font-bold text-gray-900 mb-2">
            Bhavan.ai
          </h1>
          <p className="font-sans text-gray-600">
            Co-ownership made simple
          </p>
        </div>

        {/* Login Form */}
        <LoginForm />

        {/* Additional Links */}
        <div className="mt-6 text-center">
          <p className="font-sans text-sm text-gray-600">
            Don't have an account?{' '}
            <a 
              href="/register" 
              className="text-primary-600 hover:text-primary-700 font-medium hover:underline"
            >
              Register here
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
