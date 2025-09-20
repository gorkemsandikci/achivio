import { supabase, supabaseAdmin, Database } from '../lib/supabase';

// Type definitions
type User = Database['public']['Tables']['users']['Row'];
type Task = Database['public']['Tables']['tasks']['Row'];
type TaskCategory = Database['public']['Tables']['task_categories']['Row'];
type UserTask = Database['public']['Tables']['user_tasks']['Row'];
type UserTaskCompletion = Database['public']['Tables']['user_task_completions']['Row'];
type Badge = Database['public']['Tables']['badges']['Row'];
type UserBadge = Database['public']['Tables']['user_badges']['Row'];
type Transaction = Database['public']['Tables']['transactions']['Row'];

// Enhanced types with joins
export interface TaskWithCategory extends Task {
  task_categories?: TaskCategory | null;
}

export interface UserTaskWithTask extends UserTask {
  tasks?: TaskWithCategory;
}

export interface UserBadgeWithBadge extends UserBadge {
  badges?: Badge;
}

export interface TaskCompletionResult {
  achiv_earned: number;
  xp_earned: number;
  new_badges: string[];
  new_level: number;
  streak_updated: number;
}

// Database service class
export class DatabaseService {
  // Set current user context for RLS (disabled for now)
  static async setUserContext(walletAddress: string) {
    // Skip RLS context setting for now since set_config function doesn't exist
    console.log('🔄 Skipping user context setting for:', walletAddress);
    console.log('ℹ️ RLS context will be implemented later with proper policies');
    return;
  }

  // USER OPERATIONS
  static async getUserByWallet(walletAddress: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select(`
        id,
        wallet_address,
        username,
        avatar_url,
        level,
        xp,
        total_xp,
        current_streak,
        longest_streak,
        last_activity_date,
        achiv_balance,
        total_earned_achiv,
        join_date,
        is_active,
        created_at,
        updated_at
      `)
      .eq('wallet_address', walletAddress)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching user:', error);
      return null;
    }

