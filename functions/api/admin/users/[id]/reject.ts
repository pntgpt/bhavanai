/**
 * Reject a pending user account
 * PATCH /api/admin/users/[id]/reject
 */

import { requireRole } from '../../../../lib/auth';
import { deleteUser, getUserById } from '../../../../lib/db';

interface Env {
  DB: D1Database;
}

export async function onRequestPatch(context: {
  request: Request;
  env: Env;
  params: { id: string };
}) {
  const { request, env, params } = context;

  try {
    // Require admin role
    await requireRole(request, env.DB, ['admin']);

    const userId = params.id;

    // Check if user exists
    const existingUser = await getUserById(env.DB, userId);
    if (!existingUser) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Delete the user (rejection means we don't keep the account)
    const deleted = await deleteUser(env.DB, userId);

    if (!deleted) {
      return new Response(JSON.stringify({ error: 'Failed to reject user' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'User rejected and removed successfully',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Reject user error:', error);

    if (error.message.includes('Unauthorized') || error.message.includes('Forbidden')) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: error.message.includes('Unauthorized') ? 401 : 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Failed to reject user' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
