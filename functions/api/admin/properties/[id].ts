/**
 * Admin Property Management API Endpoint
 * Handles editing and deleting any property by admin
 * 
 * PATCH: Update property details (admin can edit any property)
 * DELETE: Delete property (admin can delete any property)
 * 
 * Requirements: 25.2, 25.3
 */

import { requireRole } from '../../../lib/auth';
import { updateProperty, deleteProperty, getPropertyById } from '../../../lib/db';

interface Env {
  DB: D1Database;
}

/**
 * PATCH /api/admin/properties/:id
 * Update property details (admin can edit any property)
 */
async function handlePatch(request: Request, env: Env, propertyId: string): Promise<Response> {
  try {
    await requireRole(request, env.DB, ['admin']);

    // Parse request body
    const body = await request.json() as {
      title?: string;
      description?: string;
      location?: string;
      price?: number;
      co_owner_count?: number;
    };
    const { title, description, location, price, co_owner_count } = body;

    // Validate property exists
    const existingProperty = await getPropertyById(env.DB, propertyId);
    if (!existingProperty) {
      return new Response(JSON.stringify({ success: false, error: 'Property not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Validate input
    if (title !== undefined && !title.trim()) {
      return new Response(JSON.stringify({ success: false, error: 'Title is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (description !== undefined && !description.trim()) {
      return new Response(JSON.stringify({ success: false, error: 'Description is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (location !== undefined && !location.trim()) {
      return new Response(JSON.stringify({ success: false, error: 'Location is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (price !== undefined && price <= 0) {
      return new Response(JSON.stringify({ success: false, error: 'Price must be greater than 0' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (co_owner_count !== undefined && (co_owner_count < 2 || co_owner_count > 5)) {
      return new Response(JSON.stringify({ success: false, error: 'Co-owner count must be between 2 and 5' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Update property
    const updatedProperty = await updateProperty(env.DB, propertyId, {
      title,
      description,
      location,
      price,
      co_owner_count,
    });

    return new Response(JSON.stringify({ success: true, property: updatedProperty }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('PATCH /api/admin/properties/:id error:', error);
    
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
 * DELETE /api/admin/properties/:id
 * Delete property (admin can delete any property)
 */
async function handleDelete(request: Request, env: Env, propertyId: string): Promise<Response> {
  try {
    await requireRole(request, env.DB, ['admin']);

    // Validate property exists
    const existingProperty = await getPropertyById(env.DB, propertyId);
    if (!existingProperty) {
      return new Response(JSON.stringify({ success: false, error: 'Property not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Delete property
    const deleted = await deleteProperty(env.DB, propertyId);

    if (!deleted) {
      return new Response(JSON.stringify({ success: false, error: 'Failed to delete property' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, message: 'Property deleted successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('DELETE /api/admin/properties/:id error:', error);
    
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
 * Main handler for /api/admin/properties/:id
 */
export async function onRequest(context: { request: Request; env: Env; params: { id: string } }): Promise<Response> {
  const { request, env, params } = context;
  const propertyId = params.id;

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  let response: Response;

  switch (request.method) {
    case 'PATCH':
      response = await handlePatch(request, env, propertyId);
      break;
    case 'DELETE':
      response = await handleDelete(request, env, propertyId);
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
