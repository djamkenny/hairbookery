
import React from "react";
import { Label } from "@/components/ui/label";
import PasswordInput from "@/components/auth/PasswordInput";
import { Input } from "@/components/ui/input";
import { StylistFormErrors } from "@/utils/stylistFormValidation";

interface PersonalInfoSectionProps {
  name: string;
  setName: (name: string) => void;
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  confirmPassword: string;
  setConfirmPassword: (confirmPassword: string) => void;
  formErrors: StylistFormErrors;
}

const PersonalInfoSection = ({
  name,
  setName,
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  formErrors
}: PersonalInfoSectionProps) => {
  return (
    <div className="space-y-4">
      <h3 className="font-medium">Personal Information</h3>
      
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          placeholder="Enter your full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={formErrors.name ? "border-destructive" : ""}
        />
        {formErrors.name && (
          <p className="text-sm text-destructive mt-1">{formErrors.name}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={formErrors.email ? "border-destructive" : ""}
        />
        {formErrors.email && (
          <p className="text-sm text-destructive mt-1">{formErrors.email}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <PasswordInput
          id="password"
          placeholder="Create a password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={formErrors.password}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <PasswordInput
          id="confirmPassword"
          placeholder="Confirm your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={formErrors.confirmPassword}
          confirmPassword
        />
      </div>
    </div>
  );
};

export default PersonalInfoSection;
