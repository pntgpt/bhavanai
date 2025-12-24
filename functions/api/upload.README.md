# Image Upload API

This document describes the image upload functionality for property photos in the Bhavan.ai platform.

## Overview

The image upload system allows brokers and admins to upload property photos to Cloudflare R2 storage. Images are validated for size and format, stored with unique filenames, and served through a public endpoint.

## Endpoints

### POST /api/upload

Upload one or more images to R2 storage.

**Authentication Required:** Yes (Broker or Admin role)

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: FormData with `images` field containing one or more image files

**Response:**
```json
{
  "success": true,
  "urls": [
    "/images/1703456789000-uuid-1.jpg",
    "/images/1703456789001-uuid-2.png"
  ],
  "errors": [] // Optional, only if some files failed
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message",
  "errors": ["File 1: File too large", "File 2: Invalid format"]
}
```

**Status Codes:**
- `200`: Success (all or some images uploaded)
- `400`: Bad request (no images provided or all failed)
- `401`: Unauthorized (not logged in)
- `403`: Forbidden (wrong role)
- `500`: Internal server error

### GET /api/images/[key]

Retrieve an image from R2 storage.

**Authentication Required:** No (public endpoint)

**Request:**
- Method: `GET`
- URL: `/api/images/{filename}`

**Response:**
- Content-Type: `image/jpeg`, `image/png`, or `image/webp`
- Body: Image binary data
- Headers:
  - `Cache-Control: public, max-age=31536000, immutable`
  - `ETag: {etag}`

**Status Codes:**
- `200`: Success
- `404`: Image not found
- `500`: Internal server error

## Image Validation

### Allowed Formats
- JPEG (`.jpg`, `.jpeg`)
- PNG (`.png`)
- WebP (`.webp`)

### Size Limits
- Maximum file size: 5MB per image
- No limit on number of images per upload

## File Naming

Uploaded images are stored with unique filenames to prevent collisions:

Format: `{timestamp}-{uuid}.{extension}`

Example: `1703456789000-550e8400-e29b-41d4-a716-446655440000.jpg`

## R2 Configuration

The R2 bucket is configured in `wrangler.toml`:

```toml
[[r2_buckets]]
binding = "IMAGES"
bucket_name = "bhavan-images"
```

## Client-Side Usage

### Using the Upload Utility

```typescript
import { uploadImages, validateImageFiles } from '@/lib/upload';

// Validate files before upload
const files = Array.from(fileInput.files);
const errors = validateImageFiles(files);

if (errors.length > 0) {
  console.error('Validation errors:', errors);
  return;
}

// Upload images
const result = await uploadImages(files);

if (result.success) {
  console.log('Uploaded URLs:', result.urls);
} else {
  console.error('Upload failed:', result.error);
}
```

### Using Fetch Directly

```typescript
const formData = new FormData();
files.forEach(file => formData.append('images', file));

const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData,
  credentials: 'include',
});

const data = await response.json();
```

## Security

1. **Authentication**: Only authenticated brokers and admins can upload images
2. **Validation**: Files are validated for type and size on both client and server
3. **Unique Filenames**: Prevents overwriting existing files
4. **HTTP-Only Cookies**: Session tokens are stored securely

## Error Handling

The upload endpoint handles various error scenarios:

1. **No authentication**: Returns 401 Unauthorized
2. **Wrong role**: Returns 403 Forbidden
3. **No files provided**: Returns 400 Bad Request
4. **Invalid file type**: Skips file, includes in errors array
5. **File too large**: Skips file, includes in errors array
6. **Upload failure**: Skips file, includes in errors array

Partial success is possible - if some files upload successfully and others fail, the response will include both `urls` and `errors` arrays.

## Performance Considerations

1. **Lazy Loading**: Images should be lazy-loaded on the frontend
2. **Caching**: Images are cached with a 1-year max-age
3. **Compression**: Consider compressing images before upload
4. **Thumbnails**: Consider generating thumbnails for list views

## Future Enhancements

1. **Image Optimization**: Automatic resizing and compression
2. **Thumbnail Generation**: Create multiple sizes for different use cases
3. **Custom Domain**: Use a custom domain for R2 public URLs
4. **CDN Integration**: Add Cloudflare CDN for faster delivery
5. **Image Metadata**: Store EXIF data and dimensions
6. **Batch Delete**: Endpoint to delete multiple images
