
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "lucide-react";

interface CardHolderFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

const CardHolderField: React.FC<CardHolderFieldProps> = ({ 
  value, 
  onChange,
  error
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="cardName" className={error ? "text-destructive" : ""}>Name on Card</Label>
      <div className="relative">
        <Input
          id="cardName"
          placeholder="John Smith"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={error ? "border-destructive" : ""}
          required
        />
        <User className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
      </div>
      {error && <p className="text-destructive text-sm">{error}</p>}
    </div>
  );
};

export default CardHolderField;
