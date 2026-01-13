'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Facebook, Twitter, Linkedin, Instagram, Mail } from 'lucide-react';
import Button from '../ui/Button';
import { trackCTAClick, trackDownload, trackExternalLink } from '@/lib/analytics';
import { appendAffiliateId } from '@/lib/affiliate';

/**
 * Footer component with multi-column layout
 * 
 * Features:
 * - Company, Product, Legal, and Social sections
 * - Newsletter signup form with validation
 * - Links to legal pages and downloadable resources
 * - Social media icons
 * - Responsive layout (stacked on mobile, columns on desktop)
 */

export interface FooterProps {
  onNewsletterSubmit?: (email: string) => Promise<void>;
}

const Footer: React.FC<FooterProps> = ({ onNewsletterSubmit }) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setSubmitStatus('error');
      return;
    }

    // Track newsletter CTA click
    trackCTAClick('footer_newsletter', 'Subscribe');

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      if (onNewsletterSubmit) {
        await onNewsletterSubmit(email);
      }
      setSubmitStatus('success');
      setEmail('');
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const companyLinks = [
    { name: 'About Us', href: '/#team' },
    { name: 'How It Works', href: '/#how-it-works' },
    { name: 'Roadmap', href: '/#roadmap' },
    { name: 'Contact', href: '/#contact' },
  ];

  const productLinks = [
    { name: 'Features', href: '/#features' },
    { name: 'Pricing', href: '/#pricing' },
    { name: 'Marketplace', href: '/#marketplace' },
  ];

  const legalLinks = [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Refund Policy', href: '/refund' },
    { name: 'Cancellation Policy', href: '/cancellation' },
    { name: 'FAQ', href: '/faq' },
  ];

  const resourceLinks = [
    { name: 'Press Kit', href: '/downloads/press-kit.pdf', download: true },
    { name: 'Investor Deck', href: '/downloads/investor-deck.pdf', download: true },
  ];

  const socialLinks = [
    { name: 'Facebook', href: 'https://facebook.com/bhavan.ai', icon: Facebook },
    { name: 'Twitter', href: 'https://twitter.com/bhavan_ai', icon: Twitter },
    { name: 'LinkedIn', href: 'https://linkedin.com/company/bhavan-ai', icon: Linkedin },
    { name: 'Instagram', href: 'https://instagram.com/bhavan.ai', icon: Instagram },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Column */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Company</h3>
            <ul className="space-y-2">
              {companyLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={appendAffiliateId(link.href)}
                    className="hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Product Column */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Product</h3>
            <ul className="space-y-2">
              {productLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={appendAffiliateId(link.href)}
                    className="hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Legal</h3>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={appendAffiliateId(link.href)}
                    className="hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Column */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Resources</h3>
            <ul className="space-y-2">
              {resourceLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    download={link.download}
                    className="hover:text-white transition-colors text-sm"
                    onClick={() => {
                      const fileType = link.href.split('.').pop() || 'pdf';
                      trackDownload(link.name, fileType);
                    }}
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Column */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Newsletter</h3>
            <p className="text-sm mb-4">
              Get updates about Bhavan.ai launches and features.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                aria-label="Email for newsletter"
              />
              <Button
                type="submit"
                variant="primary"
                size="sm"
                loading={isSubmitting}
                className="w-full"
              >
                Subscribe
              </Button>
              {submitStatus === 'success' && (
                <p className="text-success text-xs">Subscribed successfully!</p>
              )}
              {submitStatus === 'error' && (
                <p className="text-error text-xs">Please enter a valid email.</p>
              )}
            </form>
          </div>
        </div>

        {/* Social Links, Contact Info, and Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          {/* Contact Info and Social */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-6 md:space-y-0 mb-6">
            {/* Social Icons - Hidden until links are available */}
            {/* <div className="flex space-x-6">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                    aria-label={social.name}
                    onClick={() => trackExternalLink(social.href, social.name)}
                  >
                    <Icon size={20} />
                  </a>
                );
              })}
            </div> */}

            {/* Contact Info */}
            <div className="flex flex-col space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <Mail size={16} />
                <a
                  href="mailto:info@bhavan.ai"
                  className="hover:text-white transition-colors"
                >
                  info@bhavan.ai
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <a
                  href="tel:+918727812524"
                  className="hover:text-white transition-colors"
                >
                  +91 87278 12524
                </a>
              </div>
            </div>

            {/* Address */}
            <div className="text-sm text-gray-400 max-w-xs">
              <div className="flex items-start space-x-2">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>
                  306, Morya Grand, B3 Nr, Shalimar Morya Bldg., Andheri Railway Station, Mumbai, Mumbai-400058, Maharashtra
                </span>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="text-center text-sm text-gray-400 pt-6 border-t border-gray-800">
            © {new Date().getFullYear()} Bhavan.ai. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
