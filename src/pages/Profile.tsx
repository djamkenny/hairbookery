
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  CalendarIcon, 
  UserIcon,
  SettingsIcon,
  LogOutIcon,
  ChevronRightIcon,
  ClockIcon,
  PencilIcon,
  HeartIcon,
  CheckIcon,
  XIcon,
  PlusIcon,
  LineChartIcon,
  ScissorsIcon,
  InfoIcon,
  BellIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { supabase } from "@/integrations/supabase/client";
import DashboardSummary from "@/components/dashboard/DashboardSummary";
import AppointmentStats from "@/components/dashboard/AppointmentStats";
import QuickActions from "@/components/dashboard/QuickActions";

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

const favoriteSylists = [
  {
    id: 1,
    name: "Sophia Rodriguez",
    specialty: "Hair Styling",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3"
  },
  {
    id: 2,
    name: "Alex Chen",
    specialty: "Hair Coloring",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3"
  }
];

const Profile = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isEditing, setIsEditing] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(true);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  // User profile state variables
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUser(user);
          // Initialize the profile fields with user data if available
          setEmail(user.email || "");
          
          // Try to get additional profile data from metadata if available
          const metadata = user.user_metadata || {};
          setFullName(metadata.full_name || "");
          setPhone(metadata.phone || "");
        } else {
          navigate("/login");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    
    fetchUserProfile();
  }, [navigate]);
  
  const handleCancelAppointment = (id: number) => {
    toast.success(`Appointment #${id} has been canceled`);
  };
  
  const handleRescheduleAppointment = (id: number) => {
    toast.info(`Redirecting to reschedule appointment #${id}`);
  };
  
  const handleLogout = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      toast.info("You have been logged out");
      navigate("/login");
    } catch (error: any) {
      toast.error(error.message || "An error occurred during logout");
    } finally {
      setLoading(false);
    }
  };
  
  const handleSaveProfile = () => {
    setLoading(true);
    
    setTimeout(() => {
      setIsEditing(false);
      setLoading(false);
      toast.success("Profile information updated successfully");
    }, 1000);
  };
  
  const toggleEmailNotifications = (checked: boolean) => {
    setEmailNotifications(checked);
    toast.success(`Email notifications ${checked ? 'enabled' : 'disabled'}`);
  };
  
  const toggleSmsNotifications = (checked: boolean) => {
    setSmsNotifications(checked);
    toast.success(`SMS notifications ${checked ? 'enabled' : 'disabled'}`);
  };
  
  const removeFavoriteStylist = (id: number) => {
    toast.success("Stylist removed from favorites");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow py-20 bg-background/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <Card className="sticky top-24 animate-fade-in shadow-md border border-border/30">
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                  <Avatar className="h-14 w-14 ring-2 ring-offset-2 ring-primary/20">
                    <AvatarImage src="https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3" alt="User" />
                    <AvatarFallback>{user?.email?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>{fullName || "User"}</CardTitle>
                    <p className="text-sm text-muted-foreground">{email}</p>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <nav className="mt-4">
                    <Link to="#" onClick={() => setActiveTab("dashboard")} className={`flex items-center justify-between px-4 py-3 ${activeTab === "dashboard" ? "bg-secondary text-primary" : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"} transition-colors rounded-md`}>
                      <div className="flex items-center">
                        <LineChartIcon className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </div>
                      <ChevronRightIcon className="h-4 w-4" />
                    </Link>
                    <Link to="#" onClick={() => setActiveTab("appointments")} className={`flex items-center justify-between px-4 py-3 ${activeTab === "appointments" ? "bg-secondary text-primary" : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"} transition-colors rounded-md`}>
                      <div className="flex items-center">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        <span>Appointments</span>
                      </div>
                      <ChevronRightIcon className="h-4 w-4" />
                    </Link>
                    <Link to="#" onClick={() => setActiveTab("profile")} className={`flex items-center justify-between px-4 py-3 ${activeTab === "profile" ? "bg-secondary text-primary" : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"} transition-colors rounded-md`}>
                      <div className="flex items-center">
                        <UserIcon className="mr-2 h-4 w-4" />
                        <span>Personal Info</span>
                      </div>
                      <ChevronRightIcon className="h-4 w-4" />
                    </Link>
                    <Link to="#" onClick={() => setActiveTab("favorites")} className={`flex items-center justify-between px-4 py-3 ${activeTab === "favorites" ? "bg-secondary text-primary" : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"} transition-colors rounded-md`}>
                      <div className="flex items-center">
                        <HeartIcon className="mr-2 h-4 w-4" />
                        <span>Favorites</span>
                      </div>
                      <ChevronRightIcon className="h-4 w-4" />
                    </Link>
                    <Link to="#" onClick={() => setActiveTab("settings")} className={`flex items-center justify-between px-4 py-3 ${activeTab === "settings" ? "bg-secondary text-primary" : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"} transition-colors rounded-md`}>
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
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <div className="h-4 w-4 mr-2 animate-spin border-2 border-primary border-t-transparent rounded-full"></div>
                            <span>Logging out...</span>
                          </>
                        ) : (
                          <>
                            <LogOutIcon className="mr-2 h-4 w-4" />
                            <span>Logout</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </nav>
                </CardContent>
              </Card>
            </div>
            
            <div className="md:col-span-3 animate-slide-in space-y-6">
              {activeTab === "dashboard" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Dashboard</h1>
                    <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
                      <BellIcon className="h-3.5 w-3.5" />
                      <span>Member since {new Date(user?.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                    </Badge>
                  </div>
                  
                  <DashboardSummary appointments={upcomingAppointments.length} favorites={favoriteSylists.length} />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <AppointmentStats pastAppointments={pastAppointments.length} upcomingAppointments={upcomingAppointments.length} />
                    <QuickActions />
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Next Appointment</CardTitle>
                      <CardDescription>Your upcoming appointment details</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {upcomingAppointments.length > 0 ? (
                        <div className="bg-secondary/30 p-4 rounded-lg border border-border/30">
                          <div className="flex flex-col md:flex-row justify-between gap-4">
                            <div>
                              <h3 className="font-medium text-lg">{upcomingAppointments[0].service}</h3>
                              <p className="text-muted-foreground">With {upcomingAppointments[0].stylist}</p>
                            </div>
                            <div>
                              <div className="flex items-center text-sm font-medium mb-1">
                                <CalendarIcon className="h-3.5 w-3.5 mr-1" />
                                <span>{upcomingAppointments[0].date}</span>
                              </div>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <ClockIcon className="h-3.5 w-3.5 mr-1" />
                                <span>{upcomingAppointments[0].time}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-4">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleRescheduleAppointment(upcomingAppointments[0].id)}
                            >
                              Reschedule
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-destructive hover:bg-destructive/10"
                              onClick={() => handleCancelAppointment(upcomingAppointments[0].id)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <p className="text-muted-foreground mb-3">You don't have any upcoming appointments.</p>
                          <Link to="/booking">
                            <Button size="sm">Book an Appointment</Button>
                          </Link>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
              
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
                        <div className="text-center py-8 bg-muted/30 rounded-lg">
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
                        <div className="text-center py-8 bg-muted/30 rounded-lg">
                          <p className="text-muted-foreground">You don't have any past appointments.</p>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </div>
              )}
              
              {activeTab === "profile" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Personal Information</h1>
                    {!isEditing && (
                      <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                        <PencilIcon className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    )}
                  </div>
                  
                  <Card className="shadow-sm">
                    <CardContent className="p-6">
                      {isEditing ? (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input
                              id="fullName"
                              value={fullName}
                              onChange={(e) => setFullName(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              disabled
                            />
                            <p className="text-sm text-muted-foreground">
                              Email cannot be changed. Contact support for assistance.
                            </p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                              id="phone"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                            />
                          </div>
                          <div className="pt-4 flex gap-2 justify-end">
                            <Button 
                              variant="outline" 
                              onClick={() => setIsEditing(false)}
                            >
                              Cancel
                            </Button>
                            <Button 
                              onClick={handleSaveProfile}
                              disabled={loading}
                            >
                              {loading ? (
                                <>
                                  <div className="h-4 w-4 mr-2 animate-spin border-2 border-white border-t-transparent rounded-full"></div>
                                  <span>Saving...</span>
                                </>
                              ) : (
                                <>
                                  <CheckIcon className="h-4 w-4 mr-2" />
                                  <span>Save Changes</span>
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm text-muted-foreground">Full Name</label>
                              <p className="font-medium">{fullName}</p>
                            </div>
                            <div>
                              <label className="text-sm text-muted-foreground">Email</label>
                              <p className="font-medium">{email}</p>
                            </div>
                            <div>
                              <label className="text-sm text-muted-foreground">Phone</label>
                              <p className="font-medium">{phone}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  <Card className="shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg">Profile Photo</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20">
                          <AvatarImage src="https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3" alt="User" />
                          <AvatarFallback>{user?.email?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-2">
                          <Button size="sm" variant="outline">Change Photo</Button>
                          <p className="text-xs text-muted-foreground">
                            JPG, GIF or PNG. Max size 1MB.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
              
              {activeTab === "favorites" && (
                <div className="space-y-6">
                  <h1 className="text-2xl font-semibold">Favorite Stylists</h1>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {favoriteSylists.map((stylist) => (
                      <Card key={stylist.id} className="overflow-hidden">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <Avatar className="h-16 w-16">
                              <AvatarImage src={stylist.image} alt={stylist.name} />
                              <AvatarFallback>{stylist.name[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-medium">{stylist.name}</h3>
                                  <p className="text-sm text-muted-foreground">{stylist.specialty}</p>
                                </div>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 w-8 p-0" 
                                  onClick={() => removeFavoriteStylist(stylist.id)}
                                >
                                  <XIcon className="h-4 w-4 text-muted-foreground" />
                                </Button>
                              </div>
                              <div className="mt-3">
                                <Link to={`/stylist/${stylist.id}`}>
                                  <Button size="sm" variant="outline" className="w-full">
                                    View Profile
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  {favoriteSylists.length === 0 && (
                    <div className="text-center py-8 bg-muted/30 rounded-lg">
                      <p className="text-muted-foreground mb-4">You don't have any favorite stylists yet.</p>
                      <Link to="/booking">
                        <Button>Browse Stylists</Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}
              
              {activeTab === "settings" && (
                <div className="space-y-6">
                  <h1 className="text-2xl font-semibold">Account Settings</h1>
                  <p className="text-muted-foreground">
                    Manage your account settings and preferences.
                  </p>
                  <Card className="shadow-sm">
                    <CardContent className="p-6">
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">Email Notifications</h3>
                            <p className="text-sm text-muted-foreground">Receive email notifications for appointments</p>
                          </div>
                          <Switch 
                            checked={emailNotifications} 
                            onCheckedChange={toggleEmailNotifications} 
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">SMS Notifications</h3>
                            <p className="text-sm text-muted-foreground">Receive SMS reminders for appointments</p>
                          </div>
                          <Switch 
                            checked={smsNotifications} 
                            onCheckedChange={toggleSmsNotifications} 
                          />
                        </div>
                        <div className="h-px bg-border my-2"></div>
                        <div>
                          <h3 className="font-medium mb-2">Change Password</h3>
                          <Button variant="outline">Update Password</Button>
                        </div>
                        <div className="h-px bg-border my-2"></div>
                        <div>
                          <h3 className="font-medium mb-2">Delete Account</h3>
                          <p className="text-sm text-muted-foreground mb-3">
                            Once you delete your account, there is no going back. Please be certain.
                          </p>
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
