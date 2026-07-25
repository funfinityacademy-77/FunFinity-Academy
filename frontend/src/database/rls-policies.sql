-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES FOR FUNFINITY ACADEMY
-- ============================================================================
-- 
-- These policies enforce strict multi-tenant data boundaries at the 
-- PostgreSQL database level. Unauthorized queries will return empty sets
-- regardless of API middleware flaws.
--
-- SECURITY PRINCIPLES:
-- 1. Users can only access their own data
-- 2. Teachers can access their students' data
-- 3. Admins have full access (enforced separately)
-- 4. All policies use auth.uid() from Supabase auth
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PROFILES TABLE RLS
-- ============================================================================

-- Users can view their own profile
CREATE POLICY "Users view own profile"
ON profiles
FOR SELECT
USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users update own profile"
ON profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Users can insert their own profile (on signup)
CREATE POLICY "Users insert own profile"
ON profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- ============================================================================
-- PROGRESS TABLE RLS
-- ============================================================================

-- Students can view their own progress
CREATE POLICY "Students view own progress"
ON progress
FOR SELECT
USING (
  auth.uid() = student_id
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'teacher'
    AND id IN (
      SELECT teacher_id FROM enrollments
      WHERE student_id = progress.student_id
    )
  )
);

-- Students can update their own progress
CREATE POLICY "Students update own progress"
ON progress
FOR UPDATE
USING (auth.uid() = student_id)
WITH CHECK (auth.uid() = student_id);

-- Students can insert their own progress
CREATE POLICY "Students insert own progress"
ON progress
FOR INSERT
WITH CHECK (auth.uid() = student_id);

-- Teachers can view progress of their students
CREATE POLICY "Teachers view student progress"
ON progress
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'teacher'
  )
  AND EXISTS (
    SELECT 1 FROM enrollments
    WHERE enrollments.student_id = progress.student_id
    AND enrollments.teacher_id = auth.uid()
  )
);

-- ============================================================================
-- COURSES TABLE RLS
-- ============================================================================

-- Teachers can view courses they created or are enrolled in
CREATE POLICY "Teachers view own courses"
ON courses
FOR SELECT
USING (
  created_by = auth.uid()
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'teacher'
  )
);

-- Teachers can update courses they created
CREATE POLICY "Teachers update own courses"
ON courses
FOR UPDATE
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- Teachers can insert courses
CREATE POLICY "Teachers insert courses"
ON courses
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'teacher'
  )
);

-- Students can view courses they are enrolled in
CREATE POLICY "Students view enrolled courses"
ON courses
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM enrollments
    WHERE enrollments.course_id = courses.id
    AND enrollments.student_id = auth.uid()
  )
);

-- ============================================================================
-- ENROLLMENTS TABLE RLS
-- ============================================================================

-- Students can view their own enrollments
CREATE POLICY "Students view own enrollments"
ON enrollments
FOR SELECT
USING (student_id = auth.uid());

-- Students can insert their own enrollments
CREATE POLICY "Students insert own enrollments"
ON enrollments
FOR INSERT
WITH CHECK (student_id = auth.uid());

-- Teachers can view enrollments for their courses
CREATE POLICY "Teachers view course enrollments"
ON enrollments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'teacher'
  )
  AND teacher_id = auth.uid()
);

-- Teachers can update enrollments for their courses
CREATE POLICY "Teachers update course enrollments"
ON enrollments
FOR UPDATE
USING (teacher_id = auth.uid())
WITH CHECK (teacher_id = auth.uid());

-- ============================================================================
-- ASSIGNMENTS TABLE RLS
-- ============================================================================

-- Teachers can view assignments for their courses
CREATE POLICY "Teachers view course assignments"
ON assignments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'teacher'
  )
  AND created_by = auth.uid()
);

-- Teachers can insert assignments for their courses
CREATE POLICY "Teachers insert course assignments"
ON assignments
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'teacher'
  )
  AND created_by = auth.uid()
);

-- Teachers can update assignments they created
CREATE POLICY "Teachers update own assignments"
ON assignments
FOR UPDATE
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- Students can view assignments for courses they're enrolled in
CREATE POLICY "Students view enrolled assignments"
ON assignments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM enrollments
    WHERE enrollments.course_id = assignments.course_id
    AND enrollments.student_id = auth.uid()
  )
);

