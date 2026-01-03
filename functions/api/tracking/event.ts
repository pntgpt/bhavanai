/**
 * Tracking event API endpoint
 * Public endpoint for recording affiliate-attributed user actions
 * 
 * This endpoint handles tracking events for:
 * - User signups (event_type: 'signup')
 * - Property contacts (event_type: 'property_contact')
 * - Payments (event_type: 'payment')
 * 
 * Requirements:
 * - 2.4: Validate affiliate_id, handle invalid/inactive affiliates
 * - 2.5: Use NO_AFFILIATE_ID for events without affiliate attribution
 * - 3.1: Track signup events with affiliate attribution
 * - 3.2: Store user ID, affiliate ID, event type, and timestamp
 * - 4.1: Track property contact events with affiliate attribution
 * - 4.2: Store property ID, affiliate ID, event type, and timestamp
 */

import { createTrackingEvent } from '../../lib/db';
import { isValidAffiliateId, NO_AFFILIATE_ID } from '../../../lib/affiliate';

interface Env {
  DB: D1Database;
}

/**
 * POST /api/tracking/event
 * Record a tracking event for affiliate attribution
 * 
 * This is a public endpoint that does not require authentication.
 * It validates the affiliate_id and automatically handles inactive affiliates
 * by associating the event with NO_AFFILIATE_ID instead.
 */
export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context;

  try {
    const body = await request.json() as any;
    const { affiliate_id, event_type, user_id, property_id, metadata } = body;

    // Validate required fields
    if (!affiliate_id || typeof affiliate_id !== 'string') {
      return new Response(
        JSON.stringify({ error: 'affiliate_id is required and must be a string' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (!event_type || typeof event_type !== 'string') {
      return new Response(
        JSON.stringify({ error: 'event_type is required and must be a string' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate event_type is one of the allowed values
    const validEventTypes = ['signup', 'property_contact', 'payment'] as const;
    if (!validEventTypes.includes(event_type as any)) {
      return new Response(
        JSON.stringify({
          error: `event_type must be one of: ${validEventTypes.join(', ')}`,
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Type assertion after validation
    const validatedEventType = event_type as 'signup' | 'property_contact' | 'payment';

    // Validate affiliate_id format (Requirements 2.4)
    // If invalid format, use NO_AFFILIATE_ID
    let finalAffiliateId = affiliate_id;
    if (!isValidAffiliateId(affiliate_id)) {
      console.warn(`Invalid affiliate_id format: ${affiliate_id}, using ${NO_AFFILIATE_ID}`);
      finalAffiliateId = NO_AFFILIATE_ID;
    }

    // Validate optional fields if provided
    if (user_id !== undefined && user_id !== null && typeof user_id !== 'string') {
      return new Response(
        JSON.stringify({ error: 'user_id must be a string if provided' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (property_id !== undefined && property_id !== null && typeof property_id !== 'string') {
      return new Response(
        JSON.stringify({ error: 'property_id must be a string if provided' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate metadata is an object if provided
    if (metadata !== undefined && metadata !== null) {
      if (typeof metadata !== 'object' || Array.isArray(metadata)) {
        return new Response(
          JSON.stringify({ error: 'metadata must be an object if provided' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
    }

    // Validate event-specific requirements
    if (event_type === 'signup' && !user_id) {
      return new Response(
        JSON.stringify({ error: 'user_id is required for signup events' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (event_type === 'property_contact' && !property_id) {
      return new Response(
        JSON.stringify({ error: 'property_id is required for property_contact events' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Create the tracking event
    // The createTrackingEvent function will handle:
    // - Checking if affiliate exists and is active
    // - Using NO_AFFILIATE_ID if affiliate is inactive or doesn't exist (Requirements 2.4, 2.5)
    const trackingEvent = await createTrackingEvent(env.DB, {
      affiliate_id: finalAffiliateId,
      event_type: validatedEventType,
      user_id: user_id || undefined,
      property_id: property_id || undefined,
      metadata: metadata || undefined,
    });

    return new Response(
      JSON.stringify({
        success: true,
        event_id: trackingEvent.id,
        message: 'Tracking event recorded successfully',
      }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Create tracking event error:', error);

    // Handle foreign key constraint violations
    if (error.message && error.message.includes('FOREIGN KEY constraint')) {
      return new Response(
        JSON.stringify({
          error: 'Referenced entity (user, property, or affiliate) does not exist',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Failed to create tracking event' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
