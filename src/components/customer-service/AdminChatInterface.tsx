
import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Send, MessageSquare, User, Clock, Users } from "lucide-react";

interface ChatMessage {
  id: string;
  message: string;
  sender_type: 'user' | 'admin';
  created_at: string;
  sender_id: string;
  ticket_id: string;
}

interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  status: string;
  created_at: string;
  updated_at: string;
  profiles: {
    full_name: string;
    email: string;
  } | null;
}

interface Conversation {
  ticket: SupportTicket;
  messages: ChatMessage[];
  unreadCount: number;
  lastMessage?: ChatMessage;
}

const AdminChatInterface = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [newMessageIds, setNewMessageIds] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
    setupRealTimeSubscription();
  }, []);

  const fetchConversations = async () => {
    try {
      // Fetch tickets separately first
      const { data: tickets, error: ticketsError } = await supabase
        .from('support_tickets')
        .select('*')
        .order('updated_at', { ascending: false });

      if (ticketsError) {
        console.error('Error fetching tickets:', ticketsError);
        toast.error('Failed to fetch conversations');
        return;
      }

      // Fetch user profiles for the ticket user_ids
      const userIds = tickets?.map(t => t.user_id).filter(Boolean) || [];
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        // Continue without profiles
      }

      // Fetch all messages for these tickets
      const { data: messages, error: messagesError } = await supabase
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: true });

      if (messagesError) {
        console.error('Error fetching messages:', messagesError);
        toast.error('Failed to fetch messages');
        return;
      }

      // Create profile lookup map
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      // Type cast and group messages by ticket
      const conversationsMap = new Map<string, Conversation>();
      
      tickets?.forEach(ticket => {
        const userProfile = ticket.user_id ? profileMap.get(ticket.user_id) : null;
        const typedTicket: SupportTicket = {
          ...ticket,
          profiles: userProfile || null
        };
        
        const ticketMessages = (messages || []).filter(msg => msg.ticket_id === ticket.id).map(msg => ({
          ...msg,
          sender_type: msg.sender_type as 'user' | 'admin'
        }));
        const lastMessage = ticketMessages[ticketMessages.length - 1];
        const unreadCount = ticketMessages.filter(msg => 
          msg.sender_type === 'user' && 
          new Date(msg.created_at) > new Date(ticket.updated_at || ticket.created_at)
        ).length;

        conversationsMap.set(ticket.id, {
          ticket: typedTicket,
          messages: ticketMessages,
          unreadCount,
          lastMessage
        });
      });

      setConversations(Array.from(conversationsMap.values()));
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Failed to fetch conversations');
    }
  };

  const setupRealTimeSubscription = () => {
    const channel = supabase
      .channel('admin_chat_realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages'
        },
        (payload) => {
          const newMessage = {
            ...payload.new,
            sender_type: payload.new.sender_type as 'user' | 'admin'
          } as ChatMessage;
          
          setConversations(prev => {
            const updated = prev.map(conv => {
              if (conv.ticket.id === newMessage.ticket_id) {
                return {
                  ...conv,
                  messages: [...conv.messages, newMessage],
                  lastMessage: newMessage,
                  unreadCount: newMessage.sender_type === 'user' ? conv.unreadCount + 1 : conv.unreadCount
                };
              }
              return conv;
            });
            
            // Sort by most recent activity
            return updated.sort((a, b) => 
              new Date(b.lastMessage?.created_at || b.ticket.updated_at).getTime() - 
              new Date(a.lastMessage?.created_at || a.ticket.updated_at).getTime()
            );
          });

          if (newMessage.sender_type === 'user') {
            setNewMessageIds(prev => new Set([...prev, newMessage.id]));
            toast.success('New message received');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || isLoading || !selectedConversation) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          sender_type: 'admin',
          message: newMessage.trim(),
          ticket_id: selectedConversation
        });

      if (error) {
        console.error('Error sending message:', error);
        toast.error('Failed to send message');
        return;
      }

      setNewMessage('');
      toast.success('Message sent');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (ticketId: string) => {
    setConversations(prev => 
      prev.map(conv => 
        conv.ticket.id === ticketId 
          ? { ...conv, unreadCount: 0 }
          : conv
      )
    );
    
    // Clear new message highlights for this conversation
    const conversation = conversations.find(c => c.ticket.id === ticketId);
    if (conversation) {
      const messageIds = conversation.messages.map(m => m.id);
      setNewMessageIds(prev => {
        const updated = new Set(prev);
        messageIds.forEach(id => updated.delete(id));
        return updated;
      });
    }
  };

  const getSelectedConversation = () => {
    return conversations.find(conv => conv.ticket.id === selectedConversation);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (selectedConversation) {
      scrollToBottom();
    }
  }, [selectedConversation, conversations]);

  const selectedConv = getSelectedConversation();

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <MessageSquare className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Live Chat Management</h1>
            <p className="text-muted-foreground">
              Manage customer conversations • {conversations.length} active chats
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[700px]">
        {/* Conversations List */}
        <Card className="lg:col-span-1">
          <CardHeader className="border-b bg-muted/30">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Conversations
              {conversations.filter(c => c.unreadCount > 0).length > 0 && (
                <Badge variant="destructive" className="ml-auto">
                  {conversations.filter(c => c.unreadCount > 0).length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[600px]">
              {conversations.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No conversations yet</p>
                </div>
              ) : (
                conversations.map((conversation) => (
                  <div
                    key={conversation.ticket.id}
                    onClick={() => {
                      setSelectedConversation(conversation.ticket.id);
                      markAsRead(conversation.ticket.id);
                    }}
                    className={`p-4 border-b cursor-pointer transition-colors ${
                      selectedConversation === conversation.ticket.id
                        ? 'bg-primary/10 border-primary/20'
                        : 'hover:bg-muted/50'
                    } ${conversation.unreadCount > 0 ? 'bg-accent/20' : ''}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">
                          {conversation.ticket.profiles?.full_name || 'Anonymous User'}
                        </h4>
                        <p className="text-sm text-muted-foreground truncate">
                          {conversation.ticket.profiles?.email}
                        </p>
                      </div>
                      {conversation.unreadCount > 0 && (
                        <Badge variant="destructive" className="ml-2 animate-pulse">
                          {conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground mb-1">
                      {conversation.ticket.subject}
                    </div>
                    {conversation.lastMessage && (
                      <div className="text-xs text-muted-foreground truncate">
                        {conversation.lastMessage.sender_type === 'admin' ? 'You: ' : ''}
                        {conversation.lastMessage.message}
                      </div>
                    )}
                    <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {new Date(conversation.lastMessage?.created_at || conversation.ticket.updated_at).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Interface */}
        <Card className="lg:col-span-2">
          {selectedConv ? (
            <>
              <CardHeader className="border-b bg-muted/30">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {selectedConv.ticket.profiles?.full_name || 'Anonymous User'}
                  <Badge variant="outline" className="ml-auto">
                    {selectedConv.ticket.status}
                  </Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {selectedConv.ticket.subject}
                </p>
              </CardHeader>

              <CardContent className="flex-1 overflow-hidden p-0">
                <div className="h-[500px] flex flex-col">
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {selectedConv.messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg p-3 shadow-sm ${
                              message.sender_type === 'admin'
                                ? 'bg-primary text-primary-foreground'
                                : newMessageIds.has(message.id)
                                ? 'bg-accent border-2 border-accent-foreground/20 animate-pulse'
                                : 'bg-muted border'
                            }`}
                          >
                            <div className="text-sm break-words">{message.message}</div>
                            <div className={`text-xs mt-1 flex items-center gap-1 ${
                              message.sender_type === 'admin' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                            }`}>
                              <User className="h-3 w-3" />
                              <span>
                                {message.sender_type === 'admin' ? 'You' : 'Customer'}
                              </span>
                              <span className="ml-2">
                                {new Date(message.created_at).toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </span>
                              {message.sender_type === 'admin' && (
                                <span className="text-xs">✓</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  <div className="border-t bg-background p-4">
                    <div className="flex gap-2 items-end">
                      <div className="flex-1">
                        <Textarea
                          placeholder="Type your response..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          className="min-h-[60px] max-h-[120px] resize-none"
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
                        className="h-12 w-12"
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
            </>
          ) : (
            <CardContent className="flex-1 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
                <p>Choose a chat from the left to start responding to customers</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AdminChatInterface;
