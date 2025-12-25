/**
 * Add New Property Page
 * 
 * Form for brokers to create new property listings.
 * Includes image upload, property details, and submission for admin approval.
 * 
 * Requirements: 27.1, 27.2
 */

'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import Button from '@/components/ui/Button';

interface PropertyFormData {
  title: string;
  description: string;
  location: string;
  price: string;
  co_owner_count: string;
  images: File[];
}

interface ImagePreview {
  file: File;
  url: string;
}

/**
 * Add New Property Page Component
 * Provides form for brokers to submit new property listings
 */
export default function NewPropertyPage() {
  const [formData, setFormData] = useState<PropertyFormData>({
    title: '',
    description: '',
    location: '',
    price: '',
    co_owner_count: '2',
    images: [],
  });

  const [errors, setErrors] = useState<Partial<Record<keyof PropertyFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<ImagePreview[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  /**
   * Handles input field changes
   */
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name as keyof PropertyFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  /**
   * Handles image file selection
   */
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      
      // Create preview URLs for new files
      const newPreviews: ImagePreview[] = files.map(file => ({
        file,
        url: URL.createObjectURL(file),
      }));
      
      // Add to existing previews
      setImagePreviews(prev => [...prev, ...newPreviews]);
      setFormData(prev => ({ ...prev, images: [...prev.images, ...files] }));
      
      if (errors.images) {
        setErrors(prev => ({ ...prev, images: undefined }));
      }
      
      // Reset input value to allow selecting the same file again
      e.target.value = '';
    }
  };

  /**
   * Removes an image from the preview list
   */
  const removeImage = (index: number) => {
    setImagePreviews(prev => {
      const newPreviews = [...prev];
      // Revoke the object URL to free memory
      URL.revokeObjectURL(newPreviews[index].url);
      newPreviews.splice(index, 1);
      return newPreviews;
    });
    
    setFormData(prev => {
      const newImages = [...prev.images];
      newImages.splice(index, 1);
      return { ...prev, images: newImages };
    });
  };

  /**
   * Handles drag start event
   */
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  /**
   * Handles drag over event
   */
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === index) return;
    
    // Reorder the arrays
    setImagePreviews(prev => {
      const newPreviews = [...prev];
      const draggedItem = newPreviews[draggedIndex];
      newPreviews.splice(draggedIndex, 1);
      newPreviews.splice(index, 0, draggedItem);
      return newPreviews;
    });
    
    setFormData(prev => {
      const newImages = [...prev.images];
      const draggedItem = newImages[draggedIndex];
      newImages.splice(draggedIndex, 1);
      newImages.splice(index, 0, draggedItem);
      return { ...prev, images: newImages };
    });
    
    setDraggedIndex(index);
  };

  /**
   * Handles drag end event
   */
  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  /**
   * Validates form data
   */
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof PropertyFormData, string>> = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'Valid price is required';
    if (!formData.co_owner_count || parseInt(formData.co_owner_count) < 2 || parseInt(formData.co_owner_count) > 5) {
      newErrors.co_owner_count = 'Number of co-owners must be between 2 and 5';
    }
    if (formData.images.length === 0) newErrors.images = 'At least one image is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handles form submission
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Upload all images at once
      const uploadFormData = new FormData();
      formData.images.forEach(image => {
        uploadFormData.append('images', image);
      });

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || 'Failed to upload images');
      }

      const uploadResult = await uploadResponse.json();
      
      if (!uploadResult.success || !uploadResult.urls) {
        throw new Error(uploadResult.error || 'Failed to upload images');
      }

      const imageUrls = uploadResult.urls;

      // Then, create property with image URLs
      const propertyData = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        price: parseFloat(formData.price),
        co_owner_count: parseInt(formData.co_owner_count),
        images: imageUrls,
      };

      const response = await fetch('/api/broker/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(propertyData),
      });

      if (!response.ok) {
        throw new Error('Failed to create property');
      }

      const result = await response.json();

      if (result.success) {
        setSubmitSuccess(true);
        // Redirect after 2 seconds
        setTimeout(() => {
          window.location.href = '/dashboard/broker/properties';
        }, 2000);
      } else {
        throw new Error(result.error || 'Failed to create property');
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="font-serif font-bold text-2xl text-gray-900 mb-2">
            Property Submitted Successfully!
          </h2>
          <p className="font-sans text-gray-600">
            Your property has been submitted for admin approval. Redirecting...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="font-serif font-bold text-4xl text-gray-900 mb-2">
          Add New Property
        </h1>
        <p className="font-sans text-gray-600">
          Fill in the details below to create a new property listing
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-8 space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block font-sans font-medium text-gray-700 mb-2">
            Property Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Spacious 3BHK Apartment in Bandra"
            className={`w-full px-4 py-2 border rounded-md font-sans focus:outline-none focus:ring-2 ${
              errors.title ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block font-sans font-medium text-gray-700 mb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            placeholder="Describe the property, its features, and amenities..."
            className={`w-full px-4 py-2 border rounded-md font-sans focus:outline-none focus:ring-2 ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
        </div>

        {/* Location */}
        <div>
          <label htmlFor="location" className="block font-sans font-medium text-gray-700 mb-2">
            Location <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="e.g., Bandra West, Mumbai"
            className={`w-full px-4 py-2 border rounded-md font-sans focus:outline-none focus:ring-2 ${
              errors.location ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
        </div>

        {/* Price and Co-owner Count */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="price" className="block font-sans font-medium text-gray-700 mb-2">
              Total Property Price (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="50000000"
              className={`w-full px-4 py-2 border rounded-md font-sans focus:outline-none focus:ring-2 ${
                errors.price ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
            <p className="mt-1 text-xs text-gray-500">Enter the full property value</p>
          </div>

          <div>
            <label htmlFor="co_owner_count" className="block font-sans font-medium text-gray-700 mb-2">
              Number of Co-owners <span className="text-red-500">*</span>
            </label>
            <select
              id="co_owner_count"
              name="co_owner_count"
              value={formData.co_owner_count}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md font-sans focus:outline-none focus:ring-2 ${
                errors.co_owner_count ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="2">2 Co-owners</option>
              <option value="3">3 Co-owners</option>
              <option value="4">4 Co-owners</option>
              <option value="5">5 Co-owners</option>
            </select>
            {errors.co_owner_count && <p className="mt-1 text-sm text-red-600">{errors.co_owner_count}</p>}
            <p className="mt-1 text-xs text-gray-500">How many people will co-own this property</p>
          </div>
        </div>

        {/* Images */}
        <div>
          <label htmlFor="images" className="block font-sans font-medium text-gray-700 mb-2">
            Property Images <span className="text-red-500">*</span>
          </label>
          
          {/* Image Previews */}
          {imagePreviews.length > 0 && (
            <div className="mb-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              {imagePreviews.map((preview, index) => (
                <div
                  key={index}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`relative group cursor-move ${
                    draggedIndex === index ? 'opacity-50' : ''
                  }`}
                >
                  <img
                    src={preview.url}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                  />
                  
                  {/* Drag Handle Icon */}
                  <div className="absolute top-2 right-2 bg-white bg-opacity-90 rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                    </svg>
                  </div>
                  
                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 left-2 p-1.5 bg-red-500 rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                    title="Remove image"
                  >
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  
                  {/* Image Number Badge */}
                  <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                    #{index + 1}
                  </div>
                  
                  {/* Cover Photo Badge */}
                  {index === 0 && (
                    <div className="absolute bottom-2 right-2 bg-primary-600 text-white text-xs px-2 py-1 rounded">
                      Cover
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {/* File Input */}
          <div className="relative">
            <input
              type="file"
              id="images"
              name="images"
              onChange={handleImageChange}
              accept="image/*"
              multiple
              className="hidden"
            />
            <label
              htmlFor="images"
              className={`flex items-center justify-center w-full px-4 py-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                errors.images 
                  ? 'border-red-500 bg-red-50 hover:bg-red-100' 
                  : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className="text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <p className="mt-2 text-sm text-gray-600">
                  <span className="font-medium text-primary-600">Click to upload</span> or drag and drop
                </p>
                <p className="mt-1 text-xs text-gray-500">PNG, JPG, WebP up to 10MB each</p>
              </div>
            </label>
          </div>
          
          {errors.images && <p className="mt-2 text-sm text-red-600">{errors.images}</p>}
          
          {imagePreviews.length > 0 && (
            <p className="mt-2 text-sm text-gray-600">
              {imagePreviews.length} image{imagePreviews.length !== 1 ? 's' : ''} selected. 
              Drag to reorder • First image will be the cover photo.
            </p>
          )}
        </div>

        {/* Submit Error */}
        {submitError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-800">{submitError}</p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-4 pt-4">
          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting}
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? 'Submitting...' : 'Submit for Approval'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => window.location.href = '/dashboard/broker'}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
