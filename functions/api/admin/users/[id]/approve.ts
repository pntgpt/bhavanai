/**
 * Approve a pending user account
 * PATCH /api/admin/users/[id]/approve
 */

import { requireRole } from '../../../../lib/auth';
import { updateUserStatus, getUserById } from '../../../../lib/db';

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

    // Update user status to active
    const updatedUser = await updateUserStatus(env.DB, userId, 'active');

    if (!updatedUser) {
      return new Response(JSON.stringify({ error: 'Failed to approve user' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Remove password from response
    const { password, ...sanitizedUser } = updatedUser;

    return new Response(
      JSON.stringify({
        success: true,
        user: sanitizedUser,
        message: 'User approved successfully',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Approve user error:', error);

    if (error.message.includes('Unauthorized') || error.message.includes('Forbidden')) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: error.message.includes('Unauthorized') ? 401 : 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Failed to approve user' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
