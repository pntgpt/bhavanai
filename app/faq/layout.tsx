import type { Metadata } from 'next';
import { generatePageMetadata, pageMetadata } from '@/lib/seo';

/**
 * FAQ Page Layout
 * 
 * Provides metadata for the FAQ page since the page component
 * is a client component and cannot export metadata directly.
 * 
 * Requirements: 15.1, 15.2, 15.3, 15.4
 */

export const metadata: Metadata = generatePageMetadata(pageMetadata.faq);

export default function FAQLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
