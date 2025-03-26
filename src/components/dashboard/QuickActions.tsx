
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CalendarDaysIcon, MessageSquareIcon, UserPlusIcon, GiftIcon } from "lucide-react";

const QuickActions = () => {
  return (
    <Card className="border border-border/30">
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        <Link to="/booking" className="col-span-1">
          <Button variant="outline" className="w-full h-auto flex flex-col items-center justify-center gap-2 py-4 hover:border-primary/50 hover:bg-primary/5">
            <CalendarDaysIcon className="h-5 w-5" />
            <span>Book Appointment</span>
          </Button>
        </Link>
        <Link to="/#contact" className="col-span-1">
          <Button variant="outline" className="w-full h-auto flex flex-col items-center justify-center gap-2 py-4 hover:border-primary/50 hover:bg-primary/5">
            <MessageSquareIcon className="h-5 w-5" />
            <span>Contact Us</span>
          </Button>
        </Link>
        <Link to="/#stylists" className="col-span-1">
          <Button variant="outline" className="w-full h-auto flex flex-col items-center justify-center gap-2 py-4 hover:border-primary/50 hover:bg-primary/5">
            <UserPlusIcon className="h-5 w-5" />
            <span>Find Stylist</span>
          </Button>
        </Link>
        <Link to="/#services" className="col-span-1">
          <Button variant="outline" className="w-full h-auto flex flex-col items-center justify-center gap-2 py-4 hover:border-primary/50 hover:bg-primary/5">
            <GiftIcon className="h-5 w-5" />
            <span>Offers</span>
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
