/**
 * Logout API endpoint
 * Destroys user session and clears authentication cookies
 * 
 * POST /api/auth/logout
 * Returns: { success: boolean }
 */

import { getSessionToken, deleteSession, clearSessionCookie } from '../../lib/auth';

interface Env {
  DB: D1Database;
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context;

  try {
    // Get session token from cookie
    const token = getSessionToken(request);

    if (token) {
      // Delete session from database
      await deleteSession(env.DB, token);
    }

    // Return success and clear session cookie
    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': clearSessionCookie(),
        },
      }
    );
  } catch (error) {
    console.error('Logout error:', error);
    
    // Even if there's an error, clear the cookie
    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': clearSessionCookie(),
        },
      }
    );
  }
}
