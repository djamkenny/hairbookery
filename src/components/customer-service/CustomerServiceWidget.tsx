import React, { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Minimize2, Maximize2, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";

interface ChatMessage {
  id: string;
  message: string;
  sender_type: 'user' | 'admin';
  created_at: string;
  user_id: string;
}

const CustomerServiceWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load existing messages when widget opens
  useEffect(() => {
    if (isOpen && user) {
      loadMessages();
    }
  }, [isOpen, user]);

  // Set up real-time subscription for new messages
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`user_chat_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'direct_messages',
          filter: `user_id=eq.${user.id}`
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
  }, [user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    if (!user) return;

    try {
      const { data: directMessages, error } = await supabase
        .from('direct_messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const typedMessages = (directMessages || []).map(msg => ({
        ...msg,
        sender_type: msg.sender_type as 'user' | 'admin'
      }));

      setMessages(typedMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load chat history');
    }
  };

  const sendMessage = async (messageText: string) => {
    if (!user) {
      toast.error('Please log in to send messages');
      return false;
    }

    try {
      console.log('Attempting to send message for user:', user.id);
      const { data, error } = await supabase
        .from('direct_messages')
        .insert({
          user_id: user.id,
          sender_id: user.id,
          sender_type: 'user',
          message: messageText
        })
        .select();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Message inserted successfully:', data);
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message: ' + (error as any).message);
      return false;
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !user || isLoading) return;

    setIsLoading(true);
    
    try {
      const success = await sendMessage(message.trim());
      
      if (success) {
        setMessage('');
        scrollToBottom();
        toast.success('Message sent! We\'ll get back to you soon.');
      }
    } catch (error) {
      console.error('Error handling message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = async () => {
    if (!user) return;
    
    try {
      // Delete messages from database
      const { error } = await supabase
        .from('direct_messages')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      // Clear local state
      setMessages([]);
      toast.success('Chat cleared');
    } catch (error) {
      console.error('Error clearing chat:', error);
      toast.error('Failed to clear chat');
    }
  };

  if (!isOpen) {
    return (
      <div className={`fixed z-50 ${isMobile ? 'bottom-4 right-4' : 'bottom-6 right-6'}`}>
        <Button
          onClick={() => setIsOpen(true)}
          className={`rounded-full shadow-lg hover:shadow-xl transition-all duration-200 ${
            isMobile ? 'w-12 h-12' : 'w-14 h-14'
          }`}
          size="icon"
        >
          <MessageCircle className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'}`} />
        </Button>
      </div>
    );
  }

  return (
    <div className={`fixed z-50 ${
      isMobile 
        ? 'inset-4' 
        : 'bottom-6 right-6'
    }`}>
      <Card className={`shadow-xl transition-all duration-200 ${
        isMobile 
          ? `w-full ${isMinimized ? 'h-16' : 'h-full'}` 
          : `w-96 ${isMinimized ? 'h-16' : 'h-[500px]'}`
      }`}>
        <CardHeader className={`flex flex-row items-center justify-between border-b bg-primary text-primary-foreground ${
          isMobile ? 'p-3' : 'p-4'
        }`}>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <CardTitle className={`${isMobile ? 'text-base' : 'text-lg'}`}>Live Chat</CardTitle>
          </div>
          <div className="flex items-center gap-1">
            {!isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        {(!isMinimized || isMobile) && (
          <CardContent className={`p-0 flex flex-col ${
            isMobile ? 'h-[calc(100%-3.5rem)]' : 'h-[calc(100%-4rem)]'
          }`}>
            {/* Chat Messages */}
            <div className={`flex-1 overflow-y-auto bg-gray-50 ${isMobile ? 'p-3' : 'p-4'}`}>
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground space-y-3">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=64&h=64&fit=crop&crop=center" 
                      alt="Support"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="text-lg font-medium">👋 Welcome to Live Chat!</div>
                    <div className="text-sm mt-2">
                      How can we help you today? Send us a message and we'll get back to you right away.
                    </div>
                  </div>
                  <div className="text-xs pt-2 border-t border-gray-200 mt-4 space-y-1">
                    <div><strong>Other ways to reach us:</strong></div>
                    <div>📧 support@example.com</div>
                    <div>📞 (555) 123-4567</div>
                    <div>🕒 Mon-Fri, 9AM-6PM EST</div>
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
                        className={`max-w-[80%] rounded-lg p-3 shadow-sm ${
                          msg.sender_type === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-white border border-gray-200'
                        }`}
                      >
                        <div className="text-sm break-words">{msg.message}</div>
                        <div className={`text-xs mt-1 flex items-center gap-1 ${
                          msg.sender_type === 'user' ? 'text-primary-foreground/70' : 'text-gray-500'
                        }`}>
                          <span>
                            {new Date(msg.created_at).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                          {msg.sender_type === 'user' && (
                            <CheckCheck className="h-3 w-3" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className={`border-t bg-white ${isMobile ? 'p-3' : 'p-4'}`}>
              <div className={`flex items-center gap-2 mb-2 ${isMobile ? 'flex-col items-start gap-1' : ''}`}>
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
                  {messages.length} messages
                </div>
              </div>
              <div className="flex gap-2">
                <Textarea
                  placeholder="Type your message here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className={`resize-none ${isMobile ? 'min-h-[50px]' : 'min-h-[60px]'}`}
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
                  size={isMobile ? "sm" : "icon"}
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