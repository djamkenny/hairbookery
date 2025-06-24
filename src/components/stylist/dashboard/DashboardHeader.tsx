
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
    <div className="flex flex-col space-y-3 md:flex-row md:items-center md:justify-between md:space-y-0 mb-4 md:mb-8">
      <div className="min-w-0">
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
                <span>Specialist Dashboard</span>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        )}
        <h1 className="text-xl md:text-3xl font-bold truncate">Specialist Dashboard</h1>
      </div>
      <Link to="/" className="self-start md:self-auto">
        <Button variant="outline" className="flex items-center gap-2 shrink-0 touch-button">
          <ArrowLeft className="h-4 w-4" />
          <span className={isMobile ? "text-sm" : ""}>
            {isMobile ? "Back" : "Back to Home"}
          </span>
        </Button>
      </Link>
    </div>
  );
};

export default DashboardHeader;
