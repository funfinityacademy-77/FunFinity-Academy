-- ============================================================================
-- FunFinity Academy - COMPREHENSIVE RLS POLICIES
-- ============================================================================
-- This script implements strict Row-Level Security (RLS) for all tables
-- Policies ensure:
-- 1) Students can only read/write their own records
-- 2) Teachers (instructors) can only read/write records for students in their courses
-- 3) Admins have full access
-- All policies use auth.uid() for user identification
-- ============================================================================

-- ============================================================================
-- HELPER FUNCTIONS FOR RLS
-- ============================================================================

-- Function to get current user's role
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT role FROM public.user_roles 
    WHERE user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if current user is instructor
CREATE OR REPLACE FUNCTION is_instructor()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'instructor'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if current user is student
CREATE OR REPLACE FUNCTION is_student()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'student'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get all course IDs for current instructor
CREATE OR REPLACE FUNCTION get_instructor_course_ids()
RETURNS UUID[] AS $$
BEGIN
  RETURN ARRAY(
    SELECT id FROM public.courses 
    WHERE instructor_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is enrolled in a specific course
CREATE OR REPLACE FUNCTION is_user_enrolled_in_course(p_course_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.enrollments 
    WHERE user_id = auth.uid() AND course_id = p_course_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is the instructor of a specific course
CREATE OR REPLACE FUNCTION is_instructor_of_course(p_course_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.courses 
    WHERE id = p_course_id AND instructor_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_current_user_role TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin TO authenticated;
GRANT EXECUTE ON FUNCTION is_instructor TO authenticated;
GRANT EXECUTE ON FUNCTION is_student TO authenticated;
GRANT EXECUTE ON FUNCTION get_instructor_course_ids TO authenticated;
GRANT EXECUTE ON FUNCTION is_user_enrolled_in_course TO authenticated;
GRANT EXECUTE ON FUNCTION is_instructor_of_course TO authenticated;

-- ============================================================================
-- PROFILES TABLE RLS POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Students can view their own profile
DROP POLICY IF EXISTS "Students can view own profile" ON public.profiles;
CREATE POLICY "Students can view own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    id = auth.uid() OR is_admin()
  );

-- Policy: Students can update their own profile
DROP POLICY IF EXISTS "Students can update own profile" ON public.profiles;
CREATE POLICY "Students can update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (
    id = auth.uid() OR is_admin()
  );

-- Policy: Instructors can view profiles of students in their courses
DROP POLICY IF EXISTS "Instructors can view student profiles in their courses" ON public.profiles;
CREATE POLICY "Instructors can view student profiles in their courses" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    is_admin() OR
    is_instructor() AND (
      id IN (
        SELECT user_id FROM public.enrollments
        WHERE course_id IN (SELECT id FROM public.courses WHERE instructor_id = auth.uid())
      )
    )
  );

-- Policy: Admins have full access to profiles
DROP POLICY IF EXISTS "Admins have full access to profiles" ON public.profiles;
CREATE POLICY "Admins have full access to profiles" ON public.profiles
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Policy: Service role has full access
DROP POLICY IF EXISTS "Service role can manage profiles" ON public.profiles;
CREATE POLICY "Service role can manage profiles" ON public.profiles
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- USER_ROLES TABLE RLS POLICIES
-- ============================================================================

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own role
DROP POLICY IF EXISTS "Users can view own role" ON public.user_roles;
CREATE POLICY "Users can view own role" ON public.user_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR is_admin());

-- Policy: Only admins can manage user roles
DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;
CREATE POLICY "Admins can manage user roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Policy: Service role has full access
DROP POLICY IF EXISTS "Service role can manage user roles" ON public.user_roles;
CREATE POLICY "Service role can manage user roles" ON public.user_roles
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- COURSES TABLE RLS POLICIES
-- ============================================================================

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Policy: Public can view published courses
DROP POLICY IF EXISTS "Public can view published courses" ON public.courses;
CREATE POLICY "Public can view published courses" ON public.courses
  FOR SELECT TO public
  USING (published = true);

-- Policy: Students can view courses they are enrolled in
DROP POLICY IF EXISTS "Students can view enrolled courses" ON public.courses;
CREATE POLICY "Students can view enrolled courses" ON public.courses
  FOR SELECT TO authenticated
  USING (
    published = true OR
    id IN (SELECT course_id FROM public.enrollments WHERE user_id = auth.uid()) OR
    is_admin()
  );

-- Policy: Instructors can view and manage their own courses
DROP POLICY IF EXISTS "Instructors can manage own courses" ON public.courses;
CREATE POLICY "Instructors can manage own courses" ON public.courses
  FOR ALL TO authenticated
  USING (
    instructor_id = auth.uid() OR is_admin()
  )
  WITH CHECK (
    instructor_id = auth.uid() OR is_admin()
  );

-- Policy: Admins have full access to courses
DROP POLICY IF EXISTS "Admins have full access to courses" ON public.courses;
CREATE POLICY "Admins have full access to courses" ON public.courses
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Policy: Service role has full access
DROP POLICY IF EXISTS "Service role can manage courses" ON public.courses;
CREATE POLICY "Service role can manage courses" ON public.courses
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- LESSONS TABLE RLS POLICIES
-- ============================================================================

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- Policy: Public can view published lessons
DROP POLICY IF EXISTS "Public can view published lessons" ON public.lessons;
CREATE POLICY "Public can view published lessons" ON public.lessons
  FOR SELECT TO public
  USING (
    published = true AND
    course_id IN (SELECT id FROM public.courses WHERE published = true)
  );

-- Policy: Students can view lessons from enrolled courses
DROP POLICY IF EXISTS "Students can view enrolled course lessons" ON public.lessons;
CREATE POLICY "Students can view enrolled course lessons" ON public.lessons
  FOR SELECT TO authenticated
  USING (
    published = true OR
    course_id IN (SELECT course_id FROM public.enrollments WHERE user_id = auth.uid()) OR
    is_admin()
  );

-- Policy: Instructors can view and manage lessons in their courses
DROP POLICY IF EXISTS "Instructors can manage lessons in their courses" ON public.lessons;
CREATE POLICY "Instructors can manage lessons in their courses" ON public.lessons
  FOR ALL TO authenticated
  USING (
    course_id IN (SELECT id FROM public.courses WHERE instructor_id = auth.uid()) OR is_admin()
  )
  WITH CHECK (
    course_id IN (SELECT id FROM public.courses WHERE instructor_id = auth.uid()) OR is_admin()
  );

