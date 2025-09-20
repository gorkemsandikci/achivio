import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.warn('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
}

if (!supabaseAnonKey) {
  console.warn('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
}

// Create Supabase client with fallback
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
  },
});

// Admin client for operations that need to bypass RLS
export const supabaseAdmin = supabaseServiceKey && supabaseUrl
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

// Database types (generated from your schema)
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          wallet_address: string;
          username: string;
          avatar_url: string;
          level: number;
          xp: number;
          total_xp: number;
          current_streak: number;
          longest_streak: number;
          last_activity_date: string;
          achiv_balance: number;
          total_earned_achiv: number;
          join_date: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          wallet_address: string;
          username?: string;
          avatar_url?: string;
          level?: number;
          xp?: number;
          total_xp?: number;
          current_streak?: number;
          longest_streak?: number;
          last_activity_date?: string;
          achiv_balance?: number;
          total_earned_achiv?: number;
          join_date?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          wallet_address?: string;
          username?: string;
          avatar_url?: string;
          level?: number;
          xp?: number;
          total_xp?: number;
          current_streak?: number;
          longest_streak?: number;
          last_activity_date?: string;
          achiv_balance?: number;
          total_earned_achiv?: number;
          join_date?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      task_categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          icon: string;
          color_gradient: string;
          description: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          icon: string;
          color_gradient: string;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          icon?: string;
          color_gradient?: string;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          title: string;
          description: string;
          category_id: string | null;
          difficulty: 'Easy' | 'Medium' | 'Hard';
          reward_achiv: number;
          reward_xp: number;
          time_estimate: string;
          icon: string;
          color_gradient: string;
          is_system_task: boolean;
          created_by: string | null;
          is_active: boolean;
          task_type: 'single' | 'progressive';
          max_progress: number;
          progress_unit: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          category_id?: string | null;
          difficulty?: 'Easy' | 'Medium' | 'Hard';
          reward_achiv?: number;
          reward_xp?: number;
          time_estimate?: string;
          icon?: string;
          color_gradient?: string;
          is_system_task?: boolean;
          created_by?: string | null;
          is_active?: boolean;
          task_type?: 'single' | 'progressive';
          max_progress?: number;
          progress_unit?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          category_id?: string | null;
          difficulty?: 'Easy' | 'Medium' | 'Hard';
          reward_achiv?: number;
          reward_xp?: number;
          time_estimate?: string;
          icon?: string;
          color_gradient?: string;
          is_system_task?: boolean;
          created_by?: string | null;
          is_active?: boolean;
          task_type?: 'single' | 'progressive';
          max_progress?: number;
          progress_unit?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_tasks: {
        Row: {
          id: string;
          user_id: string;
          task_id: string;
          current_streak: number;
          best_streak: number;
          total_completions: number;
          last_completed_at: string | null;
          is_active: boolean;
          added_at: string;
          daily_progress: number;
          last_progress_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          task_id: string;
          current_streak?: number;
          best_streak?: number;
          total_completions?: number;
          last_completed_at?: string | null;
          is_active?: boolean;
          added_at?: string;
          daily_progress?: number;
          last_progress_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          task_id?: string;
          current_streak?: number;
          best_streak?: number;
          total_completions?: number;
          last_completed_at?: string | null;
          is_active?: boolean;
          added_at?: string;
          daily_progress?: number;
          last_progress_at?: string | null;
        };
      };
      user_task_completions: {
        Row: {
          id: string;
          user_id: string;
          task_id: string;
          user_task_id: string;
          completed_at: string;
          achiv_earned: number;
          xp_earned: number;
          streak_at_completion: number;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          task_id: string;
          user_task_id: string;
          completed_at?: string;
          achiv_earned?: number;
          xp_earned?: number;
          streak_at_completion?: number;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          task_id?: string;
          user_task_id?: string;
          completed_at?: string;
          achiv_earned?: number;
          xp_earned?: number;
          streak_at_completion?: number;
          notes?: string | null;
          created_at?: string;
        };
      };
      badges: {
        Row: {
          id: string;
          name: string;
          description: string;
          rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
          image_url: string;
          color_gradient: string;
          unlock_condition: any; // JSONB
          unlock_rewards: any; // JSONB
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          rarity?: 'Common' | 'Rare' | 'Epic' | 'Legendary';
          image_url: string;
          color_gradient: string;
          unlock_condition: any;
          unlock_rewards?: any;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          rarity?: 'Common' | 'Rare' | 'Epic' | 'Legendary';
          image_url?: string;
          color_gradient?: string;
          unlock_condition?: any;
          unlock_rewards?: any;
          is_active?: boolean;
          created_at?: string;
        };
      };
      user_badges: {
        Row: {
          id: string;
          user_id: string;
          badge_id: string;
          earned_at: string;
          progress: number;
          max_progress: number;
          is_earned: boolean;
          is_minted: boolean;
          mint_transaction_id: string | null;
          minted_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          badge_id: string;
          earned_at?: string;
          progress?: number;
          max_progress?: number;
          is_earned?: boolean;
          is_minted?: boolean;
          mint_transaction_id?: string | null;
          minted_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          badge_id?: string;
          earned_at?: string;
          progress?: number;
          max_progress?: number;
          is_earned?: boolean;
          is_minted?: boolean;
          mint_transaction_id?: string | null;
          minted_at?: string | null;
          created_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          type: 'earned' | 'spent' | 'bonus' | 'penalty';
          amount: number;
          description: string;
          source_type: 'task_completion' | 'badge_earned' | 'streak_bonus' | 'store_purchase' | 'admin_adjustment' | null;
          source_id: string | null;
          balance_after: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: 'earned' | 'spent' | 'bonus' | 'penalty';
          amount: number;
          description: string;
          source_type?: 'task_completion' | 'badge_earned' | 'streak_bonus' | 'store_purchase' | 'admin_adjustment' | null;
          source_id?: string | null;
          balance_after: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: 'earned' | 'spent' | 'bonus' | 'penalty';
          amount?: number;
          description?: string;
          source_type?: 'task_completion' | 'badge_earned' | 'streak_bonus' | 'store_purchase' | 'admin_adjustment' | null;
          source_id?: string | null;
          balance_after?: number;
          created_at?: string;
        };
      };
      user_settings: {
        Row: {
          id: string;
          user_id: string;
          notifications_enabled: boolean;
          daily_reminder_time: string;
          theme: string;
          timezone: string;
          language: string;
          privacy_level: 'public' | 'friends' | 'private';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          notifications_enabled?: boolean;
          daily_reminder_time?: string;
          theme?: string;
          timezone?: string;
          language?: string;
          privacy_level?: 'public' | 'friends' | 'private';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          notifications_enabled?: boolean;
          daily_reminder_time?: string;
          theme?: string;
          timezone?: string;
          language?: string;
          privacy_level?: 'public' | 'friends' | 'private';
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      check_and_award_badges: {
        Args: {
          p_user_id: string;
        };
        Returns: string[];
      };
      complete_task: {
        Args: {
          p_user_id: string;
          p_task_id: string;
          p_notes?: string;
        };
        Returns: {
          achiv_earned: number;
          xp_earned: number;
          new_badges: string[];
          new_level: number;
          streak_updated: number;
        };
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
