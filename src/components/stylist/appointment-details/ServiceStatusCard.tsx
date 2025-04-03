
import React from "react";
import { Scissors } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ServiceStatusCardProps {
  service: string;
  status: string;
}

const ServiceStatusCard: React.FC<ServiceStatusCardProps> = ({ service, status }) => {
  const getBadgeVariant = (status: string) => {
    switch(status) {
      case "confirmed": return "default";
      case "completed": return "secondary";
      case "canceled": return "destructive";
      default: return "outline";
    }
  };

  const getStatusLabel = (status: string) => {
    switch(status) {
      case "confirmed": return "Confirmed";
      case "completed": return "Completed";
      case "canceled": return "Canceled";
      default: return "Pending";
    }
  };

  return (
    <div className="flex flex-col gap-2 border rounded-lg p-3 bg-background/50">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Scissors className="h-4 w-4 text-muted-foreground" />
          <h4 className="text-sm font-semibold">Service</h4>
        </div>
        <Badge variant={getBadgeVariant(status)}>
          {getStatusLabel(status)}
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground">{service}</p>
    </div>
  );
};

export default ServiceStatusCard;
