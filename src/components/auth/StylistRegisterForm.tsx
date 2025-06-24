
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import TermsCheckbox from "@/components/auth/TermsCheckbox";
import { 
  validateEmail, 
  validatePassword, 
  createEmptySpecialistFormErrors,
  SpecialistFormErrors
} from "@/utils/stylistFormValidation";
import PersonalInfoSection from "./stylist-register/PersonalInfoSection";
import ProfessionalInfoSection from "./stylist-register/ProfessionalInfoSection";

const SpecialistRegisterForm = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [experience, setExperience] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [formErrors, setFormErrors] = useState<SpecialistFormErrors>(createEmptySpecialistFormErrors());

  const validateForm = () => {
    const errors = createEmptySpecialistFormErrors();
    let isValid = true;

    if (!name.trim()) {
      errors.name = "Name is required";
      isValid = false;
    }

    if (!email.trim()) {
      errors.email = "Email is required";
      isValid = false;
    } else if (!validateEmail(email)) {
      errors.email = "Please enter a valid email address";
      isValid = false;
    }

    if (!password) {
      errors.password = "Password is required";
      isValid = false;
    } else if (!validatePassword(password)) {
      errors.password = "Password must be at least 8 characters";
      isValid = false;
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    if (!specialty.trim()) {
      errors.specialty = "Specialty is required";
      isValid = false;
    }

    if (!experience.trim()) {
      errors.experience = "Experience level is required";
      isValid = false;
    }

    if (!bio.trim()) {
      errors.bio = "Bio is required";
      isValid = false;
    }

    if (!location.trim()) {
      errors.location = "Salon/workshop location is required";
      isValid = false;
    }

    if (!acceptTerms) {
      errors.terms = "You must accept the terms and conditions";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Register specialist through supabase auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            is_stylist: true,
            specialty,
            experience,
            bio,
            location
          },
        },
      });
      
      if (error) {
        throw error;
      }
      
      toast.success("Specialist account created successfully! Please check your email to verify your account.");
      navigate("/login");
    } catch (error: any) {
      console.error("Registration error:", error);
      
      const errorMessage = error.message || "Registration failed. Please try again.";
      if (errorMessage.includes("already registered")) {
        toast.error("This email is already registered. Please use a different email or try to login.");
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="animate-slide-up">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Join as a Specialist</CardTitle>
          <CardDescription>
            Enter your details to create a specialist account
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <PersonalInfoSection 
            name={name}
            setName={setName}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            formErrors={formErrors}
          />
          
          <ProfessionalInfoSection
            specialty={specialty}
            setSpecialty={setSpecialty}
            experience={experience}
            setExperience={setExperience}
            location={location}
            setLocation={setLocation}
            bio={bio}
            setBio={setBio}
            formErrors={formErrors}
          />

          <TermsCheckbox 
            checked={acceptTerms}
            onCheckedChange={setAcceptTerms}
            error={formErrors.terms}
          />
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-4">
          <Button 
            type="submit" 
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Creating account...</span>
              </div>
            ) : (
              "Register as a Specialist"
            )}
          </Button>
          
          <div className="text-center text-sm">
            Already have a specialist account?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
};

export default SpecialistRegisterForm;
