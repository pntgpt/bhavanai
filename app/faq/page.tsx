'use client';

import { useState, useMemo } from 'react';
import type { Metadata } from 'next';
import { generatePageMetadata, pageMetadata, generateFAQSchema } from '@/lib/seo';
import { ChevronDown, Search } from 'lucide-react';

/**
 * FAQ Page
 * 
 * Displays frequently asked questions about Bhavan.ai's fractional home ownership platform.
 * Organized by category for easy navigation.
 * Includes accordion/collapsible UI for better UX.
 * Includes search functionality to filter questions.
 * Includes structured data for SEO.
 * 
 * Requirements: 11.1, 15.1, 15.2, 15.3, 15.4
 */

// Note: metadata export removed due to 'use client' directive
// SEO metadata is handled in layout.tsx

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  title: string;
  items: FAQItem[];
}

const faqCategories: FAQCategory[] = [
  {
    title: 'General Questions',
    items: [
      {
        question: 'What is Bhavan.ai?',
        answer: 'Bhavan.ai is a platform that enables 2-5 people to legally co-own residential homes through compliant Special Purpose Vehicles (SPVs). We handle matching, SPV formation, financing facilitation, and provide a secondary marketplace for share trading.',
      },
      {
        question: 'How is this different from traditional home buying?',
        answer: 'Traditional home buying requires one person or family to afford the entire down payment and loan. With Bhavan.ai, 2-5 people pool resources to collectively own a property through an SPV, making home ownership more accessible and affordable.',
      },
      {
        question: 'Is fractional home ownership legal in India?',
        answer: 'Yes, fractional ownership through SPVs is completely legal in India. SPVs are recognized legal entities that can own property. We ensure all formations comply with Indian company law and real estate regulations.',
      },
      {
        question: 'Who is Bhavan.ai for?',
        answer: 'Bhavan.ai is ideal for renters who want to transition to home ownership but find traditional buying unaffordable. It\'s perfect for young professionals, friends, or compatible individuals who want to invest in real estate together.',
      },
    ],
  },
  {
    title: 'SPV and Co-Ownership',
    items: [
      {
        question: 'What is an SPV?',
        answer: 'A Special Purpose Vehicle (SPV) is a legal entity created for a specific purpose—in this case, to own a residential property. Each co-owner becomes a shareholder in the SPV, with ownership percentage based on their financial contribution.',
      },
      {
        question: 'How many people can co-own a property?',
        answer: 'Bhavan.ai facilitates co-ownership for 2-5 people. This range balances affordability with manageable decision-making and reduces complexity.',
      },
      {
        question: 'What happens if co-owners disagree?',
        answer: 'The SPV operating agreement includes dispute resolution mechanisms. Major decisions require consensus as defined in the agreement. If disputes cannot be resolved internally, mediation or arbitration procedures apply.',
      },
      {
        question: 'Can I choose my co-owners?',
        answer: 'Yes! Our matching algorithm suggests compatible co-owners based on financial profiles, preferences, and lifestyle. You have full control over who you partner with and can communicate before committing.',
      },
      {
        question: 'What are my responsibilities as a co-owner?',
        answer: 'As a co-owner, you\'re responsible for your share of the down payment, monthly loan EMIs, property maintenance costs, and property taxes. You also participate in major decisions about the property as outlined in the SPV agreement.',
      },
    ],
  },
  {
    title: 'Financing and Costs',
    items: [
      {
        question: 'How much do I need for a down payment?',
        answer: 'Down payments are typically 20-30% of the property value, split among co-owners based on ownership percentage. For example, if you\'re buying a ₹1 crore property with 4 co-owners (25% each), your down payment would be ₹5-7.5 lakhs.',
      },
      {
        question: 'Can I get a home loan through Bhavan.ai?',
        answer: 'Yes, we partner with NBFCs and banks to facilitate financing for SPVs. All co-owners are jointly liable for the loan, and approval depends on collective creditworthiness.',
      },
      {
        question: 'What fees does Bhavan.ai charge?',
        answer: 'We charge a platform fee (percentage of property value) for matching and SPV formation, a marketplace transaction fee for share trading, an SPV registration fee, and an annual SPV management fee for ongoing administration.',
      },
      {
        question: 'Are there ongoing costs after purchase?',
        answer: 'Yes, ongoing costs include monthly loan EMIs, property maintenance, property taxes, insurance, and the annual SPV management fee. These are shared among co-owners based on ownership percentage.',
      },
    ],
  },
  {
    title: 'Process and Timeline',
    items: [
      {
        question: 'How long does the process take?',
        answer: 'From eligibility check to moving in typically takes 2-4 months, depending on property selection, financing approval, and legal documentation. SPV formation itself takes 2-3 weeks.',
      },
      {
        question: 'What is the step-by-step process?',
        answer: '1) Complete eligibility check and KYC, 2) Get matched with compatible co-owners, 3) Select a property together, 4) Form the SPV and sign operating agreement, 5) Secure financing, 6) Complete property purchase, 7) Move in!',
      },
      {
        question: 'Do I need to meet my co-owners in person?',
        answer: 'While not required, we highly recommend meeting your co-owners before committing. Our platform facilitates virtual and in-person meetings to ensure compatibility.',
      },
      {
        question: 'What documents do I need?',
        answer: 'You\'ll need government-issued ID (Aadhaar, PAN), proof of income (salary slips, bank statements), address proof, and credit history. Additional documents may be required for financing.',
      },
    ],
  },
  {
    title: 'Exit and Marketplace',
    items: [
      {
        question: 'Can I sell my share later?',
        answer: 'Yes! Our secondary marketplace allows you to list and sell your ownership shares. Other co-owners typically have right of first refusal, and all transfers must comply with the SPV agreement.',
      },
      {
        question: 'How is the share price determined?',
        answer: 'Share prices are determined by market forces, property appreciation, outstanding loan balance, and negotiations between buyer and seller. We provide valuation guidance but don\'t set prices.',
      },
      {
        question: 'Is there a lock-in period?',
        answer: 'Lock-in periods vary by SPV agreement and financing terms. Typically, there\'s a minimum holding period of 1-2 years to ensure stability for all co-owners.',
      },
      {
        question: 'What if I want to buy out other co-owners?',
        answer: 'You can purchase additional shares from other co-owners through the marketplace, subject to financing approval and SPV agreement terms. You could eventually own 100% of the property.',
      },
      {
        question: 'What happens if a co-owner defaults on payments?',
        answer: 'The SPV agreement includes default provisions. Other co-owners may have the option to buy out the defaulting member\'s share, or the SPV may sell the property to settle obligations.',
      },
    ],
  },
  {
    title: 'Property and Living',
    items: [
      {
        question: 'Can I live in the property?',
        answer: 'Yes! Co-ownership through Bhavan.ai is designed for owner-occupied properties. Living arrangements are determined by the co-owners and outlined in the SPV agreement.',
      },
      {
        question: 'What types of properties are available?',
        answer: 'We focus on residential properties including apartments, villas, and townhouses in major Indian cities. Properties are selected based on location, amenities, and co-owner preferences.',
      },
      {
        question: 'Can we rent out the property?',
        answer: 'Rental decisions require consensus among co-owners as per the SPV agreement. Rental income is distributed based on ownership percentage after expenses.',
      },
      {
        question: 'Who handles property maintenance?',
        answer: 'Co-owners collectively decide on maintenance and repairs. For major decisions, the SPV agreement outlines voting procedures. Day-to-day maintenance can be managed by one co-owner or a property manager.',
      },
    ],
  },
  {
    title: 'Security and Legal',
    items: [
      {
        question: 'Is my investment secure?',
        answer: 'Real estate investments carry inherent risks. However, we implement security measures including legal SPV structures, escrow services, document vaults, and compliance with all regulations. Your ownership is legally protected.',
      },
      {
        question: 'What happens if Bhavan.ai shuts down?',
        answer: 'Your SPV and property ownership are independent of Bhavan.ai. If we cease operations, your SPV continues to exist, and you retain full ownership rights. Legal documents and property titles are held by the SPV, not by us.',
      },
      {
        question: 'How is my personal data protected?',
        answer: 'We comply with GDPR and Indian data protection laws. Your data is encrypted, stored securely, and never sold to third parties. See our Privacy Policy for details.',
      },
      {
        question: 'What legal protections do I have?',
        answer: 'You have all legal rights of a property owner through the SPV. The SPV operating agreement is a legally binding contract. Disputes are resolved through mediation or arbitration as outlined in our Terms of Service.',
      },
    ],
  },
];