-- Policy: Service role has full access
DROP POLICY IF EXISTS "Service role can manage lessons" ON public.lessons;
CREATE POLICY "Service role can manage lessons" ON public.lessons
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- ENROLLMENTS TABLE RLS POLICIES
-- ============================================================================

ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- Policy: Students can view their own enrollments
DROP POLICY IF EXISTS "Students can view own enrollments" ON public.enrollments;
CREATE POLICY "Students can view own enrollments" ON public.enrollments
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR is_admin());

-- Policy: Students can create their own enrollments
DROP POLICY IF EXISTS "Students can create own enrollments" ON public.enrollments;
CREATE POLICY "Students can create own enrollments" ON public.enrollments
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Policy: Students can update their own enrollments (progress)
DROP POLICY IF EXISTS "Students can update own enrollments" ON public.enrollments;
CREATE POLICY "Students can update own enrollments" ON public.enrollments
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR is_admin())
  WITH CHECK (user_id = auth.uid() OR is_admin());

-- Policy: Instructors can view enrollments in their courses
DROP POLICY IF EXISTS "Instructors can view enrollments in their courses" ON public.enrollments;
CREATE POLICY "Instructors can view enrollments in their courses" ON public.enrollments
  FOR SELECT TO authenticated
  USING (
    course_id IN (SELECT id FROM public.courses WHERE instructor_id = auth.uid()) OR is_admin()
  );

-- Policy: Instructors can update enrollments in their courses
DROP POLICY IF EXISTS "Instructors can update enrollments in their courses" ON public.enrollments;
CREATE POLICY "Instructors can update enrollments in their courses" ON public.enrollments
  FOR UPDATE TO authenticated
  USING (
    course_id IN (SELECT id FROM public.courses WHERE instructor_id = auth.uid()) OR is_admin()
  )
  WITH CHECK (
    course_id IN (SELECT id FROM public.courses WHERE instructor_id = auth.uid()) OR is_admin()
  );

-- Policy: Service role has full access
DROP POLICY IF EXISTS "Service role can manage enrollments" ON public.enrollments;
CREATE POLICY "Service role can manage enrollments" ON public.enrollments
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- COURSE_PROGRESS TABLE RLS POLICIES
-- ============================================================================

ALTER TABLE public.course_progress ENABLE ROW LEVEL SECURITY;

-- Policy: Students can view their own progress
DROP POLICY IF EXISTS "Students can view own progress" ON public.course_progress;
CREATE POLICY "Students can view own progress" ON public.course_progress
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR is_admin());

-- Policy: Students can create their own progress
DROP POLICY IF EXISTS "Students can create own progress" ON public.course_progress;
CREATE POLICY "Students can create own progress" ON public.course_progress
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Policy: Students can update their own progress
DROP POLICY IF EXISTS "Students can update own progress" ON public.course_progress;
CREATE POLICY "Students can update own progress" ON public.course_progress
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR is_admin())
  WITH CHECK (user_id = auth.uid() OR is_admin());

-- Policy: Instructors can view progress in their courses
DROP POLICY IF EXISTS "Instructors can view progress in their courses" ON public.course_progress;
CREATE POLICY "Instructors can view progress in their courses" ON public.course_progress
  FOR SELECT TO authenticated
  USING (
    course_id IN (SELECT id FROM public.courses WHERE instructor_id = auth.uid()) OR is_admin()
  );

-- Policy: Instructors can update progress in their courses
DROP POLICY IF EXISTS "Instructors can update progress in their courses" ON public.course_progress;
CREATE POLICY "Instructors can update progress in their courses" ON public.course_progress
  FOR UPDATE TO authenticated
  USING (
    course_id IN (SELECT id FROM public.courses WHERE instructor_id = auth.uid()) OR is_admin()
  )
  WITH CHECK (
    course_id IN (SELECT id FROM public.courses WHERE instructor_id = auth.uid()) OR is_admin()
  );

-- Policy: Service role has full access
DROP POLICY IF EXISTS "Service role can manage course_progress" ON public.course_progress;
CREATE POLICY "Service role can manage course_progress" ON public.course_progress
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- QUIZZES TABLE RLS POLICIES
-- ============================================================================

ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

-- Policy: Students can view quizzes in enrolled courses
DROP POLICY IF EXISTS "Students can view quizzes in enrolled courses" ON public.quizzes;
CREATE POLICY "Students can view quizzes in enrolled courses" ON public.quizzes
  FOR SELECT TO authenticated
  USING (
    published = true OR
    course_id IN (SELECT course_id FROM public.enrollments WHERE user_id = auth.uid()) OR
    is_admin()
  );

-- Policy: Instructors can view and manage quizzes in their courses
DROP POLICY IF EXISTS "Instructors can manage quizzes in their courses" ON public.quizzes;
CREATE POLICY "Instructors can manage quizzes in their courses" ON public.quizzes
  FOR ALL TO authenticated
  USING (
    course_id IN (SELECT id FROM public.courses WHERE instructor_id = auth.uid()) OR is_admin()
  )
  WITH CHECK (
    course_id IN (SELECT id FROM public.courses WHERE instructor_id = auth.uid()) OR is_admin()
  );

-- Policy: Service role has full access
DROP POLICY IF EXISTS "Service role can manage quizzes" ON public.quizzes;
CREATE POLICY "Service role can manage quizzes" ON public.quizzes
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- QUIZ_QUESTIONS TABLE RLS POLICIES
-- ============================================================================

ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;

-- Policy: Students can view questions from published quizzes in enrolled courses
DROP POLICY IF EXISTS "Students can view quiz questions" ON public.quiz_questions;
CREATE POLICY "Students can view quiz questions" ON public.quiz_questions
  FOR SELECT TO authenticated
  USING (
    quiz_id IN (
      SELECT id FROM public.quizzes
      WHERE published = true OR course_id IN (
        SELECT course_id FROM public.enrollments WHERE user_id = auth.uid()
      )
    ) OR is_admin()
  );

-- Policy: Instructors can view and manage questions in their course quizzes
DROP POLICY IF EXISTS "Instructors can manage quiz questions" ON public.quiz_questions;
CREATE POLICY "Instructors can manage quiz questions" ON public.quiz_questions
  FOR ALL TO authenticated
  USING (
    quiz_id IN (
      SELECT id FROM public.quizzes
      WHERE course_id IN (SELECT id FROM public.courses WHERE instructor_id = auth.uid())
    ) OR is_admin()
  )
  WITH CHECK (
    quiz_id IN (
      SELECT id FROM public.quizzes
      WHERE course_id IN (SELECT id FROM public.courses WHERE instructor_id = auth.uid())
    ) OR is_admin()
  );

-- Policy: Service role has full access
DROP POLICY IF EXISTS "Service role can manage quiz_questions" ON public.quiz_questions;
CREATE POLICY "Service role can manage quiz_questions" ON public.quiz_questions
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- QUIZ_SUBMISSIONS TABLE RLS POLICIES
-- ============================================================================

