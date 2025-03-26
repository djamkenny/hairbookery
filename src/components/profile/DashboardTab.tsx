
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  CalendarIcon, 
  ClockIcon,
  BellIcon,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DashboardSummary from "@/components/dashboard/DashboardSummary";
import AppointmentStats from "@/components/dashboard/AppointmentStats";
import QuickActions from "@/components/dashboard/QuickActions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface Appointment {
  id: number;
  service: string;
  stylist: string;
  date: string;
  time: string;
  status: string;
}

interface DashboardTabProps {
  user: any;
  upcomingAppointments: Appointment[];
  pastAppointments: Appointment[];
  favoriteSylists: any[];
  handleRescheduleAppointment: (id: number) => void;
  handleCancelAppointment: (id: number) => void;
}

const DashboardTab = ({ 
  user, 
  upcomingAppointments: initialUpcomingAppointments, 
  pastAppointments: initialPastAppointments, 
  favoriteSylists, 
  handleRescheduleAppointment, 
  handleCancelAppointment 
}: DashboardTabProps) => {
  const [upcomingAppointments, setUpcomingAppointments] = useState(initialUpcomingAppointments);
  const [pastAppointments, setPastAppointments] = useState(initialPastAppointments);
  const [refreshing, setRefreshing] = useState(false);

  // Function to fetch latest appointment data
  const refreshAppointments = async () => {
    if (!user?.id) return;
    
    try {
      setRefreshing(true);
      
      // Fetch appointments from Supabase
      const { data: appointmentsData, error } = await supabase
        .from('appointments')
        .select(`
          id,
          appointment_date,
          appointment_time,
          status,
          services:service_id(name),
          stylists:stylist_id(full_name)
        `)
        .eq('client_id', user.id)
        .order('appointment_date', { ascending: true });
      
      if (error) {
        throw error;
      }
      
      // Process fetched appointments
      if (appointmentsData) {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Start of today
        
        const formattedAppointments = appointmentsData.map(apt => ({
          id: apt.id,
          service: apt.services?.name || 'Service',
          stylist: apt.stylists?.full_name || 'Stylist',
          date: format(new Date(apt.appointment_date), 'MMMM dd, yyyy'),
          time: apt.appointment_time,
          status: apt.status
        }));
        
        // Split into upcoming and past appointments
        const upcoming = formattedAppointments.filter(apt => 
          new Date(apt.date) >= today && apt.status !== 'completed' && apt.status !== 'canceled'
        );
        
        const past = formattedAppointments.filter(apt => 
          new Date(apt.date) < today || apt.status === 'completed' || apt.status === 'canceled'
        );
        
        setUpcomingAppointments(upcoming);
        setPastAppointments(past);
      }
    } catch (error) {
      console.error("Error refreshing appointments:", error);
      toast.error("Failed to refresh appointments");
    } finally {
      setRefreshing(false);
    }
  };

  // Set up real-time subscription for appointments
  useEffect(() => {
    if (!user?.id) return;
    
    // Initial fetch
    refreshAppointments();
    
    // Set up real-time updates
    const channel = supabase
      .channel('public:appointments')
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'appointments',
          filter: `client_id=eq.${user.id}`
        }, 
        (payload) => {
          console.log("Appointment updated:", payload);
          refreshAppointments();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshAppointments}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
            <BellIcon className="h-3.5 w-3.5" />
            <span>Member since {new Date(user?.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
          </Badge>
        </div>
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
  );
};

export default DashboardTab;