/**
 * AccordionItem Component
 * 
 * Individual collapsible FAQ item with smooth animation
 */
interface AccordionItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}

function AccordionItem({ question, answer, isOpen, onToggle }: AccordionItemProps) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden transition-all">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-6 text-left bg-white hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset"
        aria-expanded={isOpen}
      >
        <h3 className="font-sans font-semibold text-lg text-gray-900 pr-4">
          {question}
        </h3>
        <ChevronDown
          size={24}
          className={`flex-shrink-0 text-primary-600 transition-transform duration-200 ${
            isOpen ? 'transform rotate-180' : ''
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ${
          isOpen ? 'max-h-96' : 'max-h-0'
        }`}
      >
        <div className="p-6 pt-0 bg-gray-50">
          <p className="font-sans text-gray-700 leading-relaxed">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function FAQPage() {
  // State for accordion items (track which items are open)
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  
  // State for search query
  const [searchQuery, setSearchQuery] = useState('');

  // Generate FAQ structured data for all questions
  const allFAQs = faqCategories.flatMap(category => category.items);
  const faqSchema = generateFAQSchema(allFAQs);

  /**
   * Toggle accordion item open/closed
   */
  const toggleItem = (categoryIndex: number, itemIndex: number) => {
    const key = `${categoryIndex}-${itemIndex}`;
    setOpenItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  /**
   * Filter FAQ categories based on search query
   */
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) {
      return faqCategories;
    }

    const query = searchQuery.toLowerCase();
    return faqCategories
      .map(category => ({
        ...category,
        items: category.items.filter(
          item =>
            item.question.toLowerCase().includes(query) ||
            item.answer.toLowerCase().includes(query)
        ),
      }))
      .filter(category => category.items.length > 0);
  }, [searchQuery]);

  /**
   * Clear search and reset view
   */
  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <main id="main-content" className="min-h-screen bg-white">
      {/* Structured Data for SEO - Requirement 15.3 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-serif font-bold text-4xl md:text-5xl text-gray-900 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="font-sans text-lg text-gray-600 max-w-2xl mx-auto">
            Everything you need to know about fractional home ownership with Bhavan.ai
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-12">
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search size={20} className="text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search FAQs..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-sans text-gray-900 placeholder-gray-400"
              aria-label="Search frequently asked questions"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Clear search"
              >
                <span className="text-sm font-medium">Clear</span>
              </button>
            )}
          </div>
          {searchQuery && (
            <p className="text-center mt-3 text-sm text-gray-600">
              {filteredCategories.reduce((sum, cat) => sum + cat.items.length, 0)} result(s) found
            </p>
          )}
        </div>

        {/* FAQ Categories with Accordion */}
        {filteredCategories.length > 0 ? (
          <div className="space-y-12">
            {filteredCategories.map((category, categoryIndex) => (
              <section key={categoryIndex}>
                <h2 className="font-serif font-semibold text-2xl text-gray-900 mb-6 pb-2 border-b-2 border-primary-500">
                  {category.title}
                </h2>
                <div className="space-y-4">
                  {category.items.map((item, itemIndex) => {
                    const key = `${categoryIndex}-${itemIndex}`;
                    return (
                      <AccordionItem
                        key={key}
                        question={item.question}
                        answer={item.answer}
                        isOpen={openItems.has(key)}
                        onToggle={() => toggleItem(categoryIndex, itemIndex)}
                      />
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="font-sans text-gray-600 text-lg mb-4">
              No FAQs found matching "{searchQuery}"
            </p>
            <button
              onClick={clearSearch}
              className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
            >
              Clear search and view all FAQs
            </button>
          </div>
        )}

        {/* Contact CTA */}
        <div className="mt-16 bg-primary-50 border border-primary-200 rounded-lg p-8 text-center">
          <h2 className="font-serif font-semibold text-2xl text-gray-900 mb-3">
            Still Have Questions?
          </h2>
          <p className="font-sans text-gray-700 mb-6">
            Can't find the answer you're looking for? Our team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/signup"
              className="inline-block bg-primary-600 text-white font-sans font-medium px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Get Early Access
            </a>
            <a
              href="mailto:hello@bhavan.ai"
              className="inline-block bg-white text-primary-600 border-2 border-primary-600 font-sans font-medium px-6 py-3 rounded-lg hover:bg-primary-50 transition-colors"
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
