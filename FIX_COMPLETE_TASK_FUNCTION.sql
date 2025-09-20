-- FIX complete_task function - CASE statement ELSE part missing
-- Run this in Supabase SQL Editor

-- Drop and recreate the check_and_award_badges function with proper CASE statement
CREATE OR REPLACE FUNCTION check_and_award_badges(p_user_id UUID)
RETURNS TEXT[] AS $$
DECLARE
    badge_record RECORD;
    user_stats RECORD;
    new_badges TEXT[] := ARRAY[]::TEXT[];
BEGIN
    -- Get user stats
    SELECT 
        (SELECT COUNT(*) FROM user_task_completions WHERE user_id = p_user_id) as total_completions,
        (SELECT MAX(current_streak) FROM user_tasks WHERE user_id = p_user_id) as max_streak
    INTO user_stats;

    -- Check each badge
    FOR badge_record IN SELECT * FROM badges WHERE is_active = true LOOP
        -- Skip if already earned
        IF EXISTS (SELECT 1 FROM user_badges WHERE user_id = p_user_id AND badge_id = badge_record.id AND is_earned = true) THEN
            CONTINUE;
        END IF;

        -- Check unlock conditions with proper CASE statement
        CASE badge_record.unlock_condition->>'type'
            WHEN 'task_completions' THEN
                IF user_stats.total_completions >= (badge_record.unlock_condition->>'count')::INTEGER THEN
                    -- Award badge
                    INSERT INTO user_badges (user_id, badge_id, progress, max_progress, is_earned, earned_at)
                    VALUES (p_user_id, badge_record.id, (badge_record.unlock_condition->>'count')::INTEGER, (badge_record.unlock_condition->>'count')::INTEGER, true, NOW())
                    ON CONFLICT (user_id, badge_id) DO UPDATE SET
                        progress = EXCLUDED.progress,
                        is_earned = true,
                        earned_at = NOW();
                    
                    new_badges := new_badges || badge_record.name;
                END IF;
            
            WHEN 'streak' THEN
                IF user_stats.max_streak >= (badge_record.unlock_condition->>'days')::INTEGER THEN
                    -- Award badge
                    INSERT INTO user_badges (user_id, badge_id, progress, max_progress, is_earned, earned_at)
                    VALUES (p_user_id, badge_record.id, (badge_record.unlock_condition->>'days')::INTEGER, (badge_record.unlock_condition->>'days')::INTEGER, true, NOW())
                    ON CONFLICT (user_id, badge_id) DO UPDATE SET
                        progress = EXCLUDED.progress,
                        is_earned = true,
                        earned_at = NOW();
                    
                    new_badges := new_badges || badge_record.name;
                END IF;
            
            WHEN 'total_completions' THEN
                IF user_stats.total_completions >= (badge_record.unlock_condition->>'count')::INTEGER THEN
                    -- Award badge
                    INSERT INTO user_badges (user_id, badge_id, progress, max_progress, is_earned, earned_at)
                    VALUES (p_user_id, badge_record.id, (badge_record.unlock_condition->>'count')::INTEGER, (badge_record.unlock_condition->>'count')::INTEGER, true, NOW())
                    ON CONFLICT (user_id, badge_id) DO UPDATE SET
                        progress = EXCLUDED.progress,
                        is_earned = true,
                        earned_at = NOW();
                    
                    new_badges := new_badges || badge_record.name;
                END IF;
            
            ELSE
                -- Default case - do nothing for unknown badge types
                NULL;
        END CASE;
    END LOOP;

    RETURN new_badges;
END;
$$ LANGUAGE plpgsql;

-- Test the function
SELECT check_and_award_badges('00000000-0000-0000-0000-000000000000'::UUID) as test_result;
