import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import TermsCheckbox from "@/components/auth/TermsCheckbox";
import { supabase } from "@/integrations/supabase/client";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { validateEmail } from "@/utils/formValidation";
interface PhoneRegisterFormProps {
  className?: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  terms?: string;
  code?: string;
}

const e164Regex = /^\+[1-9]\d{7,14}$/; // Require country code, 8-15 digits total

const PhoneRegisterForm = ({ className }: PhoneRegisterFormProps) => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const [step, setStep] = useState<"input" | "verify">("input");
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Accessibility: focus first field on step change
  useEffect(() => {
    if (step === "input") {
      const el = document.getElementById("fullName");
      el?.focus();
    } else {
      const el = document.querySelector<HTMLInputElement>("input[autocomplete='one-time-code']");
      el?.focus();
    }
  }, [step]);

  const startCooldown = () => {
    setResendCooldown(30);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const validateInputStep = (): boolean => {
    const nextErrors: FormErrors = {};
    let valid = true;

    if (!name.trim()) {
      nextErrors.name = "Full name is required";
      valid = false;
    }

    if (!email.trim()) {
      nextErrors.email = "Email is required";
      valid = false;
    } else if (!validateEmail(email)) {
      nextErrors.email = "Enter a valid email address";
      valid = false;
    }

    if (!phone.trim()) {
      nextErrors.phone = "Phone number is required";
      valid = false;
    } else if (!e164Regex.test(phone)) {
      nextErrors.phone = "Use international format, e.g. +233XXXXXXXXX";
      valid = false;
    }

    if (!acceptTerms) {
      nextErrors.terms = "You must accept the terms and conditions";
      valid = false;
    }

    setErrors(nextErrors);
    return valid;
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInputStep()) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone,
        options: {
          channel: "sms",
          shouldCreateUser: true,
          data: {
            full_name: name,
            email,
            phone,
            is_stylist: false,
          },
        },
      });

      if (error) throw error;

      toast.success("We sent you a verification code via SMS.");
      setStep("verify");
      setCanResend(true);
      startCooldown();
    } catch (err: any) {
      console.error("send otp error:", err);
      const msg = String(err?.message || "Could not send code. Try again.");
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code || code.length < 6) {
      setErrors((prev) => ({ ...prev, code: "Enter the 6-digit code" }));
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone,
        token: code,
        type: "sms",
      });
      if (error) throw error;

      // Attempt to persist email to profile without triggering email verification
      try {
        const userId = data.user?.id;
        if (userId && email) {
          await supabase.from("profiles").update({ email }).eq("id", userId);
        }
      } catch (profileErr) {
        console.warn("Profile email update skipped/failed:", profileErr);
      }

      toast.success("Phone verified! You're all set.");
      navigate("/");
    } catch (err: any) {
      console.error("verify otp error:", err);
      const msg = String(err?.message || "Invalid or expired code. Try again.");
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!canResend || resendCooldown > 0) return;
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone,
        options: { channel: "sms", shouldCreateUser: true },
      });
      if (error) throw error;
      toast.success("Code resent. Check your SMS.");
      startCooldown();
    } catch (err: any) {
      console.error("resend otp error:", err);
      toast.error(err?.message || "Could not resend code.");
    }
  };

  return (
    <Card className={`animate-slide-up ${className ?? ""}`}>
      {step === "input" ? (
        <form onSubmit={handleSendOtp}>
          <CardHeader>
            <CardTitle>Sign Up with Phone</CardTitle>
            <CardDescription>Enter your details to get a verification code</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email (no verification)</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                inputMode="tel"
                placeholder="e.g. +233XXXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={errors.phone ? "border-destructive" : ""}
              />
              <p className="text-xs text-muted-foreground">Use international format with country code</p>
              {errors.phone && <p className="text-sm text-destructive mt-1">{errors.phone}</p>}
            </div>

            <TermsCheckbox checked={acceptTerms} onCheckedChange={setAcceptTerms} error={errors.terms} />
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <div className="flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>Sending code...</span>
                </div>
              ) : (
                "Send Verification Code"
              )}
            </Button>
          </CardFooter>
        </form>
      ) : (
        <form onSubmit={handleVerify}>
          <CardHeader>
            <CardTitle>Verify Phone</CardTitle>
            <CardDescription>Enter the 6-digit code sent to {phone}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">Verification Code</Label>
              <div className="flex justify-center">
                <InputOTP maxLength={6} value={code} onChange={setCode}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              {errors.code && <p className="text-sm text-destructive mt-1">{errors.code}</p>}
              <div className="text-sm text-muted-foreground">
                Didn't receive it?{" "}
                <Button type="button" variant="link" className="px-1" onClick={handleResend} disabled={resendCooldown > 0}>
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
                </Button>
              </div>
              <div className="text-xs text-muted-foreground">Entered a wrong number? <Button type="button" variant="link" className="px-1" onClick={() => setStep("input")}>Change number</Button></div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <div className="flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>Verifying...</span>
                </div>
              ) : (
                "Verify and Continue"
              )}
            </Button>
          </CardFooter>
        </form>
      )}
    </Card>
  );
};

export default PhoneRegisterForm;
