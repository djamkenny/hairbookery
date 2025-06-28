
import React from "react";
import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-secondary/30 border-t border-border/50 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="space-y-4">
            <Link to="/" className="text-foreground text-xl font-semibold flex items-center group">
              <span className="hairline mr-1">K n L</span>
              <span className="text-primary group-hover:text-foreground transition-colors">bookery</span>
            </Link>
            <p className="text-muted-foreground">
              Premium hair salon services with expert stylists dedicated to making you look and feel your best.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Facebook">
                <Facebook size={18} />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Instagram">
                <Instagram size={18} />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Twitter">
                <Twitter size={18} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-foreground mb-4">Navigation</h3>
            <ul className="space-y-2">
              <li><a href="/" className="text-muted-foreground hover:text-primary transition-colors">Home</a></li>
              <li><a href="/#services" className="text-muted-foreground hover:text-primary transition-colors">Services</a></li>
              <li><a href="/#stylists" className="text-muted-foreground hover:text-primary transition-colors">Stylists</a></li>
              <li><a href="/#contact" className="text-muted-foreground hover:text-primary transition-colors">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-foreground mb-4">Services</h3>
            <ul className="space-y-2">
              <li><a href="/#services" className="text-muted-foreground hover:text-primary transition-colors">Haircuts</a></li>
              <li><a href="/#services" className="text-muted-foreground hover:text-primary transition-colors">Coloring</a></li>
              <li><a href="/#services" className="text-muted-foreground hover:text-primary transition-colors">Styling</a></li>
              <li><a href="/#services" className="text-muted-foreground hover:text-primary transition-colors">Treatments</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-foreground mb-4">Contact Us</h3>
            <ul className="space-y-2">
              <li className="text-muted-foreground">Accra, Ghana</li>
              <li className="text-muted-foreground">+233 (050) 7134930</li>
              <li><a href="mailto:knlbookery@gmail.com" className="text-primary hover:text-primary/80 transition-colors">knlbookery@gmail.com</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border/50 pt-8 mt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-muted-foreground text-sm mb-4 md:mb-0">&copy; {new Date().getFullYear()} K n L bookery. All rights reserved.</p>
          <div className="flex space-x-6">
            <Link to="/terms" className="text-muted-foreground hover:text-primary text-sm transition-colors">Terms of Service</Link>
            <Link to="/privacy" className="text-muted-foreground hover:text-primary text-sm transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
