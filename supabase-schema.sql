-- Achivio Supabase Database Schema
-- Created for habit tracking with blockchain integration

-- Enable Row Level Security
-- ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- 1. USERS TABLE
-- Stores user profiles identified by wallet address
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    wallet_address TEXT UNIQUE NOT NULL, -- Stacks wallet address (unique identifier)
    username TEXT DEFAULT 'Habit Master',
    avatar_url TEXT DEFAULT '/assets/images/3d_rendered_crypto_tokens.jpg',
    level INTEGER DEFAULT 1,
    xp INTEGER DEFAULT 0,
    total_xp INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity_date DATE DEFAULT CURRENT_DATE,
    achiv_balance DECIMAL(10,2) DEFAULT 0.00,
    total_earned_achiv DECIMAL(10,2) DEFAULT 0.00,
    join_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TASK CATEGORIES TABLE
-- Defines task categories with colors and icons
CREATE TABLE task_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    icon TEXT NOT NULL,
    color_gradient TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TASKS TABLE
-- Defines available tasks (both system and user-created)
CREATE TABLE tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category_id UUID REFERENCES task_categories(id) ON DELETE SET NULL,
    difficulty TEXT CHECK (difficulty IN ('Easy', 'Medium', 'Hard')) DEFAULT 'Medium',
    reward_achiv DECIMAL(10,2) DEFAULT 0.00,
    reward_xp INTEGER DEFAULT 0,
    time_estimate TEXT DEFAULT '30 min',
    icon TEXT DEFAULT '📋',
    color_gradient TEXT DEFAULT 'from-gray-400 to-gray-600',
    is_system_task BOOLEAN DEFAULT true, -- false for user-created tasks
    created_by UUID REFERENCES users(id) ON DELETE SET NULL, -- null for system tasks
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. USER_TASKS TABLE
-- Links users to tasks they're tracking
CREATE TABLE user_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    current_streak INTEGER DEFAULT 0,
    best_streak INTEGER DEFAULT 0,
    total_completions INTEGER DEFAULT 0,
    last_completed_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true, -- user can pause/unpause tasks
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, task_id)
);

-- 5. USER_TASK_COMPLETIONS TABLE
-- Records each task completion
CREATE TABLE user_task_completions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    user_task_id UUID REFERENCES user_tasks(id) ON DELETE CASCADE,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    achiv_earned DECIMAL(10,2) DEFAULT 0.00,
    xp_earned INTEGER DEFAULT 0,
    streak_at_completion INTEGER DEFAULT 0,
    notes TEXT, -- optional user notes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. BADGES TABLE
-- Defines available NFT badges
CREATE TABLE badges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    rarity TEXT CHECK (rarity IN ('Common', 'Rare', 'Epic', 'Legendary')) DEFAULT 'Common',
    image_url TEXT NOT NULL,
    color_gradient TEXT NOT NULL,
    unlock_condition JSONB NOT NULL, -- conditions for earning the badge
    unlock_rewards JSONB, -- what the badge unlocks (themes, multipliers, etc.)
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. USER_BADGES TABLE
-- Tracks badges earned by users
CREATE TABLE user_badges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    progress INTEGER DEFAULT 0, -- current progress towards badge
    max_progress INTEGER DEFAULT 1, -- required progress to earn badge
    is_earned BOOLEAN DEFAULT false,
    is_minted BOOLEAN DEFAULT false, -- NFT minting status
    mint_transaction_id TEXT, -- blockchain transaction ID
    minted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, badge_id)
);

-- 8. TRANSACTIONS TABLE
-- Records all ACHIV token transactions
CREATE TABLE transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type TEXT CHECK (type IN ('earned', 'spent', 'bonus', 'penalty')) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT NOT NULL,
    source_type TEXT CHECK (source_type IN ('task_completion', 'badge_earned', 'streak_bonus', 'store_purchase', 'admin_adjustment')),
    source_id UUID, -- reference to task_id, badge_id, etc.
    balance_after DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. USER_SETTINGS TABLE
-- User preferences and settings
CREATE TABLE user_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    notifications_enabled BOOLEAN DEFAULT true,
    daily_reminder_time TIME DEFAULT '09:00:00',
    theme TEXT DEFAULT 'default',
    timezone TEXT DEFAULT 'UTC',
    language TEXT DEFAULT 'en',
    privacy_level TEXT CHECK (privacy_level IN ('public', 'friends', 'private')) DEFAULT 'public',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- INDEXES for better performance
