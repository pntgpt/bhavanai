import React from 'react';

/**
 * Card component for displaying content in a contained, elevated surface
 * Supports multiple variants for different use cases
 * 
 * Variants:
 * - default: Standard card with border
 * - feature: Card for feature sections with hover effect
 * - team: Card for team member profiles
 * - listing: Card for property listings in marketplace
 */

export interface CardProps {
  variant?: 'default' | 'feature' | 'team' | 'listing';
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

const Card: React.FC<CardProps> = ({
  variant = 'default',
  children,
  className = '',
  hover = false,
}) => {
  // Base styles for all cards
  const baseStyles = 'bg-white border border-gray-200 rounded-lg';

  // Variant-specific styles
  const variantStyles = {
    default: 'p-6',
    feature: 'p-6 transition-shadow duration-normal',
    team: 'p-6 text-center',
    listing: 'p-4 space-y-3',
  };

  // Hover effect
  const hoverStyles = hover || variant === 'feature'
    ? 'hover:shadow-lg cursor-pointer'
    : '';

  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${hoverStyles} ${className}`;

  return (
    <div className={combinedClassName}>
      {children}
    </div>
  );
};

export default Card;
