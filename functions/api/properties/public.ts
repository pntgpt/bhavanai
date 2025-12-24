/**
 * Public Properties API Endpoint
 * Returns only approved properties for public viewing
 * No authentication required
 * 
 * GET: List all approved properties
 */

import { getProperties } from '../../lib/db';

interface Env {
  DB: D1Database;
}

/**
 * GET /api/properties/public
 * Returns all approved properties for public viewing
 */
async function handleGet(request: Request, env: Env): Promise<Response> {
  try {
    // Get only approved properties
    const properties = await getProperties(env.DB, { status: 'approved' });

    return new Response(JSON.stringify({ success: true, properties }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('GET /api/properties/public error:', error);

    return new Response(JSON.stringify({ success: false, error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

/**
 * Main handler for /api/properties/public
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
