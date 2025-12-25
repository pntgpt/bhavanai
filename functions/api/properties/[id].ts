/**
 * Individual Property API Endpoint
 * Returns details for a single approved property
 * 
 * GET /api/properties/:id
 * Returns: { success: boolean, property?: Property }
 */

import { getPropertyById } from '../../lib/db';

interface Env {
  DB: D1Database;
}

/**
 * GET /api/properties/:id
 * Returns a single approved property by ID
 */
export async function onRequestGet(context: {
  request: Request;
  env: Env;
  params: { id: string };
}): Promise<Response> {
  try {
    const { params, env } = context;
    const propertyId = params.id;

    if (!propertyId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Property ID is required',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Fetch property from database
    const property = await getPropertyById(env.DB, propertyId);

    if (!property) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Property not found',
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Only return approved properties to public
    if (property.status !== 'approved') {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Property not found',
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        property,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('GET /api/properties/:id error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
