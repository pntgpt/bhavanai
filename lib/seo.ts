import { Metadata } from 'next';

/**
 * SEO utility functions for generating page metadata
 * 
 * This module provides utilities for:
 * - Generating unique page metadata (title, description, OG tags)
 * - Creating structured data (JSON-LD) for Organization and FAQ schemas
 * - Building canonical URLs
 * - Ensuring proper SEO optimization across all pages
 * 
 * Requirements: 15.1, 15.2, 15.3, 15.4, 15.5
 */

/**
 * Base URL for the website
 * Used for canonical URLs and Open Graph tags
 */
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://bhavan.ai';

/**
 * Default Open Graph image
 * Used when page-specific image is not provided
 */
const DEFAULT_OG_IMAGE = `${BASE_URL}/images/og-default.jpg`;

/**
 * Interface for page metadata configuration
 */
export interface PageMetadataConfig {
  title: string;
  description: string;
  keywords?: string[];
  path: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  noIndex?: boolean;
}

/**
 * Generate complete metadata for a page
 * 
 * Creates unique title, description, and Open Graph tags for each page
 * Ensures proper SEO optimization with canonical URLs
 * 
 * @param config - Page metadata configuration
 * @returns Next.js Metadata object
 * 
 * Requirements: 15.1, 15.2, 15.4
 */
export function generatePageMetadata(config: PageMetadataConfig): Metadata {
  const {
    title,
    description,
    keywords = [],
    path,
    ogImage = DEFAULT_OG_IMAGE,
    ogType = 'website',
    noIndex = false,
  } = config;

  const canonicalUrl = `${BASE_URL}${path}`;
  const fullTitle = `${title} | Bhavan.ai`;

  return {
    title: fullTitle,
    description,
    keywords: [
      'fractional home ownership',
      'co-ownership',
      'SPV',
      'home buying',
      'shared ownership',
      'real estate',
      'Bhavan.ai',
      ...keywords,
    ],
    authors: [{ name: 'Bhavan.ai' }],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: ogType,
      locale: 'en_US',
      url: canonicalUrl,
      siteName: 'Bhavan.ai',
      title: fullTitle,
      description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [ogImage],
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
      },
    },
  };
}

/**
 * Organization structured data (JSON-LD)
 * 
 * Provides search engines with structured information about Bhavan.ai
 * Includes company details, contact information, and social profiles
 * 
 * Requirement: 15.3
 */
export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Bhavan.ai',
  url: BASE_URL,
  logo: `${BASE_URL}/images/logo.png`,
  description:
    'Bhavan.ai enables 2-5 people to legally co-own residential homes through compliant Special Purpose Vehicles (SPVs).',
  foundingDate: '2024',
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'Customer Service',
    email: 'info@bhavan.ai',
    telephone: '+91-87278-12524',
    availableLanguage: ['English'],
  },
  sameAs: [
    // Add social media URLs when available
    // 'https://twitter.com/bhavanai',
    // 'https://linkedin.com/company/bhavanai',
  ],
  address: {
    '@type': 'PostalAddress',
    streetAddress: '306, Morya Grand, B3 Nr, Shalimar Morya Bldg., Andheri Railway Station',
    addressLocality: 'Mumbai',
    addressRegion: 'Maharashtra',
    postalCode: '400058',
    addressCountry: 'IN',
  },
};

/**
 * FAQ structured data (JSON-LD)
 * 
 * Provides search engines with FAQ content for rich snippets
 * Helps improve visibility in search results
 * 
 * @param faqs - Array of FAQ items with question and answer
 * @returns JSON-LD structured data object
 * 
 * Requirement: 15.3
 */
export function generateFAQSchema(
  faqs: Array<{ question: string; answer: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Breadcrumb structured data (JSON-LD)
 * 
 * Provides search engines with page hierarchy information
 * Helps improve navigation in search results
 * 
 * @param items - Array of breadcrumb items with name and URL
 * @returns JSON-LD structured data object
 * 
 * Requirement: 15.3
 */
export function generateBreadcrumbSchema(
  items: Array<{ name: string; url: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Convert structured data to JSON-LD string
 * 
 * Converts structured data object to JSON string for embedding in script tags
 * 
 * @param data - Structured data object
 * @returns JSON string for use in script tags
 */
export function structuredDataToJSON(data: object): string {
  return JSON.stringify(data);
}

/**
 * Page metadata configurations for all pages
 * 
 * Centralized metadata for consistency and easy updates
 * Each page has unique title and description for SEO
 * 
 * Requirements: 15.1, 15.2
 */
export const pageMetadata = {
  home: {
    title: 'Co-own Your Home with Friends | Fractional Home Ownership',
    description:
      'Turn rent into home ownership. Bhavan.ai enables 2-5 people to legally co-own residential homes through compliant SPVs. Get early access today.',
    path: '/',
    keywords: ['fractional ownership', 'co-living', 'home ownership', 'SPV formation'],
  },
  signup: {
    title: 'Get Early Access',
    description:
      'Join the waitlist for Bhavan.ai. Be among the first to experience fractional home ownership when we launch in your city.',
    path: '/signup',
    keywords: ['early access', 'waitlist', 'sign up', 'join'],
  },
  faq: {
    title: 'Frequently Asked Questions',
    description:
      'Find answers to common questions about Bhavan.ai, fractional home ownership, SPVs, financing, and the co-ownership process.',
    path: '/faq',
    keywords: ['FAQ', 'questions', 'help', 'support', 'how it works'],
  },
  privacy: {
    title: 'Privacy Policy',
    description:
      'Learn how Bhavan.ai collects, uses, and protects your personal information. Our commitment to data privacy and security.',
    path: '/privacy',
    keywords: ['privacy policy', 'data protection', 'GDPR', 'privacy'],
    noIndex: true,
  },
  terms: {
    title: 'Terms of Service',
    description:
      'Read the terms and conditions for using Bhavan.ai services. Legal agreements and user responsibilities.',
    path: '/terms',
    keywords: ['terms of service', 'legal', 'terms and conditions'],
    noIndex: true,
  },
  refund: {
    title: 'Refund Policy',
    description:
      'Bhavan.ai refund policy for platform services, SPV formation, and marketplace transactions. Learn about refund eligibility and processing.',
    path: '/refund',
    keywords: ['refund policy', 'refunds', 'money back', 'payment'],
    noIndex: true,
  },
  cancellation: {
    title: 'Cancellation Policy',
    description:
      'Bhavan.ai cancellation policy for services, subscriptions, and property transactions. Understand cancellation procedures and timelines.',
    path: '/cancellation',
    keywords: ['cancellation policy', 'cancel service', 'cancellation'],
    noIndex: true,
  },
};
