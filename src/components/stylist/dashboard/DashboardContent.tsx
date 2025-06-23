
import React from "react";
import { TabsContent } from "@/components/ui/tabs";
import StylistInfoTab from "@/components/stylist/StylistInfoTab";
import StylistAppointmentsTab from "@/components/stylist/StylistAppointmentsTab";
import StylistClientsTab from "@/components/stylist/StylistClientsTab";
import StylistServicesTab from "@/components/stylist/StylistServicesTab";
import StylistSettingsTab from "@/components/stylist/StylistSettingsTab";
import AnalyticsTab from "@/components/stylist/analytics/AnalyticsTab";

interface DashboardContentProps {
  user: any;
  fullName: string;
  setFullName: (value: string) => void;
  email: string;
  phone: string;
  setPhone: (value: string) => void;
  specialty: string;
  setSpecialty: (value: string) => void;
  experience: string;
  setExperience: (value: string) => void;
  bio: string;
  setBio: (value: string) => void;
  avatarUrl: string | null;
  refreshUserProfile: () => Promise<void>;
}

const DashboardContent: React.FC<DashboardContentProps> = ({
  user,
  fullName,
  setFullName,
  email,
  phone,
  setPhone,
  specialty,
  setSpecialty,
  experience,
  setExperience,
  bio,
  setBio,
  avatarUrl,
  refreshUserProfile
}) => {
  return (
    <>
      <TabsContent value="profile" className="w-full mt-4">
        <StylistInfoTab 
          user={user}
          fullName={fullName}
          setFullName={setFullName}
          email={email}
          phone={phone}
          setPhone={setPhone}
          specialty={specialty}
          setSpecialty={setSpecialty}
          experience={experience}
          setExperience={setExperience}
          bio={bio}
          setBio={setBio}
          avatarUrl={avatarUrl}
          refreshUserProfile={refreshUserProfile}
        />
      </TabsContent>
      
      <TabsContent value="appointments" className="w-full mt-4">
        <StylistAppointmentsTab />
      </TabsContent>
      
      <TabsContent value="clients" className="w-full mt-4">
        <StylistClientsTab />
      </TabsContent>
      
      <TabsContent value="services" className="w-full mt-4">
        <StylistServicesTab />
      </TabsContent>
      
      <TabsContent value="analytics" className="w-full mt-4">
        <AnalyticsTab />
      </TabsContent>
      
      <TabsContent value="settings" className="w-full mt-4">
        <StylistSettingsTab />
      </TabsContent>
    </>
  );
};

export default DashboardContent;
