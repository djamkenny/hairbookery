
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ServiceImageUploadProps {
  serviceId: string;
  currentImages: string[];
  onImagesUpdate: (images: string[]) => void;
  maxImages?: number;
}

export const ServiceImageUpload: React.FC<ServiceImageUploadProps> = ({
  serviceId,
  currentImages,
  onImagesUpdate,
  maxImages = 5
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (files: FileList) => {
    if (!files || files.length === 0) return;

    if (currentImages.length + files.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed per service`);
      return;
    }

    try {
      setUploading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("You must be logged in to upload images");
        return;
      }

      const uploadPromises = Array.from(files).map(async (file) => {
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`File ${file.name} is too large. Maximum size is 5MB`);
        }

        if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
          throw new Error(`File ${file.name} is not a supported image format`);
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${serviceId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('service-images')
          .upload(fileName, file);
          
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('service-images')
          .getPublicUrl(fileName);
          
        return publicUrl;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      const newImages = [...currentImages, ...uploadedUrls];
      
      // Update the service in the database
      const { error: updateError } = await supabase
        .from('services')
        .update({ image_urls: newImages })
        .eq('id', serviceId);
        
      if (updateError) throw updateError;
      
      onImagesUpdate(newImages);
      toast.success(`${uploadedUrls.length} image(s) uploaded successfully`);
      
    } catch (error: any) {
      console.error('Error uploading images:', error);
      toast.error(error.message || "Failed to upload images");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      handleImageUpload(files);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
    const files = event.dataTransfer.files;
    if (files) {
      handleImageUpload(files);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
  };

  const handleRemoveImage = async (imageUrl: string) => {
    try {
      const newImages = currentImages.filter(url => url !== imageUrl);
      
      // Update the service in the database
      const { error: updateError } = await supabase
        .from('services')
        .update({ image_urls: newImages })
        .eq('id', serviceId);
        
      if (updateError) throw updateError;
      
      // Try to delete from storage (extract path from URL)
      const urlParts = imageUrl.split('/');
      const fileName = urlParts.slice(-3).join('/'); // user_id/service_id/filename
      
      await supabase.storage
        .from('service-images')
        .remove([fileName]);
      
      onImagesUpdate(newImages);
      toast.success("Image removed successfully");
      
    } catch (error: any) {
      console.error('Error removing image:', error);
      toast.error("Failed to remove image");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Service Images ({currentImages.length}/{maxImages})</h4>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || currentImages.length >= maxImages}
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          {uploading ? 'Uploading...' : 'Add Images'}
        </Button>
      </div>
      
      <input
        type="file"
        ref={fileInputRef}
        accept="image/jpeg, image/png, image/gif, image/webp"
        multiple
        className="hidden"
        onChange={handleFileSelect}
        disabled={uploading}
      />
      
      {currentImages.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {currentImages.map((imageUrl, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                <img
                  src={imageUrl}
                  alt={`Service image ${index + 1}`}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                  <Button
                    size="icon"
                    variant="destructive"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleRemoveImage(imageUrl)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div 
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
            dragOver 
              ? 'border-primary bg-primary/5' 
              : 'border-muted-foreground/25 hover:border-muted-foreground/40'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No images uploaded yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Add images to showcase your service
          </p>
          <p className="text-xs text-muted-foreground">
            Drag and drop images here, or click to browse
          </p>
        </div>
      )}
      
      <div className="text-xs text-muted-foreground space-y-1">
        <p>Upload high-quality images (JPEG, PNG, GIF, WebP). Max 5MB per image.</p>
        <p>Recommended: Use high-resolution images that clearly show your work.</p>
      </div>
    </div>
  );
};