ALTER TABLE public.quiz_submissions ENABLE ROW LEVEL SECURITY;

-- Policy: Students can view their own submissions
DROP POLICY IF EXISTS "Students can view own quiz submissions" ON public.quiz_submissions;
CREATE POLICY "Students can view own quiz submissions" ON public.quiz_submissions
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR is_admin());

-- Policy: Students can create their own submissions
DROP POLICY IF EXISTS "Students can create own quiz submissions" ON public.quiz_submissions;
CREATE POLICY "Students can create own quiz submissions" ON public.quiz_submissions
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Policy: Instructors can view submissions in their courses
DROP POLICY IF EXISTS "Instructors can view quiz submissions in their courses" ON public.quiz_submissions;
CREATE POLICY "Instructors can view quiz submissions in their courses" ON public.quiz_submissions
  FOR SELECT TO authenticated
  USING (
    quiz_id IN (
      SELECT id FROM public.quizzes
      WHERE course_id IN (SELECT id FROM public.courses WHERE instructor_id = auth.uid())
    ) OR is_admin()
  );

-- Policy: Instructors can update submissions in their courses (grading)
DROP POLICY IF EXISTS "Instructors can grade quiz submissions" ON public.quiz_submissions;
CREATE POLICY "Instructors can grade quiz submissions" ON public.quiz_submissions
  FOR UPDATE TO authenticated
  USING (
    quiz_id IN (
      SELECT id FROM public.quizzes
      WHERE course_id IN (SELECT id FROM public.courses WHERE instructor_id = auth.uid())
    ) OR is_admin()
  )
  WITH CHECK (
    quiz_id IN (
      SELECT id FROM public.quizzes
      WHERE course_id IN (SELECT id FROM public.courses WHERE instructor_id = auth.uid())
    ) OR is_admin()
  );

-- Policy: Service role has full access
DROP POLICY IF EXISTS "Service role can manage quiz_submissions" ON public.quiz_submissions;
CREATE POLICY "Service role can manage quiz_submissions" ON public.quiz_submissions
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- ASSIGNMENTS TABLE RLS POLICIES
-- ============================================================================

ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

-- Policy: Students can view assignments in enrolled courses
DROP POLICY IF EXISTS "Students can view assignments in enrolled courses" ON public.assignments;
CREATE POLICY "Students can view assignments in enrolled courses" ON public.assignments
  FOR SELECT TO authenticated
  USING (
    course_id IN (SELECT course_id FROM public.enrollments WHERE user_id = auth.uid()) OR is_admin()
  );

-- Policy: Instructors can view and manage assignments in their courses
DROP POLICY IF EXISTS "Instructors can manage assignments in their courses" ON public.assignments;
CREATE POLICY "Instructors can manage assignments in their courses" ON public.assignments
  FOR ALL TO authenticated
  USING (
    course_id IN (SELECT id FROM public.courses WHERE instructor_id = auth.uid()) OR is_admin()
  )
  WITH CHECK (
    course_id IN (SELECT id FROM public.courses WHERE instructor_id = auth.uid()) OR is_admin()
  );

-- Policy: Service role has full access
DROP POLICY IF EXISTS "Service role can manage assignments" ON public.assignments;
CREATE POLICY "Service role can manage assignments" ON public.assignments
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- ASSIGNMENT_SUBMISSIONS TABLE RLS POLICIES
-- ============================================================================

ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;

-- Policy: Students can view their own submissions
DROP POLICY IF EXISTS "Students can view own assignment submissions" ON public.assignment_submissions;
CREATE POLICY "Students can view own assignment submissions" ON public.assignment_submissions
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR is_admin());

-- Policy: Students can create their own submissions
DROP POLICY IF EXISTS "Students can create own assignment submissions" ON public.assignment_submissions;
CREATE POLICY "Students can create own assignment submissions" ON public.assignment_submissions
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Policy: Students can update their own submissions (before grading)
DROP POLICY IF EXISTS "Students can update own assignment submissions" ON public.assignment_submissions;
CREATE POLICY "Students can update own assignment submissions" ON public.assignment_submissions
  FOR UPDATE TO authenticated
  USING (
    user_id = auth.uid() AND graded_at IS NULL OR is_admin()
  )
  WITH CHECK (
    user_id = auth.uid() AND graded_at IS NULL OR is_admin()
  );

-- Policy: Instructors can view submissions in their courses
DROP POLICY IF EXISTS "Instructors can view assignment submissions in their courses" ON public.assignment_submissions;
CREATE POLICY "Instructors can view assignment submissions in their courses" ON public.assignment_submissions
  FOR SELECT TO authenticated
  USING (
    assignment_id IN (
      SELECT id FROM public.assignments
      WHERE course_id IN (SELECT id FROM public.courses WHERE instructor_id = auth.uid())
    ) OR is_admin()
  );

-- Policy: Instructors can grade submissions in their courses
DROP POLICY IF EXISTS "Instructors can grade assignment submissions" ON public.assignment_submissions;
CREATE POLICY "Instructors can grade assignment submissions" ON public.assignment_submissions
  FOR UPDATE TO authenticated
  USING (
    assignment_id IN (
      SELECT id FROM public.assignments
      WHERE course_id IN (SELECT id FROM public.courses WHERE instructor_id = auth.uid())
    ) OR is_admin()
  )
  WITH CHECK (
    assignment_id IN (
      SELECT id FROM public.assignments
      WHERE course_id IN (SELECT id FROM public.courses WHERE instructor_id = auth.uid())
    ) OR is_admin()
  );

-- Policy: Service role has full access
DROP POLICY IF EXISTS "Service role can manage assignment_submissions" ON public.assignment_submissions;
CREATE POLICY "Service role can manage assignment_submissions" ON public.assignment_submissions
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- ANNOUNCEMENTS TABLE RLS POLICIES
-- ============================================================================

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Policy: Public can view published announcements
DROP POLICY IF EXISTS "Public can view published announcements" ON public.announcements;
CREATE POLICY "Public can view published announcements" ON public.announcements
  FOR SELECT TO public
  USING (published = true);

-- Policy: Instructors can view and manage announcements
DROP POLICY IF EXISTS "Instructors can manage announcements" ON public.announcements;
CREATE POLICY "Instructors can manage announcements" ON public.announcements
  FOR ALL TO authenticated
  USING (is_admin() OR is_instructor())
  WITH CHECK (is_admin() OR is_instructor());

-- Policy: Service role has full access
DROP POLICY IF EXISTS "Service role can manage announcements" ON public.announcements;
CREATE POLICY "Service role can manage announcements" ON public.announcements
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- FORUM_POSTS TABLE RLS POLICIES
-- ============================================================================

ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;

