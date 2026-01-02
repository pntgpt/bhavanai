'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';

/**
 * Debug page for troubleshooting property display issues
 * 
 * This page helps diagnose why approved properties aren't showing:
 * - Tests API endpoint connectivity
 * - Shows raw API response
 * - Displays property data structure
 * - Checks for data mapping issues
 */

export default function DebugPropertiesPage() {
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [rawResponse, setRawResponse] = useState<string>('');

  /**
   * Test the public properties API endpoint
   */
  const testPublicAPI = async () => {
    setLoading(true);
    setError(null);
    setApiResponse(null);
    setRawResponse('');

    try {
      const response = await fetch('/api/properties/public');
      const text = await response.text();
      setRawResponse(text);

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error(`Invalid JSON response: ${text}`);
      }

      setApiResponse({
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data: data,
      });

      if (!response.ok) {
        setError(`API returned ${response.status}: ${data.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      console.error('API test error:', err);
      setError(err.message || 'Failed to fetch from API');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Test debug endpoint with detailed database info
   */
  const testDebugEndpoint = async () => {
    setLoading(true);
    setError(null);
    setApiResponse(null);
    setRawResponse('');

    try {
      const response = await fetch('/api/debug/properties');
      const text = await response.text();
      setRawResponse(text);

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error(`Invalid JSON response: ${text}`);
      }

      setApiResponse({
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data: data,
      });

      if (!response.ok) {
        setError(`Debug API returned ${response.status}: ${data.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      console.error('Debug API test error:', err);
      setError(err.message || 'Failed to fetch from debug API');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Properties Debug Console
          </h1>

          <div className="space-y-6">
            {/* Test Controls */}
            <div className="flex gap-4 flex-wrap">
              <Button
                variant="primary"
                size="md"
                onClick={testPublicAPI}
                disabled={loading}
              >
                {loading ? 'Testing...' : 'Test Public API'}
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={testDebugEndpoint}
                disabled={loading}
              >
                {loading ? 'Testing...' : 'Test Debug Endpoint'}
              </Button>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800">Testing API endpoint...</p>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-red-900 mb-2">Error</h3>
                <p className="text-red-800 font-mono text-sm">{error}</p>
              </div>
            )}

            {/* Raw Response */}
            {rawResponse && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Raw Response</h3>
                <pre className="text-xs overflow-x-auto bg-gray-900 text-green-400 p-4 rounded">
                  {rawResponse}
                </pre>
              </div>
            )}

            {/* API Response Details */}
            {apiResponse && (
              <div className="space-y-4">
                {/* Status */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Response Status</h3>
                  <p className="text-gray-700">
                    <span className="font-semibold">Status:</span> {apiResponse.status} {apiResponse.statusText}
                  </p>
                </div>

                {/* Headers */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Response Headers</h3>
                  <pre className="text-xs overflow-x-auto">
                    {JSON.stringify(apiResponse.headers, null, 2)}
                  </pre>
                </div>

                {/* Data */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Response Data</h3>
                  <pre className="text-xs overflow-x-auto">
                    {JSON.stringify(apiResponse.data, null, 2)}
                  </pre>
                </div>

                {/* Properties Count */}
                {apiResponse.data?.properties && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-green-900 mb-2">Properties Found</h3>
                    <p className="text-green-800 text-2xl font-bold">
                      {apiResponse.data.properties.length}
                    </p>
                  </div>
                )}

                {/* Individual Properties */}
                {apiResponse.data?.properties?.length > 0 && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Details</h3>
                    <div className="space-y-4">
                      {apiResponse.data.properties.map((property: any, index: number) => (
                        <div key={index} className="bg-white border border-gray-300 rounded p-4">
                          <h4 className="font-semibold text-gray-900 mb-2">Property {index + 1}</h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div><span className="font-semibold">ID:</span> {property.id}</div>
                            <div><span className="font-semibold">Status:</span> {property.status}</div>
                            <div><span className="font-semibold">Title:</span> {property.title}</div>
                            <div><span className="font-semibold">Location:</span> {property.location}</div>
                            <div><span className="font-semibold">Price:</span> ₹{property.price?.toLocaleString()}</div>
                            <div><span className="font-semibold">Co-owners:</span> {property.co_owner_count}</div>
                            <div className="col-span-2">
                              <span className="font-semibold">Images:</span> {
                                typeof property.images === 'string' 
                                  ? property.images 
                                  : JSON.stringify(property.images)
                              }
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Debug Instructions</h3>
              <ol className="list-decimal list-inside space-y-2 text-blue-800 text-sm">
                <li>Click "Test Public API" to check if the endpoint is working</li>
                <li>Check the response status (should be 200)</li>
                <li>Verify the properties array is not empty</li>
                <li>Check each property has status: "approved"</li>
                <li>Verify images field is a valid JSON array</li>
                <li>Check if location field contains city information</li>
              </ol>
            </div>

            {/* Common Issues */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-yellow-900 mb-2">Common Issues</h3>
              <ul className="list-disc list-inside space-y-2 text-yellow-800 text-sm">
                <li><strong>No properties returned:</strong> Check if property status is "approved" in database</li>
                <li><strong>API error:</strong> Verify D1 database binding is configured in Cloudflare Pages</li>
                <li><strong>CORS error:</strong> Check browser console for CORS-related errors</li>
                <li><strong>Images not loading:</strong> Verify R2_PUBLIC_URL is set correctly</li>
                <li><strong>Empty array:</strong> Run query directly in D1 console: SELECT * FROM properties WHERE status = 'approved'</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
