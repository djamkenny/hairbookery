
import React, { useState } from "react";
import { MessageCircle, X, Send, Minimize2, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

const CustomerServiceWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Array<{id: string, text: string, sender: 'user' | 'support', timestamp: Date}>>([]);
  const { user } = useAuth();

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    if (!user) {
      toast.error('Please log in to send messages');
      return;
    }

    // Add user message to chat
    const userMessage = {
      id: Date.now().toString(),
      text: message.trim(),
      sender: 'user' as const,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');

    // Auto-response for demo (in real implementation, this would connect to your support system)
    setTimeout(() => {
      const supportResponse = {
        id: (Date.now() + 1).toString(),
        text: "Thank you for contacting us! A customer service representative will be with you shortly. In the meantime, you can also reach us at support@example.com or call us at (555) 123-4567.",
        sender: 'support' as const,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, supportResponse]);
    }, 1000);

    toast.success('Message sent! We\'ll get back to you soon.');
  };

  const clearChat = () => {
    setMessages([]);
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
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg text-sm ${
                          msg.sender === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-white border shadow-sm'
                        }`}
                      >
                        <div>{msg.text}</div>
                        <div className={`text-xs mt-1 opacity-70`}>
                          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t bg-white">
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
              </div>
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
                  disabled={!message.trim() || !user}
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
