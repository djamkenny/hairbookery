import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LaundryOrder, LAUNDRY_STATUS_LABELS, LAUNDRY_STATUS_COLORS } from "@/types/laundry";
import { format } from "date-fns";
import { Package, Truck, Clock, CheckCircle, MapPin } from "lucide-react";

interface LaundryOrderStatusProps {
  order: LaundryOrder;
}

const STATUS_STEPS = [
  { key: 'pending_pickup', label: 'Pending Pickup', icon: Clock },
  { key: 'picked_up', label: 'Picked Up', icon: Package },
  { key: 'washing', label: 'Washing', icon: Package },
  { key: 'ready', label: 'Ready', icon: CheckCircle },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle },
];

export const LaundryOrderStatus: React.FC<LaundryOrderStatusProps> = ({ order }) => {
  const getCurrentStepIndex = () => {
    return STATUS_STEPS.findIndex(step => step.key === order.status);
  };

  const getProgressPercentage = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex === -1) return 0;
    return ((currentIndex + 1) / STATUS_STEPS.length) * 100;
  };

  const currentStepIndex = getCurrentStepIndex();
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Order #{order.order_number}</CardTitle>
            <CardDescription>
              Placed on {format(new Date(order.created_at), 'PPP')}
            </CardDescription>
          </div>
          <Badge className={LAUNDRY_STATUS_COLORS[order.status]}>
            {LAUNDRY_STATUS_LABELS[order.status]}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{Math.round(getProgressPercentage())}% Complete</span>
          </div>
          <Progress value={getProgressPercentage()} className="h-2" />
        </div>

        {/* Status Timeline */}
        <div className="space-y-4">
          <h4 className="font-semibold text-sm">Order Timeline</h4>
          <div className="space-y-3">
            {STATUS_STEPS.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;
              
              return (
                <div key={step.key} className="flex items-center space-x-3">
                  <div className={`
                    flex items-center justify-center w-8 h-8 rounded-full border-2
                    ${isCompleted 
                      ? 'bg-primary border-primary text-primary-foreground' 
                      : 'border-muted-foreground text-muted-foreground'
                    }
                    ${isCurrent ? 'ring-2 ring-primary ring-offset-2' : ''}
                  `}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${
                      isCompleted ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {step.label}
                    </p>
                    {isCompleted && getTimestampForStatus(order, step.key) && (
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(getTimestampForStatus(order, step.key)!), 'PPP p')}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Details */}
        <div className="space-y-3 pt-4 border-t">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">Pickup:</span>
              </div>
              <p className="text-muted-foreground ml-6">{order.pickup_address}</p>
              <p className="text-muted-foreground ml-6">
                {format(new Date(order.pickup_date), 'PPP')} at {order.pickup_time}
              </p>
            </div>
            
            {order.delivery_address && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Truck className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Delivery:</span>
                </div>
                <p className="text-muted-foreground ml-6">{order.delivery_address}</p>
                {order.delivery_date && (
                  <p className="text-muted-foreground ml-6">
                    {format(new Date(order.delivery_date), 'PPP')} 
                    {order.delivery_time && ` at ${order.delivery_time}`}
                  </p>
                )}
              </div>
            )}
          </div>
          
          {order.items_description && (
            <div>
              <p className="font-medium text-sm mb-1">Items:</p>
              <p className="text-sm text-muted-foreground">{order.items_description}</p>
            </div>
          )}
          
          {order.weight_kg && (
            <div>
              <p className="font-medium text-sm mb-1">Weight:</p>
              <p className="text-sm text-muted-foreground">{order.weight_kg}kg</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Helper function to get timestamp for a specific status
function getTimestampForStatus(order: LaundryOrder, status: string): string | null {
  switch (status) {
    case 'pending_pickup':
      return order.created_at;
    case 'picked_up':
      return order.pickup_completed_at;
    case 'washing':
      return order.washing_started_at;
    case 'ready':
      return order.ready_at;
    case 'out_for_delivery':
      return order.out_for_delivery_at;
    case 'delivered':
      return order.delivered_at;
    default:
      return null;
  }
}