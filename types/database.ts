export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      ai_interactions: {
        Row: {
          created_at: string;
          id: string;
          model: string | null;
          problem_id: string | null;
          request: Json | null;
          request_hash: string;
          response: string | null;
          tokens_in: number | null;
          tokens_out: number | null;
          type: string;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          model?: string | null;
          problem_id?: string | null;
          request?: Json | null;
          request_hash: string;
          response?: string | null;
          tokens_in?: number | null;
          tokens_out?: number | null;
          type: string;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          model?: string | null;
          problem_id?: string | null;
          request?: Json | null;
          request_hash?: string;
          response?: string | null;
          tokens_in?: number | null;
          tokens_out?: number | null;
          type?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "ai_interactions_problem_id_fkey";
            columns: ["problem_id"];
            isOneToOne: false;
            referencedRelation: "problems";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ai_interactions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      daily_problems: {
        Row: {
          created_at: string;
          date: string;
          id: string;
          language: string;
          mode: string;
          problem_id: string;
          reason: string | null;
          reroll_count: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          date: string;
          id?: string;
          language: string;
          mode?: string;
          problem_id: string;
          reason?: string | null;
          reroll_count?: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          date?: string;
          id?: string;
          language?: string;
          mode?: string;
          problem_id?: string;
          reason?: string | null;
          reroll_count?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "daily_problems_problem_id_fkey";
            columns: ["problem_id"];
            isOneToOne: false;
            referencedRelation: "problems";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "daily_problems_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      learning_history: {
        Row: {
          created_at: string;
          event_type: string;
          id: number;
          metadata: NonNullable<Json>;
          problem_id: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          event_type: string;
          id?: never;
          metadata?: NonNullable<Json>;
          problem_id?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string;
          event_type?: string;
          id?: never;
          metadata?: NonNullable<Json>;
          problem_id?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "learning_history_problem_id_fkey";
            columns: ["problem_id"];
            isOneToOne: false;
            referencedRelation: "problems";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "learning_history_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      problem_hints: {
        Row: {
          content: string;
          level: number;
          problem_id: string;
        };
        Insert: {
          content: string;
          level: number;
          problem_id: string;
        };
        Update: {
          content?: string;
          level?: number;
          problem_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "problem_hints_problem_id_fkey";
            columns: ["problem_id"];
            isOneToOne: false;
            referencedRelation: "problems";
            referencedColumns: ["id"];
          },
        ];
      };
      problem_solutions: {
        Row: {
          explanation: string;
          problem_id: string;
          reference_code: NonNullable<Json>;
          updated_at: string;
        };
        Insert: {
          explanation: string;
          problem_id: string;
          reference_code?: NonNullable<Json>;
          updated_at?: string;
        };
        Update: {
          explanation?: string;
          problem_id?: string;
          reference_code?: NonNullable<Json>;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "problem_solutions_problem_id_fkey";
            columns: ["problem_id"];
            isOneToOne: true;
            referencedRelation: "problems";
            referencedColumns: ["id"];
          },
        ];
      };
      problem_tags: {
        Row: {
          problem_id: string;
          tag: string;
          tag_type: string;
        };
        Insert: {
          problem_id: string;
          tag: string;
          tag_type: string;
        };
        Update: {
          problem_id?: string;
          tag?: string;
          tag_type?: string;
        };
        Relationships: [
          {
            foreignKeyName: "problem_tags_problem_id_fkey";
            columns: ["problem_id"];
            isOneToOne: false;
            referencedRelation: "problems";
            referencedColumns: ["id"];
          },
        ];
      };
      problems: {
        Row: {
          constraints: string;
          created_at: string;
          description: string;
          difficulty: number;
          estimated_minutes: number;
          examples: NonNullable<Json>;
          id: string;
          input: string;
          is_published: boolean;
          languages: string[];
          output: string;
          slug: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          constraints: string;
          created_at?: string;
          description: string;
          difficulty: number;
          estimated_minutes: number;
          examples?: NonNullable<Json>;
          id?: string;
          input: string;
          is_published?: boolean;
          languages: string[];
          output: string;
          slug: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          constraints?: string;
          created_at?: string;
          description?: string;
          difficulty?: number;
          estimated_minutes?: number;
          examples?: NonNullable<Json>;
          id?: string;
          input?: string;
          is_published?: boolean;
          languages?: string[];
          output?: string;
          slug?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          created_at: string;
          current_difficulty: number;
          id: string;
          last_study_date: string | null;
          longest_streak: number;
          streak: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          current_difficulty?: number;
          id: string;
          last_study_date?: string | null;
          longest_streak?: number;
          streak?: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          current_difficulty?: number;
          id?: string;
          last_study_date?: string | null;
          longest_streak?: number;
          streak?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      submissions: {
        Row: {
          ai_review_used: boolean;
          attempt_count: number;
          code: string;
          created_at: string;
          hint_count: number;
          id: string;
          judge_detail: Json | null;
          language: string;
          max_hint_level: number;
          problem_id: string;
          result: string;
          solution_revealed: boolean;
          solving_time_sec: number | null;
          user_id: string;
        };
        Insert: {
          ai_review_used?: boolean;
          attempt_count?: number;
          code: string;
          created_at?: string;
          hint_count?: number;
          id?: string;
          judge_detail?: Json | null;
          language: string;
          max_hint_level?: number;
          problem_id: string;
          result?: string;
          solution_revealed?: boolean;
          solving_time_sec?: number | null;
          user_id: string;
        };
        Update: {
          ai_review_used?: boolean;
          attempt_count?: number;
          code?: string;
          created_at?: string;
          hint_count?: number;
          id?: string;
          judge_detail?: Json | null;
          language?: string;
          max_hint_level?: number;
          problem_id?: string;
          result?: string;
          solution_revealed?: boolean;
          solving_time_sec?: number | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "submissions_problem_id_fkey";
            columns: ["problem_id"];
            isOneToOne: false;
            referencedRelation: "problems";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "submissions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      user_preferences: {
        Row: {
          java_ratio: number;
          preferred_difficulty: number | null;
          timezone: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          java_ratio?: number;
          preferred_difficulty?: number | null;
          timezone?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          java_ratio?: number;
          preferred_difficulty?: number | null;
          timezone?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_preferences_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      user_problem_progress: {
        Row: {
          attempts: number;
          first_solved_at: string | null;
          last_attempt_at: string | null;
          next_review_at: string | null;
          problem_id: string;
          status: string;
          user_id: string;
        };
        Insert: {
          attempts?: number;
          first_solved_at?: string | null;
          last_attempt_at?: string | null;
          next_review_at?: string | null;
          problem_id: string;
          status: string;
          user_id: string;
        };
        Update: {
          attempts?: number;
          first_solved_at?: string | null;
          last_attempt_at?: string | null;
          next_review_at?: string | null;
          problem_id?: string;
          status?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_problem_progress_problem_id_fkey";
            columns: ["problem_id"];
            isOneToOne: false;
            referencedRelation: "problems";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_problem_progress_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      user_skills: {
        Row: {
          attempts: number;
          category: string;
          correct: number;
          id: string;
          last_practiced_at: string | null;
          score: number;
          skill: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          attempts?: number;
          category: string;
          correct?: number;
          id?: string;
          last_practiced_at?: string | null;
          score?: number;
          skill: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          attempts?: number;
          category?: string;
          correct?: number;
          id?: string;
          last_practiced_at?: string | null;
          score?: number;
          skill?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_skills_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      dashboard_stats: { Args: Record<PropertyKey, never>; Returns: Json };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
