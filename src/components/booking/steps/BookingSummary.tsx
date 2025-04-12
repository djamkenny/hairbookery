
import React from "react";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";

interface BookingSummaryProps {
  selectedService: any;
  selectedStylist: any;
  date: Date | undefined;
  time: string;
  formatPrice: (price: number) => string;
  formatDuration: (minutes: number) => string;
}

const BookingSummary: React.FC<BookingSummaryProps> = ({
  selectedService,
  selectedStylist,
  date,
  time,
  formatPrice,
  formatDuration,
}) => {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Booking Summary</h3>
            {selectedService && (
              <span className="text-primary font-medium">
                {formatPrice(selectedService.price)}
              </span>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground">Service</p>
              <p className="font-medium">
                {selectedService ? selectedService.name : "Not selected"}
              </p>
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
                {date ? format(date, "PPP") : "Not selected"}
              </p>
            </div>
            
            <div>
              <p className="text-muted-foreground">Time</p>
              <p className="font-medium">
                {time || "Not selected"}
              </p>
            </div>
            
            {selectedService && (
              <div>
                <p className="text-muted-foreground">Duration</p>
                <p className="font-medium">
                  {formatDuration(selectedService.duration)}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BookingSummary;
