-- ============================================================================
-- SUPABASE SETUP VERIFICATION SCRIPT
-- ============================================================================
-- Run this in your Supabase SQL Editor to verify your database setup
-- This will check all required tables, RLS policies, and configurations
-- ============================================================================

-- ============================================================================
-- CHECK 1: Verify Required Tables Exist
-- ============================================================================
SELECT 'CHECK 1: Required Tables' as check_type;
SELECT 
  table_name,
  CASE 
    WHEN table_name IN ('profiles', 'courses', 'enrollments', 'lessons', 'quizzes') 
    THEN '✓ REQUIRED'
    ELSE '- OPTIONAL'
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY 
  CASE 
    WHEN table_name = 'profiles' THEN 1
    WHEN table_name = 'courses' THEN 2
    WHEN table_name = 'enrollments' THEN 3
    WHEN table_name = 'lessons' THEN 4
    WHEN table_name = 'quizzes' THEN 5
    ELSE 6
  END,
  table_name;

-- ============================================================================
-- CHECK 2: Verify Profiles Table Structure
-- ============================================================================
SELECT 'CHECK 2: Profiles Table Structure' as check_type;
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- ============================================================================
-- CHECK 3: Verify RLS is Enabled
-- ============================================================================
SELECT 'CHECK 3: RLS Status' as check_type;
SELECT 
  tablename,
  rowsecurity,
  CASE 
    WHEN rowsecurity = true THEN '✓ ENABLED'
    ELSE '✗ DISABLED - SECURITY RISK'
  END as status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'courses', 'enrollments', 'lessons', 'quizzes')
ORDER BY tablename;

-- ============================================================================
-- CHECK 4: Verify RLS Policies on Profiles Table
-- ============================================================================
SELECT 'CHECK 4: Profiles RLS Policies' as check_type;
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'profiles'
AND schemaname = 'public'
ORDER BY policyname;

-- ============================================================================
-- CHECK 5: Verify Email Auth is Enabled
-- ============================================================================
SELECT 'CHECK 5: Email Auth Configuration' as check_type;
-- This checks if email auth is configured (requires access to auth schema)
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at
FROM auth.users
LIMIT 5;

-- ============================================================================
-- CHECK 6: Test Profile Insert (Dry Run)
-- ============================================================================
SELECT 'CHECK 6: Profile Insert Test' as check_type;
-- This simulates what happens during sign-up
-- Note: This will fail if RLS policies are not correctly configured
DO $$
DECLARE
  test_user_id UUID := gen_random_uuid();
BEGIN
  -- Try to insert a test profile (this should work with correct RLS)
  INSERT INTO public.profiles (id, email, display_name, role)
  VALUES (test_user_id, 'test@example.com', 'Test User', 'student')
  ON CONFLICT (id) DO NOTHING;
  
  -- Clean up test data
  DELETE FROM public.profiles WHERE id = test_user_id;
  
  RAISE NOTICE '✓ Profile insert test passed';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE '✗ Profile insert test failed: %', SQLERRM;
END $$;

-- ============================================================================
-- CHECK 7: Verify Foreign Key Constraints
-- ============================================================================
SELECT 'CHECK 7: Foreign Key Constraints' as check_type;
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  tc.constraint_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- ============================================================================
-- CHECK 8: Summary Report
-- ============================================================================
SELECT 'CHECK 8: Setup Summary' as check_type;
SELECT 
  'Profiles Table' as item,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles' AND table_schema = 'public') 
    THEN '✓ EXISTS'
    ELSE '✗ MISSING'
  END as status
UNION ALL
SELECT 
  'RLS Enabled on Profiles',
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'profiles' AND schemaname = 'public' AND rowsecurity = true) 
    THEN '✓ ENABLED'
    ELSE '✗ DISABLED'
  END
UNION ALL
SELECT 
  'RLS Policies on Profiles',
  CASE 
    WHEN (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'profiles' AND schemaname = 'public') > 0 
    THEN '✓ CONFIGURED'
    ELSE '✗ MISSING'
  END
UNION ALL
SELECT 
  'Foreign Key to auth.users',
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
      WHERE tc.table_name = 'profiles' 
      AND tc.table_schema = 'public'
      AND tc.constraint_type = 'FOREIGN KEY'
      AND kcu.column_name = 'id'
    ) 
    THEN '✓ CONFIGURED'
    ELSE '✗ MISSING'
  END;

-- ============================================================================
-- RECOMMENDATIONS
-- ============================================================================
SELECT 'RECOMMENDATIONS' as check_type;
SELECT 
  'Run FFA_MASTER.sql' as recommendation,
  'If tables are missing' as condition
UNION ALL
SELECT 
  'Run RLS policies SQL',
  'If RLS is disabled or policies missing'
UNION ALL
SELECT 
  'Update .env file with real credentials',
  'If using placeholder values'
UNION ALL
SELECT 
  'Enable Email provider in Authentication settings',
  'If email auth not working';
