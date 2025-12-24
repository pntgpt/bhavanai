/**
 * Registration API endpoint
 * Creates pending user accounts for broker, CA, and lawyer roles
 * Admin approval required before account activation
 * 
 * POST /api/auth/register
 * Body: { name: string, email: string, phone: string, userType: 'broker' | 'ca' | 'lawyer' }
 * Returns: { success: boolean, message: string, userId?: string }
 */

import { hash } from 'bcryptjs';

interface Env {
  DB: D1Database;
}

interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  userType: 'broker' | 'ca' | 'lawyer';
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context;

  try {
    // Parse request body
    const body = await request.json() as RegisterRequest;
    const { name, email, phone, userType } = body;

    // Validate input
    if (!name || !email || !phone || !userType) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'All fields are required',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate user type
    if (!['broker', 'ca', 'lawyer'].includes(userType)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid user type',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid email format',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Check if user already exists
    const existingUser = await env.DB.prepare(
      'SELECT id FROM users WHERE email = ?'
    )
      .bind(email)
      .first();

    if (existingUser) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'An account with this email already exists',
        }),
        {
          status: 409,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Generate temporary password (will be sent by admin after approval)
    const tempPassword = crypto.randomUUID();
    const hashedPassword = await hash(tempPassword, 12);

    // Create user with pending status
    const userId = crypto.randomUUID();
    const now = Date.now();

    await env.DB.prepare(
      'INSERT INTO users (id, name, email, phone, password, role, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    )
      .bind(userId, name, email, phone, hashedPassword, userType, 'pending', now, now)
      .run();

    // Return success message
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Thank you for registering. Our team will reach out to you shortly.',
        userId,
      }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'An error occurred during registration',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
