/**
 * Public Property Detail API Endpoint
 * Returns a single approved property by ID for public viewing
 * No authentication required
 * 
 * GET: Get property by ID (only if approved)
 */

import { getPropertyById } from '../../lib/db';

interface Env {
  DB: D1Database;
}

/**
 * GET /api/properties/[id]
 * Returns a single approved property for public viewing
 */
async function handleGet(request: Request, env: Env, propertyId: string): Promise<Response> {
  try {
    // Get property by ID
    const property = await getPropertyById(env.DB, propertyId);

    // Check if property exists
    if (!property) {
      return new Response(JSON.stringify({ success: false, error: 'Property not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Only return approved properties to public
    if (property.status !== 'approved') {
      return new Response(JSON.stringify({ success: false, error: 'Property not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, property }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('GET /api/properties/[id] error:', error);

    return new Response(JSON.stringify({ success: false, error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

/**
 * Main handler for /api/properties/[id]
 */
export async function onRequest(context: { 
  request: Request; 
  env: Env;
  params: { id: string };
}): Promise<Response> {
  const { request, env, params } = context;
  const propertyId = params.id;

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  let response: Response;

  switch (request.method) {
    case 'GET':
      response = await handleGet(request, env, propertyId);
      break;
    default:
      response = new Response(JSON.stringify({ success: false, error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      });
  }

  // Add CORS headers to response
  const headers = new Headers(response.headers);
  headers.set('Access-Control-Allow-Origin', '*');
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
