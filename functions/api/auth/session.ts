/**
 * Session validation API endpoint
 * Returns current user session information
 * 
 * GET /api/auth/session
 * Returns: { authenticated: boolean, user?: User }
 */

import { getSessionToken, validateSession } from '../../lib/auth';

interface Env {
  DB: D1Database;
}

export async function onRequestGet(context: { request: Request; env: Env }) {
  const { request, env } = context;

  try {
    // Get session token from cookie
    const token = getSessionToken(request);

    if (!token) {
      return new Response(
        JSON.stringify({ authenticated: false }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate session
    const user = await validateSession(env.DB, token);

    if (!user) {
      return new Response(
        JSON.stringify({ authenticated: false }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Return authenticated user
    return new Response(
      JSON.stringify({
        authenticated: true,
        user,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Session validation error:', error);
    return new Response(
      JSON.stringify({ authenticated: false }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
