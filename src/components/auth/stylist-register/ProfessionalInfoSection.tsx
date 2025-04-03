
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StylistFormErrors } from "@/utils/stylistFormValidation";

interface ProfessionalInfoSectionProps {
  specialty: string;
  setSpecialty: (specialty: string) => void;
  experience: string;
  setExperience: (experience: string) => void;
  location: string;
  setLocation: (location: string) => void;
  bio: string;
  setBio: (bio: string) => void;
  formErrors: StylistFormErrors;
}

const ProfessionalInfoSection = ({
  specialty,
  setSpecialty,
  experience,
  setExperience,
  location,
  setLocation,
  bio,
  setBio,
  formErrors
}: ProfessionalInfoSectionProps) => {
  return (
    <div className="pt-2 space-y-4">
      <h3 className="font-medium">Professional Information</h3>
      
      <div className="space-y-2">
        <Label htmlFor="specialty">Specialty</Label>
        <Input
          id="specialty"
          placeholder="e.g. Hair Coloring, Styling, etc."
          value={specialty}
          onChange={(e) => setSpecialty(e.target.value)}
          className={formErrors.specialty ? "border-destructive" : ""}
        />
        {formErrors.specialty && (
          <p className="text-sm text-destructive mt-1">{formErrors.specialty}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="experience">Experience</Label>
        <Input
          id="experience"
          placeholder="e.g. 5 years"
          value={experience}
          onChange={(e) => setExperience(e.target.value)}
          className={formErrors.experience ? "border-destructive" : ""}
        />
        {formErrors.experience && (
          <p className="text-sm text-destructive mt-1">{formErrors.experience}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="location">Salon/Workshop Location</Label>
        <Input
          id="location"
          placeholder="Enter the full address of your salon or workshop"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className={formErrors.location ? "border-destructive" : ""}
        />
        {formErrors.location && (
          <p className="text-sm text-destructive mt-1">{formErrors.location}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Provide an address that clients can easily find with navigation apps or ride services
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          placeholder="Tell clients about yourself and your expertise"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className={formErrors.bio ? "border-destructive" : ""}
          rows={4}
        />
        {formErrors.bio && (
          <p className="text-sm text-destructive mt-1">{formErrors.bio}</p>
        )}
      </div>
    </div>
  );
};

export default ProfessionalInfoSection;
