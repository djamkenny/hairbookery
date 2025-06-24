
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProfessionalInfoCardProps {
  isEditing: boolean;
  specialty: string;
  setSpecialty: (specialty: string) => void;
  experience: string;
  setExperience: (experience: string) => void;
}

const ProfessionalInfoCard = ({
  isEditing,
  specialty,
  setSpecialty,
  experience,
  setExperience
}: ProfessionalInfoCardProps) => {
  // Format the specialist information for display
  const formatExperience = (exp: string) => {
    if (!exp) return "Not specified";
    return isNaN(Number(exp)) ? exp : `${exp} years`;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Professional Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        {isEditing ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="specialty" className="text-sm font-medium">Specialty</Label>
              <Input
                id="specialty"
                type="text"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                placeholder="e.g. Hair Specialist, Colorist, Barber"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="experience" className="text-sm font-medium">Experience</Label>
              <Input
                id="experience"
                type="text"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="Years of experience or qualifications"
              />
            </div>
          </>
        ) : (
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Specialty</h3>
              <p className="text-foreground">{specialty || "Not specified"}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Experience</h3>
              <p className="text-foreground">{formatExperience(experience)}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfessionalInfoCard;
