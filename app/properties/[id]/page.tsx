import PropertyDetailPage from './PropertyDetailPage';

/**
 * Property Detail Route (Server Component)
 * 
 * For static export: generates static pages for all property IDs
 * Client component extracts actual ID from URL and fetches data
 * 
 * Requirements: 24.4 - Display approved properties on public pages
 */

export async function generateStaticParams() {
  // For static export with dynamic routes, we need to return at least one param
  // The actual property data is fetched client-side based on the URL
  // This creates a template page that works for any property ID
  return [{ id: '_' }];
}

export default function Page() {
  return <PropertyDetailPage />;
}
