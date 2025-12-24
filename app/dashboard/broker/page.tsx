/**
 * Broker Dashboard Page
 * 
 * Main dashboard for broker users to manage their property listings.
 * Provides overview of properties and quick access to add/edit functionality.
 * 
 * Requirements: 21.3, 27.2
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

export default async function BrokerDashboard() {
  // Note: Authentication is handled by middleware
  // This page will only be accessible to authenticated broker users

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="font-serif font-bold text-4xl text-gray-900 mb-2">
          Broker Dashboard
        </h1>
        <p className="font-sans text-gray-600">
          Manage your property listings and track approval status.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-sans text-sm font-medium text-gray-500 mb-2">
            Total Properties
          </h3>
          <p className="font-serif text-3xl font-bold text-gray-900">
            -
          </p>
          <p className="font-sans text-sm text-gray-600 mt-2">
            All your listings
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-sans text-sm font-medium text-gray-500 mb-2">
            Pending Approval
          </h3>
          <p className="font-serif text-3xl font-bold text-gray-900">
            -
          </p>
          <p className="font-sans text-sm text-gray-600 mt-2">
            Awaiting review
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-sans text-sm font-medium text-gray-500 mb-2">
            Approved
          </h3>
          <p className="font-serif text-3xl font-bold text-gray-900">
            -
          </p>
          <p className="font-sans text-sm text-gray-600 mt-2">
            Live on site
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="font-serif font-bold text-2xl text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href="/dashboard/broker/properties/new"
            className="block p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all"
          >
            <div className="flex items-center justify-center mb-2">
              <svg
                className="h-8 w-8 text-gray-400"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h3 className="font-sans font-semibold text-gray-900 text-center mb-1">
              Add New Property
            </h3>
            <p className="font-sans text-sm text-gray-600 text-center">
              Create a new property listing for approval
            </p>
          </a>

          <a
            href="/dashboard/broker/properties"
            className="block p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-md transition-all"
          >
            <h3 className="font-sans font-semibold text-gray-900 mb-1">
              My Properties
            </h3>
            <p className="font-sans text-sm text-gray-600">
              View and manage all your property listings
            </p>
          </a>

          <a
            href="/properties"
            className="block p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-md transition-all"
          >
            <h3 className="font-sans font-semibold text-gray-900 mb-1">
              Public Listings
            </h3>
            <p className="font-sans text-sm text-gray-600">
              View approved properties as they appear to customers
            </p>
          </a>

          <a
            href="/dashboard/broker/help"
            className="block p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-md transition-all"
          >
            <h3 className="font-sans font-semibold text-gray-900 mb-1">
              Help & Guidelines
            </h3>
            <p className="font-sans text-sm text-gray-600">
              Learn best practices for property listings
            </p>
          </a>
        </div>
      </div>

      {/* Recent Properties */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="font-serif font-bold text-2xl text-gray-900 mb-4">
          Recent Properties
        </h2>
        <p className="font-sans text-gray-600">
          Your property listings will appear here once you add them.
        </p>
      </div>
    </div>
  );
}
