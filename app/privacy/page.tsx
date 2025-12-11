import type { Metadata } from 'next';

/**
 * Privacy Policy Page
 * 
 * Displays Bhavan.ai's privacy policy including GDPR and India data protection compliance.
 * Explains how user data is collected, processed, stored, and protected.
 * 
 * Requirements: 11.1
 */

export const metadata: Metadata = {
  title: 'Privacy Policy - Bhavan.ai',
  description: 'Learn how Bhavan.ai collects, uses, and protects your personal data in compliance with GDPR and Indian data protection laws.',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        {/* Header */}
        <div className="mb-12">
          <h1 className="font-serif font-bold text-4xl md:text-5xl text-gray-900 mb-4">
            Privacy Policy
          </h1>
          <p className="font-sans text-gray-600 text-lg">
            Last updated: December 11, 2024
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="font-serif font-semibold text-2xl text-gray-900 mb-4">
              1. Introduction
            </h2>
            <p className="font-sans text-gray-700 leading-relaxed mb-4">
              Bhavan.ai ("we," "our," or "us") is committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your data when you visit our website or use our services.
            </p>
            <p className="font-sans text-gray-700 leading-relaxed">
              This policy complies with the General Data Protection Regulation (GDPR) and the Information Technology Act, 2000, and the Personal Data Protection Bill of India.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif font-semibold text-2xl text-gray-900 mb-4">
              2. Information We Collect
            </h2>
            <p className="font-sans text-gray-700 leading-relaxed mb-4">
              We collect information that you provide directly to us, including:
            </p>
            <ul className="font-sans text-gray-700 leading-relaxed list-disc pl-6 mb-4 space-y-2">
              <li><strong>Personal Information:</strong> Name, email address, phone number, city of residence</li>
              <li><strong>Financial Information:</strong> Monthly rent, monthly salary, preferred co-owner count</li>
              <li><strong>Account Information:</strong> Age range, current living situation, housing preferences</li>
              <li><strong>Communication Data:</strong> Messages, inquiries, and feedback you send to us</li>
              <li><strong>Technical Data:</strong> IP address, browser type, device information, cookies, and usage data</li>
              <li><strong>Marketing Data:</strong> UTM parameters, campaign sources, and preferences for receiving communications</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-serif font-semibold text-2xl text-gray-900 mb-4">
              3. How We Use Your Information
            </h2>
            <p className="font-sans text-gray-700 leading-relaxed mb-4">
              We use the information we collect for the following purposes:
            </p>
            <ul className="font-sans text-gray-700 leading-relaxed list-disc pl-6 mb-4 space-y-2">
              <li>To assess your eligibility for fractional home ownership through our platform</li>
              <li>To match you with compatible co-owners based on your preferences</li>
              <li>To communicate with you about our services, updates, and promotional offers</li>
              <li>To process your applications and facilitate SPV formation</li>
              <li>To improve our website, services, and user experience</li>
              <li>To comply with legal obligations and prevent fraud</li>
              <li>To analyze usage patterns and optimize our marketing campaigns</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-serif font-semibold text-2xl text-gray-900 mb-4">
              4. Legal Basis for Processing (GDPR)
            </h2>
            <p className="font-sans text-gray-700 leading-relaxed mb-4">
              Under GDPR, we process your personal data based on the following legal grounds:
            </p>
            <ul className="font-sans text-gray-700 leading-relaxed list-disc pl-6 mb-4 space-y-2">
              <li><strong>Consent:</strong> You have given explicit consent for us to process your data for specific purposes</li>
              <li><strong>Contract:</strong> Processing is necessary to fulfill our contractual obligations to you</li>
              <li><strong>Legal Obligation:</strong> We must process your data to comply with legal requirements</li>
              <li><strong>Legitimate Interests:</strong> Processing is necessary for our legitimate business interests, provided your rights are not overridden</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-serif font-semibold text-2xl text-gray-900 mb-4">
              5. Data Sharing and Disclosure
            </h2>
            <p className="font-sans text-gray-700 leading-relaxed mb-4">
              We do not sell your personal information. We may share your data with:
            </p>
            <ul className="font-sans text-gray-700 leading-relaxed list-disc pl-6 mb-4 space-y-2">
              <li><strong>Service Providers:</strong> Third-party vendors who assist with operations (e.g., email services, analytics, CRM)</li>
              <li><strong>Financial Partners:</strong> NBFCs and financial institutions for loan processing and credit checks</li>
              <li><strong>Legal Authorities:</strong> When required by law or to protect our rights and safety</li>
              <li><strong>Potential Co-owners:</strong> With your consent, to facilitate matching and SPV formation</li>
              <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets</li>
            </ul>
            <p className="font-sans text-gray-700 leading-relaxed">
              All third parties are contractually obligated to protect your data and use it only for specified purposes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif font-semibold text-2xl text-gray-900 mb-4">
              6. Data Security
            </h2>
            <p className="font-sans text-gray-700 leading-relaxed mb-4">
              We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. These measures include:
            </p>
            <ul className="font-sans text-gray-700 leading-relaxed list-disc pl-6 mb-4 space-y-2">
              <li>Encryption of data in transit and at rest</li>
              <li>Regular security audits and vulnerability assessments</li>
              <li>Access controls and authentication mechanisms</li>
              <li>Employee training on data protection and privacy</li>
              <li>Secure data storage with reputable cloud providers</li>
            </ul>
            <p className="font-sans text-gray-700 leading-relaxed">
              However, no method of transmission over the internet is 100% secure. While we strive to protect your data, we cannot guarantee absolute security.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif font-semibold text-2xl text-gray-900 mb-4">
              7. Your Rights
            </h2>
            <p className="font-sans text-gray-700 leading-relaxed mb-4">
              Under GDPR and Indian data protection laws, you have the following rights:
            </p>
            <ul className="font-sans text-gray-700 leading-relaxed list-disc pl-6 mb-4 space-y-2">
              <li><strong>Right to Access:</strong> Request a copy of the personal data we hold about you</li>
              <li><strong>Right to Rectification:</strong> Request correction of inaccurate or incomplete data</li>
              <li><strong>Right to Erasure:</strong> Request deletion of your personal data ("right to be forgotten")</li>
              <li><strong>Right to Restrict Processing:</strong> Request limitation on how we use your data</li>
              <li><strong>Right to Data Portability:</strong> Receive your data in a structured, machine-readable format</li>
              <li><strong>Right to Object:</strong> Object to processing based on legitimate interests or direct marketing</li>
              <li><strong>Right to Withdraw Consent:</strong> Withdraw consent at any time where processing is based on consent</li>
            </ul>
            <p className="font-sans text-gray-700 leading-relaxed">
              To exercise any of these rights, please contact us at{' '}
              <a href="mailto:privacy@bhavan.ai" className="text-primary-600 hover:underline">
                privacy@bhavan.ai
              </a>
              . We will respond to your request within 30 days.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif font-semibold text-2xl text-gray-900 mb-4">
              8. Data Retention
            </h2>
            <p className="font-sans text-gray-700 leading-relaxed">
              We retain your personal data only for as long as necessary to fulfill the purposes outlined in this policy, unless a longer retention period is required by law. When data is no longer needed, we securely delete or anonymize it.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif font-semibold text-2xl text-gray-900 mb-4">
              9. Cookies and Tracking Technologies
            </h2>
            <p className="font-sans text-gray-700 leading-relaxed mb-4">
              We use cookies and similar tracking technologies to enhance your experience on our website. Cookies help us:
            </p>
            <ul className="font-sans text-gray-700 leading-relaxed list-disc pl-6 mb-4 space-y-2">
              <li>Remember your preferences and settings</li>
              <li>Analyze website traffic and usage patterns</li>
              <li>Track marketing campaign effectiveness</li>
              <li>Provide personalized content and advertisements</li>
            </ul>
            <p className="font-sans text-gray-700 leading-relaxed">
              You can control cookies through your browser settings. However, disabling cookies may affect website functionality.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif font-semibold text-2xl text-gray-900 mb-4">
              10. International Data Transfers
            </h2>
            <p className="font-sans text-gray-700 leading-relaxed">
              Your data may be transferred to and processed in countries outside of India. We ensure that such transfers comply with applicable data protection laws and that appropriate safeguards are in place, such as Standard Contractual Clauses approved by the European Commission.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif font-semibold text-2xl text-gray-900 mb-4">
              11. Children's Privacy
            </h2>
            <p className="font-sans text-gray-700 leading-relaxed">
              Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If you believe we have collected data from a child, please contact us immediately.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif font-semibold text-2xl text-gray-900 mb-4">
              12. Changes to This Policy
            </h2>
            <p className="font-sans text-gray-700 leading-relaxed">
              We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of significant changes by posting the updated policy on our website and updating the "Last updated" date. Your continued use of our services after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif font-semibold text-2xl text-gray-900 mb-4">
              13. Contact Us
            </h2>
            <p className="font-sans text-gray-700 leading-relaxed mb-4">
              If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <p className="font-sans text-gray-700 mb-2">
                <strong>Email:</strong>{' '}
                <a href="mailto:privacy@bhavan.ai" className="text-primary-600 hover:underline">
                  privacy@bhavan.ai
                </a>
              </p>
              <p className="font-sans text-gray-700 mb-2">
                <strong>General Inquiries:</strong>{' '}
                <a href="mailto:hello@bhavan.ai" className="text-primary-600 hover:underline">
                  hello@bhavan.ai
                </a>
              </p>
              <p className="font-sans text-gray-700">
                <strong>Address:</strong> Bhavan.ai, Bangalore, India
              </p>
            </div>
          </section>

          <section>
            <h2 className="font-serif font-semibold text-2xl text-gray-900 mb-4">
              14. Supervisory Authority
            </h2>
            <p className="font-sans text-gray-700 leading-relaxed">
              If you are located in the European Economic Area (EEA), you have the right to lodge a complaint with your local data protection authority if you believe we have not complied with applicable data protection laws.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