CREATE INDEX idx_users_wallet_address ON users(wallet_address);
CREATE INDEX idx_user_tasks_user_id ON user_tasks(user_id);
CREATE INDEX idx_user_tasks_task_id ON user_tasks(task_id);
CREATE INDEX idx_user_task_completions_user_id ON user_task_completions(user_id);
CREATE INDEX idx_user_task_completions_completed_at ON user_task_completions(completed_at);
CREATE INDEX idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);

-- TRIGGERS for automatic updates
-- Update user's updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- FUNCTIONS for business logic
-- Function to update user level based on XP
CREATE OR REPLACE FUNCTION update_user_level()
RETURNS TRIGGER AS $$
BEGIN
    -- Simple level calculation: Level = floor(total_xp / 1000) + 1
    NEW.level = GREATEST(1, FLOOR(NEW.total_xp / 1000.0) + 1);
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_level_trigger BEFORE UPDATE OF total_xp ON users
    FOR EACH ROW EXECUTE FUNCTION update_user_level();

-- Function to update user streak
CREATE OR REPLACE FUNCTION update_user_streak()
RETURNS TRIGGER AS $$
BEGIN
    -- If last activity was yesterday, increment streak
    -- If last activity was today, keep streak
    -- Otherwise, reset streak to 1
    IF NEW.last_activity_date = CURRENT_DATE THEN
        -- Same day, keep streak
        NEW.current_streak = OLD.current_streak;
    ELSIF NEW.last_activity_date = OLD.last_activity_date + INTERVAL '1 day' THEN
        -- Next day, increment streak
        NEW.current_streak = OLD.current_streak + 1;
        NEW.longest_streak = GREATEST(NEW.longest_streak, NEW.current_streak);
    ELSE
        -- Gap in activity, reset streak
        NEW.current_streak = 1;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_streak_trigger BEFORE UPDATE OF last_activity_date ON users
    FOR EACH ROW EXECUTE FUNCTION update_user_streak();

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_task_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Users can only see/edit their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (wallet_address = current_setting('app.current_user_wallet', true));

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (wallet_address = current_setting('app.current_user_wallet', true));

-- Similar policies for other user-specific tables
CREATE POLICY "Users can view own tasks" ON user_tasks
    FOR ALL USING (user_id IN (SELECT id FROM users WHERE wallet_address = current_setting('app.current_user_wallet', true)));

CREATE POLICY "Users can view own completions" ON user_task_completions
    FOR ALL USING (user_id IN (SELECT id FROM users WHERE wallet_address = current_setting('app.current_user_wallet', true)));

CREATE POLICY "Users can view own badges" ON user_badges
    FOR ALL USING (user_id IN (SELECT id FROM users WHERE wallet_address = current_setting('app.current_user_wallet', true)));

CREATE POLICY "Users can view own transactions" ON transactions
    FOR ALL USING (user_id IN (SELECT id FROM users WHERE wallet_address = current_setting('app.current_user_wallet', true)));

CREATE POLICY "Users can manage own settings" ON user_settings
    FOR ALL USING (user_id IN (SELECT id FROM users WHERE wallet_address = current_setting('app.current_user_wallet', true)));

-- Public read access for reference tables
ALTER TABLE task_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access to categories" ON task_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public read access to tasks" ON tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public read access to badges" ON badges FOR SELECT TO authenticated USING (true);

-- Comments for documentation
COMMENT ON TABLE users IS 'User profiles identified by Stacks wallet address';
COMMENT ON TABLE tasks IS 'Available habits/tasks that users can track';
COMMENT ON TABLE user_tasks IS 'Links users to tasks they are actively tracking';
COMMENT ON TABLE user_task_completions IS 'Historical record of completed tasks';
COMMENT ON TABLE badges IS 'NFT badges that can be earned';
COMMENT ON TABLE user_badges IS 'Badges earned by users with progress tracking';
COMMENT ON TABLE transactions IS 'ACHIV token transaction history';
COMMENT ON TABLE user_settings IS 'User preferences and app settings';
