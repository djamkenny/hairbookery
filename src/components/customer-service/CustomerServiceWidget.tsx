
import React, { useState, useEffect } from "react";
import { MessageCircle, X, Send, Minimize2, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface ChatMessage {
  id: string;
  message: string;
  sender_type: 'user' | 'admin';
  created_at: string;
}

interface SupportTicket {
  id: string;
  subject: string;
  status: string;
  created_at: string;
}

const CustomerServiceWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentTicket, setCurrentTicket] = useState<SupportTicket | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // Load existing ticket and messages when widget opens
  useEffect(() => {
    if (isOpen && user) {
      loadExistingTicket();
    }
  }, [isOpen, user]);

  // Set up real-time subscription for new messages
  useEffect(() => {
    if (!currentTicket) return;

    const channel = supabase
      .channel(`ticket_${currentTicket.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `ticket_id=eq.${currentTicket.id}`
        },
        (payload) => {
          const newMessage = payload.new as ChatMessage;
          setMessages(prev => [...prev, newMessage]);
          
          // Show toast for admin messages
          if (newMessage.sender_type === 'admin') {
            toast.success('New message from support');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentTicket]);

  const loadExistingTicket = async () => {
    if (!user) return;

    try {
      // Get the most recent open ticket
      const { data: tickets, error: ticketError } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['open', 'in_progress'])
        .order('created_at', { ascending: false })
        .limit(1);

      if (ticketError) throw ticketError;

      if (tickets && tickets.length > 0) {
        const ticket = tickets[0];
        setCurrentTicket(ticket);

        // Load messages for this ticket
        const { data: chatMessages, error: messagesError } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('ticket_id', ticket.id)
          .order('created_at', { ascending: true });

        if (messagesError) throw messagesError;

        setMessages(chatMessages || []);
      }
    } catch (error) {
      console.error('Error loading ticket:', error);
    }
  };

  const createNewTicket = async (initialMessage: string) => {
    if (!user) return null;

    try {
      const { data: ticket, error: ticketError } = await supabase
        .from('support_tickets')
        .insert({
          user_id: user.id,
          subject: 'Customer Inquiry',
          message: initialMessage,
          status: 'open',
          priority: 'medium'
        })
        .select()
        .single();

      if (ticketError) throw ticketError;

      return ticket;
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast.error('Failed to create support ticket');
      return null;
    }
  };

  const sendMessage = async (messageText: string, ticketId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          ticket_id: ticketId,
          sender_id: user.id,
          sender_type: 'user',
          message: messageText
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      return false;
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !user || isLoading) return;

    setIsLoading(true);
    
    try {
      let ticket = currentTicket;

      // Create new ticket if none exists
      if (!ticket) {
        ticket = await createNewTicket(message.trim());
        if (!ticket) {
          setIsLoading(false);
          return;
        }
        setCurrentTicket(ticket);
      }

      // Send the message
      const success = await sendMessage(message.trim(), ticket.id);
      
      if (success) {
        setMessage('');
        toast.success('Message sent! We\'ll get back to you soon.');
      }
    } catch (error) {
      console.error('Error handling message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setCurrentTicket(null);
    toast.success('Chat cleared');
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
            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground space-y-2">
                  <div className="text-sm">👋 Welcome to Customer Support!</div>
                  <div className="text-xs">
                    How can we help you today? Send us a message and we'll get back to you right away.
                  </div>
                  <div className="text-xs pt-2 border-t border-gray-200 mt-4">
                    <strong>Other ways to reach us:</strong><br/>
                    📧 support@example.com<br/>
                    📞 (555) 123-4567<br/>
                    🕒 Mon-Fri, 9AM-6PM EST
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg text-sm ${
                          msg.sender_type === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-green-100 border border-green-200 text-green-800 shadow-sm'
                        }`}
                      >
                        <div>{msg.message}</div>
                        <div className={`text-xs mt-1 opacity-70`}>
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t bg-white">
              {currentTicket && (
                <div className="flex items-center gap-2 mb-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearChat}
                    disabled={messages.length === 0}
                    className="text-xs"
                  >
                    Clear Chat
                  </Button>
                  <div className="text-xs text-muted-foreground">
                    Ticket #{currentTicket.id.slice(-8)} - {currentTicket.status}
                  </div>
                </div>
              )}
              <div className="flex gap-2">
                <Textarea
                  placeholder="Type your message here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-[60px] resize-none"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!message.trim() || !user || isLoading}
                  size="icon"
                  className="self-end"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              {!user && (
                <div className="text-xs text-muted-foreground text-center mt-2">
                  Please log in to send messages
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
