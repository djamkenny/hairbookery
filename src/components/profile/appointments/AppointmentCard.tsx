
import React from "react";
import { 
  CalendarIcon, 
  ClockIcon,
  ClipboardList
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import { Appointment } from "@/types/appointment";

interface AppointmentCardProps {
  appointment: Appointment;
  isPast?: boolean;
  onReschedule?: (id: string) => void;
  onCancel?: (id: string) => void;
  onBookSimilar?: (appointment: Appointment) => void;
}

const AppointmentCard = ({ 
  appointment, 
  isPast = false, 
  onReschedule, 
  onCancel, 
  onBookSimilar 
}: AppointmentCardProps) => {
  const isMobile = useIsMobile();

  return (
    <Card className={`overflow-hidden ${isPast ? '' : 'hover:shadow-md transition-shadow'}`}>
      <CardContent className="p-0">
        <div className={`border-l-4 ${isPast ? 'border-muted' : 'border-primary'} p-3 md:p-6`}>
          <div className="flex flex-col sm:flex-row justify-between mb-3 md:mb-4">
            <div>
              <h3 className="font-medium text-base md:text-lg">{appointment.service}</h3>
              <p className="text-sm text-muted-foreground">With {appointment.stylist}</p>
              {appointment.order_id && !isPast && (
                <div className="flex items-center mt-2 gap-2 p-1.5 bg-primary/5 rounded border border-primary/10 w-fit">
                  <ClipboardList className="h-3.5 w-3.5 text-primary" />
                  <span className="text-sm font-mono text-primary">{appointment.order_id}</span>
                </div>
              )}
            </div>
            <div className="mt-2 sm:mt-0 sm:text-right">
              <div className="flex items-center sm:justify-end text-xs md:text-sm font-medium mb-1">
                <CalendarIcon className="h-3 w-3 md:h-3.5 md:w-3.5 mr-1" />
                <span>{appointment.date}</span>
              </div>
              <div className="flex items-center sm:justify-end text-xs md:text-sm text-muted-foreground">
                <ClockIcon className="h-3 w-3 md:h-3.5 md:w-3.5 mr-1" />
                <span>{appointment.time}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {isPast ? (
              onBookSimilar && (
                <Button 
                  variant="outline" 
                  size={isMobile ? "sm" : "sm"}
                  className="text-xs md:text-sm"
                  onClick={() => onBookSimilar(appointment)}
                >
                  Book Similar
                </Button>
              )
            ) : (
              <>
                {onReschedule && (
                  <Button 
                    variant="outline" 
                    size={isMobile ? "sm" : "sm"}
                    className="text-xs md:text-sm"
                    onClick={() => onReschedule(appointment.id)}
                  >
                    Reschedule
                  </Button>
                )}
                {onCancel && (
                  <Button 
                    variant="outline" 
                    size={isMobile ? "sm" : "sm"}
                    className="text-xs md:text-sm text-destructive hover:bg-destructive/10"
                    onClick={() => onCancel(appointment.id)}
                  >
                    Cancel
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AppointmentCard;
