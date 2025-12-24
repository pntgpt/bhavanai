/**
 * WhatsApp Integration Utilities
 * 
 * Provides functions for generating WhatsApp redirect links with pre-populated messages.
 * Used for simplified signup flow where users are redirected to WhatsApp to express interest.
 * 
 * Requirements: 5.1, 5.5
 */

// Bhavan.ai WhatsApp business number (format: country code + number without + or spaces)
const WHATSAPP_BUSINESS_NUMBER = '919876543210'; // Replace with actual number

/**
 * Generates a WhatsApp link with pre-populated message
 * 
 * @param message - The message to pre-populate in WhatsApp
 * @returns WhatsApp web/app link with encoded message
 */
export function generateWhatsAppLink(message: string): string {
  const encodedMessage = encodeURIComponent(message);
  // Use wa.me for universal compatibility (works on mobile and desktop)
  return `https://wa.me/${WHATSAPP_BUSINESS_NUMBER}?text=${encodedMessage}`;
}

/**
 * Generates a default signup message for WhatsApp
 * 
 * @returns Pre-formatted message expressing interest in Bhavan.ai
 */
export function getSignupMessage(): string {
  return `Hi! I'm interested in learning more about Bhavan.ai and co-owning a home. Can you help me get started?`;
}

/**
 * Generates a property-specific inquiry message for WhatsApp
 * 
 * @param propertyId - The ID of the property
 * @param propertyAddress - The address of the property
 * @param propertyPrice - The price of the property
 * @returns Pre-formatted message with property details
 */
export function getPropertyInquiryMessage(
  propertyId: string,
  propertyAddress: string,
  propertyPrice: string
): string {
  return `Hi! I'm interested in the property at ${propertyAddress} (ID: ${propertyId}, Price: ${propertyPrice}). Can you provide more details about co-ownership opportunities for this property?`;
}

/**
 * Opens WhatsApp with pre-populated message
 * Works on both mobile and desktop by opening in new window/tab
 * 
 * @param message - The message to pre-populate
 */
export function openWhatsApp(message: string): void {
  const link = generateWhatsAppLink(message);
  window.open(link, '_blank', 'noopener,noreferrer');
}

/**
 * Opens WhatsApp with default signup message
 */
export function openWhatsAppSignup(): void {
  openWhatsApp(getSignupMessage());
}
