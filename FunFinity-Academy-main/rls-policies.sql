-- ============================================================================
-- SUPABASE ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
-- This file implements comprehensive RLS policies for FunFinity Academy
-- to ensure data isolation and security compliance (FERPA, GDPR, COPPA)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_dna_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE experience_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PROFILES TABLE POLICIES
-- ============================================================================
-- Users can read their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile (on registration)
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Admins can read all profiles
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- LEARNING DNA PROFILES POLICIES
-- ============================================================================
-- Users can read their own learning DNA
CREATE POLICY "Users can view own learning DNA" ON learning_dna_profiles
  FOR SELECT USING (user_id = auth.uid());

-- Users can update their own learning DNA
CREATE POLICY "Users can update own learning DNA" ON learning_dna_profiles
  FOR UPDATE USING (user_id = auth.uid());

-- Users can insert their own learning DNA
CREATE POLICY "Users can insert own learning DNA" ON learning_dna_profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Admins can read all learning DNA profiles
CREATE POLICY "Admins can view all learning DNA" ON learning_dna_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- CAREER PROFILES POLICIES
-- ============================================================================
-- Users can read their own career profile
CREATE POLICY "Users can view own career profile" ON career_profiles
  FOR SELECT USING (user_id = auth.uid());

-- Users can update their own career profile
CREATE POLICY "Users can update own career profile" ON career_profiles
  FOR UPDATE USING (user_id = auth.uid());

-- Users can insert their own career profile
CREATE POLICY "Users can insert own career profile" ON career_profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Admins can read all career profiles
CREATE POLICY "Admins can view all career profiles" ON career_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- ACADEMIC PROFILES POLICIES
-- ============================================================================
-- Users can read their own academic profile
CREATE POLICY "Users can view own academic profile" ON academic_profiles
  FOR SELECT USING (user_id = auth.uid());

-- Users can update their own academic profile
CREATE POLICY "Users can update own academic profile" ON academic_profiles
  FOR UPDATE USING (user_id = auth.uid());

-- Users can insert their own academic profile
CREATE POLICY "Users can insert own academic profile" ON academic_profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Admins can read all academic profiles (FERPA compliance)
CREATE POLICY "Admins can view all academic profiles" ON academic_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- NOTES POLICIES
-- ============================================================================
-- Users can read their own notes
CREATE POLICY "Users can view own notes" ON notes
  FOR SELECT USING (user_id = auth.uid());

-- Users can update their own notes
CREATE POLICY "Users can update own notes" ON notes
  FOR UPDATE USING (user_id = auth.uid());

-- Users can insert their own notes
CREATE POLICY "Users can insert own notes" ON notes
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can delete their own notes
CREATE POLICY "Users can delete own notes" ON notes
  FOR DELETE USING (user_id = auth.uid());

-- ============================================================================
-- BOOKMARKS POLICIES
-- ============================================================================
-- Users can read their own bookmarks
CREATE POLICY "Users can view own bookmarks" ON bookmarks
  FOR SELECT USING (user_id = auth.uid());

-- Users can insert their own bookmarks
CREATE POLICY "Users can insert own bookmarks" ON bookmarks
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can delete their own bookmarks
CREATE POLICY "Users can delete own bookmarks" ON bookmarks
  FOR DELETE USING (user_id = auth.uid());

-- ============================================================================
-- EXPERIENCE LOGS POLICIES
-- ============================================================================
-- Users can read their own experience logs
CREATE POLICY "Users can view own experience logs" ON experience_logs
  FOR SELECT USING (user_id = auth.uid());

-- Users can insert their own experience logs
CREATE POLICY "Users can insert own experience logs" ON experience_logs
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Admins can read all experience logs
CREATE POLICY "Admins can view all experience logs" ON experience_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- MILESTONES POLICIES
-- ============================================================================
-- Users can read their own milestones
CREATE POLICY "Users can view own milestones" ON milestones
  FOR SELECT USING (user_id = auth.uid());

-- Users can update their own milestones
CREATE POLICY "Users can update own milestones" ON milestones
  FOR UPDATE USING (user_id = auth.uid());

-- Users can insert their own milestones
CREATE POLICY "Users can insert own milestones" ON milestones
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- QUIZ SUBMISSIONS POLICIES (FERPA COMPLIANCE)
-- ============================================================================
-- Users can read their own quiz submissions
CREATE POLICY "Users can view own quiz submissions" ON quiz_submissions
  FOR SELECT USING (user_id = auth.uid());

-- Users can insert their own quiz submissions
CREATE POLICY "Users can insert own quiz submissions" ON quiz_submissions
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Admins can read all quiz submissions (FERPA compliance)
CREATE POLICY "Admins can view all quiz submissions" ON quiz_submissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- ENROLLMENTS POLICIES
-- ============================================================================
-- Users can read their own enrollments
CREATE POLICY "Users can view own enrollments" ON enrollments
  FOR SELECT USING (user_id = auth.uid());

-- Users can insert their own enrollments
CREATE POLICY "Users can insert own enrollments" ON enrollments
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can update their own enrollments
CREATE POLICY "Users can update own enrollments" ON enrollments
  FOR UPDATE USING (user_id = auth.uid());

-- Admins can read all enrollments (FERPA compliance)
CREATE POLICY "Admins can view all enrollments" ON enrollments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- RESUMES POLICIES
-- ============================================================================
-- Users can read their own resume
CREATE POLICY "Users can view own resume" ON resumes
  FOR SELECT USING (user_id = auth.uid());

-- Users can update their own resume
CREATE POLICY "Users can update own resume" ON resumes
  FOR UPDATE USING (user_id = auth.uid());

-- Users can insert their own resume
CREATE POLICY "Users can insert own resume" ON resumes
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- USER ROLES POLICIES
-- ============================================================================
-- Users can read their own role
CREATE POLICY "Users can view own role" ON user_roles
  FOR SELECT USING (user_id = auth.uid());

-- Only admins can modify user roles
CREATE POLICY "Admins can update user roles" ON user_roles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can insert user roles
CREATE POLICY "Admins can insert user roles" ON user_roles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- PUBLIC TABLES (No RLS needed)
-- ============================================================================
-- Courses, quizzes, quiz_questions, quiz_options, notifications, announcements
-- are public read-only tables that don't require user-specific access control

-- ============================================================================
-- SECURITY FUNCTIONS
-- ============================================================================
-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- ============================================================================
-- NOTES FOR IMPLEMENTATION
-- ============================================================================
-- 1. Execute this SQL in the Supabase SQL Editor
-- 2. Verify RLS policies are active in the Authentication > Policies section
-- 3. Test with different user roles to ensure proper isolation
-- 4. Monitor RLS policy performance in Supabase dashboard
-- 5. Update policies as new tables or features are added
-- ============================================================================
