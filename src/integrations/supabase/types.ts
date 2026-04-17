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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      charities: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          featured: boolean | null
          id: string
          image_url: string | null
          name: string
          slug: string
          tagline: string | null
          total_raised: number | null
          website: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          featured?: boolean | null
          id?: string
          image_url?: string | null
          name: string
          slug: string
          tagline?: string | null
          total_raised?: number | null
          website?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          featured?: boolean | null
          id?: string
          image_url?: string | null
          name?: string
          slug?: string
          tagline?: string | null
          total_raised?: number | null
          website?: string | null
        }
        Relationships: []
      }
      donations: {
        Row: {
          amount_cents: number
          charity_id: string | null
          created_at: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          amount_cents: number
          charity_id?: string | null
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          amount_cents?: number
          charity_id?: string | null
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "donations_charity_id_fkey"
            columns: ["charity_id"]
            isOneToOne: false
            referencedRelation: "charities"
            referencedColumns: ["id"]
          },
        ]
      }
      draw_entries: {
        Row: {
          created_at: string | null
          draw_id: string
          id: string
          numbers: number[]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          draw_id: string
          id?: string
          numbers: number[]
          user_id: string
        }
        Update: {
          created_at?: string | null
          draw_id?: string
          id?: string
          numbers?: number[]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "draw_entries_draw_id_fkey"
            columns: ["draw_id"]
            isOneToOne: false
            referencedRelation: "draws"
            referencedColumns: ["id"]
          },
        ]
      }
      draws: {
        Row: {
          created_at: string | null
          draw_month: string
          id: string
          jackpot_rollover_cents: number | null
          mode: Database["public"]["Enums"]["draw_mode"]
          prize_pool_cents: number | null
          published_at: string | null
          status: Database["public"]["Enums"]["draw_status"]
          winning_numbers: number[] | null
        }
        Insert: {
          created_at?: string | null
          draw_month: string
          id?: string
          jackpot_rollover_cents?: number | null
          mode?: Database["public"]["Enums"]["draw_mode"]
          prize_pool_cents?: number | null
          published_at?: string | null
          status?: Database["public"]["Enums"]["draw_status"]
          winning_numbers?: number[] | null
        }
        Update: {
          created_at?: string | null
          draw_month?: string
          id?: string
          jackpot_rollover_cents?: number | null
          mode?: Database["public"]["Enums"]["draw_mode"]
          prize_pool_cents?: number | null
          published_at?: string | null
          status?: Database["public"]["Enums"]["draw_status"]
          winning_numbers?: number[] | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          charity_id: string | null
          charity_percentage: number | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          charity_id?: string | null
          charity_percentage?: number | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          charity_id?: string | null
          charity_percentage?: number | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_charity_id_fkey"
            columns: ["charity_id"]
            isOneToOne: false
            referencedRelation: "charities"
            referencedColumns: ["id"]
          },
        ]
      }
      scores: {
        Row: {
          created_at: string | null
          id: string
          played_on: string
          score: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          played_on: string
          score: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          played_on?: string
          score?: number
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          amount_cents: number
          created_at: string | null
          current_period_end: string | null
          id: string
          plan: Database["public"]["Enums"]["sub_plan"]
          status: Database["public"]["Enums"]["sub_status"]
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount_cents: number
          created_at?: string | null
          current_period_end?: string | null
          id?: string
          plan: Database["public"]["Enums"]["sub_plan"]
          status?: Database["public"]["Enums"]["sub_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string | null
          current_period_end?: string | null
          id?: string
          plan?: Database["public"]["Enums"]["sub_plan"]
          status?: Database["public"]["Enums"]["sub_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      winners: {
        Row: {
          created_at: string | null
          draw_id: string
          id: string
          paid_at: string | null
          prize_cents: number
          status: Database["public"]["Enums"]["payout_status"]
          tier: Database["public"]["Enums"]["winner_tier"]
          user_id: string
          verification_url: string | null
          verified_at: string | null
        }
        Insert: {
          created_at?: string | null
          draw_id: string
          id?: string
          paid_at?: string | null
          prize_cents: number
          status?: Database["public"]["Enums"]["payout_status"]
          tier: Database["public"]["Enums"]["winner_tier"]
          user_id: string
          verification_url?: string | null
          verified_at?: string | null
        }
        Update: {
          created_at?: string | null
          draw_id?: string
          id?: string
          paid_at?: string | null
          prize_cents?: number
          status?: Database["public"]["Enums"]["payout_status"]
          tier?: Database["public"]["Enums"]["winner_tier"]
          user_id?: string
          verification_url?: string | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "winners_draw_id_fkey"
            columns: ["draw_id"]
            isOneToOne: false
            referencedRelation: "draws"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "subscriber"
      draw_mode: "random" | "weighted"
      draw_status: "scheduled" | "simulated" | "published"
      payout_status:
        | "pending"
        | "verification_required"
        | "verified"
        | "paid"
        | "rejected"
      sub_plan: "monthly" | "yearly"
      sub_status: "active" | "cancelled" | "lapsed" | "pending"
      winner_tier: "match_5" | "match_4" | "match_3"
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
      app_role: ["admin", "subscriber"],
      draw_mode: ["random", "weighted"],
      draw_status: ["scheduled", "simulated", "published"],
      payout_status: [
        "pending",
        "verification_required",
        "verified",
        "paid",
        "rejected",
      ],
      sub_plan: ["monthly", "yearly"],
      sub_status: ["active", "cancelled", "lapsed", "pending"],
      winner_tier: ["match_5", "match_4", "match_3"],
    },
  },
} as const
