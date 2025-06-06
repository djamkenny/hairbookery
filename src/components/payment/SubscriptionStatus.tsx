
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, CreditCard, Settings } from "lucide-react";
import { usePayment } from "./PaymentProvider";
import { format } from "date-fns";

export const SubscriptionStatus: React.FC = () => {
  const { 
    isSubscribed, 
    subscriptionTier, 
    subscriptionEnd, 
    loading,
    checkSubscription,
    openCustomerPortal 
  } = usePayment();

  // PSEUDOCODE: Format subscription end date
  const formatSubscriptionEnd = (endDate: string | null) => {
    // TODO: Parse and format the end date
    // TODO: Handle null or invalid dates
    // TODO: Return user-friendly date string
    
    if (!endDate) return "N/A";
    
    try {
      return format(new Date(endDate), "PPP");
    } catch {
      return "Invalid date";
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading subscription status...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Subscription Status
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span>Status:</span>
          <Badge variant={isSubscribed ? "default" : "secondary"}>
            {isSubscribed ? "Active" : "Inactive"}
          </Badge>
        </div>

        {isSubscribed && subscriptionTier && (
          <div className="flex items-center justify-between">
            <span>Plan:</span>
            <Badge variant="outline">{subscriptionTier}</Badge>
          </div>
        )}

        {isSubscribed && subscriptionEnd && (
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Next billing:
            </span>
            <span className="text-sm">{formatSubscriptionEnd(subscriptionEnd)}</span>
          </div>
        )}

        <div className="flex gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={checkSubscription}
            disabled={loading}
          >
            Refresh Status
          </Button>
          
          {isSubscribed && (
            <Button
              variant="outline"
              size="sm"
              onClick={openCustomerPortal}
              className="flex items-center gap-1"
            >
              <Settings className="h-4 w-4" />
              Manage Subscription
            </Button>
          )}
        </div>

        {!isSubscribed && (
          <div className="text-center pt-4">
            <p className="text-sm text-muted-foreground mb-2">
              No active subscription found
            </p>
            {/* PSEUDOCODE: Link to subscription plans */}
            {/* TODO: Add navigation to subscription plans page */}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
