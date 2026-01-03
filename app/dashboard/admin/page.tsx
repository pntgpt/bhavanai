/**
 * Admin Dashboard Page
 * 
 * Main dashboard for administrator users with overview of system status.
 * Provides quick access to user management, property approval, and analytics.
 * 
 * Requirements: 21.3, 27.1
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

/**
 * Fetch current user session from API
 */
async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie) {
      return null;
    }

    // In production, this would call the session API
    // For now, we'll rely on middleware to handle auth
    // This is a placeholder that will be replaced with actual API call
    return null;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

export default async function AdminDashboard() {
  // Note: Authentication is handled by middleware
  // This page will only be accessible to authenticated admin users
  // The middleware attaches user data to the request context

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="font-serif font-bold text-4xl text-gray-900 mb-2">
          Admin Dashboard
        </h1>
        <p className="font-sans text-gray-600">
          Manage users, approve properties, and oversee platform operations.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-sans text-sm font-medium text-gray-500 mb-2">
            Pending Users
          </h3>
          <p className="font-serif text-3xl font-bold text-gray-900">
            -
          </p>
          <p className="font-sans text-sm text-gray-600 mt-2">
            Awaiting approval
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-sans text-sm font-medium text-gray-500 mb-2">
            Pending Properties
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
            Active Properties
          </h3>
          <p className="font-serif text-3xl font-bold text-gray-900">
            -
          </p>
          <p className="font-sans text-sm text-gray-600 mt-2">
            Currently listed
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
            href="/dashboard/admin/users"
            className="block p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-md transition-all"
          >
            <h3 className="font-sans font-semibold text-gray-900 mb-1">
              User Management
            </h3>
            <p className="font-sans text-sm text-gray-600">
              Approve pending users, create new accounts, and manage permissions
            </p>
          </a>

          <a
            href="/dashboard/admin/properties/approval"
            className="block p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-md transition-all"
          >
            <h3 className="font-sans font-semibold text-gray-900 mb-1">
              Property Approval
            </h3>
            <p className="font-sans text-sm text-gray-600">
              Review and approve property listings submitted by brokers
            </p>
          </a>

          <a
            href="/dashboard/admin/properties"
            className="block p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-md transition-all"
          >
            <h3 className="font-sans font-semibold text-gray-900 mb-1">
              All Properties
            </h3>
            <p className="font-sans text-sm text-gray-600">
              View, edit, and manage all properties across all brokers
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
              View the public property listings page as users see it
            </p>
          </a>

          <a
            href="/dashboard/admin/affiliates"
            className="block p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-md transition-all"
          >
            <h3 className="font-sans font-semibold text-gray-900 mb-1">
              Affiliate Management
            </h3>
            <p className="font-sans text-sm text-gray-600">
              Create and manage affiliate partners for tracking referrals
            </p>
          </a>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="font-serif font-bold text-2xl text-gray-900 mb-4">
          Recent Activity
        </h2>
        <p className="font-sans text-gray-600">
          Activity tracking will be implemented in future updates.
        </p>
      </div>
    </div>
  );
}
