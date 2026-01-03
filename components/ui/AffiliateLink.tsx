'use client';

import React from 'react';
import Link from 'next/link';
import type { LinkProps } from 'next/link';
import { appendAffiliateId } from '@/lib/affiliate';

/**
 * Custom Link component wrapper that automatically appends affiliate_id to URLs
 * 
 * This component wraps Next.js Link to preserve affiliate attribution across
 * all internal navigation. It automatically extracts the affiliate_id from the
 * current URL and appends it to the destination URL.
 * 
 * Usage:
 * ```tsx
 * import AffiliateLink from '@/components/ui/AffiliateLink';
 * 
 * <AffiliateLink href="/properties">View Properties</AffiliateLink>
 * ```
 * 
 * The component accepts all standard Next.js Link props and passes them through.
 * 
 * Requirements: 2.1 - Preserve affiliate_id parameter in all internal navigation links
 * Requirements: 2.2 - Append affiliate_id parameter to destination URLs
 */

export interface AffiliateLinkProps extends Omit<LinkProps, 'href'> {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  target?: string;
  rel?: string;
  'aria-label'?: string;
}

/**
 * AffiliateLink component that wraps Next.js Link with automatic affiliate_id preservation
 * 
 * @param props - Standard Next.js Link props plus additional HTML anchor attributes
 * @returns A Link component with affiliate_id automatically appended to the href
 */
const AffiliateLink: React.FC<AffiliateLinkProps> = ({
  href,
  children,
  className,
  onClick,
  target,
  rel,
  'aria-label': ariaLabel,
  ...linkProps
}) => {
  // Append affiliate_id to the href if present in current URL
  const enhancedHref = appendAffiliateId(href);

  return (
    <Link
      href={enhancedHref}
      className={className}
      onClick={onClick}
      target={target}
      rel={rel}
      aria-label={ariaLabel}
      {...linkProps}
    >
      {children}
    </Link>
  );
};

export default AffiliateLink;
