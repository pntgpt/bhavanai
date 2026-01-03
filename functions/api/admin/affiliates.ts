/**
 * Admin affiliate management API endpoints
 * Handles listing and creating affiliate partners
 */

import { requireRole } from '../../lib/auth';
import {
  getAffiliates,
  createAffiliate,
} from '../../lib/db';

interface Env {
  DB: D1Database;
}

/**
 * GET /api/admin/affiliates
 * Get all affiliates with optional status filter
 */
export async function onRequestGet(context: { request: Request; env: Env }) {
  const { request, env } = context;

  try {
    // Require admin role
    await requireRole(request, env.DB, ['admin']);

    // Parse query parameters for filters
    const url = new URL(request.url);
    const status = url.searchParams.get('status') as 'active' | 'inactive' | null;

    const filters: any = {};
    if (status) filters.status = status;

    const affiliates = await getAffiliates(env.DB, filters);

    return new Response(JSON.stringify(affiliates), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Get affiliates error:', error);
    
    if (error.message.includes('Unauthorized') || error.message.includes('Forbidden')) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: error.message.includes('Unauthorized') ? 401 : 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Failed to fetch affiliates' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

/**
 * POST /api/admin/affiliates
 * Create a new affiliate
 */
export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context;

  try {
    // Require admin role
    await requireRole(request, env.DB, ['admin']);

    const body = await request.json() as any;
    const { id, name, description } = body;

    // Validate affiliate ID if provided
    if (id !== undefined && id !== null) {
      if (typeof id !== 'string' || id.trim().length === 0) {
        return new Response(
          JSON.stringify({ error: 'Affiliate ID must be a non-empty string' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      // Validate ID format (alphanumeric, hyphens, underscores only)
      if (!/^[a-zA-Z0-9_-]+$/.test(id.trim())) {
        return new Response(
          JSON.stringify({ error: 'Affiliate ID can only contain letters, numbers, hyphens, and underscores' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      // Validate ID length (1-50 characters)
      if (id.trim().length > 50) {
        return new Response(
          JSON.stringify({ error: 'Affiliate ID must be between 1 and 50 characters' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
    }

    // Validate required fields (name is required per Requirements 1.4)
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Name is required and must be a non-empty string' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate name length (1-100 characters per design document)
    if (name.trim().length > 100) {
      return new Response(
        JSON.stringify({ error: 'Name must be between 1 and 100 characters' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate description length if provided (max 500 characters per design document)
    if (description && typeof description === 'string' && description.length > 500) {
      return new Response(
        JSON.stringify({ error: 'Description must be 500 characters or less' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Create affiliate
    const affiliate = await createAffiliate(env.DB, {
      id: id ? id.trim() : undefined,
      name: name.trim(),
      description: description || null,
    });

    return new Response(JSON.stringify(affiliate), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Create affiliate error:', error);

    if (error.message.includes('Unauthorized') || error.message.includes('Forbidden')) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: error.message.includes('Unauthorized') ? 401 : 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Handle duplicate ID error
    if (error.message && error.message.includes('already exists')) {
      return new Response(
        JSON.stringify({ error: error.message }),
        {
          status: 409,
          headers: { 'Content-Type': 'application/json' },
        }
      );
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

    return new Response(JSON.stringify({ error: 'Failed to create affiliate' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
