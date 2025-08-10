
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface EmptyAppointmentsStateProps {
  type: "upcoming" | "past";
}

const EmptyAppointmentsState = ({ type }: EmptyAppointmentsStateProps) => {
  const isMobile = useIsMobile();

  if (type === "upcoming") {
    return (
      <div className="text-center py-6 md:py-8 bg-muted/30 rounded-lg">
        <p className="text-muted-foreground text-sm md:text-base mb-3 md:mb-4">
          You don't have any upcoming appointments.
        </p>
        <Link to="/specialists">
          <Button size={isMobile ? "sm" : "default"}>Book an Appointment</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="text-center py-6 md:py-8 bg-muted/30 rounded-lg">
      <p className="text-muted-foreground text-sm md:text-base">
        You don't have any past appointments.
      </p>
    </div>
  );
};

export default EmptyAppointmentsState;
