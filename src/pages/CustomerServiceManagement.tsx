import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSecurityMiddleware } from "@/hooks/useSecurityMiddleware";
import { useNavigate } from "react-router-dom";
import { 
  Clock, 
  User, 
  AlertCircle, 
  Send, 
  Search,
  Filter,
  MessageSquare,
  Users,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  ArrowLeft
} from "lucide-react";

interface ChatMessage {
  id: string;
  message: string;
  sender_type: 'user' | 'admin';
  created_at: string;
  sender_id: string;
}

interface SupportTicket {
  id: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  user_id: string;
  response?: string;
  user_profile?: {
    full_name: string;
    email: string;
  };
}

const CustomerServiceManagement = () => {
  const { isAuthorized } = useSecurityMiddleware(true);
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'in_progress' | 'resolved' | 'closed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high' | 'urgent'>('all');

  useEffect(() => {
    if (isAuthorized) {
      fetchTickets();
    }
  }, [isAuthorized, statusFilter, priorityFilter]);

  // Real-time subscription for new tickets and messages
  useEffect(() => {
    if (!isAuthorized) return;

    const ticketsChannel = supabase
      .channel('cs_tickets')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'support_tickets'
        },
        () => {
          fetchTickets();
          toast.success('New support ticket received!');
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ticketsChannel);
    };
  }, [isAuthorized]);

  // Real-time subscription for messages in selected ticket
  useEffect(() => {
    if (!selectedTicket) return;

    const messagesChannel = supabase
      .channel(`cs_messages_${selectedTicket.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `ticket_id=eq.${selectedTicket.id}`
        },
        (payload) => {
          const newMessage = payload.new as ChatMessage;
          setMessages(prev => [...prev, newMessage]);
          
          if (newMessage.sender_type === 'user') {
            toast.success('New message from customer');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
    };
  }, [selectedTicket]);

  const fetchTickets = async () => {
    try {
      let query = supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (priorityFilter !== 'all') {
        query = query.eq('priority', priorityFilter);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching tickets:', error);
        return;
      }
      
      if (data && Array.isArray(data)) {
        const ticketsWithProfiles = await Promise.all(
          data.map(async (ticket) => {
            try {
              const { data: profile } = await supabase
                .from('profiles')
                .select('full_name, email')
                .eq('id', ticket.user_id)
                .single();
              
              return {
                ...ticket,
                status: ticket.status as 'open' | 'in_progress' | 'resolved' | 'closed',
                priority: ticket.priority as 'low' | 'medium' | 'high' | 'urgent',
                user_profile: profile || { full_name: 'Unknown User', email: 'unknown@email.com' }
              };
            } catch {
              return {
                ...ticket,
                status: ticket.status as 'open' | 'in_progress' | 'resolved' | 'closed',
                priority: ticket.priority as 'low' | 'medium' | 'high' | 'urgent',
                user_profile: { full_name: 'Unknown User', email: 'unknown@email.com' }
              };
            }
          })
        );
        
        setTickets(ticketsWithProfiles);
      } else {
        setTickets([]);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error('Failed to fetch support tickets');
      setTickets([]);
    }
  };

  const fetchMessages = async (ticketId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      const typedMessages = (data || []).map(msg => ({
        ...msg,
        sender_type: msg.sender_type as 'user' | 'admin'
      }));
      
      setMessages(typedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to fetch messages');
    }
  };

  const handleTicketSelect = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    fetchMessages(ticket.id);
    setNewMessage('');
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

  const sendMessage = async () => {
    if (!selectedTicket || !newMessage.trim()) return;

    setIsLoading(true);
    try {
      const { error: messageError } = await supabase
        .from('chat_messages')
        .insert({
          ticket_id: selectedTicket.id,
          sender_type: 'admin',
          message: newMessage.trim()
        });

      if (messageError) throw messageError;

      if (selectedTicket.status === 'open') {
        await updateTicketStatus(selectedTicket.id, 'in_progress');
      }

      toast.success('Message sent successfully');
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
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

  const filteredTickets = tickets.filter(ticket =>
    ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.user_profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.user_profile?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isAuthorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  const stats = getTicketStats();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/admin-dashboard')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-semibold">Customer Service Management</h1>
                <p className="text-sm text-muted-foreground">
                  Manage support tickets and customer communications
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                {stats.total} Total
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {stats.urgent} Urgent
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                  <div className="text-sm text-muted-foreground">Total</div>
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

            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tickets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={priorityFilter} onValueChange={(value: any) => setPriorityFilter(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
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
                {filteredTickets.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    No tickets found
                  </div>
                ) : (
                  <div className="space-y-2 p-2">
                    {filteredTickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        onClick={() => handleTicketSelect(ticket)}
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
                          <span>{ticket.user_profile?.full_name || 'Unknown User'}</span>
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
                          <span>{selectedTicket.user_profile?.full_name}</span>
                          <span>({selectedTicket.user_profile?.email})</span>
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
                  {/* Chat Messages */}
                  <div className="max-h-96 overflow-y-auto space-y-3 bg-gray-50 p-4 rounded-lg">
                    {messages.length === 0 ? (
                      <div className="text-center text-muted-foreground">
                        No messages yet. Send the first message to start the conversation.
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] p-3 rounded-lg text-sm ${
                              message.sender_type === 'admin'
                                ? 'bg-blue-500 text-white'
                                : 'bg-white border shadow-sm'
                            }`}
                          >
                            <div>{message.message}</div>
                            <div className={`text-xs mt-1 ${
                              message.sender_type === 'admin' ? 'text-blue-100' : 'text-gray-500'
                            }`}>
                              {new Date(message.created_at).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

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

                  {/* Send Message */}
                  <div>
                    <h3 className="font-medium mb-2">Send Message:</h3>
                    <div className="flex gap-2">
                      <Textarea
                        placeholder="Type your message to the customer..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="min-h-[80px]"
                      />
                      <Button 
                        onClick={sendMessage}
                        disabled={isLoading || !newMessage.trim()}
                        size="icon"
                        className="self-end"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Select a Support Ticket</h3>
                  <p className="text-muted-foreground">
                    Choose a ticket from the sidebar to view details and chat with customers.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CustomerServiceManagement;
