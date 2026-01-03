/**
 * Affiliate Statistics Dashboard Route (Server Component)
 * 
 * For static export: uses query parameters instead of dynamic routes
 * Client component extracts affiliate ID from URL query params
 * 
 * Requirements: 5.1 (total signups), 5.2 (total contacts), 5.3 (chronological order),
 *               5.4 (breakdown by type), 5.5 (date filtering)
 */

import AffiliateStatsClient from './AffiliateStatsClient';

export default function StatsPage() {
  return <AffiliateStatsClient />;
}
