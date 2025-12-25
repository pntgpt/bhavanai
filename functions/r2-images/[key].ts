/**
 * Image serving endpoint for local development
 * Serves images from local R2 bucket during development
 * In production, images are served directly from R2 public URL
 * 
 * GET /r2-images/:key
 */

interface Env {
  IMAGES: R2Bucket;
}

export async function onRequestGet(context: {
  request: Request;
  env: Env;
  params: { key: string };
}): Promise<Response> {
  try {
    const { params, env } = context;
    const key = params.key;

    if (!key) {
      return new Response('Image key is required', {
        status: 400,
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    // Fetch image from R2
    const object = await env.IMAGES.get(key);

    if (!object) {
      return new Response('Image not found', {
        status: 404,
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    // Get content type from metadata
    const contentType = object.httpMetadata?.contentType || 'image/jpeg';

    // Return image with caching headers
    return new Response(object.body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'ETag': object.etag,
      },
    });
  } catch (error) {
    console.error('Error serving image:', error);
    return new Response('Internal server error', {
      status: 500,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}
