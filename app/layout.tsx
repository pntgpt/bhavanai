import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { GoogleAnalytics, AnalyticsProvider } from '@/components/analytics';
import { organizationSchema } from '@/lib/seo';

/**
 * Font configuration for the application
 * - Inter: Sans-serif font for body text
 * - Playfair Display: Serif font for headings
 */
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

/**
 * Root metadata for SEO optimization
 * This provides default metadata that can be overridden by individual pages
 */
export const metadata: Metadata = {
  title: 'Bhavan.ai - Co-own Your Home with Friends | Fractional Home Ownership',
  description:
    'Turn rent into home ownership. Bhavan.ai enables 2-5 people to legally co-own residential homes through compliant SPVs. Check your eligibility today.',
  keywords: [
    'fractional home ownership',
    'co-ownership',
    'SPV',
    'home buying',
    'shared ownership',
    'real estate',
    'Bhavan.ai',
  ],
  authors: [{ name: 'Bhavan.ai' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://bhavan.ai',
    siteName: 'Bhavan.ai',
    title: 'Bhavan.ai - Co-own Your Home with Friends',
    description:
      'Turn rent into home ownership. Bhavan.ai enables 2-5 people to legally co-own residential homes through compliant SPVs.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bhavan.ai - Co-own Your Home with Friends',
    description:
      'Turn rent into home ownership. Bhavan.ai enables 2-5 people to legally co-own residential homes through compliant SPVs.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

/**
 * Root layout component
 * Provides the HTML structure and font configuration for all pages
 * Uses Next.js App Router layout pattern
 * 
 * Layout structure:
 * - Header: Sticky navigation with mobile menu
 * - Main content: Page-specific content
 * - Footer: Site-wide footer with links and newsletter
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <GoogleAnalytics />
        {/* Organization Structured Data - Requirement 15.3 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body className="font-sans">
        <AnalyticsProvider>
          {children}
        </AnalyticsProvider>
      </body>
    </html>
  );
}
