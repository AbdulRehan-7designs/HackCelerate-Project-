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
      ai_analyses: {
        Row: {
          alternative_categories: Json | null
          assigned_departments: string[] | null
          category_confidence: number | null
          created_at: string
          detected_patterns: Json | null
          duplicate_score: number | null
          estimated_response_time: number | null
          extracted_keywords: string[] | null
          id: string
          impact_assessment: string | null
          issue_id: string
          predicted_category: string | null
          priority_score: number
          resource_requirements: Json | null
          seasonal_factors: Json | null
          similar_issue_ids: string[] | null
          similarity_scores: Json | null
          trend_indicators: Json | null
          urgency_level: string | null
        }
        Insert: {
          alternative_categories?: Json | null
          assigned_departments?: string[] | null
          category_confidence?: number | null
          created_at?: string
          detected_patterns?: Json | null
          duplicate_score?: number | null
          estimated_response_time?: number | null
          extracted_keywords?: string[] | null
          id?: string
          impact_assessment?: string | null
          issue_id: string
          predicted_category?: string | null
          priority_score?: number
          resource_requirements?: Json | null
          seasonal_factors?: Json | null
          similar_issue_ids?: string[] | null
          similarity_scores?: Json | null
          trend_indicators?: Json | null
          urgency_level?: string | null
        }
        Update: {
          alternative_categories?: Json | null
          assigned_departments?: string[] | null
          category_confidence?: number | null
          created_at?: string
          detected_patterns?: Json | null
          duplicate_score?: number | null
          estimated_response_time?: number | null
          extracted_keywords?: string[] | null
          id?: string
          impact_assessment?: string | null
          issue_id?: string
          predicted_category?: string | null
          priority_score?: number
          resource_requirements?: Json | null
          seasonal_factors?: Json | null
          similar_issue_ids?: string[] | null
          similarity_scores?: Json | null
          trend_indicators?: Json | null
          urgency_level?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_analyses_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          comment_text: string
          created_at: string | null
          id: string
          issue_id: string | null
          user_id: string | null
        }
        Insert: {
          comment_text: string
          created_at?: string | null
          id?: string
          issue_id?: string | null
          user_id?: string | null
        }
        Update: {
          comment_text?: string
          created_at?: string | null
          id?: string
          issue_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
        ]
      }
      issue_trends: {
        Row: {
          area: string | null
          avg_resolution_time: number | null
          category: string | null
          created_at: string
          hotspot_coordinates: unknown[] | null
          id: string
          issue_count: number
          trend_data: Json | null
          trend_period: string
        }
        Insert: {
          area?: string | null
          avg_resolution_time?: number | null
          category?: string | null
          created_at?: string
          hotspot_coordinates?: unknown[] | null
          id?: string
          issue_count?: number
          trend_data?: Json | null
          trend_period: string
        }
        Update: {
          area?: string | null
          avg_resolution_time?: number | null
          category?: string | null
          created_at?: string
          hotspot_coordinates?: unknown[] | null
          id?: string
          issue_count?: number
          trend_data?: Json | null
          trend_period?: string
        }
        Relationships: []
      }
      issue_updates: {
        Row: {
          id: string
          issue_id: string | null
          status: string | null
          update_description: string | null
          updated_at: string | null
          updated_by: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          issue_id?: string | null
          status?: string | null
          update_description?: string | null
          updated_at?: string | null
          updated_by?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          issue_id?: string | null
          status?: string | null
          update_description?: string | null
          updated_at?: string | null
          updated_by?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "issue_updates_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
        ]
      }
      issues: {
        Row: {
          area: string
          blockchain_hash: string | null
          category: string
          coordinates: unknown
          created_at: string | null
          description: string
          id: string
          image_url: string | null
          location: string
          media_url: string | null
          resolved_at: string | null
          resolved_by: string | null
          severity: number
          status: string
          time_uploaded: string
          title: string
          user_id: string
          votes: number
        }
        Insert: {
          area?: string
          blockchain_hash?: string | null
          category: string
          coordinates: unknown
          created_at?: string | null
          description: string
          id?: string
          image_url?: string | null
          location: string
          media_url?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: number
          status?: string
          time_uploaded?: string
          title: string
          user_id: string
          votes?: number
        }
        Update: {
          area?: string
          blockchain_hash?: string | null
          category?: string
          coordinates?: unknown
          created_at?: string | null
          description?: string
          id?: string
          image_url?: string | null
          location?: string
          media_url?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: number
          status?: string
          time_uploaded?: string
          title?: string
          user_id?: string
          votes?: number
        }
        Relationships: [
          {
            foreignKeyName: "issues_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issues_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string
          id: string
          is_admin: boolean | null
          issues_reported: number | null
          issues_voted: number | null
          updated_at: string | null
          username: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name: string
          id: string
          is_admin?: boolean | null
          issues_reported?: number | null
          issues_voted?: number | null
          updated_at?: string | null
          username: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string
          id?: string
          is_admin?: boolean | null
          issues_reported?: number | null
          issues_voted?: number | null
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
      votes: {
        Row: {
          created_at: string | null
          id: string
          issue_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          issue_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          issue_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "votes_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_votes: {
        Args: { issue_id: string }
        Returns: undefined
      }
    }
    Enums: {
      issue_status:
        | "new"
        | "unverified"
        | "verified"
        | "in_progress"
        | "resolved"
        | "fake"
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
      issue_status: [
        "new",
        "unverified",
        "verified",
        "in_progress",
        "resolved",
        "fake",
      ],
    },
  },
} as const
