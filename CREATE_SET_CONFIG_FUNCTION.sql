-- CREATE set_config FUNCTION for RLS Context
-- Run this in Supabase SQL Editor

-- Create set_config function for RLS context
CREATE OR REPLACE FUNCTION set_config(
  setting_name text,
  setting_value text,
  is_local boolean DEFAULT false
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Set the configuration parameter
  PERFORM set_config(setting_name, setting_value, is_local);
  
  -- Return the value that was set
  RETURN setting_value;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION set_config(text, text, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION set_config(text, text, boolean) TO anon;

-- Test the function
SELECT set_config('app.current_user_wallet', 'test_wallet', true) as result;
