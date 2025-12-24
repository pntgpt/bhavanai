/**
 * Login API endpoint
 * Authenticates users with email and password, creates secure session
 * 
 * POST /api/auth/login
 * Body: { email: string, password: string }
 * Returns: { success: boolean, user?: User, error?: string }
 */

import { compare } from 'bcryptjs';

interface Env {
  DB: D1Database;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'broker' | 'ca' | 'lawyer';
  status: 'pending' | 'active' | 'inactive';
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context;

  try {
    // Parse request body
    const body = await request.json() as LoginRequest;
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return new Response(
        JSON.stringify({ success: false, error: 'Email and password are required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Query user from database - only active users can log in
    const user = await env.DB.prepare(
      'SELECT * FROM users WHERE email = ? AND status = ?'
    )
      .bind(email, 'active')
      .first<User & { password: string }>();

    if (!user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid email or password' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Verify password with bcrypt
    const isValidPassword = await compare(password, user.password);
    if (!isValidPassword) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid email or password' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Create session
    const sessionId = crypto.randomUUID();
    const token = crypto.randomUUID();
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    await env.DB.prepare(
      'INSERT INTO sessions (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)'
    )
      .bind(sessionId, user.id, token, expiresAt)
      .run();

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    // Return success with user data and set HTTP-only cookie
    return new Response(
      JSON.stringify({
        success: true,
        user: userWithoutPassword,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': `session=${token}; HttpOnly; Secure; SameSite=Lax; Max-Age=${24 * 60 * 60}; Path=/`,
        },
      }
    );
  } catch (error) {
    console.error('Login error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'An error occurred during login' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
