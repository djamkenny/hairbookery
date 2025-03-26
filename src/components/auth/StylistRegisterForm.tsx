
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Scissors } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import PasswordInput from "@/components/auth/PasswordInput";
import TermsCheckbox from "@/components/auth/TermsCheckbox";
import { 
  validateEmail, 
  validatePassword, 
  createEmptyStylistFormErrors,
  StylistFormErrors
} from "@/utils/stylistFormValidation";

const StylistRegisterForm = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [experience, setExperience] = useState("");
  const [bio, setBio] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [formErrors, setFormErrors] = useState<StylistFormErrors>(createEmptyStylistFormErrors());

  const validateForm = () => {
    const errors = createEmptyStylistFormErrors();
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
      // Register stylist through supabase auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            is_stylist: true,
            specialty,
            experience,
            bio
          },
        },
      });
      
      if (error) {
        throw error;
      }
      
      toast.success("Stylist account created successfully! Please check your email to verify your account.");
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
          <CardTitle>Join as a Stylist</CardTitle>
          <CardDescription>
            Enter your details to create a stylist account
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Personal Information */}
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
          
          {/* Professional Information */}
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
              "Register as a Stylist"
            )}
          </Button>
          
          <div className="text-center text-sm">
            Already have a stylist account?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
};

export default StylistRegisterForm;
