/**
 * Property Not Found Page
 * 
 * Displayed when a property ID doesn't exist or is not approved
 * Provides a user-friendly 404 experience with navigation back to listings
 * 
 * Requirements: 24.4 - Proper 404 handling for non-existent properties
 */

import Link from 'next/link';
import { ArrowLeft, Home } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function PropertyNotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <Home size={64} className="mx-auto text-gray-400" />
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Property Not Found
        </h1>
        
        <p className="text-lg text-gray-600 mb-8">
          The property you're looking for doesn't exist or is no longer available.
          It may have been removed or is pending approval.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/properties">
            <Button variant="primary" size="lg">
              <ArrowLeft size={20} className="mr-2" />
              View All Properties
            </Button>
          </Link>
          
          <Link href="/">
            <Button variant="outline" size="lg">
              <Home size={20} className="mr-2" />
              Go to Homepage
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
