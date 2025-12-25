/**
 * Single Property API Endpoint for Brokers
 * Allows brokers to fetch and update their own properties
 * 
 * GET /api/broker/properties/:id - Get property details
 * PUT /api/broker/properties/:id - Update property
 */

import { requireRole } from '../../../lib/auth';

interface Env {
  DB: D1Database;
}

/**
 * GET /api/broker/properties/:id
 * Fetch a single property owned by the broker
 */
export async function onRequestGet(context: {
  request: Request;
  env: Env;
  params: { id: string };
}): Promise<Response> {
  try {
    const user = await requireRole(context.request, context.env.DB, ['broker']);
    const propertyId = context.params.id;

    // Fetch property from database
    const property = await context.env.DB.prepare(`
      SELECT * FROM properties 
      WHERE id = ? AND broker_id = ?
    `)
      .bind(propertyId, user.id)
      .first();

    if (!property) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Property not found or you do not have permission to access it',
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
    console.error('GET /api/broker/properties/:id error:', error);

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Unauthorized',
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

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

/**
 * PUT /api/broker/properties/:id
 * Update a property owned by the broker
 */
export async function onRequestPut(context: {
  request: Request;
  env: Env;
  params: { id: string };
}): Promise<Response> {
  try {
    const user = await requireRole(context.request, context.env.DB, ['broker']);
    const propertyId = context.params.id;

    // Parse request body
    const body = await context.request.json();
    const { title, description, location, price, co_owner_count, images } = body;

    // Validate required fields
    if (!title || !description || !location || !price || !co_owner_count) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required fields',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Verify property belongs to broker
    const existingProperty = await context.env.DB.prepare(`
      SELECT id FROM properties 
      WHERE id = ? AND broker_id = ?
    `)
      .bind(propertyId, user.id)
      .first();

    if (!existingProperty) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Property not found or you do not have permission to update it',
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Update property in database
    await context.env.DB.prepare(`
      UPDATE properties 
      SET 
        title = ?,
        description = ?,
        location = ?,
        price = ?,
        co_owner_count = ?,
        images = ?,
        updated_at = ?
      WHERE id = ? AND broker_id = ?
    `)
      .bind(
        title,
        description,
        location,
        price,
        co_owner_count,
        images,
        Date.now(),
        propertyId,
        user.id
      )
      .run();

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Property updated successfully',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('PUT /api/broker/properties/:id error:', error);

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Unauthorized',
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

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
