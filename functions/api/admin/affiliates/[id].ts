/**
 * Admin affiliate management API endpoints for individual affiliates
 * Handles GET (details), PUT (update), and DELETE operations
 * Requirements: 1.3 (deactivation), 1.5 (update with ID preservation)
 */

import { requireRole } from '../../../lib/auth';
import {
  getAffiliateById,
  updateAffiliate,
  deleteAffiliate,
} from '../../../lib/db';

interface Env {
  DB: D1Database;
}

/**
 * GET /api/admin/affiliates/[id]
 * Get details of a specific affiliate
 */
export async function onRequestGet(context: {
  request: Request;
  env: Env;
  params: { id: string };
}) {
  const { request, env, params } = context;

  try {
    // Require admin role
    await requireRole(request, env.DB, ['admin']);

    const affiliateId = params.id;

    // Get affiliate by ID
    const affiliate = await getAffiliateById(env.DB, affiliateId);

    if (!affiliate) {
      return new Response(JSON.stringify({ error: 'Affiliate not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ affiliate }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Get affiliate error:', error);

    if (error.message.includes('Unauthorized') || error.message.includes('Forbidden')) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: error.message.includes('Unauthorized') ? 401 : 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Failed to fetch affiliate' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

/**
 * PUT /api/admin/affiliates/[id]
 * Update an affiliate's metadata while preserving the unique identifier
 * Requirements: 1.3 (deactivation via status update), 1.5 (ID preservation)
 */
export async function onRequestPut(context: {
  request: Request;
  env: Env;
  params: { id: string };
}) {
  const { request, env, params } = context;

  try {
    // Require admin role
    await requireRole(request, env.DB, ['admin']);

    const affiliateId = params.id;

    // Check if affiliate exists
    const existingAffiliate = await getAffiliateById(env.DB, affiliateId);
    if (!existingAffiliate) {
      return new Response(JSON.stringify({ error: 'Affiliate not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json() as any;
    const { name, description, status } = body;

    // Validate name if provided (1-100 characters per design document)
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return new Response(
          JSON.stringify({ error: 'Name must be a non-empty string' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      if (name.trim().length > 100) {
        return new Response(
          JSON.stringify({ error: 'Name must be between 1 and 100 characters' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
    }

    // Validate description if provided (max 500 characters per design document)
    if (description !== undefined && description !== null) {
      if (typeof description !== 'string' || description.length > 500) {
        return new Response(
          JSON.stringify({ error: 'Description must be 500 characters or less' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
    }

    // Validate status if provided
    if (status !== undefined) {
      if (status !== 'active' && status !== 'inactive') {
        return new Response(
          JSON.stringify({ error: 'Status must be either "active" or "inactive"' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
    }

    // Build update data object
    const updateData: {
      name?: string;
      description?: string;
      status?: 'active' | 'inactive';
    } = {};

    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description || undefined;
    if (status !== undefined) updateData.status = status;

    // Update affiliate (preserves ID per Requirement 1.5)
    const updatedAffiliate = await updateAffiliate(env.DB, affiliateId, updateData);

    if (!updatedAffiliate) {
      return new Response(
        JSON.stringify({ error: 'Failed to update affiliate' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        affiliate: updatedAffiliate,
        message: 'Affiliate updated successfully',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Update affiliate error:', error);

    if (error.message.includes('Unauthorized') || error.message.includes('Forbidden')) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: error.message.includes('Unauthorized') ? 401 : 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Handle duplicate name error (if database has unique constraint)
    if (error.message && error.message.includes('UNIQUE constraint')) {
      return new Response(
        JSON.stringify({ error: 'An affiliate with this name already exists' }),
        {
          status: 409,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(JSON.stringify({ error: 'Failed to update affiliate' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

/**
 * DELETE /api/admin/affiliates/[id]
 * Delete an affiliate
 * Note: This is a hard delete. Consider soft delete (status='inactive') for production use.
 */
export async function onRequestDelete(context: {
  request: Request;
  env: Env;
  params: { id: string };
}) {
  const { request, env, params } = context;

  try {
    // Require admin role
    await requireRole(request, env.DB, ['admin']);

    const affiliateId = params.id;

    // Check if affiliate exists
    const existingAffiliate = await getAffiliateById(env.DB, affiliateId);
    if (!existingAffiliate) {
      return new Response(JSON.stringify({ error: 'Affiliate not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Prevent deletion of NO_AFFILIATE_ID (special protected affiliate)
    if (affiliateId === 'NO_AFFILIATE_ID') {
      return new Response(
        JSON.stringify({ error: 'Cannot delete the NO_AFFILIATE_ID affiliate' }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Delete affiliate
    const success = await deleteAffiliate(env.DB, affiliateId);

    if (!success) {
      return new Response(
        JSON.stringify({ error: 'Failed to delete affiliate' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Affiliate deleted successfully',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Delete affiliate error:', error);

    if (error.message.includes('Unauthorized') || error.message.includes('Forbidden')) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: error.message.includes('Unauthorized') ? 401 : 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Handle foreign key constraint errors (if affiliate has tracking events)
    if (error.message && error.message.includes('FOREIGN KEY constraint')) {
      return new Response(
        JSON.stringify({
          error: 'Cannot delete affiliate with existing tracking events. Consider deactivating instead.',
        }),
        {
          status: 409,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(JSON.stringify({ error: 'Failed to delete affiliate' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
