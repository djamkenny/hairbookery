
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard } from "lucide-react";

interface CreditCardFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

const CreditCardField: React.FC<CreditCardFieldProps> = ({ 
  value, 
  onChange,
  error
}) => {
  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(" ");
    } else {
      return value;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(formatCardNumber(e.target.value));
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="cardNumber" className={error ? "text-destructive" : ""}>Card Number</Label>
      <div className="relative">
        <Input
          id="cardNumber"
          placeholder="1234 5678 9012 3456"
          value={value}
          onChange={handleChange}
          maxLength={19}
          required
          className={error ? "border-destructive" : ""}
        />
        <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
      </div>
      {error && <p className="text-destructive text-sm">{error}</p>}
    </div>
  );
};

export default CreditCardField;
