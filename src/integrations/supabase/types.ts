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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          points: number | null
          requirement_type: string | null
          requirement_value: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          points?: number | null
          requirement_type?: string | null
          requirement_value?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          points?: number | null
          requirement_type?: string | null
          requirement_value?: number | null
        }
        Relationships: []
      }
      admin_whitelist: {
        Row: {
          added_by: string | null
          created_at: string | null
          email: string
          id: string
        }
        Insert: {
          added_by?: string | null
          created_at?: string | null
          email: string
          id?: string
        }
        Update: {
          added_by?: string | null
          created_at?: string | null
          email?: string
          id?: string
        }
        Relationships: []
      }
      analytics_snapshots: {
        Row: {
          created_at: string
          date: string
          id: string
          meals_count: number | null
          photos_count: number | null
          updated_at: string
          user_id: string
          water_consumed_ml: number | null
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          meals_count?: number | null
          photos_count?: number | null
          updated_at?: string
          user_id: string
          water_consumed_ml?: number | null
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          meals_count?: number | null
          photos_count?: number | null
          updated_at?: string
          user_id?: string
          water_consumed_ml?: number | null
        }
        Relationships: []
      }
      auth_states: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          provider: string
          state: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          provider: string
          state: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          provider?: string
          state?: string
          user_id?: string
        }
        Relationships: []
      }
      authorized_users: {
        Row: {
          created_at: string | null
          email: string
          id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
        }
        Relationships: []
      }
      backup_logs: {
        Row: {
          backup_type: string
          completed_at: string | null
          error_details: Json | null
          id: string
          items_failed: number | null
          items_processed: number | null
          metadata: Json | null
          started_at: string
          status: string
        }
        Insert: {
          backup_type: string
          completed_at?: string | null
          error_details?: Json | null
          id?: string
          items_failed?: number | null
          items_processed?: number | null
          metadata?: Json | null
          started_at?: string
          status?: string
        }
        Update: {
          backup_type?: string
          completed_at?: string | null
          error_details?: Json | null
          id?: string
          items_failed?: number | null
          items_processed?: number | null
          metadata?: Json | null
          started_at?: string
          status?: string
        }
        Relationships: []
      }
      bot_interactions: {
        Row: {
          context_data: Json | null
          created_at: string | null
          id: string
          interaction_type: string
          response_data: Json | null
          response_post_id: string | null
          success_metrics: Json | null
          trigger_post_id: string | null
          user_id: string | null
        }
        Insert: {
          context_data?: Json | null
          created_at?: string | null
          id?: string
          interaction_type: string
          response_data?: Json | null
          response_post_id?: string | null
          success_metrics?: Json | null
          trigger_post_id?: string | null
          user_id?: string | null
        }
        Update: {
          context_data?: Json | null
          created_at?: string | null
          id?: string
          interaction_type?: string
          response_data?: Json | null
          response_post_id?: string | null
          success_metrics?: Json | null
          trigger_post_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bot_interactions_response_post_id_fkey"
            columns: ["response_post_id"]
            isOneToOne: false
            referencedRelation: "community_updates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bot_interactions_trigger_post_id_fkey"
            columns: ["trigger_post_id"]
            isOneToOne: false
            referencedRelation: "community_updates"
            referencedColumns: ["id"]
          },
        ]
      }
      bot_knowledge_graph: {
        Row: {
          attributes: Json | null
          confidence_score: number | null
          created_at: string | null
          entity_id: string
          entity_name: string | null
          entity_type: string
          id: string
          last_updated: string | null
          relationships: Json | null
          source_interactions: string[] | null
        }
        Insert: {
          attributes?: Json | null
          confidence_score?: number | null
          created_at?: string | null
          entity_id: string
          entity_name?: string | null
          entity_type: string
          id?: string
          last_updated?: string | null
          relationships?: Json | null
          source_interactions?: string[] | null
        }
        Update: {
          attributes?: Json | null
          confidence_score?: number | null
          created_at?: string | null
          entity_id?: string
          entity_name?: string | null
          entity_type?: string
          id?: string
          last_updated?: string | null
          relationships?: Json | null
          source_interactions?: string[] | null
        }
        Relationships: []
      }
      call_attendees: {
        Row: {
          attended: boolean | null
          call_id: string
          id: string
          joined_at: string | null
          left_at: string | null
          user_id: string
        }
        Insert: {
          attended?: boolean | null
          call_id: string
          id?: string
          joined_at?: string | null
          left_at?: string | null
          user_id: string
        }
        Update: {
          attended?: boolean | null
          call_id?: string
          id?: string
          joined_at?: string | null
          left_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "call_attendees_call_id_fkey"
            columns: ["call_id"]
            isOneToOne: false
            referencedRelation: "weekly_calls"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_leads: {
        Row: {
          campaign_id: string
          lead_id: string
        }
        Insert: {
          campaign_id: string
          lead_id: string
        }
        Update: {
          campaign_id?: string
          lead_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_leads_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "outreach_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_leads_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "outreach_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      challenges: {
        Row: {
          created_at: string | null
          description: string
          end_date: string
          id: string
          requirements: Json
          start_date: string
          title: string
          type: string | null
          xp_reward: number
        }
        Insert: {
          created_at?: string | null
          description: string
          end_date: string
          id?: string
          requirements: Json
          start_date: string
          title: string
          type?: string | null
          xp_reward: number
        }
        Update: {
          created_at?: string | null
          description?: string
          end_date?: string
          id?: string
          requirements?: Json
          start_date?: string
          title?: string
          type?: string | null
          xp_reward?: number
        }
        Relationships: []
      }
      channel_members: {
        Row: {
          ban_reason: string | null
          banned_until: string | null
          channel_id: string | null
          id: string
          invited_by: string | null
          is_banned: boolean | null
          is_muted: boolean | null
          joined_at: string | null
          permissions: Json | null
          role: string | null
          user_id: string | null
        }
        Insert: {
          ban_reason?: string | null
          banned_until?: string | null
          channel_id?: string | null
          id?: string
          invited_by?: string | null
          is_banned?: boolean | null
          is_muted?: boolean | null
          joined_at?: string | null
          permissions?: Json | null
          role?: string | null
          user_id?: string | null
        }
        Update: {
          ban_reason?: string | null
          banned_until?: string | null
          channel_id?: string | null
          id?: string
          invited_by?: string | null
          is_banned?: boolean | null
          is_muted?: boolean | null
          joined_at?: string | null
          permissions?: Json | null
          role?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "channel_members_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
        ]
      }
      channel_messages: {
        Row: {
          channel_id: string
          content: string
          created_at: string
          deleted_at: string | null
          edited_at: string | null
          encryption_iv: string | null
          encryption_method: string | null
          file_name: string | null
          file_size: number | null
          file_url: string | null
          id: string
          is_encrypted: boolean | null
          message_type: string | null
          reply_to_id: string | null
          sender_id: string
          updated_at: string
        }
        Insert: {
          channel_id: string
          content: string
          created_at?: string
          deleted_at?: string | null
          edited_at?: string | null
          encryption_iv?: string | null
          encryption_method?: string | null
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          is_encrypted?: boolean | null
          message_type?: string | null
          reply_to_id?: string | null
          sender_id: string
          updated_at?: string
        }
        Update: {
          channel_id?: string
          content?: string
          created_at?: string
          deleted_at?: string | null
          edited_at?: string | null
          encryption_iv?: string | null
          encryption_method?: string | null
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          is_encrypted?: boolean | null
          message_type?: string | null
          reply_to_id?: string | null
          sender_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "channel_messages_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "channel_messages_reply_to_id_fkey"
            columns: ["reply_to_id"]
            isOneToOne: false
            referencedRelation: "channel_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "channel_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      channel_participants: {
        Row: {
          channel_id: string
          id: string
          is_muted: boolean | null
          joined_at: string
          last_read_at: string | null
          role: string | null
          user_id: string
        }
        Insert: {
          channel_id: string
          id?: string
          is_muted?: boolean | null
          joined_at?: string
          last_read_at?: string | null
          role?: string | null
          user_id: string
        }
        Update: {
          channel_id?: string
          id?: string
          is_muted?: boolean | null
          joined_at?: string
          last_read_at?: string | null
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "channel_participants_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
        ]
      }
      channel_settings: {
        Row: {
          allow_attachments: boolean | null
          allowed_file_types: string[] | null
          auto_delete_messages_after: number | null
          channel_id: string | null
          channel_rules: string | null
          created_at: string | null
          id: string
          max_attachment_size: number | null
          message_history_limit: number | null
          slow_mode_delay: number | null
          updated_at: string | null
          welcome_message: string | null
        }
        Insert: {
          allow_attachments?: boolean | null
          allowed_file_types?: string[] | null
          auto_delete_messages_after?: number | null
          channel_id?: string | null
          channel_rules?: string | null
          created_at?: string | null
          id?: string
          max_attachment_size?: number | null
          message_history_limit?: number | null
          slow_mode_delay?: number | null
          updated_at?: string | null
          welcome_message?: string | null
        }
        Update: {
          allow_attachments?: boolean | null
          allowed_file_types?: string[] | null
          auto_delete_messages_after?: number | null
          channel_id?: string | null
          channel_rules?: string | null
          created_at?: string | null
          id?: string
          max_attachment_size?: number | null
          message_history_limit?: number | null
          slow_mode_delay?: number | null
          updated_at?: string | null
          welcome_message?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "channel_settings_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: true
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
        ]
      }
      channel_typing: {
        Row: {
          channel_id: string
          started_at: string
          user_id: string
        }
        Insert: {
          channel_id: string
          started_at?: string
          user_id: string
        }
        Update: {
          channel_id?: string
          started_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "channel_typing_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      channels: {
        Row: {
          category: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_private: boolean | null
          name: string
          type: string | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_private?: boolean | null
          name: string
          type?: string | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_private?: boolean | null
          name?: string
          type?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      claude_code_file_operations: {
        Row: {
          commit_sha: string | null
          content_after: string | null
          content_before: string | null
          created_at: string
          file_path: string
          id: string
          metadata: Json | null
          old_file_path: string | null
          operation_type: string
          performed_by: string
          session_id: string
        }
        Insert: {
          commit_sha?: string | null
          content_after?: string | null
          content_before?: string | null
          created_at?: string
          file_path: string
          id?: string
          metadata?: Json | null
          old_file_path?: string | null
          operation_type: string
          performed_by?: string
          session_id: string
        }
        Update: {
          commit_sha?: string | null
          content_after?: string | null
          content_before?: string | null
          created_at?: string
          file_path?: string
          id?: string
          metadata?: Json | null
          old_file_path?: string | null
          operation_type?: string
          performed_by?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "claude_code_file_operations_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "claude_code_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      claude_code_messages: {
        Row: {
          content: string
          id: string
          message_id: string
          metadata: Json | null
          role: string
          session_id: string
          timestamp: string
        }
        Insert: {
          content: string
          id?: string
          message_id: string
          metadata?: Json | null
          role: string
          session_id: string
          timestamp?: string
        }
        Update: {
          content?: string
          id?: string
          message_id?: string
          metadata?: Json | null
          role?: string
          session_id?: string
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "claude_code_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "claude_code_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      claude_code_sessions: {
        Row: {
          created_at: string
          dev_server_port: number | null
          dev_server_url: string | null
          github_repo_full_name: string
          github_repo_id: number | null
          github_repo_name: string
          github_repo_url: string
          id: string
          last_activity: string
          metadata: Json | null
          project_path: string
          session_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dev_server_port?: number | null
          dev_server_url?: string | null
          github_repo_full_name: string
          github_repo_id?: number | null
          github_repo_name: string
          github_repo_url: string
          id?: string
          last_activity?: string
          metadata?: Json | null
          project_path: string
          session_id: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          dev_server_port?: number | null
          dev_server_url?: string | null
          github_repo_full_name?: string
          github_repo_id?: number | null
          github_repo_name?: string
          github_repo_url?: string
          id?: string
          last_activity?: string
          metadata?: Json | null
          project_path?: string
          session_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      community_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          update_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          update_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          update_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_comments_update_id_fkey"
            columns: ["update_id"]
            isOneToOne: false
            referencedRelation: "community_updates"
            referencedColumns: ["id"]
          },
        ]
      }
      community_likes: {
        Row: {
          created_at: string
          id: string
          update_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          update_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          update_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_likes_update_id_fkey"
            columns: ["update_id"]
            isOneToOne: false
            referencedRelation: "community_updates"
            referencedColumns: ["id"]
          },
        ]
      }
      community_updates: {
        Row: {
          bot_name: string | null
          comments_count: number | null
          content: string
          created_at: string
          downvote_count: number | null
          id: string
          image_url: string | null
          is_bot_reply: boolean | null
          likes_count: number | null
          reply_to_id: string | null
          updated_at: string
          upvote_count: number | null
          user_id: string
          video_download_url: string | null
          video_job_id: string | null
          video_status: string | null
          video_url: string | null
          views_count: number | null
          week_number: number | null
        }
        Insert: {
          bot_name?: string | null
          comments_count?: number | null
          content: string
          created_at?: string
          downvote_count?: number | null
          id?: string
          image_url?: string | null
          is_bot_reply?: boolean | null
          likes_count?: number | null
          reply_to_id?: string | null
          updated_at?: string
          upvote_count?: number | null
          user_id: string
          video_download_url?: string | null
          video_job_id?: string | null
          video_status?: string | null
          video_url?: string | null
          views_count?: number | null
          week_number?: number | null
        }
        Update: {
          bot_name?: string | null
          comments_count?: number | null
          content?: string
          created_at?: string
          downvote_count?: number | null
          id?: string
          image_url?: string | null
          is_bot_reply?: boolean | null
          likes_count?: number | null
          reply_to_id?: string | null
          updated_at?: string
          upvote_count?: number | null
          user_id?: string
          video_download_url?: string | null
          video_job_id?: string | null
          video_status?: string | null
          video_url?: string | null
          views_count?: number | null
          week_number?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "community_updates_reply_to_id_fkey"
            columns: ["reply_to_id"]
            isOneToOne: false
            referencedRelation: "community_updates"
            referencedColumns: ["id"]
          },
        ]
      }
      community_votes: {
        Row: {
          created_at: string
          id: string
          update_id: string
          updated_at: string
          user_id: string
          vote_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          update_id: string
          updated_at?: string
          user_id: string
          vote_type: string
        }
        Update: {
          created_at?: string
          id?: string
          update_id?: string
          updated_at?: string
          user_id?: string
          vote_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_votes_update_id_fkey"
            columns: ["update_id"]
            isOneToOne: false
            referencedRelation: "community_updates"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          industry: string | null
          invite_code: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          updated_at: string
          website: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          industry?: string | null
          invite_code?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          industry?: string | null
          invite_code?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      company_members: {
        Row: {
          company_id: string
          id: string
          is_active: boolean | null
          joined_at: string
          user_id: string
        }
        Insert: {
          company_id: string
          id?: string
          is_active?: boolean | null
          joined_at?: string
          user_id: string
        }
        Update: {
          company_id?: string
          id?: string
          is_active?: boolean | null
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_members_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      content_reports: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          moderator_id: string | null
          moderator_notes: string | null
          reported_update_id: string | null
          reported_user_id: string | null
          reporter_id: string
          status: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          moderator_id?: string | null
          moderator_notes?: string | null
          reported_update_id?: string | null
          reported_user_id?: string | null
          reporter_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          moderator_id?: string | null
          moderator_notes?: string | null
          reported_update_id?: string | null
          reported_user_id?: string | null
          reporter_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_reports_reported_update_id_fkey"
            columns: ["reported_update_id"]
            isOneToOne: false
            referencedRelation: "community_updates"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_attachments: {
        Row: {
          created_at: string | null
          duration: number | null
          file_name: string
          file_size: number
          file_type: string
          file_url: string
          height: number | null
          id: string
          message_id: string | null
          mime_type: string | null
          thumbnail_url: string | null
          updated_at: string | null
          uploaded_by: string | null
          width: number | null
        }
        Insert: {
          created_at?: string | null
          duration?: number | null
          file_name: string
          file_size: number
          file_type: string
          file_url: string
          height?: number | null
          id?: string
          message_id?: string | null
          mime_type?: string | null
          thumbnail_url?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
          width?: number | null
        }
        Update: {
          created_at?: string | null
          duration?: number | null
          file_name?: string
          file_size?: number
          file_type?: string
          file_url?: string
          height?: number | null
          id?: string
          message_id?: string | null
          mime_type?: string | null
          thumbnail_url?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "conversation_attachments_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_backups: {
        Row: {
          backup_data: Json
          backup_type: string | null
          conversation_id: string
          created_at: string
          expires_at: string | null
          id: string
          message_count: number | null
          participant_count: number | null
        }
        Insert: {
          backup_data: Json
          backup_type?: string | null
          conversation_id: string
          created_at?: string
          expires_at?: string | null
          id?: string
          message_count?: number | null
          participant_count?: number | null
        }
        Update: {
          backup_data?: Json
          backup_type?: string | null
          conversation_id?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          message_count?: number | null
          participant_count?: number | null
        }
        Relationships: []
      }
      conversation_memory: {
        Row: {
          conversation_summary: string | null
          created_at: string | null
          id: string
          interaction_context: Json | null
          interaction_count: number | null
          key_topics: string[] | null
          last_interaction: string | null
          mentioned_projects: string[] | null
          personality_insights: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          conversation_summary?: string | null
          created_at?: string | null
          id?: string
          interaction_context?: Json | null
          interaction_count?: number | null
          key_topics?: string[] | null
          last_interaction?: string | null
          mentioned_projects?: string[] | null
          personality_insights?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          conversation_summary?: string | null
          created_at?: string | null
          id?: string
          interaction_context?: Json | null
          interaction_count?: number | null
          key_topics?: string[] | null
          last_interaction?: string | null
          mentioned_projects?: string[] | null
          personality_insights?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversation_memory_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          id: string
          is_active: boolean | null
          is_muted: boolean | null
          joined_at: string
          last_read_at: string
          role: string | null
          user_id: string
        }
        Insert: {
          conversation_id: string
          id?: string
          is_active?: boolean | null
          is_muted?: boolean | null
          joined_at?: string
          last_read_at?: string
          role?: string | null
          user_id: string
        }
        Update: {
          conversation_id?: string
          id?: string
          is_active?: boolean | null
          is_muted?: boolean | null
          joined_at?: string
          last_read_at?: string
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_reactions: {
        Row: {
          created_at: string | null
          emoji: string
          emoji_unicode: string | null
          id: string
          message_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          emoji: string
          emoji_unicode?: string | null
          id?: string
          message_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          emoji?: string
          emoji_unicode?: string | null
          id?: string
          message_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversation_reactions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          avatar_url: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_group: boolean | null
          last_message_at: string
          name: string | null
          title: string | null
          type: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_group?: boolean | null
          last_message_at?: string
          name?: string | null
          title?: string | null
          type?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_group?: boolean | null
          last_message_at?: string
          name?: string | null
          title?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          address: string | null
          created_at: string | null
          email: string
          first_name: string
          id: string
          last_name: string
          phone: string | null
          profile_id: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          email: string
          first_name: string
          id?: string
          last_name: string
          phone?: string | null
          profile_id?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          phone?: string | null
          profile_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      daily_analytics_summary: {
        Row: {
          avg_lead_score: number | null
          bounce_rate: number | null
          campaigns_created: number | null
          click_rate: number | null
          created_at: string | null
          date: string
          emails_bounced: number | null
          emails_clicked: number | null
          emails_opened: number | null
          emails_replied: number | null
          emails_sent: number | null
          id: string
          leads_discovered: number | null
          leads_enriched: number | null
          open_rate: number | null
          response_rate: number | null
          searches_performed: number | null
          time_spent_minutes: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avg_lead_score?: number | null
          bounce_rate?: number | null
          campaigns_created?: number | null
          click_rate?: number | null
          created_at?: string | null
          date: string
          emails_bounced?: number | null
          emails_clicked?: number | null
          emails_opened?: number | null
          emails_replied?: number | null
          emails_sent?: number | null
          id?: string
          leads_discovered?: number | null
          leads_enriched?: number | null
          open_rate?: number | null
          response_rate?: number | null
          searches_performed?: number | null
          time_spent_minutes?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avg_lead_score?: number | null
          bounce_rate?: number | null
          campaigns_created?: number | null
          click_rate?: number | null
          created_at?: string | null
          date?: string
          emails_bounced?: number | null
          emails_clicked?: number | null
          emails_opened?: number | null
          emails_replied?: number | null
          emails_sent?: number | null
          id?: string
          leads_discovered?: number | null
          leads_enriched?: number | null
          open_rate?: number | null
          response_rate?: number | null
          searches_performed?: number | null
          time_spent_minutes?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      daily_goals: {
        Row: {
          created_at: string | null
          date: string
          goal_met: boolean | null
          id: string
          pomodoro_goal: number | null
          pomodoros_completed: number | null
          task_goal: number | null
          tasks_completed: number | null
          user_id: string | null
          xp_earned: number | null
          xp_goal: number | null
        }
        Insert: {
          created_at?: string | null
          date: string
          goal_met?: boolean | null
          id?: string
          pomodoro_goal?: number | null
          pomodoros_completed?: number | null
          task_goal?: number | null
          tasks_completed?: number | null
          user_id?: string | null
          xp_earned?: number | null
          xp_goal?: number | null
        }
        Update: {
          created_at?: string | null
          date?: string
          goal_met?: boolean | null
          id?: string
          pomodoro_goal?: number | null
          pomodoros_completed?: number | null
          task_goal?: number | null
          tasks_completed?: number | null
          user_id?: string | null
          xp_earned?: number | null
          xp_goal?: number | null
        }
        Relationships: []
      }
      daily_nutrition_summary: {
        Row: {
          calcium_mg: number | null
          carbohydrates_g: number | null
          created_at: string | null
          date: string
          fat_total_g: number | null
          fiber_g: number | null
          id: string
          iron_mg: number | null
          items_count: number | null
          last_computed_at: string | null
          magnesium_mg: number | null
          meals_count: number | null
          potassium_mg: number | null
          protein_g: number | null
          saturated_fat_g: number | null
          sodium_mg: number | null
          sugar_g: number | null
          total_calories: number | null
          total_water_ml: number | null
          user_id: string
          vitamin_a_mcg: number | null
          vitamin_b12_mcg: number | null
          vitamin_c_mg: number | null
          vitamin_d_mcg: number | null
        }
        Insert: {
          calcium_mg?: number | null
          carbohydrates_g?: number | null
          created_at?: string | null
          date: string
          fat_total_g?: number | null
          fiber_g?: number | null
          id?: string
          iron_mg?: number | null
          items_count?: number | null
          last_computed_at?: string | null
          magnesium_mg?: number | null
          meals_count?: number | null
          potassium_mg?: number | null
          protein_g?: number | null
          saturated_fat_g?: number | null
          sodium_mg?: number | null
          sugar_g?: number | null
          total_calories?: number | null
          total_water_ml?: number | null
          user_id: string
          vitamin_a_mcg?: number | null
          vitamin_b12_mcg?: number | null
          vitamin_c_mg?: number | null
          vitamin_d_mcg?: number | null
        }
        Update: {
          calcium_mg?: number | null
          carbohydrates_g?: number | null
          created_at?: string | null
          date?: string
          fat_total_g?: number | null
          fiber_g?: number | null
          id?: string
          iron_mg?: number | null
          items_count?: number | null
          last_computed_at?: string | null
          magnesium_mg?: number | null
          meals_count?: number | null
          potassium_mg?: number | null
          protein_g?: number | null
          saturated_fat_g?: number | null
          sodium_mg?: number | null
          sugar_g?: number | null
          total_calories?: number | null
          total_water_ml?: number | null
          user_id?: string
          vitamin_a_mcg?: number | null
          vitamin_b12_mcg?: number | null
          vitamin_c_mg?: number | null
          vitamin_d_mcg?: number | null
        }
        Relationships: []
      }
      daily_squads: {
        Row: {
          channel_id: string | null
          created_at: string
          current_participants: number | null
          expires_at: string
          id: string
          max_participants: number | null
          squad_date: string
          squad_name: string
          status: string | null
        }
        Insert: {
          channel_id?: string | null
          created_at?: string
          current_participants?: number | null
          expires_at?: string
          id?: string
          max_participants?: number | null
          squad_date?: string
          squad_name: string
          status?: string | null
        }
        Update: {
          channel_id?: string | null
          created_at?: string
          current_participants?: number | null
          expires_at?: string
          id?: string
          max_participants?: number | null
          squad_date?: string
          squad_name?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_squads_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_tasks: {
        Row: {
          ai_generated: boolean | null
          completed_at: string | null
          created_at: string
          day_number: number
          description: string | null
          due_date: string | null
          id: string
          priority: number | null
          status: Database["public"]["Enums"]["task_status"] | null
          title: string
          updated_at: string
          user_id: string
          week_number: number
        }
        Insert: {
          ai_generated?: boolean | null
          completed_at?: string | null
          created_at?: string
          day_number: number
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: number | null
          status?: Database["public"]["Enums"]["task_status"] | null
          title: string
          updated_at?: string
          user_id: string
          week_number: number
        }
        Update: {
          ai_generated?: boolean | null
          completed_at?: string | null
          created_at?: string
          day_number?: number
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: number | null
          status?: Database["public"]["Enums"]["task_status"] | null
          title?: string
          updated_at?: string
          user_id?: string
          week_number?: number
        }
        Relationships: []
      }
      daily_videos: {
        Row: {
          ai_insights: Json | null
          created_at: string
          day_number: number
          description: string | null
          duration_seconds: number | null
          id: string
          mood_score: number | null
          processing_status: string | null
          thumbnail_url: string | null
          title: string
          transcript: string | null
          updated_at: string
          user_id: string
          video_url: string | null
          week_number: number
        }
        Insert: {
          ai_insights?: Json | null
          created_at?: string
          day_number: number
          description?: string | null
          duration_seconds?: number | null
          id?: string
          mood_score?: number | null
          processing_status?: string | null
          thumbnail_url?: string | null
          title: string
          transcript?: string | null
          updated_at?: string
          user_id: string
          video_url?: string | null
          week_number: number
        }
        Update: {
          ai_insights?: Json | null
          created_at?: string
          day_number?: number
          description?: string | null
          duration_seconds?: number | null
          id?: string
          mood_score?: number | null
          processing_status?: string | null
          thumbnail_url?: string | null
          title?: string
          transcript?: string | null
          updated_at?: string
          user_id?: string
          video_url?: string | null
          week_number?: number
        }
        Relationships: []
      }
      dev_container_logs: {
        Row: {
          container_id: string
          id: string
          log_level: string | null
          message: string
          project_id: string
          timestamp: string | null
        }
        Insert: {
          container_id: string
          id?: string
          log_level?: string | null
          message: string
          project_id: string
          timestamp?: string | null
        }
        Update: {
          container_id?: string
          id?: string
          log_level?: string | null
          message?: string
          project_id?: string
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dev_container_logs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "dev_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      dev_project_changes: {
        Row: {
          applied_at: string | null
          changes: Json
          id: string
          project_id: string
          user_id: string
        }
        Insert: {
          applied_at?: string | null
          changes: Json
          id?: string
          project_id: string
          user_id: string
        }
        Update: {
          applied_at?: string | null
          changes?: Json
          id?: string
          project_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dev_project_changes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "dev_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      dev_project_chats: {
        Row: {
          created_at: string | null
          id: string
          message: string
          message_type: string | null
          project_id: string
          response: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          message_type?: string | null
          project_id: string
          response?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          message_type?: string | null
          project_id?: string
          response?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dev_project_chats_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "dev_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      dev_project_files: {
        Row: {
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          last_modified: string | null
          project_id: string
        }
        Insert: {
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          last_modified?: string | null
          project_id: string
        }
        Update: {
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          last_modified?: string | null
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dev_project_files_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "dev_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      dev_projects: {
        Row: {
          container_id: string | null
          container_port: number | null
          created_at: string | null
          github_url: string | null
          id: string
          repo_name: string
          repo_path: string
          status: string | null
          template: string | null
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          container_id?: string | null
          container_port?: number | null
          created_at?: string | null
          github_url?: string | null
          id?: string
          repo_name: string
          repo_path: string
          status?: string | null
          template?: string | null
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          container_id?: string | null
          container_port?: number | null
          created_at?: string | null
          github_url?: string | null
          id?: string
          repo_name?: string
          repo_path?: string
          status?: string | null
          template?: string | null
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      dev_server_instances: {
        Row: {
          environment_vars: Json | null
          error_message: string | null
          framework_type: string | null
          id: string
          metadata: Json | null
          port: number
          process_id: number | null
          session_id: string
          start_command: string
          started_at: string
          status: string
          stopped_at: string | null
          url: string
        }
        Insert: {
          environment_vars?: Json | null
          error_message?: string | null
          framework_type?: string | null
          id?: string
          metadata?: Json | null
          port: number
          process_id?: number | null
          session_id: string
          start_command: string
          started_at?: string
          status?: string
          stopped_at?: string | null
          url: string
        }
        Update: {
          environment_vars?: Json | null
          error_message?: string | null
          framework_type?: string | null
          id?: string
          metadata?: Json | null
          port?: number
          process_id?: number | null
          session_id?: string
          start_command?: string
          started_at?: string
          status?: string
          stopped_at?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "dev_server_instances_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "claude_code_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      device_types: {
        Row: {
          brand: string
          category: string
          created_at: string | null
          id: string
          model: string
          name: string
          updated_at: string | null
        }
        Insert: {
          brand: string
          category: string
          created_at?: string | null
          id?: string
          model: string
          name: string
          updated_at?: string | null
        }
        Update: {
          brand?: string
          category?: string
          created_at?: string | null
          id?: string
          model?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      email_activities: {
        Row: {
          bounced_at: string | null
          campaign_id: string | null
          click_count: number | null
          clicked_at: string | null
          created_at: string | null
          delivered_at: string | null
          email_body: string | null
          generation_log_id: string | null
          id: string
          ip_address: unknown
          lead_id: string | null
          message_id: string | null
          open_count: number | null
          opened_at: string | null
          personalization_score: number | null
          replied_at: string | null
          response_content: string | null
          response_sentiment: string | null
          response_type: string | null
          sent_at: string | null
          sent_from: string | null
          subject: string | null
          template_id: string | null
          thread_id: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          bounced_at?: string | null
          campaign_id?: string | null
          click_count?: number | null
          clicked_at?: string | null
          created_at?: string | null
          delivered_at?: string | null
          email_body?: string | null
          generation_log_id?: string | null
          id?: string
          ip_address?: unknown
          lead_id?: string | null
          message_id?: string | null
          open_count?: number | null
          opened_at?: string | null
          personalization_score?: number | null
          replied_at?: string | null
          response_content?: string | null
          response_sentiment?: string | null
          response_type?: string | null
          sent_at?: string | null
          sent_from?: string | null
          subject?: string | null
          template_id?: string | null
          thread_id?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          bounced_at?: string | null
          campaign_id?: string | null
          click_count?: number | null
          clicked_at?: string | null
          created_at?: string | null
          delivered_at?: string | null
          email_body?: string | null
          generation_log_id?: string | null
          id?: string
          ip_address?: unknown
          lead_id?: string | null
          message_id?: string | null
          open_count?: number | null
          opened_at?: string | null
          personalization_score?: number | null
          replied_at?: string | null
          response_content?: string | null
          response_sentiment?: string | null
          response_type?: string | null
          sent_at?: string | null
          sent_from?: string | null
          subject?: string | null
          template_id?: string | null
          thread_id?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_activities_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "email_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_activities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "outreach_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      email_campaigns: {
        Row: {
          bounce_rate: number | null
          campaign_type: string
          click_rate: number | null
          completed_at: string | null
          created_at: string | null
          description: string | null
          emails_bounced: number | null
          emails_clicked: number | null
          emails_opened: number | null
          emails_replied: number | null
          emails_sent: number | null
          follow_up_sequence: Json | null
          id: string
          name: string
          open_rate: number | null
          personalization_level: string | null
          response_rate: number | null
          send_delay_hours: number | null
          started_at: string | null
          status: string | null
          template_id: string | null
          total_leads: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          bounce_rate?: number | null
          campaign_type: string
          click_rate?: number | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          emails_bounced?: number | null
          emails_clicked?: number | null
          emails_opened?: number | null
          emails_replied?: number | null
          emails_sent?: number | null
          follow_up_sequence?: Json | null
          id?: string
          name: string
          open_rate?: number | null
          personalization_level?: string | null
          response_rate?: number | null
          send_delay_hours?: number | null
          started_at?: string | null
          status?: string | null
          template_id?: string | null
          total_leads?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          bounce_rate?: number | null
          campaign_type?: string
          click_rate?: number | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          emails_bounced?: number | null
          emails_clicked?: number | null
          emails_opened?: number | null
          emails_replied?: number | null
          emails_sent?: number | null
          follow_up_sequence?: Json | null
          id?: string
          name?: string
          open_rate?: number | null
          personalization_level?: string | null
          response_rate?: number | null
          send_delay_hours?: number | null
          started_at?: string | null
          status?: string | null
          template_id?: string | null
          total_leads?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      email_generation_logs: {
        Row: {
          created_at: string | null
          error_message: string | null
          generation_method: string | null
          id: string
          success: boolean | null
          template_used: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          generation_method?: string | null
          id?: string
          success?: boolean | null
          template_used?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          generation_method?: string | null
          id?: string
          success?: boolean | null
          template_used?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          body_template: string
          category: string | null
          created_at: string | null
          id: string
          name: string
          subject_template: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          body_template: string
          category?: string | null
          created_at?: string | null
          id?: string
          name: string
          subject_template: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          body_template?: string
          category?: string | null
          created_at?: string | null
          id?: string
          name?: string
          subject_template?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      file_backups: {
        Row: {
          backed_up_by: string | null
          backup_file_path: string
          backup_type: string | null
          bucket_name: string
          checksum: string | null
          content_type: string | null
          created_at: string
          file_size: number | null
          id: string
          metadata: Json | null
          original_file_path: string
        }
        Insert: {
          backed_up_by?: string | null
          backup_file_path: string
          backup_type?: string | null
          bucket_name: string
          checksum?: string | null
          content_type?: string | null
          created_at?: string
          file_size?: number | null
          id?: string
          metadata?: Json | null
          original_file_path: string
        }
        Update: {
          backed_up_by?: string | null
          backup_file_path?: string
          backup_type?: string | null
          bucket_name?: string
          checksum?: string | null
          content_type?: string | null
          created_at?: string
          file_size?: number | null
          id?: string
          metadata?: Json | null
          original_file_path?: string
        }
        Relationships: []
      }
      focus_categories: {
        Row: {
          color: string
          created_at: string | null
          emoji: string
          id: string
          name: string
          user_id: string | null
        }
        Insert: {
          color?: string
          created_at?: string | null
          emoji: string
          id?: string
          name: string
          user_id?: string | null
        }
        Update: {
          color?: string
          created_at?: string | null
          emoji?: string
          id?: string
          name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      food_item_nutrition: {
        Row: {
          calcium_mg: number | null
          calories: number | null
          carbohydrates_g: number | null
          cholesterol_mg: number | null
          confidence_score: number | null
          copper_mg: number | null
          created_at: string | null
          estimated_weight_g: number | null
          fat_total_g: number | null
          fiber_g: number | null
          food_name: string
          id: string
          iodine_mcg: number | null
          iron_mg: number | null
          log_entry_id: string
          magnesium_mg: number | null
          manganese_mg: number | null
          monounsaturated_fat_g: number | null
          phosphorus_mg: number | null
          polyunsaturated_fat_g: number | null
          potassium_mg: number | null
          protein_g: number | null
          quantity: string
          saturated_fat_g: number | null
          selenium_mcg: number | null
          sodium_mg: number | null
          sugar_g: number | null
          trans_fat_g: number | null
          user_id: string | null
          vitamin_a_mcg: number | null
          vitamin_b1_thiamine_mg: number | null
          vitamin_b12_mcg: number | null
          vitamin_b2_riboflavin_mg: number | null
          vitamin_b3_niacin_mg: number | null
          vitamin_b5_pantothenic_acid_mg: number | null
          vitamin_b6_mg: number | null
          vitamin_b7_biotin_mcg: number | null
          vitamin_b9_folate_mcg: number | null
          vitamin_c_mg: number | null
          vitamin_d_mcg: number | null
          vitamin_e_mg: number | null
          vitamin_k_mcg: number | null
          water_content_ml: number | null
          zinc_mg: number | null
        }
        Insert: {
          calcium_mg?: number | null
          calories?: number | null
          carbohydrates_g?: number | null
          cholesterol_mg?: number | null
          confidence_score?: number | null
          copper_mg?: number | null
          created_at?: string | null
          estimated_weight_g?: number | null
          fat_total_g?: number | null
          fiber_g?: number | null
          food_name: string
          id?: string
          iodine_mcg?: number | null
          iron_mg?: number | null
          log_entry_id: string
          magnesium_mg?: number | null
          manganese_mg?: number | null
          monounsaturated_fat_g?: number | null
          phosphorus_mg?: number | null
          polyunsaturated_fat_g?: number | null
          potassium_mg?: number | null
          protein_g?: number | null
          quantity: string
          saturated_fat_g?: number | null
          selenium_mcg?: number | null
          sodium_mg?: number | null
          sugar_g?: number | null
          trans_fat_g?: number | null
          user_id?: string | null
          vitamin_a_mcg?: number | null
          vitamin_b1_thiamine_mg?: number | null
          vitamin_b12_mcg?: number | null
          vitamin_b2_riboflavin_mg?: number | null
          vitamin_b3_niacin_mg?: number | null
          vitamin_b5_pantothenic_acid_mg?: number | null
          vitamin_b6_mg?: number | null
          vitamin_b7_biotin_mcg?: number | null
          vitamin_b9_folate_mcg?: number | null
          vitamin_c_mg?: number | null
          vitamin_d_mcg?: number | null
          vitamin_e_mg?: number | null
          vitamin_k_mcg?: number | null
          water_content_ml?: number | null
          zinc_mg?: number | null
        }
        Update: {
          calcium_mg?: number | null
          calories?: number | null
          carbohydrates_g?: number | null
          cholesterol_mg?: number | null
          confidence_score?: number | null
          copper_mg?: number | null
          created_at?: string | null
          estimated_weight_g?: number | null
          fat_total_g?: number | null
          fiber_g?: number | null
          food_name?: string
          id?: string
          iodine_mcg?: number | null
          iron_mg?: number | null
          log_entry_id?: string
          magnesium_mg?: number | null
          manganese_mg?: number | null
          monounsaturated_fat_g?: number | null
          phosphorus_mg?: number | null
          polyunsaturated_fat_g?: number | null
          potassium_mg?: number | null
          protein_g?: number | null
          quantity?: string
          saturated_fat_g?: number | null
          selenium_mcg?: number | null
          sodium_mg?: number | null
          sugar_g?: number | null
          trans_fat_g?: number | null
          user_id?: string | null
          vitamin_a_mcg?: number | null
          vitamin_b1_thiamine_mg?: number | null
          vitamin_b12_mcg?: number | null
          vitamin_b2_riboflavin_mg?: number | null
          vitamin_b3_niacin_mg?: number | null
          vitamin_b5_pantothenic_acid_mg?: number | null
          vitamin_b6_mg?: number | null
          vitamin_b7_biotin_mcg?: number | null
          vitamin_b9_folate_mcg?: number | null
          vitamin_c_mg?: number | null
          vitamin_d_mcg?: number | null
          vitamin_e_mg?: number | null
          vitamin_k_mcg?: number | null
          water_content_ml?: number | null
          zinc_mg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "food_item_nutrition_log_entry_id_fkey"
            columns: ["log_entry_id"]
            isOneToOne: false
            referencedRelation: "log_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_bookmarks: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_bookmarks_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_categories: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          order_index: number | null
          slug: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          order_index?: number | null
          slug: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          order_index?: number | null
          slug?: string
        }
        Relationships: []
      }
      forum_comments: {
        Row: {
          content: string
          created_at: string | null
          edited_at: string | null
          id: string
          is_edited: boolean | null
          parent_comment_id: string | null
          post_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          edited_at?: string | null
          id?: string
          is_edited?: boolean | null
          parent_comment_id?: string | null
          post_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          edited_at?: string | null
          id?: string
          is_edited?: boolean | null
          parent_comment_id?: string | null
          post_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "forum_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_notifications: {
        Row: {
          comment_id: string | null
          created_at: string | null
          from_user_id: string | null
          id: string
          is_read: boolean | null
          message: string | null
          post_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          comment_id?: string | null
          created_at?: string | null
          from_user_id?: string | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          post_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          comment_id?: string | null
          created_at?: string | null
          from_user_id?: string | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          post_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_notifications_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "forum_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_notifications_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_posts: {
        Row: {
          category_id: string | null
          content: string
          created_at: string | null
          edited_at: string | null
          id: string
          is_featured: boolean | null
          is_locked: boolean | null
          is_pinned: boolean | null
          slug: string
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          user_id: string
          views: number | null
        }
        Insert: {
          category_id?: string | null
          content: string
          created_at?: string | null
          edited_at?: string | null
          id?: string
          is_featured?: boolean | null
          is_locked?: boolean | null
          is_pinned?: boolean | null
          slug: string
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          user_id: string
          views?: number | null
        }
        Update: {
          category_id?: string | null
          content?: string
          created_at?: string | null
          edited_at?: string | null
          id?: string
          is_featured?: boolean | null
          is_locked?: boolean | null
          is_pinned?: boolean | null
          slug?: string
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "forum_posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "forum_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_reactions: {
        Row: {
          comment_id: string | null
          created_at: string | null
          id: string
          post_id: string | null
          reaction_type: string
          user_id: string
        }
        Insert: {
          comment_id?: string | null
          created_at?: string | null
          id?: string
          post_id?: string | null
          reaction_type?: string
          user_id: string
        }
        Update: {
          comment_id?: string | null
          created_at?: string | null
          id?: string
          post_id?: string | null
          reaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_reactions_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "forum_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_reactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      github_sessions: {
        Row: {
          access_token: string
          created_at: string | null
          github_user_id: number
          github_username: string
          id: number
          session_id: string
        }
        Insert: {
          access_token: string
          created_at?: string | null
          github_user_id: number
          github_username: string
          id?: number
          session_id: string
        }
        Update: {
          access_token?: string
          created_at?: string | null
          github_user_id?: number
          github_username?: string
          id?: number
          session_id?: string
        }
        Relationships: []
      }
      gmail_connections: {
        Row: {
          connected_account_id: string | null
          connection_request_id: string | null
          created_at: string | null
          id: string
          redirect_url: string | null
          status: string
          updated_at: string | null
          user_email: string
          user_id: string
        }
        Insert: {
          connected_account_id?: string | null
          connection_request_id?: string | null
          created_at?: string | null
          id?: string
          redirect_url?: string | null
          status?: string
          updated_at?: string | null
          user_email: string
          user_id: string
        }
        Update: {
          connected_account_id?: string | null
          connection_request_id?: string | null
          created_at?: string | null
          id?: string
          redirect_url?: string | null
          status?: string
          updated_at?: string | null
          user_email?: string
          user_id?: string
        }
        Relationships: []
      }
      goal_milestones: {
        Row: {
          completed: boolean | null
          created_at: string | null
          description: string | null
          goal_id: string | null
          id: string
          progress: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          description?: string | null
          goal_id?: string | null
          id?: string
          progress?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          completed?: boolean | null
          created_at?: string | null
          description?: string | null
          goal_id?: string | null
          id?: string
          progress?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "goal_milestones_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      goal_tasks: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          content: string
          created_at: string | null
          description: string | null
          due_date: string | null
          goal_id: string | null
          id: string
          linked_log_id: string | null
          log_id: string | null
          priority: string | null
          status: string | null
          subtasks: Json | null
          tags: string[] | null
          task_order: number | null
          time_estimate: Json | null
          updated_at: string | null
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          content: string
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          goal_id?: string | null
          id?: string
          linked_log_id?: string | null
          log_id?: string | null
          priority?: string | null
          status?: string | null
          subtasks?: Json | null
          tags?: string[] | null
          task_order?: number | null
          time_estimate?: Json | null
          updated_at?: string | null
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          content?: string
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          goal_id?: string | null
          id?: string
          linked_log_id?: string | null
          log_id?: string | null
          priority?: string | null
          status?: string | null
          subtasks?: Json | null
          tags?: string[] | null
          task_order?: number | null
          time_estimate?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "goal_tasks_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          category: string | null
          completed_at: string | null
          created_at: string | null
          current_streak: number | null
          current_value: number | null
          description: string
          goal_type: string
          icon: string | null
          id: string
          last_analysis: Json | null
          last_analyzed: string | null
          predicted_completion: string | null
          progress: number | null
          status: string | null
          tags: string[] | null
          target_date: string | null
          target_streak: number | null
          target_value: number | null
          time_logged: number | null
          time_target: number | null
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          category?: string | null
          completed_at?: string | null
          created_at?: string | null
          current_streak?: number | null
          current_value?: number | null
          description: string
          goal_type: string
          icon?: string | null
          id?: string
          last_analysis?: Json | null
          last_analyzed?: string | null
          predicted_completion?: string | null
          progress?: number | null
          status?: string | null
          tags?: string[] | null
          target_date?: string | null
          target_streak?: number | null
          target_value?: number | null
          time_logged?: number | null
          time_target?: number | null
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          category?: string | null
          completed_at?: string | null
          created_at?: string | null
          current_streak?: number | null
          current_value?: number | null
          description?: string
          goal_type?: string
          icon?: string | null
          id?: string
          last_analysis?: Json | null
          last_analyzed?: string | null
          predicted_completion?: string | null
          progress?: number | null
          status?: string | null
          tags?: string[] | null
          target_date?: string | null
          target_streak?: number | null
          target_value?: number | null
          time_logged?: number | null
          time_target?: number | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      graphrag_edges: {
        Row: {
          created_at: string | null
          external_id: string | null
          id: string
          source: string
          target: string
          type: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          external_id?: string | null
          id?: string
          source: string
          target: string
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          external_id?: string | null
          id?: string
          source?: string
          target?: string
          type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "graphrag_edges_source_fkey"
            columns: ["source"]
            isOneToOne: false
            referencedRelation: "graphrag_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "graphrag_edges_target_fkey"
            columns: ["target"]
            isOneToOne: false
            referencedRelation: "graphrag_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      graphrag_nodes: {
        Row: {
          content: string
          created_at: string | null
          embedding: string | null
          external_id: string | null
          id: string
          node_type: string | null
          properties: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          embedding?: string | null
          external_id?: string | null
          id?: string
          node_type?: string | null
          properties?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          embedding?: string | null
          external_id?: string | null
          id?: string
          node_type?: string | null
          properties?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "graphrag_nodes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_search_analytics: {
        Row: {
          avg_lead_quality: number | null
          created_at: string | null
          id: string
          last_searched: string | null
          leads_found: number | null
          query: string
          search_objective: string | null
          total_searches: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avg_lead_quality?: number | null
          created_at?: string | null
          id?: string
          last_searched?: string | null
          leads_found?: number | null
          query: string
          search_objective?: string | null
          total_searches?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avg_lead_quality?: number | null
          created_at?: string | null
          id?: string
          last_searched?: string | null
          leads_found?: number | null
          query?: string
          search_objective?: string | null
          total_searches?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      leaderboard_cache: {
        Row: {
          avatar_url: string | null
          country: string | null
          current_streak: number | null
          global_rank: number | null
          id: string
          monthly_xp: number | null
          title: string | null
          total_xp: number | null
          updated_at: string | null
          user_id: string | null
          username: string
          weekly_xp: number | null
        }
        Insert: {
          avatar_url?: string | null
          country?: string | null
          current_streak?: number | null
          global_rank?: number | null
          id?: string
          monthly_xp?: number | null
          title?: string | null
          total_xp?: number | null
          updated_at?: string | null
          user_id?: string | null
          username: string
          weekly_xp?: number | null
        }
        Update: {
          avatar_url?: string | null
          country?: string | null
          current_streak?: number | null
          global_rank?: number | null
          id?: string
          monthly_xp?: number | null
          title?: string | null
          total_xp?: number | null
          updated_at?: string | null
          user_id?: string | null
          username?: string
          weekly_xp?: number | null
        }
        Relationships: []
      }
      log_entries: {
        Row: {
          confidence_score: number | null
          created_at: string
          deleted_at: string | null
          edit_count: number | null
          id: string
          last_edited_at: string | null
          parsed_data: Json | null
          photo_urls: Json | null
          raw_text: string
          timestamp: string
          type: string
          updated_at: string
          user_id: string
          water_ml: number | null
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          deleted_at?: string | null
          edit_count?: number | null
          id?: string
          last_edited_at?: string | null
          parsed_data?: Json | null
          photo_urls?: Json | null
          raw_text: string
          timestamp?: string
          type: string
          updated_at?: string
          user_id: string
          water_ml?: number | null
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          deleted_at?: string | null
          edit_count?: number | null
          id?: string
          last_edited_at?: string | null
          parsed_data?: Json | null
          photo_urls?: Json | null
          raw_text?: string
          timestamp?: string
          type?: string
          updated_at?: string
          user_id?: string
          water_ml?: number | null
        }
        Relationships: []
      }
      logs: {
        Row: {
          ai_confidence: number | null
          content: string
          created_at: string | null
          duration: number
          end_time: string
          id: string
          phase: string
          start_time: string
          task_category: string | null
          task_description: string | null
          task_tags: string[] | null
          task_title: string | null
          tasks: Json | null
          user_id: string | null
        }
        Insert: {
          ai_confidence?: number | null
          content: string
          created_at?: string | null
          duration: number
          end_time: string
          id?: string
          phase: string
          start_time: string
          task_category?: string | null
          task_description?: string | null
          task_tags?: string[] | null
          task_title?: string | null
          tasks?: Json | null
          user_id?: string | null
        }
        Update: {
          ai_confidence?: number | null
          content?: string
          created_at?: string | null
          duration?: number
          end_time?: string
          id?: string
          phase?: string
          start_time?: string
          task_category?: string | null
          task_description?: string | null
          task_tags?: string[] | null
          task_title?: string | null
          tasks?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      meal_templates: {
        Row: {
          created_at: string | null
          description: string | null
          estimated_calories: number | null
          estimated_protein_g: number | null
          id: string
          is_favorite: boolean | null
          last_used_at: string | null
          meal_text: string
          name: string
          updated_at: string | null
          use_count: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          estimated_calories?: number | null
          estimated_protein_g?: number | null
          id?: string
          is_favorite?: boolean | null
          last_used_at?: string | null
          meal_text: string
          name: string
          updated_at?: string | null
          use_count?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          estimated_calories?: number | null
          estimated_protein_g?: number | null
          id?: string
          is_favorite?: boolean | null
          last_used_at?: string | null
          meal_text?: string
          name?: string
          updated_at?: string | null
          use_count?: number | null
          user_id?: string
        }
        Relationships: []
      }
      message_attachments: {
        Row: {
          created_at: string | null
          duration: number | null
          file_name: string
          file_size: number
          file_type: string
          file_url: string
          height: number | null
          id: string
          message_id: string | null
          mime_type: string | null
          thumbnail_url: string | null
          updated_at: string | null
          uploaded_by: string | null
          width: number | null
        }
        Insert: {
          created_at?: string | null
          duration?: number | null
          file_name: string
          file_size: number
          file_type: string
          file_url: string
          height?: number | null
          id?: string
          message_id?: string | null
          mime_type?: string | null
          thumbnail_url?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
          width?: number | null
        }
        Update: {
          created_at?: string | null
          duration?: number | null
          file_name?: string
          file_size?: number
          file_type?: string
          file_url?: string
          height?: number | null
          id?: string
          message_id?: string | null
          mime_type?: string | null
          thumbnail_url?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "message_attachments_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "channel_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      message_history: {
        Row: {
          content: string | null
          created_at: string
          edit_reason: string | null
          edited_by: string | null
          id: string
          message_id: string
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          created_at?: string
          edit_reason?: string | null
          edited_by?: string | null
          id?: string
          message_id: string
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          created_at?: string
          edit_reason?: string | null
          edited_by?: string | null
          id?: string
          message_id?: string
          metadata?: Json | null
        }
        Relationships: []
      }
      message_reactions: {
        Row: {
          created_at: string
          emoji: string
          id: string
          message_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          emoji: string
          id?: string
          message_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          emoji?: string
          id?: string
          message_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_reactions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      message_read_receipts: {
        Row: {
          id: string
          message_id: string
          read_at: string
          user_id: string
        }
        Insert: {
          id?: string
          message_id: string
          read_at?: string
          user_id: string
        }
        Update: {
          id?: string
          message_id?: string
          read_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_read_receipts_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      message_threads: {
        Row: {
          child_message_id: string | null
          created_at: string | null
          id: string
          parent_message_id: string | null
          thread_depth: number | null
        }
        Insert: {
          child_message_id?: string | null
          created_at?: string | null
          id?: string
          parent_message_id?: string | null
          thread_depth?: number | null
        }
        Update: {
          child_message_id?: string | null
          created_at?: string | null
          id?: string
          parent_message_id?: string | null
          thread_depth?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "message_threads_child_message_id_fkey"
            columns: ["child_message_id"]
            isOneToOne: false
            referencedRelation: "channel_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_threads_parent_message_id_fkey"
            columns: ["parent_message_id"]
            isOneToOne: false
            referencedRelation: "channel_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          deleted_at: string | null
          edited_at: string | null
          encryption_iv: string | null
          encryption_method: string | null
          file_name: string | null
          file_size: number | null
          file_url: string | null
          id: string
          is_deleted: boolean | null
          is_edited: boolean | null
          is_encrypted: boolean | null
          message_type: string | null
          reply_to_id: string | null
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          deleted_at?: string | null
          edited_at?: string | null
          encryption_iv?: string | null
          encryption_method?: string | null
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          is_deleted?: boolean | null
          is_edited?: boolean | null
          is_encrypted?: boolean | null
          message_type?: string | null
          reply_to_id?: string | null
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          deleted_at?: string | null
          edited_at?: string | null
          encryption_iv?: string | null
          encryption_method?: string | null
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          is_deleted?: boolean | null
          is_edited?: boolean | null
          is_encrypted?: boolean | null
          message_type?: string | null
          reply_to_id?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_reply_to_id_fkey"
            columns: ["reply_to_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      moderation_actions: {
        Row: {
          action_type: string
          created_at: string
          id: string
          moderator_id: string
          notes: string | null
          reason: string
          target_id: string
          target_type: string
        }
        Insert: {
          action_type: string
          created_at?: string
          id?: string
          moderator_id: string
          notes?: string | null
          reason: string
          target_id: string
          target_type: string
        }
        Update: {
          action_type?: string
          created_at?: string
          id?: string
          moderator_id?: string
          notes?: string | null
          reason?: string
          target_id?: string
          target_type?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          created_at: string | null
          email_enabled: boolean | null
          id: string
          push_enabled: boolean | null
          quiet_hours_enabled: boolean | null
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          sms_enabled: boolean | null
          sms_mention_notifications: boolean | null
          sms_message_notifications: boolean | null
          sms_reply_notifications: boolean | null
          sms_system_notifications: boolean | null
          timezone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email_enabled?: boolean | null
          id?: string
          push_enabled?: boolean | null
          quiet_hours_enabled?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          sms_enabled?: boolean | null
          sms_mention_notifications?: boolean | null
          sms_message_notifications?: boolean | null
          sms_reply_notifications?: boolean | null
          sms_system_notifications?: boolean | null
          timezone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email_enabled?: boolean | null
          id?: string
          push_enabled?: boolean | null
          quiet_hours_enabled?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          sms_enabled?: boolean | null
          sms_mention_notifications?: boolean | null
          sms_message_notifications?: boolean | null
          sms_reply_notifications?: boolean | null
          sms_system_notifications?: boolean | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          read_at: string | null
          sender_id: string | null
          source_id: string | null
          source_type: string | null
          title: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          read_at?: string | null
          sender_id?: string | null
          source_id?: string | null
          source_type?: string | null
          title: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          read_at?: string | null
          sender_id?: string | null
          source_id?: string | null
          source_type?: string | null
          title?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      nutrition_data: {
        Row: {
          ai_model_used: string | null
          calcium_mg: number | null
          carbohydrates_g: number | null
          cholesterol_mg: number | null
          confidence_score: number | null
          copper_mg: number | null
          created_at: string | null
          fat_total_g: number | null
          fiber_g: number | null
          id: string
          iodine_mcg: number | null
          iron_mg: number | null
          log_entry_id: string
          magnesium_mg: number | null
          manganese_mg: number | null
          monounsaturated_fat_g: number | null
          phosphorus_mg: number | null
          polyunsaturated_fat_g: number | null
          potassium_mg: number | null
          protein_g: number | null
          saturated_fat_g: number | null
          selenium_mcg: number | null
          sodium_mg: number | null
          sugar_g: number | null
          total_calories: number | null
          total_water_content_ml: number | null
          trans_fat_g: number | null
          updated_at: string | null
          user_id: string | null
          vitamin_a_mcg: number | null
          vitamin_b1_thiamine_mg: number | null
          vitamin_b12_mcg: number | null
          vitamin_b2_riboflavin_mg: number | null
          vitamin_b3_niacin_mg: number | null
          vitamin_b5_pantothenic_acid_mg: number | null
          vitamin_b6_mg: number | null
          vitamin_b7_biotin_mcg: number | null
          vitamin_b9_folate_mcg: number | null
          vitamin_c_mg: number | null
          vitamin_d_mcg: number | null
          vitamin_e_mg: number | null
          vitamin_k_mcg: number | null
          zinc_mg: number | null
        }
        Insert: {
          ai_model_used?: string | null
          calcium_mg?: number | null
          carbohydrates_g?: number | null
          cholesterol_mg?: number | null
          confidence_score?: number | null
          copper_mg?: number | null
          created_at?: string | null
          fat_total_g?: number | null
          fiber_g?: number | null
          id?: string
          iodine_mcg?: number | null
          iron_mg?: number | null
          log_entry_id: string
          magnesium_mg?: number | null
          manganese_mg?: number | null
          monounsaturated_fat_g?: number | null
          phosphorus_mg?: number | null
          polyunsaturated_fat_g?: number | null
          potassium_mg?: number | null
          protein_g?: number | null
          saturated_fat_g?: number | null
          selenium_mcg?: number | null
          sodium_mg?: number | null
          sugar_g?: number | null
          total_calories?: number | null
          total_water_content_ml?: number | null
          trans_fat_g?: number | null
          updated_at?: string | null
          user_id?: string | null
          vitamin_a_mcg?: number | null
          vitamin_b1_thiamine_mg?: number | null
          vitamin_b12_mcg?: number | null
          vitamin_b2_riboflavin_mg?: number | null
          vitamin_b3_niacin_mg?: number | null
          vitamin_b5_pantothenic_acid_mg?: number | null
          vitamin_b6_mg?: number | null
          vitamin_b7_biotin_mcg?: number | null
          vitamin_b9_folate_mcg?: number | null
          vitamin_c_mg?: number | null
          vitamin_d_mcg?: number | null
          vitamin_e_mg?: number | null
          vitamin_k_mcg?: number | null
          zinc_mg?: number | null
        }
        Update: {
          ai_model_used?: string | null
          calcium_mg?: number | null
          carbohydrates_g?: number | null
          cholesterol_mg?: number | null
          confidence_score?: number | null
          copper_mg?: number | null
          created_at?: string | null
          fat_total_g?: number | null
          fiber_g?: number | null
          id?: string
          iodine_mcg?: number | null
          iron_mg?: number | null
          log_entry_id?: string
          magnesium_mg?: number | null
          manganese_mg?: number | null
          monounsaturated_fat_g?: number | null
          phosphorus_mg?: number | null
          polyunsaturated_fat_g?: number | null
          potassium_mg?: number | null
          protein_g?: number | null
          saturated_fat_g?: number | null
          selenium_mcg?: number | null
          sodium_mg?: number | null
          sugar_g?: number | null
          total_calories?: number | null
          total_water_content_ml?: number | null
          trans_fat_g?: number | null
          updated_at?: string | null
          user_id?: string | null
          vitamin_a_mcg?: number | null
          vitamin_b1_thiamine_mg?: number | null
          vitamin_b12_mcg?: number | null
          vitamin_b2_riboflavin_mg?: number | null
          vitamin_b3_niacin_mg?: number | null
          vitamin_b5_pantothenic_acid_mg?: number | null
          vitamin_b6_mg?: number | null
          vitamin_b7_biotin_mcg?: number | null
          vitamin_b9_folate_mcg?: number | null
          vitamin_c_mg?: number | null
          vitamin_d_mcg?: number | null
          vitamin_e_mg?: number | null
          vitamin_k_mcg?: number | null
          zinc_mg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "nutrition_data_log_entry_id_fkey"
            columns: ["log_entry_id"]
            isOneToOne: true
            referencedRelation: "log_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      outreach_campaigns: {
        Row: {
          created_at: string | null
          description: string | null
          emails_sent: number | null
          id: string
          leads_found: number | null
          name: string
          responses_received: number | null
          status: string | null
          target_criteria: Json | null
          template_name: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          emails_sent?: number | null
          id?: string
          leads_found?: number | null
          name: string
          responses_received?: number | null
          status?: string | null
          target_criteria?: Json | null
          template_name?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          emails_sent?: number | null
          id?: string
          leads_found?: number | null
          name?: string
          responses_received?: number | null
          status?: string | null
          target_criteria?: Json | null
          template_name?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      outreach_drafts: {
        Row: {
          body: string
          campaign_type: string | null
          created_at: string | null
          email_method: string | null
          id: string
          lead_id: string | null
          personalization_data: Json | null
          personalization_level: string | null
          sendgrid_message_id: string | null
          status: string | null
          subject: string
          template_name: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          body: string
          campaign_type?: string | null
          created_at?: string | null
          email_method?: string | null
          id?: string
          lead_id?: string | null
          personalization_data?: Json | null
          personalization_level?: string | null
          sendgrid_message_id?: string | null
          status?: string | null
          subject: string
          template_name?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          body?: string
          campaign_type?: string | null
          created_at?: string | null
          email_method?: string | null
          id?: string
          lead_id?: string | null
          personalization_data?: Json | null
          personalization_level?: string | null
          sendgrid_message_id?: string | null
          status?: string | null
          subject?: string
          template_name?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "outreach_drafts_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "outreach_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      outreach_events: {
        Row: {
          draft_id: string | null
          event_type: string
          id: string
          lead_id: string | null
          metadata: Json | null
          sendgrid_event_id: string | null
          timestamp: string | null
        }
        Insert: {
          draft_id?: string | null
          event_type: string
          id?: string
          lead_id?: string | null
          metadata?: Json | null
          sendgrid_event_id?: string | null
          timestamp?: string | null
        }
        Update: {
          draft_id?: string | null
          event_type?: string
          id?: string
          lead_id?: string | null
          metadata?: Json | null
          sendgrid_event_id?: string | null
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "outreach_events_draft_id_fkey"
            columns: ["draft_id"]
            isOneToOne: false
            referencedRelation: "outreach_drafts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "outreach_events_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "outreach_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      outreach_leads: {
        Row: {
          clado_lead_id: string | null
          company: string | null
          created_at: string | null
          email: string | null
          id: string
          industry: string | null
          lead_score: number | null
          linkedin_url: string | null
          location: string | null
          matched_on: string | null
          name: string
          needs_email: boolean | null
          phone: string | null
          source: string | null
          status: string | null
          title: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          clado_lead_id?: string | null
          company?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          industry?: string | null
          lead_score?: number | null
          linkedin_url?: string | null
          location?: string | null
          matched_on?: string | null
          name: string
          needs_email?: boolean | null
          phone?: string | null
          source?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          clado_lead_id?: string | null
          company?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          industry?: string | null
          lead_score?: number | null
          linkedin_url?: string | null
          location?: string | null
          matched_on?: string | null
          name?: string
          needs_email?: boolean | null
          phone?: string | null
          source?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      photos: {
        Row: {
          created_at: string
          id: string
          metadata: Json | null
          storage_path: string
          thumbnail_url: string | null
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json | null
          storage_path: string
          thumbnail_url?: string | null
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json | null
          storage_path?: string
          thumbnail_url?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      pinned_messages: {
        Row: {
          channel_id: string
          created_at: string
          id: string
          message_id: string
          pinned_at: string
          pinned_by: string
          reason: string | null
        }
        Insert: {
          channel_id: string
          created_at?: string
          id?: string
          message_id: string
          pinned_at?: string
          pinned_by: string
          reason?: string | null
        }
        Update: {
          channel_id?: string
          created_at?: string
          id?: string
          message_id?: string
          pinned_at?: string
          pinned_by?: string
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_pinned_messages_pinned_by"
            columns: ["pinned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "pinned_messages_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: true
            referencedRelation: "channel_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      privacy_settings: {
        Row: {
          allow_direct_messages: boolean | null
          allow_group_invites: boolean | null
          allow_typing_indicators: boolean | null
          block_unknown_users: boolean | null
          blocked_users: string[] | null
          created_at: string | null
          data_retention_days: number | null
          id: string
          message_encryption: boolean | null
          online_status_visible: boolean | null
          profile_visibility: string | null
          read_receipts: boolean | null
          show_online_status: boolean | null
          show_read_receipts: boolean | null
          trusted_devices: Json | null
          two_factor_enabled: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          allow_direct_messages?: boolean | null
          allow_group_invites?: boolean | null
          allow_typing_indicators?: boolean | null
          block_unknown_users?: boolean | null
          blocked_users?: string[] | null
          created_at?: string | null
          data_retention_days?: number | null
          id?: string
          message_encryption?: boolean | null
          online_status_visible?: boolean | null
          profile_visibility?: string | null
          read_receipts?: boolean | null
          show_online_status?: boolean | null
          show_read_receipts?: boolean | null
          trusted_devices?: Json | null
          two_factor_enabled?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          allow_direct_messages?: boolean | null
          allow_group_invites?: boolean | null
          allow_typing_indicators?: boolean | null
          block_unknown_users?: boolean | null
          blocked_users?: string[] | null
          created_at?: string | null
          data_retention_days?: number | null
          id?: string
          message_encryption?: boolean | null
          online_status_visible?: boolean | null
          profile_visibility?: string | null
          read_receipts?: boolean | null
          show_online_status?: boolean | null
          show_read_receipts?: boolean | null
          trusted_devices?: Json | null
          two_factor_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          build_streak: number | null
          cohort_number: number | null
          company_id: string | null
          country_code: string | null
          created_at: string
          current_phase: Database["public"]["Enums"]["program_phase"] | null
          current_startup_idea: string | null
          current_week: number | null
          daily_commitment_hours: number | null
          daily_streak: number | null
          display_name: string | null
          education: Json | null
          email: string | null
          experience: Json | null
          experience_level: string | null
          github_access_token: string | null
          github_avatar_url: string | null
          github_connected: boolean | null
          github_email: string | null
          github_name: string | null
          github_username: string | null
          goals: string[] | null
          help_needed: string[] | null
          id: string
          last_active: string | null
          last_activity_date: string | null
          last_profile_sync: string | null
          linkedin_id: string | null
          linkedin_url: string | null
          linkedin_verified: boolean | null
          onboarding_completed: boolean | null
          phone_number: string | null
          phone_verified: boolean | null
          profile_enrichment_source: string | null
          skills: Json | null
          streak: number | null
          timezone: string | null
          total_points: number | null
          updated_at: string
          user_id: string
          water_goal_ml: number | null
          weekly_goal: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          build_streak?: number | null
          cohort_number?: number | null
          company_id?: string | null
          country_code?: string | null
          created_at?: string
          current_phase?: Database["public"]["Enums"]["program_phase"] | null
          current_startup_idea?: string | null
          current_week?: number | null
          daily_commitment_hours?: number | null
          daily_streak?: number | null
          display_name?: string | null
          education?: Json | null
          email?: string | null
          experience?: Json | null
          experience_level?: string | null
          github_access_token?: string | null
          github_avatar_url?: string | null
          github_connected?: boolean | null
          github_email?: string | null
          github_name?: string | null
          github_username?: string | null
          goals?: string[] | null
          help_needed?: string[] | null
          id?: string
          last_active?: string | null
          last_activity_date?: string | null
          last_profile_sync?: string | null
          linkedin_id?: string | null
          linkedin_url?: string | null
          linkedin_verified?: boolean | null
          onboarding_completed?: boolean | null
          phone_number?: string | null
          phone_verified?: boolean | null
          profile_enrichment_source?: string | null
          skills?: Json | null
          streak?: number | null
          timezone?: string | null
          total_points?: number | null
          updated_at?: string
          user_id: string
          water_goal_ml?: number | null
          weekly_goal?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          build_streak?: number | null
          cohort_number?: number | null
          company_id?: string | null
          country_code?: string | null
          created_at?: string
          current_phase?: Database["public"]["Enums"]["program_phase"] | null
          current_startup_idea?: string | null
          current_week?: number | null
          daily_commitment_hours?: number | null
          daily_streak?: number | null
          display_name?: string | null
          education?: Json | null
          email?: string | null
          experience?: Json | null
          experience_level?: string | null
          github_access_token?: string | null
          github_avatar_url?: string | null
          github_connected?: boolean | null
          github_email?: string | null
          github_name?: string | null
          github_username?: string | null
          goals?: string[] | null
          help_needed?: string[] | null
          id?: string
          last_active?: string | null
          last_activity_date?: string | null
          last_profile_sync?: string | null
          linkedin_id?: string | null
          linkedin_url?: string | null
          linkedin_verified?: boolean | null
          onboarding_completed?: boolean | null
          phone_number?: string | null
          phone_verified?: boolean | null
          profile_enrichment_source?: string | null
          skills?: Json | null
          streak?: number | null
          timezone?: string | null
          total_points?: number | null
          updated_at?: string
          user_id?: string
          water_goal_ml?: number | null
          weekly_goal?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      project_leaderboard: {
        Row: {
          created_at: string | null
          description: string | null
          difficulty: number | null
          id: number
          pace_score: number | null
          rank: number | null
          time_taken: number | null
          transcript: string | null
          updated_at: string | null
          user_id: string
          video_path: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          difficulty?: number | null
          id?: number
          pace_score?: number | null
          rank?: number | null
          time_taken?: number | null
          transcript?: string | null
          updated_at?: string | null
          user_id: string
          video_path?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          difficulty?: number | null
          id?: number
          pace_score?: number | null
          rank?: number | null
          time_taken?: number | null
          transcript?: string | null
          updated_at?: string | null
          user_id?: string
          video_path?: string | null
        }
        Relationships: []
      }
      referrals: {
        Row: {
          created_at: string | null
          id: string
          invite_code: string
          referred_id: string | null
          referred_user_active: boolean | null
          referrer_id: string | null
          xp_bonus_claimed: boolean | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          invite_code: string
          referred_id?: string | null
          referred_user_active?: boolean | null
          referrer_id?: string | null
          xp_bonus_claimed?: boolean | null
        }
        Update: {
          created_at?: string | null
          id?: string
          invite_code?: string
          referred_id?: string | null
          referred_user_active?: boolean | null
          referrer_id?: string | null
          xp_bonus_claimed?: boolean | null
        }
        Relationships: []
      }
      reflections: {
        Row: {
          active_goals: string[] | null
          created_at: string | null
          date: string
          energy_level: string
          id: string
          ignored_goals: string[] | null
          mood_trend: string
          next_week_focus: string[] | null
          progress_momentum: number
          stats: Json
          summary: string
          user_id: string
        }
        Insert: {
          active_goals?: string[] | null
          created_at?: string | null
          date: string
          energy_level: string
          id?: string
          ignored_goals?: string[] | null
          mood_trend: string
          next_week_focus?: string[] | null
          progress_momentum: number
          stats?: Json
          summary: string
          user_id: string
        }
        Update: {
          active_goals?: string[] | null
          created_at?: string | null
          date?: string
          energy_level?: string
          id?: string
          ignored_goals?: string[] | null
          mood_trend?: string
          next_week_focus?: string[] | null
          progress_momentum?: number
          stats?: Json
          summary?: string
          user_id?: string
        }
        Relationships: []
      }
      repair_status_history: {
        Row: {
          changed_by: string | null
          created_at: string | null
          id: string
          notes: string | null
          repair_id: string | null
          status: Database["public"]["Enums"]["repair_status"]
        }
        Insert: {
          changed_by?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          repair_id?: string | null
          status: Database["public"]["Enums"]["repair_status"]
        }
        Update: {
          changed_by?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          repair_id?: string | null
          status?: Database["public"]["Enums"]["repair_status"]
        }
        Relationships: [
          {
            foreignKeyName: "repair_status_history_repair_id_fkey"
            columns: ["repair_id"]
            isOneToOne: false
            referencedRelation: "repairs"
            referencedColumns: ["id"]
          },
        ]
      }
      repairs: {
        Row: {
          created_at: string | null
          customer_address: string | null
          customer_id: string
          delivery_method: Database["public"]["Enums"]["delivery_method"]
          device_description: string
          device_type_id: string | null
          estimated_completion: string | null
          estimated_cost: number | null
          final_cost: number | null
          id: string
          issue_description: string
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          photo_url: string | null
          priority: string | null
          serial_number: string | null
          status: Database["public"]["Enums"]["repair_status"] | null
          technician_notes: string | null
          ticket_number: string
          time_slot: string | null
          tracking_number: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_address?: string | null
          customer_id: string
          delivery_method?: Database["public"]["Enums"]["delivery_method"]
          device_description: string
          device_type_id?: string | null
          estimated_completion?: string | null
          estimated_cost?: number | null
          final_cost?: number | null
          id?: string
          issue_description: string
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          photo_url?: string | null
          priority?: string | null
          serial_number?: string | null
          status?: Database["public"]["Enums"]["repair_status"] | null
          technician_notes?: string | null
          ticket_number: string
          time_slot?: string | null
          tracking_number: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_address?: string | null
          customer_id?: string
          delivery_method?: Database["public"]["Enums"]["delivery_method"]
          device_description?: string
          device_type_id?: string | null
          estimated_completion?: string | null
          estimated_cost?: number | null
          final_cost?: number | null
          id?: string
          issue_description?: string
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          photo_url?: string | null
          priority?: string | null
          serial_number?: string | null
          status?: Database["public"]["Enums"]["repair_status"] | null
          technician_notes?: string | null
          ticket_number?: string
          time_slot?: string | null
          tracking_number?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "repairs_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "repairs_device_type_id_fkey"
            columns: ["device_type_id"]
            isOneToOne: false
            referencedRelation: "device_types"
            referencedColumns: ["id"]
          },
        ]
      }
      security_audit_log: {
        Row: {
          affected_rows: number | null
          created_at: string | null
          id: string
          ip_address: unknown
          operation_type: string
          table_name: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          affected_rows?: number | null
          created_at?: string | null
          id?: string
          ip_address?: unknown
          operation_type: string
          table_name: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          affected_rows?: number | null
          created_at?: string | null
          id?: string
          ip_address?: unknown
          operation_type?: string
          table_name?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      share_cards: {
        Row: {
          card_data: Json
          card_type: string | null
          created_at: string | null
          id: string
          image_url: string | null
          shares_count: number | null
          user_id: string | null
        }
        Insert: {
          card_data: Json
          card_type?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          shares_count?: number | null
          user_id?: string | null
        }
        Update: {
          card_data?: Json
          card_type?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          shares_count?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      squad_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          message_type: string | null
          squad_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          message_type?: string | null
          squad_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          message_type?: string | null
          squad_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "squad_messages_squad_id_fkey"
            columns: ["squad_id"]
            isOneToOne: false
            referencedRelation: "daily_squads"
            referencedColumns: ["id"]
          },
        ]
      }
      squad_participants: {
        Row: {
          id: string
          is_active: boolean | null
          joined_at: string
          squad_id: string
          user_id: string
        }
        Insert: {
          id?: string
          is_active?: boolean | null
          joined_at?: string
          squad_id: string
          user_id: string
        }
        Update: {
          id?: string
          is_active?: boolean | null
          joined_at?: string
          squad_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "squad_participants_squad_id_fkey"
            columns: ["squad_id"]
            isOneToOne: false
            referencedRelation: "daily_squads"
            referencedColumns: ["id"]
          },
        ]
      }
      squad_preferences: {
        Row: {
          created_at: string
          id: string
          notification_enabled: boolean | null
          opt_in: boolean | null
          preferred_squad_size: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notification_enabled?: boolean | null
          opt_in?: boolean | null
          preferred_squad_size?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notification_enabled?: boolean | null
          opt_in?: boolean | null
          preferred_squad_size?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      task_categories_stats: {
        Row: {
          category: string
          created_at: string
          id: string
          total_minutes: number | null
          total_sessions: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          total_minutes?: number | null
          total_sessions?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          total_minutes?: number | null
          total_sessions?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          category_id: string | null
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          duration_minutes: number | null
          id: string
          parsed_description: string | null
          raw_text: string
          user_id: string | null
          xp_earned: number | null
        }
        Insert: {
          category_id?: string | null
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          parsed_description?: string | null
          raw_text: string
          user_id?: string | null
          xp_earned?: number | null
        }
        Update: {
          category_id?: string | null
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          parsed_description?: string | null
          raw_text?: string
          user_id?: string | null
          xp_earned?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "focus_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_id: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements_tracking: {
        Row: {
          achievement_name: string
          achievement_type: string
          id: string
          unlocked_at: string | null
          user_id: string | null
          xp_reward: number
        }
        Insert: {
          achievement_name: string
          achievement_type: string
          id?: string
          unlocked_at?: string | null
          user_id?: string | null
          xp_reward: number
        }
        Update: {
          achievement_name?: string
          achievement_type?: string
          id?: string
          unlocked_at?: string | null
          user_id?: string | null
          xp_reward?: number
        }
        Relationships: []
      }
      user_challenges: {
        Row: {
          challenge_id: string | null
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          id: string
          progress: Json | null
          user_id: string | null
        }
        Insert: {
          challenge_id?: string | null
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          progress?: Json | null
          user_id?: string | null
        }
        Update: {
          challenge_id?: string | null
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          progress?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_challenges_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_embeddings: {
        Row: {
          content_id: string | null
          content_text: string
          content_type: string
          created_at: string | null
          embedding: string | null
          id: string
          metadata: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          content_id?: string | null
          content_text: string
          content_type: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          content_id?: string | null
          content_text?: string
          content_type?: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_embeddings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      user_friends: {
        Row: {
          addressee_id: string | null
          created_at: string | null
          id: string
          requester_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          addressee_id?: string | null
          created_at?: string | null
          id?: string
          requester_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          addressee_id?: string | null
          created_at?: string | null
          id?: string
          requester_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_nutrition_goals: {
        Row: {
          calories_goal: number | null
          carbs_goal_g: number | null
          created_at: string | null
          fat_goal_g: number | null
          fiber_goal_g: number | null
          protein_goal_g: number | null
          updated_at: string | null
          user_id: string
          water_goal_ml: number | null
        }
        Insert: {
          calories_goal?: number | null
          carbs_goal_g?: number | null
          created_at?: string | null
          fat_goal_g?: number | null
          fiber_goal_g?: number | null
          protein_goal_g?: number | null
          updated_at?: string | null
          user_id: string
          water_goal_ml?: number | null
        }
        Update: {
          calories_goal?: number | null
          carbs_goal_g?: number | null
          created_at?: string | null
          fat_goal_g?: number | null
          fiber_goal_g?: number | null
          protein_goal_g?: number | null
          updated_at?: string | null
          user_id?: string
          water_goal_ml?: number | null
        }
        Relationships: []
      }
      user_online_status: {
        Row: {
          is_online: boolean | null
          last_seen_at: string
          status: string | null
          status_message: string | null
          user_id: string
        }
        Insert: {
          is_online?: boolean | null
          last_seen_at?: string
          status?: string | null
          status_message?: string | null
          user_id: string
        }
        Update: {
          is_online?: boolean | null
          last_seen_at?: string
          status?: string | null
          status_message?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          calories_goal: number | null
          carbs_goal_g: number | null
          count_food_water_in_hydration: boolean | null
          created_at: string | null
          default_portion_size: string | null
          fat_goal_g: number | null
          notifications_enabled: boolean | null
          protein_goal_g: number | null
          theme: string | null
          updated_at: string | null
          user_id: string
          water_goal_ml: number | null
        }
        Insert: {
          calories_goal?: number | null
          carbs_goal_g?: number | null
          count_food_water_in_hydration?: boolean | null
          created_at?: string | null
          default_portion_size?: string | null
          fat_goal_g?: number | null
          notifications_enabled?: boolean | null
          protein_goal_g?: number | null
          theme?: string | null
          updated_at?: string | null
          user_id: string
          water_goal_ml?: number | null
        }
        Update: {
          calories_goal?: number | null
          carbs_goal_g?: number | null
          count_food_water_in_hydration?: boolean | null
          created_at?: string | null
          default_portion_size?: string | null
          fat_goal_g?: number | null
          notifications_enabled?: boolean | null
          protein_goal_g?: number | null
          theme?: string | null
          updated_at?: string | null
          user_id?: string
          water_goal_ml?: number | null
        }
        Relationships: []
      }
      user_presence: {
        Row: {
          custom_status: string | null
          is_mobile: boolean | null
          last_seen: string | null
          status: string | null
          status_emoji: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          custom_status?: string | null
          is_mobile?: boolean | null
          last_seen?: string | null
          status?: string | null
          status_emoji?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          custom_status?: string | null
          is_mobile?: boolean | null
          last_seen?: string | null
          status?: string | null
          status_emoji?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_streaks: {
        Row: {
          created_at: string | null
          current_streak: number | null
          grace_used: boolean | null
          id: string
          last_logged_date: string | null
          longest_streak: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          current_streak?: number | null
          grace_used?: boolean | null
          id?: string
          last_logged_date?: string | null
          longest_streak?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          current_streak?: number | null
          grace_used?: boolean | null
          id?: string
          last_logged_date?: string | null
          longest_streak?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_suspensions: {
        Row: {
          created_at: string
          duration_hours: number | null
          id: string
          is_active: boolean | null
          moderator_id: string
          reason: string
          suspended_until: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          duration_hours?: number | null
          id?: string
          is_active?: boolean | null
          moderator_id: string
          reason: string
          suspended_until?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          duration_hours?: number | null
          id?: string
          is_active?: boolean | null
          moderator_id?: string
          reason?: string
          suspended_until?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_xp: {
        Row: {
          created_at: string | null
          current_level_xp: number | null
          id: string
          last_updated: string | null
          level: number | null
          next_level_threshold: number | null
          recent_xp_gains: Json | null
          total_xp: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          current_level_xp?: number | null
          id?: string
          last_updated?: string | null
          level?: number | null
          next_level_threshold?: number | null
          recent_xp_gains?: Json | null
          total_xp?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          current_level_xp?: number | null
          id?: string
          last_updated?: string | null
          level?: number | null
          next_level_threshold?: number | null
          recent_xp_gains?: Json | null
          total_xp?: number | null
          updated_at?: string | null
          user_id?: string | null
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
          github_url: string | null
          headline: string | null
          id: string
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
          github_url?: string | null
          headline?: string | null
          id: string
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
          github_url?: string | null
          headline?: string | null
          id?: string
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
          years_of_experience?: number | null
        }
        Relationships: []
      }
      video_generations: {
        Row: {
          created_at: string | null
          creator_id: string
          description: string | null
          download_url: string | null
          duration: number | null
          error_message: string | null
          file_size: string | null
          id: string
          job_id: string
          media_urls: Json | null
          message: string | null
          progress: number | null
          prompt: string | null
          resolution: string | null
          script: string | null
          status: string | null
          thumbnail_url: string | null
          updated_at: string | null
          user_id: string | null
          video_url: string | null
        }
        Insert: {
          created_at?: string | null
          creator_id: string
          description?: string | null
          download_url?: string | null
          duration?: number | null
          error_message?: string | null
          file_size?: string | null
          id?: string
          job_id: string
          media_urls?: Json | null
          message?: string | null
          progress?: number | null
          prompt?: string | null
          resolution?: string | null
          script?: string | null
          status?: string | null
          thumbnail_url?: string | null
          updated_at?: string | null
          user_id?: string | null
          video_url?: string | null
        }
        Update: {
          created_at?: string | null
          creator_id?: string
          description?: string | null
          download_url?: string | null
          duration?: number | null
          error_message?: string | null
          file_size?: string | null
          id?: string
          job_id?: string
          media_urls?: Json | null
          message?: string | null
          progress?: number | null
          prompt?: string | null
          resolution?: string | null
          script?: string | null
          status?: string | null
          thumbnail_url?: string | null
          updated_at?: string | null
          user_id?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      video_transcriptions: {
        Row: {
          created_at: string
          description: string | null
          duration_seconds: number | null
          id: string
          language_code: string | null
          metadata: Json | null
          processed_at: string | null
          processing_status: string | null
          title: string | null
          transcript: string
          transcript_confidence: number | null
          updated_at: string
          user_id: string
          video_id: string | null
          video_url: string | null
          word_count: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_seconds?: number | null
          id?: string
          language_code?: string | null
          metadata?: Json | null
          processed_at?: string | null
          processing_status?: string | null
          title?: string | null
          transcript: string
          transcript_confidence?: number | null
          updated_at?: string
          user_id: string
          video_id?: string | null
          video_url?: string | null
          word_count?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_seconds?: number | null
          id?: string
          language_code?: string | null
          metadata?: Json | null
          processed_at?: string | null
          processing_status?: string | null
          title?: string | null
          transcript?: string
          transcript_confidence?: number | null
          updated_at?: string
          user_id?: string
          video_id?: string | null
          video_url?: string | null
          word_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "video_transcriptions_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "daily_videos"
            referencedColumns: ["id"]
          },
        ]
      }
      waitlist_entries: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          email: string
          id: string
          idea: string
          linkedin_url: string
          notes: string | null
          phone_number: string
          status: string | null
          updated_at: string | null
          waitlist_position: number | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          email: string
          id?: string
          idea: string
          linkedin_url: string
          notes?: string | null
          phone_number: string
          status?: string | null
          updated_at?: string | null
          waitlist_position?: number | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          email?: string
          id?: string
          idea?: string
          linkedin_url?: string
          notes?: string | null
          phone_number?: string
          status?: string | null
          updated_at?: string | null
          waitlist_position?: number | null
        }
        Relationships: []
      }
      weekly_calls: {
        Row: {
          cohort_number: number
          created_at: string
          description: string | null
          duration_minutes: number | null
          id: string
          meeting_url: string | null
          recording_url: string | null
          scheduled_at: string
          status: Database["public"]["Enums"]["call_status"] | null
          title: string
          updated_at: string
          week_number: number
        }
        Insert: {
          cohort_number: number
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          meeting_url?: string | null
          recording_url?: string | null
          scheduled_at: string
          status?: Database["public"]["Enums"]["call_status"] | null
          title: string
          updated_at?: string
          week_number: number
        }
        Update: {
          cohort_number?: number
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          meeting_url?: string | null
          recording_url?: string | null
          scheduled_at?: string
          status?: Database["public"]["Enums"]["call_status"] | null
          title?: string
          updated_at?: string
          week_number?: number
        }
        Relationships: []
      }
      weekly_progress: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          completion_percentage: number | null
          created_at: string
          id: string
          notes: string | null
          phase: Database["public"]["Enums"]["program_phase"]
          updated_at: string
          user_id: string
          week_number: number
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          completion_percentage?: number | null
          created_at?: string
          id?: string
          notes?: string | null
          phase: Database["public"]["Enums"]["program_phase"]
          updated_at?: string
          user_id: string
          week_number: number
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          completion_percentage?: number | null
          created_at?: string
          id?: string
          notes?: string | null
          phase?: Database["public"]["Enums"]["program_phase"]
          updated_at?: string
          user_id?: string
          week_number?: number
        }
        Relationships: []
      }
      xp_transactions: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          multiplier: number | null
          reason: string
          source_id: string | null
          source_type: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          multiplier?: number | null
          reason: string
          source_id?: string | null
          source_type?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          multiplier?: number | null
          reason?: string
          source_id?: string | null
          source_type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_user_to_public_channels: {
        Args: { user_id: string }
        Returns: undefined
      }
      archive_expired_squads: { Args: never; Returns: number }
      cleanup_expired_auth_states: { Args: never; Returns: undefined }
      cleanup_old_claude_sessions: { Args: never; Returns: undefined }
      create_daily_squads: { Args: never; Returns: number }
      create_notification: {
        Args: {
          p_content?: string
          p_metadata?: Json
          p_sender_id?: string
          p_source_id?: string
          p_source_type?: string
          p_title: string
          p_type: string
          p_user_id: string
        }
        Returns: string
      }
      generate_tracking_number: { Args: never; Returns: string }
      get_squad_members: {
        Args: { p_squad_id: string }
        Returns: {
          joined_at: string
          user_id: string
        }[]
      }
      get_user_current_squad: {
        Args: { p_user_id: string }
        Returns: {
          channel_id: string
          expires_at: string
          member_count: number
          squad_id: string
          squad_name: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_comments_count: {
        Args: { post_id: string }
        Returns: undefined
      }
      increment_views_count: { Args: { post_id: string }; Returns: undefined }
      is_squad_member: {
        Args: { p_squad_id: string; p_user_id: string }
        Returns: boolean
      }
      is_super_admin: { Args: never; Returns: boolean }
      match_graphrag_nodes: {
        Args: {
          match_count?: number
          match_threshold?: number
          query_embedding: string
          user_uuid?: string
        }
        Returns: {
          content: string
          id: string
          metadata: Json
          node_type: string
          similarity: number
          source_id: string
          source_table: string
        }[]
      }
      recalculate_waitlist_positions: { Args: never; Returns: undefined }
      upsert_graphrag_node: {
        Args: {
          p_content: string
          p_external_id: string
          p_node_type: string
          p_properties?: Json
          p_user_id?: string
        }
        Returns: string
      }
      user_can_access_conversation: {
        Args: { conversation_uuid: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "mentor" | "builder"
      call_status: "scheduled" | "in_progress" | "completed" | "cancelled"
      delivery_method: "dropoff" | "mailin"
      payment_status: "pending" | "partial" | "paid" | "refunded"
      program_phase: "ideation" | "validation" | "mvp" | "growth"
      repair_status:
        | "intake"
        | "diagnosis"
        | "waiting_parts"
        | "in_progress"
        | "testing"
        | "ready_pickup"
        | "completed"
        | "cancelled"
      task_status: "not_started" | "in_progress" | "completed"
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
      app_role: ["admin", "mentor", "builder"],
      call_status: ["scheduled", "in_progress", "completed", "cancelled"],
      delivery_method: ["dropoff", "mailin"],
      payment_status: ["pending", "partial", "paid", "refunded"],
      program_phase: ["ideation", "validation", "mvp", "growth"],
      repair_status: [
        "intake",
        "diagnosis",
        "waiting_parts",
        "in_progress",
        "testing",
        "ready_pickup",
        "completed",
        "cancelled",
      ],
      task_status: ["not_started", "in_progress", "completed"],
    },
  },
} as const
