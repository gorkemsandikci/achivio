-- Achivio Supabase Seed Data
-- Initial data for categories, tasks, and badges

-- INSERT TASK CATEGORIES
INSERT INTO task_categories (name, slug, icon, color_gradient, description) VALUES
('All Tasks', 'all', '📋', 'from-gray-400 to-gray-600', 'All available tasks'),
('Fitness', 'fitness', '🏋️', 'from-red-400 to-pink-500', 'Physical health and exercise'),
('Learning', 'learning', '📚', 'from-blue-400 to-indigo-500', 'Education and skill development'),
('Wellness', 'wellness', '🧘', 'from-green-400 to-teal-500', 'Mental health and wellbeing'),
('Skills', 'skills', '💻', 'from-purple-400 to-indigo-500', 'Professional and technical skills');

-- INSERT SYSTEM TASKS
INSERT INTO tasks (title, description, category_id, difficulty, reward_achiv, reward_xp, time_estimate, icon, color_gradient, is_system_task) VALUES
-- Fitness Tasks
('Morning Workout', '30 minutes of cardio or strength training', 
 (SELECT id FROM task_categories WHERE slug = 'fitness'), 'Medium', 150.00, 50, '30 min', '🏋️', 'from-red-400 to-pink-500', true),

('Evening Walk', '20-minute walk in nature or neighborhood', 
 (SELECT id FROM task_categories WHERE slug = 'fitness'), 'Easy', 90.00, 35, '20 min', '🚶', 'from-orange-400 to-red-500', true),

('Drink 8 Glasses Water', 'Stay hydrated throughout the day', 
 (SELECT id FROM task_categories WHERE slug = 'wellness'), 'Easy', 60.00, 25, 'All day', '💧', 'from-cyan-400 to-blue-500', true),

-- Learning Tasks
('Read Educational Content', 'Read for 30 minutes to expand knowledge', 
 (SELECT id FROM task_categories WHERE slug = 'learning'), 'Easy', 100.00, 40, '30 min', '📚', 'from-blue-400 to-indigo-500', true),

('Learn New Language', 'Practice a foreign language for 20 minutes', 
 (SELECT id FROM task_categories WHERE slug = 'learning'), 'Medium', 120.00, 45, '20 min', '🗣️', 'from-indigo-400 to-purple-500', true),

-- Wellness Tasks
('Meditation Session', '10 minutes of mindfulness meditation', 
 (SELECT id FROM task_categories WHERE slug = 'wellness'), 'Easy', 80.00, 30, '10 min', '🧘', 'from-green-400 to-teal-500', true),

('Gratitude Journal', 'Write 3 things you are grateful for', 
 (SELECT id FROM task_categories WHERE slug = 'wellness'), 'Easy', 70.00, 25, '5 min', '📝', 'from-yellow-400 to-orange-500', true),

('Sleep 8 Hours', 'Get a full night of quality sleep', 
 (SELECT id FROM task_categories WHERE slug = 'wellness'), 'Medium', 100.00, 40, '8 hours', '😴', 'from-purple-400 to-indigo-500', true),

-- Skills Tasks
('Code Practice', 'Practice coding for skill improvement', 
 (SELECT id FROM task_categories WHERE slug = 'skills'), 'Hard', 200.00, 75, '45 min', '💻', 'from-purple-400 to-indigo-500', true),

('Creative Writing', 'Write creatively for 20 minutes', 
 (SELECT id FROM task_categories WHERE slug = 'skills'), 'Medium', 130.00, 50, '20 min', '✍️', 'from-pink-400 to-rose-500', true),

('Learn New Skill', 'Spend time learning something new', 
 (SELECT id FROM task_categories WHERE slug = 'skills'), 'Medium', 140.00, 55, '30 min', '🎯', 'from-emerald-400 to-teal-500', true);

-- INSERT BADGES
INSERT INTO badges (name, description, rarity, image_url, color_gradient, unlock_condition, unlock_rewards) VALUES
('First Steps', 'Complete your first habit', 'Common', '/assets/images/success_illustration.jpg', 'from-gray-400 to-gray-600',
 '{"type": "task_completions", "count": 1}', '["Basic Room Theme"]'),

('Week Warrior', 'Maintain a 7-day streak', 'Rare', '/assets/images/animated_fire_streak_counter.jpg', 'from-blue-400 to-indigo-600',
 '{"type": "streak", "days": 7}', '["Fire Theme", "Streak Multiplier x1.2"]'),

('Task Master', 'Complete 25 tasks total', 'Rare', '/assets/images/milestone_celebration.jpg', 'from-green-400 to-emerald-600',
 '{"type": "total_completions", "count": 25}', '["Master Theme", "Task Completion Bonus"]'),

