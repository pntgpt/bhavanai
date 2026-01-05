/**
 * Admin Service Requests Management Page
 * Displays and manages all service purchase requests
 * 
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5
 */

import AdminServiceRequestsTable from '@/components/dashboard/AdminServiceRequestsTable';

export default function AdminServicesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <AdminServiceRequestsTable />
    </div>
  );
}