-- Policy: Public can view posts in published courses
DROP POLICY IF EXISTS "Public can view forum posts" ON public.forum_posts;
CREATE POLICY "Public can view forum posts" ON public.forum_posts
  FOR SELECT TO public
  USING (
    course_id IS NULL OR
    course_id IN (SELECT id FROM public.courses WHERE published = true)
  );

-- Policy: Authenticated users can view posts in enrolled courses
DROP POLICY IF EXISTS "Users can view forum posts in enrolled courses" ON public.forum_posts;
CREATE POLICY "Users can view forum posts in enrolled courses" ON public.forum_posts
  FOR SELECT TO authenticated
  USING (
    course_id IS NULL OR
    course_id IN (SELECT course_id FROM public.enrollments WHERE user_id = auth.uid()) OR
    is_admin()
  );

-- Policy: Users can create posts in enrolled courses
DROP POLICY IF EXISTS "Users can create forum posts" ON public.forum_posts;
CREATE POLICY "Users can create forum posts" ON public.forum_posts
  FOR INSERT TO authenticated
  WITH CHECK (
    author_id = auth.uid() AND
    (course_id IS NULL OR course_id IN (SELECT course_id FROM public.enrollments WHERE user_id = auth.uid()))
  );

-- Policy: Users can update their own posts
DROP POLICY IF EXISTS "Users can update own forum posts" ON public.forum_posts;
CREATE POLICY "Users can update own forum posts" ON public.forum_posts
  FOR UPDATE TO authenticated
  USING (author_id = auth.uid() OR is_admin())
  WITH CHECK (author_id = auth.uid() OR is_admin());

-- Policy: Instructors can delete posts in their courses
DROP POLICY IF EXISTS "Instructors can delete forum posts in their courses" ON public.forum_posts;
CREATE POLICY "Instructors can delete forum posts in their courses" ON public.forum_posts
  FOR DELETE TO authenticated
  USING (
    author_id = auth.uid() OR
    course_id IN (SELECT id FROM public.courses WHERE instructor_id = auth.uid()) OR
    is_admin()
  );

-- Policy: Service role has full access
DROP POLICY IF EXISTS "Service role can manage forum_posts" ON public.forum_posts;
CREATE POLICY "Service role can manage forum_posts" ON public.forum_posts
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- FORUM_REPLIES TABLE RLS POLICIES
-- ============================================================================

ALTER TABLE public.forum_replies ENABLE ROW LEVEL SECURITY;

-- Policy: Public can view replies
DROP POLICY IF EXISTS "Public can view forum replies" ON public.forum_replies;
CREATE POLICY "Public can view forum replies" ON public.forum_replies
  FOR SELECT TO public
  USING (true);

-- Policy: Users can create replies
DROP POLICY IF EXISTS "Users can create forum replies" ON public.forum_replies;
CREATE POLICY "Users can create forum replies" ON public.forum_replies
  FOR INSERT TO authenticated
  WITH CHECK (author_id = auth.uid());

-- Policy: Users can update their own replies
DROP POLICY IF EXISTS "Users can update own forum replies" ON public.forum_replies;
CREATE POLICY "Users can update own forum replies" ON public.forum_replies
  FOR UPDATE TO authenticated
  USING (author_id = auth.uid() OR is_admin())
  WITH CHECK (author_id = auth.uid() OR is_admin());

-- Policy: Service role has full access
DROP POLICY IF EXISTS "Service role can manage forum_replies" ON public.forum_replies;
CREATE POLICY "Service role can manage forum_replies" ON public.forum_replies
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- MESSAGES TABLE RLS POLICIES
-- ============================================================================

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view messages in conversations they are members of
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
CREATE POLICY "Users can view messages in their conversations" ON public.messages
  FOR SELECT TO authenticated
  USING (
    conversation_id IN (
      SELECT conversation_id FROM public.conversation_members
      WHERE user_id = auth.uid()
    ) OR is_admin()
  );

-- Policy: Users can create messages in conversations they are members of
DROP POLICY IF EXISTS "Users can create messages in their conversations" ON public.messages;
CREATE POLICY "Users can create messages in their conversations" ON public.messages
  FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid() AND
    conversation_id IN (
      SELECT conversation_id FROM public.conversation_members
      WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can update their own messages (mark as read)
DROP POLICY IF EXISTS "Users can update own messages" ON public.messages;
CREATE POLICY "Users can update own messages" ON public.messages
  FOR UPDATE TO authenticated
  USING (
    sender_id = auth.uid() OR
    conversation_id IN (
      SELECT conversation_id FROM public.conversation_members
      WHERE user_id = auth.uid()
    ) OR is_admin()
  )
  WITH CHECK (
    sender_id = auth.uid() OR
    conversation_id IN (
      SELECT conversation_id FROM public.conversation_members
      WHERE user_id = auth.uid()
    ) OR is_admin()
  );

-- Policy: Service role has full access
DROP POLICY IF EXISTS "Service role can manage messages" ON public.messages;
CREATE POLICY "Service role can manage messages" ON public.messages
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- CONVERSATIONS TABLE RLS POLICIES
-- ============================================================================

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view conversations they are members of
DROP POLICY IF EXISTS "Users can view conversations they are members of" ON public.conversations;
CREATE POLICY "Users can view conversations they are members of" ON public.conversations
  FOR SELECT TO authenticated
  USING (
    id IN (
      SELECT conversation_id FROM public.conversation_members
      WHERE user_id = auth.uid()
    ) OR is_admin()
  );

-- Policy: Users can create conversations
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
CREATE POLICY "Users can create conversations" ON public.conversations
  FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

-- Policy: Users can update their own conversations
DROP POLICY IF EXISTS "Users can update own conversations" ON public.conversations;
CREATE POLICY "Users can update own conversations" ON public.conversations
  FOR UPDATE TO authenticated
  USING (created_by = auth.uid() OR is_admin())
  WITH CHECK (created_by = auth.uid() OR is_admin());

-- Policy: Service role has full access
DROP POLICY IF EXISTS "Service role can manage conversations" ON public.conversations;
CREATE POLICY "Service role can manage conversations" ON public.conversations
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- CONVERSATION_MEMBERS TABLE RLS POLICIES
-- ============================================================================

ALTER TABLE public.conversation_members ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view conversation memberships
DROP POLICY IF EXISTS "Users can view conversation memberships" ON public.conversation_members;
CREATE POLICY "Users can view conversation memberships" ON public.conversation_members
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid() OR
    conversation_id IN (
      SELECT conversation_id FROM public.conversation_members
      WHERE user_id = auth.uid()
    ) OR is_admin()
  );

