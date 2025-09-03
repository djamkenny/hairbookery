import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/components/booking/utils/formatUtils";
import { format } from "date-fns";
import { Eye, Calendar, MapPin, Clock, Home, User } from "lucide-react";
import { CleaningOrder } from "@/hooks/useCleaningAppointments";

interface CleaningAppointmentsListProps {
  orders: CleaningOrder[];
  loading: boolean;
  onViewDetails: (order: CleaningOrder) => void;
  onUpdateStatus: (orderId: string, status: string) => void;
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'confirmed':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'in_progress':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'completed':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'canceled':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getStatusActions = (status: string, orderId: string, onUpdateStatus: (orderId: string, status: string) => void) => {
  switch (status.toLowerCase()) {
    case 'pending':
      return (
        <div className="flex gap-2">
          <Button size="sm" onClick={() => onUpdateStatus(orderId, 'confirmed')}>
            Confirm
          </Button>
          <Button size="sm" variant="outline" onClick={() => onUpdateStatus(orderId, 'canceled')}>
            Cancel
          </Button>
        </div>
      );
    case 'confirmed':
      return (
        <div className="flex gap-2">
          <Button size="sm" onClick={() => onUpdateStatus(orderId, 'in_progress')}>
            Start Service
          </Button>
          <Button size="sm" variant="outline" onClick={() => onUpdateStatus(orderId, 'canceled')}>
            Cancel
          </Button>
        </div>
      );
    case 'in_progress':
      return (
        <Button size="sm" onClick={() => onUpdateStatus(orderId, 'completed')}>
          Mark Complete
        </Button>
      );
    default:
      return null;
  }
};

export const CleaningAppointmentsList: React.FC<CleaningAppointmentsListProps> = ({
  orders,
  loading,
  onViewDetails,
  onUpdateStatus
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Home className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">No cleaning orders</h3>
          <p className="text-sm text-muted-foreground text-center">
            Cleaning orders will appear here once customers book your services.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Card key={order.id} className="w-full">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg">{order.order_number}</CardTitle>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {order.customer_name}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(order.service_date), "MMM dd, yyyy")}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {order.service_time}
                  </div>
                </div>
              </div>
              <Badge className={getStatusColor(order.status)}>
                {order.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                  <span className="break-words">{order.service_address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Home className="h-4 w-4 text-muted-foreground" />
                  <span className="capitalize">{order.service_type.replace('_', ' ')} - {order.property_type}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                {order.num_rooms && (
                  <div className="text-sm">
                    <span className="font-medium">Rooms:</span> {order.num_rooms}
                  </div>
                )}
                {order.num_bathrooms && (
                  <div className="text-sm">
                    <span className="font-medium">Bathrooms:</span> {order.num_bathrooms}
                  </div>
                )}
                {order.duration_hours && (
                  <div className="text-sm">
                    <span className="font-medium">Duration:</span> {order.duration_hours} hours
                  </div>
                )}
              </div>
            </div>

            {order.addon_services && order.addon_services.length > 0 && (
              <div className="space-y-2">
                <span className="text-sm font-medium">Add-on Services:</span>
                <div className="flex flex-wrap gap-1">
                  {order.addon_services.map((addon) => (
                    <Badge key={addon} variant="outline" className="text-xs">
                      {addon.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {order.special_instructions && (
              <div className="space-y-1">
                <span className="text-sm font-medium">Special Instructions:</span>
                <p className="text-sm text-muted-foreground">{order.special_instructions}</p>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center gap-4">
                <span className="font-semibold text-lg">
                  {order.amount ? formatPrice(order.amount / 100) : 'Pending'}
                </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onViewDetails(order)}
                  className="flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  View Details
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                {getStatusActions(order.status, order.id, onUpdateStatus)}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};