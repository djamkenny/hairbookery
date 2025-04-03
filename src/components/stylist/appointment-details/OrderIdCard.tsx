
import React from "react";
import { ClipboardList } from "lucide-react";

interface OrderIdCardProps {
  orderId: string;
}

const OrderIdCard: React.FC<OrderIdCardProps> = ({ orderId }) => {
  if (!orderId) return null;
  
  return (
    <div className="flex items-start gap-3 border rounded-lg p-3 bg-background/50 border-primary/20">
      <div className="bg-primary/10 p-2 rounded-md">
        <ClipboardList className="h-5 w-5 text-primary" />
      </div>
      <div className="space-y-1">
        <h4 className="text-sm font-semibold leading-none">Order ID</h4>
        <p className="text-sm text-primary font-mono">{orderId}</p>
        <p className="text-xs text-muted-foreground">Share this ID with the client for reference</p>
      </div>
    </div>
  );
};

export default OrderIdCard;
