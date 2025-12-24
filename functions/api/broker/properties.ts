/**
 * Broker Properties API Endpoint
 * Handles CRUD operations for broker's own properties
 * 
 * GET: List all properties for the authenticated broker
 * POST: Create a new property (status: pending)
 * PATCH: Update an existing property (resets to pending)
 * DELETE: Delete a property
 */

import { requireRole } from '../../lib/auth';
import {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  isPropertyOwner,
} from '../../lib/db';

interface Env {
  DB: D1Database;
}

/**
 * GET /api/broker/properties
 * Returns all properties for the authenticated broker
 */
async function handleGet(request: Request, env: Env): Promise<Response> {
  try {
    const user = await requireRole(request, env.DB, ['broker', 'admin']);

    // Brokers can only see their own properties, admins can see all
    const filters = user.role === 'broker' ? { broker_id: user.id } : undefined;
    const properties = await getProperties(env.DB, filters);

    return new Response(JSON.stringify({ success: true, properties }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('GET /api/broker/properties error:', error);
    
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
 * POST /api/broker/properties
 * Creates a new property with pending status
 */
async function handlePost(request: Request, env: Env): Promise<Response> {
  try {
    const user = await requireRole(request, env.DB, ['broker', 'admin']);
    const data: any = await request.json();

    // Validate required fields
    const requiredFields = ['title', 'description', 'location', 'price', 'co_owner_count', 'images'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return new Response(
          JSON.stringify({ success: false, error: `Missing required field: ${field}` }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // Validate co_owner_count range
    if (data.co_owner_count < 2 || data.co_owner_count > 5) {
      return new Response(
        JSON.stringify({ success: false, error: 'co_owner_count must be between 2 and 5' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate images is an array
    if (!Array.isArray(data.images)) {
      return new Response(
        JSON.stringify({ success: false, error: 'images must be an array' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const property = await createProperty(env.DB, {
      title: data.title,
      description: data.description,
      location: data.location,
      price: parseFloat(data.price),
      co_owner_count: parseInt(data.co_owner_count),
      images: data.images,
      broker_id: user.id,
    });

    return new Response(JSON.stringify({ success: true, property }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('POST /api/broker/properties error:', error);
    
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
 * PATCH /api/broker/properties/:id
 * Updates an existing property (resets to pending status)
 */
async function handlePatch(request: Request, env: Env): Promise<Response> {
  try {
    const user = await requireRole(request, env.DB, ['broker', 'admin']);
    const url = new URL(request.url);
    const propertyId = url.pathname.split('/').pop();

    if (!propertyId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Property ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if property exists
    const existingProperty = await getPropertyById(env.DB, propertyId);
    if (!existingProperty) {
      return new Response(
        JSON.stringify({ success: false, error: 'Property not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Brokers can only update their own properties, admins can update any
    if (user.role === 'broker' && !(await isPropertyOwner(env.DB, propertyId, user.id))) {
      return new Response(
        JSON.stringify({ success: false, error: 'Forbidden: You can only update your own properties' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data: any = await request.json();

    // Validate co_owner_count if provided
    if (data.co_owner_count !== undefined) {
      const count = parseInt(data.co_owner_count);
      if (count < 2 || count > 5) {
        return new Response(
          JSON.stringify({ success: false, error: 'co_owner_count must be between 2 and 5' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
      data.co_owner_count = count;
    }

    // Validate images if provided
    if (data.images !== undefined && !Array.isArray(data.images)) {
      return new Response(
        JSON.stringify({ success: false, error: 'images must be an array' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parse price if provided
    if (data.price !== undefined) {
      data.price = parseFloat(data.price);
    }

    const property = await updateProperty(env.DB, propertyId, data);

    return new Response(JSON.stringify({ success: true, property }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('PATCH /api/broker/properties/:id error:', error);
    
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
 * DELETE /api/broker/properties/:id
 * Deletes a property
 */
async function handleDelete(request: Request, env: Env): Promise<Response> {
  try {
    const user = await requireRole(request, env.DB, ['broker', 'admin']);
    const url = new URL(request.url);
    const propertyId = url.pathname.split('/').pop();

    if (!propertyId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Property ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if property exists
    const existingProperty = await getPropertyById(env.DB, propertyId);
    if (!existingProperty) {
      return new Response(
        JSON.stringify({ success: false, error: 'Property not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Brokers can only delete their own properties, admins can delete any
    if (user.role === 'broker' && !(await isPropertyOwner(env.DB, propertyId, user.id))) {
      return new Response(
        JSON.stringify({ success: false, error: 'Forbidden: You can only delete your own properties' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await deleteProperty(env.DB, propertyId);

    return new Response(
      JSON.stringify({ success: true, message: 'Property deleted successfully' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('DELETE /api/broker/properties/:id error:', error);
    
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
 * Main handler for /api/broker/properties
 */
export async function onRequest(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  let response: Response;

  switch (request.method) {
    case 'GET':
      response = await handleGet(request, env);
      break;
    case 'POST':
      response = await handlePost(request, env);
      break;
    case 'PATCH':
      response = await handlePatch(request, env);
      break;
    case 'DELETE':
      response = await handleDelete(request, env);
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
