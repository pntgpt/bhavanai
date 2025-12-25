'use client';

import { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';

/**
 * Edit Property Client Component
 * Extracts property ID from URL and displays placeholder edit page
 */
export default function EditPropertyClient() {
  const [propertyId, setPropertyId] = useState<string | null>(null);

  useEffect(() => {
    // Extract property ID from URL path
    const path = window.location.pathname;
    const matches = path.match(/\/dashboard\/broker\/properties\/([^\/]+)/);
    const id = matches ? matches[1] : null;
    setPropertyId(id);
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="font-serif font-bold text-4xl text-gray-900 mb-2">
          Edit Property
        </h1>
        {propertyId && (
          <p className="font-sans text-gray-600">
            Property ID: {propertyId}
          </p>
        )}
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h2 className="font-sans font-semibold text-lg text-yellow-900 mb-2">
          Feature Coming Soon
        </h2>
        <p className="font-sans text-yellow-800 mb-4">
          Property editing functionality is currently under development. 
          For now, you can view your property details and create new properties.
        </p>
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => window.location.href = '/dashboard/broker/properties'}
          >
            Back to My Properties
          </Button>
          {propertyId && (
            <Button
              variant="primary"
              onClick={() => window.location.href = `/properties/${propertyId}`}
            >
              View Property
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
