/**
 * CA (Chartered Accountant) Dashboard Page
 * 
 * Placeholder dashboard for CA users with coming soon message.
 * CA-specific functionality will be implemented in future updates.
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

export default async function CADashboard() {
  // Note: Authentication is handled by middleware
  // This page will only be accessible to authenticated CA users

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="font-serif font-bold text-4xl text-gray-900 mb-2">
          CA Dashboard
        </h1>
        <p className="font-sans text-gray-600">
          Financial management and compliance tools for Chartered Accountants.
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
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="font-serif font-bold text-3xl text-gray-900 mb-4">
            Coming Soon
          </h2>
          <p className="font-sans text-gray-600 mb-6">
            CA-specific features are currently under development. You'll have access to:
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
              <span>Financial document management</span>
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
              <span>SPV compliance tracking</span>
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
              <span>Tax documentation and reporting</span>
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
              <span>Audit trail and transaction history</span>
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
