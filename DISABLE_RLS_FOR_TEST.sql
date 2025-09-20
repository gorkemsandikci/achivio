-- TEMPORARILY DISABLE RLS FOR TESTING
-- Run in Supabase SQL Editor

-- Disable RLS on tasks and task_categories tables temporarily
ALTER TABLE public.tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_categories DISABLE ROW LEVEL SECURITY;

-- Check RLS status
SELECT 
  tablename, 
  rowsecurity,
  CASE WHEN rowsecurity THEN '🔒 RLS Enabled' ELSE '🔓 RLS Disabled' END as status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('tasks', 'task_categories')
ORDER BY tablename;

-- Count records in tables
SELECT 'tasks' as table_name, COUNT(*) as count FROM public.tasks WHERE is_active = true
UNION ALL
SELECT 'task_categories' as table_name, COUNT(*) as count FROM public.task_categories WHERE is_active = true;
