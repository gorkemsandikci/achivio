-- UPDATE MOST TASKS TO PROGRESSIVE TYPE
-- Run this in Supabase SQL Editor

-- Update Fitness Tasks
UPDATE public.tasks SET 
    task_type = 'progressive',
    max_progress = 30,
    progress_unit = 'minutes'
WHERE title = 'Morning Run';

UPDATE public.tasks SET 
    task_type = 'progressive',
    max_progress = 10000,
    progress_unit = 'steps'
WHERE title = 'Daily Steps';

UPDATE public.tasks SET 
    task_type = 'progressive',
    max_progress = 45,
    progress_unit = 'minutes'
WHERE title = 'Gym Workout';

-- Update Learning Tasks
UPDATE public.tasks SET 
    task_type = 'progressive',
    max_progress = 60,
    progress_unit = 'minutes'
WHERE title = 'Read Book';

UPDATE public.tasks SET 
    task_type = 'progressive',
    max_progress = 100,
    progress_unit = 'minutes'
WHERE title = 'Learn Coding' OR title = 'Code Practice';

UPDATE public.tasks SET 
    task_type = 'progressive',
    max_progress = 30,
    progress_unit = 'minutes'
WHERE title = 'Language Practice';

-- Update Wellness Tasks
UPDATE public.tasks SET 
    task_type = 'progressive',
    max_progress = 20,
    progress_unit = 'minutes'
WHERE title = 'Meditation';

UPDATE public.tasks SET 
    task_type = 'progressive',
    max_progress = 8,
    progress_unit = 'glasses'
WHERE title = 'Drink Water';

UPDATE public.tasks SET 
    task_type = 'progressive',
    max_progress = 8,
    progress_unit = 'hours'
WHERE title = 'Sleep Well';

-- Update Skills Tasks
UPDATE public.tasks SET 
    task_type = 'progressive',
    max_progress = 20,
    progress_unit = 'minutes'
WHERE title = 'Creative Writing';

UPDATE public.tasks SET 
    task_type = 'progressive',
    max_progress = 30,
    progress_unit = 'minutes'
WHERE title = 'Learn New Skill';

-- Keep some tasks as single completion
UPDATE public.tasks SET 
    task_type = 'single',
    max_progress = 1,
    progress_unit = 'completion'
WHERE title IN ('Daily Journal', 'Call Family');

-- Add more specific progressive tasks
INSERT INTO public.tasks (title, description, category_id, difficulty, reward_achiv, reward_xp, time_estimate, icon, color_gradient, task_type, max_progress, progress_unit, is_active) VALUES

-- Nutrition Tasks
('Eat Fruits', 'Consume healthy fruits throughout the day', 
 (SELECT id FROM task_categories WHERE slug = 'wellness'), 'Easy', 80.00, 30, '5 servings', '🍎', 'from-red-400 to-pink-500', 'progressive', 5, 'servings', true),

('Drink Tea/Coffee', 'Enjoy your daily beverages mindfully', 
 (SELECT id FROM task_categories WHERE slug = 'wellness'), 'Easy', 40.00, 15, '3 cups', '☕', 'from-amber-400 to-orange-500', 'progressive', 3, 'cups', true),

-- Work/Study Tasks
('Deep Work Session', 'Focus on important work without distractions', 
 (SELECT id FROM task_categories WHERE slug = 'skills'), 'Hard', 200.00, 80, '2 hours', '🎯', 'from-purple-500 to-indigo-600', 'progressive', 120, 'minutes', true),

('Take Breaks', 'Take regular breaks to maintain productivity', 
 (SELECT id FROM task_categories WHERE slug = 'wellness'), 'Easy', 60.00, 25, '5 breaks', '⏸️', 'from-green-400 to-teal-500', 'progressive', 5, 'breaks', true),

-- Physical Activity
('Stretching', 'Do stretching exercises throughout the day', 
 (SELECT id FROM task_categories WHERE slug = 'fitness'), 'Easy', 100.00, 40, '15 minutes', '🤸', 'from-blue-400 to-cyan-500', 'progressive', 15, 'minutes', true),

('Push-ups', 'Build strength with daily push-ups', 
 (SELECT id FROM task_categories WHERE slug = 'fitness'), 'Medium', 120.00, 50, '50 reps', '💪', 'from-red-500 to-orange-600', 'progressive', 50, 'reps', true);

-- Check updated tasks
SELECT title, task_type, max_progress, progress_unit, difficulty
FROM public.tasks 
WHERE is_active = true
ORDER BY task_type DESC, title;
