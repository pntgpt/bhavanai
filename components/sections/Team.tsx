'use client';

import React from 'react';
import Card from '@/components/ui/Card';
import { Linkedin, Mail } from 'lucide-react';

/**
 * Team Section Component
 * 
 * Displays founder and team member information:
 * - Photos with professional placeholder avatars
 * - Names and titles
 * - Short biographical descriptions
 * - Relevant credentials and experience
 * - LinkedIn profile links
 * - Contact form for inquiries
 * 
 * Builds trust with potential customers and partners by showcasing
 * the team's expertise and credibility.
 * 
 * Requirements: 10.1, 10.2, 10.4, 19.2
 */

export interface TeamMember {
  id: string;
  name: string;
  title: string;
  bio: string;
  credentials: string;
  photo: string;
  linkedIn?: string;
}

export interface TeamProps {
  members?: TeamMember[];
  onContactClick?: () => void;
}

const defaultMembers: TeamMember[] = [
  {
    id: 'founder-1',
    name: 'Priya Sharma',
    title: 'Co-Founder & CEO',
    bio: 'Former product lead at a leading proptech startup. Passionate about making home ownership accessible to everyone.',
    credentials: 'MBA from IIM Bangalore, 8+ years in real estate technology',
    photo: '/images/team/placeholder-1.jpg',
    linkedIn: 'https://linkedin.com/in/priya-sharma',
  },
  {
    id: 'founder-2',
    name: 'Rahul Verma',
    title: 'Co-Founder & CTO',
    bio: 'Tech entrepreneur with expertise in fintech and blockchain. Previously built scalable platforms at major tech companies.',
    credentials: 'B.Tech from IIT Delhi, Former Engineering Lead at Razorpay',
    photo: '/images/team/placeholder-2.jpg',
    linkedIn: 'https://linkedin.com/in/rahul-verma',
  },
  {
    id: 'founder-3',
    name: 'Anjali Mehta',
    title: 'Co-Founder & COO',
    bio: 'Legal and compliance expert specializing in SPVs and real estate law. Ensures all operations are fully compliant.',
    credentials: 'LLB from National Law School, 10+ years in corporate law',
    photo: '/images/team/placeholder-3.jpg',
    linkedIn: 'https://linkedin.com/in/anjali-mehta',
  },
];

const Team: React.FC<TeamProps> = ({
  members = defaultMembers,
  onContactClick,
}) => {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-serif font-bold text-4xl md:text-5xl text-gray-900 mb-4">
            Meet the Team
          </h2>
          <p className="font-sans text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Experienced founders committed to revolutionizing home ownership in India
          </p>
        </div>

        {/* Team Member Cards - Requirements 10.1, 10.2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {members.map((member) => (
            <Card key={member.id} variant="team" hover>
              {/* Photo - Requirement 19.2 */}
              <div className="mb-6 flex justify-center">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center overflow-hidden">
                  {/* Placeholder avatar with initials */}
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-white font-sans font-bold text-3xl">
                      {member.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Name */}
              <h3 className="font-serif font-semibold text-xl text-gray-900 mb-1 text-center">
                {member.name}
              </h3>

              {/* Title */}
              <p className="font-sans text-primary-600 font-medium mb-4 text-center">
                {member.title}
              </p>

              {/* Bio */}
              <p className="font-sans text-gray-600 leading-relaxed mb-4 text-center">
                {member.bio}
              </p>

              {/* Credentials - Requirement 10.2 */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
                <p className="font-sans text-sm text-gray-700 text-center">
                  {member.credentials}
                </p>
              </div>

              {/* LinkedIn Link */}
              {member.linkedIn && (
                <div className="flex justify-center">
                  <a
                    href={member.linkedIn}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-sans font-medium text-sm transition-colors"
                    aria-label={`View ${member.name}'s LinkedIn profile`}
                  >
                    <Linkedin className="w-5 h-5" aria-hidden="true" />
                    <span>Connect on LinkedIn</span>
                  </a>
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Contact Section - Requirement 10.4 */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <div className="mb-4 flex justify-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-primary-600" aria-hidden="true" />
              </div>
            </div>

            <h3 className="font-serif font-semibold text-2xl text-gray-900 mb-3">
              Get in Touch
            </h3>

            <p className="font-sans text-gray-600 mb-6 leading-relaxed">
              Have questions about Bhavan.ai? Want to partner with us? 
              We'd love to hear from you.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {/* Contact Form Button */}
              {onContactClick && (
                <button
                  onClick={onContactClick}
                  className="bg-primary-600 text-white font-sans font-medium px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
                  aria-label="Open contact form"
                >
                  Send us a message
                </button>
              )}

              {/* Direct Email Link */}
              <a
                href="mailto:hello@bhavan.ai"
                className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-sans font-medium transition-colors"
                aria-label="Email us at hello@bhavan.ai"
              >
                <Mail className="w-5 h-5" aria-hidden="true" />
                <span>hello@bhavan.ai</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Team;
