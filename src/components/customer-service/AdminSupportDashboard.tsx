
import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Clock, User, AlertCircle, Send, Phone, Video, MoreVertical, MessageSquare } from "lucide-react";

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

const AdminSupportDashboard = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'open' | 'in_progress' | 'resolved'>('all');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTickets();
  }, [filter]);

  // Real-time subscription for new tickets and messages
  useEffect(() => {
    const ticketsChannel = supabase
      .channel('admin_tickets')
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
  }, []);

  // Real-time subscription for messages in selected ticket
  useEffect(() => {
    if (!selectedTicket) return;

    const messagesChannel = supabase
      .channel(`admin_messages_${selectedTicket.id}`)
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
      console.log('Fetching tickets with filter:', filter);
      let query = supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching tickets:', error);
        toast.error('Failed to fetch support tickets');
        return;
      }
      
      if (data && Array.isArray(data)) {
        // Fetch user profiles for each ticket
        const ticketsWithProfiles = await Promise.all(
          data.map(async (ticket) => {
            try {
              // Try to get profile information, but don't fail if we can't
              const { data: profile } = await supabase
                .from('profiles')
                .select('full_name, email')
                .eq('id', ticket.user_id)
                .single();
              
              return {
                ...ticket,
                status: ticket.status as 'open' | 'in_progress' | 'resolved' | 'closed',
                priority: ticket.priority as 'low' | 'medium' | 'high' | 'urgent',
                user_profile: profile || { 
                  full_name: `User ${ticket.user_id?.slice(-8) || 'Unknown'}`, 
                  email: 'No email available' 
                }
              };
            } catch (profileError) {
              console.log('Could not fetch profile for user:', ticket.user_id, profileError);
              return {
                ...ticket,
                status: ticket.status as 'open' | 'in_progress' | 'resolved' | 'closed',
                priority: ticket.priority as 'low' | 'medium' | 'high' | 'urgent',
                user_profile: { 
                  full_name: `User ${ticket.user_id?.slice(-8) || 'Unknown'}`, 
                  email: 'No email available' 
                }
              };
            }
          })
        );
        
        setTickets(ticketsWithProfiles);
        console.log('Fetched tickets:', ticketsWithProfiles.length);
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

      if (error) {
        console.error('Error fetching messages:', error);
        toast.error('Failed to fetch messages');
        return;
      }
      
      const typedMessages = (data || []).map(msg => ({
        ...msg,
        sender_type: msg.sender_type as 'user' | 'admin'
      }));
      
      setMessages(typedMessages);
      console.log('Fetched messages for ticket:', ticketId, typedMessages.length);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to fetch messages');
    }
  };

  const handleTicketSelect = (ticket: SupportTicket) => {
    console.log('Selecting ticket:', ticket.id);
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

      if (error) {
        console.error('Error updating ticket status:', error);
        toast.error('Failed to update ticket status');
        return;
      }

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

      if (messageError) {
        console.error('Error sending message:', messageError);
        toast.error('Failed to send message');
        return;
      }

      if (selectedTicket.status === 'open') {
        await updateTicketStatus(selectedTicket.id, 'in_progress');
      }

      toast.success('Message sent successfully');
      setNewMessage('');
      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <MessageSquare className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Customer Support Chat</h1>
            <p className="text-muted-foreground">Manage customer inquiries and provide real-time support</p>
          </div>
        </div>
      </div>

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
              <CardTitle className="text-lg">Support Tickets ({tickets.length})</CardTitle>
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

        {/* Main Content - Chat Interface */}
        <div className="lg:col-span-2">
          {selectedTicket ? (
            <Card className="h-[700px] flex flex-col">
              {/* Chat Header */}
              <CardHeader className="border-b bg-muted/30 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{selectedTicket.user_profile?.full_name}</CardTitle>
                      <div className="text-sm text-muted-foreground">
                        {selectedTicket.user_profile?.email} • Online
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Video className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={getPriorityColor(selectedTicket.priority)} variant="outline">
                    {selectedTicket.priority}
                  </Badge>
                  <Badge className={getStatusColor(selectedTicket.status)} variant="outline">
                    {selectedTicket.status.replace('_', ' ')}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Ticket #{selectedTicket.id.slice(-8)} • {new Date(selectedTicket.created_at).toLocaleDateString()}
                  </span>
                </div>
              </CardHeader>

              {/* Chat Messages */}
              <CardContent className="flex-1 overflow-hidden p-0">
                <div className="h-full flex flex-col">
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
                    {/* Initial ticket message */}
                    <div className="flex justify-start">
                      <div className="max-w-[80%] bg-white border rounded-lg p-3 shadow-sm">
                        <div className="text-sm font-medium text-primary mb-1">Initial Message:</div>
                        <div className="text-sm">{selectedTicket.message}</div>
                        <div className="text-xs text-muted-foreground mt-2">
                          {new Date(selectedTicket.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {/* Chat Messages */}
                    {messages.length === 0 ? (
                      <div className="text-center text-muted-foreground py-8">
                        <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No messages yet. Start the conversation!</p>
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg p-3 shadow-sm ${
                              message.sender_type === 'admin'
                                ? 'bg-blue-500 text-white'
                                : 'bg-white border'
                            }`}
                          >
                            <div className="text-sm break-words">{message.message}</div>
                            <div className={`text-xs mt-1 flex items-center gap-1 ${
                              message.sender_type === 'admin' ? 'text-blue-100' : 'text-gray-500'
                            }`}>
                              <span>
                                {new Date(message.created_at).toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </span>
                              {message.sender_type === 'admin' && (
                                <span className="text-xs">✓✓</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input - Enhanced */}
                  <div className="border-t bg-white p-4">
                    <div className="flex gap-2 items-end">
                      <div className="flex-1">
                        <Textarea
                          placeholder="Type your response to the customer..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          className="min-h-[60px] max-h-[120px] resize-none border-0 shadow-sm focus:ring-2 focus:ring-blue-500"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              sendMessage();
                            }
                          }}
                        />
                      </div>
                      <Button 
                        onClick={sendMessage}
                        disabled={isLoading || !newMessage.trim()}
                        size="icon"
                        className="h-12 w-12 rounded-full bg-blue-500 hover:bg-blue-600"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      Press Enter to send, Shift+Enter for new line
                    </div>
                  </div>
                </div>
              </CardContent>

              {/* Status Actions */}
              <div className="border-t p-4 bg-muted/20">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium">Update Status:</span>
                    <div className="flex gap-2 mt-2">
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
                </div>
              </div>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <MessageSquare className="h-16 w-16 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Customer Support Chat</h3>
                <p className="text-muted-foreground mb-4">
                  Select a support ticket from the sidebar to start chatting with customers and provide assistance.
                </p>
                <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
                  <strong>How it works:</strong><br />
                  • Customers submit tickets through the support widget<br />
                  • You can view all tickets and their priority levels<br />
                  • Click on any ticket to open the chat interface<br />
                  • Send real-time responses and update ticket status
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSupportDashboard;
