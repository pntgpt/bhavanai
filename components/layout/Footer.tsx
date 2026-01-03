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

        {/* Social Links and Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Social Icons */}
            <div className="flex space-x-6">
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
            </div>

            {/* Contact Email */}
            <div className="flex items-center space-x-2 text-sm">
              <Mail size={16} />
              <a
                href="mailto:hello@bhavan.ai"
                className="hover:text-white transition-colors"
              >
                hello@bhavan.ai
              </a>
            </div>

            {/* Copyright */}
            <div className="text-sm text-gray-400">
              © {new Date().getFullYear()} Bhavan.ai. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
