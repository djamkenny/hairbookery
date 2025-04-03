
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  // Format the stylist information for display
  const formatExperience = (exp: string) => {
    if (!exp) return "Not specified";
    return isNaN(Number(exp)) ? exp : `${exp} years`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Professional Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing ? (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Specialty</label>
              <input
                type="text"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md"
                placeholder="e.g. Hair Stylist, Colorist, Barber"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Experience</label>
              <input
                type="text"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md"
                placeholder="Years of experience or qualifications"
              />
            </div>
          </>
        ) : (
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Specialty</h3>
              <p>{specialty || "Not specified"}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Experience</h3>
              <p>{formatExperience(experience)}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfessionalInfoCard;
