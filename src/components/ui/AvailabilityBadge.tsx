
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, XCircle } from "lucide-react";

interface AvailabilityBadgeProps {
  status: 'available' | 'full' | 'unavailable';
  slotsRemaining?: number;
  dailyLimit?: number;
  className?: string;
}

const AvailabilityBadge = ({ 
  status, 
  slotsRemaining, 
  dailyLimit, 
  className 
}: AvailabilityBadgeProps) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'available':
        return {
          variant: 'default' as const,
          icon: CheckCircle,
          text: slotsRemaining && dailyLimit 
            ? `Available (${slotsRemaining}/${dailyLimit} slots)`
            : 'Available',
          color: 'text-green-600'
        };
      case 'full':
        return {
          variant: 'destructive' as const,
          icon: XCircle,
          text: 'Fully Booked Today',
          color: 'text-red-600'
        };
      case 'unavailable':
      default:
        return {
          variant: 'secondary' as const,
          icon: Clock,
          text: 'Currently Unavailable',
          color: 'text-gray-600'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={`flex items-center gap-1 ${className}`}>
      <Icon className="h-3 w-3" />
      <span className="text-xs">{config.text}</span>
    </Badge>
  );
};

export default AvailabilityBadge;
