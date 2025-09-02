import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-8">Privacy Policy</h1>
          <div className="prose prose-neutral max-w-none dark:prose-invert">
            
            <p className="text-muted-foreground mb-6">
              <strong>Effective Date:</strong> {new Date().toLocaleDateString()}<br />
              <strong>Last Updated:</strong> {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">1. Introduction</h2>
              <p className="text-muted-foreground mb-4">
                K n L bookery ("KnLbookery," "we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">2. Information We Collect</h2>
              
              <h3 className="text-xl font-medium text-foreground mb-3">2.1 Personal Information</h3>
              <ul className="list-disc pl-6 text-muted-foreground mb-4">
                <li><strong>Account Information:</strong> Name, email address, phone number, password</li>
                <li><strong>Profile Information:</strong> Profile photos, bio, service preferences</li>
                <li><strong>Identity Verification:</strong> Government-issued ID for service providers</li>
                <li><strong>Professional Information:</strong> Licenses, certifications, work experience (for Specialists)</li>
              </ul>

              <h3 className="text-xl font-medium text-foreground mb-3">2.2 Booking and Service Information</h3>
              <ul className="list-disc pl-6 text-muted-foreground mb-4">
                <li>Service preferences and booking history</li>
                <li>Appointment details and notes</li>
                <li>Reviews and ratings</li>
                <li>Communication between users and Specialists</li>
              </ul>

              <h3 className="text-xl font-medium text-foreground mb-3">2.3 Payment Information</h3>
              <p className="text-muted-foreground mb-4">
                Payment processing is handled by Paystack. We do not store complete payment card information. We may retain transaction records and payment method details (last 4 digits, expiration date) for reference.
              </p>

              <h3 className="text-xl font-medium text-foreground mb-3">2.4 Location Information</h3>
              <ul className="list-disc pl-6 text-muted-foreground mb-4">
                <li>Service addresses for bookings</li>
                <li>General location data to match you with nearby Specialists</li>
                <li>GPS location (with your permission) for service delivery tracking</li>
              </ul>

              <h3 className="text-xl font-medium text-foreground mb-3">2.5 Technical Information</h3>
              <ul className="list-disc pl-6 text-muted-foreground mb-4">
                <li>Device information (type, operating system, browser)</li>
                <li>IP address and general location data</li>
                <li>Usage data and analytics</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">3. How We Use Your Information</h2>
              
              <h3 className="text-xl font-medium text-foreground mb-3">3.1 Core Service Functions</h3>
              <ul className="list-disc pl-6 text-muted-foreground mb-4">
                <li>Creating and managing user accounts</li>
                <li>Processing bookings and facilitating connections</li>
                <li>Processing payments and booking fees</li>
                <li>Providing customer support</li>
                <li>Sending service-related notifications</li>
              </ul>

              <h3 className="text-xl font-medium text-foreground mb-3">3.2 Platform Improvement</h3>
              <ul className="list-disc pl-6 text-muted-foreground mb-4">
                <li>Analyzing usage patterns to improve our services</li>
                <li>Developing new features and functionality</li>
                <li>Ensuring platform security and preventing fraud</li>
                <li>Maintaining service quality through monitoring</li>
              </ul>

              <h3 className="text-xl font-medium text-foreground mb-3">3.3 Communication</h3>
              <ul className="list-disc pl-6 text-muted-foreground mb-4">
                <li>Sending appointment confirmations and reminders</li>
                <li>Providing platform updates and important notices</li>
                <li>Marketing communications (with your consent)</li>
                <li>Facilitating communication between clients and Specialists</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">4. Information Sharing and Disclosure</h2>
              
              <h3 className="text-xl font-medium text-foreground mb-3">4.1 With Other Users</h3>
              <ul className="list-disc pl-6 text-muted-foreground mb-4">
                <li>Your profile information is visible to other platform users</li>
                <li>Booking details are shared between clients and assigned Specialists</li>
                <li>Reviews and ratings are publicly visible</li>
              </ul>

              <h3 className="text-xl font-medium text-foreground mb-3">4.2 Service Providers</h3>
              <ul className="list-disc pl-6 text-muted-foreground mb-4">
                <li><strong>Paystack:</strong> For payment processing</li>
                <li><strong>Supabase:</strong> For data storage and backend services</li>
                <li><strong>Analytics providers:</strong> For platform improvement (anonymized data)</li>
                <li><strong>Communication tools:</strong> For customer support and notifications</li>
              </ul>

              <h3 className="text-xl font-medium text-foreground mb-3">4.3 Legal Requirements</h3>
              <p className="text-muted-foreground mb-4">
                We may disclose information when required by law, to protect our rights, or to ensure user safety.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">5. Data Security</h2>
              <h3 className="text-xl font-medium text-foreground mb-3">5.1 Security Measures</h3>
              <ul className="list-disc pl-6 text-muted-foreground mb-4">
                <li>Encryption of data in transit and at rest</li>
                <li>Secure authentication and authorization systems</li>
                <li>Regular security audits and updates</li>
                <li>Limited access to personal information by staff</li>
                <li>Secure payment processing through certified providers</li>
              </ul>

              <h3 className="text-xl font-medium text-foreground mb-3">5.2 Your Responsibility</h3>
              <ul className="list-disc pl-6 text-muted-foreground mb-4">
                <li>Keep your login credentials secure</li>
                <li>Report suspicious account activity immediately</li>
                <li>Use strong passwords and enable two-factor authentication</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">6. Your Privacy Rights</h2>
              
              <h3 className="text-xl font-medium text-foreground mb-3">6.1 Access and Control</h3>
              <ul className="list-disc pl-6 text-muted-foreground mb-4">
                <li><strong>Access:</strong> Request a copy of your personal information</li>
                <li><strong>Correction:</strong> Update inaccurate or incomplete information</li>
                <li><strong>Deletion:</strong> Request deletion of your account and associated data</li>
                <li><strong>Portability:</strong> Request your data in a portable format</li>
              </ul>

              <h3 className="text-xl font-medium text-foreground mb-3">6.2 Communication Preferences</h3>
              <ul className="list-disc pl-6 text-muted-foreground mb-4">
                <li>Opt out of marketing communications at any time</li>
                <li>Manage notification preferences in your account settings</li>
                <li>Essential service communications cannot be disabled</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">7. Cookies and Tracking</h2>
              
              <h3 className="text-xl font-medium text-foreground mb-3">7.1 Types of Cookies We Use</h3>
              <ul className="list-disc pl-6 text-muted-foreground mb-4">
                <li><strong>Essential Cookies:</strong> Required for platform functionality</li>
                <li><strong>Analytics Cookies:</strong> Help us understand platform usage</li>
                <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
              </ul>

              <h3 className="text-xl font-medium text-foreground mb-3">7.2 Managing Cookies</h3>
              <p className="text-muted-foreground mb-4">
                You can manage cookie preferences through your browser settings. Disabling certain cookies may limit platform functionality.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">8. Data Retention</h2>
              <ul className="list-disc pl-6 text-muted-foreground mb-4">
                <li><strong>Active Accounts:</strong> Data retained while account is active</li>
                <li><strong>Deleted Accounts:</strong> Most data deleted within 30 days</li>
                <li><strong>Legal Requirements:</strong> Some data retained longer for compliance</li>
                <li><strong>Financial Records:</strong> Transaction records retained for 7 years</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">9. International Data Transfers</h2>
              <p className="text-muted-foreground mb-4">
                Your information may be transferred to and processed in countries other than Ghana, including servers operated by our service providers. We ensure appropriate safeguards are in place for such transfers.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">10. Children's Privacy</h2>
              <p className="text-muted-foreground mb-4">
                Our platform is not intended for users under 18 years of age. We do not knowingly collect personal information from children under 18.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">11. Changes to This Privacy Policy</h2>
              <p className="text-muted-foreground mb-4">
                We may update this Privacy Policy periodically. Changes will be posted on this page with an updated effective date. Significant changes will be communicated via email or platform notification.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">12. Contact Us</h2>
              <p className="text-muted-foreground mb-4">
                For questions about this Privacy Policy or to exercise your privacy rights, contact us at:
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

export default Privacy;