'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';
import { openWhatsAppSignup } from '@/lib/whatsapp';

/**
 * Floating WhatsApp Contact Button
 * 
 * A fixed-position button that floats in the bottom-right corner of the screen.
 * Clicking the button opens WhatsApp with a pre-populated greeting message.
 * 
 * Features:
 * - Fixed positioning in bottom-right corner
 * - WhatsApp brand color (#25D366)
 * - Subtle pulse animation to draw attention
 * - Responsive sizing for mobile and desktop
 * - High z-index to stay on top of content
 * - Accessible with proper ARIA labels
 * - Smooth hover and active states
 * 
 * Requirements: New Feature (Task 27)
 */

export interface FloatingWhatsAppButtonProps {
  /**
   * Optional custom message to pre-populate in WhatsApp
   * If not provided, uses default signup message
   */
  message?: string;
  
  /**
   * Optional custom aria-label for accessibility
   */
  ariaLabel?: string;
}

const FloatingWhatsAppButton: React.FC<FloatingWhatsAppButtonProps> = ({
  message,
  ariaLabel = 'Contact us on WhatsApp',
}) => {
  const handleClick = () => {
    if (message) {
      const link = `https://wa.me/919876543210?text=${encodeURIComponent(message)}`;
      window.open(link, '_blank', 'noopener,noreferrer');
    } else {
      openWhatsAppSignup();
    }
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-[#25D366] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-normal hover:scale-110 active:scale-95 focus:outline-none focus:ring-4 focus:ring-[#25D366] focus:ring-opacity-50 animate-pulse-subtle"
      aria-label={ariaLabel}
      type="button"
    >
      <MessageCircle className="w-7 h-7 md:w-8 md:h-8" aria-hidden="true" />
    </button>
  );
};

export default FloatingWhatsAppButton;
