/**
 * Admin Property Approval Endpoint
 * Handles approving pending properties
 * 
 * PATCH: Approve a property (changes status to approved)
 */

import { requireRole } from '../../../../lib/auth';
import { getPropertyById, approveProperty } from '../../../../lib/db';

interface Env {
  DB: D1Database;
}

/**
 * PATCH /api/admin/properties/:id/approve
 * Approves a property and makes it visible on public listings
 */
async function handlePatch(request: Request, env: Env, propertyId: string): Promise<Response> {
  try {
    await requireRole(request, env.DB, ['admin']);

    // Check if property exists
    const existingProperty = await getPropertyById(env.DB, propertyId);
    if (!existingProperty) {
      return new Response(
        JSON.stringify({ success: false, error: 'Property not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Approve the property
    const property = await approveProperty(env.DB, propertyId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Property approved successfully',
        property 
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('PATCH /api/admin/properties/:id/approve error:', error);
    
    if (error.message.includes('Unauthorized') || error.message.includes('Forbidden')) {
      return new Response(JSON.stringify({ success: false, error: error.message }), {
        status: error.message.includes('Unauthorized') ? 401 : 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: false, error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

/**
 * Main handler for /api/admin/properties/:id/approve
 */
export async function onRequest(context: { 
  request: Request; 
  env: Env;
  params: { id: string };
}): Promise<Response> {
  const { request, env, params } = context;

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  let response: Response;

  switch (request.method) {
    case 'PATCH':
      response = await handlePatch(request, env, params.id);
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
