
import React from "react";

interface AppointmentsHeaderProps {
  title?: string;
}

const AppointmentsHeader: React.FC<AppointmentsHeaderProps> = ({ 
  title = "Appointments" 
}) => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{title}</h1>
    </div>
  );
};

export default AppointmentsHeader;
