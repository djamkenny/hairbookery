
import React, { ReactNode } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  icon?: ReactNode;
}

const AuthLayout = ({ title, subtitle, children, icon }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow flex items-center justify-center py-20 mt-16">
        <div className="container max-w-md px-4">
          <div className="text-center mb-8 animate-fade-in">
            {icon && (
              <div className="flex justify-center mb-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  {icon}
                </div>
              </div>
            )}
            <h1 className="text-3xl font-semibold mb-2">{title}</h1>
            <p className="text-muted-foreground">{subtitle}</p>
          </div>
          
          {children}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AuthLayout;
