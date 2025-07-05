import React, { useState, useEffect } from "react";
import { MessageCircle, X, Send, Minimize2, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface SupportTicket {
  id: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  user_id: string;
}

const CustomerServiceWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'tickets' | 'create'>('chat');
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user && isOpen) {
      fetchUserTickets();
    }
  }, [user, isOpen]);

  const fetchUserTickets = async () => {
    if (!user) return;
    
    try {
      // Simple direct query without complex relationships
      const { data, error } = await supabase
        .from('support_tickets' as any)
        .select('id, subject, message, status, priority, created_at, user_id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching tickets:', error);
        return;
      }
      
      // Type assertion to ensure we have the right structure
      const typedTickets = (data || []) as SupportTicket[];
      setTickets(typedTickets);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    }
  };

  const handleCreateTicket = async () => {
    if (!user) {
      toast.error('Please log in to create a support ticket');
      return;
    }

    if (!subject.trim() || !description.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('support_tickets' as any)
        .insert({
          user_id: user.id,
          subject: subject.trim(),
          message: description.trim(),
          priority,
          status: 'open'
        });

      if (error) throw error;

      toast.success('Support ticket created successfully!');
      setSubject('');
      setDescription('');
      setPriority('medium');
      setActiveTab('tickets');
      fetchUserTickets();
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast.error('Failed to create support ticket');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickMessage = async () => {
    if (!message.trim()) return;

    if (!user) {
      toast.error('Please log in to send messages');
      return;
    }

    // For now, create a quick ticket from the message
    try {
      const { error } = await supabase
        .from('support_tickets' as any)
        .insert({
          user_id: user.id,
          subject: 'Quick Message',
          message: message.trim(),
          priority: 'medium',
          status: 'open'
        });

      if (error) throw error;

      toast.success('Message sent! We\'ll get back to you soon.');
      setMessage('');
      fetchUserTickets();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-purple-100 text-purple-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-200"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className={`w-96 shadow-xl transition-all duration-200 ${isMinimized ? 'h-16' : 'h-[500px]'}`}>
        <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
          <CardTitle className="text-lg">Customer Support</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMinimized(!isMinimized)}
              className="h-8 w-8"
            >
              {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0 h-[calc(100%-4rem)] flex flex-col">
            {/* Tab Navigation */}
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex-1 p-3 text-sm font-medium transition-colors ${
                  activeTab === 'chat' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-muted'
                }`}
              >
                Quick Chat
              </button>
              <button
                onClick={() => setActiveTab('tickets')}
                className={`flex-1 p-3 text-sm font-medium transition-colors ${
                  activeTab === 'tickets' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-muted'
                }`}
              >
                My Tickets
              </button>
              <button
                onClick={() => setActiveTab('create')}
                className={`flex-1 p-3 text-sm font-medium transition-colors ${
                  activeTab === 'create' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-muted'
                }`}
              >
                New Ticket
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 p-4 overflow-y-auto">
              {activeTab === 'chat' && (
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    Need quick help? Send us a message and we'll get back to you as soon as possible.
                  </div>
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Type your message here..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="min-h-[100px]"
                    />
                    <Button 
                      onClick={handleQuickMessage}
                      className="w-full"
                      disabled={!message.trim() || !user}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </Button>
                    {!user && (
                      <div className="text-xs text-muted-foreground text-center">
                        Please log in to send messages
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'tickets' && (
                <div className="space-y-4">
                  {!user ? (
                    <div className="text-center text-muted-foreground">
                      Please log in to view your support tickets
                    </div>
                  ) : tickets.length === 0 ? (
                    <div className="text-center text-muted-foreground">
                      No support tickets found
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {tickets.map((ticket) => (
                        <div key={ticket.id} className="border rounded-lg p-3 space-y-2">
                          <div className="flex items-start justify-between">
                            <h4 className="font-medium text-sm">{ticket.subject}</h4>
                            <div className="flex gap-1">
                              <Badge className={`text-xs ${getPriorityColor(ticket.priority)}`}>
                                {ticket.priority}
                              </Badge>
                              <Badge className={`text-xs ${getStatusColor(ticket.status)}`}>
                                {ticket.status}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {ticket.message}
                          </p>
                          <div className="text-xs text-muted-foreground">
                            {new Date(ticket.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'create' && (
                <div className="space-y-4">
                  {!user ? (
                    <div className="text-center text-muted-foreground">
                      Please log in to create support tickets
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium">Subject</label>
                          <Input
                            placeholder="Brief description of your issue"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Priority</label>
                          <select
                            value={priority}
                            onChange={(e) => setPriority(e.target.value as any)}
                            className="w-full p-2 border rounded-md text-sm"
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Description</label>
                          <Textarea
                            placeholder="Please provide detailed information about your issue"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="min-h-[100px]"
                          />
                        </div>
                        <Button 
                          onClick={handleCreateTicket}
                          className="w-full"
                          disabled={isLoading || !subject.trim() || !description.trim()}
                        >
                          {isLoading ? 'Creating...' : 'Create Ticket'}
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default CustomerServiceWidget;
