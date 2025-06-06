
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { usePayment } from "./PaymentProvider";

interface PlanFeature {
  name: string;
  included: boolean;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  priceId: string;
  interval: string;
  features: PlanFeature[];
  popular?: boolean;
}

// PSEUDOCODE: Define subscription plans
const plans: SubscriptionPlan[] = [
  // TODO: Replace with actual Stripe price IDs
  {
    id: 'basic',
    name: 'Basic',
    price: 9.99,
    priceId: 'price_basic_monthly', // TODO: Replace with actual Stripe price ID
    interval: 'month',
    features: [
      { name: 'Up to 5 appointments per month', included: true },
      { name: 'Basic booking features', included: true },
      { name: 'Email support', included: true },
      { name: 'Advanced analytics', included: false },
      { name: 'Priority support', included: false },
    ],
  },
  // TODO: Add Premium and Enterprise plans
];

export const SubscriptionPlans: React.FC = () => {
  const { createSubscription, isSubscribed, subscriptionTier, loading } = usePayment();

  // PSEUDOCODE: Handle plan selection
  const handleSelectPlan = async (plan: SubscriptionPlan) => {
    // TODO: Check if user is already subscribed to this plan
    // TODO: Show confirmation dialog for plan changes
    // TODO: Call createSubscription with plan details
    // TODO: Redirect to Stripe checkout
    
    try {
      const checkoutUrl = await createSubscription(plan.priceId, plan.id);
      if (checkoutUrl) {
        window.open(checkoutUrl, '_blank');
      }
    } catch (error) {
      console.error("Plan selection failed:", error);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">Choose Your Plan</h2>
        <p className="text-muted-foreground">
          Select the perfect plan for your styling needs
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {plans.map((plan) => (
          <Card key={plan.id} className={`relative ${plan.popular ? 'border-primary' : ''}`}>
            {plan.popular && (
              <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                Most Popular
              </Badge>
            )}
            
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <div className="text-3xl font-bold">
                ${plan.price}
                <span className="text-sm font-normal text-muted-foreground">
                  /{plan.interval}
                </span>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check 
                      className={`h-4 w-4 ${
                        feature.included ? 'text-green-500' : 'text-muted-foreground'
                      }`} 
                    />
                    <span 
                      className={feature.included ? '' : 'text-muted-foreground line-through'}
                    >
                      {feature.name}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                className="w-full"
                onClick={() => handleSelectPlan(plan)}
                disabled={loading || (isSubscribed && subscriptionTier === plan.id)}
                variant={subscriptionTier === plan.id ? "outline" : "default"}
              >
                {/* PSEUDOCODE: Button text logic */}
                {loading 
                  ? "Loading..." 
                  : subscriptionTier === plan.id 
                    ? "Current Plan" 
                    : `Select ${plan.name}`
                }
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
