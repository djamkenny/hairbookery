
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PencilIcon, ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import ProfileAvatar from "@/components/profile/ProfileAvatar";

interface StylistInfoTabProps {
  user: any;
  fullName: string;
  setFullName: (name: string) => void;
  email: string;
  phone: string;
  setPhone: (phone: string) => void;
  specialty: string;
  setSpecialty: (specialty: string) => void;
  experience: string;
  setExperience: (experience: string) => void;
  bio: string;
  setBio: (bio: string) => void;
}

const StylistInfoTab = ({ 
  user, 
  fullName, 
  setFullName, 
  email, 
  phone, 
  setPhone,
  specialty,
  setSpecialty,
  experience,
  setExperience,
  bio,
  setBio
}: StylistInfoTabProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cardImage, setCardImage] = useState<string | null>(null);
  const [isUploadingCard, setIsUploadingCard] = useState(false);

  // Create form
  const form = useForm({
    defaultValues: {
      fullName,
      phone,
      specialty,
      experience,
      bio
    }
  });

  // Update form values when props change
  useEffect(() => {
    form.reset({
      fullName,
      phone,
      specialty,
      experience,
      bio
    });
  }, [fullName, phone, specialty, experience, bio, form]);

  // Function to refresh user data when avatar is updated
  const handleAvatarUpdate = async (avatarUrl: string) => {
    // Trigger a refresh by incrementing the refreshTrigger state
    setRefreshTrigger(prev => prev + 1);
  };

  // Fetch the latest user data when refreshTrigger changes
  useEffect(() => {
    const refreshUserData = async () => {
      try {
        const { data: { user: updatedUser } } = await supabase.auth.getUser();
        if (updatedUser && updatedUser.user_metadata) {
          // Update state with the fresh user data
          const metadata = updatedUser.user_metadata;
          if (metadata.full_name) setFullName(metadata.full_name);
          if (metadata.phone) setPhone(metadata.phone);
          if (metadata.specialty) setSpecialty(metadata.specialty);
          if (metadata.experience) setExperience(metadata.experience);
          if (metadata.bio) setBio(metadata.bio);
        }
      } catch (error) {
        console.error("Error refreshing user data:", error);
      }
    };

    if (refreshTrigger > 0) {
      refreshUserData();
    }
  }, [refreshTrigger, setFullName, setPhone, setBio, setSpecialty, setExperience]);

  // Fetch stylist card image on component mount
  useEffect(() => {
    const fetchCardImage = async () => {
      if (user?.id) {
        try {
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('card_image_url')
            .eq('id', user.id)
            .single();
            
          if (error) throw error;
          
          if (profileData && profileData.card_image_url) {
            setCardImage(profileData.card_image_url);
          }
        } catch (error) {
          console.error("Error fetching card image:", error);
        }
      }
    };
    
    fetchCardImage();
  }, [user?.id, refreshTrigger]);

  const onSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);

      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: data.fullName,
          phone: data.phone,
          specialty: data.specialty,
          experience: data.experience,
          bio: data.bio
        }
      });

      if (error) throw error;

      // Update local state
      setFullName(data.fullName);
      setPhone(data.phone);
      setSpecialty(data.specialty);
      setExperience(data.experience);
      setBio(data.bio);
      setIsEditing(false);
      
      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
      console.error("Error updating profile:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle card image upload
  const handleCardImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    
    if (!files || !files.length) return;
    
    const file = files[0];
    
    // Validate file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image is too large. Maximum size is 5MB.");
      return;
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Only image files are allowed.");
      return;
    }
    
    try {
      setIsUploadingCard(true);
      
      // Generate a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-card-image-${Date.now()}.${fileExt}`;
      const filePath = `card-images/${fileName}`;
      
      // Upload the file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('stylist-images')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      // Get the public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('stylist-images')
        .getPublicUrl(filePath);
        
      // Update the profile with the new card image URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ card_image_url: publicUrl })
        .eq('id', user.id);
        
      if (updateError) throw updateError;
      
      // Update local state
      setCardImage(publicUrl);
      
      toast.success("Card image updated successfully");
      setRefreshTrigger(prev => prev + 1);
    } catch (error: any) {
      console.error("Error uploading card image:", error);
      toast.error(error.message || "Failed to upload card image");
    } finally {
      setIsUploadingCard(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Stylist Information</h1>
        {!isEditing && (
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            <PencilIcon className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* First column - profile details */}
        <div className="lg:col-span-2">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Personal & Professional Details</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Email</label>
                        <Input value={email} disabled />
                        <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="Your phone number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="specialty"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Specialty</FormLabel>
                            <FormControl>
                              <Input placeholder="Your specialty" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="experience"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Experience</FormLabel>
                            <FormControl>
                              <Input placeholder="Your experience level" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bio</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Tell clients about yourself and your expertise" 
                              {...field} 
                              rows={4}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end gap-2 pt-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </form>
                </Form>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Full Name</h3>
                      <p className="text-lg">{fullName}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Email</h3>
                      <p className="text-lg">{email}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Phone</h3>
                      <p className="text-lg">{phone || "Not provided"}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Specialty</h3>
                      <p className="text-lg">{specialty || "Not specified"}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Experience</h3>
                    <p className="text-lg">{experience || "Not specified"}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Bio</h3>
                    <p className="text-base leading-relaxed">{bio || "No bio provided"}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Second column - profile photo and card image */}
        <div className="lg:col-span-1">
          <div className="space-y-6">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Profile Photo</CardTitle>
              </CardHeader>
              <CardContent>
                <ProfileAvatar 
                  user={user} 
                  fullName={fullName} 
                  onAvatarUpdate={handleAvatarUpdate}
                />
              </CardContent>
            </Card>
            
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Card Image</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="aspect-square overflow-hidden rounded-md border border-border/40">
                    {cardImage ? (
                      <img 
                        src={cardImage} 
                        alt="Stylist Card" 
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-muted">
                        <ImageIcon className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <p className="text-sm text-muted-foreground">
                      This image will be displayed on your public stylist card.
                    </p>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleCardImageUpload}
                      disabled={isUploadingCard}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground">
                      Recommended: Square image (1:1 ratio), max 5MB
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StylistInfoTab;
