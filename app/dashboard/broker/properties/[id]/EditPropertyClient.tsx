'use client';

import { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import { X } from 'lucide-react';

interface PropertyData {
  id: string;
  title: string;
  description: string;
  location: string;
  price: number;
  co_owner_count: number;
  images: string[];
  status: string;
}

/**
 * Edit Property Client Component
 * Allows brokers to edit their existing property details
 */
export default function EditPropertyClient() {
  const [propertyId, setPropertyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');
  const [coOwnerCount, setCoOwnerCount] = useState('2');
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    // Extract property ID from URL
    const path = window.location.pathname;
    const matches = path.match(/\/dashboard\/broker\/properties\/([^\/]+)/);
    const id = matches ? matches[1] : null;
    setPropertyId(id);

    if (id) {
      fetchProperty(id);
    }
  }, []);

  /**
   * Fetch property data from API
   */
  const fetchProperty = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/broker/properties/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to load property');
      }

      const data = await response.json();
      
      if (data.success && data.property) {
        const property: PropertyData = data.property;
        setTitle(property.title);
        setDescription(property.description);
        setLocation(property.location);
        setPrice(property.price.toString());
        setCoOwnerCount(property.co_owner_count.toString());
        
        // Parse images if they're stored as JSON string
        const images = typeof property.images === 'string' 
          ? JSON.parse(property.images) 
          : property.images;
        setExistingImages(images || []);
      } else {
        throw new Error(data.error || 'Property not found');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load property');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle new image selection
   */
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length === 0) return;

    // Add new files
    setNewImages(prev => [...prev, ...files]);

    // Create previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  /**
   * Remove existing image
   */
  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  /**
   * Remove new image
   */
  const removeNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!propertyId) return;

    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      // Upload new images if any
      let newImageUrls: string[] = [];
      
      if (newImages.length > 0) {
        const formData = new FormData();
        newImages.forEach(image => {
          formData.append('images', image);
        });

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
          credentials: 'include',
        });

        const uploadData = await uploadResponse.json();

        if (!uploadData.success) {
          throw new Error(uploadData.error || 'Failed to upload images');
        }

        newImageUrls = uploadData.urls || [];
      }

      // Combine existing and new images
      const allImages = [...existingImages, ...newImageUrls];

      // Update property
      const response = await fetch(`/api/broker/properties/${propertyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          title,
          description,
          location,
          price: parseInt(price),
          co_owner_count: parseInt(coOwnerCount),
          images: JSON.stringify(allImages),
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to update property');
      }

      setSuccess('Property updated successfully!');
      
      // Clear new images
      setNewImages([]);
      setNewImagePreviews([]);
      
      // Refresh property data
      await fetchProperty(propertyId);
      
      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update property');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-serif font-bold text-4xl text-gray-900 mb-2">
          Edit Property
        </h1>
        {propertyId && (
          <p className="font-sans text-gray-600">
            Property ID: {propertyId}
          </p>
        )}
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 font-sans">{success}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-sans">{error}</p>
        </div>
      )}

      {/* Edit Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-8 space-y-6">
        {/* Property Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Property Title *
          </label>
          <input
            type="text"
            id="title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Luxury 3BHK Apartment in Whitefield"
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            id="description"
            required
            rows={6}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the property, its features, amenities, and location benefits..."
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
        </div>

        {/* Location */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
            Location *
          </label>
          <input
            type="text"
            id="location"
            required
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g., Whitefield, Bangalore"
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
        </div>

        {/* Price and Co-owners */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
              Total Property Price (₹) *
            </label>
            <input
              type="number"
              id="price"
              required
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g., 12500000"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              Enter the total value of the property
            </p>
          </div>

          <div>
            <label htmlFor="coOwnerCount" className="block text-sm font-medium text-gray-700 mb-2">
              Number of Co-owners *
            </label>
            <select
              id="coOwnerCount"
              required
              value={coOwnerCount}
              onChange={(e) => setCoOwnerCount(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="2">2 Co-owners</option>
              <option value="3">3 Co-owners</option>
              <option value="4">4 Co-owners</option>
              <option value="5">5 Co-owners</option>
            </select>
          </div>
        </div>

        {/* Existing Images */}
        {existingImages.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Images
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {existingImages.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image}
                    alt={`Property ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={16} />
                  </button>
                  {index === 0 && (
                    <span className="absolute bottom-2 left-2 bg-primary-600 text-white text-xs px-2 py-1 rounded">
                      Cover
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* New Images */}
        <div>
          <label htmlFor="images" className="block text-sm font-medium text-gray-700 mb-2">
            Add More Images
          </label>
          <input
            type="file"
            id="images"
            multiple
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleImageSelect}
            className="w-full"
          />
          <p className="mt-1 text-sm text-gray-500">
            Upload additional property images (JPG, PNG, WebP, max 5MB each)
          </p>

          {/* New Image Previews */}
          {newImagePreviews.length > 0 && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              {newImagePreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  <img
                    src={preview}
                    alt={`New ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeNewImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={16} />
                  </button>
                  <span className="absolute bottom-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                    New
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => window.location.href = '/dashboard/broker/properties'}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={saving}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}
