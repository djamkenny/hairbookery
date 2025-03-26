
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";

interface PasswordInputProps {
  id: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  confirmPassword?: boolean;
}

const PasswordInput = ({ 
  id, 
  placeholder, 
  value, 
  onChange, 
  error, 
  confirmPassword = false 
}: PasswordInputProps) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <Input
          id={id}
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={error ? "border-destructive pr-10" : "pr-10"}
        />
        <button
          type="button"
          className="absolute right-3 top-2.5 text-muted-foreground"
          onClick={togglePasswordVisibility}
          tabIndex={-1}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error && (
        <p className="text-sm text-destructive mt-1">{error}</p>
      )}
      {id === "password" && !confirmPassword && (
        <p className="text-xs text-muted-foreground">
          Password must be at least 8 characters
        </p>
      )}
    </div>
  );
};

export default PasswordInput;
