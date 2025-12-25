/**
 * Edit Property Page
 * Allows brokers to edit their existing properties
 * 
 * Note: This is a placeholder - full edit functionality to be implemented
 */

import EditPropertyClient from './EditPropertyClient';

/**
 * Generate static params for static export
 */
export async function generateStaticParams() {
  // Return a placeholder for static export
  return [{ id: '_' }];
}

export default function EditPropertyPage() {
  return <EditPropertyClient />;
}
