/**
 * Image serving endpoint
 * Serves images from R2 storage
 * 
 * GET /api/images/[key]
 * - Public endpoint (no authentication required)
 * - Returns image file from R2 storage
 */

interface Env {
  IMAGES: R2Bucket;
}

/**
 * GET /api/images/[key]
 * Serve an image from R2 storage
 */
export async function onRequestGet(context: { 
  request: Request; 
  env: Env;
  params: { key: string };
}): Promise<Response> {
  try {
    // Get the image key from the URL parameter
    const key = context.params.key as string;

    if (!key) {
      return new Response('Image key is required', { status: 400 });
    }

    // Fetch the image from R2
    const object = await context.env.IMAGES.get(key);

    if (!object) {
      return new Response('Image not found', { status: 404 });
    }

    // Return the image with appropriate headers
    const headers = new Headers();
    headers.set('Content-Type', object.httpMetadata?.contentType || 'image/jpeg');
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    headers.set('ETag', object.httpEtag);

    return new Response(object.body, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Error serving image:', error);
    return new Response('Internal server error', { status: 500 });
  }
}
