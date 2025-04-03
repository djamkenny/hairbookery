
import React from "react";
import { CalendarDays, Clock } from "lucide-react";

interface DateTimeCardsProps {
  date: string;
  time: string;
}

const DateTimeCards: React.FC<DateTimeCardsProps> = ({ date, time }) => {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="flex items-start gap-3 border rounded-lg p-3 bg-background/50">
        <div className="bg-primary/10 p-2 rounded-md">
          <CalendarDays className="h-5 w-5 text-primary" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-semibold leading-none">Date</h4>
          <p className="text-sm text-muted-foreground">{date}</p>
        </div>
      </div>

      <div className="flex items-start gap-3 border rounded-lg p-3 bg-background/50">
        <div className="bg-primary/10 p-2 rounded-md">
          <Clock className="h-5 w-5 text-primary" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-semibold leading-none">Time</h4>
          <p className="text-sm text-muted-foreground">{time}</p>
        </div>
      </div>
    </div>
  );
};

export default DateTimeCards;
