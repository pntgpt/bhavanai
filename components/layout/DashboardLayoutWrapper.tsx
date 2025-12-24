/**
 * DashboardLayoutWrapper Component
 * 
 * Client-side wrapper that fetches user session and renders DashboardLayout.
 * Handles loading state while fetching session data.
 * 
 * Requirements: 21.3, 27.1, 27.2, 27.3
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from './DashboardLayout';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'broker' | 'ca' | 'lawyer';
}

interface DashboardLayoutWrapperProps {
  children: React.ReactNode;
}

export default function DashboardLayoutWrapper({ children }: DashboardLayoutWrapperProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    /**
     * Fetch current user session
     */
    async function fetchSession() {
      try {
        const response = await fetch('/api/auth/session');
        const data = await response.json();

        if (!data.authenticated || !data.user) {
          // Not authenticated - redirect to login
          router.push('/login');
          return;
        }

        setUser(data.user);
      } catch (error) {
        console.error('Error fetching session:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }

    fetchSession();
  }, [router]);

  // Show loading state while fetching session
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
          <p className="font-sans text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show nothing if no user (will redirect)
  if (!user) {
    return null;
  }

  // Render dashboard layout with user data
  return <DashboardLayout user={user}>{children}</DashboardLayout>;
}
