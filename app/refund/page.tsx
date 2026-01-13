import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo';

/**
 * Refund Policy Page
 * 
 * Displays Bhavan.ai's refund policy for services and transactions.
 * Outlines conditions for refunds, processing times, and exceptions.
 */

export const metadata: Metadata = generatePageMetadata({
  title: 'Refund Policy',
  description: 'Bhavan.ai refund policy for platform services, SPV formation, and marketplace transactions.',
  path: '/refund',
});

export default function RefundPage() {
  return (
    <main id="main-content" className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        {/* Header */}
        <div className="mb-12">
          <h1 className="font-serif font-bold text-4xl md:text-5xl text-gray-900 mb-4">
            Refund Policy
          </h1>
          <p className="font-sans text-gray-600 text-lg">
            Last updated: January 13, 2026
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="font-serif font-semibold text-2xl text-gray-900 mb-4">
              1. Overview
            </h2>
            <p className="font-sans text-gray-700 leading-relaxed mb-4">
              At Bhavan.ai, we strive to provide exceptional service in facilitating fractional home ownership. This Refund Policy outlines the circumstances under which refunds may be issued for fees paid to Bhavan.ai.
            </p>
            <p className="font-sans text-gray-700 leading-relaxed">
              Please read this policy carefully before making any payments. By using our services, you acknowledge and agree to this Refund Policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif font-semibold text-2xl text-gray-900 mb-4">
              2. Refundable Services
            </h2>
            <p className="font-sans text-gray-700 leading-relaxed mb-4">
              The following services may be eligible for refunds under specific conditions:
            </p>
            <ul className="font-sans text-gray-700 leading-relaxed list-disc pl-6 mb-4 space-y-2">
              <li><strong>Platform Registration Fee:</strong> Refundable within 7 days if no services have been utilized</li>
              <li><strong>KYC and Eligibility Assessment Fee:</strong> Refundable if the assessment cannot be completed due to technical issues on our end</li>
              <li><strong>Co-owner Matching Service:</strong> Partial refund available if no suitable matches are found within 90 days</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-serif font-semibold text-2xl text-gray-900 mb-4">
              3. Non-Refundable Services
            </h2>
            <p className="font-sans text-gray-700 leading-relaxed mb-4">
              The following fees are non-refundable once services have been initiated:
            </p>
            <ul className="font-sans text-gray-700 leading-relaxed list-disc pl-6 mb-4 space-y-2">
              <li><strong>SPV Formation Fee:</strong> Non-refundable once legal documentation has been initiated</li>
              <li><strong>SPV Registration Fee:</strong> Non-refundable after submission to regulatory authorities</li>
              <li><strong>Marketplace Transaction Fee:</strong> Non-refundable once a transaction is completed</li>
              <li><strong>SPV Management Fee:</strong> Non-refundable for the current billing period</li>
              <li><strong>Legal Documentation Fee:</strong> Non-refundable once documents have been prepared</li>
              <li><strong>Third-Party Service Fees:</strong> Fees paid to external service providers (credit bureaus, legal firms, etc.) are non-refundable</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-serif font-semibold text-2xl text-gray-900 mb-4">
              4. Property Purchase and Down Payments
            </h2>
            <p className="font-sans text-gray-700 leading-relaxed mb-4">
              <strong>Down Payments:</strong> Down payments made toward property purchases are held in escrow and are subject to the terms of the purchase agreement between the SPV and the property seller. Refund eligibility depends on:
            </p>
            <ul className="font-sans text-gray-700 leading-relaxed list-disc pl-6 mb-4 space-y-2">
              <li>The property purchase agreement terms</li>
              <li>Seller's refund policy</li>
              <li>Reason for transaction cancellation</li>
              <li>Stage of the transaction at the time of cancellation</li>
            </ul>
            <p className="font-sans text-gray-700 leading-relaxed">
              Bhavan.ai will facilitate the refund process according to the purchase agreement, but we are not responsible for seller refund policies or delays.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif font-semibold text-2xl text-gray-900 mb-4">
              5. Refund Request Process
            </h2>
            <p className="font-sans text-gray-700 leading-relaxed mb-4">
              To request a refund, please follow these steps:
            </p>
            <ol className="font-sans text-gray-700 leading-relaxed list-decimal pl-6 mb-4 space-y-2">
              <li>Contact our support team at{' '}
                <a href="mailto:support@bhavan.ai" className="text-primary-600 hover:underline">
                  support@bhavan.ai
                </a>
              </li>
              <li>Provide your account details, transaction ID, and reason for the refund request</li>
              <li>Include any supporting documentation (receipts, correspondence, etc.)</li>
              <li>Our team will review your request within 5-7 business days</li>
              <li>You will receive a decision via email with an explanation</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="font-serif font-semibold text-2xl text-gray-900 mb-4">
              6. Refund Processing Time
            </h2>
            <p className="font-sans text-gray-700 leading-relaxed mb-4">
              Once a refund is approved:
            </p>
            <ul className="font-sans text-gray-700 leading-relaxed list-disc pl-6 mb-4 space-y-2">
              <li><strong>Credit/Debit Card:</strong> 7-10 business days</li>
              <li><strong>Bank Transfer:</strong> 5-7 business days</li>
              <li><strong>UPI:</strong> 3-5 business days</li>
              <li><strong>Digital Wallet:</strong> 3-5 business days</li>
            </ul>
            <p className="font-sans text-gray-700 leading-relaxed">
              Processing times may vary depending on your financial institution. Bhavan.ai is not responsible for delays caused by banks or payment processors.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif font-semibold text-2xl text-gray-900 mb-4">
              7. Partial Refunds
            </h2>
            <p className="font-sans text-gray-700 leading-relaxed">
              In certain circumstances, partial refunds may be issued based on the extent of services rendered. The refund amount will be calculated proportionally based on the work completed and resources utilized.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif font-semibold text-2xl text-gray-900 mb-4">
              8. Exceptional Circumstances
            </h2>
            <p className="font-sans text-gray-700 leading-relaxed mb-4">
              Refunds may be considered outside of this policy in exceptional circumstances, including:
            </p>
            <ul className="font-sans text-gray-700 leading-relaxed list-disc pl-6 mb-4 space-y-2">
              <li>Technical errors resulting in duplicate charges</li>
              <li>Service failures due to platform issues</li>
              <li>Unauthorized transactions (subject to investigation)</li>
              <li>Force majeure events preventing service delivery</li>
            </ul>
            <p className="font-sans text-gray-700 leading-relaxed">
              Each case will be reviewed individually, and decisions will be made at Bhavan.ai's sole discretion.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif font-semibold text-2xl text-gray-900 mb-4">
              9. Chargebacks and Disputes
            </h2>
            <p className="font-sans text-gray-700 leading-relaxed mb-4">
              If you initiate a chargeback or payment dispute with your financial institution without first contacting us:
            </p>
            <ul className="font-sans text-gray-700 leading-relaxed list-disc pl-6 mb-4 space-y-2">
              <li>Your account may be suspended pending resolution</li>
              <li>We reserve the right to provide evidence to your financial institution</li>
              <li>Unjustified chargebacks may result in account termination</li>
              <li>You may be liable for chargeback fees and legal costs</li>
            </ul>
            <p className="font-sans text-gray-700 leading-relaxed">
              We encourage you to contact us directly to resolve any payment issues before initiating a chargeback.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif font-semibold text-2xl text-gray-900 mb-4">
              10. Changes to This Policy
            </h2>
            <p className="font-sans text-gray-700 leading-relaxed">
              We reserve the right to modify this Refund Policy at any time. Changes will be posted on this page with an updated "Last updated" date. Your continued use of our services after changes constitutes acceptance of the modified policy.
            </p>
          </section>

          <section>
            <h2 className="font-serif font-semibold text-2xl text-gray-900 mb-4">
              11. Contact Us
            </h2>
            <p className="font-sans text-gray-700 leading-relaxed mb-4">
              For refund requests or questions about this policy, please contact us:
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <p className="font-sans text-gray-700 mb-2">
                <strong>Email:</strong>{' '}
                <a href="mailto:support@bhavan.ai" className="text-primary-600 hover:underline">
                  support@bhavan.ai
                </a>
              </p>
              <p className="font-sans text-gray-700 mb-2">
                <strong>Phone:</strong>{' '}
                <a href="tel:+918727812524" className="text-primary-600 hover:underline">
                  +91 87278 12524
                </a>
              </p>
              <p className="font-sans text-gray-700">
                <strong>Address:</strong> 306, Morya Grand, B3 Nr, Shalimar Morya Bldg., Andheri Railway Station, Mumbai, Mumbai-400058, Maharashtra
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
