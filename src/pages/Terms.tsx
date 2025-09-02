import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-8">Terms of Service</h1>
          <div className="prose prose-neutral max-w-none dark:prose-invert">
            
            <p className="text-muted-foreground mb-6">
              <strong>Effective Date:</strong> {new Date().toLocaleDateString()}<br />
              <strong>Last Updated:</strong> {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">1. Introduction and Acceptance</h2>
              <p className="text-muted-foreground mb-4">
                Welcome to K n L bookery ("KnLbookery," "we," "us," or "our"). These Terms of Service ("Terms") govern your use of our platform that connects clients with beauty and laundry service providers.
              </p>
              <p className="text-muted-foreground mb-4">
                By accessing or using our services, you agree to be bound by these Terms. If you do not agree, please do not use our platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">2. Service Description</h2>
              <p className="text-muted-foreground mb-4">
                KnLbookery operates as a digital marketplace connecting:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-4">
                <li>Clients seeking beauty services (hair styling, treatments, etc.) and laundry services</li>
                <li>Independent service providers ("Specialists") offering these services</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">3. User Accounts and Registration</h2>
              <h3 className="text-xl font-medium text-foreground mb-3">3.1 Account Requirements</h3>
              <ul className="list-disc pl-6 text-muted-foreground mb-4">
                <li>You must be at least 18 years old to create an account</li>
                <li>You must provide accurate and complete information</li>
                <li>You are responsible for maintaining account security</li>
              </ul>
              
              <h3 className="text-xl font-medium text-foreground mb-3">3.2 Account Types</h3>
              <ul className="list-disc pl-6 text-muted-foreground mb-4">
                <li><strong>Client Accounts:</strong> For booking services</li>
                <li><strong>Specialist Accounts:</strong> For service providers (subject to additional verification)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">4. Booking and Payment Terms</h2>
              <h3 className="text-xl font-medium text-foreground mb-3">4.1 Booking Process</h3>
              <ul className="list-disc pl-6 text-muted-foreground mb-4">
                <li>Bookings are confirmed upon payment of the booking fee</li>
                <li>Service prices are set by individual Specialists</li>
                <li>Total payment = Service cost + Booking fee</li>
              </ul>

              <h3 className="text-xl font-medium text-foreground mb-3">4.2 Booking Fees</h3>
              <ul className="list-disc pl-6 text-muted-foreground mb-4">
                <li>Services ₵100+: ₵10 flat booking fee</li>
                <li>Services under ₵100: 10% booking fee</li>
                <li>Booking fees are non-refundable and payable at time of booking</li>
                <li>Service costs are paid directly to the Specialist at appointment</li>
              </ul>

              <h3 className="text-xl font-medium text-foreground mb-3">4.3 Payment Processing</h3>
              <p className="text-muted-foreground mb-4">
                Payments are processed securely through Paystack. We do not store payment information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">5. Cancellation and Refund Policy</h2>
              <h3 className="text-xl font-medium text-foreground mb-3">5.1 Client Cancellations</h3>
              <ul className="list-disc pl-6 text-muted-foreground mb-4">
                <li><strong>24+ hours notice:</strong> Full booking fee refund</li>
                <li><strong>12-24 hours notice:</strong> 50% booking fee refund</li>
                <li><strong>Less than 12 hours:</strong> No refund</li>
              </ul>

              <h3 className="text-xl font-medium text-foreground mb-3">5.2 Specialist Cancellations</h3>
              <p className="text-muted-foreground mb-4">
                If a Specialist cancels, clients receive full booking fee refund plus a ₵20 inconvenience credit.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">6. Laundry Services - Special Terms</h2>
              <h3 className="text-xl font-medium text-foreground mb-3">6.1 Item Handling</h3>
              <ul className="list-disc pl-6 text-muted-foreground mb-4">
                <li>Clients must accurately describe items and any special requirements</li>
                <li>Specialists will inspect items upon pickup</li>
                <li>Any damage or issues must be reported immediately</li>
              </ul>

              <h3 className="text-xl font-medium text-foreground mb-3">6.2 Liability for Laundry Items</h3>
              <ul className="list-disc pl-6 text-muted-foreground mb-4">
                <li>KnLbookery's liability is limited to ₵500 per item</li>
                <li>Specialists may offer additional insurance coverage</li>
                <li>High-value items require special arrangement and disclosure</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">7. Specialist Obligations</h2>
              <ul className="list-disc pl-6 text-muted-foreground mb-4">
                <li>Maintain professional standards and qualifications</li>
                <li>Provide services as described</li>
                <li>Maintain appropriate insurance coverage</li>
                <li>Comply with all applicable health and safety regulations</li>
                <li>Honor confirmed bookings or provide adequate notice for cancellations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">8. Platform Usage Rules</h2>
              <h3 className="text-xl font-medium text-foreground mb-3">8.1 Prohibited Activities</h3>
              <ul className="list-disc pl-6 text-muted-foreground mb-4">
                <li>Circumventing the platform for direct bookings</li>
                <li>Providing false or misleading information</li>
                <li>Harassment or inappropriate behavior</li>
                <li>Violating any applicable laws or regulations</li>
              </ul>

              <h3 className="text-xl font-medium text-foreground mb-3">8.2 Non-Circumvention</h3>
              <p className="text-muted-foreground mb-4">
                Users agree not to bypass the platform to arrange services directly, which undermines our business model and community trust.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">9. Limitation of Liability</h2>
              <p className="text-muted-foreground mb-4">
                KnLbookery acts as an intermediary platform. We are not liable for:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-4">
                <li>Quality of services provided by Specialists</li>
                <li>Actions or conduct of platform users</li>
                <li>Direct, indirect, or consequential damages beyond our booking fees collected</li>
                <li>Issues arising from services performed off-platform</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">10. Dispute Resolution</h2>
              <h3 className="text-xl font-medium text-foreground mb-3">10.1 Platform Mediation</h3>
              <p className="text-muted-foreground mb-4">
                We encourage users to resolve disputes through our customer service system first.
              </p>

              <h3 className="text-xl font-medium text-foreground mb-3">10.2 Governing Law</h3>
              <p className="text-muted-foreground mb-4">
                These Terms are governed by the laws of Ghana. Disputes will be resolved in Ghana courts.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">11. Privacy and Data Protection</h2>
              <p className="text-muted-foreground mb-4">
                Your privacy is important to us. Please review our Privacy Policy for information about how we collect, use, and protect your personal information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">12. Modifications to Terms</h2>
              <p className="text-muted-foreground mb-4">
                We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting. Continued use of the platform after changes constitutes acceptance of new Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">13. Termination</h2>
              <p className="text-muted-foreground mb-4">
                We may terminate or suspend accounts for violations of these Terms. Users may delete their accounts at any time through account settings.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">14. Contact Information</h2>
              <p className="text-muted-foreground mb-4">
                For questions about these Terms, contact us at:
              </p>
              <ul className="list-none text-muted-foreground">
                <li>Email: knlbookery@gmail.com</li>
                <li>Phone: +233 (050) 7134930</li>
                <li>Address: Accra, Ghana</li>
              </ul>
            </section>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Terms;