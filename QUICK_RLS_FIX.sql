-- QUICK RLS FIX - Supabase SQL Editor'da çalıştırın
-- Bu sadece tasks ve task_categories tablolarını açar

-- Tasks tablosu için policy
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for tasks" ON public.tasks;
CREATE POLICY "Enable read access for tasks" ON public.tasks
  FOR SELECT USING (true);

-- Task categories tablosu için policy  
ALTER TABLE public.task_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for task_categories" ON public.task_categories;
CREATE POLICY "Enable read access for task_categories" ON public.task_categories
  FOR SELECT USING (true);

-- Kontrol et
SELECT 
  tablename, 
  rowsecurity,
  CASE WHEN rowsecurity THEN '✅ RLS Enabled' ELSE '❌ RLS Disabled' END as status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('tasks', 'task_categories')
ORDER BY tablename;
