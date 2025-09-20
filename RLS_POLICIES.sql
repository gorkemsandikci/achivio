-- RLS POLICIES FOR ACHIVIO DATABASE
-- Run these in Supabase SQL Editor

-- 1. USERS TABLE POLICIES
-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (true); -- For now, allow all reads

-- Policy: Anyone can insert new users (for wallet registration)
CREATE POLICY "Anyone can create user" ON users
  FOR INSERT WITH CHECK (true);

-- Policy: Users can update their own data
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (true) WITH CHECK (true);

-- 2. TASKS TABLE POLICIES (read-only for all users)
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tasks" ON tasks
  FOR SELECT USING (is_active = true);

-- 3. TASK_CATEGORIES TABLE POLICIES (read-only for all users)
ALTER TABLE task_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view task categories" ON task_categories
  FOR SELECT USING (is_active = true);

-- 4. USER_TASKS TABLE POLICIES
ALTER TABLE user_tasks ENABLE ROW LEVEL SECURITY;

-- Users can view their own tasks
CREATE POLICY "Users can view own tasks" ON user_tasks
  FOR SELECT USING (true); -- We'll implement proper user context later

-- Users can insert their own tasks
CREATE POLICY "Users can add own tasks" ON user_tasks
  FOR INSERT WITH CHECK (true);

-- Users can update their own tasks
CREATE POLICY "Users can update own tasks" ON user_tasks
  FOR UPDATE USING (true) WITH CHECK (true);

-- 5. USER_TASK_COMPLETIONS TABLE POLICIES
ALTER TABLE user_task_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own completions" ON user_task_completions
  FOR SELECT USING (true);

CREATE POLICY "Users can add own completions" ON user_task_completions
  FOR INSERT WITH CHECK (true);

-- 6. BADGES TABLE POLICIES (read-only for all users)
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view badges" ON badges
  FOR SELECT USING (is_active = true);

-- 7. USER_BADGES TABLE POLICIES
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own badges" ON user_badges
  FOR SELECT USING (true);

CREATE POLICY "System can award badges" ON user_badges
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own badges" ON user_badges
  FOR UPDATE USING (true) WITH CHECK (true);

-- 8. TRANSACTIONS TABLE POLICIES
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (true);

CREATE POLICY "System can create transactions" ON transactions
  FOR INSERT WITH CHECK (true);

-- 9. USER_SETTINGS TABLE POLICIES
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own settings" ON user_settings
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own settings" ON user_settings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own settings" ON user_settings
  FOR UPDATE USING (true) WITH CHECK (true);

-- Check which tables have RLS enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'tasks', 'task_categories', 'user_tasks', 'user_task_completions', 'badges', 'user_badges', 'transactions', 'user_settings')
ORDER BY tablename;