-- Policy: Users can add members to conversations they created
DROP POLICY IF EXISTS "Users can add members to conversations" ON public.conversation_members;
CREATE POLICY "Users can add members to conversations" ON public.conversation_members
  FOR INSERT TO authenticated
  WITH CHECK (
    conversation_id IN (
      SELECT id FROM public.conversations WHERE created_by = auth.uid()
    )
  );

-- Policy: Service role has full access
DROP POLICY IF EXISTS "Service role can manage conversation_members" ON public.conversation_members;
CREATE POLICY "Service role can manage conversation_members" ON public.conversation_members
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- NOTES TABLE RLS POLICIES
-- ============================================================================

ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Policy: Students can view their own notes
DROP POLICY IF EXISTS "Students can view own notes" ON public.notes;
CREATE POLICY "Students can view own notes" ON public.notes
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR is_admin());

-- Policy: Students can create their own notes
DROP POLICY IF EXISTS "Students can create own notes" ON public.notes;
CREATE POLICY "Students can create own notes" ON public.notes
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Policy: Students can update their own notes
DROP POLICY IF EXISTS "Students can update own notes" ON public.notes;
CREATE POLICY "Students can update own notes" ON public.notes
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR is_admin())
  WITH CHECK (user_id = auth.uid() OR is_admin());

-- Policy: Students can delete their own notes
DROP POLICY IF EXISTS "Students can delete own notes" ON public.notes;
CREATE POLICY "Students can delete own notes" ON public.notes
  FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR is_admin());

-- Policy: Service role has full access
DROP POLICY IF EXISTS "Service role can manage notes" ON public.notes;
CREATE POLICY "Service role can manage notes" ON public.notes
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- BOOKMARKS TABLE RLS POLICIES
-- ============================================================================

ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

-- Policy: Students can view their own bookmarks
DROP POLICY IF EXISTS "Students can view own bookmarks" ON public.bookmarks;
CREATE POLICY "Students can view own bookmarks" ON public.bookmarks
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR is_admin());

-- Policy: Students can create their own bookmarks
DROP POLICY IF EXISTS "Students can create own bookmarks" ON public.bookmarks;
CREATE POLICY "Students can create own bookmarks" ON public.bookmarks
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Policy: Students can delete their own bookmarks
DROP POLICY IF EXISTS "Students can delete own bookmarks" ON public.bookmarks;
CREATE POLICY "Students can delete own bookmarks" ON public.bookmarks
  FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR is_admin());

-- Policy: Service role has full access
DROP POLICY IF EXISTS "Service role can manage bookmarks" ON public.bookmarks;
CREATE POLICY "Service role can manage bookmarks" ON public.bookmarks
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- LEARNING_DNA_PROFILES TABLE RLS POLICIES
-- ============================================================================

ALTER TABLE public.learning_dna_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Students can view their own learning DNA
DROP POLICY IF EXISTS "Students can view own learning DNA" ON public.learning_dna_profiles;
CREATE POLICY "Students can view own learning DNA" ON public.learning_dna_profiles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR is_admin());

-- Policy: Students can create their own learning DNA
DROP POLICY IF EXISTS "Students can create own learning DNA" ON public.learning_dna_profiles;
CREATE POLICY "Students can create own learning DNA" ON public.learning_dna_profiles
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Policy: Students can update their own learning DNA
DROP POLICY IF EXISTS "Students can update own learning DNA" ON public.learning_dna_profiles;
CREATE POLICY "Students can update own learning DNA" ON public.learning_dna_profiles
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR is_admin())
  WITH CHECK (user_id = auth.uid() OR is_admin());

-- Policy: Service role has full access
DROP POLICY IF EXISTS "Service role can manage learning_dna_profiles" ON public.learning_dna_profiles;
CREATE POLICY "Service role can manage learning_dna_profiles" ON public.learning_dna_profiles
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- CAREER_PROFILES TABLE RLS POLICIES
-- ============================================================================

ALTER TABLE public.career_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Students can view their own career profile
DROP POLICY IF EXISTS "Students can view own career profile" ON public.career_profiles;
CREATE POLICY "Students can view own career profile" ON public.career_profiles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR is_admin());

-- Policy: Students can create their own career profile
DROP POLICY IF EXISTS "Students can create own career profile" ON public.career_profiles;
CREATE POLICY "Students can create own career profile" ON public.career_profiles
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Policy: Students can update their own career profile
DROP POLICY IF EXISTS "Students can update own career profile" ON public.career_profiles;
CREATE POLICY "Students can update own career profile" ON public.career_profiles
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR is_admin())
  WITH CHECK (user_id = auth.uid() OR is_admin());

-- Policy: Service role has full access
DROP POLICY IF EXISTS "Service role can manage career_profiles" ON public.career_profiles;
CREATE POLICY "Service role can manage career_profiles" ON public.career_profiles
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- EXPERIENCE_LOGS TABLE RLS POLICIES
-- ============================================================================

ALTER TABLE public.experience_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Students can view their own experience logs
DROP POLICY IF EXISTS "Students can view own experience logs" ON public.experience_logs;
CREATE POLICY "Students can view own experience logs" ON public.experience_logs
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR is_admin());

-- Policy: Students can create their own experience logs
DROP POLICY IF EXISTS "Students can create own experience logs" ON public.experience_logs;
CREATE POLICY "Students can create own experience logs" ON public.experience_logs
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Policy: Students can update their own experience logs
DROP POLICY IF EXISTS "Students can update own experience logs" ON public.experience_logs;
CREATE POLICY "Students can update own experience logs" ON public.experience_logs
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR is_admin())
  WITH CHECK (user_id = auth.uid() OR is_admin());

-- Policy: Service role has full access
DROP POLICY IF EXISTS "Service role can manage experience_logs" ON public.experience_logs;
CREATE POLICY "Service role can manage experience_logs" ON public.experience_logs
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- BADGES TABLE RLS POLICIES
-- ============================================================================

ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

-- Policy: Public can view badges
DROP POLICY IF EXISTS "Public can view badges" ON public.badges;
CREATE POLICY "Public can view badges" ON public.badges
  FOR SELECT TO public
  USING (true);

-- Policy: Service role has full access
DROP POLICY IF EXISTS "Service role can manage badges" ON public.badges;
CREATE POLICY "Service role can manage badges" ON public.badges
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- USER_BADGES TABLE RLS POLICIES
-- ============================================================================

ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- Policy: Students can view their own badges
DROP POLICY IF EXISTS "Students can view own badges" ON public.user_badges;
CREATE POLICY "Students can view own badges" ON public.user_badges
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR is_admin());

-- Policy: Service role has full access
DROP POLICY IF EXISTS "Service role can manage user_badges" ON public.user_badges;
CREATE POLICY "Service role can manage user_badges" ON public.user_badges
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- POINTS_HISTORY TABLE RLS POLICIES
-- ============================================================================

