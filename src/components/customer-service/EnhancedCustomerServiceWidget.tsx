import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Minimize2, Maximize2, CheckCheck, Wifi, WifiOff, RotateCcw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useRealtimeChat } from "@/hooks/useRealtimeChat";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";

const EnhancedCustomerServiceWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const {
    messages,
    isConnected,
    isTyping: adminIsTyping,
    unreadCount,
    isLoading,
    sendMessage,
    setTyping,
    markAsRead,
    retryFailedMessage
  } = useRealtimeChat();

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mark as read when widget is opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      markAsRead();
    }
  }, [isOpen, isMinimized, markAsRead]);

  // Handle typing indicators
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    if (!isTyping && e.target.value.trim()) {
      setIsTyping(true);
      setTyping(true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      setTyping(false);
    }, 1000);
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !user || isLoading) return;

    const messageText = message.trim();
    setMessage('');
    setIsTyping(false);
    setTyping(false);

    const success = await sendMessage(messageText);
    if (success) {
      toast.success('Message sent successfully');
    }
  };

  const clearChat = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('direct_messages')
        .delete()
        .eq('user_id', user.id);
      
      if (error) throw error;
      toast.success('Chat cleared');
      window.location.reload(); // Simple refresh to clear state
    } catch (error) {
      console.error('Error clearing chat:', error);
      toast.error('Failed to clear chat');
    }
  };

  const getMessageStatusIcon = (status: string | undefined) => {
    switch (status) {
      case 'sending':
        return <div className="w-3 h-3 animate-spin rounded-full border-2 border-current border-t-transparent" />;
      case 'sent':
        return <CheckCheck className="h-3 w-3" />;
      case 'delivered':
        return <CheckCheck className="h-3 w-3 text-blue-500" />;
      case 'failed':
        return <AlertCircle className="h-3 w-3 text-red-500" />;
      default:
        return <CheckCheck className="h-3 w-3" />;
    }
  };

  if (!isOpen) {
    return (
      <div className={`fixed z-50 ${isMobile ? 'bottom-4 right-4' : 'bottom-6 right-6'}`}>
        <div className="relative">
          <Button
            onClick={() => setIsOpen(true)}
            className={`rounded-full shadow-lg hover:shadow-xl transition-all duration-200 ${
              isMobile ? 'w-12 h-12' : 'w-14 h-14'
            }`}
            size="icon"
          >
            <MessageCircle className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'}`} />
          </Button>
          
          {/* Unread badge */}
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
          
          {/* Connection status indicator */}
          <div className={`absolute -top-1 -left-1 w-4 h-4 rounded-full ${
            isConnected ? 'bg-green-500' : 'bg-red-500'
          } animate-pulse`} />
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed z-50 ${isMobile ? 'inset-4' : 'bottom-6 right-6'}`}>
      <Card className={`shadow-xl transition-all duration-200 ${
        isMobile 
          ? `w-full ${isMinimized ? 'h-16' : 'h-full'}` 
          : `w-96 ${isMinimized ? 'h-16' : 'h-[500px]'}`
      }`}>
        <CardHeader className={`flex flex-row items-center justify-between border-b bg-primary text-primary-foreground ${
          isMobile ? 'p-3' : 'p-4'
        }`}>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full animate-pulse ${
              isConnected ? 'bg-green-400' : 'bg-red-400'
            }`} />
            <CardTitle className={`${isMobile ? 'text-base' : 'text-lg'}`}>
              Live Chat
            </CardTitle>
            {!isConnected && (
              <WifiOff className="h-4 w-4" />
            )}
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
                  <div className="flex items-center justify-center gap-2 text-xs">
                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span>{isConnected ? 'Connected' : 'Connecting...'}</span>
                  </div>
                  <div className="text-xs pt-2 border-t border-gray-200 mt-4 space-y-1">
                    <div><strong>Other ways to reach us:</strong></div>
                    <div>📧 knlbookerysupport@gmail.com</div>
                    <div>📞 (+233) 050-713-4930</div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-lg p-3 shadow-sm ${
                        msg.sender_type === 'user' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-white border border-gray-200'
                      } ${msg.status === 'failed' ? 'border-red-300' : ''}`}>
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
                            <div className="flex items-center gap-1">
                              {getMessageStatusIcon(msg.status)}
                              {msg.status === 'failed' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => retryFailedMessage(msg.id)}
                                  className="h-4 w-4 p-0 text-red-400 hover:text-red-600"
                                >
                                  <RotateCcw className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Typing indicator */}
                  {adminIsTyping && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                        <div className="flex items-center gap-1">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                          <span className="text-xs text-gray-500 ml-2">Support is typing...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className={`border-t bg-white ${isMobile ? 'p-3' : 'p-4'}`}>
              <div className={`flex items-center gap-2 mb-2 ${isMobile ? 'flex-col items-start gap-1' : ''}`}>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearChat}
                    disabled={messages.length === 0}
                    className="text-xs"
                  >
                    Clear Chat
                  </Button>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    {isConnected ? <Wifi className="h-3 w-3 text-green-500" /> : <WifiOff className="h-3 w-3 text-red-500" />}
                    <span>{isConnected ? 'Connected' : 'Offline'}</span>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {messages.length} messages
                </div>
              </div>
              
              <div className="flex gap-2">
                <Textarea
                  placeholder="Type your message here..."
                  value={message}
                  onChange={handleInputChange}
                  className={`resize-none ${isMobile ? 'min-h-[50px]' : 'min-h-[60px]'}`}
                  onKeyPress={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  disabled={!isConnected}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!message.trim() || !user || isLoading || !isConnected}
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
              
              {!isConnected && (
                <div className="text-xs text-red-500 text-center mt-2">
                  Connection lost. Messages will be sent when reconnected.
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default EnhancedCustomerServiceWidget;