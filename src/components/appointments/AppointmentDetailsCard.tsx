import React from "react";
import { 
  CalendarIcon, 
  ClockIcon,
  MapPinIcon,
  PhoneIcon,
  ClipboardListIcon,
  PackageIcon,
  TruckIcon,
  User,
  CreditCardIcon
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";

interface AppointmentDetailsCardProps {
  appointment: {
    id: string;
    type: 'beauty' | 'laundry';
    order_id?: string;
    service_name: string;
    specialist_name: string;
    date: string;
    time: string;
    status: string;
    client_name: string;
    client_phone?: string;
    amount?: number;
    // Beauty specific
    notes?: string;
    // Laundry specific
    pickup_address?: string;
    delivery_address?: string;
    pickup_date?: string;
    pickup_time?: string;
    delivery_date?: string;
    delivery_time?: string;
    items_description?: string;
    special_instructions?: string;
    estimated_weight?: number;
  };
  showClientInfo?: boolean;
}

const AppointmentDetailsCard = ({ appointment, showClientInfo = false }: AppointmentDetailsCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
      case 'pending_pickup':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed':
      case 'pickup_completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_progress':
      case 'washing_started':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'completed':
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'ready':
      case 'out_for_delivery':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'canceled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatAmount = (amount: number) => {
    return `GHS ${(amount / 100).toFixed(2)}`;
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl font-semibold">
              {appointment.type === 'beauty' ? 'Beauty Appointment' : 'Laundry Order'}
            </CardTitle>
            {appointment.order_id && (
              <div className="flex items-center gap-2">
                <ClipboardListIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-mono text-muted-foreground">
                  {appointment.order_id}
                </span>
              </div>
            )}
          </div>
          <Badge 
            variant="outline" 
            className={`${getStatusColor(appointment.status)} border`}
          >
            {formatStatus(appointment.status)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Service Information */}
        <div className="space-y-3">
          <h3 className="font-semibold text-base">Service Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <PackageIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-sm text-muted-foreground">Service</p>
                <p className="font-medium">{appointment.service_name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-sm text-muted-foreground">
                  {appointment.type === 'beauty' ? 'Stylist' : 'Specialist'}
                </p>
                <p className="font-medium">{appointment.specialist_name}</p>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Client Information (for specialists) */}
        {showClientInfo && (
          <>
            <div className="space-y-3">
              <h3 className="font-semibold text-base">Client Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{appointment.client_name}</p>
                  </div>
                </div>
                {appointment.client_phone && (
                  <div className="flex items-center gap-3">
                    <PhoneIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{appointment.client_phone}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <Separator />
          </>
        )}

        {/* Date & Time Information */}
        <div className="space-y-3">
          <h3 className="font-semibold text-base">
            {appointment.type === 'beauty' ? 'Appointment Schedule' : 'Pickup & Delivery Schedule'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <CalendarIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-sm text-muted-foreground">
                  {appointment.type === 'beauty' ? 'Date' : 'Pickup Date'}
                </p>
                <p className="font-medium">
                  {appointment.pickup_date || appointment.date}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ClockIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-sm text-muted-foreground">
                  {appointment.type === 'beauty' ? 'Time' : 'Pickup Time'}
                </p>
                <p className="font-medium">
                  {appointment.pickup_time || appointment.time}
                </p>
              </div>
            </div>
          </div>

          {/* Laundry delivery information */}
          {appointment.type === 'laundry' && (appointment.delivery_date || appointment.delivery_time) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {appointment.delivery_date && (
                <div className="flex items-center gap-3">
                  <TruckIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground">Delivery Date</p>
                    <p className="font-medium">{appointment.delivery_date}</p>
                  </div>
                </div>
              )}
              {appointment.delivery_time && (
                <div className="flex items-center gap-3">
                  <ClockIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground">Delivery Time</p>
                    <p className="font-medium">{appointment.delivery_time}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Address Information (for laundry) */}
        {appointment.type === 'laundry' && (appointment.pickup_address || appointment.delivery_address) && (
          <>
            <Separator />
            <div className="space-y-3">
              <h3 className="font-semibold text-base">Address Information</h3>
              <div className="space-y-4">
                {appointment.pickup_address && (
                  <div className="flex items-start gap-3">
                    <MapPinIcon className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-sm text-muted-foreground">Pickup Address</p>
                      <p className="font-medium">{appointment.pickup_address}</p>
                    </div>
                  </div>
                )}
                {appointment.delivery_address && (
                  <div className="flex items-start gap-3">
                    <TruckIcon className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-sm text-muted-foreground">Delivery Address</p>
                      <p className="font-medium">{appointment.delivery_address}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Additional Information */}
        {(appointment.notes || appointment.items_description || appointment.special_instructions || appointment.estimated_weight) && (
          <>
            <Separator />
            <div className="space-y-3">
              <h3 className="font-semibold text-base">Additional Information</h3>
              <div className="space-y-3">
                {appointment.notes && (
                  <div>
                    <p className="text-sm text-muted-foreground">Notes</p>
                    <p className="text-sm">{appointment.notes}</p>
                  </div>
                )}
                {appointment.items_description && (
                  <div>
                    <p className="text-sm text-muted-foreground">Items Description</p>
                    <p className="text-sm">{appointment.items_description}</p>
                  </div>
                )}
                {appointment.special_instructions && (
                  <div>
                    <p className="text-sm text-muted-foreground">Special Instructions</p>
                    <p className="text-sm">{appointment.special_instructions}</p>
                  </div>
                )}
                {appointment.estimated_weight && (
                  <div>
                    <p className="text-sm text-muted-foreground">Estimated Weight</p>
                    <p className="text-sm">{appointment.estimated_weight} kg</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Payment Information */}
        {appointment.amount && (
          <>
            <Separator />
            <div className="space-y-3">
              <h3 className="font-semibold text-base">Payment Information</h3>
              <div className="flex items-center gap-3">
                <CreditCardIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="font-semibold text-lg text-primary">
                    {formatAmount(appointment.amount)}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AppointmentDetailsCard;