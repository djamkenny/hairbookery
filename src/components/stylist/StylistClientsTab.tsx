
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Users, CalendarPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const SpecialistClientsTab = () => {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      
      // Get the authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("You must be logged in to view clients");
        return;
      }

      // Get all appointments for this specialist
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('client_id, appointment_date, status')
        .eq('stylist_id', user.id);

      if (appointmentsError) {
        console.error("Error fetching appointments:", appointmentsError);
        toast.error("Failed to load client data");
        return;
      }

      if (!appointments || appointments.length === 0) {
        setLoading(false);
        return;
      }

      // Get unique client IDs
      const uniqueClientIds = [...new Set(appointments.map(apt => apt.client_id))];

      // Fetch client profiles
      const { data: clientProfiles, error: clientsError } = await supabase
        .from('profiles')
        .select('id, full_name, email, phone')
        .in('id', uniqueClientIds);

      if (clientsError) {
        console.error("Error fetching client profiles:", clientsError);
        toast.error("Failed to load client details");
        return;
      }

      // Count visits and get last visit date for each client
      const clientsWithStats = clientProfiles?.map(client => {
        const clientAppointments = appointments.filter(apt => apt.client_id === client.id);
        const completedAppointments = clientAppointments.filter(apt => apt.status === 'completed');
        const lastVisitDate = clientAppointments
          .filter(apt => apt.status === 'completed')
          .sort((a, b) => new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime())[0]?.appointment_date;
        
        return {
          id: client.id,
          name: client.full_name || 'Client',
          email: client.email || '',
          phone: client.phone || '',
          visits: completedAppointments.length,
          lastVisit: lastVisitDate ? new Date(lastVisitDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'No visits yet'
        };
      }) || [];

      setClients(clientsWithStats);
    } catch (error) {
      console.error("Error in fetchClients:", error);
      toast.error("An error occurred while fetching clients");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm)
  );

  const handleViewClient = (id: string) => {
    // In a real app, this would navigate to client details page
    toast.info(`Viewing client details is not yet implemented`);
  };

  const handleBookAppointment = (id: string) => {
    navigate(`/booking?client=${id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-semibold">Clients</h1>
        </div>
        
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search clients..."
            className="pl-8 w-full sm:w-[250px]"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Client List</span>
            <span className="text-sm font-normal text-muted-foreground">
              {clients.length} {clients.length === 1 ? 'client' : 'clients'} total
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-pulse flex space-x-4">
                <div className="h-4 bg-muted rounded w-32"></div>
                <div className="h-4 bg-muted rounded w-32"></div>
                <div className="h-4 bg-muted rounded w-32"></div>
              </div>
            </div>
          ) : clients.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No clients yet</h3>
              <p className="text-muted-foreground mb-4">
                When clients book appointments with you, they'll appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Total Visits</TableHead>
                    <TableHead>Last Visit</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{client.name}</TableCell>
                      <TableCell>{client.email}</TableCell>
                      <TableCell>{client.phone}</TableCell>
                      <TableCell>{client.visits}</TableCell>
                      <TableCell>{client.lastVisit}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleViewClient(client.id)}>
                            View
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleBookAppointment(client.id)}
                            className="flex items-center gap-1"
                          >
                            <CalendarPlus className="h-3.5 w-3.5" />
                            Book
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SpecialistClientsTab;
