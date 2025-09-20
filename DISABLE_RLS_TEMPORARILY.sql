-- TEMPORARILY DISABLE RLS FOR TESTING
-- Run this in Supabase SQL Editor to allow user creation

-- Disable RLS on users table temporarily
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Check if RLS is disabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'users';

-- You can re-enable later with:
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
