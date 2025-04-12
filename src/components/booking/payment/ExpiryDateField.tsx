
import React from "react";
import { Label } from "@/components/ui/label";
import { Calendar } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ExpiryDateFieldProps {
  month: string;
  year: string;
  setMonth: (value: string) => void;
  setYear: (value: string) => void;
  error?: string;
}

const ExpiryDateField: React.FC<ExpiryDateFieldProps> = ({
  month,
  year,
  setMonth,
  setYear,
  error,
}) => {
  // Generate month options
  const months = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    return month < 10 ? `0${month}` : `${month}`;
  });

  // Generate year options (current year + 10 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => `${currentYear + i}`);

  return (
    <div className="space-y-2">
      <Label className={error ? "text-destructive" : ""}>Expiry Date</Label>
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className={error ? "border-destructive" : ""}>
              <SelectValue placeholder="MM" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month} value={month}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="relative flex-1">
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className={error ? "border-destructive" : ""}>
              <SelectValue placeholder="YYYY" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Calendar className="text-muted-foreground h-4 w-4 mr-1" />
      </div>
      {error && <p className="text-destructive text-sm">{error}</p>}
    </div>
  );
};

export default ExpiryDateField;
