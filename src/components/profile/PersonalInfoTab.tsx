
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PencilIcon, CheckIcon } from "lucide-react";
import { toast } from "sonner";

interface PersonalInfoTabProps {
  user: any;
  fullName: string;
  setFullName: (name: string) => void;
  email: string;
  phone: string;
  setPhone: (phone: string) => void;
}

const PersonalInfoTab = ({ 
  user, 
  fullName, 
  setFullName, 
  email, 
  phone, 
  setPhone 
}: PersonalInfoTabProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSaveProfile = () => {
    setLoading(true);
    
    setTimeout(() => {
      setIsEditing(false);
      setLoading(false);
      toast.success("Profile information updated successfully");
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Personal Information</h1>
        {!isEditing && (
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            <PencilIcon className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        )}
      </div>
      
      <Card className="shadow-sm">
        <CardContent className="p-6">
          {isEditing ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  disabled
                />
                <p className="text-sm text-muted-foreground">
                  Email cannot be changed. Contact support for assistance.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="pt-4 flex gap-2 justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveProfile}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="h-4 w-4 mr-2 animate-spin border-2 border-white border-t-transparent rounded-full"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <CheckIcon className="h-4 w-4 mr-2" />
                      <span>Save Changes</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Full Name</label>
                  <p className="font-medium">{fullName}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Email</label>
                  <p className="font-medium">{email}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Phone</label>
                  <p className="font-medium">{phone}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Profile Photo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src="https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3" alt="User" />
              <AvatarFallback>{user?.email?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <Button size="sm" variant="outline">Change Photo</Button>
              <p className="text-xs text-muted-foreground">
                JPG, GIF or PNG. Max size 1MB.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PersonalInfoTab;
