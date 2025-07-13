import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Send, MessageSquare, User, Users } from "lucide-react";

interface ChatMessage {
  id: string;
  message: string;
  sender_type: 'user' | 'admin';
  created_at: string;
  sender_id: string;
  user_id: string;
}

interface UserProfile {
  id: string;
  full_name: string | null;
  email: string | null;
}

interface Conversation {
  user: UserProfile;
  messages: ChatMessage[];
  unreadCount: number;
  lastMessage?: ChatMessage;
}

const AdminChatInterface = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
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
      console.log('Fetching conversations...');
      
      // Fetch all messages
      const { data: messages, error: messagesError } = await supabase
        .from('direct_messages')
        .select('*')
        .order('created_at', { ascending: true });

      if (messagesError) {
        console.error('Error fetching messages:', messagesError);
        toast.error('Failed to fetch messages: ' + messagesError.message);
        return;
      }

      console.log('Fetched messages:', messages);

      // Get unique user IDs
      const userIds = [...new Set(messages?.map(m => m.user_id) || [])];
      
      // Fetch user profiles
      let profiles: UserProfile[] = [];
      if (userIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', userIds);

        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
        } else {
          profiles = profilesData || [];
        }
      }

      console.log('Fetched profiles:', profiles);

      // Create profile lookup map
      const profileMap = new Map(profiles.map(p => [p.id, p]));

      // Group messages by user
      const conversationsMap = new Map<string, Conversation>();
      
      userIds.forEach(userId => {
        const userProfile = profileMap.get(userId) || {
          id: userId,
          full_name: 'Unknown User',
          email: null
        };
        
        const userMessages = messages?.filter(msg => msg.user_id === userId).map(msg => ({
          ...msg,
          sender_type: msg.sender_type as 'user' | 'admin'
        })) || [];
        
        const lastMessage = userMessages[userMessages.length - 1];
        const unreadCount = userMessages.filter(msg => 
          msg.sender_type === 'user'
        ).length;

        conversationsMap.set(userId, {
          user: userProfile,
          messages: userMessages,
          unreadCount,
          lastMessage
        });
      });

      // Sort conversations by most recent activity
      const sortedConversations = Array.from(conversationsMap.values()).sort((a, b) => 
        new Date(b.lastMessage?.created_at || '1970-01-01').getTime() - 
        new Date(a.lastMessage?.created_at || '1970-01-01').getTime()
      );

      setConversations(sortedConversations);
      console.log('Loaded conversations:', sortedConversations);
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
          table: 'direct_messages'
        },
        (payload) => {
          const newMessage = {
            ...payload.new,
            sender_type: payload.new.sender_type as 'user' | 'admin'
          } as ChatMessage;
          
          setConversations(prev => {
            const existingConv = prev.find(conv => conv.user.id === newMessage.user_id);
            
            if (existingConv) {
              // Update existing conversation
              const updated = prev.map(conv => {
                if (conv.user.id === newMessage.user_id) {
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
                new Date(b.lastMessage?.created_at || '1970-01-01').getTime() - 
                new Date(a.lastMessage?.created_at || '1970-01-01').getTime()
              );
            } else {
              // New conversation - refresh data to get user profile
              fetchConversations();
              return prev;
            }
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
    if (!newMessage.trim() || isLoading || !selectedUserId) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('direct_messages')
        .insert({
          user_id: selectedUserId,
          sender_type: 'admin',
          message: newMessage.trim()
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

  const markAsRead = async (userId: string) => {
    setConversations(prev => 
      prev.map(conv => 
        conv.user.id === userId 
          ? { ...conv, unreadCount: 0 }
          : conv
      )
    );
    
    // Clear new message highlights for this conversation
    const conversation = conversations.find(c => c.user.id === userId);
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
    return conversations.find(conv => conv.user.id === selectedUserId);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (selectedUserId) {
      scrollToBottom();
    }
  }, [selectedUserId, conversations]);

  const selectedConv = getSelectedConversation();

  return (
    <div className="flex h-screen bg-background">
      {/* Conversations Sidebar */}
      <div className="w-80 border-r border-border bg-card">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-lg font-semibold">Live Chat</h1>
              <p className="text-sm text-muted-foreground">
                {conversations.length} conversations
              </p>
            </div>
          </div>
        </div>
        
        <ScrollArea className="flex-1">
          {conversations.length === 0 ? (
            <div className="text-center text-muted-foreground py-8 px-4">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No conversations yet</p>
            </div>
          ) : (
            <div className="space-y-0">
              {conversations.map((conversation) => (
                <div
                  key={conversation.user.id}
                  onClick={() => {
                    setSelectedUserId(conversation.user.id);
                    markAsRead(conversation.user.id);
                  }}
                  className={`relative flex items-center gap-3 p-3 cursor-pointer transition-colors hover:bg-muted/80 ${
                    selectedUserId === conversation.user.id
                      ? 'bg-muted border-r-2 border-primary'
                      : ''
                  } ${conversation.unreadCount > 0 ? 'bg-accent/10' : ''}`}
                >
                  {/* Profile Avatar */}
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    {conversation.unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-destructive rounded-full flex items-center justify-center">
                        <span className="text-xs text-destructive-foreground font-bold">
                          {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Conversation Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm truncate">
                        {conversation.user.full_name || 'Anonymous User'}
                      </h4>
                      <span className="text-xs text-muted-foreground">
                        {conversation.lastMessage ? 
                          new Date(conversation.lastMessage.created_at).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })
                          : ''
                        }
                      </span>
                    </div>
                    
                    {conversation.lastMessage && (
                      <div className="flex items-start gap-1 mt-1">
                        <p className={`text-sm truncate ${
                          conversation.unreadCount > 0 ? 'font-medium text-foreground' : 'text-muted-foreground'
                        }`}>
                          {conversation.lastMessage.sender_type === 'admin' && (
                            <span className="text-primary">You: </span>
                          )}
                          {conversation.lastMessage.message}
                        </p>
                      </div>
                    )}
                    
                    <div className="text-xs text-muted-foreground mt-1 truncate">
                      {conversation.user.email}
                    </div>
                  </div>
                  
                  {/* New message indicator */}
                  {conversation.unreadCount > 0 && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Chat Interface */}
      <div className="flex-1 flex flex-col bg-background">
        {selectedConv ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-border bg-card">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="font-semibold">
                    {selectedConv.user.full_name || 'Anonymous User'}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {selectedConv.user.email}
                  </p>
                </div>
                <Badge variant="outline">
                  {selectedConv.messages.length} messages
                </Badge>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full p-4">
                <div className="space-y-4">
                  {selectedConv.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl p-3 ${
                          message.sender_type === 'admin'
                            ? 'bg-primary text-primary-foreground rounded-br-md'
                            : newMessageIds.has(message.id)
                            ? 'bg-accent border border-primary animate-pulse rounded-bl-md'
                            : 'bg-muted rounded-bl-md'
                        }`}
                      >
                        <div className="text-sm break-words">{message.message}</div>
                        <div className={`text-xs mt-1 flex items-center gap-1 ${
                          message.sender_type === 'admin' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                        }`}>
                          <span>
                            {new Date(message.created_at).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                          {message.sender_type === 'admin' && (
                            <span className="ml-1">✓</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-border bg-card">
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <Textarea
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="min-h-[48px] max-h-[120px] resize-none rounded-full px-4 py-3"
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
                  className="h-12 w-12 rounded-full"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <h3 className="text-xl font-medium mb-2">Select a conversation</h3>
              <p className="text-muted-foreground">Choose a chat from the sidebar to start responding</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminChatInterface;