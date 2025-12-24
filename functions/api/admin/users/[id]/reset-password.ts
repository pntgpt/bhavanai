/**
 * Reset a user's password
 * PATCH /api/admin/users/[id]/reset-password
 */

import { requireRole } from '../../../../lib/auth';
import { updateUserPassword, getUserById } from '../../../../lib/db';
import { hash } from 'bcryptjs';

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
    const body = await request.json();
    const { newPassword } = body;

    // Validate new password
    if (!newPassword || newPassword.length < 8) {
      return new Response(
        JSON.stringify({ error: 'Password must be at least 8 characters long' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Check if user exists
    const existingUser = await getUserById(env.DB, userId);
    if (!existingUser) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Hash new password
    const hashedPassword = await hash(newPassword, 12);

    // Update password
    const updatedUser = await updateUserPassword(env.DB, userId, hashedPassword);

    if (!updatedUser) {
      return new Response(JSON.stringify({ error: 'Failed to reset password' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Password reset successfully',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Reset password error:', error);

    if (error.message.includes('Unauthorized') || error.message.includes('Forbidden')) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: error.message.includes('Unauthorized') ? 401 : 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Failed to reset password' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
