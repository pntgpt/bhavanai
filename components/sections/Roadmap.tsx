'use client';

import React from 'react';
import { CheckCircle2, Circle, Clock } from 'lucide-react';

/**
 * Roadmap Section Component
 * 
 * Displays a 6-month timeline with key milestones and phases:
 * - Visual timeline showing progression
 * - Major feature releases and phases
 * - Brief descriptions of each milestone
 * - Current stage indicator
 * 
 * Helps early adopters understand when features will be available
 * and demonstrates clear product development plan.
 * 
 * Requirements: 9.1, 9.2, 9.4, 9.5
 */

export interface Milestone {
  id: number;
  title: string;
  description: string;
  quarter: string;
  status: 'completed' | 'in-progress' | 'planned';
}

export interface RoadmapProps {
  milestones?: Milestone[];
  currentPhase?: number;
}

const defaultMilestones: Milestone[] = [
  {
    id: 1,
    title: 'Platform Foundation',
    description: 'Core infrastructure, KYC integration, and legal framework setup. SPV formation process digitized.',
    quarter: 'Q1 2024',
    status: 'completed',
  },
  {
    id: 2,
    title: 'Beta Launch',
    description: 'Pilot program with first cohort of co-owners in Bangalore. Testing matching algorithm and SPV creation.',
    quarter: 'Q2 2024',
    status: 'in-progress',
  },
  {
    id: 3,
    title: 'NBFC Partnerships',
    description: 'Finalize financing partnerships with NBFCs. Launch collective down payment and loan processing.',
    quarter: 'Q2 2024',
    status: 'in-progress',
  },
  {
    id: 4,
    title: 'Marketplace Launch',
    description: 'Secondary market goes live. Co-owners can list and trade shares with transparent pricing.',
    quarter: 'Q3 2024',
    status: 'planned',
  },
  {
    id: 5,
    title: 'Multi-City Expansion',
    description: 'Expand to Mumbai and Delhi NCR. Scale operations and onboard more properties.',
    quarter: 'Q3 2024',
    status: 'planned',
  },
  {
    id: 6,
    title: 'Advanced Features',
    description: 'Property management integration, automated rent collection, and enhanced analytics dashboard.',
    quarter: 'Q4 2024',
    status: 'planned',
  },
];

const Roadmap: React.FC<RoadmapProps> = ({
  milestones = defaultMilestones,
  currentPhase = 2,
}) => {
  /**
   * Get icon component based on milestone status
   */
  const getStatusIcon = (status: Milestone['status']) => {
    switch (status) {
      case 'completed':
        return CheckCircle2;
      case 'in-progress':
        return Clock;
      case 'planned':
        return Circle;
      default:
        return Circle;
    }
  };

  /**
   * Get color classes based on milestone status
   */
  const getStatusColor = (status: Milestone['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'in-progress':
        return 'text-primary-600 bg-primary-100';
      case 'planned':
        return 'text-gray-400 bg-gray-100';
      default:
        return 'text-gray-400 bg-gray-100';
    }
  };

  /**
   * Get status label for accessibility
   */
  const getStatusLabel = (status: Milestone['status']) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in-progress':
        return 'In Progress';
      case 'planned':
        return 'Planned';
      default:
        return 'Planned';
    }
  };

  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-serif font-bold text-4xl md:text-5xl text-gray-900 mb-4">
            Product Roadmap
          </h2>
          <p className="font-sans text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Our 6-month plan to bring fractional home ownership to life
          </p>
        </div>

        {/* Current Phase Indicator - Requirement 9.5 */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 bg-primary-100 border border-primary-200 rounded-full px-6 py-3">
            <Clock className="w-5 h-5 text-primary-600" aria-hidden="true" />
            <span className="font-sans font-semibold text-primary-700">
              Currently in Phase {currentPhase}
            </span>
          </div>
        </div>

        {/* Timeline Visualization - Requirements 9.1, 9.2, 9.3, 9.4 */}
        <div className="relative">
          {/* Timeline Line - Desktop only */}
          <div 
            className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-300 -translate-x-1/2"
            aria-hidden="true"
          />

          {/* Milestones */}
          <div className="space-y-12">
            {milestones.map((milestone, index) => {
              const StatusIcon = getStatusIcon(milestone.status);
              const isEven = index % 2 === 0;

              return (
                <div
                  key={milestone.id}
                  className={`relative flex flex-col md:flex-row items-center gap-8 ${
                    isEven ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  {/* Content Card */}
                  <div className={`w-full md:w-5/12 ${isEven ? 'md:text-right' : 'md:text-left'}`}>
                    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                      {/* Quarter Badge */}
                      <div className={`inline-block mb-3 ${isEven ? 'md:float-right md:ml-3' : 'md:float-left md:mr-3'}`}>
                        <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 text-sm font-medium px-3 py-1 rounded-full">
                          {milestone.quarter}
                        </span>
                      </div>

                      {/* Title - Requirement 9.2 */}
                      <h3 className="font-serif font-semibold text-xl text-gray-900 mb-3">
                        {milestone.title}
                      </h3>

                      {/* Description - Requirement 9.4 */}
                      <p className="font-sans text-gray-600 leading-relaxed mb-4">
                        {milestone.description}
                      </p>

                      {/* Status Badge */}
                      <div className={`inline-flex items-center gap-2 ${isEven ? 'md:float-right' : 'md:float-left'}`}>
                        <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                          milestone.status === 'completed' ? 'bg-green-100 text-green-700' :
                          milestone.status === 'in-progress' ? 'bg-primary-100 text-primary-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {getStatusLabel(milestone.status)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Timeline Node - Requirement 9.3 */}
                  <div className="flex-shrink-0 w-16 h-16 md:w-20 md:h-20 relative z-10">
                    <div className={`w-full h-full rounded-full flex items-center justify-center ${getStatusColor(milestone.status)} border-4 border-white shadow-md`}>
                      <StatusIcon 
                        className="w-8 h-8 md:w-10 md:h-10" 
                        aria-label={getStatusLabel(milestone.status)}
                      />
                    </div>
                  </div>

                  {/* Spacer for alignment */}
                  <div className="hidden md:block w-5/12" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <p className="font-sans text-gray-600 mb-6">
            Want to be part of our journey? Join our early access program.
          </p>
          <a
            href="#signup"
            className="inline-block bg-primary-600 text-white font-sans font-medium px-8 py-3 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Get Early Access
          </a>
        </div>
      </div>
    </section>
  );
};

export default Roadmap;
