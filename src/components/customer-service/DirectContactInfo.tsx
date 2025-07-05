
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Phone, Clock, MessageCircle } from "lucide-react";

const DirectContactInfo = () => {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Customer Support</h1>
        <p className="text-muted-foreground text-lg">
          We're here to help! Get in touch with our support team using any of the methods below.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Contact Methods */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-primary" />
              <div>
                <div className="font-medium">Email Support</div>
                <div className="text-sm text-muted-foreground">support@example.com</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-primary" />
              <div>
                <div className="font-medium">Phone Support</div>
                <div className="text-sm text-muted-foreground">(555) 123-4567</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <div className="font-medium">Business Hours</div>
                <div className="text-sm text-muted-foreground">Monday - Friday, 9:00 AM - 6:00 PM EST</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Live Chat */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Live Chat Support
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Get instant help with our live chat widget. Look for the chat bubble in the bottom-right corner of any page.
            </p>
            <div className="space-y-2 text-sm">
              <div>✅ Instant responses during business hours</div>
              <div>✅ Available on all pages</div>
              <div>✅ No account required for basic questions</div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Booking & Appointments</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• How do I book an appointment?</li>
                  <li>• Can I reschedule my appointment?</li>
                  <li>• What is your cancellation policy?</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Payments & Billing</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• What payment methods do you accept?</li>
                  <li>• How do refunds work?</li>
                  <li>• Can I get a receipt for my service?</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Services & Stylists</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• How do I choose the right stylist?</li>
                  <li>• What services do you offer?</li>
                  <li>• Can I request a specific stylist?</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Account & Profile</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• How do I update my profile?</li>
                  <li>• I forgot my password</li>
                  <li>• How do I delete my account?</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DirectContactInfo;
