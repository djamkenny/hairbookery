
import React from "react";
import { formatPrice } from "../utils/formatUtils";
import { DollarSign } from "lucide-react";

interface TotalAmountProps {
  amount: number;
}

const TotalAmount: React.FC<TotalAmountProps> = ({ amount }) => {
  return (
    <div className="pt-2 border-t border-border/30 mt-4">
      <div className="flex justify-between font-medium items-center">
        <span className="flex items-center gap-1.5">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          Total Amount:
        </span>
        <span className="text-primary text-lg">
          {formatPrice(amount)}
        </span>
      </div>
    </div>
  );
};

export default TotalAmount;
