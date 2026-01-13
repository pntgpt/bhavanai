import type { Metadata } from 'next';
import { generatePageMetadata, pageMetadata } from '@/lib/seo';

/**
 * Terms of Service Page
 * 
 * Displays Bhavan.ai's terms of service governing the use of the platform.
 * Outlines user rights, responsibilities, and legal agreements.
 * 
 * Requirements: 11.1, 15.1, 15.2, 15.4
 */

export const metadata: Metadata = generatePageMetadata(pageMetadata.terms);

export default function TermsPage() {
  return (
    <main id="main-content" className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        {/* Header */}
        <div className="mb-12">
          <h1 className="font-serif font-bold text-4xl md:text-5xl text-gray-900 mb-4">
            Terms of Service
          </h1>
          <p className="font-sans text-gray-600 text-lg">
            Last updated: December 11, 2024
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="font-serif font-semibold text-2xl text-gray-900 mb-4">
              1. Acceptance of Terms
            </h2>
            <p className="font-sans text-gray-700 leading-relaxed mb-4">
              Welcome to Bhavan.ai. By accessing or using our website, platform, or services, you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our services.
            </p>
            <p className="font-sans text-gray-700 leading-relaxed">
              These Terms constitute a legally binding agreement between you and Bhavan.ai ("we," "our," or "us"). We reserve the right to modify these Terms at any time, and your continued use of our services constitutes acceptance of any changes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif font-semibold text-2xl text-gray-900 mb-4">
              2. Description of Services
            </h2>
            <p className="font-sans text-gray-700 leading-relaxed mb-4">
              Bhavan.ai is a platform that facilitates fractional home ownership by enabling 2-5 individuals to legally co-own residential properties through Special Purpose Vehicles (SPVs). Our services include:
            </p>
            <ul className="font-sans text-gray-700 leading-relaxed list-disc pl-6 mb-4 space-y-2">
              <li>Eligibility assessment and credit verification (KYC)</li>
              <li>Matching compatible co-owners based on preferences and financial profiles</li>
              <li>Digital SPV formation and legal documentation</li>
              <li>Facilitation of collective down payments and NBFC financing</li>
              <li>Secondary marketplace for buying and selling ownership shares</li>
              <li>Document vault and escrow services</li>
            </ul>
            <p className="font-sans text-gray-700 leading-relaxed">
              Bhavan.ai acts as a facilitator and technology platform. We do not provide financial advice, legal counsel, or real estate brokerage services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif font-semibold text-2xl text-gray-900 mb-4">
              3. Eligibility
            </h2>
            <p className="font-sans text-gray-700 leading-relaxed mb-4">
              To use our services, you must:
            </p>
            <ul className="font-sans text-gray-700 leading-relaxed list-disc pl-6 mb-4 space-y-2">
              <li>Be at least 18 years of age</li>
              <li>Be a resident of India or have legal authorization to own property in India</li>
              <li>Provide accurate and complete information during registration</li>
              <li>Have the legal capacity to enter into binding contracts</li>
              <li>Comply with all applicable laws and regulations</li>
            </ul>
            <p className="font-sans text-gray-700 leading-relaxed">
              We reserve the right to refuse service to anyone at our sole discretion.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif font-semibold text-2xl text-gray-900 mb-4">
              4. User Accounts and Registration
            </h2>
            <p className="font-sans text-gray-700 leading-relaxed mb-4">
              To access certain features, you may need to create an account. You agree to:
            </p>
            <ul className="font-sans text-gray-700 leading-relaxed list-disc pl-6 mb-4 space-y-2">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain and promptly update your account information</li>
              <li>Keep your password secure and confidential</li>
              <li>Notify us immediately of any unauthorized access to your account</li>
              <li>Accept responsibility for all activities under your account</li>
            </ul>
            <p className="font-sans text-gray-700 leading-relaxed">
              We reserve the right to suspend or terminate accounts that violate these Terms or engage in fraudulent activity.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif font-semibold text-2xl text-gray-900 mb-4">
              5. Fees and Payments
            </h2>
            <p className="font-sans text-gray-700 leading-relaxed mb-4">
              Bhavan.ai charges fees for its services, including but not limited to:
            </p>
            <ul className="font-sans text-gray-700 leading-relaxed list-disc pl-6 mb-4 space-y-2">
              <li><strong>Platform Fee:</strong> A percentage of the property value for facilitating SPV formation and matching</li>
              <li><strong>Marketplace Transaction Fee:</strong> A fee for buying or selling shares on the secondary marketplace</li>
              <li><strong>SPV Registration Fee:</strong> One-time fee for legal entity formation</li>
              <li><strong>SPV Management Fee:</strong> Annual fee for ongoing SPV administration and compliance</li>
            </ul>
            <p className="font-sans text-gray-700 leading-relaxed mb-4">
              All fees are clearly disclosed before you commit to any transaction. Fees are non-refundable unless otherwise stated. We reserve the right to change our fee structure with 30 days' notice.
            </p>
            <p className="font-sans text-gray-700 leading-relaxed">
              You are responsible for all taxes associated with your use of our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif font-semibold text-2xl text-gray-900 mb-4">
              6. SPV Formation and Co-Ownership
            </h2>
            <p className="font-sans text-gray-700 leading-relaxed mb-4">
              When you participate in fractional home ownership through Bhavan.ai:
            </p>
            <ul className="font-sans text-gray-700 leading-relaxed list-disc pl-6 mb-4 space-y-2">
              <li>You will become a member of a legally formed SPV with other co-owners</li>
              <li>Your ownership percentage is determined by your financial contribution</li>
              <li>All co-owners must agree to the SPV operating agreement</li>
              <li>Major decisions require consensus among co-owners as per the SPV agreement</li>
              <li>You are jointly and severally liable for SPV obligations, including loan repayments</li>
            </ul>
            <p className="font-sans text-gray-700 leading-relaxed">
              Bhavan.ai facilitates SPV formation but is not a party to the SPV or responsible for disputes among co-owners. We recommend consulting with legal and financial advisors before entering into co-ownership arrangements.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif font-semibold text-2xl text-gray-900 mb-4">
              7. Marketplace and Share Transfers
            </h2>
            <p className="font-sans text-gray-700 leading-relaxed mb-4">
              Our secondary marketplace allows co-owners to buy and sell ownership shares. By using the marketplace:
            </p>
            <ul className="font-sans text-gray-700 leading-relaxed list-disc pl-6 mb-4 space-y-2">
              <li>You agree to comply with all SPV transfer restrictions and right of first refusal provisions</li>
              <li>Share prices are determined by market forces and negotiations between parties</li>
              <li>All transfers must be approved by the SPV and comply with legal requirements</li>
              <li>Bhavan.ai facilitates transactions but does not guarantee liquidity or pricing</li>
              <li>Transaction fees apply to all marketplace activities</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-serif font-semibold text-2xl text-gray-900 mb-4">
              8. Prohibited Conduct
            </h2>
            <p className="font-sans text-gray-700 leading-relaxed mb-4">
              You agree not to:
            </p>
            <ul className="font-sans text-gray-700 leading-relaxed list-disc pl-6 mb-4 space-y-2">
              <li>Provide false, misleading, or fraudulent information</li>
              <li>Impersonate any person or entity</li>
              <li>Violate any applicable laws, regulations, or third-party rights</li>
              <li>Interfere with or disrupt the platform's operation or security</li>
              <li>Use automated systems (bots, scrapers) to access the platform</li>
              <li>Attempt to gain unauthorized access to our systems or user accounts</li>
              <li>Engage in money laundering, fraud, or other illegal activities</li>
              <li>Harass, threaten, or abuse other users or our staff</li>
            </ul>
            <p className="font-sans text-gray-700 leading-relaxed">
              Violation of these prohibitions may result in immediate termination of your account and legal action.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif font-semibold text-2xl text-gray-900 mb-4">
              9. Intellectual Property
            </h2>
            <p className="font-sans text-gray-700 leading-relaxed mb-4">
              All content on the Bhavan.ai platform, including text, graphics, logos, software, and trademarks, is owned by or licensed to Bhavan.ai and protected by intellectual property laws.
            </p>
            <p className="font-sans text-gray-700 leading-relaxed">
              You may not copy, modify, distribute, sell, or exploit any content without our express written permission. Limited use for personal, non-commercial purposes is permitted.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif font-semibold text-2xl text-gray-900 mb-4">
              10. Disclaimers and Limitations of Liability
            </h2>
            <p className="font-sans text-gray-700 leading-relaxed mb-4">
              <strong>No Warranties:</strong> Our services are provided "as is" and "as available" without warranties of any kind, express or implied. We do not guarantee uninterrupted, error-free, or secure access to our platform.
            </p>
            <p className="font-sans text-gray-700 leading-relaxed mb-4">
              <strong>Investment Risk:</strong> Real estate investments carry inherent risks, including loss of capital, market fluctuations, and illiquidity. Past performance does not guarantee future results. You are solely responsible for your investment decisions.
            </p>
            <p className="font-sans text-gray-700 leading-relaxed mb-4">
              <strong>No Financial or Legal Advice:</strong> Bhavan.ai does not provide financial, legal, or tax advice. Consult with qualified professionals before making investment decisions.
            </p>
            <p className="font-sans text-gray-700 leading-relaxed">
              <strong>Limitation of Liability:</strong> To the maximum extent permitted by law, Bhavan.ai and its affiliates, officers, employees, and agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our services, even if advised of the possibility of such damages. Our total liability shall not exceed the fees you paid to us in the 12 months preceding the claim.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif font-semibold text-2xl text-gray-900 mb-4">
              11. Indemnification
            </h2>
            <p className="font-sans text-gray-700 leading-relaxed">
              You agree to indemnify, defend, and hold harmless Bhavan.ai and its affiliates from any claims, liabilities, damages, losses, and expenses (including legal fees) arising from your use of our services, violation of these Terms, or infringement of any third-party rights.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif font-semibold text-2xl text-gray-900 mb-4">
              12. Dispute Resolution and Governing Law
            </h2>
            <p className="font-sans text-gray-700 leading-relaxed mb-4">
              These Terms are governed by the laws of India. Any disputes arising from these Terms or your use of our services shall be resolved through:
            </p>
            <ol className="font-sans text-gray-700 leading-relaxed list-decimal pl-6 mb-4 space-y-2">
              <li><strong>Negotiation:</strong> Good faith discussions between the parties</li>
              <li><strong>Mediation:</strong> If negotiation fails, mediation in Bangalore, India</li>
              <li><strong>Arbitration:</strong> Binding arbitration under the Indian Arbitration and Conciliation Act, 1996, conducted in Bangalore</li>
            </ol>
            <p className="font-sans text-gray-700 leading-relaxed">
              You agree to waive any right to a jury trial or to participate in class action lawsuits.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif font-semibold text-2xl text-gray-900 mb-4">
              13. Termination
            </h2>
            <p className="font-sans text-gray-700 leading-relaxed mb-4">
              We may suspend or terminate your access to our services at any time, with or without cause or notice, including for:
            </p>
            <ul className="font-sans text-gray-700 leading-relaxed list-disc pl-6 mb-4 space-y-2">
              <li>Violation of these Terms</li>
              <li>Fraudulent or illegal activity</li>
              <li>Non-payment of fees</li>
              <li>Inactivity for an extended period</li>
            </ul>
            <p className="font-sans text-gray-700 leading-relaxed">
              Upon termination, your right to use our services ceases immediately. Provisions that by their nature should survive termination (including disclaimers, limitations of liability, and dispute resolution) shall remain in effect.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif font-semibold text-2xl text-gray-900 mb-4">
              14. Modifications to Terms
            </h2>
            <p className="font-sans text-gray-700 leading-relaxed">
              We reserve the right to modify these Terms at any time. We will notify you of material changes by posting the updated Terms on our website and updating the "Last updated" date. Your continued use of our services after changes constitutes acceptance of the modified Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif font-semibold text-2xl text-gray-900 mb-4">
              15. Severability
            </h2>
            <p className="font-sans text-gray-700 leading-relaxed">
              If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions shall continue in full force and effect.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif font-semibold text-2xl text-gray-900 mb-4">
              16. Entire Agreement
            </h2>
            <p className="font-sans text-gray-700 leading-relaxed">
              These Terms, together with our Privacy Policy and any other agreements referenced herein, constitute the entire agreement between you and Bhavan.ai regarding your use of our services.
            </p>
          </section>

          <section>
            <h2 className="font-serif font-semibold text-2xl text-gray-900 mb-4">
              17. Contact Information
            </h2>
            <p className="font-sans text-gray-700 leading-relaxed mb-4">
              If you have questions about these Terms, please contact us:
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <p className="font-sans text-gray-700 mb-2">
                <strong>Email:</strong>{' '}
                <a href="mailto:legal@bhavan.ai" className="text-primary-600 hover:underline">
                  legal@bhavan.ai
                </a>
              </p>
              <p className="font-sans text-gray-700 mb-2">
                <strong>General Inquiries:</strong>{' '}
                <a href="mailto:info@bhavan.ai" className="text-primary-600 hover:underline">
                  info@bhavan.ai
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
