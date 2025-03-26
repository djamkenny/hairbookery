
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "react-router-dom";

interface TermsCheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  error?: string;
}

const TermsCheckbox = ({ checked, onCheckedChange, error }: TermsCheckboxProps) => {
  return (
    <div className="flex items-start space-x-2 pt-2">
      <Checkbox
        id="terms"
        checked={checked}
        onCheckedChange={(checked) => onCheckedChange(checked as boolean)}
      />
      <div className="grid gap-1.5 leading-none">
        <label
          htmlFor="terms"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          I accept the <Link to="/terms" className="text-primary hover:underline">terms and conditions</Link>
        </label>
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>
    </div>
  );
};

export default TermsCheckbox;
