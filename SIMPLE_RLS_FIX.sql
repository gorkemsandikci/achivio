-- SIMPLE RLS FIX - Supabase SQL Editor'da çalıştırın

-- 1. Users tablosu için basit policy'ler
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Herkesi her şeyi yapabilir yap (geçici olarak)
DROP POLICY IF EXISTS "Enable all access for users" ON public.users;
CREATE POLICY "Enable all access for users" ON public.users
  FOR ALL USING (true) WITH CHECK (true);

-- 2. Diğer temel tablolar
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for tasks" ON public.tasks;
CREATE POLICY "Enable read access for tasks" ON public.tasks
  FOR SELECT USING (true);

ALTER TABLE public.task_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for task_categories" ON public.task_categories;
CREATE POLICY "Enable read access for task_categories" ON public.task_categories
  FOR SELECT USING (true);

ALTER TABLE public.user_tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all access for user_tasks" ON public.user_tasks;
CREATE POLICY "Enable all access for user_tasks" ON public.user_tasks
  FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.user_task_completions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all access for user_task_completions" ON public.user_task_completions;
CREATE POLICY "Enable all access for user_task_completions" ON public.user_task_completions
  FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for badges" ON public.badges;
CREATE POLICY "Enable read access for badges" ON public.badges
  FOR SELECT USING (true);

ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all access for user_badges" ON public.user_badges;
CREATE POLICY "Enable all access for user_badges" ON public.user_badges
  FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all access for transactions" ON public.transactions;
CREATE POLICY "Enable all access for transactions" ON public.transactions
  FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all access for user_settings" ON public.user_settings;
CREATE POLICY "Enable all access for user_settings" ON public.user_settings
  FOR ALL USING (true) WITH CHECK (true);

-- Kontrol et
SELECT 
  schemaname, 
  tablename, 
  rowsecurity,
  CASE WHEN rowsecurity THEN '✅ RLS Enabled' ELSE '❌ RLS Disabled' END as status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'tasks', 'task_categories', 'user_tasks', 'user_task_completions', 'badges', 'user_badges', 'transactions', 'user_settings')
ORDER BY tablename;
