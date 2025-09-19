import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { User, MapPin, Briefcase, Camera } from "lucide-react";
import ProfileAvatar from "@/components/profile/ProfileAvatar";

const ProfileSettings = ({ onRefresh }: { onRefresh?: () => Promise<void> }) => {
  const [formData, setFormData] = useState({
    full_name: "",
    specialty: "",
    experience: "",
    bio: "",
    location: "",
    phone: "",
    avatar_url: "",
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;

        if (user) {
          setUser(user);
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (profileError && profileError.code !== 'PGRST116') {
            throw profileError;
          }

          if (profile) {
            setFormData({
              full_name: profile.full_name || "",
              specialty: profile.specialty || "",
              experience: profile.experience || "",
              bio: profile.bio || "",
              location: profile.location || "",
              phone: profile.phone || "",
              avatar_url: profile.avatar_url || "",
            });
          }
        }
      } catch (error: any) {
        console.error("Error loading profile:", error);
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAvatarUpdate = async (newAvatarUrl: string) => {
    setFormData(prev => ({
      ...prev,
      avatar_url: newAvatarUrl
    }));
    
    // Refresh parent component if callback provided
    if (onRefresh) {
      await onRefresh();
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      if (user) {
        // Validate required fields
        if (!formData.full_name.trim()) {
          toast.error("Full name is required");
          return;
        }

        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            full_name: formData.full_name.trim(),
            specialty: formData.specialty.trim(),
            experience: formData.experience,
            bio: formData.bio.trim(),
            location: formData.location.trim(),
            phone: formData.phone.trim(),
            avatar_url: formData.avatar_url,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);

        if (updateError) throw updateError;

        toast.success("Profile updated successfully");
        
        // Refresh parent component
        if (onRefresh) {
          await onRefresh();
        }
      }
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Profile Photo
          </CardTitle>
          <CardDescription>
            Upload and manage your profile picture
          </CardDescription>
        </CardHeader>
        <CardContent>
          {user && (
            <ProfileAvatar
              user={user}
              fullName={formData.full_name}
              avatarUrl={formData.avatar_url}
              onAvatarUpdate={handleAvatarUpdate}
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
          <CardDescription>
            Update your basic profile information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name" className="text-base font-medium">
                Full Name *
              </Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => handleChange('full_name', e.target.value)}
                placeholder="Enter your full name"
                disabled={saving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-base font-medium">
                Phone Number
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="Enter your phone number"
                disabled={saving}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="text-base font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location
            </Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder="e.g., New York, NY or Online"
              disabled={saving}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Professional Information
          </CardTitle>
          <CardDescription>
            Update your professional details and expertise
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="specialty" className="text-base font-medium">
                Specialty
              </Label>
              <Input
                id="specialty"
                value={formData.specialty}
                onChange={(e) => {
                  if (e.target.value.length <= 50) {
                    handleChange('specialty', e.target.value);
                  }
                }}
                placeholder="e.g., Hair Styling, Color Specialist"
                disabled={saving}
                maxLength={50}
              />
              <p className="text-sm text-muted-foreground">
                {formData.specialty.length}/50 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience" className="text-base font-medium">
                Experience Level
              </Label>
              <Select
                value={formData.experience}
                onValueChange={(value) => handleChange('experience', value)}
                disabled={saving}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select experience level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Entry Level (0-2 years)">Entry Level (0-2 years)</SelectItem>
                  <SelectItem value="Mid Level (3-5 years)">Mid Level (3-5 years)</SelectItem>
                  <SelectItem value="Senior Level (6-10 years)">Senior Level (6-10 years)</SelectItem>
                  <SelectItem value="Expert Level (10+ years)">Expert Level (10+ years)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio" className="text-base font-medium">
              Professional Bio
            </Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleChange('bio', e.target.value)}
              placeholder="Tell clients about your expertise, approach, and what makes you unique..."
              className="min-h-[100px]"
              disabled={saving}
            />
            <p className="text-sm text-muted-foreground">
              {formData.bio.length}/500 characters
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
};

export default ProfileSettings;