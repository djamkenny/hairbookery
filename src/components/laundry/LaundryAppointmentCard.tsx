import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LaundryOrder } from "@/types/laundry";
import { LAUNDRY_STATUS_LABELS, LAUNDRY_STATUS_COLORS } from "@/types/laundry";
import { Calendar, Clock, MapPin, User, Package, Phone } from "lucide-react";
import { format } from "date-fns";

interface LaundryAppointmentCardProps {
  order: LaundryOrder & {
    client_name?: string;
    client_phone?: string;
  };
  onUpdateStatus: (orderId: string, newStatus: string) => void;
  onViewDetails: () => void;
}

export const LaundryAppointmentCard: React.FC<LaundryAppointmentCardProps> = ({
  order,
  onUpdateStatus,
  onViewDetails
}) => {
  const getNextStatus = (currentStatus: string) => {
    const statusFlow: Record<string, string> = {
      'pending_pickup': 'picked_up',
      'picked_up': 'washing',
      'washing': 'ready',
      'ready': 'out_for_delivery',
      'out_for_delivery': 'delivered'
    };
    return statusFlow[currentStatus];
  };

  const nextStatus = getNextStatus(order.status);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{order.order_number}</CardTitle>
          <Badge className={LAUNDRY_STATUS_COLORS[order.status as keyof typeof LAUNDRY_STATUS_COLORS]}>
            {LAUNDRY_STATUS_LABELS[order.status as keyof typeof LAUNDRY_STATUS_LABELS]}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>{order.client_name || 'Unknown Client'}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{order.client_phone || 'No phone'}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{format(new Date(order.pickup_date), "MMM dd, yyyy")}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{order.pickup_time}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="truncate">{order.pickup_address}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span>{order.service_type}</span>
          </div>
        </div>

        {order.items_description && (
          <div className="text-sm">
            <span className="font-medium">Items: </span>
            <span className="text-muted-foreground">{order.items_description}</span>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onViewDetails}
            className="flex-1"
          >
            View Details
          </Button>
          
          {nextStatus && order.status !== 'delivered' && order.status !== 'cancelled' && (
            <Button
              size="sm"
              onClick={() => onUpdateStatus(order.id, nextStatus)}
              className="flex-1"
            >
              Mark as {LAUNDRY_STATUS_LABELS[nextStatus as keyof typeof LAUNDRY_STATUS_LABELS]}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};