-- ADD PROGRESS TRACKING FEATURES TO TASKS
-- Run this in Supabase SQL Editor

-- Add progress tracking columns to tasks table
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS task_type TEXT DEFAULT 'single' CHECK (task_type IN ('single', 'progressive'));
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS max_progress INTEGER DEFAULT 1;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS progress_unit TEXT DEFAULT 'completion';

-- Add daily progress tracking to user_tasks table
ALTER TABLE public.user_tasks ADD COLUMN IF NOT EXISTS daily_progress INTEGER DEFAULT 0;
ALTER TABLE public.user_tasks ADD COLUMN IF NOT EXISTS daily_progress_date DATE DEFAULT CURRENT_DATE;

-- Add progress tracking to user_task_completions
ALTER TABLE public.user_task_completions ADD COLUMN IF NOT EXISTS progress_amount INTEGER DEFAULT 1;

-- Update existing tasks to have progress info
UPDATE public.tasks SET 
    task_type = 'progressive',
    max_progress = 8,
    progress_unit = 'glasses'
WHERE title = 'Drink Water';

UPDATE public.tasks SET 
    task_type = 'progressive', 
    max_progress = 10000,
    progress_unit = 'steps'
WHERE title = 'Daily Steps';

UPDATE public.tasks SET 
    task_type = 'progressive',
    max_progress = 5,
    progress_unit = 'servings'
WHERE title = 'Eat Vegetables';

-- Create function to track daily progress
CREATE OR REPLACE FUNCTION track_daily_progress(
    p_user_id UUID,
    p_task_id UUID,
    p_progress_amount INTEGER DEFAULT 1
)
RETURNS TABLE(
    current_progress INTEGER,
    max_progress INTEGER,
    is_completed BOOLEAN,
    achiv_earned DECIMAL,
    xp_earned INTEGER
) AS $$
DECLARE
    user_task_record RECORD;
    task_record RECORD;
    new_progress INTEGER;
    is_task_completed BOOLEAN := false;
    earned_achiv DECIMAL := 0;
    earned_xp INTEGER := 0;
BEGIN
    -- Get task info
    SELECT * INTO task_record FROM tasks WHERE id = p_task_id AND is_active = true;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Task not found or inactive';
    END IF;

    -- Get or create user_task relationship
    SELECT * INTO user_task_record FROM user_tasks WHERE user_id = p_user_id AND task_id = p_task_id;
    IF NOT FOUND THEN
        INSERT INTO user_tasks (user_id, task_id, daily_progress, daily_progress_date)
        VALUES (p_user_id, p_task_id, 0, CURRENT_DATE)
        RETURNING * INTO user_task_record;
    END IF;

    -- Reset daily progress if it's a new day
    IF user_task_record.daily_progress_date != CURRENT_DATE THEN
        UPDATE user_tasks SET 
            daily_progress = 0,
            daily_progress_date = CURRENT_DATE
        WHERE id = user_task_record.id;
        user_task_record.daily_progress := 0;
    END IF;

    -- Calculate new progress
    new_progress := user_task_record.daily_progress + p_progress_amount;
    
    -- Cap at max_progress
    IF new_progress > task_record.max_progress THEN
        new_progress := task_record.max_progress;
    END IF;

    -- Update user_task progress
    UPDATE user_tasks SET 
        daily_progress = new_progress,
        daily_progress_date = CURRENT_DATE,
        last_completed_at = CASE WHEN new_progress >= task_record.max_progress THEN NOW() ELSE last_completed_at END
    WHERE id = user_task_record.id;

    -- Check if task is completed today
    is_task_completed := new_progress >= task_record.max_progress;

    -- If completed and not already recorded today, award rewards
    IF is_task_completed AND NOT EXISTS (
        SELECT 1 FROM user_task_completions 
        WHERE user_id = p_user_id AND task_id = p_task_id 
        AND DATE(completed_at) = CURRENT_DATE
    ) THEN
        -- Award full rewards
        earned_achiv := task_record.reward_achiv;
        earned_xp := task_record.reward_xp;

        -- Record completion
        INSERT INTO user_task_completions (user_id, task_id, user_task_id, achiv_earned, xp_earned, progress_amount)
        VALUES (p_user_id, p_task_id, user_task_record.id, earned_achiv, earned_xp, new_progress);

        -- Update user stats
        UPDATE users SET
            xp = xp + earned_xp,
            total_xp = total_xp + earned_xp,
            achiv_balance = achiv_balance + earned_achiv,
            total_earned_achiv = total_earned_achiv + earned_achiv,
            last_activity_date = CURRENT_DATE
        WHERE id = p_user_id;

        -- Update streaks
        UPDATE user_tasks SET
            current_streak = current_streak + 1,
            best_streak = GREATEST(best_streak, current_streak + 1),
            total_completions = total_completions + 1
        WHERE id = user_task_record.id;

        -- Record transaction
        INSERT INTO transactions (user_id, type, amount, description, source_type, source_id, balance_after)
        SELECT p_user_id, 'earned', earned_achiv, 
               'Completed task: ' || task_record.title, 'task_completion', p_task_id,
               u.achiv_balance
        FROM users u WHERE u.id = p_user_id;
    END IF;

    -- Return current status
    RETURN QUERY SELECT 
        new_progress,
        task_record.max_progress,
        is_task_completed,
        earned_achiv,
        earned_xp;
END;
$$ LANGUAGE plpgsql;
