import React from 'react';
import { getPropertyById, sampleProperties } from '@/lib/properties';
import PropertyDetailClient from './PropertyDetailClient';

/**
 * Property Detail Page Component (Server Component)
 * 
 * Handles static generation and data fetching for property detail pages.
 * Delegates rendering to client component for interactivity.
 * 
 * Requirements: New Feature - Property Detail Page
 */

/**
 * Generate static params for all properties at build time
 * Required for Next.js static export
 */
export function generateStaticParams() {
  return sampleProperties.map((property) => ({
    id: property.id,
  }));
}

interface PropertyDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PropertyDetailPage({ params }: PropertyDetailPageProps) {
  const { id } = await params;
  const property = getPropertyById(id);

  return <PropertyDetailClient property={property} />;
}
