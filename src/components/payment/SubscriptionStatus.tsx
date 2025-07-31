import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, CreditCard, Settings } from "lucide-react";
import { usePayment } from "./PaymentProvider";
import { format } from "date-fns";
import { toast } from "sonner";

export const SubscriptionStatus: React.FC = () => {
  const { 
    isSubscribed, 
    subscriptionTier, 
    subscriptionEnd, 
    loading
  } = usePayment();

  // Format subscription end date
  const formatSubscriptionEnd = (endDate: string | null) => {
    if (!endDate) return "N/A";
    
    try {
      return format(new Date(endDate), "PPP");
    } catch {
      return "Invalid date";
    }
  };

  const handleRefreshStatus = () => {
    // Note: Subscription checking would be implemented with Paystack in the future
    toast.info("Subscription status refresh coming soon with Paystack integration");
  };

  const handleManageSubscription = () => {
    // Note: Paystack doesn't have a direct equivalent to Stripe's customer portal
    toast.info("Please contact support for subscription management");
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
            onClick={handleRefreshStatus}
            disabled={loading}
          >
            Refresh Status
          </Button>
          
          {isSubscribed && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleManageSubscription}
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
            <p className="text-xs text-muted-foreground">
              Subscription features coming soon with Paystack integration
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};