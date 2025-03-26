
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  CalendarIcon, 
  UserIcon,
  SettingsIcon,
  LogOutIcon,
  ChevronRightIcon,
  ClockIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

// Mock data
const upcomingAppointments = [
  {
    id: 1,
    service: "Haircut & Styling",
    stylist: "Sophia Rodriguez",
    date: "June 15, 2023",
    time: "10:00 AM",
    status: "confirmed"
  },
  {
    id: 2,
    service: "Hair Coloring",
    stylist: "Alex Chen",
    date: "July 2, 2023",
    time: "2:00 PM",
    status: "confirmed"
  }
];

const pastAppointments = [
  {
    id: 3,
    service: "Blowout & Styling",
    stylist: "Emma Johnson",
    date: "May 20, 2023",
    time: "1:00 PM",
    status: "completed"
  },
  {
    id: 4,
    service: "Deep Conditioning",
    stylist: "Marcus Williams",
    date: "April 10, 2023",
    time: "11:00 AM",
    status: "completed"
  }
];

const Profile = () => {
  const [activeTab, setActiveTab] = useState("appointments");
  
  const handleCancelAppointment = (id: number) => {
    toast.success(`Appointment #${id} has been canceled`);
  };
  
  const handleRescheduleAppointment = (id: number) => {
    toast.info(`Redirecting to reschedule appointment #${id}`);
  };
  
  const handleLogout = () => {
    toast.info("You have been logged out");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="md:col-span-1">
              <Card className="sticky top-24 animate-fade-in">
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                  <Avatar className="h-14 w-14">
                    <AvatarImage src="https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3" alt="User" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>Jane Doe</CardTitle>
                    <p className="text-sm text-muted-foreground">jane.doe@example.com</p>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <nav className="mt-2">
                    <Link to="#" onClick={() => setActiveTab("appointments")} className={`flex items-center justify-between px-4 py-2.5 ${activeTab === "appointments" ? "bg-secondary text-primary" : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"} transition-colors rounded-md`}>
                      <div className="flex items-center">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        <span>Appointments</span>
                      </div>
                      <ChevronRightIcon className="h-4 w-4" />
                    </Link>
                    <Link to="#" onClick={() => setActiveTab("profile")} className={`flex items-center justify-between px-4 py-2.5 ${activeTab === "profile" ? "bg-secondary text-primary" : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"} transition-colors rounded-md`}>
                      <div className="flex items-center">
                        <UserIcon className="mr-2 h-4 w-4" />
                        <span>Personal Info</span>
                      </div>
                      <ChevronRightIcon className="h-4 w-4" />
                    </Link>
                    <Link to="#" onClick={() => setActiveTab("settings")} className={`flex items-center justify-between px-4 py-2.5 ${activeTab === "settings" ? "bg-secondary text-primary" : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"} transition-colors rounded-md`}>
                      <div className="flex items-center">
                        <SettingsIcon className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </div>
                      <ChevronRightIcon className="h-4 w-4" />
                    </Link>
                    <div className="px-4 pt-6 pb-2">
                      <Button 
                        variant="outline" 
                        className="w-full justify-start text-muted-foreground hover:text-destructive"
                        onClick={handleLogout}
                      >
                        <LogOutIcon className="mr-2 h-4 w-4" />
                        <span>Logout</span>
                      </Button>
                    </div>
                  </nav>
                </CardContent>
              </Card>
            </div>
            
            {/* Main content */}
            <div className="md:col-span-3 animate-slide-in">
              {activeTab === "appointments" && (
                <div className="space-y-6">
                  <h1 className="text-2xl font-semibold">Your Appointments</h1>
                  
                  <Tabs defaultValue="upcoming">
                    <TabsList className="mb-6">
                      <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                      <TabsTrigger value="past">Past</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="upcoming" className="space-y-4">
                      {upcomingAppointments.length > 0 ? (
                        upcomingAppointments.map((appointment) => (
                          <Card key={appointment.id} className="overflow-hidden hover:shadow-md transition-shadow">
                            <CardContent className="p-0">
                              <div className="border-l-4 border-primary p-6">
                                <div className="flex flex-col sm:flex-row justify-between mb-4">
                                  <div>
                                    <h3 className="font-medium text-lg">{appointment.service}</h3>
                                    <p className="text-muted-foreground">With {appointment.stylist}</p>
                                  </div>
                                  <div className="mt-2 sm:mt-0 sm:text-right">
                                    <div className="flex items-center sm:justify-end text-sm font-medium mb-1">
                                      <CalendarIcon className="h-3.5 w-3.5 mr-1" />
                                      <span>{appointment.date}</span>
                                    </div>
                                    <div className="flex items-center sm:justify-end text-sm text-muted-foreground">
                                      <ClockIcon className="h-3.5 w-3.5 mr-1" />
                                      <span>{appointment.time}</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleRescheduleAppointment(appointment.id)}
                                  >
                                    Reschedule
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="text-destructive hover:bg-destructive/10"
                                    onClick={() => handleCancelAppointment(appointment.id)}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground mb-4">You don't have any upcoming appointments.</p>
                          <Link to="/booking">
                            <Button>Book an Appointment</Button>
                          </Link>
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="past" className="space-y-4">
                      {pastAppointments.length > 0 ? (
                        pastAppointments.map((appointment) => (
                          <Card key={appointment.id} className="overflow-hidden">
                            <CardContent className="p-0">
                              <div className="border-l-4 border-muted p-6">
                                <div className="flex flex-col sm:flex-row justify-between mb-4">
                                  <div>
                                    <h3 className="font-medium text-lg">{appointment.service}</h3>
                                    <p className="text-muted-foreground">With {appointment.stylist}</p>
                                  </div>
                                  <div className="mt-2 sm:mt-0 sm:text-right">
                                    <div className="flex items-center sm:justify-end text-sm font-medium mb-1">
                                      <CalendarIcon className="h-3.5 w-3.5 mr-1" />
                                      <span>{appointment.date}</span>
                                    </div>
                                    <div className="flex items-center sm:justify-end text-sm text-muted-foreground">
                                      <ClockIcon className="h-3.5 w-3.5 mr-1" />
                                      <span>{appointment.time}</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                  >
                                    Book Similar
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                  >
                                    Leave Review
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">You don't have any past appointments.</p>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </div>
              )}
              
              {activeTab === "profile" && (
                <div className="space-y-6">
                  <h1 className="text-2xl font-semibold">Personal Information</h1>
                  <p className="text-muted-foreground">
                    Manage your personal information and preferences.
                  </p>
                  <Card>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm text-muted-foreground">Full Name</label>
                          <p className="font-medium">Jane Doe</p>
                        </div>
                        <div>
                          <label className="text-sm text-muted-foreground">Email</label>
                          <p className="font-medium">jane.doe@example.com</p>
                        </div>
                        <div>
                          <label className="text-sm text-muted-foreground">Phone</label>
                          <p className="font-medium">+1 (555) 123-4567</p>
                        </div>
                        <Button variant="outline">Edit Information</Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
              
              {activeTab === "settings" && (
                <div className="space-y-6">
                  <h1 className="text-2xl font-semibold">Account Settings</h1>
                  <p className="text-muted-foreground">
                    Manage your account settings and preferences.
                  </p>
                  <Card>
                    <CardContent className="p-6">
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">Email Notifications</h3>
                            <p className="text-sm text-muted-foreground">Receive email notifications for appointments</p>
                          </div>
                          <div>Toggle</div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">SMS Notifications</h3>
                            <p className="text-sm text-muted-foreground">Receive SMS reminders for appointments</p>
                          </div>
                          <div>Toggle</div>
                        </div>
                        <div>
                          <h3 className="font-medium mb-2">Change Password</h3>
                          <Button variant="outline">Update Password</Button>
                        </div>
                        <div>
                          <h3 className="font-medium mb-2">Delete Account</h3>
                          <Button variant="outline" className="text-destructive hover:bg-destructive/10">
                            Delete Account
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Profile;