('Fitness Enthusiast', 'Complete 20 fitness tasks', 'Epic', '/assets/images/milestone_celebration.jpg', 'from-red-400 to-pink-600',
 '{"type": "category_completions", "category": "fitness", "count": 20}', '["Gym Room", "Workout Equipment NFTs"]'),

('Learning Machine', 'Complete 30 learning tasks', 'Epic', '/assets/images/achievement_unlock_animation.jpg', 'from-blue-400 to-purple-600',
 '{"type": "category_completions", "category": "learning", "count": 30}', '["Library Room", "Knowledge Boost x1.5"]'),

('Zen Master', 'Complete 50 wellness tasks', 'Epic', '/assets/images/achievement_unlock_animation.jpg', 'from-green-400 to-teal-600',
 '{"type": "category_completions", "category": "wellness", "count": 50}', '["Zen Garden", "Wellness Multiplier x2"]'),

('Code Ninja', 'Complete 40 coding tasks', 'Epic', '/assets/images/achievement_unlock_animation.jpg', 'from-purple-400 to-indigo-600',
 '{"type": "category_completions", "category": "skills", "count": 40}', '["Developer Room", "Coding Boost x1.8"]'),

('Legendary Achiever', 'Maintain a 365-day streak', 'Legendary', '/assets/images/achievement_unlock_animation.jpg', 'from-yellow-400 to-orange-500',
 '{"type": "streak", "days": 365}', '["Golden Room", "Exclusive Avatar", "VIP Status"]'),

('Token Millionaire', 'Earn 10,000 ACHIV tokens', 'Legendary', '/assets/images/3d_rendered_crypto_tokens.jpg', 'from-yellow-400 to-amber-500',
 '{"type": "total_earned", "amount": 10000}', '["Diamond Room", "Token Rain Effect", "Millionaire Status"]'),

('Habit Legend', 'Complete 1000 tasks total', 'Legendary', '/assets/images/achievement_unlock_animation.jpg', 'from-rainbow-400 to-rainbow-600',
 '{"type": "total_completions", "count": 1000}', '["Legend Room", "All Themes Unlocked", "Legendary Status"]');

-- FUNCTIONS FOR BADGE CHECKING
-- Function to check and award badges to a user
CREATE OR REPLACE FUNCTION check_and_award_badges(p_user_id UUID)
RETURNS TEXT[] AS $$
DECLARE
    badge_record RECORD;
    user_stats RECORD;
    category_stats RECORD;
    new_badges TEXT[] := ARRAY[]::TEXT[];
    badge_name TEXT;
BEGIN
    -- Get user statistics
    SELECT 
        current_streak,
        total_earned_achiv,
        (SELECT COUNT(*) FROM user_task_completions WHERE user_id = p_user_id) as total_completions
    INTO user_stats
    FROM users WHERE id = p_user_id;

    -- Check each badge
    FOR badge_record IN SELECT * FROM badges WHERE is_active = true LOOP
        -- Skip if user already earned this badge
        IF EXISTS (SELECT 1 FROM user_badges WHERE user_id = p_user_id AND badge_id = badge_record.id AND is_earned = true) THEN
            CONTINUE;
        END IF;

        -- Check unlock conditions
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
                IF user_stats.current_streak >= (badge_record.unlock_condition->>'days')::INTEGER THEN
                    INSERT INTO user_badges (user_id, badge_id, progress, max_progress, is_earned, earned_at)
                    VALUES (p_user_id, badge_record.id, (badge_record.unlock_condition->>'days')::INTEGER, (badge_record.unlock_condition->>'days')::INTEGER, true, NOW())
                    ON CONFLICT (user_id, badge_id) DO UPDATE SET
                        progress = EXCLUDED.progress,
                        is_earned = true,
                        earned_at = NOW();
                    
                    new_badges := new_badges || badge_record.name;
                END IF;

            WHEN 'total_earned' THEN
                IF user_stats.total_earned_achiv >= (badge_record.unlock_condition->>'amount')::DECIMAL THEN
                    INSERT INTO user_badges (user_id, badge_id, progress, max_progress, is_earned, earned_at)
                    VALUES (p_user_id, badge_record.id, (badge_record.unlock_condition->>'amount')::INTEGER, (badge_record.unlock_condition->>'amount')::INTEGER, true, NOW())
                    ON CONFLICT (user_id, badge_id) DO UPDATE SET
                        progress = EXCLUDED.progress,
                        is_earned = true,
                        earned_at = NOW();
                    
                    new_badges := new_badges || badge_record.name;
                END IF;

            WHEN 'category_completions' THEN
                -- Get category completion count
                SELECT COUNT(*) INTO category_stats
                FROM user_task_completions utc
                JOIN tasks t ON utc.task_id = t.id
                JOIN task_categories tc ON t.category_id = tc.id
                WHERE utc.user_id = p_user_id 
                AND tc.slug = badge_record.unlock_condition->>'category';

                IF category_stats >= (badge_record.unlock_condition->>'count')::INTEGER THEN
                    INSERT INTO user_badges (user_id, badge_id, progress, max_progress, is_earned, earned_at)
                    VALUES (p_user_id, badge_record.id, (badge_record.unlock_condition->>'count')::INTEGER, (badge_record.unlock_condition->>'count')::INTEGER, true, NOW())
                    ON CONFLICT (user_id, badge_id) DO UPDATE SET
                        progress = EXCLUDED.progress,
                        is_earned = true,
                        earned_at = NOW();
                    
                    new_badges := new_badges || badge_record.name;
                END IF;
        END CASE;
    END LOOP;

    RETURN new_badges;
