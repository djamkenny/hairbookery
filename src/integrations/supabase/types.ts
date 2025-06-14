export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
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
          service_id: string
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
          service_id: string
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
          service_id?: string
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
      notifications: {
        Row: {
          action_url: string | null
          created_at: string
          expires_at: string | null
          id: string
          is_read: boolean
          message: string
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
          avatar_url: string | null
          bio: string | null
          card_image_url: string | null
          created_at: string
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
          avatar_url?: string | null
          bio?: string | null
          card_image_url?: string | null
          created_at?: string
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
          avatar_url?: string | null
          bio?: string | null
          card_image_url?: string | null
          created_at?: string
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
      services: {
        Row: {
          created_at: string | null
          description: string | null
          duration: number
          id: string
          image_urls: string[] | null
          name: string
          price: number
          stylist_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration: number
          id?: string
          image_urls?: string[] | null
          name: string
          price: number
          stylist_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration?: number
          id?: string
          image_urls?: string[] | null
          name?: string
          price?: number
          stylist_id?: string | null
          updated_at?: string | null
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_service_permissions: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      create_notification: {
        Args: {
          p_user_id: string
          p_title: string
          p_message: string
          p_type: string
          p_related_id?: string
          p_action_url?: string
          p_priority?: string
        }
        Returns: string
      }
      create_withdrawal_request: {
        Args: {
          p_stylist_id: string
          p_amount: number
          p_bank_name: string
          p_account_number: string
          p_account_name: string
          p_notes?: string
        }
        Returns: string
      }
      generate_appointment_reference: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_stylist_earnings: {
        Args: { stylist_uuid: string }
        Returns: {
          id: string
          stylist_id: string
          appointment_id: string
          payment_id: string
          gross_amount: number
          platform_fee: number
          net_amount: number
          platform_fee_percentage: number
          status: string
          created_at: string
          updated_at: string
        }[]
      }
      get_stylist_withdrawals: {
        Args: { stylist_uuid: string }
        Returns: {
          id: string
          stylist_id: string
          amount: number
          status: string
          bank_name: string
          account_number: string
          account_name: string
          notes: string
          processed_at: string
          processed_by: string
          created_at: string
          updated_at: string
        }[]
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
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
