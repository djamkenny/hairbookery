import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLaundryServices } from "@/hooks/useLaundryServices";
import { formatPrice } from "@/components/booking/utils/formatUtils";
import { Loader2, Clock, Truck } from "lucide-react";

interface LaundryServiceSelectorProps {
  selectedService: string;
  onServiceSelect: (serviceId: string) => void;
  estimatedWeight: number;
  specialistId?: string;
}

export const LaundryServiceSelector: React.FC<LaundryServiceSelectorProps> = ({
  selectedService,
  onServiceSelect,
  estimatedWeight,
  specialistId,
}) => {
  const { services, loading } = useLaundryServices(specialistId);

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const calculatePrice = (service: any) => {
    const weightCharge = service.price_per_kg * estimatedWeight;
    return Math.max(service.base_price, weightCharge) / 100; // Convert from pesewas to GHS
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Select Laundry Service</h3>
        <p className="text-sm text-muted-foreground">
          Choose from our available laundry services below
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {services.map((service) => {
          const price = calculatePrice(service);
          const isSelected = selectedService === service.id;

          return (
            <Card 
              key={service.id} 
              className={`cursor-pointer transition-all hover:shadow-md ${
                isSelected ? 'ring-2 ring-primary border-primary' : ''
              }`}
              onClick={() => onServiceSelect(service.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{service.name}</CardTitle>
                    {service.is_express && (
                      <Badge variant="secondary" className="mt-1">
                        Express
                      </Badge>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-lg">
                      {formatPrice(price)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Est. for {estimatedWeight}kg
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                {service.description && (
                  <CardDescription className="mb-3">
                    {service.description}
                  </CardDescription>
                )}
                
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {service.turnaround_days} day{service.turnaround_days !== 1 ? 's' : ''}
                  </div>
                  <div className="flex items-center">
                    <Truck className="w-4 h-4 mr-1" />
                    Pickup & Delivery
                  </div>
                </div>
                
                <div className="mt-3 text-xs text-muted-foreground">
                  Base: {formatPrice(service.base_price / 100)} | Per kg: {formatPrice(service.price_per_kg / 100)}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {services.length === 0 && !loading && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No laundry services available at the moment.</p>
        </div>
      )}
    </div>
  );
};