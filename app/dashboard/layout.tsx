/**
 * Dashboard Root Layout
 * 
 * Shared layout for all dashboard pages.
 * Wraps content in DashboardLayoutWrapper which fetches user session client-side.
 * 
 * Requirements: 21.3, 27.1, 27.2, 27.3
 */

import DashboardLayoutWrapper from '@/components/layout/DashboardLayoutWrapper';

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayoutWrapper>{children}</DashboardLayoutWrapper>;
}