    return data;
  }

  static async createUser(walletAddress: string, username?: string): Promise<User | null> {
    console.log('🔄 Attempting to create user with wallet:', walletAddress);
    
    const { data, error } = await supabase
      .from('users')
      .insert({
        wallet_address: walletAddress,
        username: username || 'Habit Master',
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating user:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      return null;
    }

    console.log('✅ User created successfully:', data);
    return data;
  }

  static async updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user:', error);
      return null;
    }

    return data;
  }

  // TASK OPERATIONS
  static async getTaskCategories(): Promise<TaskCategory[]> {
    console.log('🔍 Fetching task categories from database...');
    
    const { data, error } = await supabase
      .from('task_categories')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('❌ Error fetching categories:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      return [];
    }

    console.log('✅ Categories fetched successfully:', data?.length || 0, 'categories');
    console.log('📊 Categories:', data?.map(c => c.name));
    
    return data || [];
  }

  static async getTasks(categorySlug?: string): Promise<TaskWithCategory[]> {
    console.log('🔍 Fetching tasks from database...');
    
    let query = supabase
      .from('tasks')
      .select(`
        id,
        title,
        description,
        category_id,
        difficulty,
        reward_achiv,
        reward_xp,
        time_estimate,
        icon,
        color_gradient,
        task_type,
        max_progress,
        progress_unit,
        is_system_task,
        created_by,
        is_active,
        created_at,
        updated_at,
        task_categories!inner (*)
      `)
      .eq('is_active', true);

    if (categorySlug && categorySlug !== 'all') {
      query = query.eq('task_categories.slug', categorySlug);
    }

    const { data, error } = await query.order('title');

    if (error) {
      console.error('❌ Error fetching tasks:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      return [];
    }

    console.log('✅ Tasks fetched successfully:', data?.length || 0, 'tasks');
    console.log('📊 First task sample:', data?.[0]);
    
    return (data || []) as unknown as TaskWithCategory[];
  }

  static async getUserTasks(userId: string, categorySlug?: string): Promise<UserTaskWithTask[]> {
    console.log('🔍 Fetching user tasks for user:', userId);
    
    let query = supabase
      .from('user_tasks')
      .select(`
        *,
        tasks (
          *,
          task_categories (*)
        )
      `)
      .eq('user_id', userId)
      .eq('is_active', true);

    if (categorySlug && categorySlug !== 'all') {
      query = query.eq('tasks.task_categories.slug', categorySlug);
    }

    const { data, error } = await query.order('added_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching user tasks:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      return [];
    }

    console.log('✅ User tasks fetched successfully:', data?.length || 0, 'user tasks');
    return data || [];
  }

  static async addTaskToUser(userId: string, taskId: string): Promise<UserTask | null> {
    const { data, error } = await supabase
      .from('user_tasks')
      .insert({
        user_id: userId,
        task_id: taskId,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding task to user:', error);
      return null;
    }

    return data;
  }

  static async completeTask(userId: string, taskId: string, notes?: string): Promise<TaskCompletionResult | null> {
    try {
      const { data, error } = await supabase.rpc('complete_task', {
        p_user_id: userId,
        p_task_id: taskId,
        p_notes: notes || null
      });

      if (error) {
        console.error('Error completing task:', error);
        return null;
      }

      return data || null;
    } catch (error) {
      console.error('Error in completeTask:', error);
      return null;
    }
  }

  static async trackDailyProgress(userId: string, taskId: string, progressAmount: number = 1): Promise<{
    current_progress: number;
    max_progress: number;
    is_completed: boolean;
    achiv_earned: number;
    xp_earned: number;
  } | null> {
    try {
      const { data, error } = await supabase.rpc('track_daily_progress', {
        p_user_id: userId,
        p_task_id: taskId,
        p_progress_amount: progressAmount
      });

      if (error) {
        console.error('Error tracking daily progress:', error);
        return null;
      }

      const result = Array.isArray(data) ? data[0] : data;
      return result;
    } catch (error) {
      console.error('Error in trackDailyProgress:', error);
      return null;
    }
  }

  static async getTaskCompletions(userId: string, limit = 10): Promise<UserTaskCompletion[]> {
    const { data, error } = await supabase
      .from('user_task_completions')
      .select(`
        *,
        tasks (title, icon)
      `)
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching task completions:', error);
      return [];
    }

    return data || [];
  }

  static async isTaskCompletedToday(userId: string, taskId: string): Promise<boolean> {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('user_task_completions')
      .select('id')
      .eq('user_id', userId)
      .eq('task_id', taskId)
      .gte('completed_at', today)
      .lt('completed_at', today + 'T23:59:59.999Z')
      .limit(1);

    if (error) {
      console.error('Error checking task completion:', error);
      return false;
    }

    return (data?.length || 0) > 0;
  }

  // BADGE OPERATIONS
  static async getBadges(): Promise<Badge[]> {
    const { data, error } = await supabase
      .from('badges')
      .select('*')
      .eq('is_active', true)
      .order('rarity', { ascending: false });

    if (error) {
      console.error('Error fetching badges:', error);
      return [];
    }

    return data || [];
  }

  static async getUserBadges(userId: string): Promise<UserBadgeWithBadge[]> {
    const { data, error } = await supabase
      .from('user_badges')
      .select(`
        *,
        badges (*)
      `)
      .eq('user_id', userId)
      .order('earned_at', { ascending: false });

    if (error) {
      console.error('Error fetching user badges:', error);
      return [];
    }

    return data || [];
  }

  static async mintBadge(userId: string, badgeId: string, transactionId: string): Promise<boolean> {
    const { error } = await supabase
      .from('user_badges')
      .update({
        is_minted: true,
        mint_transaction_id: transactionId,
        minted_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('badge_id', badgeId);

    if (error) {
      console.error('Error minting badge:', error);
      return false;
    }

    return true;
  }

  // TRANSACTION OPERATIONS
  static async getTransactions(userId: string, limit = 20): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }

    return data || [];
  }

  // STATISTICS OPERATIONS
  static async getUserStats(userId: string) {
    const user = await this.getUserByWallet(''); // Will be filtered by RLS
    if (!user) return null;

    // Get additional stats
    const [completions, badges, transactions] = await Promise.all([
      this.getTaskCompletions(userId, 1000), // Get all completions for stats
      this.getUserBadges(userId),
      this.getTransactions(userId, 1000)
    ]);

    // Calculate stats
    const todayCompletions = completions.filter(c => 
      new Date(c.completed_at).toDateString() === new Date().toDateString()
    );

    const thisWeekStart = new Date();
    thisWeekStart.setDate(thisWeekStart.getDate() - 7);
    const weekCompletions = completions.filter(c => 
      new Date(c.completed_at) >= thisWeekStart
    );

    const earnedBadges = badges.filter(b => b.is_earned);
    
    const todayEarnings = transactions
      .filter(t => t.type === 'earned' && 
        new Date(t.created_at).toDateString() === new Date().toDateString())
      .reduce((sum, t) => sum + t.amount, 0);

    const weekEarnings = transactions
      .filter(t => t.type === 'earned' && new Date(t.created_at) >= thisWeekStart)
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      user,
      stats: {
        totalCompletions: completions.length,
        todayCompletions: todayCompletions.length,
        weekCompletions: weekCompletions.length,
        earnedBadges: earnedBadges.length,
        totalBadges: badges.length,
        todayEarnings,
        weekEarnings,
        level: user.level,
        xp: user.xp,
        totalXp: user.total_xp,
        currentStreak: user.current_streak,
        longestStreak: user.longest_streak,
        achivBalance: user.achiv_balance,
        totalEarned: user.total_earned_achiv
      }
    };
  }

  // LEADERBOARD OPERATIONS
  static async getLeaderboard(limit = 10) {
    const { data, error } = await supabase
      .from('users')
      .select('id, username, wallet_address, level, total_xp, current_streak, total_earned_achiv')
      .eq('is_active', true)
      .order('total_xp', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }

    return data || [];
  }

  // UTILITY FUNCTIONS
  static async ensureUserExists(walletAddress: string): Promise<User | null> {
    console.log('🔍 Ensuring user exists for wallet:', walletAddress);
    
    let user = await this.getUserByWallet(walletAddress);
    console.log('🔍 Existing user found:', user ? '✅ Yes' : '❌ No');
    
    if (!user) {
      console.log('🆕 Creating new user...');
      user = await this.createUser(walletAddress);
      console.log('🆕 User creation result:', user ? '✅ Success' : '❌ Failed');
    }

    if (user) {
      await this.setUserContext(walletAddress);
      console.log('✅ User ensure complete for:', user.username);
    } else {
      console.error('❌ Failed to ensure user exists for wallet:', walletAddress);
    }

    return user;
  }

  static async getUserDashboardData(walletAddress: string) {
    const user = await this.ensureUserExists(walletAddress);
    if (!user) return null;

    const [userTasks, completions, badges, transactions] = await Promise.all([
      this.getUserTasks(user.id),
      this.getTaskCompletions(user.id, 5),
      this.getUserBadges(user.id),
      this.getTransactions(user.id, 5)
    ]);

    return {
      user,
      userTasks,
      recentCompletions: completions,
      badges,
      recentTransactions: transactions
    };
  }
}
