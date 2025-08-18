export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          is_active: boolean
          last_login_at: string | null
          password_hash: string
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id?: string
          is_active?: boolean
          last_login_at?: string | null
          password_hash: string
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean
          last_login_at?: string | null
          password_hash?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      appointment_services: {
        Row: {
          appointment_id: string
          created_at: string
          id: string
          service_id: string
          service_type_id: string | null
        }
        Insert: {
          appointment_id: string
          created_at?: string
          id?: string
          service_id: string
          service_type_id?: string | null
        }
        Update: {
          appointment_id?: string
          created_at?: string
          id?: string
          service_id?: string
          service_type_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointment_services_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_services_service_type_id_fkey"
            columns: ["service_type_id"]
            isOneToOne: false
            referencedRelation: "service_types"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          appointment_date: string
          appointment_time: string
          canceled_at: string | null
          client_id: string
          created_at: string | null
          id: string
          notes: string | null
          order_id: string | null
          service_id: string | null
          status: string
          stylist_id: string
        }
        Insert: {
          appointment_date: string
          appointment_time: string
          canceled_at?: string | null
          client_id: string
          created_at?: string | null
          id?: string
          notes?: string | null
          order_id?: string | null
          service_id?: string | null
          status?: string
          stylist_id: string
        }
        Update: {
          appointment_date?: string
          appointment_time?: string
          canceled_at?: string | null
          client_id?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          order_id?: string | null
          service_id?: string | null
          status?: string
          stylist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          sender_id: string | null
          sender_type: string
          ticket_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          sender_id?: string | null
          sender_type: string
          ticket_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          sender_id?: string | null
          sender_type?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      direct_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          sender_id: string | null
          sender_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          sender_id?: string | null
          sender_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          sender_id?: string | null
          sender_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string | null
          id: string
          stylist_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          stylist_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          stylist_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_stylist_id_fkey"
            columns: ["stylist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_points: {
        Row: {
          appointment_id: string | null
          created_at: string | null
          earned_from: string | null
          id: string
          points: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          appointment_id?: string | null
          created_at?: string | null
          earned_from?: string | null
          id?: string
          points?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          appointment_id?: string | null
          created_at?: string | null
          earned_from?: string | null
          id?: string
          points?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_points_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string
          expires_at: string | null
          id: string
          is_read: boolean
          message: string
          metadata: Json | null
          priority: string | null
          related_id: string | null
          title: string | null
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          is_read?: boolean
          message: string
          metadata?: Json | null
          priority?: string | null
          related_id?: string | null
          title?: string | null
          type: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          is_read?: boolean
          message?: string
          metadata?: Json | null
          priority?: string | null
          related_id?: string | null
          title?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          appointment_id: string | null
          created_at: string
          currency: string | null
          description: string | null
          id: string
          metadata: Json | null
          paystack_access_code: string | null
          paystack_reference: string | null
          paystack_transaction_id: string | null
          service_id: string | null
          status: string
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount: number
          appointment_id?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          paystack_access_code?: string | null
          paystack_reference?: string | null
          paystack_transaction_id?: string | null
          service_id?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          appointment_id?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          paystack_access_code?: string | null
          paystack_reference?: string | null
          paystack_transaction_id?: string | null
          service_id?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          availability: boolean | null
          availability_status: string | null
          avatar_url: string | null
          bio: string | null
          card_image_url: string | null
          created_at: string
          daily_appointment_limit: number | null
          email: string | null
          experience: string | null
          full_name: string | null
          id: string
          is_stylist: boolean | null
          location: string | null
          phone: string | null
          specialty: string | null
          updated_at: string
        }
        Insert: {
          availability?: boolean | null
          availability_status?: string | null
          avatar_url?: string | null
          bio?: string | null
          card_image_url?: string | null
          created_at?: string
          daily_appointment_limit?: number | null
          email?: string | null
          experience?: string | null
          full_name?: string | null
          id: string
          is_stylist?: boolean | null
          location?: string | null
          phone?: string | null
          specialty?: string | null
          updated_at?: string
        }
        Update: {
          availability?: boolean | null
          availability_status?: string | null
          avatar_url?: string | null
          bio?: string | null
          card_image_url?: string | null
          created_at?: string
          daily_appointment_limit?: number | null
          email?: string | null
          experience?: string | null
          full_name?: string | null
          id?: string
          is_stylist?: boolean | null
          location?: string | null
          phone?: string | null
          specialty?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      revenue_tracking: {
        Row: {
          appointment_id: string | null
          booking_fee: number
          created_at: string
          id: string
          revenue_date: string
          service_amount: number
          stylist_id: string | null
          total_revenue: number
          updated_at: string
        }
        Insert: {
          appointment_id?: string | null
          booking_fee?: number
          created_at?: string
          id?: string
          revenue_date?: string
          service_amount?: number
          stylist_id?: string | null
          total_revenue?: number
          updated_at?: string
        }
        Update: {
          appointment_id?: string | null
          booking_fee?: number
          created_at?: string
          id?: string
          revenue_date?: string
          service_amount?: number
          stylist_id?: string | null
          total_revenue?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "revenue_tracking_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          comment: string
          created_at: string | null
          id: string
          rating: number
          stylist_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          comment: string
          created_at?: string | null
          id?: string
          rating: number
          stylist_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          comment?: string
          created_at?: string | null
          id?: string
          rating?: number
          stylist_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_stylist_id_fkey"
            columns: ["stylist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      service_categories: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      service_types: {
        Row: {
          created_at: string
          description: string | null
          duration: number
          id: string
          name: string
          price: number
          service_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration: number
          id?: string
          name: string
          price: number
          service_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration?: number
          id?: string
          name?: string
          price?: number
          service_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_service_types_service_id"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          duration: number
          id: string
          image_urls: string[] | null
          is_base_service: boolean | null
          name: string
          price: number
          stylist_id: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          duration: number
          id?: string
          image_urls?: string[] | null
          is_base_service?: boolean | null
          name: string
          price: number
          stylist_id?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          duration?: number
          id?: string
          image_urls?: string[] | null
          is_base_service?: boolean | null
          name?: string
          price?: number
          stylist_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      specialist_earnings: {
        Row: {
          appointment_id: string | null
          created_at: string
          gross_amount: number
          id: string
          net_amount: number
          payment_id: string | null
          platform_fee: number
          platform_fee_percentage: number
          status: string
          stylist_id: string | null
          updated_at: string
        }
        Insert: {
          appointment_id?: string | null
          created_at?: string
          gross_amount: number
          id?: string
          net_amount: number
          payment_id?: string | null
          platform_fee: number
          platform_fee_percentage?: number
          status?: string
          stylist_id?: string | null
          updated_at?: string
        }
        Update: {
          appointment_id?: string | null
          created_at?: string
          gross_amount?: number
          id?: string
          net_amount?: number
          payment_id?: string | null
          platform_fee?: number
          platform_fee_percentage?: number
          status?: string
          stylist_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "specialist_earnings_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "specialist_earnings_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      specialist_ratings: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          rating: number
          specialist_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          specialist_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          specialist_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string
          email: string
          id: string
          metadata: Json | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_start: string | null
          subscription_status: string | null
          subscription_tier: string | null
          trial_end: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_start?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          trial_end?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_start?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          trial_end?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          created_at: string
          id: string
          message: string
          priority: string
          response: string | null
          status: string
          subject: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          priority?: string
          response?: string | null
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          priority?: string
          response?: string | null
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_service_preferences: {
        Row: {
          created_at: string | null
          id: string
          last_selected_at: string | null
          preference_order: number | null
          service_id: string
          stylist_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_selected_at?: string | null
          preference_order?: number | null
          service_id: string
          stylist_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          last_selected_at?: string | null
          preference_order?: number | null
          service_id?: string
          stylist_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      authenticate_admin: {
        Args: { p_email: string; p_password: string }
        Returns: Json
      }
      check_service_permissions: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      check_stylist_availability: {
        Args: { check_date?: string; stylist_uuid: string }
        Returns: Json
      }
      create_admin_user: {
        Args: { p_email: string; p_full_name: string; p_password: string }
        Returns: Json
      }
      create_complete_admin_user: {
        Args: { p_email: string; p_full_name: string; p_password: string }
        Returns: Json
      }
      create_notification: {
        Args: {
          p_action_url?: string
          p_message: string
          p_priority?: string
          p_related_id?: string
          p_title: string
          p_type: string
          p_user_id: string
        }
        Returns: string
      }
      create_withdrawal_request: {
        Args: {
          p_account_name: string
          p_account_number: string
          p_amount: number
          p_bank_name: string
          p_notes?: string
          p_stylist_id: string
        }
        Returns: string
      }
      generate_appointment_reference: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_admin_active_stylists_count: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_admin_total_users_count: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_public_stylists: {
        Args: { p_id?: string }
        Returns: {
          availability: boolean
          availability_status: string
          avatar_url: string
          bio: string
          card_image_url: string
          experience: string
          full_name: string
          id: string
          location: string
          specialty: string
        }[]
      }
      get_stylist_available_balance: {
        Args: { stylist_uuid: string }
        Returns: number
      }
      get_stylist_earnings: {
        Args: { stylist_uuid: string }
        Returns: {
          appointment_id: string
          created_at: string
          gross_amount: number
          id: string
          net_amount: number
          payment_id: string
          platform_fee: number
          platform_fee_percentage: number
          status: string
          stylist_id: string
          updated_at: string
        }[]
      }
      get_stylist_revenue_summary: {
        Args: { stylist_uuid: string }
        Returns: {
          avg_booking_value: number
          total_booking_fees: number
          total_bookings: number
          total_revenue: number
          total_service_revenue: number
        }[]
      }
      get_stylist_withdrawals: {
        Args: { stylist_uuid: string }
        Returns: {
          account_name: string
          account_number: string
          amount: number
          bank_name: string
          created_at: string
          id: string
          notes: string
          processed_at: string
          processed_by: string
          status: string
          stylist_id: string
          updated_at: string
        }[]
      }
      get_user_loyalty_points: {
        Args: { user_uuid: string }
        Returns: number
      }
    }
    Enums: {
      notification_priority: "low" | "normal" | "high" | "urgent"
      notification_type:
        | "appointment_created"
        | "appointment_confirmed"
        | "appointment_canceled"
        | "appointment_completed"
        | "payment_received"
        | "payment_failed"
        | "earnings_available"
        | "system_alert"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      notification_priority: ["low", "normal", "high", "urgent"],
      notification_type: [
        "appointment_created",
        "appointment_confirmed",
        "appointment_canceled",
        "appointment_completed",
        "payment_received",
        "payment_failed",
        "earnings_available",
        "system_alert",
      ],
    },
  },
} as const
