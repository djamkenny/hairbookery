import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useRealtimeChat } from "@/hooks/useRealtimeChat";
import { 
  Send, 
  MessageSquare, 
  User, 
  Search, 
  Wifi, 
  WifiOff, 
  Clock,
  CheckCheck,
  AlertCircle,
  MoreHorizontal,
  Archive
} from "lucide-react";

interface UserProfile {
  id: string;
  full_name: string | null;
  email: string | null;
}

interface Conversation {
  user: UserProfile;
  lastMessage?: any;
  unreadCount: number;
  isOnline?: boolean;
  lastSeen?: string;
}

const EnhancedAdminChatInterface = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const {
    messages,
    isConnected,
    isTyping: userIsTyping,
    unreadCount,
    sendMessage,
    setTyping,
    markAsRead,
    retryFailedMessage
  } = useRealtimeChat(selectedUserId, true);

  // Fetch conversations on mount
  useEffect(() => {
    fetchConversations();
    setupRealtimeSubscription();
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      setIsLoading(true);
      
      // Fetch all messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('direct_messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000);

      if (messagesError) {
        console.error('Error fetching messages:', messagesError);
        toast.error('Failed to fetch conversations');
        return;
      }

      // Get unique user IDs
      const userIds = [...new Set(messagesData?.map(m => m.user_id) || [])];
      
      // Fetch user profiles separately
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

      // Create profile lookup map
      const profileMap = new Map(profiles.map(p => [p.id, p]));

      // Group by user and get latest message for each
      const conversationsMap = new Map<string, Conversation>();
      
      messagesData?.forEach(msg => {
        const userId = msg.user_id;
        const profile = profileMap.get(userId) || {
          id: userId,
          full_name: 'Unknown User',
          email: null
        };
        
        if (!conversationsMap.has(userId)) {
          conversationsMap.set(userId, {
            user: {
              id: profile.id,
              full_name: profile.full_name,
              email: profile.email
            },
            lastMessage: msg,
            unreadCount: msg.sender_type === 'user' ? 1 : 0,
            isOnline: false,
            lastSeen: msg.created_at
          });
        } else {
          const existing = conversationsMap.get(userId)!;
          if (new Date(msg.created_at) > new Date(existing.lastMessage?.created_at || '1970-01-01')) {
            existing.lastMessage = msg;
            existing.lastSeen = msg.created_at;
          }
          if (msg.sender_type === 'user') {
            existing.unreadCount++;
          }
        }
      });

      const sortedConversations = Array.from(conversationsMap.values()).sort((a, b) => 
        new Date(b.lastMessage?.created_at || '1970-01-01').getTime() - 
        new Date(a.lastMessage?.created_at || '1970-01-01').getTime()
      );

      setConversations(sortedConversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setIsLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('admin_conversations_realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'direct_messages'
        },
        (payload) => {
          // Refresh conversations when new messages arrive
          fetchConversations();
          
          if (payload.new.sender_type === 'user') {
            toast.success(`New message from user`);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  // Handle message input with typing indicators
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    
    if (!isTyping && e.target.value.trim()) {
      setIsTyping(true);
      setTyping(true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      setTyping(false);
    }, 1000);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUserId) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setIsTyping(false);
    setTyping(false);

    const success = await sendMessage(messageText);
    if (success) {
      toast.success('Message sent');
      // Refresh conversations to update last message
      fetchConversations();
    }
  };

  const selectConversation = (userId: string) => {
    setSelectedUserId(userId);
    markAsRead();
    
    // Update unread count in conversations
    setConversations(prev => 
      prev.map(conv => 
        conv.user.id === userId 
          ? { ...conv, unreadCount: 0 }
          : conv
      )
    );
  };

  const archiveConversation = async (userId: string) => {
    try {
      // In a real app, you might want to add an archived field
      // For now, we'll just delete the messages
      const { error } = await supabase
        .from('direct_messages')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;

      setConversations(prev => prev.filter(conv => conv.user.id !== userId));
      if (selectedUserId === userId) {
        setSelectedUserId(null);
      }
      
      toast.success('Conversation archived');
    } catch (error) {
      console.error('Error archiving conversation:', error);
      toast.error('Failed to archive conversation');
    }
  };

  // Filter conversations based on search
  const filteredConversations = conversations.filter(conv => 
    conv.user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage?.message?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedConv = conversations.find(conv => conv.user.id === selectedUserId);

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

  return (
    <div className="flex h-screen bg-background">
      {/* Enhanced Conversations Sidebar */}
      <div className="w-80 border-r border-border bg-card flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3 mb-4">
            <MessageSquare className="h-6 w-6 text-primary" />
            <div className="flex-1">
              <h1 className="text-lg font-semibold">Live Chat</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {isConnected ? <Wifi className="h-3 w-3 text-green-500" /> : <WifiOff className="h-3 w-3 text-red-500" />}
                <span>{filteredConversations.length} conversations</span>
              </div>
            </div>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        
        <ScrollArea className="flex-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="text-center text-muted-foreground py-8 px-4">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>{searchQuery ? 'No conversations found' : 'No conversations yet'}</p>
            </div>
          ) : (
            <div className="space-y-0">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.user.id}
                  onClick={() => selectConversation(conversation.user.id)}
                  className={`relative flex items-center gap-3 p-3 cursor-pointer transition-colors hover:bg-muted/80 group ${
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
                    
                    {/* Online indicator */}
                    {conversation.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                    )}
                    
                    {/* Unread indicator */}
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
                      <div className="flex items-center gap-1">
                        {conversation.lastMessage && (
                          <span className="text-xs text-muted-foreground">
                            {new Date(conversation.lastMessage.created_at).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            archiveConversation(conversation.user.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                        >
                          <Archive className="h-3 w-3" />
                        </Button>
                      </div>
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

      {/* Enhanced Chat Interface */}
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
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{selectedConv.user.email}</span>
                    {selectedConv.isOnline ? (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        Online
                      </Badge>
                    ) : (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>Last seen {selectedConv.lastSeen ? new Date(selectedConv.lastSeen).toLocaleString() : 'Unknown'}</span>
                      </div>
                    )}
                  </div>
                </div>
                <Badge variant="outline">
                  {messages.length} messages
                </Badge>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl p-3 ${
                          message.sender_type === 'admin'
                            ? 'bg-primary text-primary-foreground rounded-br-md'
                            : 'bg-muted rounded-bl-md'
                        } ${message.status === 'failed' ? 'border border-red-300' : ''}`}
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
                          {message.sender_type === 'admin' && getMessageStatusIcon(message.status)}
                          {message.status === 'failed' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => retryFailedMessage(message.id)}
                              className="h-4 w-4 p-0 ml-1"
                            >
                              <AlertCircle className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Typing indicator */}
                  {userIsTyping && (
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-2xl rounded-bl-md p-3">
                        <div className="flex items-center gap-1">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                          <span className="text-xs text-muted-foreground ml-2">User is typing...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-border bg-card">
              <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
                {isConnected ? <Wifi className="h-3 w-3 text-green-500" /> : <WifiOff className="h-3 w-3 text-red-500" />}
                <span>{isConnected ? 'Connected' : 'Connection lost'}</span>
                {isTyping && <span className="text-primary">• Typing...</span>}
              </div>
              
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <Textarea
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={handleInputChange}
                    className="min-h-[48px] max-h-[120px] resize-none rounded-2xl px-4 py-3"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    disabled={!isConnected}
                  />
                </div>
                <Button 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || !isConnected}
                  size="icon"
                  className="h-12 w-12 rounded-full"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              
              {!isConnected && (
                <div className="text-xs text-red-500 text-center mt-2">
                  Connection lost. Please check your internet connection.
                </div>
              )}
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

export default EnhancedAdminChatInterface;