-- FIX DRINK WATER TASK - Make sure it's progressive
-- Run this in Supabase SQL Editor

-- Check current state of water task
SELECT title, task_type, max_progress, progress_unit, description 
FROM public.tasks 
WHERE title ILIKE '%water%' OR title ILIKE '%drink%' OR description ILIKE '%water%';

-- Update Drink Water task specifically
UPDATE public.tasks SET 
    task_type = 'progressive',
    max_progress = 8,
    progress_unit = 'glasses'
WHERE title = 'Drink Water' OR description ILIKE '%8 glasses%' OR description ILIKE '%water%';

-- If the task doesn't exist, create it
INSERT INTO public.tasks (title, description, category_id, difficulty, reward_achiv, reward_xp, time_estimate, icon, color_gradient, task_type, max_progress, progress_unit, is_active)
SELECT 'Drink Water', 'Stay hydrated by drinking 8 glasses of water daily', 
       (SELECT id FROM task_categories WHERE slug = 'wellness'), 'Easy', 100.00, 40, '8 glasses', '💧', 'from-blue-400 to-cyan-500', 'progressive', 8, 'glasses', true
WHERE NOT EXISTS (
    SELECT 1 FROM public.tasks WHERE title = 'Drink Water'
);

-- Verify the update
SELECT title, task_type, max_progress, progress_unit, description, is_active
FROM public.tasks 
WHERE title ILIKE '%water%' OR title ILIKE '%drink%'
ORDER BY title;
