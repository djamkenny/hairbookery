
import React from "react";
import { Scissors } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/components/booking/utils/formatUtils";
interface ServiceStatusCardProps {
  service: string;
  services?: any[];
  status: string;
}

const ServiceStatusCard: React.FC<ServiceStatusCardProps> = ({ service, services, status }) => {
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
    <article className="rounded-lg border bg-card p-4">
      <header className="flex justify-between items-center mb-1.5">
        <div className="flex items-center gap-2">
          <Scissors className="h-4 w-4 text-muted-foreground" />
          <h4 className="text-sm font-semibold">
            {services && services.length > 1 ? `Services (${services.length})` : "Service"}
          </h4>
        </div>
        <Badge variant={getBadgeVariant(status)}>
          {getStatusLabel(status)}
        </Badge>
      </header>

      {services && services.length > 0 ? (
        <ul className="divide-y divide-border">
          {services.map((serviceItem, index) => {
            const base = serviceItem?.baseServiceName || serviceItem?.name || "Service";
            const type = serviceItem?.typeName;
            const price = serviceItem?.price;
            return (
              <li key={index} className="flex items-start justify-between py-2">
                <div>
                  <p className="text-sm font-medium">{base}</p>
                  {type && (
                    <p className="text-xs text-muted-foreground">{type}</p>
                  )}
                </div>
                {price !== undefined && (
                  <Badge variant="outline" className="shrink-0">
                    {formatPrice(Number(price))}
                  </Badge>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">{service}</p>
      )}
    </article>
  );
};

export default ServiceStatusCard;
