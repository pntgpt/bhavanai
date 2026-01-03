'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import Button from '../ui/Button';
import { trackCTAClick } from '@/lib/analytics';
import { openWhatsAppSignup } from '@/lib/whatsapp';
import { appendAffiliateId } from '@/lib/affiliate';

/**
 * Header component with sticky navigation and mobile menu
 * 
 * Features:
 * - Sticky positioning with background change on scroll
 * - Responsive mobile hamburger menu
 * - Smooth transitions and animations
 * - Accessible navigation with proper ARIA labels
 * - WhatsApp redirect for signup CTA
 * 
 * The header becomes opaque with a background when scrolled down,
 * and can optionally start transparent over hero sections
 * 
 * Requirements: 5.1, 5.5
 */

export interface HeaderProps {
  transparent?: boolean;
}

const Header: React.FC<HeaderProps> = ({ transparent = false }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Handle scroll event to change header background
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);

  // Determine header background based on scroll and transparent prop
  const headerBg = transparent && !isScrolled
    ? 'bg-transparent'
    : 'bg-white shadow-sm';

  const textColor = transparent && !isScrolled
    ? 'text-white'
    : 'text-gray-900';

  const navigation = [
    { name: 'Properties', href: '/properties' },
    { name: 'How It Works', href: '/#how-it-works' },
    { name: 'Features', href: '/#features' },
    { name: 'Pricing', href: '/#pricing' },
    { name: 'Team', href: '/#team' },
    { name: 'FAQ', href: '/faq' },
  ];

  /**
   * Handle signup CTA click - redirect to WhatsApp
   * Implements requirements 5.1, 5.5
   */
  const handleSignupClick = () => {
    trackCTAClick('header_signup_whatsapp', 'Get Early Access');
    openWhatsAppSignup();
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-normal ${headerBg}`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href={appendAffiliateId('/')} className={`text-2xl font-bold ${textColor} hover:opacity-80 transition-opacity`}>
              Bhavan.ai
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={appendAffiliateId(item.href)}
                className={`${textColor} hover:text-primary-600 transition-colors text-sm font-medium`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:block">
            <Button 
              variant="primary" 
              size="md"
              onClick={handleSignupClick}
            >
              Get Early Access
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`${textColor} hover:text-primary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 rounded p-2`}
              aria-label="Toggle mobile menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Slide-out */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 animate-fadeIn"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Menu Panel */}
          <div className="fixed top-0 right-0 bottom-0 w-64 bg-white shadow-xl animate-slideInRight">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <span className="text-xl font-bold text-gray-900">Menu</span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 rounded p-2"
                aria-label="Close mobile menu"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={appendAffiliateId(item.href)}
                  className="block text-gray-900 hover:text-primary-600 transition-colors text-base font-medium py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              <div className="pt-4 border-t border-gray-200">
                <Button 
                  variant="primary" 
                  size="md" 
                  className="w-full"
                  onClick={() => {
                    handleSignupClick();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Get Early Access
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
