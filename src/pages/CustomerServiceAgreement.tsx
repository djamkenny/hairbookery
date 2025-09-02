import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const CustomerServiceAgreement = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-8">Customer Service Agreement</h1>
          <div className="prose prose-neutral max-w-none dark:prose-invert">
            
            <p className="text-muted-foreground mb-6">
              <strong>Effective Date:</strong> {new Date().toLocaleDateString()}<br />
              <strong>Last Updated:</strong> {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">1. Agreement Overview</h2>
              <p className="text-muted-foreground mb-4">
                This Customer Service Agreement ("Agreement") outlines the terms and conditions for clients ("Customers," "you") using K n L bookery's ("KnLbookery") platform to book beauty and laundry services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">2. Service Booking Terms</h2>
              
              <h3 className="text-xl font-medium text-foreground mb-3">2.1 Booking Process</h3>
              <ul className="list-disc pl-6 text-muted-foreground mb-4">
                <li>All bookings must be made through the KnLbookery platform</li>
                <li>Bookings are confirmed upon successful payment of booking fee</li>
                <li>You will receive confirmation via email and platform notification</li>
                <li>Service providers ("Specialists") are independent contractors, not KnLbookery employees</li>
              </ul>

              <h3 className="text-xl font-medium text-foreground mb-3">2.2 Pricing Structure</h3>
              <ul className="list-disc pl-6 text-muted-foreground mb-4">
                <li><strong>Service Cost:</strong> Set by individual Specialists, paid directly to them</li>
                <li><strong>Booking Fee:</strong> Paid to KnLbookery at time of booking</li>
                <li>Services ₵100 or more: ₵10 flat booking fee</li>
                <li>Services under ₵100: 10% of service cost as booking fee</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">3. Customer Responsibilities</h2>
              
              <h3 className="text-xl font-medium text-foreground mb-3">3.1 Accurate Information</h3>
              <ul className="list-disc pl-6 text-muted-foreground mb-4">
                <li>Provide accurate contact information and service location</li>
                <li>Clearly describe service requirements and any special needs</li>
                <li>Update your profile information as needed</li>
              </ul>

              <h3 className="text-xl font-medium text-foreground mb-3">3.2 Appointment Attendance</h3>
              <ul className="list-disc pl-6 text-muted-foreground mb-4">
                <li>Be present and ready at scheduled appointment time</li>
                <li>Provide suitable workspace/environment for services</li>
                <li>Communicate any changes or issues promptly</li>
              </ul>

              <h3 className="text-xl font-medium text-foreground mb-3">3.3 Payment Obligations</h3>
              <ul className="list-disc pl-6 text-muted-foreground mb-4">
                <li>Pay booking fee at time of reservation</li>
                <li>Pay service cost directly to Specialist as agreed</li>
                <li>Handle any additional costs (parking, materials) as discussed</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">4. Cancellation and Rescheduling</h2>
              
              <h3 className="text-xl font-medium text-foreground mb-3">4.1 Customer-Initiated Changes</h3>
              <ul className="list-disc pl-6 text-muted-foreground mb-4">
                <li><strong>24+ hours notice:</strong> Full booking fee refund</li>
                <li><strong>12-24 hours notice:</strong> 50% booking fee refund</li>
                <li><strong>Less than 12 hours:</strong> No booking fee refund</li>
                <li><strong>No-show:</strong> No refund, may affect account standing</li>
              </ul>

              <h3 className="text-xl font-medium text-foreground mb-3">4.2 Specialist-Initiated Changes</h3>
              <ul className="list-disc pl-6 text-muted-foreground mb-4">
                <li>Full booking fee refund if Specialist cancels</li>
                <li>₵20 inconvenience credit for last-minute Specialist cancellations</li>
                <li>Assistance with rebooking with alternative Specialists</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">5. Laundry Services - Special Provisions</h2>
              
              <h3 className="text-xl font-medium text-foreground mb-3">5.1 Item Preparation</h3>
              <ul className="list-disc pl-6 text-muted-foreground mb-4">
                <li>Remove all personal items from pockets</li>
                <li>Separate items according to care instructions</li>
                <li>Provide detailed description of any stains or special requirements</li>
                <li>Point out any existing damage or delicate items</li>
              </ul>

              <h3 className="text-xl font-medium text-foreground mb-3">5.2 High-Value Items</h3>
              <ul className="list-disc pl-6 text-muted-foreground mb-4">
                <li>Items valued over ₵500 must be declared in advance</li>
                <li>Additional insurance coverage may be available</li>
                <li>You may be asked to sign additional waivers</li>
              </ul>

              <h3 className="text-xl font-medium text-foreground mb-3">5.3 Liability Acknowledgment</h3>
              <p className="text-muted-foreground mb-4">
                You acknowledge that laundry services carry inherent risks, and that KnLbookery's liability is limited to ₵500 per item unless additional coverage is purchased.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">6. Quality Assurance and Feedback</h2>
              
              <h3 className="text-xl font-medium text-foreground mb-3">6.1 Service Standards</h3>
              <ul className="list-disc pl-6 text-muted-foreground mb-4">
                <li>All Specialists are vetted and verified by KnLbookery</li>
                <li>Services should meet professional industry standards</li>
                <li>Any concerns should be reported within 24 hours</li>
              </ul>

              <h3 className="text-xl font-medium text-foreground mb-3">6.2 Review System</h3>
              <ul className="list-disc pl-6 text-muted-foreground mb-4">
                <li>You are encouraged to provide honest reviews after services</li>
                <li>Reviews help maintain platform quality</li>
                <li>Reviews must be truthful and constructive</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">7. Dispute Resolution</h2>
              
              <h3 className="text-xl font-medium text-foreground mb-3">7.1 Platform Support</h3>
              <ul className="list-disc pl-6 text-muted-foreground mb-4">
                <li>Contact customer service for any service issues</li>
                <li>We will mediate disputes between customers and Specialists</li>
                <li>Document issues with photos when relevant</li>
              </ul>

              <h3 className="text-xl font-medium text-foreground mb-3">7.2 Resolution Process</h3>
              <ol className="list-decimal pl-6 text-muted-foreground mb-4">
                <li>Report issue through platform customer service</li>
                <li>Investigation and mediation by KnLbookery team</li>
                <li>Resolution may include refunds, credits, or re-service</li>
                <li>Escalation to formal dispute resolution if needed</li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">8. Platform Usage Guidelines</h2>
              
              <h3 className="text-xl font-medium text-foreground mb-3">8.1 Respectful Conduct</h3>
              <ul className="list-disc pl-6 text-muted-foreground mb-4">
                <li>Treat all Specialists with courtesy and respect</li>
                <li>Communicate clearly and professionally</li>
                <li>Respect Specialists' professional boundaries</li>
              </ul>

              <h3 className="text-xl font-medium text-foreground mb-3">8.2 Platform Integrity</h3>
              <ul className="list-disc pl-6 text-muted-foreground mb-4">
                <li>Do not attempt to book services outside the platform</li>
                <li>Do not share personal contact information for direct booking</li>
                <li>Report any requests for off-platform arrangements</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">9. Account Management</h2>
              
              <h3 className="text-xl font-medium text-foreground mb-3">9.1 Account Security</h3>
              <ul className="list-disc pl-6 text-muted-foreground mb-4">
                <li>Keep login credentials secure and confidential</li>
                <li>Report suspicious account activity immediately</li>
                <li>You are responsible for all activity on your account</li>
              </ul>

              <h3 className="text-xl font-medium text-foreground mb-3">9.2 Account Termination</h3>
              <ul className="list-disc pl-6 text-muted-foreground mb-4">
                <li>You may delete your account at any time</li>
                <li>KnLbookery may suspend accounts for policy violations</li>
                <li>Outstanding bookings must be resolved before account closure</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">10. Limitation of Liability</h2>
              <p className="text-muted-foreground mb-4">
                KnLbookery's liability is limited to the booking fees you have paid. We are not responsible for:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-4">
                <li>Quality of services provided by independent Specialists</li>
                <li>Personal injury or property damage during services</li>
                <li>Indirect or consequential damages</li>
                <li>Issues arising from services arranged outside our platform</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">11. Contact Information</h2>
              <p className="text-muted-foreground mb-4">
                For questions about this Agreement or customer service issues:
              </p>
              <ul className="list-none text-muted-foreground">
                <li>Email: knlbookery@gmail.com</li>
                <li>Phone: +233 (050) 7134930</li>
                <li>Address: Accra, Ghana</li>
                <li>Customer Service: Available through platform chat</li>
              </ul>
            </section>

            <p className="text-muted-foreground mt-8">
              By using KnLbookery's services, you acknowledge that you have read, understood, and agree to be bound by this Customer Service Agreement and our Terms of Service.
            </p>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CustomerServiceAgreement;