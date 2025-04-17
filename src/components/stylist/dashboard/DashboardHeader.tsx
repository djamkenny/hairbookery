
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

interface DashboardHeaderProps {
  isMobile: boolean;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ isMobile }) => {
  return (
    <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 mb-6 md:mb-8">
      <div>
        {!isMobile && (
          <Breadcrumb className="mb-2">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <span>Stylist Dashboard</span>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        )}
        <h1 className="text-2xl md:text-3xl font-bold">Stylist Dashboard</h1>
      </div>
      <Link to="/">
        <Button variant="outline" className="flex items-center gap-2 shrink-0">
          <ArrowLeft className="h-4 w-4" />
          {!isMobile && "Back to Home"}
        </Button>
      </Link>
    </div>
  );
};

export default DashboardHeader;
