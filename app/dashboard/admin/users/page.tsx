/**
 * Admin User Management Page
 * 
 * Interface for managing all user accounts in the system.
 * Allows admins to approve pending users, create new accounts,
 * reset passwords, and deactivate users.
 * 
 * Requirements: 26.1, 26.2, 26.3, 26.4, 26.5
 */

'use client';

import { useState, useEffect } from 'react';
import UserManagementTable from '@/components/dashboard/UserManagementTable';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'broker' | 'ca' | 'lawyer';
  status: 'pending' | 'active' | 'inactive';
  created_at: number;
  updated_at: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'active' | 'inactive'>('all');

  /**
   * Fetch users from API
   */
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filter !== 'all') {
        params.append('status', filter);
      }

      const response = await fetch(`/api/admin/users?${params.toString()}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.users);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch users on mount and when filter changes
   */
  useEffect(() => {
    fetchUsers();
  }, [filter]);

  /**
   * Get count by status
   */
  const getStatusCount = (status: 'pending' | 'active' | 'inactive') => {
    return users.filter((u) => u.status === status).length;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="font-serif font-bold text-4xl text-gray-900 mb-2">
          User Management
        </h1>
        <p className="font-sans text-gray-600">
          Manage user accounts, approve registrations, and control access.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-sans text-sm font-medium text-gray-500 mb-1">
            Total Users
          </h3>
          <p className="font-serif text-2xl font-bold text-gray-900">
            {users.length}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-sans text-sm font-medium text-gray-500 mb-1">
            Pending Approval
          </h3>
          <p className="font-serif text-2xl font-bold text-yellow-600">
            {getStatusCount('pending')}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-sans text-sm font-medium text-gray-500 mb-1">
            Active Users
          </h3>
          <p className="font-serif text-2xl font-bold text-green-600">
            {getStatusCount('active')}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-sans text-sm font-medium text-gray-500 mb-1">
            Inactive Users
          </h3>
          <p className="font-serif text-2xl font-bold text-gray-600">
            {getStatusCount('inactive')}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-3 font-sans text-sm font-medium border-b-2 ${
                filter === 'all'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              All Users
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-6 py-3 font-sans text-sm font-medium border-b-2 ${
                filter === 'pending'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Pending ({getStatusCount('pending')})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-6 py-3 font-sans text-sm font-medium border-b-2 ${
                filter === 'active'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Active ({getStatusCount('active')})
            </button>
            <button
              onClick={() => setFilter('inactive')}
              className={`px-6 py-3 font-sans text-sm font-medium border-b-2 ${
                filter === 'inactive'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Inactive ({getStatusCount('inactive')})
            </button>
          </nav>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="font-sans text-gray-600 mt-4">Loading users...</p>
        </div>
      )}

      {/* User Management Table */}
      {!loading && (
        <UserManagementTable users={users} onRefresh={fetchUsers} />
      )}
    </div>
  );
}
