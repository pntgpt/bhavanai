/**
 * Image upload endpoint for property photos
 * Handles file validation, unique filename generation, and R2 storage
 * 
 * POST /api/upload
 * - Requires authentication (broker or admin)
 * - Accepts multipart/form-data with image files
 * - Validates file size (max 5MB) and format (jpg, jpeg, png, webp)
 * - Returns R2 public URLs for uploaded images
 */

import { requireRole } from '../lib/auth';

interface Env {
  DB: D1Database;
  IMAGES: R2Bucket;
}

// Allowed image MIME types
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

// Maximum file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Validate image file
 * Checks MIME type and file size
 */
function validateImage(file: File): { valid: boolean; error?: string } {
  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type: ${file.type}. Allowed types: jpg, jpeg, png, webp`,
    };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum size: 5MB`,
    };
  }

  return { valid: true };
}

/**
 * Generate unique filename for uploaded image
 * Format: {timestamp}-{uuid}.{extension}
 */
function generateUniqueFilename(originalFilename: string): string {
  const timestamp = Date.now();
  const uuid = crypto.randomUUID();
  const extension = originalFilename.split('.').pop()?.toLowerCase() || 'jpg';
  return `${timestamp}-${uuid}.${extension}`;
}

/**
 * Get public URL for R2 object
 * Uses the Cloudflare R2 public URL format
 */
function getPublicUrl(bucketName: string, key: string, accountId: string): string {
  // For Cloudflare R2, the public URL format is:
  // https://{bucket-name}.{account-id}.r2.cloudflarestorage.com/{key}
  // However, for production, you should use a custom domain
  // For now, we'll return the key and let the frontend construct the URL
  return `/api/images/${key}`;
}

/**
 * POST /api/upload
 * Upload one or more images to R2 storage
 */
export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    // Require broker or admin role
    const user = await requireRole(
      context.request,
      context.env.DB,
      ['broker', 'admin']
    );

    // Parse multipart form data
    const formData = await context.request.formData();
    const files = formData.getAll('images');

    if (files.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No images provided',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const uploadedUrls: string[] = [];
    const errors: string[] = [];

    // Process each file
    for (const file of files) {
      // Check if file is a valid File object
      if (!file || typeof file !== 'object' || !('name' in file) || !('type' in file)) {
        errors.push('Invalid file object');
        continue;
      }
      
      const imageFile = file as File;

      // Validate image
      const validation = validateImage(imageFile);
      if (!validation.valid) {
        errors.push(`${imageFile.name}: ${validation.error}`);
        continue;
      }

      try {
        // Generate unique filename
        const uniqueFilename = generateUniqueFilename(imageFile.name);

        // Convert file to ArrayBuffer
        const arrayBuffer = await imageFile.arrayBuffer();

        // Upload to R2
        await context.env.IMAGES.put(uniqueFilename, arrayBuffer, {
          httpMetadata: {
            contentType: imageFile.type,
          },
        });

        // Generate public URL
        // Note: In production, you should use a custom domain
        // For now, we'll use a relative URL that can be served through the worker
        const publicUrl = `/images/${uniqueFilename}`;
        uploadedUrls.push(publicUrl);

        console.log(`Uploaded image: ${uniqueFilename} by user ${user.id}`);
      } catch (error) {
        console.error(`Error uploading ${imageFile.name}:`, error);
        errors.push(`${imageFile.name}: Upload failed`);
      }
    }

    // Return results
    if (uploadedUrls.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No images were uploaded successfully',
          errors,
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        urls: uploadedUrls,
        errors: errors.length > 0 ? errors : undefined,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Upload error:', error);

    // Handle authentication errors
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Unauthorized',
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (error instanceof Error && error.message.includes('Forbidden')) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Forbidden: Only brokers and admins can upload images',
        }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
