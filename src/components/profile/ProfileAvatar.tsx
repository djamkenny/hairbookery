
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UploadIcon } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ProfileAvatarProps {
  user: any;
  fullName: string;
  avatarUrl: string | null;
  onAvatarUpdate?: (avatarUrl: string) => void;
}

const ProfileAvatar = ({ user, fullName, avatarUrl, onAvatarUpdate }: ProfileAvatarProps) => {
  const [uploadLoading, setUploadLoading] = useState(false);
  const [localAvatarUrl, setLocalAvatarUrl] = useState<string | null>(avatarUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update local state when prop changes
  useEffect(() => {
    setLocalAvatarUrl(avatarUrl);
  }, [avatarUrl]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("File size should be less than 2MB");
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
      toast.error("Only JPG, PNG and GIF files are allowed");
      return;
    }

    try {
      setUploadLoading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);
        
      if (uploadError) {
        throw uploadError;
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
        
      setLocalAvatarUrl(publicUrl);
      
      // Update both auth metadata and profiles table
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });
      
      if (updateError) {
        throw updateError;
      }

      // Also update the profiles table
      const { error: profileUpdateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user?.id);

      if (profileUpdateError) {
        console.error("Error updating profile avatar:", profileUpdateError);
        // Don't throw here as auth update succeeded
      }
      
      // Call the onAvatarUpdate callback to notify parent component
      if (onAvatarUpdate) {
        onAvatarUpdate(publicUrl);
      }
      
      toast.success("Profile picture updated successfully");
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast.error(error.message || "Failed to update profile picture");
    } finally {
      setUploadLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
        <Avatar className="h-20 w-20 border-2 border-primary/20">
          <AvatarImage 
            src={localAvatarUrl || "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3"} 
            alt={fullName || "User"} 
          />
          <AvatarFallback>{user?.email?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
        </Avatar>
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 rounded-full transition-all flex items-center justify-center">
          <UploadIcon className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        {uploadLoading && (
          <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
      <div className="space-y-2">
        <input
          type="file"
          ref={fileInputRef}
          accept="image/jpeg, image/png, image/gif"
          className="hidden"
          onChange={handleFileChange}
          disabled={uploadLoading}
        />
        <Button 
          size="sm" 
          variant="outline" 
          onClick={handleAvatarClick}
          disabled={uploadLoading}
        >
          {uploadLoading ? 'Uploading...' : 'Change Photo'}
        </Button>
        <p className="text-xs text-muted-foreground">
          JPG, GIF or PNG. Max size 2MB.
        </p>
      </div>
    </div>
  );
};

export default ProfileAvatar;