ALTER TABLE public.points_history ENABLE ROW LEVEL SECURITY;

-- Policy: Students can view their own points history
DROP POLICY IF EXISTS "Students can view own points history" ON public.points_history;
CREATE POLICY "Students can view own points history" ON public.points_history
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR is_admin());

-- Policy: Service role has full access
DROP POLICY IF EXISTS "Service role can manage points_history" ON public.points_history;
CREATE POLICY "Service role can manage points_history" ON public.points_history
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- BUG_REPORTS TABLE RLS POLICIES
-- ============================================================================

ALTER TABLE public.bug_reports ENABLE ROW LEVEL SECURITY;

-- Policy: Students can view their own bug reports
DROP POLICY IF EXISTS "Students can view own bug reports" ON public.bug_reports;
CREATE POLICY "Students can view own bug reports" ON public.bug_reports
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR is_admin());

-- Policy: Students can create their own bug reports
DROP POLICY IF EXISTS "Students can create own bug reports" ON public.bug_reports;
CREATE POLICY "Students can create own bug reports" ON public.bug_reports
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Policy: Students can update their own bug reports
DROP POLICY IF EXISTS "Students can update own bug reports" ON public.bug_reports;
CREATE POLICY "Students can update own bug reports" ON public.bug_reports
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR is_admin())
  WITH CHECK (user_id = auth.uid() OR is_admin());

-- Policy: Service role has full access
DROP POLICY IF EXISTS "Service role can manage bug_reports" ON public.bug_reports;
CREATE POLICY "Service role can manage bug_reports" ON public.bug_reports
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- ACTIVITY_LOGS TABLE RLS POLICIES
-- ============================================================================

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Service role only can view activity logs
DROP POLICY IF EXISTS "Service role can view activity logs" ON public.activity_logs;
CREATE POLICY "Service role can view activity logs" ON public.activity_logs
  FOR SELECT TO service_role
  USING (true);

-- Policy: Service role can manage activity logs
DROP POLICY IF EXISTS "Service role can manage activity_logs" ON public.activity_logs;
CREATE POLICY "Service role can manage activity_logs" ON public.activity_logs
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- RESTRICTIONS TABLE RLS POLICIES
-- ============================================================================

ALTER TABLE public.restrictions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own restrictions
DROP POLICY IF EXISTS "Users can view own restrictions" ON public.restrictions;
CREATE POLICY "Users can view own restrictions" ON public.restrictions
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR is_admin());

-- Policy: Admins can manage restrictions
DROP POLICY IF EXISTS "Admins can manage restrictions" ON public.restrictions;
CREATE POLICY "Admins can manage restrictions" ON public.restrictions
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Policy: Service role has full access
DROP POLICY IF EXISTS "Service role can manage restrictions" ON public.restrictions;
CREATE POLICY "Service role can manage restrictions" ON public.restrictions
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- LIVE_CLASSES TABLE RLS POLICIES
-- ============================================================================

ALTER TABLE public.live_classes ENABLE ROW LEVEL SECURITY;

-- Policy: Students can view live classes in enrolled courses
DROP POLICY IF EXISTS "Students can view live classes in enrolled courses" ON public.live_classes;
CREATE POLICY "Students can view live classes in enrolled courses" ON public.live_classes
  FOR SELECT TO authenticated
  USING (
    course_id IN (SELECT course_id FROM public.enrollments WHERE user_id = auth.uid()) OR is_admin()
  );

-- Policy: Instructors can view and manage live classes in their courses
DROP POLICY IF EXISTS "Instructors can manage live classes in their courses" ON public.live_classes;
CREATE POLICY "Instructors can manage live classes in their courses" ON public.live_classes
  FOR ALL TO authenticated
  USING (
    course_id IN (SELECT id FROM public.courses WHERE instructor_id = auth.uid()) OR is_admin()
  )
  WITH CHECK (
    course_id IN (SELECT id FROM public.courses WHERE instructor_id = auth.uid()) OR is_admin()
  );

-- Policy: Service role has full access
DROP POLICY IF EXISTS "Service role can manage live_classes" ON public.live_classes;
CREATE POLICY "Service role can manage live_classes" ON public.live_classes
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- NOTIFICATIONS TABLE RLS POLICIES
-- ============================================================================

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Public can view active notifications
DROP POLICY IF EXISTS "Public can view active notifications" ON public.notifications;
CREATE POLICY "Public can view active notifications" ON public.notifications
  FOR SELECT TO public
  USING (active = true AND (expires_at IS NULL OR expires_at > NOW()));

-- Policy: Admins can manage notifications
DROP POLICY IF EXISTS "Admins can manage notifications" ON public.notifications;
CREATE POLICY "Admins can manage notifications" ON public.notifications
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Policy: Service role has full access
DROP POLICY IF EXISTS "Service role can manage notifications" ON public.notifications;
CREATE POLICY "Service role can manage notifications" ON public.notifications
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- ACADEMIC_PROFILES TABLE RLS POLICIES
-- ============================================================================

ALTER TABLE public.academic_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Students can view their own academic profile
DROP POLICY IF EXISTS "Students can view own academic profile" ON public.academic_profiles;
CREATE POLICY "Students can view own academic profile" ON public.academic_profiles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR is_admin());

-- Policy: Students can create their own academic profile
DROP POLICY IF EXISTS "Students can create own academic profile" ON public.academic_profiles;
CREATE POLICY "Students can create own academic profile" ON public.academic_profiles
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Policy: Students can update their own academic profile
DROP POLICY IF EXISTS "Students can update own academic profile" ON public.academic_profiles;
CREATE POLICY "Students can update own academic profile" ON public.academic_profiles
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR is_admin())
  WITH CHECK (user_id = auth.uid() OR is_admin());

-- Policy: Service role has full access
DROP POLICY IF EXISTS "Service role can manage academic_profiles" ON public.academic_profiles;
CREATE POLICY "Service role can manage academic_profiles" ON public.academic_profiles
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- MILESTONES TABLE RLS POLICIES
-- ============================================================================

ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;

-- Policy: Students can view their own milestones
DROP POLICY IF EXISTS "Students can view own milestones" ON public.milestones;
CREATE POLICY "Students can view own milestones" ON public.milestones
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR is_admin());

-- Policy: Students can create their own milestones
DROP POLICY IF EXISTS "Students can create own milestones" ON public.milestones;
CREATE POLICY "Students can create own milestones" ON public.milestones
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Policy: Students can update their own milestones
DROP POLICY IF EXISTS "Students can update own milestones" ON public.milestones;
CREATE POLICY "Students can update own milestones" ON public.milestones
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR is_admin())
  WITH CHECK (user_id = auth.uid() OR is_admin());

