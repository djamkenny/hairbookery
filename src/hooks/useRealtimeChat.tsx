import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from './useAuth';

export interface ChatMessage {
  id: string;
  message: string;
  sender_type: 'user' | 'admin';
  created_at: string;
  sender_id: string;
  user_id: string;
  status?: 'sending' | 'sent' | 'delivered' | 'failed';
}

export interface ChatState {
  messages: ChatMessage[];
  isConnected: boolean;
  isTyping: boolean;
  lastSeen: string | null;
  unreadCount: number;
}

export const useRealtimeChat = (userId?: string, isAdmin = false) => {
  const { user } = useAuth();
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isConnected: false,
    isTyping: false,
    lastSeen: null,
    unreadCount: 0
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const channelRef = useRef<any>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttempts = useRef(0);
  const messageQueue = useRef<any[]>([]);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Connection status monitoring
  const setupConnectionMonitoring = useCallback(() => {
    const checkConnection = () => {
      if (channelRef.current?.state === 'joined') {
        setChatState(prev => ({ ...prev, isConnected: true }));
        reconnectAttempts.current = 0;
      } else {
        setChatState(prev => ({ ...prev, isConnected: false }));
        if (reconnectAttempts.current < 5) {
          const delay = Math.pow(2, reconnectAttempts.current) * 1000; // Exponential backoff
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            setupRealtimeSubscription();
          }, delay);
        }
      }
    };

    const interval = setInterval(checkConnection, 5000);
    return () => clearInterval(interval);
  }, []);

  // Enhanced real-time subscription with error handling
  const setupRealtimeSubscription = useCallback(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const targetUserId = isAdmin ? userId : user?.id;
    if (!targetUserId) return;

    const channelName = `enhanced_chat_${targetUserId}_${Date.now()}`;
    
    channelRef.current = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'direct_messages',
          filter: isAdmin ? `user_id=eq.${userId}` : `user_id=eq.${user?.id}`
        },
        (payload) => {
          const newMessage = {
            ...payload.new,
            sender_type: payload.new.sender_type as 'user' | 'admin',
            status: 'delivered'
          } as ChatMessage;

          setChatState(prev => ({
            ...prev,
            messages: [...prev.messages, newMessage],
            unreadCount: newMessage.sender_type !== (isAdmin ? 'admin' : 'user') 
              ? prev.unreadCount + 1 
              : prev.unreadCount
          }));

          // Show notification for incoming messages
          if ((isAdmin && newMessage.sender_type === 'user') || 
              (!isAdmin && newMessage.sender_type === 'admin')) {
            toast.success('New message received');
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'direct_messages',
          filter: isAdmin ? `user_id=eq.${userId}` : `user_id=eq.${user?.id}`
        },
        (payload) => {
          setChatState(prev => ({
            ...prev,
            messages: prev.messages.map(msg => 
              msg.id === payload.new.id 
                ? { ...msg, ...payload.new, sender_type: payload.new.sender_type as 'user' | 'admin' }
                : msg
            )
          }));
        }
      )
      .on('presence', { event: 'sync' }, () => {
        const state = channelRef.current?.presenceState();
        const otherUsers = Object.keys(state || {}).filter(key => key !== user?.id);
        setChatState(prev => ({ 
          ...prev, 
          isTyping: otherUsers.some(userId => state[userId]?.[0]?.typing)
        }));
      })
      .subscribe((status) => {
        console.log('Subscription status:', status);
        if (status === 'SUBSCRIBED') {
          setChatState(prev => ({ ...prev, isConnected: true }));
          processMessageQueue();
          reconnectAttempts.current = 0;
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setChatState(prev => ({ ...prev, isConnected: false }));
          console.log('Channel subscription issue - will retry:', status);
          // Don't spam reconnections, wait a moment
          if (reconnectAttempts.current < 3) {
            setTimeout(() => {
              reconnectAttempts.current++;
              setupRealtimeSubscription();
            }, 2000);
          }
        }
      });

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [userId, user?.id, isAdmin]);

  // Message queue processing for offline messages
  const processMessageQueue = useCallback(async () => {
    if (messageQueue.current.length === 0) return;

    const messages = [...messageQueue.current];
    messageQueue.current = [];

    for (const message of messages) {
      try {
        await sendMessageDirect(message.text, message.tempId);
      } catch (error) {
        messageQueue.current.push(message);
      }
    }
  }, []);

  // Load chat history with caching
  const loadMessages = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const targetUserId = isAdmin ? userId : user.id;
      const { data: messages, error } = await supabase
        .from('direct_messages')
        .select('*')
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: true })
        .limit(50); // Limit for performance

      if (error) throw error;

      const typedMessages = (messages || []).map(msg => ({
        ...msg,
        sender_type: msg.sender_type as 'user' | 'admin',
        status: 'delivered' as const
      }));

      setChatState(prev => ({
        ...prev,
        messages: typedMessages,
        unreadCount: typedMessages.filter(msg => 
          msg.sender_type !== (isAdmin ? 'admin' : 'user')
        ).length
      }));
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load chat history');
    } finally {
      setIsLoading(false);
    }
  }, [user, userId, isAdmin]);

  // Enhanced message sending with retry logic
  const sendMessageDirect = useCallback(async (messageText: string, tempId?: string) => {
    if (!user) {
      toast.error('Please log in to send messages');
      return false;
    }

    const targetUserId = isAdmin ? userId : user.id;
    if (!targetUserId) return false;

    try {
      const { data, error } = await supabase
        .from('direct_messages')
        .insert({
          user_id: targetUserId,
          sender_id: user.id,
          sender_type: isAdmin ? 'admin' : 'user',
          message: messageText
        })
        .select();

      if (error) throw error;

      // Update message status if using temp ID
      if (tempId) {
        setChatState(prev => ({
          ...prev,
          messages: prev.messages.map(msg => 
            msg.id === tempId 
              ? { ...msg, id: data[0].id, status: 'sent' as const }
              : msg
          )
        }));
      }

      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Update failed message status
      if (tempId) {
        setChatState(prev => ({
          ...prev,
          messages: prev.messages.map(msg => 
            msg.id === tempId 
              ? { ...msg, status: 'failed' as const }
              : msg
          )
        }));
      }
      
      throw error;
    }
  }, [user, userId, isAdmin]);

  // Send message with optimistic updates
  const sendMessage = useCallback(async (messageText: string) => {
    if (!messageText.trim()) return false;

    const tempId = `temp_${Date.now()}_${Math.random()}`;
    const optimisticMessage: ChatMessage = {
      id: tempId,
      message: messageText.trim(),
      sender_type: isAdmin ? 'admin' : 'user',
      created_at: new Date().toISOString(),
      sender_id: user?.id || '',
      user_id: isAdmin ? userId || '' : user?.id || '',
      status: 'sending'
    };

    // Add optimistic message
    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, optimisticMessage]
    }));

    try {
      if (chatState.isConnected) {
        await sendMessageDirect(messageText, tempId);
      } else {
        // Queue message for later
        messageQueue.current.push({ text: messageText, tempId });
        toast.info('Message queued - will send when connected');
      }
      return true;
    } catch (error) {
      toast.error('Failed to send message');
      return false;
    }
  }, [chatState.isConnected, sendMessageDirect, isAdmin, userId, user?.id]);

  // Typing indicator
  const setTyping = useCallback((typing: boolean) => {
    if (channelRef.current && user) {
      channelRef.current.track({
        user_id: user.id,
        typing,
        timestamp: new Date().toISOString()
      });

      if (typing) {
        // Clear typing after 3 seconds of inactivity
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        typingTimeoutRef.current = setTimeout(() => {
          setTyping(false);
        }, 3000);
      }
    }
  }, [user]);

  // Mark messages as read
  const markAsRead = useCallback(() => {
    setChatState(prev => ({ ...prev, unreadCount: 0 }));
  }, []);

  // Retry failed messages
  const retryFailedMessage = useCallback(async (messageId: string) => {
    const message = chatState.messages.find(msg => msg.id === messageId);
    if (!message || message.status !== 'failed') return;

    setChatState(prev => ({
      ...prev,
      messages: prev.messages.map(msg => 
        msg.id === messageId 
          ? { ...msg, status: 'sending' as const }
          : msg
      )
    }));

    try {
      await sendMessageDirect(message.message, messageId);
    } catch (error) {
      setChatState(prev => ({
        ...prev,
        messages: prev.messages.map(msg => 
          msg.id === messageId 
            ? { ...msg, status: 'failed' as const }
            : msg
        )
      }));
    }
  }, [chatState.messages, sendMessageDirect]);

  // Setup effects
  useEffect(() => {
    if ((isAdmin && userId) || (!isAdmin && user)) {
      loadMessages();
      setupRealtimeSubscription();
      const cleanupMonitoring = setupConnectionMonitoring();

      return () => {
        cleanupMonitoring();
        if (channelRef.current) {
          supabase.removeChannel(channelRef.current);
        }
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
      };
    }
  }, [isAdmin, userId, user, loadMessages, setupRealtimeSubscription, setupConnectionMonitoring]);

  return {
    ...chatState,
    isLoading,
    sendMessage,
    setTyping,
    markAsRead,
    retryFailedMessage,
    refreshMessages: loadMessages
  };
};