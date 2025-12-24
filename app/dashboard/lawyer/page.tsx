/**
 * Lawyer Dashboard Page
 * 
 * Placeholder dashboard for lawyer users with coming soon message.
 * Lawyer-specific functionality will be implemented in future updates.
 * 
 * Requirements: 27.1, 27.2, 27.4
 */

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'broker' | 'ca' | 'lawyer';
}

export default async function LawyerDashboard() {
  // Note: Authentication is handled by middleware
  // This page will only be accessible to authenticated lawyer users

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="font-serif font-bold text-4xl text-gray-900 mb-2">
          Lawyer Dashboard
        </h1>
        <p className="font-sans text-gray-600">
          Legal document management and compliance tools for legal professionals.
        </p>
      </div>

      {/* Coming Soon Message */}
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="mb-6">
            <svg
              className="h-24 w-24 text-gray-300 mx-auto"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
            </svg>
          </div>
          <h2 className="font-serif font-bold text-3xl text-gray-900 mb-4">
            Coming Soon
          </h2>
          <p className="font-sans text-gray-600 mb-6">
            Lawyer-specific features are currently under development. You'll have access to:
          </p>
          <ul className="font-sans text-left text-gray-700 space-y-2 mb-8">
            <li className="flex items-start">
              <svg
                className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M5 13l4 4L19 7" />
              </svg>
              <span>SPV legal document templates</span>
            </li>
            <li className="flex items-start">
              <svg
                className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M5 13l4 4L19 7" />
              </svg>
              <span>Contract review and approval workflow</span>
            </li>
            <li className="flex items-start">
              <svg
                className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M5 13l4 4L19 7" />
              </svg>
              <span>Compliance verification tools</span>
            </li>
            <li className="flex items-start">
              <svg
                className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M5 13l4 4L19 7" />
              </svg>
              <span>Legal document vault and e-signatures</span>
            </li>
          </ul>
          <p className="font-sans text-sm text-gray-500">
            We'll notify you when these features become available.
          </p>
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-sans font-semibold text-blue-900 mb-2">
          Need Assistance?
        </h3>
        <p className="font-sans text-blue-800 text-sm">
          If you have questions or need support, please contact our team at{' '}
          <a href="mailto:support@bhavan.ai" className="underline">
            support@bhavan.ai
          </a>
        </p>
      </div>
    </div>
  );
}
