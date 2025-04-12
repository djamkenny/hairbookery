
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Info } from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";

interface CVVFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

const CVVField: React.FC<CVVFieldProps> = ({ 
  value, 
  onChange,
  error
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numericValue = e.target.value.replace(/\D/g, '');
    onChange(numericValue.slice(0, 4));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1">
        <Label htmlFor="cvv" className={error ? "text-destructive" : ""}>CVV</Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger type="button">
              <Info className="h-3.5 w-3.5 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent side="top">
              <p className="text-xs max-w-xs">
                The CVV is the 3 or 4 digit code on the back of your card
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <Input
        id="cvv"
        placeholder="123"
        value={value}
        onChange={handleChange}
        maxLength={4}
        className={error ? "border-destructive" : ""}
        required
      />
      {error && <p className="text-destructive text-sm">{error}</p>}
    </div>
  );
};

export default CVVField;
