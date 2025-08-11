
import React from "react";
import { Wallet } from "lucide-react";
import { formatGHS } from "@/components/stylist/services/formatGHS";

interface TotalAmountCardProps {
  total: number; // in GHS
}

const TotalAmountCard: React.FC<TotalAmountCardProps> = ({ total }) => {
  if (!total || isNaN(total)) return null;

  return (
    <div className="flex items-start gap-3 border rounded-lg p-3 bg-background/50 border-primary/20">
      <div className="bg-primary/10 p-2 rounded-md">
        <Wallet className="h-5 w-5 text-primary" />
      </div>
      <div className="space-y-1">
        <h4 className="text-sm font-semibold leading-none">Total Amount</h4>
        <p className="text-sm text-primary font-mono">{formatGHS(total)}</p>
        <p className="text-xs text-muted-foreground">Sum of selected services</p>
      </div>
    </div>
  );
};

export default TotalAmountCard;
