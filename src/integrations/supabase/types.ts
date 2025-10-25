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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      api_usage: {
        Row: {
          call_count: number | null
          created_at: string | null
          endpoint: string | null
          id: string
          last_called: string | null
          sponsor_id: string | null
          team_id: string | null
        }
        Insert: {
          call_count?: number | null
          created_at?: string | null
          endpoint?: string | null
          id?: string
          last_called?: string | null
          sponsor_id?: string | null
          team_id?: string | null
        }
        Update: {
          call_count?: number | null
          created_at?: string | null
          endpoint?: string | null
          id?: string
          last_called?: string | null
          sponsor_id?: string | null
          team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_usage_sponsor_id_fkey"
            columns: ["sponsor_id"]
            isOneToOne: false
            referencedRelation: "sponsors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_usage_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      commentary_feed: {
        Row: {
          audio_url: string | null
          created_at: string | null
          event_type: string | null
          id: string
          related_market_id: string | null
          related_team_id: string | null
          text: string
          voice_persona: string | null
        }
        Insert: {
          audio_url?: string | null
          created_at?: string | null
          event_type?: string | null
          id?: string
          related_market_id?: string | null
          related_team_id?: string | null
          text: string
          voice_persona?: string | null
        }
        Update: {
          audio_url?: string | null
          created_at?: string | null
          event_type?: string | null
          id?: string
          related_market_id?: string | null
          related_team_id?: string | null
          text?: string
          voice_persona?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commentary_feed_related_market_id_fkey"
            columns: ["related_market_id"]
            isOneToOne: false
            referencedRelation: "prediction_markets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commentary_feed_related_team_id_fkey"
            columns: ["related_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      market_odds: {
        Row: {
          current_odds: number
          id: string
          last_updated: string | null
          market_id: string | null
          team_id: string | null
          volume: number | null
        }
        Insert: {
          current_odds?: number
          id?: string
          last_updated?: string | null
          market_id?: string | null
          team_id?: string | null
          volume?: number | null
        }
        Update: {
          current_odds?: number
          id?: string
          last_updated?: string | null
          market_id?: string | null
          team_id?: string | null
          volume?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "market_odds_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "prediction_markets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "market_odds_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      prediction_markets: {
        Row: {
          category: string
          created_at: string | null
          end_time: string | null
          id: string
          prize_amount: number
          sponsor_id: string | null
          start_time: string | null
          status: string | null
          total_pool: number | null
          winner_team_id: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          end_time?: string | null
          id?: string
          prize_amount: number
          sponsor_id?: string | null
          start_time?: string | null
          status?: string | null
          total_pool?: number | null
          winner_team_id?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          end_time?: string | null
          id?: string
          prize_amount?: number
          sponsor_id?: string | null
          start_time?: string | null
          status?: string | null
          total_pool?: number | null
          winner_team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prediction_markets_sponsor_id_fkey"
            columns: ["sponsor_id"]
            isOneToOne: false
            referencedRelation: "sponsors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prediction_markets_winner_team_id_fkey"
            columns: ["winner_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      predictions: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          market_id: string | null
          odds_at_bet: number
          payout: number | null
          status: string | null
          team_id: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          market_id?: string | null
          odds_at_bet: number
          payout?: number | null
          status?: string | null
          team_id?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          market_id?: string | null
          odds_at_bet?: number
          payout?: number | null
          status?: string | null
          team_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "predictions_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "prediction_markets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "predictions_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "predictions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      progress_updates: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          impact_score: number | null
          metadata: Json | null
          team_id: string | null
          title: string | null
          type: string
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          impact_score?: number | null
          metadata?: Json | null
          team_id?: string | null
          title?: string | null
          type: string
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          impact_score?: number | null
          metadata?: Json | null
          team_id?: string | null
          title?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "progress_updates_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string | null
          demo_url: string | null
          description: string | null
          id: string
          screenshot_urls: string[] | null
          team_id: string | null
          title: string
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          created_at?: string | null
          demo_url?: string | null
          description?: string | null
          id?: string
          screenshot_urls?: string[] | null
          team_id?: string | null
          title: string
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          created_at?: string | null
          demo_url?: string | null
          description?: string | null
          id?: string
          screenshot_urls?: string[] | null
          team_id?: string | null
          title?: string
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      sponsors: {
        Row: {
          api_documentation: string | null
          created_at: string | null
          description: string | null
          id: string
          logo_url: string | null
          name: string
          prize_pool: number | null
          website: string | null
        }
        Insert: {
          api_documentation?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          name: string
          prize_pool?: number | null
          website?: string | null
        }
        Update: {
          api_documentation?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          prize_pool?: number | null
          website?: string | null
        }
        Relationships: []
      }
      team_members: {
        Row: {
          created_at: string | null
          github_username: string | null
          id: string
          name: string
          role: string | null
          team_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          github_username?: string | null
          id?: string
          name: string
          role?: string | null
          team_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          github_username?: string | null
          id?: string
          name?: string
          role?: string | null
          team_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          category: string[] | null
          created_at: string | null
          current_progress: number | null
          devpost_url: string | null
          github_repo: string | null
          id: string
          logo_url: string | null
          momentum_score: number | null
          name: string
          status: string | null
          tagline: string | null
          team_size: number | null
          tech_stack: string[] | null
          updated_at: string | null
        }
        Insert: {
          category?: string[] | null
          created_at?: string | null
          current_progress?: number | null
          devpost_url?: string | null
          github_repo?: string | null
          id?: string
          logo_url?: string | null
          momentum_score?: number | null
          name: string
          status?: string | null
          tagline?: string | null
          team_size?: number | null
          tech_stack?: string[] | null
          updated_at?: string | null
        }
        Update: {
          category?: string[] | null
          created_at?: string | null
          current_progress?: number | null
          devpost_url?: string | null
          github_repo?: string | null
          id?: string
          logo_url?: string | null
          momentum_score?: number | null
          name?: string
          status?: string | null
          tagline?: string | null
          team_size?: number | null
          tech_stack?: string[] | null
          updated_at?: string | null
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
      users: {
        Row: {
          avatar_url: string | null
          correct_predictions: number | null
          created_at: string | null
          email: string | null
          id: string
          total_predictions: number | null
          updated_at: string | null
          username: string
          wallet_balance: number | null
          xp: number | null
        }
        Insert: {
          avatar_url?: string | null
          correct_predictions?: number | null
          created_at?: string | null
          email?: string | null
          id?: string
          total_predictions?: number | null
          updated_at?: string | null
          username: string
          wallet_balance?: number | null
          xp?: number | null
        }
        Update: {
          avatar_url?: string | null
          correct_predictions?: number | null
          created_at?: string | null
          email?: string | null
          id?: string
          total_predictions?: number | null
          updated_at?: string | null
          username?: string
          wallet_balance?: number | null
          xp?: number | null
        }
        Relationships: []
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
      update_market_odds: {
        Args: { p_bet_amount: number; p_market_id: string; p_team_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "spectator" | "hacker" | "sponsor" | "judge"
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
      app_role: ["admin", "spectator", "hacker", "sponsor", "judge"],
    },
  },
} as const