END;
$$ LANGUAGE plpgsql;

-- Function to complete a task for a user
CREATE OR REPLACE FUNCTION complete_task(p_user_id UUID, p_task_id UUID, p_notes TEXT DEFAULT NULL)
RETURNS TABLE(
    achiv_earned DECIMAL,
    xp_earned INTEGER,
    new_badges TEXT[],
    new_level INTEGER,
    streak_updated INTEGER
) AS $$
DECLARE
    task_record RECORD;
    user_record RECORD;
    user_task_record RECORD;
    completion_id UUID;
    earned_badges TEXT[];
    old_level INTEGER;
    new_user_level INTEGER;
BEGIN
    -- Get task details
    SELECT * INTO task_record FROM tasks WHERE id = p_task_id AND is_active = true;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Task not found or inactive';
    END IF;

    -- Get user details
    SELECT * INTO user_record FROM users WHERE id = p_user_id AND is_active = true;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'User not found or inactive';
    END IF;

    old_level := user_record.level;

    -- Get or create user_task relationship
    SELECT * INTO user_task_record FROM user_tasks WHERE user_id = p_user_id AND task_id = p_task_id;
    IF NOT FOUND THEN
        INSERT INTO user_tasks (user_id, task_id, current_streak, total_completions)
        VALUES (p_user_id, p_task_id, 0, 0)
        RETURNING * INTO user_task_record;
    END IF;

    -- Check if already completed today
    IF EXISTS (
        SELECT 1 FROM user_task_completions 
        WHERE user_id = p_user_id AND task_id = p_task_id 
        AND DATE(completed_at) = CURRENT_DATE
    ) THEN
        RAISE EXCEPTION 'Task already completed today';
    END IF;

    -- Record the completion
    INSERT INTO user_task_completions (user_id, task_id, user_task_id, achiv_earned, xp_earned, streak_at_completion, notes)
    VALUES (p_user_id, p_task_id, user_task_record.id, task_record.reward_achiv, task_record.reward_xp, user_task_record.current_streak + 1, p_notes)
    RETURNING id INTO completion_id;

    -- Update user_task streak and totals
    UPDATE user_tasks SET
        current_streak = current_streak + 1,
        best_streak = GREATEST(best_streak, current_streak + 1),
        total_completions = total_completions + 1,
        last_completed_at = NOW()
    WHERE id = user_task_record.id;

    -- Update user stats
    UPDATE users SET
        xp = xp + task_record.reward_xp,
        total_xp = total_xp + task_record.reward_xp,
        achiv_balance = achiv_balance + task_record.reward_achiv,
        total_earned_achiv = total_earned_achiv + task_record.reward_achiv,
        last_activity_date = CURRENT_DATE
    WHERE id = p_user_id;

    -- Record transaction
    INSERT INTO transactions (user_id, type, amount, description, source_type, source_id, balance_after)
    VALUES (p_user_id, 'earned', task_record.reward_achiv, 
            'Completed task: ' || task_record.title, 'task_completion', p_task_id,
            user_record.achiv_balance + task_record.reward_achiv);

    -- Check for new badges
    earned_badges := check_and_award_badges(p_user_id);

    -- Get updated user level
    SELECT level INTO new_user_level FROM users WHERE id = p_user_id;

    -- Get updated streak
    SELECT current_streak INTO user_task_record FROM user_tasks WHERE user_id = p_user_id AND task_id = p_task_id;

    RETURN QUERY SELECT 
        task_record.reward_achiv,
        task_record.reward_xp,
        earned_badges,
        new_user_level,
        user_task_record.current_streak;
END;
$$ LANGUAGE plpgsql;
