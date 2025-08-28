import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Scissors, Shirt, ArrowRight } from "lucide-react";

interface ServiceTypeSelectorProps {
  onServiceTypeSelect: (type: 'beauty' | 'laundry') => void;
}

export const ServiceTypeSelector: React.FC<ServiceTypeSelectorProps> = ({ onServiceTypeSelect }) => {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Choose Service Type</h1>
        <p className="text-muted-foreground">
          Select the type of service you'd like to book
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Beauty Services */}
        <Card 
          className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] border-2 hover:border-primary"
          onClick={() => onServiceTypeSelect('beauty')}
        >
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
              <Scissors className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-xl">Beauty & Hair Services</CardTitle>
            <CardDescription>
              Professional hair styling, beauty treatments, and grooming services
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center">
                <div className="w-2 h-2 bg-primary rounded-full mr-2" />
                Hair cutting, styling & coloring
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-primary rounded-full mr-2" />
                Braiding, extensions & protective styles
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-primary rounded-full mr-2" />
                Nail care & beauty treatments
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-primary rounded-full mr-2" />
                Professional consultation
              </li>
            </ul>
            
            <Button className="w-full group">
              Book Beauty Service
              <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </CardContent>
        </Card>

        {/* Laundry Services */}
        <Card 
          className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] border-2 hover:border-primary"
          onClick={() => onServiceTypeSelect('laundry')}
        >
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center mb-4">
              <Shirt className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-xl">Laundry Services</CardTitle>
            <CardDescription>
              Professional laundry, dry cleaning with pickup and delivery
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center">
                <div className="w-2 h-2 bg-primary rounded-full mr-2" />
                Wash, dry & fold services
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-primary rounded-full mr-2" />
                Dry cleaning & pressing
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-primary rounded-full mr-2" />
                Pickup & delivery service
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-primary rounded-full mr-2" />
                Express & standard options
              </li>
            </ul>
            
            <Button className="w-full group">
              Book Laundry Service
              <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Need help choosing? <a href="/contact" className="text-primary hover:underline">Contact our support team</a>
        </p>
      </div>
    </div>
  );
};