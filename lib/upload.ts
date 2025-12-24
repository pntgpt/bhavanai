/**
 * Image upload utilities for property photos
 * Provides client-side functions to upload images to R2 storage
 */

import type { ImageUploadResponse } from '@/types';

/**
 * Upload images to R2 storage
 * 
 * @param files - Array of File objects to upload
 * @returns Promise with upload response containing URLs or errors
 */
export async function uploadImages(files: File[]): Promise<ImageUploadResponse> {
  try {
    // Create FormData
    const formData = new FormData();
    
    // Append all files with the same field name 'images'
    files.forEach((file) => {
      formData.append('images', file);
    });

    // Send POST request to upload endpoint
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
      credentials: 'include', // Include cookies for authentication
    });

    // Parse response
    const data: ImageUploadResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Upload failed');
    }

    return data;
  } catch (error) {
    console.error('Image upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

/**
 * Validate image file before upload
 * Checks file size and type on the client side
 * 
 * @param file - File object to validate
 * @returns Validation result with error message if invalid
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type: ${file.type}. Allowed types: JPG, PNG, WebP`,
    };
  }

  // Check file size (5MB max)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum size: 5MB`,
    };
  }

  return { valid: true };
}

/**
 * Validate multiple image files
 * 
 * @param files - Array of File objects to validate
 * @returns Array of validation errors (empty if all valid)
 */
export function validateImageFiles(files: File[]): string[] {
  const errors: string[] = [];

  files.forEach((file, index) => {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      errors.push(`File ${index + 1} (${file.name}): ${validation.error}`);
    }
  });

  return errors;
}

/**
 * Get image URL for display
 * Handles both R2 URLs and external URLs
 * 
 * @param imageUrl - Image URL (can be relative or absolute)
 * @returns Full URL for image display
 */
export function getImageUrl(imageUrl: string): string {
  // If it's already an absolute URL, return as-is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // If it's a relative URL starting with /api/images/, return as-is
  if (imageUrl.startsWith('/api/images/') || imageUrl.startsWith('/images/')) {
    return imageUrl;
  }

  // Otherwise, assume it's just the filename and construct the URL
  return `/images/${imageUrl}`;
}