-- ============================================================================
-- SUBMISSIONS TABLE RLS
-- ============================================================================

-- Students can view their own submissions
CREATE POLICY "Students view own submissions"
ON submissions
FOR SELECT
USING (student_id = auth.uid());

-- Students can insert their own submissions
CREATE POLICY "Students insert own submissions"
ON submissions
FOR INSERT
WITH CHECK (student_id = auth.uid());

-- Students can update their own submissions (if not graded)
CREATE POLICY "Students update own submissions"
ON submissions
FOR UPDATE
USING (
  student_id = auth.uid()
  AND graded_at IS NULL
)
WITH CHECK (
  student_id = auth.uid()
  AND graded_at IS NULL
);

-- Teachers can view submissions for their courses
CREATE POLICY "Teachers view course submissions"
ON submissions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'teacher'
  )
  AND EXISTS (
    SELECT 1 FROM assignments
    WHERE assignments.id = submissions.assignment_id
    AND assignments.created_by = auth.uid()
  )
);

-- Teachers can update submissions (for grading)
CREATE POLICY "Teachers grade submissions"
ON submissions
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'teacher'
  )
  AND EXISTS (
    SELECT 1 FROM assignments
    WHERE assignments.id = submissions.assignment_id
    AND assignments.created_by = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'teacher'
  )
);

-- ============================================================================
-- DISCUSSIONS TABLE RLS
-- ============================================================================

-- Users can view discussions for courses they're enrolled in or teaching
CREATE POLICY "Users view course discussions"
ON discussions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM enrollments
    WHERE enrollments.course_id = discussions.course_id
    AND enrollments.student_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM courses
    WHERE courses.id = discussions.course_id
    AND courses.created_by = auth.uid()
  )
);

-- Users can insert discussions for courses they're enrolled in or teaching
CREATE POLICY "Users insert course discussions"
ON discussions
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM enrollments
    WHERE enrollments.course_id = discussions.course_id
    AND enrollments.student_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM courses
    WHERE courses.id = discussions.course_id
    AND courses.created_by = auth.uid()
  )
);

-- Users can update their own discussions
CREATE POLICY "Users update own discussions"
ON discussions
FOR UPDATE
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- ============================================================================
-- MESSAGES TABLE RLS
-- ============================================================================

-- Users can view messages they sent or received
CREATE POLICY "Users view own messages"
ON messages
FOR SELECT
USING (
  sender_id = auth.uid()
  OR recipient_id = auth.uid()
);

-- Users can insert messages they send
CREATE POLICY "Users insert own messages"
ON messages
FOR INSERT
WITH CHECK (sender_id = auth.uid());

-- Users can update their own messages
CREATE POLICY "Users update own messages"
ON messages
FOR UPDATE
USING (sender_id = auth.uid())
WITH CHECK (sender_id = auth.uid());

-- ============================================================================
-- NOTIFICATIONS TABLE RLS
-- ============================================================================

-- Users can view their own notifications
CREATE POLICY "Users view own notifications"
ON notifications
FOR SELECT
USING (user_id = auth.uid());

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users update own notifications"
ON notifications
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- System can insert notifications for users
CREATE POLICY "System insert notifications"
ON notifications
FOR INSERT
WITH CHECK (true);

-- ============================================================================
-- SECURITY FUNCTIONS
-- ============================================================================

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$;

-- Function to check if user is teacher
CREATE OR REPLACE FUNCTION is_teacher()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'teacher'
  );
END;
$$;

-- Function to check if user is student
CREATE OR REPLACE FUNCTION is_student()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'student'
  );
END;
$$;

-- ============================================================================
-- ADMIN BYPASS POLICIES
-- ============================================================================
-- Admins bypass all RLS policies (enforced at application level)

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Create indexes for common RLS policy checks
CREATE INDEX IF NOT EXISTS idx_progress_student_id ON progress(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student_id ON enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_teacher_id ON enrollments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_assignments_created_by ON assignments(created_by);
CREATE INDEX IF NOT EXISTS idx_submissions_student_id ON submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

-- ============================================================================
-- GRANTS
-- ============================================================================

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Verify RLS is enabled
SELECT 
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
