import React from "react";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";

interface MultiBookingSummaryProps {
  selectedServices: any[];
  selectedStylist: any;
  date: Date | undefined;
  time: string;
  formatPrice: (price: number) => string;
  formatDuration: (minutes: number) => string;
}

const MultiBookingSummary: React.FC<MultiBookingSummaryProps> = ({
  selectedServices,
  selectedStylist,
  date,
  time,
  formatPrice,
  formatDuration,
}) => {
  const totalPrice = selectedServices.reduce((sum, service) => sum + Number(service.price), 0);
  const totalDuration = selectedServices.reduce((sum, service) => sum + Number(service.duration), 0);

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Booking Summary</h3>
            {selectedServices.length > 0 && (
              <span className="text-primary font-medium">
                {formatPrice(totalPrice)}
              </span>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground">Services ({selectedServices.length})</p>
              <div className="space-y-1">
                {selectedServices.length === 0 ? (
                  <p className="font-medium">Not selected</p>
                ) : (
                  selectedServices.map((service, index) => (
                    <p key={service.id} className="font-medium">
                      {service.name}
                      {index < selectedServices.length - 1 && ","}
                    </p>
                  ))
                )}
              </div>
            </div>
            
            <div>
              <p className="text-muted-foreground">Specialist</p>
              <p className="font-medium">
                {selectedStylist ? selectedStylist.full_name : "Not selected"}
              </p>
            </div>
            
            <div>
              <p className="text-muted-foreground">Date</p>
              <p className="font-medium">
                {date ? format(date, "EEEE, MMMM do") : "Not selected"}
              </p>
            </div>
            
            <div>
              <p className="text-muted-foreground">Time</p>
              <p className="font-medium">{time || "Not selected"}</p>
            </div>
            
            {selectedServices.length > 0 && (
              <>
                <div>
                  <p className="text-muted-foreground">Total Duration</p>
                  <p className="font-medium">{formatDuration(totalDuration)}</p>
                </div>
                
                <div>
                  <p className="text-muted-foreground">Total Cost</p>
                  <p className="font-medium">{formatPrice(totalPrice)}</p>
                </div>
              </>
            )}
          </div>

          {selectedServices.length > 1 && (
            <div className="border-t pt-4">
              <p className="text-xs text-muted-foreground mb-2">Service breakdown:</p>
              <div className="space-y-1">
                {selectedServices.map((service) => (
                  <div key={service.id} className="flex justify-between text-xs">
                    <span>{service.name}</span>
                    <span>{formatPrice(service.price)} • {formatDuration(service.duration)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MultiBookingSummary;