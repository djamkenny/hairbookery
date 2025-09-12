import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';


const Contact = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Contact Us
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get in touch with us for appointments, questions, or to learn more about our services.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card>
              <CardContent className="p-6 text-center">
                <Phone className="h-8 w-8 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Phone</h3>
                <p className="text-muted-foreground">+233507134930</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Mail className="h-8 w-8 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Email</h3>
                <p className="text-muted-foreground">knlbookery@gmail.com</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <MapPin className="h-8 w-8 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Location</h3>
                <p className="text-muted-foreground">Accra, Ghana</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Clock className="h-8 w-8 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Hours</h3>
                <p className="text-muted-foreground">Mon-Sat: 9AM-8PM</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>
              <form className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground placeholder:text-muted-foreground"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground placeholder:text-muted-foreground"
                    placeholder="your.email@example.com"
                  />
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground placeholder:text-muted-foreground"
                    placeholder="How can we help?"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={5}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground placeholder:text-muted-foreground resize-none"
                    placeholder="Tell us more about your inquiry..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 transition-colors"
                >
                  Send Message
                </button>
              </form>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-6">Why Choose K n L Bookery?</h2>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Professional and experienced stylists</li>
                <li>• Quality products and equipment</li>
                <li>• Convenient online booking</li>
                <li>• Flexible scheduling</li>
                <li>• Competitive pricing</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;