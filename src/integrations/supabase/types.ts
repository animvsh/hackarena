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
      anthropic_id: {
        Row: {
          id: string | null
        }
        Insert: {
          id?: string | null
        }
        Update: {
          id?: string | null
        }
        Relationships: []
      }
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
      betting_odds: {
        Row: {
          created_at: string | null
          id: string
          implied_probability: number
          odds_american: number
          odds_decimal: number
          prize_id: string | null
          team_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          implied_probability: number
          odds_american: number
          odds_decimal: number
          prize_id?: string | null
          team_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          implied_probability?: number
          odds_american?: number
          odds_decimal?: number
          prize_id?: string | null
          team_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "betting_odds_prize_id_fkey"
            columns: ["prize_id"]
            isOneToOne: false
            referencedRelation: "hackathon_prizes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "betting_odds_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "hackathon_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      broadcast_content: {
        Row: {
          content_type: string
          created_at: string
          duration: number | null
          hackathon_id: string | null
          id: string
          metadata: Json | null
          priority: string
          team_id: string | null
          team_name: string | null
          text: string
        }
        Insert: {
          content_type: string
          created_at?: string
          duration?: number | null
          hackathon_id?: string | null
          id?: string
          metadata?: Json | null
          priority?: string
          team_id?: string | null
          team_name?: string | null
          text: string
        }
        Update: {
          content_type?: string
          created_at?: string
          duration?: number | null
          hackathon_id?: string | null
          id?: string
          metadata?: Json | null
          priority?: string
          team_id?: string | null
          team_name?: string | null
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "broadcast_content_hackathon_id_fkey"
            columns: ["hackathon_id"]
            isOneToOne: false
            referencedRelation: "dashboard_stats"
            referencedColumns: ["hackathon_id"]
          },
          {
            foreignKeyName: "broadcast_content_hackathon_id_fkey"
            columns: ["hackathon_id"]
            isOneToOne: false
            referencedRelation: "hackathons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "broadcast_content_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      broadcast_state: {
        Row: {
          commentary_index: number | null
          current_scene: string
          current_segment_id: string | null
          hackathon_id: string | null
          id: string
          is_paused: boolean | null
          live_viewer_count: number | null
          paused_at: string | null
          paused_by_user_id: string | null
          phase: string | null
          singleton: boolean | null
          state: string
          updated_at: string | null
        }
        Insert: {
          commentary_index?: number | null
          current_scene: string
          current_segment_id?: string | null
          hackathon_id?: string | null
          id?: string
          is_paused?: boolean | null
          live_viewer_count?: number | null
          paused_at?: string | null
          paused_by_user_id?: string | null
          phase?: string | null
          singleton?: boolean | null
          state: string
          updated_at?: string | null
        }
        Update: {
          commentary_index?: number | null
          current_scene?: string
          current_segment_id?: string | null
          hackathon_id?: string | null
          id?: string
          is_paused?: boolean | null
          live_viewer_count?: number | null
          paused_at?: string | null
          paused_by_user_id?: string | null
          phase?: string | null
          singleton?: boolean | null
          state?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "broadcast_state_hackathon_id_fkey"
            columns: ["hackathon_id"]
            isOneToOne: false
            referencedRelation: "dashboard_stats"
            referencedColumns: ["hackathon_id"]
          },
          {
            foreignKeyName: "broadcast_state_hackathon_id_fkey"
            columns: ["hackathon_id"]
            isOneToOne: false
            referencedRelation: "hackathons"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          reactions: Json | null
          reply_to: string | null
          room_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          reactions?: Json | null
          reply_to?: string | null
          room_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          reactions?: Json | null
          reply_to?: string | null
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_reply_to_fkey"
            columns: ["reply_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_rooms: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_public: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      chroma_id: {
        Row: {
          id: string | null
        }
        Insert: {
          id?: string | null
        }
        Update: {
          id?: string | null
        }
        Relationships: []
      }
      commentary_feed: {
        Row: {
          audio_url: string | null
          created_at: string | null
          event_type: string | null
          hackathon_id: string | null
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
          hackathon_id?: string | null
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
          hackathon_id?: string | null
          id?: string
          related_market_id?: string | null
          related_team_id?: string | null
          text?: string
          voice_persona?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commentary_feed_hackathon_id_fkey"
            columns: ["hackathon_id"]
            isOneToOne: false
            referencedRelation: "dashboard_stats"
            referencedColumns: ["hackathon_id"]
          },
          {
            foreignKeyName: "commentary_feed_hackathon_id_fkey"
            columns: ["hackathon_id"]
            isOneToOne: false
            referencedRelation: "hackathons"
            referencedColumns: ["id"]
          },
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
      hackathon_id: {
        Row: {
          id: string | null
        }
        Insert: {
          id?: string | null
        }
        Update: {
          id?: string | null
        }
        Relationships: []
      }
      hackathon_prizes: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          hackathon_id: string | null
          id: string
          position: number
          prize_amount: number
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          hackathon_id?: string | null
          id?: string
          position: number
          prize_amount: number
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          hackathon_id?: string | null
          id?: string
          position?: number
          prize_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "hackathon_prizes_hackathon_id_fkey"
            columns: ["hackathon_id"]
            isOneToOne: false
            referencedRelation: "dashboard_stats"
            referencedColumns: ["hackathon_id"]
          },
          {
            foreignKeyName: "hackathon_prizes_hackathon_id_fkey"
            columns: ["hackathon_id"]
            isOneToOne: false
            referencedRelation: "hackathons"
            referencedColumns: ["id"]
          },
        ]
      }
      hackathon_team_members: {
        Row: {
          hacker_id: string | null
          id: string
          joined_at: string | null
          role: string | null
          team_id: string | null
        }
        Insert: {
          hacker_id?: string | null
          id?: string
          joined_at?: string | null
          role?: string | null
          team_id?: string | null
        }
        Update: {
          hacker_id?: string | null
          id?: string
          joined_at?: string | null
          role?: string | null
          team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hackathon_team_members_hacker_id_fkey"
            columns: ["hacker_id"]
            isOneToOne: false
            referencedRelation: "hackers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hackathon_team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "hackathon_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      hackathon_teams: {
        Row: {
          category: string | null
          created_at: string | null
          current_progress: number | null
          devpost_url: string | null
          github_url: string | null
          hackathon_id: string | null
          id: string
          invite_code: string | null
          logo_url: string | null
          momentum_score: number | null
          name: string
          tagline: string | null
          team_size: number | null
          tech_stack: string[] | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          current_progress?: number | null
          devpost_url?: string | null
          github_url?: string | null
          hackathon_id?: string | null
          id?: string
          invite_code?: string | null
          logo_url?: string | null
          momentum_score?: number | null
          name: string
          tagline?: string | null
          team_size?: number | null
          tech_stack?: string[] | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          current_progress?: number | null
          devpost_url?: string | null
          github_url?: string | null
          hackathon_id?: string | null
          id?: string
          invite_code?: string | null
          logo_url?: string | null
          momentum_score?: number | null
          name?: string
          tagline?: string | null
          team_size?: number | null
          tech_stack?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hackathon_teams_hackathon_id_fkey"
            columns: ["hackathon_id"]
            isOneToOne: false
            referencedRelation: "dashboard_stats"
            referencedColumns: ["hackathon_id"]
          },
          {
            foreignKeyName: "hackathon_teams_hackathon_id_fkey"
            columns: ["hackathon_id"]
            isOneToOne: false
            referencedRelation: "hackathons"
            referencedColumns: ["id"]
          },
        ]
      }
      hackathons: {
        Row: {
          created_at: string | null
          description: string | null
          devpost_url: string | null
          end_date: string | null
          id: string
          location: string | null
          name: string
          prize_pool: number | null
          start_date: string | null
          status: string | null
          total_participants: number | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          devpost_url?: string | null
          end_date?: string | null
          id?: string
          location?: string | null
          name: string
          prize_pool?: number | null
          start_date?: string | null
          status?: string | null
          total_participants?: number | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          devpost_url?: string | null
          end_date?: string | null
          id?: string
          location?: string | null
          name?: string
          prize_pool?: number | null
          start_date?: string | null
          status?: string | null
          total_participants?: number | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      hacker_stats: {
        Row: {
          ai_ml_skill: number | null
          blockchain_skill: number | null
          communication: number | null
          company_prestige: number | null
          consistency: number | null
          created_at: string | null
          fintech_skill: number | null
          fullstack_skill: number | null
          github_commits: number | null
          github_followers: number | null
          github_repos: number | null
          github_stars: number | null
          growth: number | null
          hackathon_experience: number | null
          hacker_id: string | null
          id: string
          innovation: number | null
          leadership: number | null
          market_value: number | null
          mobile_skill: number | null
          network: number | null
          overall_rating: number | null
          technical_skill: number | null
          updated_at: string | null
        }
        Insert: {
          ai_ml_skill?: number | null
          blockchain_skill?: number | null
          communication?: number | null
          company_prestige?: number | null
          consistency?: number | null
          created_at?: string | null
          fintech_skill?: number | null
          fullstack_skill?: number | null
          github_commits?: number | null
          github_followers?: number | null
          github_repos?: number | null
          github_stars?: number | null
          growth?: number | null
          hackathon_experience?: number | null
          hacker_id?: string | null
          id?: string
          innovation?: number | null
          leadership?: number | null
          market_value?: number | null
          mobile_skill?: number | null
          network?: number | null
          overall_rating?: number | null
          technical_skill?: number | null
          updated_at?: string | null
        }
        Update: {
          ai_ml_skill?: number | null
          blockchain_skill?: number | null
          communication?: number | null
          company_prestige?: number | null
          consistency?: number | null
          created_at?: string | null
          fintech_skill?: number | null
          fullstack_skill?: number | null
          github_commits?: number | null
          github_followers?: number | null
          github_repos?: number | null
          github_stars?: number | null
          growth?: number | null
          hackathon_experience?: number | null
          hacker_id?: string | null
          id?: string
          innovation?: number | null
          leadership?: number | null
          market_value?: number | null
          mobile_skill?: number | null
          network?: number | null
          overall_rating?: number | null
          technical_skill?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hacker_stats_hacker_id_fkey"
            columns: ["hacker_id"]
            isOneToOne: false
            referencedRelation: "hackers"
            referencedColumns: ["id"]
          },
        ]
      }
      hackers: {
        Row: {
          avatar_url: string | null
          bio: string | null
          company: string | null
          created_at: string | null
          github_username: string
          id: string
          linkedin_url: string | null
          location: string | null
          name: string
          twitter_username: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string | null
          github_username: string
          id?: string
          linkedin_url?: string | null
          location?: string | null
          name: string
          twitter_username?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string | null
          github_username?: string
          id?: string
          linkedin_url?: string | null
          location?: string | null
          name?: string
          twitter_username?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      integration_metrics: {
        Row: {
          created_at: string | null
          id: string
          integration_id: string
          metric_metadata: Json | null
          metric_name: string
          metric_value: number | null
          recorded_at: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          integration_id: string
          metric_metadata?: Json | null
          metric_name: string
          metric_value?: number | null
          recorded_at: string
        }
        Update: {
          created_at?: string | null
          id?: string
          integration_id?: string
          metric_metadata?: Json | null
          metric_name?: string
          metric_value?: number | null
          recorded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_metrics_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "team_integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      livekit_id: {
        Row: {
          id: string | null
        }
        Insert: {
          id?: string | null
        }
        Update: {
          id?: string | null
        }
        Relationships: []
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
      notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string
          metadata: Json | null
          read: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          metadata?: Json | null
          read?: boolean | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      odds_history: {
        Row: {
          created_at: string | null
          id: string
          market_id: string | null
          odds: number
          team_id: string | null
          timestamp: string | null
          volume: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          market_id?: string | null
          odds: number
          team_id?: string | null
          timestamp?: string | null
          volume?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          market_id?: string | null
          odds?: number
          team_id?: string | null
          timestamp?: string | null
          volume?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "odds_history_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "prediction_markets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "odds_history_team_id_fkey"
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
          hackathon_id: string | null
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
          hackathon_id?: string | null
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
          hackathon_id?: string | null
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
            foreignKeyName: "prediction_markets_hackathon_id_fkey"
            columns: ["hackathon_id"]
            isOneToOne: false
            referencedRelation: "dashboard_stats"
            referencedColumns: ["hackathon_id"]
          },
          {
            foreignKeyName: "prediction_markets_hackathon_id_fkey"
            columns: ["hackathon_id"]
            isOneToOne: false
            referencedRelation: "hackathons"
            referencedColumns: ["id"]
          },
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
      profile_views: {
        Row: {
          id: string
          profile_user_id: string
          referrer: string | null
          viewed_at: string | null
          viewer_user_id: string | null
        }
        Insert: {
          id?: string
          profile_user_id: string
          referrer?: string | null
          viewed_at?: string | null
          viewer_user_id?: string | null
        }
        Update: {
          id?: string
          profile_user_id?: string
          referrer?: string | null
          viewed_at?: string | null
          viewer_user_id?: string | null
        }
        Relationships: []
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
      supabase_id: {
        Row: {
          id: string | null
        }
        Insert: {
          id?: string | null
        }
        Update: {
          id?: string | null
        }
        Relationships: []
      }
      team_audit_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          team_id: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          team_id: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          team_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_audit_logs_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_ids: {
        Row: {
          array_agg: string[] | null
        }
        Insert: {
          array_agg?: string[] | null
        }
        Update: {
          array_agg?: string[] | null
        }
        Relationships: []
      }
      team_integrations: {
        Row: {
          config: Json | null
          connected_by: string
          created_at: string | null
          credentials_encrypted: string | null
          id: string
          integration_name: string
          integration_type: string
          last_sync_at: string | null
          status: string | null
          sync_frequency: string | null
          team_id: string
        }
        Insert: {
          config?: Json | null
          connected_by: string
          created_at?: string | null
          credentials_encrypted?: string | null
          id?: string
          integration_name: string
          integration_type: string
          last_sync_at?: string | null
          status?: string | null
          sync_frequency?: string | null
          team_id: string
        }
        Update: {
          config?: Json | null
          connected_by?: string
          created_at?: string | null
          credentials_encrypted?: string | null
          id?: string
          integration_name?: string
          integration_type?: string
          last_sync_at?: string | null
          status?: string | null
          sync_frequency?: string | null
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_integrations_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_invite_codes: {
        Row: {
          code: string
          created_at: string | null
          created_by: string
          expires_at: string | null
          id: string
          is_active: boolean | null
          max_uses: number | null
          team_id: string
          uses_count: number | null
        }
        Insert: {
          code: string
          created_at?: string | null
          created_by: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          team_id: string
          uses_count?: number | null
        }
        Update: {
          code?: string
          created_at?: string | null
          created_by?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          team_id?: string
          uses_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "team_invite_codes_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_invites: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          invite_email: string | null
          invited_by: string
          invited_user_id: string | null
          message: string | null
          responded_at: string | null
          status: string | null
          team_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          invite_email?: string | null
          invited_by: string
          invited_user_id?: string | null
          message?: string | null
          responded_at?: string | null
          status?: string | null
          team_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          invite_email?: string | null
          invited_by?: string
          invited_user_id?: string | null
          message?: string | null
          responded_at?: string | null
          status?: string | null
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_invites_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_join_requests: {
        Row: {
          created_at: string | null
          id: string
          invite_code_id: string | null
          message: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          team_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          invite_code_id?: string | null
          message?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          team_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          invite_code_id?: string | null
          message?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_join_requests_invite_code_id_fkey"
            columns: ["invite_code_id"]
            isOneToOne: false
            referencedRelation: "team_invite_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_join_requests_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
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
      team_permissions: {
        Row: {
          can_manage_integrations: boolean | null
          can_manage_members: boolean | null
          can_view_analytics: boolean | null
          created_at: string | null
          id: string
          role: string
          team_id: string
          user_id: string
        }
        Insert: {
          can_manage_integrations?: boolean | null
          can_manage_members?: boolean | null
          can_view_analytics?: boolean | null
          created_at?: string | null
          id?: string
          role: string
          team_id: string
          user_id: string
        }
        Update: {
          can_manage_integrations?: boolean | null
          can_manage_members?: boolean | null
          can_view_analytics?: boolean | null
          created_at?: string | null
          id?: string
          role?: string
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_permissions_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_profiles: {
        Row: {
          ai_analysis: Json | null
          business_model: string | null
          company_type: string | null
          created_at: string | null
          id: string
          industry: string | null
          target_metrics: Json | null
          team_id: string
          updated_at: string | null
        }
        Insert: {
          ai_analysis?: Json | null
          business_model?: string | null
          company_type?: string | null
          created_at?: string | null
          id?: string
          industry?: string | null
          target_metrics?: Json | null
          team_id: string
          updated_at?: string | null
        }
        Update: {
          ai_analysis?: Json | null
          business_model?: string | null
          company_type?: string | null
          created_at?: string | null
          id?: string
          industry?: string | null
          target_metrics?: Json | null
          team_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_profiles_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: true
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_stats: {
        Row: {
          avg_ai_ml_skill: number | null
          avg_blockchain_skill: number | null
          avg_communication: number | null
          avg_company_prestige: number | null
          avg_consistency: number | null
          avg_fintech_skill: number | null
          avg_fullstack_skill: number | null
          avg_growth: number | null
          avg_hackathon_experience: number | null
          avg_innovation: number | null
          avg_leadership: number | null
          avg_mobile_skill: number | null
          avg_network: number | null
          avg_overall_rating: number | null
          avg_technical_skill: number | null
          created_at: string | null
          id: string
          team_id: string | null
          total_market_value: number | null
          updated_at: string | null
        }
        Insert: {
          avg_ai_ml_skill?: number | null
          avg_blockchain_skill?: number | null
          avg_communication?: number | null
          avg_company_prestige?: number | null
          avg_consistency?: number | null
          avg_fintech_skill?: number | null
          avg_fullstack_skill?: number | null
          avg_growth?: number | null
          avg_hackathon_experience?: number | null
          avg_innovation?: number | null
          avg_leadership?: number | null
          avg_mobile_skill?: number | null
          avg_network?: number | null
          avg_overall_rating?: number | null
          avg_technical_skill?: number | null
          created_at?: string | null
          id?: string
          team_id?: string | null
          total_market_value?: number | null
          updated_at?: string | null
        }
        Update: {
          avg_ai_ml_skill?: number | null
          avg_blockchain_skill?: number | null
          avg_communication?: number | null
          avg_company_prestige?: number | null
          avg_consistency?: number | null
          avg_fintech_skill?: number | null
          avg_fullstack_skill?: number | null
          avg_growth?: number | null
          avg_hackathon_experience?: number | null
          avg_innovation?: number | null
          avg_leadership?: number | null
          avg_mobile_skill?: number | null
          avg_network?: number | null
          avg_overall_rating?: number | null
          avg_technical_skill?: number | null
          created_at?: string | null
          id?: string
          team_id?: string | null
          total_market_value?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_stats_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "hackathon_teams"
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
          hackathon_id: string | null
          id: string
          invite_code: string | null
          logo_url: string | null
          momentum_score: number | null
          name: string
          onboarding_completed: boolean | null
          owner_id: string | null
          status: string | null
          tagline: string | null
          team_size: number | null
          team_type: string | null
          tech_stack: string[] | null
          updated_at: string | null
        }
        Insert: {
          category?: string[] | null
          created_at?: string | null
          current_progress?: number | null
          devpost_url?: string | null
          github_repo?: string | null
          hackathon_id?: string | null
          id?: string
          invite_code?: string | null
          logo_url?: string | null
          momentum_score?: number | null
          name: string
          onboarding_completed?: boolean | null
          owner_id?: string | null
          status?: string | null
          tagline?: string | null
          team_size?: number | null
          team_type?: string | null
          tech_stack?: string[] | null
          updated_at?: string | null
        }
        Update: {
          category?: string[] | null
          created_at?: string | null
          current_progress?: number | null
          devpost_url?: string | null
          github_repo?: string | null
          hackathon_id?: string | null
          id?: string
          invite_code?: string | null
          logo_url?: string | null
          momentum_score?: number | null
          name?: string
          onboarding_completed?: boolean | null
          owner_id?: string | null
          status?: string | null
          tagline?: string | null
          team_size?: number | null
          team_type?: string | null
          tech_stack?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teams_hackathon_id_fkey"
            columns: ["hackathon_id"]
            isOneToOne: false
            referencedRelation: "dashboard_stats"
            referencedColumns: ["hackathon_id"]
          },
          {
            foreignKeyName: "teams_hackathon_id_fkey"
            columns: ["hackathon_id"]
            isOneToOne: false
            referencedRelation: "hackathons"
            referencedColumns: ["id"]
          },
        ]
      }
      user_ids: {
        Row: {
          array_agg: string[] | null
        }
        Insert: {
          array_agg?: string[] | null
        }
        Update: {
          array_agg?: string[] | null
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
          bio: string | null
          certifications: Json | null
          correct_predictions: number | null
          created_at: string | null
          education: Json | null
          email: string | null
          experience: Json | null
          github_access_token: string | null
          github_id: string | null
          github_url: string | null
          github_username: string | null
          github_verified: boolean | null
          headline: string | null
          id: string
          last_github_sync: string | null
          last_profile_sync: string | null
          linkedin_id: string | null
          linkedin_url: string | null
          linkedin_verified: boolean | null
          location: string | null
          onboarding_completed: boolean | null
          portfolio_url: string | null
          privacy_settings: Json | null
          profile_completeness: number | null
          profile_enrichment_source: string | null
          profile_generated_by: string | null
          projects: Json | null
          resume_url: string | null
          skills: Json | null
          social_links: Json | null
          total_predictions: number | null
          updated_at: string | null
          username: string
          wallet_balance: number | null
          xp: number | null
          xrp_destination_tag: string | null
          years_of_experience: number | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          certifications?: Json | null
          correct_predictions?: number | null
          created_at?: string | null
          education?: Json | null
          email?: string | null
          experience?: Json | null
          github_access_token?: string | null
          github_id?: string | null
          github_url?: string | null
          github_username?: string | null
          github_verified?: boolean | null
          headline?: string | null
          id?: string
          last_github_sync?: string | null
          last_profile_sync?: string | null
          linkedin_id?: string | null
          linkedin_url?: string | null
          linkedin_verified?: boolean | null
          location?: string | null
          onboarding_completed?: boolean | null
          portfolio_url?: string | null
          privacy_settings?: Json | null
          profile_completeness?: number | null
          profile_enrichment_source?: string | null
          profile_generated_by?: string | null
          projects?: Json | null
          resume_url?: string | null
          skills?: Json | null
          social_links?: Json | null
          total_predictions?: number | null
          updated_at?: string | null
          username: string
          wallet_balance?: number | null
          xp?: number | null
          xrp_destination_tag?: string | null
          years_of_experience?: number | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          certifications?: Json | null
          correct_predictions?: number | null
          created_at?: string | null
          education?: Json | null
          email?: string | null
          experience?: Json | null
          github_access_token?: string | null
          github_id?: string | null
          github_url?: string | null
          github_username?: string | null
          github_verified?: boolean | null
          headline?: string | null
          id?: string
          last_github_sync?: string | null
          last_profile_sync?: string | null
          linkedin_id?: string | null
          linkedin_url?: string | null
          linkedin_verified?: boolean | null
          location?: string | null
          onboarding_completed?: boolean | null
          portfolio_url?: string | null
          privacy_settings?: Json | null
          profile_completeness?: number | null
          profile_enrichment_source?: string | null
          profile_generated_by?: string | null
          projects?: Json | null
          resume_url?: string | null
          skills?: Json | null
          social_links?: Json | null
          total_predictions?: number | null
          updated_at?: string | null
          username?: string
          wallet_balance?: number | null
          xp?: number | null
          xrp_destination_tag?: string | null
          years_of_experience?: number | null
        }
        Relationships: []
      }
      visa_id: {
        Row: {
          id: string | null
        }
        Insert: {
          id?: string | null
        }
        Update: {
          id?: string | null
        }
        Relationships: []
      }
      wallet_transactions: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          id: string
          reference_id: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          id?: string
          reference_id?: string | null
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          id?: string
          reference_id?: string | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      xrp_deposits: {
        Row: {
          confirmed_at: string | null
          created_at: string | null
          destination_tag: string | null
          error_message: string | null
          exchange_rate: number
          hackcoins_credited: number
          id: string
          status: string | null
          user_id: string
          xrp_amount: number
          xrp_transaction_hash: string
        }
        Insert: {
          confirmed_at?: string | null
          created_at?: string | null
          destination_tag?: string | null
          error_message?: string | null
          exchange_rate: number
          hackcoins_credited: number
          id?: string
          status?: string | null
          user_id: string
          xrp_amount: number
          xrp_transaction_hash: string
        }
        Update: {
          confirmed_at?: string | null
          created_at?: string | null
          destination_tag?: string | null
          error_message?: string | null
          exchange_rate?: number
          hackcoins_credited?: number
          id?: string
          status?: string | null
          user_id?: string
          xrp_amount?: number
          xrp_transaction_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "xrp_deposits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      dashboard_stats: {
        Row: {
          active_teams: number | null
          hackathon_id: string | null
          open_markets: number | null
          total_predictions: number | null
          total_volume: number | null
        }
        Relationships: []
      }
      xrp_deposit_history: {
        Row: {
          confirmed_at: string | null
          created_at: string | null
          destination_tag: string | null
          email: string | null
          error_message: string | null
          exchange_rate: number | null
          hackcoins_credited: number | null
          id: string | null
          processing_time: unknown
          status: string | null
          user_id: string | null
          username: string | null
          xrp_amount: number | null
          xrp_transaction_hash: string | null
        }
        Relationships: [
          {
            foreignKeyName: "xrp_deposits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      auto_analyze_teams: { Args: never; Returns: undefined }
      can_manage_team: {
        Args: { _team_id: string; _user_id: string }
        Returns: boolean
      }
      generate_team_invite_code: { Args: never; Returns: string }
      generate_xrp_destination_tag: { Args: never; Returns: string }
      get_user_balance: { Args: { p_user_id: string }; Returns: number }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_team_member: {
        Args: { _team_id: string; _user_id: string }
        Returns: boolean
      }
      place_bet: {
        Args: {
          p_amount: number
          p_current_odds: number
          p_market_id: string
          p_team_id: string
          p_user_id: string
        }
        Returns: Json
      }
      recalculate_market_odds: {
        Args: { p_market_id: string }
        Returns: undefined
      }
      refresh_dashboard_stats: { Args: never; Returns: undefined }
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
