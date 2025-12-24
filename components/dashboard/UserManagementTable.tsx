'use client';

/**
 * User Management Table Component
 * Displays all users with actions for approval, rejection, password reset, and deactivation
 */

import { useState } from 'react';
import Button from '../ui/Button';
import Modal from '../ui/Modal';

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

interface UserManagementTableProps {
  users: User[];
  onRefresh: () => void;
}

export default function UserManagementTable({ users, onRefresh }: UserManagementTableProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [createFormData, setCreateFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'broker' as 'admin' | 'broker' | 'ca' | 'lawyer',
  });

  /**
   * Approve a pending user
   */
  const handleApprove = async (userId: string) => {
    setLoading(userId);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/admin/users/${userId}/approve`, {
        method: 'PATCH',
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to approve user');
      }

      setSuccess('User approved successfully');
      onRefresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(null);
    }
  };

  /**
   * Reject a pending user
   */
  const handleReject = async (userId: string) => {
    if (!confirm('Are you sure you want to reject this user? This will delete their account.')) {
      return;
    }

    setLoading(userId);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/admin/users/${userId}/reject`, {
        method: 'PATCH',
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reject user');
      }

      setSuccess('User rejected and removed successfully');
      onRefresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(null);
    }
  };

  /**
   * Deactivate an active user
   */
  const handleDeactivate = async (userId: string) => {
    if (!confirm('Are you sure you want to deactivate this user?')) {
      return;
    }

    setLoading(userId);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/admin/users/${userId}/deactivate`, {
        method: 'PATCH',
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to deactivate user');
      }

      setSuccess('User deactivated successfully');
      onRefresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(null);
    }
  };

  /**
   * Open reset password modal
   */
  const openResetPasswordModal = (userId: string) => {
    setSelectedUserId(userId);
    setNewPassword('');
    setShowResetPasswordModal(true);
  };

  /**
   * Reset user password
   */
  const handleResetPassword = async () => {
    if (!selectedUserId || !newPassword) {
      setError('Please enter a new password');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(selectedUserId);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/admin/users/${selectedUserId}/reset-password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      setSuccess('Password reset successfully');
      setShowResetPasswordModal(false);
      setSelectedUserId(null);
      setNewPassword('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(null);
    }
  };

  /**
   * Create a new user
   */
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading('create');
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(createFormData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create user');
      }

      setSuccess('User created successfully');
      setShowCreateModal(false);
      setCreateFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'broker',
      });
      onRefresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(null);
    }
  };

  /**
   * Format date for display
   */
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  /**
   * Get status badge color
   */
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  /**
   * Get role badge color
   */
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'broker':
        return 'bg-blue-100 text-blue-800';
      case 'ca':
        return 'bg-indigo-100 text-indigo-800';
      case 'lawyer':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with Create Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
        <Button
          variant="primary"
          size="md"
          onClick={() => setShowCreateModal(true)}
        >
          Create User
        </Button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded">
          {success}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(
                          user.role
                        )}`}
                      >
                        {user.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                          user.status
                        )}`}
                      >
                        {user.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {user.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(user.id)}
                            disabled={loading === user.id}
                            className="text-green-600 hover:text-green-900 disabled:opacity-50"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(user.id)}
                            disabled={loading === user.id}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {user.status === 'active' && (
                        <>
                          <button
                            onClick={() => openResetPasswordModal(user.id)}
                            disabled={loading === user.id}
                            className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                          >
                            Reset Password
                          </button>
                          <button
                            onClick={() => handleDeactivate(user.id)}
                            disabled={loading === user.id}
                            className="text-orange-600 hover:text-orange-900 disabled:opacity-50"
                          >
                            Deactivate
                          </button>
                        </>
                      )}
                      {user.status === 'inactive' && (
                        <button
                          onClick={() => handleApprove(user.id)}
                          disabled={loading === user.id}
                          className="text-green-600 hover:text-green-900 disabled:opacity-50"
                        >
                          Reactivate
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New User"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name *
            </label>
            <input
              type="text"
              id="name"
              required
              value={createFormData.name}
              onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email *
            </label>
            <input
              type="email"
              id="email"
              required
              value={createFormData.email}
              onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone *
            </label>
            <input
              type="tel"
              id="phone"
              required
              value={createFormData.phone}
              onChange={(e) => setCreateFormData({ ...createFormData, phone: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password * (min 8 characters)
            </label>
            <input
              type="password"
              id="password"
              required
              minLength={8}
              value={createFormData.password}
              onChange={(e) => setCreateFormData({ ...createFormData, password: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
              Role *
            </label>
            <select
              id="role"
              required
              value={createFormData.role}
              onChange={(e) =>
                setCreateFormData({
                  ...createFormData,
                  role: e.target.value as 'admin' | 'broker' | 'ca' | 'lawyer',
                })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="broker">Broker</option>
              <option value="ca">CA (Chartered Accountant)</option>
              <option value="lawyer">Lawyer</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={loading === 'create'}
              disabled={loading === 'create'}
            >
              Create User
            </Button>
          </div>
        </form>
      </Modal>

      {/* Reset Password Modal */}
      <Modal
        isOpen={showResetPasswordModal}
        onClose={() => setShowResetPasswordModal(false)}
        title="Reset User Password"
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
              New Password * (min 8 characters)
            </label>
            <input
              type="password"
              id="newPassword"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setShowResetPasswordModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleResetPassword}
              loading={loading === selectedUserId}
              disabled={loading === selectedUserId}
            >
              Reset Password
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
