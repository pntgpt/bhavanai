import AffiliateStatsClient from './AffiliateStatsClient';

/**
 * Affiliate Statistics Dashboard Route (Server Component)
 * 
 * For static export: generates static pages for affiliate stats
 * Client component extracts actual ID from URL and fetches data
 * 
 * Requirements: 5.1 (total signups), 5.2 (total contacts), 5.3 (chronological order),
 *               5.4 (breakdown by type), 5.5 (date filtering)
 */

export async function generateStaticParams() {
  // For static export with dynamic routes, we need to return at least one param
  // The actual affiliate data is fetched client-side based on the URL
  // This creates a template page that works for any affiliate ID
  return [{ id: '_' }];
}

export default function Page() {
  return <AffiliateStatsClient />;
}
