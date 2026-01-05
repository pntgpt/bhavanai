/**
 * Admin Services Page
 * 
 * Displays all service purchase requests for admin management.
 * Allows admins to view, update status, and assign providers to service requests.
 * 
 * Requirements: Service Purchase Flow
 */

import { Suspense } from 'react';
import AdminServiceRequestsTable from '@/components/dashboard/AdminServiceRequestsTable';

export const metadata = {
  title: 'Service Requests - Admin Dashboard | Bhavan.ai',
  description: 'Manage service purchase requests and assign providers',
};

/**
 * Loading component for table
 */
function TableLoading() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="space-y-3">
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );
}

export default function AdminServicesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif font-bold text-4xl text-gray-900 mb-2">
          Service Requests
        </h1>
        <p className="font-sans text-gray-600">
          Manage service purchase requests, update status, and assign providers.
        </p>
      </div>

      {/* Service Requests Table */}
      <Suspense fallback={<TableLoading />}>
        <AdminServiceRequestsTable />
      </Suspense>
    </div>
  );
}
