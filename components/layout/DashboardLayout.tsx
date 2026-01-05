/**
 * DashboardLayout Component
 * 
 * Shared layout for all dashboard pages with navigation and logout functionality.
 * Provides consistent header, navigation, and user context across all role-specific dashboards.
 * 
 * Requirements: 21.3, 27.1, 27.2, 27.3
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'broker' | 'ca' | 'lawyer';
}

interface DashboardLayoutProps {
  user: User;
  children: React.ReactNode;
}

/**
 * Get role display name
 */
function getRoleDisplayName(role: string): string {
  const roleNames: Record<string, string> = {
    admin: 'Administrator',
    broker: 'Broker',
    ca: 'Chartered Accountant',
    lawyer: 'Lawyer',
  };
  return roleNames[role] || role;
}

/**
 * Get navigation items based on user role
 */
function getNavigationItems(role: string): Array<{ label: string; href: string }> {
  const baseItems = [
    { label: 'Dashboard', href: `/dashboard/${role}` },
  ];

  // Add role-specific navigation items
  if (role === 'admin') {
    return [
      ...baseItems,
      { label: 'User Management', href: '/dashboard/admin/users' },
      { label: 'Property Approval', href: '/dashboard/admin/properties/approval' },
      { label: 'All Properties', href: '/dashboard/admin/properties' },
      { label: 'Service Requests', href: '/dashboard/admin/services' },
      { label: 'Affiliates', href: '/dashboard/admin/affiliates' },
    ];
  }

  if (role === 'broker') {
    return [
      ...baseItems,
      { label: 'My Properties', href: '/dashboard/broker/properties' },
      { label: 'Add Property', href: '/dashboard/broker/properties/new' },
    ];
  }

  // CA and Lawyer have basic navigation for now
  return baseItems;
}

export default function DashboardLayout({ user, children }: DashboardLayoutProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigationItems = getNavigationItems(user.role);

  /**
   * Handle logout
   */
  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (response.ok) {
        // Redirect to login page
        window.location.href = '/login';
      } else {
        throw new Error('Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
      alert('Failed to logout. Please try again.');
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Brand */}
            <div className="flex items-center">
              <Link href={`/dashboard/${user.role}`} className="flex items-center">
                <span className="font-serif font-bold text-2xl text-gray-900">
                  Bhavan.ai
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="font-sans text-gray-700 hover:text-gray-900 transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* User Info and Logout */}
            <div className="flex items-center space-x-4">
              <div className="hidden md:block text-right">
                <p className="font-sans text-sm font-medium text-gray-900">
                  {user.name}
                </p>
                <p className="font-sans text-xs text-gray-500">
                  {getRoleDisplayName(user.role)}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                loading={isLoggingOut}
                disabled={isLoggingOut}
                className="hidden md:block"
              >
                Logout
              </Button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100"
                aria-label="Toggle menu"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {mobileMenuOpen ? (
                    <path d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-4 space-y-3">
              {/* User Info */}
              <div className="pb-3 border-b border-gray-200">
                <p className="font-sans text-sm font-medium text-gray-900">
                  {user.name}
                </p>
                <p className="font-sans text-xs text-gray-500">
                  {getRoleDisplayName(user.role)}
                </p>
              </div>

              {/* Navigation Links */}
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block font-sans text-gray-700 hover:text-gray-900 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}

              {/* Logout Button */}
              <div className="pt-3 border-t border-gray-200">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  loading={isLoggingOut}
                  disabled={isLoggingOut}
                  className="w-full"
                >
                  Logout
                </Button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
