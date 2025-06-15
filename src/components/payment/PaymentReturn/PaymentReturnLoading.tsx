
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const PaymentReturnLoading = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Card className="w-full max-w-md">
      <CardContent className="flex flex-col items-center justify-center p-6">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <h2 className="text-lg font-semibold mb-2">Verifying Payment</h2>
        <p className="text-muted-foreground text-center">Please wait while we confirm your payment...</p>
      </CardContent>
    </Card>
  </div>
);

export default PaymentReturnLoading;