-- Policy: Service role has full access
DROP POLICY IF EXISTS "Service role can manage milestones" ON public.milestones;
CREATE POLICY "Service role can manage milestones" ON public.milestones
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- RESUMES TABLE RLS POLICIES
-- ============================================================================

ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;

-- Policy: Students can view their own resume
DROP POLICY IF EXISTS "Students can view own resume" ON public.resumes;
CREATE POLICY "Students can view own resume" ON public.resumes
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR is_admin());

-- Policy: Students can create their own resume
DROP POLICY IF EXISTS "Students can create own resume" ON public.resumes;
CREATE POLICY "Students can create own resume" ON public.resumes
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Policy: Students can update their own resume
DROP POLICY IF EXISTS "Students can update own resume" ON public.resumes;
CREATE POLICY "Students can update own resume" ON public.resumes
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR is_admin())
  WITH CHECK (user_id = auth.uid() OR is_admin());

-- Policy: Service role has full access
DROP POLICY IF EXISTS "Service role can manage resumes" ON public.resumes;
CREATE POLICY "Service role can manage resumes" ON public.resumes
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- AI_MEMORY TABLE RLS POLICIES
-- ============================================================================

ALTER TABLE public.ai_memory ENABLE ROW LEVEL SECURITY;

-- Policy: Students can view their own AI memory
DROP POLICY IF EXISTS "Students can view own AI memory" ON public.ai_memory;
CREATE POLICY "Students can view own AI memory" ON public.ai_memory
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR is_admin());

-- Policy: Students can create their own AI memory
DROP POLICY IF EXISTS "Students can create own AI memory" ON public.ai_memory;
CREATE POLICY "Students can create own AI memory" ON public.ai_memory
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Policy: Students can update their own AI memory
DROP POLICY IF EXISTS "Students can update own AI memory" ON public.ai_memory;
CREATE POLICY "Students can update own AI memory" ON public.ai_memory
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR is_admin())
  WITH CHECK (user_id = auth.uid() OR is_admin());

-- Policy: Service role has full access
DROP POLICY IF EXISTS "Service role can manage AI memory" ON public.ai_memory;
CREATE POLICY "Service role can manage AI memory" ON public.ai_memory
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- AI_CONVERSATIONS TABLE RLS POLICIES
-- ============================================================================

ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;

-- Policy: Students can view their own AI conversations
DROP POLICY IF EXISTS "Students can view own AI conversations" ON public.ai_conversations;
CREATE POLICY "Students can view own AI conversations" ON public.ai_conversations
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR is_admin());

-- Policy: Students can create their own AI conversations
DROP POLICY IF EXISTS "Students can create own AI conversations" ON public.ai_conversations;
CREATE POLICY "Students can create own AI conversations" ON public.ai_conversations
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Policy: Students can update their own AI conversations
DROP POLICY IF EXISTS "Students can update own AI conversations" ON public.ai_conversations;
CREATE POLICY "Students can update own AI conversations" ON public.ai_conversations
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR is_admin())
  WITH CHECK (user_id = auth.uid() OR is_admin());

-- Policy: Service role has full access
DROP POLICY IF EXISTS "Service role can manage AI conversations" ON public.ai_conversations;
CREATE POLICY "Service role can manage AI conversations" ON public.ai_conversations
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- SUPPORT_TICKETS TABLE RLS POLICIES
-- ============================================================================

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Policy: Visitors can view their own tickets via session_id
DROP POLICY IF EXISTS "Visitors can view own tickets" ON public.support_tickets;
CREATE POLICY "Visitors can view own tickets" ON public.support_tickets
  FOR SELECT TO authenticated
  USING (session_id = current_setting('app.session_id', true));

-- Policy: Agents can view all tickets
DROP POLICY IF EXISTS "Agents can view all tickets" ON public.support_tickets;
CREATE POLICY "Agents can view all tickets" ON public.support_tickets
  FOR SELECT TO authenticated
  USING (is_admin() OR is_instructor());

-- Policy: Service role has full access
DROP POLICY IF EXISTS "Service role can manage support_tickets" ON public.support_tickets;
CREATE POLICY "Service role can manage support_tickets" ON public.support_tickets
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- TICKET_MESSAGES TABLE RLS POLICIES
-- ============================================================================

ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Visitors can view messages for their own tickets
DROP POLICY IF EXISTS "Visitors can view own ticket messages" ON public.ticket_messages;
CREATE POLICY "Visitors can view own ticket messages" ON public.ticket_messages
  FOR SELECT TO authenticated
  USING (
    ticket_id IN (
      SELECT id FROM public.support_tickets
      WHERE session_id = current_setting('app.session_id', true)
    )
  );

-- Policy: Agents can view all messages
DROP POLICY IF EXISTS "Agents can view all messages" ON public.ticket_messages;
CREATE POLICY "Agents can view all messages" ON public.ticket_messages
  FOR SELECT TO authenticated
  USING (is_admin() OR is_instructor());

-- Policy: Service role has full access
DROP POLICY IF EXISTS "Service role can manage ticket_messages" ON public.ticket_messages;
CREATE POLICY "Service role can manage ticket_messages" ON public.ticket_messages
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- SYSTEM_SUGGESTED_PLANS TABLE RLS POLICIES
-- ============================================================================

ALTER TABLE public.system_suggested_plans ENABLE ROW LEVEL SECURITY;

-- Policy: Students can view their own suggested plans
DROP POLICY IF EXISTS "Students can view own suggested plans" ON public.system_suggested_plans;
CREATE POLICY "Students can view own suggested plans" ON public.system_suggested_plans
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Policy: Admins can view all suggested plans
DROP POLICY IF EXISTS "Admins can view all suggested plans" ON public.system_suggested_plans;
CREATE POLICY "Admins can view all suggested plans" ON public.system_suggested_plans
  FOR SELECT TO authenticated
  USING (is_admin());

-- Policy: Admins can update all suggested plans
DROP POLICY IF EXISTS "Admins can update all suggested plans" ON public.system_suggested_plans;
CREATE POLICY "Admins can update all suggested plans" ON public.system_suggested_plans
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Policy: Service role has full access
DROP POLICY IF EXISTS "Service role can manage suggested plans" ON public.system_suggested_plans;
CREATE POLICY "Service role can manage suggested plans" ON public.system_suggested_plans
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- USER_PREFERENCES TABLE RLS POLICIES
-- ============================================================================

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Policy: Students can view their own preferences
DROP POLICY IF EXISTS "Students can view own preferences" ON public.user_preferences;
CREATE POLICY "Students can view own preferences" ON public.user_preferences
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR is_admin());

