import PropertyDetailPage from './PropertyDetailPage';

/**
 * Property Detail Route Wrapper (Server Component)
 * 
 * Provides generateStaticParams for static export compatibility
 * Delegates rendering to client component for data fetching
 * 
 * Requirements: 24.4 - Display approved properties on public pages
 */

/**
 * Generate static params for static export
 * Returns a placeholder to satisfy Next.js requirements
 * Actual data is fetched client-side via API
 */
export async function generateStaticParams() {
  // Return a placeholder param to satisfy static export requirements
  // The actual property data is fetched client-side
  return [{ id: 'placeholder' }];
}

export default function Page() {
  return <PropertyDetailPage />;
}
