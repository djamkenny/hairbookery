
import React from "react";
import { Mail, Phone, User } from "lucide-react";

interface ClientInfoCardProps {
  client: string;
  clientEmail?: string;
  clientPhone?: string;
}

const ClientInfoCard: React.FC<ClientInfoCardProps> = ({ 
  client, 
  clientEmail, 
  clientPhone 
}) => {
  return (
    <div className="flex items-start gap-3 border rounded-lg p-3 bg-background/50">
      <div className="bg-primary/10 p-2 rounded-md">
        <User className="h-5 w-5 text-primary" />
      </div>
      <div className="space-y-1">
        <h4 className="text-sm font-semibold leading-none">Client</h4>
        <p className="text-sm text-muted-foreground">{client}</p>
        {clientEmail && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Mail className="h-3 w-3" />
            <span>{clientEmail}</span>
          </div>
        )}
        {clientPhone && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Phone className="h-3 w-3" />
            <span>{clientPhone}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientInfoCard;