-- Policy: Students can create their own preferences
DROP POLICY IF EXISTS "Students can create own preferences" ON public.user_preferences;
CREATE POLICY "Students can create own preferences" ON public.user_preferences
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Policy: Students can update their own preferences
DROP POLICY IF EXISTS "Students can update own preferences" ON public.user_preferences;
CREATE POLICY "Students can update own preferences" ON public.user_preferences
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR is_admin())
  WITH CHECK (user_id = auth.uid() OR is_admin());

-- Policy: Service role has full access
DROP POLICY IF EXISTS "Service role can manage preferences" ON public.user_preferences;
CREATE POLICY "Service role can manage preferences" ON public.user_preferences
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- STORAGE_QUOTAS TABLE RLS POLICIES
-- ============================================================================

ALTER TABLE public.storage_quotas ENABLE ROW LEVEL SECURITY;

-- Policy: Students can view their own quota
DROP POLICY IF EXISTS "Students can view own quota" ON public.storage_quotas;
CREATE POLICY "Students can view own quota" ON public.storage_quotas
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Policy: Service role has full access
DROP POLICY IF EXISTS "Service role can manage quotas" ON public.storage_quotas;
CREATE POLICY "Service role can manage quotas" ON public.storage_quotas
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- CALENDAR_EVENTS TABLE RLS POLICIES
-- ============================================================================

ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

-- Policy: Students can view their own calendar events
DROP POLICY IF EXISTS "Students can view own calendar events" ON public.calendar_events;
CREATE POLICY "Students can view own calendar events" ON public.calendar_events
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR is_admin());

-- Policy: Students can create their own calendar events
DROP POLICY IF EXISTS "Students can create own calendar events" ON public.calendar_events;
CREATE POLICY "Students can create own calendar events" ON public.calendar_events
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Policy: Students can update their own calendar events
DROP POLICY IF EXISTS "Students can update own calendar events" ON public.calendar_events;
CREATE POLICY "Students can update own calendar events" ON public.calendar_events
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR is_admin())
  WITH CHECK (user_id = auth.uid() OR is_admin());

-- Policy: Students can delete their own calendar events
DROP POLICY IF EXISTS "Students can delete own calendar events" ON public.calendar_events;
CREATE POLICY "Students can delete own calendar events" ON public.calendar_events
  FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR is_admin());

-- Policy: Service role has full access
DROP POLICY IF EXISTS "Service role can manage calendar events" ON public.calendar_events;
CREATE POLICY "Service role can manage calendar events" ON public.calendar_events
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- GAMIFICATION_STATS TABLE RLS POLICIES
-- ============================================================================

ALTER TABLE public.gamification_stats ENABLE ROW LEVEL SECURITY;

-- Policy: Students can view their own stats
DROP POLICY IF EXISTS "Students can view own stats" ON public.gamification_stats;
CREATE POLICY "Students can view own stats" ON public.gamification_stats
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR is_admin());

-- Policy: Service role has full access
DROP POLICY IF EXISTS "Service role can manage stats" ON public.gamification_stats;
CREATE POLICY "Service role can manage stats" ON public.gamification_stats
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- SUPPORT_MESSAGES TABLE RLS POLICIES
-- ============================================================================

ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Students can view their own support messages
DROP POLICY IF EXISTS "Students can view own support messages" ON public.support_messages;
CREATE POLICY "Students can view own support messages" ON public.support_messages
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR is_admin());

-- Policy: Students can create their own support messages
DROP POLICY IF EXISTS "Students can create own support messages" ON public.support_messages;
CREATE POLICY "Students can create own support messages" ON public.support_messages
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Policy: Admins can view all support messages
DROP POLICY IF EXISTS "Admins can view all support messages" ON public.support_messages;
CREATE POLICY "Admins can view all support messages" ON public.support_messages
  FOR SELECT TO authenticated
  USING (is_admin());

-- Policy: Service role has full access
DROP POLICY IF EXISTS "Service role can manage support_messages" ON public.support_messages;
CREATE POLICY "Service role can manage support_messages" ON public.support_messages
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- PARENTAL_CONSENTS TABLE RLS POLICIES
-- ============================================================================

ALTER TABLE public.parental_consents ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view own parental consents
DROP POLICY IF EXISTS "Users can view own parental consents" ON public.parental_consents;
CREATE POLICY "Users can view own parental consents" ON public.parental_consents
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR is_admin());

-- Policy: Admins can view all parental consents
DROP POLICY IF EXISTS "Admins can view all parental consents" ON public.parental_consents;
CREATE POLICY "Admins can view all parental consents" ON public.parental_consents
  FOR SELECT TO authenticated
  USING (is_admin());

-- Policy: Service role has full access
DROP POLICY IF EXISTS "Service role can manage parental consents" ON public.parental_consents;
CREATE POLICY "Service role can manage parental consents" ON public.parental_consents
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- CONSENT_HISTORY TABLE RLS POLICIES
-- ============================================================================

ALTER TABLE public.consent_history ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view own consent history
DROP POLICY IF EXISTS "Users can view own consent history" ON public.consent_history;
CREATE POLICY "Users can view own consent history" ON public.consent_history
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Policy: Service role has full access
DROP POLICY IF EXISTS "Service role can manage consent history" ON public.consent_history;
CREATE POLICY "Service role can manage consent history" ON public.consent_history
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- DATA_DELETION_REQUESTS TABLE RLS POLICIES
-- ============================================================================

ALTER TABLE public.data_deletion_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view own deletion requests
DROP POLICY IF EXISTS "Users can view own deletion requests" ON public.data_deletion_requests;
CREATE POLICY "Users can view own deletion requests" ON public.data_deletion_requests
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Policy: Admins can manage deletion requests
DROP POLICY IF EXISTS "Admins can manage deletion requests" ON public.data_deletion_requests;
CREATE POLICY "Admins can manage deletion requests" ON public.data_deletion_requests
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Policy: Service role has full access
DROP POLICY IF EXISTS "Service role can manage deletion requests" ON public.data_deletion_requests;
CREATE POLICY "Service role can manage deletion requests" ON public.data_deletion_requests
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- DELETION_AUDIT_LOG TABLE RLS POLICIES
-- ============================================================================

ALTER TABLE public.deletion_audit_log ENABLE ROW LEVEL SECURITY;

-- Policy: Service role only can view deletion audit log
DROP POLICY IF EXISTS "Service role can view deletion audit log" ON public.deletion_audit_log;
CREATE POLICY "Service role can view deletion audit log" ON public.deletion_audit_log
  FOR SELECT TO service_role
  USING (true);

-- Policy: Service role can manage deletion audit log
DROP POLICY IF EXISTS "Service role can manage deletion_audit_log" ON public.deletion_audit_log;
CREATE POLICY "Service role can manage deletion_audit_log" ON public.deletion_audit_log
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- RLS POLICIES COMPLETE
-- ============================================================================
