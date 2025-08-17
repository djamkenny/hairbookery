import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logger } from "./logger";

/**
 * Common Supabase operations with error handling
 */

export const supabaseHelpers = {
  /**
   * Generic fetch with error handling for known tables
   */
  async fetchMessages(userId?: string) {
    try {
      let query = supabase.from('direct_messages').select('*');
      
      if (userId) {
        query = query.eq('user_id', userId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: true });
      
      if (error) throw error;
      
      logger.debug('Fetched messages', data);
      return data;
    } catch (error) {
      logger.error('Error fetching messages', error);
      toast.error('Failed to load messages');
      return null;
    }
  },

  /**
   * Generic fetch for profiles
   */
  async fetchProfiles(userIds?: string[]) {
    try {
      let query = supabase.from('profiles').select('id, full_name, email');
      
      if (userIds && userIds.length > 0) {
        query = query.in('id', userIds);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      logger.debug('Fetched profiles', data);
      return data;
    } catch (error) {
      logger.error('Error fetching profiles', error);
      toast.error('Failed to load profiles');
      return null;
    }
  },

  /**
   * Insert message with error handling
   */
  async insertMessage(messageData: {
    user_id: string;
    sender_id: string;
    sender_type: 'user' | 'admin';
    message: string;
  }) {
    try {
      const { data, error } = await supabase
        .from('direct_messages')
        .insert(messageData)
        .select()
        .single();
      
      if (error) throw error;
      
      logger.debug('Inserted message', data);
      return data;
    } catch (error) {
      logger.error('Error inserting message', error);
      toast.error('Failed to send message');
      return null;
    }
  },

  /**
   * Generic delete with error handling
   */
  async deleteMessages(userId: string) {
    try {
      const { error } = await supabase
        .from('direct_messages')
        .delete()
        .eq('user_id', userId);
      
      if (error) throw error;
      
      logger.debug('Deleted messages for user', userId);
      return true;
    } catch (error) {
      logger.error('Error deleting messages', error);
      toast.error('Failed to delete messages');
      return false;
    }
  }
};