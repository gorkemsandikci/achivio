-- DISABLE RLS ON ALL TABLES FOR TESTING
-- Run this in Supabase SQL Editor

-- Disable RLS on all main tables
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_task_completions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings DISABLE ROW LEVEL SECURITY;

-- Check RLS status for all tables
SELECT 
  tablename, 
  rowsecurity,
  CASE WHEN rowsecurity THEN '🔒 RLS Enabled' ELSE '🔓 RLS Disabled' END as status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'tasks', 'task_categories', 'user_tasks', 'user_task_completions', 'badges', 'user_badges', 'transactions', 'user_settings')
ORDER BY tablename;

-- Count records in main tables
SELECT 'users' as table_name, COUNT(*) as count FROM public.users
UNION ALL
SELECT 'tasks' as table_name, COUNT(*) as count FROM public.tasks WHERE is_active = true
UNION ALL
SELECT 'task_categories' as table_name, COUNT(*) as count FROM public.task_categories WHERE is_active = true
UNION ALL
SELECT 'badges' as table_name, COUNT(*) as count FROM public.badges WHERE is_active = true;
