/**
 * Admin Properties API Endpoint
 * Handles viewing all properties across all brokers
 * 
 * GET: List all properties with broker information
 */

import { requireRole } from '../../lib/auth';
import { getProperties } from '../../lib/db';

interface Env {
  DB: D1Database;
}

/**
 * GET /api/admin/properties
 * Returns all properties from all brokers with broker information
 */
async function handleGet(request: Request, env: Env): Promise<Response> {
  try {
    await requireRole(request, env.DB, ['admin']);

    // Get all properties with broker information
    const properties = await getProperties(env.DB, undefined, true);

    return new Response(JSON.stringify({ success: true, properties }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('GET /api/admin/properties error:', error);
    
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
 * Main handler for /api/admin/properties
 */
export async function onRequest(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;

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
      response = await handleGet(request, env);
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
