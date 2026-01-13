import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo';

/**
 * Cancellation Policy Page
 * 
 * Displays Bhavan.ai's cancellation policy for services, subscriptions, and transactions.
 * Outlines cancellation procedures, timelines, and consequences.
 */

export const metadata: Metadata = generatePageMetadata({
  title: 'Cancellation Policy',
  description: 'Bhavan.ai cancellation policy for platform services, SPV memberships, and property transactions.',
  path: '/cancellation',
});

export default function CancellationPage() {
  return (
    <main id="main-content" className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        {/* Header */}
        <div className="mb-12">
          <h1 className="font-serif font-bold text-4xl md:text-5xl text-gray-900 mb-4">
            Cancellation Policy
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
              This Cancellation Policy outlines the terms and conditions for canceling services, subscriptions, and transactions on the Bhavan.ai platform. We understand that circumstances change, and we aim to provide clear guidelines for cancellation procedures.
            </p>
            <p className="font-sans text-gray-700 leading-relaxed">
              Please review this policy carefully before engaging with our services. By using Bhavan.ai, you agree to the terms outlined in this policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif font-semibold text-2xl text-gray-900 mb-4">
              2. Account Cancellation
            </h2>
            <p className="font-sans text-gray-700 leading-relaxed mb-4">
              You may cancel your Bhavan.ai account at any time by:
            </p>
            <ul className="font-sans text-gray-700 leading-relaxed list-disc pl-6 mb-4 space-y-2">
              <li>Logging into your account and selecting "Delete Account" in settings</li>
              <li>Contacting our support team at{' '}
                <a href="mailto:support@bhavan.ai" className="text-primary-600 hover:underline">
                  support@bhavan.ai
                </a>
              </li>
            </ul>
            <p className="font-sans text-gray-700 leading-relaxed mb-4">
              <strong>Important Notes:</strong>
            </p>
            <ul className="font-sans text-gray-700 leading-relaxed list-disc pl-6 mb-4 space-y-2">
              <li>Account cancellation does not automatically cancel active SPV memberships or property transactions</li>
              <li>You must fulfill all outstanding obligations before account deletion</li>
              <li>Personal data will be retained as required by law and our Privacy Policy</li>
              <li>Account cancellation is irreversible after 30 days</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-serif font-semibold text-2xl text-gray-900 mb-4">
              3. Service Cancellation
            </h2>
            
            <h3 className="font-serif font-semibold text-xl text-gray-900 mb-3 mt-6">
              3.1 Eligibility Assessment and Matching Services
            </h3>
            <ul className="font-sans text-gray-700 leading-relaxed list-disc pl-6 mb-4 space-y-2">
              <li><strong>Cancellation Window:</strong> Within 7 days of payment</li>
              <li><strong>Conditions:</strong> No services have been utilized or reports generated</li>
              <li><strong>Refund:</strong> Full refund minus processing fees</li>
              <li><strong>Process:</strong> Email request to{' '}
                <a href="mailto:support@bhavan.ai" className="text-primary-600 hover:underline">
                  support@bhavan.ai
                </a>
              </li>
            </ul>

            <h3 className="font-serif font-semibold text-xl text-gray-900 mb-3 mt-6">
              3.2 SPV Formation Services
            </h3>
            <ul className="font-sans text-gray-700 leading-relaxed list-disc pl-6 mb-4 space-y-2">
              <li><strong>Before Documentation:</strong> Cancellable with 50% refund</li>
              <li><strong>After Documentation Started:</strong> Non-cancellable, but you may pause for up to 90 days</li>
              <li><strong>After Registration Submission:</strong> Non-cancellable</li>
            </ul>

            <h3 className="font-serif font-semibold text-xl text-gray-900 mb-3 mt-6">
              3.3 SPV Management Subscription
            </h3>
            <ul className="font-sans text-gray-700 leading-relaxed list-disc pl-6 mb-4 space-y-2">
              <li><strong>Cancellation Notice:</strong> 30 days advance notice required</li>
              <li><strong>Effective Date:</strong> End of current billing period</li>
              <li><strong>Refund:</strong> No refund for unused portion of current period</li>
              <li><strong>Consequences:</strong> SPV compliance and administrative support will cease</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-serif font-semibold text-2xl text-gray-900 mb-4">
              4. Property Transaction Cancellation
            </h2>
            
            <h3 className="font-serif font-semibold text-xl text-gray-900 mb-3 mt-6">
              4.1 Before Down Payment
            </h3>
            <p className="font-sans text-gray-700 leading-relaxed mb-4">
              You may cancel your participation in a property purchase before making a down payment with no penalty. Platform fees paid for matching and SPV formation may be subject to our Refund Policy.
            </p>

            <h3 className="font-serif font-semibold text-xl text-gray-900 mb-3 mt-6">
              4.2 After Down Payment (Cooling-Off Period)
            </h3>
            <ul className="font-sans text-gray-700 leading-relaxed list-disc pl-6 mb-4 space-y-2">
              <li><strong>Cooling-Off Period:</strong> 14 days from down payment</li>
              <li><strong>Conditions:</strong> Property inspection not yet completed</li>
              <li><strong>Refund:</strong> Full down payment minus earnest money (as per purchase agreement)</li>
              <li><strong>Platform Fees:</strong> Non-refundable</li>
            </ul>

            <h3 className="font-serif font-semibold text-xl text-gray-900 mb-3 mt-6">
              4.3 After Cooling-Off Period
            </h3>
            <p className="font-sans text-gray-700 leading-relaxed mb-4">
              Cancellation after the cooling-off period is subject to:
            </p>
            <ul className="font-sans text-gray-700 leading-relaxed list-disc pl-6 mb-4 space-y-2">
              <li>Terms of the property purchase agreement</li>
              <li>Seller's cancellation policy</li>
              <li>Agreement of all SPV co-owners</li>
              <li>Potential forfeiture of earnest money and down payment</li>
            </ul>

            <h3 className="font-serif font-semibold text-xl text-gray-900 mb-3 mt-6">
              4.4 Loan Approval Contingency
            </h3>
            <p className="font-sans text-gray-700 leading-relaxed">
              If the SPV's loan application is rejected by all partner NBFCs, you may cancel the transaction with a full refund of the down payment (minus any non-refundable earnest money as per the purchase agreement).
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif font-semibold text-2xl text-gray-900 mb-4">
              5. SPV Membership Exit
            </h2>
            <p className="font-sans text-gray-700 leading-relaxed mb-4">
              Exiting an SPV after property purchase requires:
            </p>
            <ul className="font-sans text-gray-700 leading-relaxed list-disc pl-6 mb-4 space-y-2">
              <li><strong>Finding a Replacement:</strong> You must find a qualified buyer for your share</li>
              <li><strong>Co-owner Approval:</strong> All remaining co-owners must approve the new member</li>
              <li><strong>Right of First Refusal:</strong> Existing co-owners have priority to purchase your share</li>
              <li><strong>Lender Approval:</strong> NBFC must approve the transfer if a loan is outstanding</li>
              <li><strong>Transfer Fees:</strong> Marketplace transaction fees apply</li>
              <li><strong>Legal Documentation:</strong> SPV operating agreement must be updated</li>
            </ul>
            <p className="font-sans text-gray-700 leading-relaxed">
              <strong>Note:</strong> You remain liable for SPV obligations until the transfer is legally completed and approved by all parties.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif font-semibold text-2xl text-gray-900 mb-4">
              6. Marketplace Transaction Cancellation
            </h2>
            <ul className="font-sans text-gray-700 leading-relaxed list-disc pl-6 mb-4 space-y-2">
              <li><strong>Before Agreement:</strong> Either party may cancel negotiations at any time</li>
              <li><strong>After Agreement, Before Payment:</strong> Cancellation requires mutual consent</li>
              <li><strong>After Payment:</strong> Non-cancellable; transaction must be completed</li>
              <li><strong>Dispute Resolution:</strong> Mediation available through Bhavan.ai</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-serif font-semibold text-2xl text-gray-900 mb-4">
              7. Cancellation by Bhavan.ai
            </h2>
            <p className="font-sans text-gray-700 leading-relaxed mb-4">
              Bhavan.ai reserves the right to cancel services or terminate accounts in the following circumstances:
            </p>
            <ul className="font-sans text-gray-700 leading-relaxed list-disc pl-6 mb-4 space-y-2">
              <li>Violation of Terms of Service</li>
              <li>Fraudulent activity or misrepresentation</li>
              <li>Non-payment of fees</li>
              <li>Failure to meet eligibility requirements</li>
              <li>Breach of SPV operating agreement</li>
              <li>Legal or regulatory requirements</li>
            </ul>
            <p className="font-sans text-gray-700 leading-relaxed">
              In such cases, refunds will be issued at Bhavan.ai's discretion based on the circumstances and services rendered.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif font-semibold text-2xl text-gray-900 mb-4">
              8. Force Majeure
            </h2>
            <p className="font-sans text-gray-700 leading-relaxed">
              In the event of force majeure (natural disasters, pandemics, government actions, etc.), either party may cancel services without penalty. Refunds will be provided on a pro-rata basis for services not yet rendered.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif font-semibold text-2xl text-gray-900 mb-4">
              9. Cancellation Request Process
            </h2>
            <p className="font-sans text-gray-700 leading-relaxed mb-4">
              To cancel a service or transaction:
            </p>
            <ol className="font-sans text-gray-700 leading-relaxed list-decimal pl-6 mb-4 space-y-2">
              <li>Review the applicable cancellation terms for your specific service</li>
              <li>Submit a cancellation request via email to{' '}
                <a href="mailto:support@bhavan.ai" className="text-primary-600 hover:underline">
                  support@bhavan.ai
                </a>
              </li>
              <li>Include your account details, service/transaction ID, and reason for cancellation</li>
              <li>Provide any required documentation</li>
              <li>Our team will review and respond within 3-5 business days</li>
              <li>Follow any additional steps provided by our team</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="font-serif font-semibold text-2xl text-gray-900 mb-4">
              10. Consequences of Cancellation
            </h2>
            <p className="font-sans text-gray-700 leading-relaxed mb-4">
              Depending on the service cancelled, you may experience:
            </p>
            <ul className="font-sans text-gray-700 leading-relaxed list-disc pl-6 mb-4 space-y-2">
              <li>Loss of access to platform features and services</li>
              <li>Forfeiture of non-refundable fees</li>
              <li>Potential financial penalties as per agreements</li>
              <li>Impact on credit score (for loan-related cancellations)</li>
              <li>Legal obligations to co-owners and lenders</li>
              <li>Loss of property ownership rights</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-serif font-semibold text-2xl text-gray-900 mb-4">
              11. Changes to This Policy
            </h2>
            <p className="font-sans text-gray-700 leading-relaxed">
              We reserve the right to modify this Cancellation Policy at any time. Changes will be posted on this page with an updated "Last updated" date. Your continued use of our services after changes constitutes acceptance of the modified policy.
            </p>
          </section>

          <section>
            <h2 className="font-serif font-semibold text-2xl text-gray-900 mb-4">
              12. Contact Us
            </h2>
            <p className="font-sans text-gray-700 leading-relaxed mb-4">
              For cancellation requests or questions about this policy, please contact us:
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
