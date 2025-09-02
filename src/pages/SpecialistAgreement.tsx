import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const SpecialistAgreement = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-8">Specialist Service Provider Agreement</h1>
          <div className="prose prose-neutral max-w-none dark:prose-invert">
            
            <p className="text-muted-foreground mb-6">
              <strong>Effective Date:</strong> {new Date().toLocaleDateString()}<br />
              <strong>Last Updated:</strong> {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">1. Agreement Overview</h2>
              <p className="text-muted-foreground mb-4">
                This Specialist Service Provider Agreement ("Agreement") governs the relationship between K n L bookery ("KnLbookery," "Platform") and independent service providers ("Specialists," "you") offering beauty and laundry services through our platform.
              </p>
              <p className="text-muted-foreground mb-4">
                <strong>Important:</strong> You are an independent contractor, not an employee of KnLbookery.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">2. Specialist Qualifications and Verification</h2>
              
              <h3 className="text-xl font-medium text-foreground mb-3">2.1 Required Qualifications</h3>
              <ul className="list-disc pl-6 text-muted-foreground mb-4">
                <li>Must be at least 18 years of age</li>
                <li>Valid government-issued identification</li>
                <li>Relevant professional licenses and certifications for your services</li>
                <li>Professional liability insurance coverage</li>
                <li>Demonstrated experience in your service category</li>
              </ul>

              <h3 className="text-xl font-medium text-foreground mb-3">2.2 Verification Process</h3>
              <ul className="list-disc pl-6 text-muted-foreground mb-4">
                <li>Identity verification through government ID</li>
                <li>Professional credential verification</li>
                <li>Background check (where legally permissible)</li>
                <li>Insurance verification</li>
                <li>Portfolio review and quality assessment</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">3. Service Standards and Professional Obligations</h2>
              
              <h3 className="text-xl font-medium text-foreground mb-3">3.1 Professional Standards</h3>
              <ul className="list-disc pl-6 text-muted-foreground mb-4">
                <li>Maintain current professional licenses and certifications</li>
                <li>Provide services that meet industry professional standards</li>
                <li>Use safe, sanitary, and professional-grade tools and products</li>
                <li>Follow all applicable health and safety regulations</li>
                <li>Maintain professional appearance and conduct</li>
              </ul>

              <h3 className="text-xl font-medium text-foreground mb-3">3.2 Service Delivery Requirements</h3>
              <ul className="list-disc pl-6 text-muted-foreground mb-4">
                <li>Arrive punctually for all confirmed appointments</li>
                <li>Provide services as described in your profile</li>
                <li>Communicate clearly with clients about service expectations</li>
                <li>Complete services in a timely and professional manner</li>
                <li>Clean up work area after service completion</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">4. Platform Usage and Revenue Model</h2>
              
              <h3 className="text-xl font-medium text-foreground mb-3">4.1 Service Pricing</h3>
              <ul className="list-disc pl-6 text-muted-foreground mb-4">
                <li>You set your own service prices within reasonable market ranges</li>
                <li>Prices must be clearly displayed in your service listings</li>
                <li>Price changes require 24-hour advance notice to clients</li>
                <li>All additional costs must be disclosed upfront</li>
              </ul>

              <h3 className="text-xl font-medium text-foreground mb-3">4.2 Payment Structure</h3>
              <ul className="list-disc pl-6 text-muted-foreground mb-4">
                <li><strong>Client pays you directly:</strong> Full service cost at time of appointment</li>
                <li><strong>KnLbookery retains:</strong> Booking fee paid by client at reservation</li>
                <li>Booking fees: ₵10 flat fee for services ₵100+, 10% for services under ₵100</li>
                <li>No additional platform commission on your service fees</li>
              </ul>

              <h3 className="text-xl font-medium text-foreground mb-3">4.3 Booking Management</h3>
              <ul className="list-disc pl-6 text-muted-foreground mb-4">
                <li>Maintain updated availability calendar</li>
                <li>Respond to booking requests within 2 hours</li>
                <li>Confirm or decline requests promptly</li>
                <li>Provide adequate notice for schedule changes</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">5. Cancellation and Schedule Management</h2>
              
              <h3 className="text-xl font-medium text-foreground mb-3">5.1 Your Cancellation Responsibilities</h3>
              <ul className="list-disc pl-6 text-muted-foreground mb-4">
                <li><strong>24+ hours notice:</strong> No penalty, client receives full refund</li>
                <li><strong>12-24 hours notice:</strong> Client receives full refund + ₵20 credit</li>
                <li><strong>Less than 12 hours:</strong> Client receives full refund + ₵20 credit, may affect your rating</li>
                <li><strong>No-show:</strong> Serious violation, may result in account suspension</li>
              </ul>

              <h3 className="text-xl font-medium text-foreground mb-3">5.2 Client No-Shows</h3>
              <ul className="list-disc pl-6 text-muted-foreground mb-4">
                <li>Wait 15 minutes past appointment time</li>
                <li>Attempt to contact client through platform</li>
                <li>Report no-show through platform system</li>
                <li>You may charge a no-show fee as specified in your terms</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">6. Laundry Services - Special Requirements</h2>
              
              <h3 className="text-xl font-medium text-foreground mb-3">6.1 Item Handling and Care</h3>
              <ul className="list-disc pl-6 text-muted-foreground mb-4">
                <li>Inspect all items carefully upon pickup</li>
                <li>Document any existing damage or concerns with photos</li>
                <li>Follow all care labels and client instructions</li>
                <li>Use appropriate cleaning methods and products</li>
                <li>Handle items with professional care and attention</li>
              </ul>

              <h3 className="text-xl font-medium text-foreground mb-3">6.2 Insurance and Liability</h3>
              <ul className="list-disc pl-6 text-muted-foreground mb-4">
                <li>Maintain professional liability insurance covering laundry services</li>
                <li>Report any damage or issues immediately to both client and platform</li>
                <li>Your insurance is primary for claims up to policy limits</li>
                <li>Platform provides secondary coverage up to ₵500 per item</li>
              </ul>

              <h3 className="text-xl font-medium text-foreground mb-3">6.3 High-Value Item Protocol</h3>
              <ul className="list-disc pl-6 text-muted-foreground mb-4">
                <li>Items valued over ₵500 require special acknowledgment</li>
                <li>Additional insurance verification may be required</li>
                <li>Extra care documentation and handling procedures apply</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">7. Non-Circumvention and Platform Integrity</h2>
              
              <h3 className="text-xl font-medium text-foreground mb-3">7.1 Platform Exclusivity During Relationship</h3>
              <ul className="list-disc pl-6 text-muted-foreground mb-4">
                <li>All client relationships initiated through KnLbookery must remain on-platform</li>
                <li>Do not request or provide direct contact information for booking purposes</li>
                <li>Do not arrange services outside the platform with KnLbookery-referred clients</li>
                <li>Report any client requests for off-platform arrangements</li>
              </ul>

              <h3 className="text-xl font-medium text-foreground mb-3">7.2 Violations and Consequences</h3>
              <ul className="list-disc pl-6 text-muted-foreground mb-4">
                <li><strong>First violation:</strong> Warning and mandatory platform training</li>
                <li><strong>Second violation:</strong> 30-day account suspension</li>
                <li><strong>Third violation:</strong> Permanent account termination</li>
                <li><strong>Serious violations:</strong> Immediate termination and potential legal action</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">8. Quality Standards and Customer Service</h2>
              
              <h3 className="text-xl font-medium text-foreground mb-3">8.1 Performance Metrics</h3>
              <ul className="list-disc pl-6 text-muted-foreground mb-4">
                <li>Maintain minimum 4.0/5.0 average rating</li>
                <li>Response time to bookings: Within 2 hours</li>
                <li>Cancellation rate: Less than 5% per month</li>
                <li>No-show rate: Less than 1% per month</li>
              </ul>

              <h3 className="text-xl font-medium text-foreground mb-3">8.2 Customer Communication</h3>
              <ul className="list-disc pl-6 text-muted-foreground mb-4">
                <li>Respond to client messages promptly and professionally</li>
                <li>Provide clear service descriptions and expectations</li>
                <li>Address client concerns with courtesy and solution-focused approach</li>
                <li>Maintain confidentiality of client information</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">9. Platform Support and Resources</h2>
              
              <h3 className="text-xl font-medium text-foreground mb-3">9.1 What KnLbookery Provides</h3>
              <ul className="list-disc pl-6 text-muted-foreground mb-4">
                <li>Client matching and booking management system</li>
                <li>Secure payment processing for booking fees</li>
                <li>Customer service and dispute resolution support</li>
                <li>Marketing and platform promotion</li>
                <li>Professional development resources and training</li>
              </ul>

              <h3 className="text-xl font-medium text-foreground mb-3">9.2 Specialist Support</h3>
              <ul className="list-disc pl-6 text-muted-foreground mb-4">
                <li>24/7 platform technical support</li>
                <li>Dispute mediation services</li>
                <li>Performance analytics and improvement insights</li>
                <li>Professional community forums and resources</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">10. Independent Contractor Relationship</h2>
              
              <h3 className="text-xl font-medium text-foreground mb-3">10.1 Your Responsibilities</h3>
              <ul className="list-disc pl-6 text-muted-foreground mb-4">
                <li>Maintain all required licenses and insurance</li>
                <li>Handle your own tax obligations and reporting</li>
                <li>Provide your own tools, equipment, and supplies</li>
                <li>Manage your own schedule and availability</li>
                <li>Handle transportation to and from appointments</li>
              </ul>

              <h3 className="text-xl font-medium text-foreground mb-3">10.2 Platform Relationship</h3>
              <ul className="list-disc pl-6 text-muted-foreground mb-4">
                <li>You are not an employee of KnLbookery</li>
                <li>No employment benefits are provided</li>
                <li>You have flexibility in how you deliver services</li>
                <li>You maintain control over your pricing and schedule</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">11. Account Management and Termination</h2>
              
              <h3 className="text-xl font-medium text-foreground mb-3">11.1 Account Maintenance</h3>
              <ul className="list-disc pl-6 text-muted-foreground mb-4">
                <li>Keep profile information current and accurate</li>
                <li>Maintain current insurance and licensing documentation</li>
                <li>Update availability calendar regularly</li>
                <li>Respond to platform verification requests promptly</li>
              </ul>

              <h3 className="text-xl font-medium text-foreground mb-3">11.2 Agreement Termination</h3>
              <ul className="list-disc pl-6 text-muted-foreground mb-4">
                <li>Either party may terminate with 30 days' written notice</li>
                <li>Immediate termination for material breach of agreement</li>
                <li>All pending appointments must be fulfilled or properly cancelled</li>
                <li>Post-termination, non-circumvention obligations continue for 12 months</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">12. Dispute Resolution and Legal Terms</h2>
              
              <h3 className="text-xl font-medium text-foreground mb-3">12.1 Dispute Resolution Process</h3>
              <ol className="list-decimal pl-6 text-muted-foreground mb-4">
                <li>Direct communication with platform support</li>
                <li>Formal mediation through designated process</li>
                <li>Binding arbitration if mediation fails</li>
                <li>Court proceedings only for enforcement of arbitration decisions</li>
              </ol>

              <h3 className="text-xl font-medium text-foreground mb-3">12.2 Governing Law</h3>
              <p className="text-muted-foreground mb-4">
                This Agreement is governed by the laws of Ghana. All disputes will be resolved in Ghanaian courts or through arbitration in Accra.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">13. Contact Information and Support</h2>
              <p className="text-muted-foreground mb-4">
                For questions about this Agreement or specialist support:
              </p>
              <ul className="list-none text-muted-foreground">
                <li>Email: knlbookery@gmail.com</li>
                <li>Phone: +233 (050) 7134930</li>
                <li>Address: Accra, Ghana</li>
                <li>Specialist Support: Available through platform dashboard</li>
              </ul>
            </section>

            <p className="text-muted-foreground mt-8">
              By registering as a Specialist on KnLbookery, you acknowledge that you have read, understood, and agree to be bound by this Specialist Service Provider Agreement and all applicable Terms of Service.
            </p>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SpecialistAgreement;