
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
          color: 'text-primary',
          bgColor: 'bg-primary/10 text-primary'
        };
      case 'full':
        return {
          variant: 'destructive' as const,
          icon: XCircle,
          text: 'Fully Booked Today',
          color: 'text-red-600',
          bgColor: 'bg-red-100 text-red-800'
        };
      case 'unavailable':
      default:
        return {
          variant: 'secondary' as const,
          icon: Clock,
          text: 'Currently Unavailable',
          color: 'text-gray-600',
          bgColor: 'bg-gray-100 text-gray-800'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium ${config.bgColor} ${className}`}>
      <Icon className="h-4 w-4" />
      <span>{config.text}</span>
    </div>
  );
};

export default AvailabilityBadge;
