# File Upload System Implementation

## Overview

This document describes the file upload system implementation for the SvelteKit migration, including image processing, storage, and UI components.

## Components Implemented

### 1. Image Processing Utility (`src/lib/server/image-processor.ts`)

Server-side utility for processing images with Sharp:

- **optimizeImage()**: Resizes, compresses, and converts images to WebP/AVIF/JPEG
- **generateThumbnail()**: Creates square thumbnails for previews
- **validateImage()**: Validates that a buffer contains a valid image
- **getImageMetadata()**: Extracts image metadata

### 2. File Upload API Route (`src/routes/api/upload/+server.ts`)

RESTful API endpoint for handling file uploads:

- **POST /api/upload**: Handles multipart/form-data uploads
- Validates file type (JPEG, PNG, WebP only)
- Enforces size limits per bucket:
  - `profile-photos`: 5MB
  - `company-logos`: 10MB
  - `product-photos`: 2MB
  - `gallery-photos`: 5MB
- Processes images with Sharp (resize, optimize, convert to WebP)
- Generates unique filenames with user ID prefix
- Uploads to Supabase Storage
- Returns public URL

### 3. FileUpload Component (`src/lib/components/FileUpload.svelte`)

Reusable Svelte component for file uploads:

**Features:**
- Drag-and-drop file input
- Image preview before upload
- Upload progress indicator
- Error message display
- Support for multiple files (gallery)
- Responsive design with dark mode support

**Props:**
- `bucket`: Storage bucket name (required)
- `currentUrl`: Current image URL (bindable)
- `onUploadComplete`: Callback function after successful upload
- `multiple`: Allow multiple file uploads
- `accept`: Accepted MIME types
- `maxSizeMB`: Maximum file size in MB
- `label`: Input label text
- `description`: Helper text

### 4. Profile Form Integration

The FileUpload component has been integrated into the profile management page:

1. **Personal Info Tab**: Profile photo upload
2. **Professional Info Tab**: Company logo upload
3. **Products/Services Tab**: Product photo upload
4. **Photo Gallery Tab**: Gallery photo upload

## Storage Configuration

### Supabase Storage Buckets

Four public storage buckets are configured:

1. **profile-photos**: User profile pictures (5MB limit)
2. **company-logos**: Company/organization logos (10MB limit)
3. **product-photos**: Product/service images (2MB limit)
4. **gallery-photos**: Photo gallery images (5MB limit)

### Row Level Security (RLS) Policies

Each bucket has RLS policies ensuring:
- Users can only upload/update/delete their own files
- Files are organized by user ID in folder structure
- All files are publicly readable (for public card viewing)

See `CREATE_STORAGE_BUCKETS.sql` for the complete SQL setup.

## Image Processing Pipeline

1. **Upload**: User selects/drops image file
2. **Client Validation**: Check file type and size
3. **Preview**: Display image preview using FileReader
4. **API Request**: Send file to `/api/upload` endpoint
5. **Server Validation**: Re-validate file type and size
6. **Image Processing**: 
   - Resize based on bucket type
   - Convert to WebP format
   - Compress with quality settings
7. **Storage**: Upload to Supabase Storage with unique filename
8. **Response**: Return public URL to client
9. **Update Form**: Store URL in hidden input field

## Security Features

- **Authentication Required**: All uploads require authenticated user
- **File Type Validation**: Only JPEG, PNG, and WebP allowed
- **Size Limits**: Enforced on both client and server
- **User Isolation**: Files stored in user-specific folders
- **RLS Policies**: Database-level access control
- **Image Validation**: Verify file is actually an image using Sharp
- **Unique Filenames**: Prevent overwrites with timestamp + UUID

## Usage Example

```svelte
<script lang="ts">
  import FileUpload from '$lib/components/FileUpload.svelte';
  
  let profilePhotoUrl = $state('');
</script>

<FileUpload
  bucket="profile-photos"
  bind:currentUrl={profilePhotoUrl}
  maxSizeMB={5}
  label="Profile Photo"
  description="Upload your profile photo (max 5MB)"
/>

<input type="hidden" name="profile_photo_url" value={profilePhotoUrl} />
```

## Testing

To test the file upload system:

1. Navigate to `/profile` (requires authentication)
2. Go to the "Personal Info" tab
3. Click or drag-and-drop an image file
4. Verify image preview appears
5. Submit the form
6. Check that the image URL is saved to the database
7. Verify the image is accessible via the public URL

## Dependencies

- **sharp**: Image processing library
- **@types/sharp**: TypeScript types for Sharp
- **@supabase/supabase-js**: Supabase client for storage operations
- **lucide-svelte**: Icons for UI components

## Future Enhancements

- [ ] Add image cropping functionality
- [ ] Support for video uploads
- [ ] Batch upload with progress tracking
- [ ] Image compression settings UI
- [ ] Automatic thumbnail generation for galleries
- [ ] CDN integration for faster delivery
- [ ] Image optimization on-the-fly with query parameters

## Requirements Satisfied

This implementation satisfies the following requirements from the design document:

- **14.1**: File upload with validation and size limits
- **14.2**: Server-side processing and storage
- **14.4**: Image optimization with Sharp
- **14.5**: WebP format conversion
- **14.6**: User-friendly upload UI with drag-and-drop
- **4.2**: Integration with profile management
