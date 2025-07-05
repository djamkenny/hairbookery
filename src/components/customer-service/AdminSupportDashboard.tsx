import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Clock, User, AlertCircle } from "lucide-react";

interface SupportTicket {
  id: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  user_id: string;
  response?: string;
  profiles?: {
    full_name: string;
    email: string;
  };
}

const AdminSupportDashboard = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'open' | 'in_progress' | 'resolved'>('all');

  useEffect(() => {
    fetchTickets();
  }, [filter]);

  const fetchTickets = async () => {
    try {
      let query = supabase
        .from('support_tickets')
        .select(`
          *,
          profiles:user_id (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error('Failed to fetch support tickets');
    }
  };

  const updateTicketStatus = async (ticketId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ status })
        .eq('id', ticketId);

      if (error) throw error;

      toast.success('Ticket status updated');
      fetchTickets();
      
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket({ ...selectedTicket, status: status as any });
      }
    } catch (error) {
      console.error('Error updating ticket:', error);
      toast.error('Failed to update ticket status');
    }
  };

  const sendResponse = async () => {
    if (!selectedTicket || !response.trim()) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ 
          response: response.trim(),
          status: 'in_progress'
        })
        .eq('id', selectedTicket.id);

      if (error) throw error;

      toast.success('Response sent successfully');
      setResponse('');
      fetchTickets();
      setSelectedTicket({ ...selectedTicket, response: response.trim(), status: 'in_progress' });
    } catch (error) {
      console.error('Error sending response:', error);
      toast.error('Failed to send response');
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_progress': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTicketStats = () => {
    const total = tickets.length;
    const open = tickets.filter(t => t.status === 'open').length;
    const inProgress = tickets.filter(t => t.status === 'in_progress').length;
    const urgent = tickets.filter(t => t.priority === 'urgent').length;
    
    return { total, open, inProgress, urgent };
  };

  const stats = getTicketStats();

  return (
    <div className="container mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Total Tickets</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.open}</div>
                <div className="text-sm text-muted-foreground">Open</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.inProgress}</div>
                <div className="text-sm text-muted-foreground">In Progress</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{stats.urgent}</div>
                <div className="text-sm text-muted-foreground">Urgent</div>
              </CardContent>
            </Card>
          </div>

          {/* Filter */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filter Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tickets</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Tickets List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Support Tickets</CardTitle>
            </CardHeader>
            <CardContent className="p-0 max-h-96 overflow-y-auto">
              {tickets.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  No tickets found
                </div>
              ) : (
                <div className="space-y-2 p-2">
                  {tickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      onClick={() => setSelectedTicket(ticket)}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-muted ${
                        selectedTicket?.id === ticket.id ? 'bg-muted border-primary' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm line-clamp-1">{ticket.subject}</h4>
                        <div className="flex gap-1">
                          <Badge className={`text-xs ${getPriorityColor(ticket.priority)}`}>
                            {ticket.priority}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span>{ticket.profiles?.full_name || 'Unknown User'}</span>
                        <Clock className="h-3 w-3 ml-2" />
                        <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                      </div>
                      <Badge className={`text-xs mt-2 ${getStatusColor(ticket.status)}`}>
                        {ticket.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2">
          {selectedTicket ? (
            <Card>
              <CardHeader className="border-b">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{selectedTicket.subject}</CardTitle>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>{selectedTicket.profiles?.full_name}</span>
                        <span>({selectedTicket.profiles?.email})</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{new Date(selectedTicket.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getPriorityColor(selectedTicket.priority)}>
                      {selectedTicket.priority}
                    </Badge>
                    <Badge className={getStatusColor(selectedTicket.status)}>
                      {selectedTicket.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                {/* Original Message */}
                <div>
                  <h3 className="font-medium mb-2">Customer Message:</h3>
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="whitespace-pre-wrap">{selectedTicket.message}</p>
                  </div>
                </div>

                {/* Existing Response */}
                {selectedTicket.response && (
                  <div>
                    <h3 className="font-medium mb-2">Your Response:</h3>
                    <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                      <p className="whitespace-pre-wrap">{selectedTicket.response}</p>
                    </div>
                  </div>
                )}

                {/* Status Actions */}
                <div>
                  <h3 className="font-medium mb-2">Update Status:</h3>
                  <div className="flex gap-2">
                    {['open', 'in_progress', 'resolved', 'closed'].map((status) => (
                      <Button
                        key={status}
                        variant={selectedTicket.status === status ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => updateTicketStatus(selectedTicket.id, status)}
                      >
                        {status.replace('_', ' ')}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Response Form */}
                <div>
                  <h3 className="font-medium mb-2">Send Response:</h3>
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Type your response to the customer..."
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                      className="min-h-[120px]"
                    />
                    <Button 
                      onClick={sendResponse}
                      disabled={isLoading || !response.trim()}
                    >
                      {isLoading ? 'Sending...' : 'Send Response'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Select a Support Ticket</h3>
                <p className="text-muted-foreground">
                  Choose a ticket from the sidebar to view details and respond to customers.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSupportDashboard;
