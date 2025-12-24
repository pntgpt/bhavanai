import React from 'react';
import PropertyDetailClient from './PropertyDetailClient';

/**
 * Property Detail Page Component (Server Component)
 * 
 * Handles data fetching for property detail pages.
 * Delegates rendering to client component for interactivity.
 * 
 * Note: This will be updated in task 14 to fetch from D1 database
 * For now, it passes null to trigger client-side fetching
 * 
 * Requirements: New Feature - Property Detail Page
 */

/**
 * Generate static params - returns placeholder for now
 * Task 14 will update this to fetch from API
 */
export async function generateStaticParams() {
  // Return placeholder - actual properties will be fetched client-side
  // This will be updated in task 14 to fetch real property IDs from API
  return [{ id: 'placeholder' }];
}

interface PropertyDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PropertyDetailPage({ params }: PropertyDetailPageProps) {
  const { id } = await params;
  
  // Property will be fetched client-side in PropertyDetailClient
  // This will be updated in task 14 to use the API
  return <PropertyDetailClient property={null} propertyId={id} />;
}
