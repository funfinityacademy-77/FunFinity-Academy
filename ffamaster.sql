-- ============================================================================
-- FunFinity Academy - MASTER DATABASE SETUP
-- ============================================================================
-- This is the complete database setup for FunFinity Academy
-- Run this in Supabase SQL Editor to set up the entire database
-- ============================================================================

-- ============================================================================
-- SECTION 1: DATABASE SCHEMA
-- ============================================================================
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users and Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  grade TEXT,
  bio TEXT,
  role TEXT DEFAULT 'student',
  points INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  last_login_at TIMESTAMP WITH TIME ZONE,
  dna_complete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Roles for RBAC
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'student', 'instructor')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Courses
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  instructor_id UUID REFERENCES public.profiles(id),
  category TEXT,
  level TEXT DEFAULT 'beginner',
  duration INTEGER,
  price DECIMAL(10,2) DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lessons
CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  video_url TEXT,
  duration INTEGER,
  order_index INTEGER DEFAULT 0,
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enrollments
CREATE TABLE IF NOT EXISTS public.enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  progress INTEGER DEFAULT 0,
  UNIQUE(user_id, course_id)
);

-- Course Progress
CREATE TABLE IF NOT EXISTS public.course_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- Quizzes
CREATE TABLE IF NOT EXISTS public.quizzes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES public.profiles(id),
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quiz Questions
CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer INTEGER NOT NULL,
  explanation TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quiz Submissions
CREATE TABLE IF NOT EXISTS public.quiz_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  answers JSONB NOT NULL,
  score INTEGER,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, quiz_id)
);

-- Assignments
CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assignment Submissions
CREATE TABLE IF NOT EXISTS public.assignment_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT,
  file_url TEXT,
  grade INTEGER,
  feedback TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  graded_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, assignment_id)
);

-- Announcements
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES public.profiles(id),
  target_role TEXT DEFAULT 'all',
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Forum Posts
CREATE TABLE IF NOT EXISTS public.forum_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Forum Replies
CREATE TABLE IF NOT EXISTS public.forum_replies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversations (must be created before messages)
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversation Members
CREATE TABLE IF NOT EXISTS public.conversation_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(conversation_id, user_id)
);

-- Messages (references conversations, so must be after)
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notes
CREATE TABLE IF NOT EXISTS public.notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id),
  lesson_id UUID REFERENCES public.lessons(id),
  title TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookmarks
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id),
  lesson_id UUID REFERENCES public.lessons(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, course_id, lesson_id)
);

-- Learning DNA Profiles
CREATE TABLE IF NOT EXISTS public.learning_dna_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  learning_style TEXT,
  interests JSONB,
  goals JSONB,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Career Profiles
CREATE TABLE IF NOT EXISTS public.career_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  job_role TEXT,
  target_role TEXT,
  skills JSONB,
  experience_years INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Experience Logs
CREATE TABLE IF NOT EXISTS public.experience_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  company TEXT,
  description TEXT,
  start_date DATE,
  end_date DATE,
  reviewed_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gamification Badges
CREATE TABLE IF NOT EXISTS public.badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  requirement TEXT,
  points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Badges
CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Points History
CREATE TABLE IF NOT EXISTS public.points_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bug Reports
CREATE TABLE IF NOT EXISTS public.bug_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity Logs
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Restrictions (Bans, Timeouts, etc.)
CREATE TABLE IF NOT EXISTS public.restrictions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('ban', 'timeout', 'deletion_scheduled')),
  reason TEXT,
  imposed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  imposed_by TEXT,
  UNIQUE(user_id)
);

-- Live Classes
CREATE TABLE IF NOT EXISTS public.live_classes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id),
  title TEXT NOT NULL,
  description TEXT,
  instructor_id UUID REFERENCES public.profiles(id),
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration INTEGER,
  meeting_url TEXT,
  recording_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications (Admin Broadcast System)
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  active BOOLEAN DEFAULT TRUE,
  target_role TEXT DEFAULT 'all',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Academic Profiles (Grade Tracking System)
CREATE TABLE IF NOT EXISTS public.academic_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  school_name TEXT,
  school_type TEXT CHECK (school_type IN ('Public', 'Private', 'Charter', 'Homeschool')),
  grade_level TEXT,
  gpa DECIMAL(3,2),
  sat_score INTEGER,
  act_score INTEGER,
  intended_major TEXT,
  extracurriculars JSONB,
  achievements JSONB,
  courses JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Milestones (Career Progress Tracking)
CREATE TABLE IF NOT EXISTS public.milestones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  milestone_key TEXT NOT NULL,
  milestone_data JSONB,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, milestone_key)
);

-- Resumes (Career Portfolio)
CREATE TABLE IF NOT EXISTS public.resumes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  resume_data JSONB,
  pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to relevant tables
DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS user_roles_updated_at ON public.user_roles;
CREATE TRIGGER user_roles_updated_at BEFORE UPDATE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS courses_updated_at ON public.courses;
CREATE TRIGGER courses_updated_at BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS lessons_updated_at ON public.lessons;
CREATE TRIGGER lessons_updated_at BEFORE UPDATE ON public.lessons
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS quizzes_updated_at ON public.quizzes;
CREATE TRIGGER quizzes_updated_at BEFORE UPDATE ON public.quizzes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS assignments_updated_at ON public.assignments;
CREATE TRIGGER assignments_updated_at BEFORE UPDATE ON public.assignments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS announcements_updated_at ON public.announcements;
CREATE TRIGGER announcements_updated_at BEFORE UPDATE ON public.announcements
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS forum_posts_updated_at ON public.forum_posts;
CREATE TRIGGER forum_posts_updated_at BEFORE UPDATE ON public.forum_posts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS forum_replies_updated_at ON public.forum_replies;
CREATE TRIGGER forum_replies_updated_at BEFORE UPDATE ON public.forum_replies
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS conversations_updated_at ON public.conversations;
CREATE TRIGGER conversations_updated_at BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS notes_updated_at ON public.notes;
CREATE TRIGGER notes_updated_at BEFORE UPDATE ON public.notes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS learning_dna_profiles_updated_at ON public.learning_dna_profiles;
CREATE TRIGGER learning_dna_profiles_updated_at BEFORE UPDATE ON public.learning_dna_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS career_profiles_updated_at ON public.career_profiles;
CREATE TRIGGER career_profiles_updated_at BEFORE UPDATE ON public.career_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS bug_reports_updated_at ON public.bug_reports;
CREATE TRIGGER bug_reports_updated_at BEFORE UPDATE ON public.bug_reports
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS notifications_updated_at ON public.notifications;
CREATE TRIGGER notifications_updated_at BEFORE UPDATE ON public.notifications
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS academic_profiles_updated_at ON public.academic_profiles;
CREATE TRIGGER academic_profiles_updated_at BEFORE UPDATE ON public.academic_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS milestones_updated_at ON public.milestones;
CREATE TRIGGER milestones_updated_at BEFORE UPDATE ON public.milestones
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS resumes_updated_at ON public.resumes;
CREATE TRIGGER resumes_updated_at BEFORE UPDATE ON public.resumes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- SECTION 2: RLS POLICIES (with admin role fix)
-- ============================================================================
-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_dna_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experience_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bug_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restrictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;

-- Profiles policies - NO circular dependency
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated USING (id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND email IN ('funfinityacademy@gmail.com', 'academyfunfinity@gmail.com')
    )
  );

DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND email IN ('funfinityacademy@gmail.com', 'academyfunfinity@gmail.com')
    )
  );

-- Allow authenticated users to view all profiles for admin dashboard
DROP POLICY IF EXISTS "Authenticated can view all profiles" ON public.profiles;
CREATE POLICY "Authenticated can view all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Service role can manage profiles" ON public.profiles;
CREATE POLICY "Service role can manage profiles" ON public.profiles
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- User roles policies - NO circular dependency
DROP POLICY IF EXISTS "Users can view own role" ON public.user_roles;
CREATE POLICY "Users can view own role" ON public.user_roles
  FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all user roles" ON public.user_roles;
CREATE POLICY "Admins can view all user roles" ON public.user_roles
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND email IN ('funfinityacademy@gmail.com', 'academyfunfinity@gmail.com')
    )
  );

DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;
CREATE POLICY "Admins can manage user roles" ON public.user_roles
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND email IN ('funfinityacademy@gmail.com', 'academyfunfinity@gmail.com')
    )
  );

DROP POLICY IF EXISTS "Service role can manage user roles" ON public.user_roles;
CREATE POLICY "Service role can manage user roles" ON public.user_roles
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Restrictions policies
DROP POLICY IF EXISTS "Users can view own restrictions" ON public.restrictions;
CREATE POLICY "Users can view own restrictions" ON public.restrictions
  FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage restrictions" ON public.restrictions;
CREATE POLICY "Admins can manage restrictions" ON public.restrictions
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND email IN ('funfinityacademy@gmail.com', 'academyfunfinity@gmail.com')
    )
  );

DROP POLICY IF EXISTS "Service role can manage restrictions" ON public.restrictions;
CREATE POLICY "Service role can manage restrictions" ON public.restrictions
  FOR ALL TO service_role USING (true);

-- Courses policies
DROP POLICY IF EXISTS "Anyone can view published courses" ON public.courses;
CREATE POLICY "Anyone can view published courses" ON public.courses
  FOR SELECT TO public USING (published = true);

DROP POLICY IF EXISTS "Service role can manage courses" ON public.courses;
CREATE POLICY "Service role can manage courses" ON public.courses
  FOR ALL TO service_role USING (true);

-- Lessons policies
DROP POLICY IF EXISTS "Anyone can view published lessons" ON public.lessons;
CREATE POLICY "Anyone can view published lessons" ON public.lessons
  FOR SELECT TO public USING (published = true);

DROP POLICY IF EXISTS "Service role can manage lessons" ON public.lessons;
CREATE POLICY "Service role can manage lessons" ON public.lessons
  FOR ALL TO service_role USING (true);

-- Enrollments policies
DROP POLICY IF EXISTS "Users can view own enrollments" ON public.enrollments;
CREATE POLICY "Users can view own enrollments" ON public.enrollments
  FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create enrollments" ON public.enrollments;
CREATE POLICY "Users can create enrollments" ON public.enrollments
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Service role can view all enrollments" ON public.enrollments;
CREATE POLICY "Service role can view all enrollments" ON public.enrollments
  FOR SELECT TO service_role USING (true);

-- Announcements policies
DROP POLICY IF EXISTS "Public can view published announcements" ON public.announcements;
CREATE POLICY "Public can view published announcements" ON public.announcements
  FOR SELECT TO public USING (published = true);

DROP POLICY IF EXISTS "Service role can manage announcements" ON public.announcements;
CREATE POLICY "Service role can manage announcements" ON public.announcements
  FOR ALL TO service_role USING (true);

-- Notes policies
DROP POLICY IF EXISTS "Users can manage own notes" ON public.notes;
CREATE POLICY "Users can manage own notes" ON public.notes
  FOR ALL TO authenticated USING (user_id = auth.uid());

-- Bookmarks policies
DROP POLICY IF EXISTS "Users can manage own bookmarks" ON public.bookmarks;
CREATE POLICY "Users can manage own bookmarks" ON public.bookmarks
  FOR ALL TO authenticated USING (user_id = auth.uid());

-- Learning DNA policies
DROP POLICY IF EXISTS "Users can manage own learning DNA" ON public.learning_dna_profiles;
CREATE POLICY "Users can manage own learning DNA" ON public.learning_dna_profiles
  FOR ALL TO authenticated USING (user_id = auth.uid());

-- Career profiles policies
DROP POLICY IF EXISTS "Users can manage own career profile" ON public.career_profiles;
CREATE POLICY "Users can manage own career profile" ON public.career_profiles
  FOR ALL TO authenticated USING (user_id = auth.uid());

-- Experience logs policies
DROP POLICY IF EXISTS "Users can manage own experience logs" ON public.experience_logs;
CREATE POLICY "Users can manage own experience logs" ON public.experience_logs
  FOR ALL TO authenticated USING (user_id = auth.uid());

-- Badges policies
DROP POLICY IF EXISTS "Anyone can view badges" ON public.badges;
CREATE POLICY "Anyone can view badges" ON public.badges
  FOR SELECT TO public;

DROP POLICY IF EXISTS "Users can view own badges" ON public.user_badges;
CREATE POLICY "Users can view own badges" ON public.user_badges
  FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Points history policies
DROP POLICY IF EXISTS "Users can view own points history" ON public.points_history;
CREATE POLICY "Users can view own points history" ON public.points_history
  FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Bug reports policies
DROP POLICY IF EXISTS "Users can manage own bug reports" ON public.bug_reports;
CREATE POLICY "Users can manage own bug reports" ON public.bug_reports
  FOR ALL TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Service role can view all bug reports" ON public.bug_reports;
CREATE POLICY "Service role can view all bug reports" ON public.bug_reports
  FOR SELECT TO service_role USING (true);

-- Activity logs policies
DROP POLICY IF EXISTS "Service role can view activity logs" ON public.activity_logs;
CREATE POLICY "Service role can view activity logs" ON public.activity_logs
  FOR SELECT TO service_role USING (true);

-- Notifications policies
DROP POLICY IF EXISTS "Public can view active notifications" ON public.notifications;
CREATE POLICY "Public can view active notifications" ON public.notifications
  FOR SELECT TO public USING (active = true AND (expires_at IS NULL OR expires_at > NOW()));

DROP POLICY IF EXISTS "Service role can manage notifications" ON public.notifications;
CREATE POLICY "Service role can manage notifications" ON public.notifications
  FOR ALL TO service_role USING (true);

-- Academic profiles policies
DROP POLICY IF EXISTS "Users can manage own academic profile" ON public.academic_profiles;
CREATE POLICY "Users can manage own academic profile" ON public.academic_profiles
  FOR ALL TO authenticated USING (user_id = auth.uid());

-- Milestones policies
DROP POLICY IF EXISTS "Users can manage own milestones" ON public.milestones;
CREATE POLICY "Users can manage own milestones" ON public.milestones
  FOR ALL TO authenticated USING (user_id = auth.uid());

-- Resumes policies
DROP POLICY IF EXISTS "Users can manage own resume" ON public.resumes;
CREATE POLICY "Users can manage own resume" ON public.resumes
  FOR ALL TO authenticated USING (user_id = auth.uid());

-- ============================================================================
-- SECTION 3: ADMIN SETUP
-- ============================================================================
-- Function to automatically assign admin role based on email
CREATE OR REPLACE FUNCTION public.assign_admin_role()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the email matches admin emails
  IF NEW.email IN ('funfinityacademy@gmail.com', 'academyfunfinity@gmail.com') THEN
    -- Insert admin role if it doesn't exist
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
  ELSE
    -- Insert student role if it doesn't exist
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'student')
    ON CONFLICT (user_id) DO UPDATE SET role = 'student';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to assign roles on user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_admin_role();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    'student'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for profile creation
DROP TRIGGER IF EXISTS on_auth_user_signup ON auth.users;
CREATE TRIGGER on_auth_user_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Insert initial badges
INSERT INTO public.badges (name, description, icon_url, requirement, points) VALUES
  ('Early Bird', 'Logged in before 8 AM', '/badges/early-bird.png', 'Login before 8 AM', 50),
  ('Night Owl', 'Logged in after 10 PM', '/badges/night-owl.png', 'Login after 10 PM', 50),
  ('First Steps', 'Completed first lesson', '/badges/first-steps.png', 'Complete first lesson', 100),
  ('Quiz Master', 'Scored 100% on a quiz', '/badges/quiz-master.png', 'Score 100% on quiz', 150),
  ('Streak Champion', '7-day login streak', '/badges/streak-champion.png', '7-day streak', 200),
  ('Course Completer', 'Completed first course', '/badges/course-completer.png', 'Complete first course', 500)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SECTION 4: PERFORMANCE OPTIMIZATION
-- ============================================================================
-- Add indexes for foreign keys
CREATE INDEX IF NOT EXISTS idx_assignments_created_by ON public.assignments(created_by);
CREATE INDEX IF NOT EXISTS idx_conversations_created_by ON public.conversations(created_by);
CREATE INDEX IF NOT EXISTS idx_course_progress_lesson_id ON public.course_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_experience_logs_reviewed_by ON public.experience_logs(reviewed_by);
CREATE INDEX IF NOT EXISTS idx_forum_replies_author_id ON public.forum_replies(author_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_created_by ON public.quizzes(created_by);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_course_progress_user_course ON public.course_progress(user_id, course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_user_course ON public.enrollments(user_id, course_id);
CREATE INDEX IF NOT EXISTS idx_quiz_submissions_user_quiz ON public.quiz_submissions(user_id, quiz_id);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_user_assignment ON public.assignment_submissions(user_id, assignment_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_course_created ON public.forum_posts(course_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_replies_post_created ON public.forum_replies(post_id, created_at DESC);

-- Partial indexes for conditional queries
CREATE INDEX IF NOT EXISTS idx_announcements_published ON public.announcements(published) WHERE published = true;
CREATE INDEX IF NOT EXISTS idx_courses_active ON public.courses(active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_lessons_published ON public.lessons(published) WHERE published = true;
CREATE INDEX IF NOT EXISTS idx_quizzes_published ON public.quizzes(published) WHERE published = true;

-- Indexes for new tables
CREATE INDEX IF NOT EXISTS idx_notifications_active ON public.notifications(active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_notifications_expires_at ON public.notifications(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_academic_profiles_user_id ON public.academic_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_milestones_user_id ON public.milestones(user_id);
CREATE INDEX IF NOT EXISTS idx_milestones_completed ON public.milestones(completed);
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON public.resumes(user_id);

-- Analyze tables
ANALYZE public.profiles;
ANALYZE public.user_roles;
ANALYZE public.courses;
ANALYZE public.lessons;
ANALYZE public.enrollments;
ANALYZE public.course_progress;
ANALYZE public.quizzes;
ANALYZE public.announcements;
ANALYZE public.notifications;
ANALYZE public.academic_profiles;
ANALYZE public.milestones;
ANALYZE public.resumes;

-- ============================================================================
-- SECTION 5: AI MEMORY SCHEMA
-- ============================================================================
-- AI Memory Table for Advanced AI System
CREATE TABLE IF NOT EXISTS public.ai_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  memory_key TEXT NOT NULL,
  memory_value JSONB NOT NULL,
  memory_type TEXT DEFAULT 'long_term',
  importance_score INTEGER DEFAULT 5,
  access_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_memory_user_id ON public.ai_memory(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_memory_key ON public.ai_memory(memory_key);
CREATE INDEX IF NOT EXISTS idx_ai_memory_type ON public.ai_memory(memory_type);
CREATE INDEX IF NOT EXISTS idx_ai_memory_importance ON public.ai_memory(importance_score DESC);
CREATE INDEX IF NOT EXISTS idx_ai_memory_expires_at ON public.ai_memory(expires_at) WHERE expires_at IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_ai_memory_user_key ON public.ai_memory(user_id, memory_key);

DROP TRIGGER IF EXISTS ai_memory_updated_at ON public.ai_memory;
CREATE TRIGGER ai_memory_updated_at
  BEFORE UPDATE ON public.ai_memory
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- AI Conversations Table
CREATE TABLE IF NOT EXISTS public.ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  conversation_type TEXT NOT NULL,
  context JSONB DEFAULT '{}',
  total_tokens_used INTEGER DEFAULT 0,
  total_cost DECIMAL(10, 6) DEFAULT 0,
  satisfaction_score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON public.ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_session_id ON public.ai_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_type ON public.ai_conversations(conversation_type);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_created_at ON public.ai_conversations(created_at DESC);

DROP TRIGGER IF EXISTS ai_conversations_updated_at ON public.ai_conversations;
CREATE TRIGGER ai_conversations_updated_at
  BEFORE UPDATE ON public.ai_conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- RLS Policies for AI Memory
ALTER TABLE public.ai_memory ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own AI memory" ON public.ai_memory;
CREATE POLICY "Users can manage own AI memory" ON public.ai_memory
  FOR ALL TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Service role can manage AI memory" ON public.ai_memory;
CREATE POLICY "Service role can manage AI memory" ON public.ai_memory
  FOR ALL TO service_role USING (true);

-- RLS Policies for AI Conversations
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own AI conversations" ON public.ai_conversations;
CREATE POLICY "Users can manage own AI conversations" ON public.ai_conversations
  FOR ALL TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Service role can manage AI conversations" ON public.ai_conversations;
CREATE POLICY "Service role can manage AI conversations" ON public.ai_conversations
  FOR ALL TO service_role USING (true);

-- ============================================================================
-- SECTION 6: SUPPORT CHAT SCHEMA
-- ============================================================================
-- Create support_tickets table
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_name TEXT NOT NULL,
  visitor_email TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'assigned', 'resolved')),
  session_id TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  assigned_to UUID,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ticket_messages table
CREATE TABLE IF NOT EXISTS public.ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('visitor', 'agent', 'system')),
  sender_name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_support_tickets_session_id ON public.support_tickets(session_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON public.support_tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket_id ON public.ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_created_at ON public.ticket_messages(created_at DESC);

-- Enable PostgreSQL replication for real-time streaming
ALTER TABLE public.ticket_messages REPLICA IDENTITY FULL;

-- RLS Policies for support_tickets
-- Visitors can only access their own tickets via session_id
DROP POLICY IF EXISTS "Visitors can view own tickets" ON public.support_tickets;
CREATE POLICY "Visitors can view own tickets"
ON public.support_tickets FOR SELECT
USING (session_id = current_setting('app.session_id', true));

-- Visitors can insert tickets with their session_id
DROP POLICY IF EXISTS "Visitors can insert tickets" ON public.support_tickets;
CREATE POLICY "Visitors can insert tickets"
ON public.support_tickets FOR INSERT
WITH CHECK (session_id = current_setting('app.session_id', true));

-- Visitors can update their own tickets
DROP POLICY IF EXISTS "Visitors can update own tickets" ON public.support_tickets;
CREATE POLICY "Visitors can update own tickets"
ON public.support_tickets FOR UPDATE
USING (session_id = current_setting('app.session_id', true));

-- Agents can view all tickets
DROP POLICY IF EXISTS "Agents can view all tickets" ON public.support_tickets;
CREATE POLICY "Agents can view all tickets"
ON public.support_tickets FOR SELECT
TO authenticated
USING (true);

-- Agents can update all tickets
DROP POLICY IF EXISTS "Agents can update all tickets" ON public.support_tickets;
CREATE POLICY "Agents can update all tickets"
ON public.support_tickets FOR UPDATE
TO authenticated
USING (true);

-- RLS Policies for ticket_messages
-- Visitors can view messages for their own tickets
DROP POLICY IF EXISTS "Visitors can view own ticket messages" ON public.ticket_messages;
CREATE POLICY "Visitors can view own ticket messages"
ON public.ticket_messages FOR SELECT
USING (
  ticket_id IN (
    SELECT id FROM public.support_tickets
    WHERE session_id = current_setting('app.session_id', true)
  )
);

-- Visitors can insert messages for their own tickets
DROP POLICY IF EXISTS "Visitors can insert messages" ON public.ticket_messages;
CREATE POLICY "Visitors can insert messages"
ON public.ticket_messages FOR INSERT
WITH CHECK (
  ticket_id IN (
    SELECT id FROM public.support_tickets
    WHERE session_id = current_setting('app.session_id', true)
  )
);

-- Agents can view all messages
DROP POLICY IF EXISTS "Agents can view all messages" ON public.ticket_messages;
CREATE POLICY "Agents can view all messages"
ON public.ticket_messages FOR SELECT
TO authenticated
USING (true);

-- Agents can insert messages for any ticket
DROP POLICY IF EXISTS "Agents can insert messages" ON public.ticket_messages;
CREATE POLICY "Agents can insert messages"
ON public.ticket_messages FOR INSERT
TO authenticated
WITH CHECK (true);

-- Agents can update messages (for read status)
DROP POLICY IF EXISTS "Agents can update messages" ON public.ticket_messages;
CREATE POLICY "Agents can update messages"
ON public.ticket_messages FOR UPDATE
TO authenticated
USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_support_tickets_updated_at ON public.support_tickets;
CREATE TRIGGER update_support_tickets_updated_at
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to update last_message_at when a new message is added
CREATE OR REPLACE FUNCTION update_last_message_at()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.support_tickets
  SET last_message_at = NOW()
  WHERE id = NEW.ticket_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update last_message_at on message insert
DROP TRIGGER IF EXISTS update_ticket_last_message_at ON public.ticket_messages;
CREATE TRIGGER update_ticket_last_message_at
  AFTER INSERT ON public.ticket_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_last_message_at();

-- Function to set session ID for RLS
CREATE OR REPLACE FUNCTION set_session_id(p_session_id TEXT)
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.session_id', p_session_id, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get or create visitor ticket
CREATE OR REPLACE FUNCTION get_or_create_visitor_ticket(
  p_visitor_name TEXT,
  p_visitor_email TEXT,
  p_session_id TEXT
)
RETURNS UUID AS $$
DECLARE
  v_ticket_id UUID;
BEGIN
  -- Try to find existing ticket
  SELECT id INTO v_ticket_id
  FROM public.support_tickets
  WHERE session_id = p_session_id
  LIMIT 1;

  -- If not found, create new ticket
  IF v_ticket_id IS NULL THEN
    INSERT INTO public.support_tickets (visitor_name, visitor_email, session_id, status)
    VALUES (p_visitor_name, p_visitor_email, p_session_id, 'open')
    RETURNING id INTO v_ticket_id;
  END IF;

  RETURN v_ticket_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.support_tickets TO anon, authenticated;
GRANT ALL ON public.ticket_messages TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_or_create_visitor_ticket TO anon, authenticated;
GRANT EXECUTE ON FUNCTION set_session_id TO anon, authenticated;

-- ============================================================================
-- SECTION 7: SYSTEM SUGGESTED PLANS
-- ============================================================================
-- System Suggested Plans Table
CREATE TABLE IF NOT EXISTS public.system_suggested_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.system_suggested_plans ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own suggested plans
DROP POLICY IF EXISTS "Users can view own suggested plans" ON public.system_suggested_plans;
CREATE POLICY "Users can view own suggested plans"
  ON public.system_suggested_plans
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can insert their own suggested plans (though typically generated by admin)
DROP POLICY IF EXISTS "Users can insert own suggested plans" ON public.system_suggested_plans;
CREATE POLICY "Users can insert own suggested plans"
  ON public.system_suggested_plans
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Admins can view all suggested plans
DROP POLICY IF EXISTS "Admins can view all suggested plans" ON public.system_suggested_plans;
CREATE POLICY "Admins can view all suggested plans"
  ON public.system_suggested_plans
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND email IN ('funfinityacademy@gmail.com', 'academyfunfinity@gmail.com')
    )
  );

-- Admins can update all suggested plans
DROP POLICY IF EXISTS "Admins can update all suggested plans" ON public.system_suggested_plans;
CREATE POLICY "Admins can update all suggested plans"
  ON public.system_suggested_plans
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND email IN ('funfinityacademy@gmail.com', 'academyfunfinity@gmail.com')
    )
  );

-- Service role has full access
DROP POLICY IF EXISTS "Service role can manage suggested plans" ON public.system_suggested_plans;
CREATE POLICY "Service role can manage suggested plans"
  ON public.system_suggested_plans
  FOR ALL
  TO service_role
  USING (true);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_system_suggested_plans_user_id 
  ON public.system_suggested_plans(user_id);

CREATE INDEX IF NOT EXISTS idx_system_suggested_plans_created_at 
  ON public.system_suggested_plans(created_at DESC);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_system_suggested_plans_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_system_suggested_plans_updated_at ON public.system_suggested_plans;
CREATE TRIGGER trigger_update_system_suggested_plans_updated_at
  BEFORE UPDATE ON public.system_suggested_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_system_suggested_plans_updated_at();

-- ============================================================================
-- SECTION 8: ADMIN ROLE FIX
-- ============================================================================
-- Ensure admin users have correct role in user_roles table
DELETE FROM public.user_roles WHERE user_id IN (
  SELECT id FROM auth.users 
  WHERE email IN ('funfinityacademy@gmail.com', 'academyfunfinity@gmail.com')
);

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users 
WHERE email IN ('funfinityacademy@gmail.com', 'academyfunfinity@gmail.com');

-- Ensure admin users have profiles with correct role
-- First, update existing profiles
UPDATE public.profiles
SET role = 'admin', updated_at = NOW()
WHERE id IN (
  SELECT id FROM auth.users 
  WHERE email IN ('funfinityacademy@gmail.com', 'academyfunfinity@gmail.com')
);

-- Then, create profiles if they don't exist
INSERT INTO public.profiles (id, email, display_name, role, created_at, updated_at)
SELECT 
  id, 
  email, 
  COALESCE(raw_user_meta_data->>'display_name', split_part(email, '@', 1)),
  'admin',
  NOW(),
  NOW()
FROM auth.users 
WHERE email IN ('funfinityacademy@gmail.com', 'academyfunfinity@gmail.com')
AND id NOT IN (SELECT id FROM public.profiles);

-- Verify admin roles
SELECT 
  u.id,
  u.email,
  p.role as profile_role,
  ur.role as user_role
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email IN ('funfinityacademy@gmail.com', 'academyfunfinity@gmail.com');

-- ============================================================================
-- SECTION 9: HELPER FUNCTIONS FOR FRONTEND
-- ============================================================================
-- Function to fetch all users with roles (bypasses RLS recursion)
CREATE OR REPLACE FUNCTION fetch_all_users_with_roles()
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  grade TEXT,
  bio TEXT,
  role TEXT,
  points INTEGER,
  streak INTEGER,
  last_login_at TIMESTAMP WITH TIME ZONE,
  dna_complete BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  user_role TEXT
) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as user_id,
    p.email,
    p.display_name,
    p.avatar_url,
    p.grade,
    p.bio,
    p.role,
    p.points,
    p.streak,
    p.last_login_at,
    p.dna_complete,
    p.created_at,
    p.updated_at,
    COALESCE(ur.role, p.role) as user_role
  FROM public.profiles p
  LEFT JOIN public.user_roles ur ON p.id = ur.user_id
  ORDER BY p.created_at DESC;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION fetch_all_users_with_roles TO authenticated;
GRANT EXECUTE ON FUNCTION fetch_all_users_with_roles TO anon;

-- ============================================================================
-- SETUP COMPLETE
-- ============================================================================

-- ============================================================================
-- SECTION 10: STORAGE QUOTA AND DATA PERSISTENCE ADDITIONS
-- ============================================================================
-- This section adds storage quota tracking and ensures all student data is persisted

-- User Preferences Table (for theme, animations, etc.)
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'dark' CHECK (theme IN ('light', 'dark')),
  animations_enabled BOOLEAN DEFAULT true,
  sidebar_collapsed BOOLEAN DEFAULT false,
  language TEXT DEFAULT 'en',
  timezone TEXT DEFAULT 'UTC',
  notification_preferences JSONB DEFAULT '{"email": true, "push": true, "sms": false}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Storage Quota Table
CREATE TABLE IF NOT EXISTS public.storage_quotas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  storage_used_bytes BIGINT DEFAULT 0,
  storage_limit_bytes BIGINT DEFAULT 5368709120, -- 5GB default
  notes_count INTEGER DEFAULT 0,
  notes_limit INTEGER DEFAULT 1000,
  files_count INTEGER DEFAULT 0,
  files_limit INTEGER DEFAULT 100,
  calendar_events_count INTEGER DEFAULT 0,
  calendar_events_limit INTEGER DEFAULT 500,
  last_calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Calendar Events Table
CREATE TABLE IF NOT EXISTS public.calendar_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  event_type TEXT DEFAULT 'general' CHECK (event_type IN ('general', 'course', 'exam', 'assignment', 'live_class', 'personal')),
  location TEXT,
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern JSONB,
  course_id UUID REFERENCES public.courses(id),
  lesson_id UUID REFERENCES public.lessons(id),
  reminder_minutes_before INTEGER DEFAULT 15,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gamification Stats Table (centralized stats)
CREATE TABLE IF NOT EXISTS public.gamification_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  total_points_earned INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  courses_completed INTEGER DEFAULT 0,
  lessons_completed INTEGER DEFAULT 0,
  quizzes_completed INTEGER DEFAULT 0,
  perfect_quizzes INTEGER DEFAULT 0,
  total_study_time_minutes INTEGER DEFAULT 0,
  last_login_date DATE,
  login_count INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  xp_to_next_level INTEGER DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Indexes for new tables
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_storage_quotas_user_id ON public.storage_quotas(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_id ON public.calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_start_date ON public.calendar_events(start_date);
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_start ON public.calendar_events(user_id, start_date);
CREATE INDEX IF NOT EXISTS idx_gamification_stats_user_id ON public.gamification_stats(user_id);

-- Triggers for updated_at on new tables
DROP TRIGGER IF EXISTS user_preferences_updated_at ON public.user_preferences;
CREATE TRIGGER user_preferences_updated_at BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS storage_quotas_updated_at ON public.storage_quotas;
CREATE TRIGGER storage_quotas_updated_at BEFORE UPDATE ON public.storage_quotas
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS calendar_events_updated_at ON public.calendar_events;
CREATE TRIGGER calendar_events_updated_at BEFORE UPDATE ON public.calendar_events
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS gamification_stats_updated_at ON public.gamification_stats;
CREATE TRIGGER gamification_stats_updated_at BEFORE UPDATE ON public.gamification_stats
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- RLS Policies for new tables
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storage_quotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gamification_stats ENABLE ROW LEVEL SECURITY;

-- User Preferences Policies
DROP POLICY IF EXISTS "Users can manage own preferences" ON public.user_preferences;
CREATE POLICY "Users can manage own preferences" ON public.user_preferences
  FOR ALL TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Service role can manage preferences" ON public.user_preferences;
CREATE POLICY "Service role can manage preferences" ON public.user_preferences
  FOR ALL TO service_role USING (true);

-- Storage Quotas Policies
DROP POLICY IF EXISTS "Users can view own quota" ON public.storage_quotas;
CREATE POLICY "Users can view own quota" ON public.storage_quotas
  FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Service role can manage quotas" ON public.storage_quotas;
CREATE POLICY "Service role can manage quotas" ON public.storage_quotas
  FOR ALL TO service_role USING (true);

-- Calendar Events Policies
DROP POLICY IF EXISTS "Users can manage own calendar events" ON public.calendar_events;
CREATE POLICY "Users can manage own calendar events" ON public.calendar_events
  FOR ALL TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Service role can manage calendar events" ON public.calendar_events;
CREATE POLICY "Service role can manage calendar events" ON public.calendar_events
  FOR ALL TO service_role USING (true);

-- Gamification Stats Policies
DROP POLICY IF EXISTS "Users can view own stats" ON public.gamification_stats;
CREATE POLICY "Users can view own stats" ON public.gamification_stats
  FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Service role can manage stats" ON public.gamification_stats;
CREATE POLICY "Service role can manage stats" ON public.gamification_stats
  FOR ALL TO service_role USING (true);

-- Function to initialize user quota on signup
CREATE OR REPLACE FUNCTION initialize_user_quota()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.storage_quotas (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  INSERT INTO public.gamification_stats (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to initialize quota on profile creation
DROP TRIGGER IF EXISTS initialize_quota_on_profile ON public.profiles;
CREATE TRIGGER initialize_quota_on_profile
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION initialize_user_quota();

-- Function to check storage quota before insert
CREATE OR REPLACE FUNCTION check_storage_quota(p_user_id UUID, p_operation TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_quota RECORD;
  v_allowed BOOLEAN := true;
BEGIN
  SELECT * INTO v_quota
  FROM public.storage_quotas
  WHERE user_id = p_user_id;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  IF p_operation = 'note' THEN
    v_allowed := v_quota.notes_count < v_quota.notes_limit;
  ELSIF p_operation = 'file' THEN
    v_allowed := v_quota.files_count < v_quota.files_limit;
  ELSIF p_operation = 'calendar_event' THEN
    v_allowed := v_quota.calendar_events_count < v_quota.calendar_events_limit;
  END IF;
  
  RETURN v_allowed;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update storage usage
CREATE OR REPLACE FUNCTION update_storage_usage(p_user_id UUID, p_operation TEXT, p_bytes BIGINT DEFAULT 0)
RETURNS void AS $$
BEGIN
  UPDATE public.storage_quotas
  SET 
    storage_used_bytes = storage_used_bytes + p_bytes,
    notes_count = CASE WHEN p_operation = 'note' THEN notes_count + 1 ELSE notes_count END,
    files_count = CASE WHEN p_operation = 'file' THEN files_count + 1 ELSE files_count END,
    calendar_events_count = CASE WHEN p_operation = 'calendar_event' THEN calendar_events_count + 1 ELSE calendar_events_count END,
    last_calculated_at = NOW(),
    updated_at = NOW()
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user storage info
CREATE OR REPLACE FUNCTION get_user_storage_info(p_user_id UUID)
RETURNS TABLE (
  storage_used_bytes BIGINT,
  storage_limit_bytes BIGINT,
  storage_percentage DECIMAL,
  notes_count INTEGER,
  notes_limit INTEGER,
  files_count INTEGER,
  files_limit INTEGER,
  calendar_events_count INTEGER,
  calendar_events_limit INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sq.storage_used_bytes,
    sq.storage_limit_bytes,
    ROUND((sq.storage_used_bytes::DECIMAL / sq.storage_limit_bytes) * 100, 2),
    sq.notes_count,
    sq.notes_limit,
    sq.files_count,
    sq.files_limit,
    sq.calendar_events_count,
    sq.calendar_events_limit
  FROM public.storage_quotas sq
  WHERE sq.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add gamification points
CREATE OR REPLACE FUNCTION add_gamification_points(p_user_id UUID, p_points INTEGER)
RETURNS void AS $$
DECLARE
  v_current_stats RECORD;
  v_new_xp INTEGER;
  v_new_level INTEGER;
BEGIN
  SELECT * INTO v_current_stats
  FROM public.gamification_stats
  WHERE user_id = p_user_id;
  
  IF NOT FOUND THEN
    INSERT INTO public.gamification_stats (user_id, total_points_earned)
    VALUES (p_user_id, p_points);
    RETURN;
  END IF;
  
  v_new_xp := v_current_stats.total_points_earned + p_points;
  v_new_level := FLOOR(v_new_xp / 100) + 1;
  
  UPDATE public.gamification_stats
  SET 
    total_points_earned = v_new_xp,
    level = v_new_level,
    xp_to_next_level = (v_new_level * 100) - v_new_xp,
    updated_at = NOW()
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions for new functions
GRANT EXECUTE ON FUNCTION check_storage_quota TO authenticated;
GRANT EXECUTE ON FUNCTION update_storage_usage TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_storage_info TO authenticated;
GRANT EXECUTE ON FUNCTION add_gamification_points TO authenticated;
GRANT EXECUTE ON FUNCTION initialize_user_quota TO service_role;

-- ============================================================================
-- SUPPORT CHAT SYSTEM
-- ============================================================================

-- Support Messages Table
CREATE TABLE IF NOT EXISTS public.support_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_support BOOLEAN DEFAULT FALSE,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_support_messages_user_id ON public.support_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_support_messages_created_at ON public.support_messages(created_at DESC);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.support_messages TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.support_messages TO service_role;

-- Enable Realtime for support_messages (skip if already added)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'support_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.support_messages;
  END IF;
END $$;

-- ============================================================================
-- SECTION 11: GDPR COMPLIANCE ADDITIONS
-- ============================================================================
-- This section adds GDPR-compliant tables and functions to the existing schema

-- Parental consent records for users under 13 (COPPA compliance)
CREATE TABLE IF NOT EXISTS public.parental_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_name VARCHAR(255) NOT NULL,
  parent_email VARCHAR(255) NOT NULL,
  parent_phone VARCHAR(50) NOT NULL,
  relationship VARCHAR(100) NOT NULL,
  consent_given BOOLEAN NOT NULL,
  data_processing_agreement BOOLEAN NOT NULL,
  marketing_consent BOOLEAN DEFAULT FALSE,
  electronic_signature TEXT NOT NULL,
  signed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  revoked_at TIMESTAMP WITH TIME ZONE,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Consent history for audit trail (GDPR compliance)
CREATE TABLE IF NOT EXISTS public.consent_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_type VARCHAR(100) NOT NULL, -- 'parental', 'marketing', 'data_processing'
  action VARCHAR(50) NOT NULL, -- 'granted', 'revoked', 'updated'
  previous_value BOOLEAN,
  new_value BOOLEAN,
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address VARCHAR(45),
  metadata JSONB DEFAULT '{}'
);

-- Data deletion requests for GDPR compliance (Article 17 - Right to be Forgotten)
CREATE TABLE IF NOT EXISTS public.data_deletion_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  request_type VARCHAR(50) NOT NULL, -- 'full_deletion', 'anonymization', 'partial'
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'rejected'
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  processed_by UUID REFERENCES auth.users(id),
  rejection_reason TEXT,
  metadata JSONB DEFAULT '{}'
);

-- Deletion audit log for GDPR compliance
CREATE TABLE IF NOT EXISTS public.deletion_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deletion_request_id UUID REFERENCES public.data_deletion_requests(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  table_name VARCHAR(100) NOT NULL,
  record_id UUID NOT NULL,
  action VARCHAR(50) NOT NULL, -- 'deleted', 'anonymized'
  old_data JSONB,
  new_data JSONB,
  performed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  performed_by UUID REFERENCES auth.users(id)
);

-- Add GDPR columns to existing profiles table for soft delete and anonymization
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS is_anonymized BOOLEAN DEFAULT FALSE;

-- Add GDPR columns to enrollments for anonymization support
ALTER TABLE public.enrollments 
  ADD COLUMN IF NOT EXISTS is_anonymized BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS original_user_id UUID;

-- Add GDPR columns to quiz_submissions for anonymization support
ALTER TABLE public.quiz_submissions 
  ADD COLUMN IF NOT EXISTS is_anonymized BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS original_user_id UUID;

-- Add GDPR columns to course_progress for anonymization support
ALTER TABLE public.course_progress 
  ADD COLUMN IF NOT EXISTS is_anonymized BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS original_user_id UUID;

-- Indexes for GDPR tables
CREATE INDEX IF NOT EXISTS idx_parental_consents_user_id ON public.parental_consents(user_id);
CREATE INDEX IF NOT EXISTS idx_consent_history_user_id ON public.consent_history(user_id);
CREATE INDEX IF NOT EXISTS idx_data_deletion_requests_user_id ON public.data_deletion_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_deletion_audit_log_user_id ON public.deletion_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_deleted_at ON public.profiles(deleted_at);
CREATE INDEX IF NOT EXISTS idx_enrollments_is_anonymized ON public.enrollments(is_anonymized);
CREATE INDEX IF NOT EXISTS idx_quiz_submissions_is_anonymized ON public.quiz_submissions(is_anonymized);
CREATE INDEX IF NOT EXISTS idx_course_progress_is_anonymized ON public.course_progress(is_anonymized);

-- Enable RLS on GDPR tables
ALTER TABLE public.parental_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consent_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_deletion_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deletion_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Parental Consents
DROP POLICY IF EXISTS "Users can view own parental consents" ON public.parental_consents;
CREATE POLICY "Users can view own parental consents" ON public.parental_consents
  FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all parental consents" ON public.parental_consents;
CREATE POLICY "Admins can view all parental consents" ON public.parental_consents
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND email IN ('funfinityacademy@gmail.com', 'academyfunfinity@gmail.com')
    )
  );

DROP POLICY IF EXISTS "Service role can manage parental consents" ON public.parental_consents;
CREATE POLICY "Service role can manage parental consents" ON public.parental_consents
  FOR ALL TO service_role USING (true);

-- RLS Policies for Consent History
DROP POLICY IF EXISTS "Users can view own consent history" ON public.consent_history;
CREATE POLICY "Users can view own consent history" ON public.consent_history
  FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Service role can manage consent history" ON public.consent_history;
CREATE POLICY "Service role can manage consent history" ON public.consent_history
  FOR ALL TO service_role USING (true);

-- RLS Policies for Data Deletion Requests
DROP POLICY IF EXISTS "Users can view own deletion requests" ON public.data_deletion_requests;
CREATE POLICY "Users can view own deletion requests" ON public.data_deletion_requests
  FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage deletion requests" ON public.data_deletion_requests;
CREATE POLICY "Admins can manage deletion requests" ON public.data_deletion_requests
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND email IN ('funfinityacademy@gmail.com', 'academyfunfinity@gmail.com')
    )
  );

DROP POLICY IF EXISTS "Service role can manage deletion requests" ON public.data_deletion_requests;
CREATE POLICY "Service role can manage deletion requests" ON public.data_deletion_requests
  FOR ALL TO service_role USING (true);

-- RLS Policies for Deletion Audit Log
DROP POLICY IF EXISTS "Service role can view deletion audit log" ON public.deletion_audit_log;
CREATE POLICY "Service role can view deletion audit log" ON public.deletion_audit_log
  FOR SELECT TO service_role USING (true);

-- Function to anonymize user data (GDPR Article 17 - Right to be Forgotten)
CREATE OR REPLACE FUNCTION anonymize_user_data(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
    -- Anonymize user profile
    UPDATE public.profiles
    SET 
        display_name = 'Anonymous User',
        avatar_url = NULL,
        grade = NULL,
        bio = NULL,
        deleted_at = NOW(),
        is_anonymized = TRUE
    WHERE id = user_uuid;
    
    -- Anonymize enrollments
    UPDATE public.enrollments
    SET 
        user_id = NULL,
        is_anonymized = TRUE,
        original_user_id = user_uuid
    WHERE user_id = user_uuid;
    
    -- Anonymize quiz submissions
    UPDATE public.quiz_submissions
    SET 
        user_id = NULL,
        is_anonymized = TRUE,
        original_user_id = user_uuid
    WHERE user_id = user_uuid;
    
    -- Anonymize course progress
    UPDATE public.course_progress
    SET 
        user_id = NULL,
        is_anonymized = TRUE,
        original_user_id = user_uuid
    WHERE user_id = user_uuid;
    
    -- Log the deletion
    INSERT INTO public.deletion_audit_log (user_id, table_name, record_id, action, old_data, new_data, performed_by)
    VALUES (user_uuid, 'profiles', user_uuid, 'anonymized', NULL, '{"status": "anonymized"}', user_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to fully delete user data (GDPR Article 17 - Right to be Forgotten)
CREATE OR REPLACE FUNCTION delete_user_data(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
    -- Log deletion before performing it
    INSERT INTO public.deletion_audit_log (user_id, table_name, record_id, action, performed_by)
    VALUES (user_uuid, 'profiles', user_uuid, 'deleted', user_uuid);
    
    -- Delete parental consents
    DELETE FROM public.parental_consents WHERE user_id = user_uuid;
    
    -- Delete consent history
    DELETE FROM public.consent_history WHERE user_id = user_uuid;
    
    -- Delete enrollments
    DELETE FROM public.enrollments WHERE user_id = user_uuid;
    
    -- Delete quiz submissions
    DELETE FROM public.quiz_submissions WHERE user_id = user_uuid;
    
    -- Delete course progress
    DELETE FROM public.course_progress WHERE user_id = user_uuid;
    
    -- Delete deletion requests
    DELETE FROM public.data_deletion_requests WHERE user_id = user_uuid;
    
    -- Delete user profile
    DELETE FROM public.profiles WHERE id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions for GDPR functions
GRANT EXECUTE ON FUNCTION anonymize_user_data TO service_role;
GRANT EXECUTE ON FUNCTION delete_user_data TO service_role;

-- Add comments for GDPR documentation
COMMENT ON TABLE public.parental_consents IS 'COPPA compliance: Stores parental consent for users under 13.';
COMMENT ON TABLE public.consent_history IS 'Audit trail for all consent changes (GDPR compliance).';
COMMENT ON TABLE public.data_deletion_requests IS 'GDPR deletion requests with full audit trail.';
COMMENT ON TABLE public.deletion_audit_log IS 'Detailed log of all data deletions for GDPR compliance.';
COMMENT ON FUNCTION anonymize_user_data IS 'GDPR Article 17: Anonymizes user data while preserving educational analytics.';
COMMENT ON FUNCTION delete_user_data IS 'GDPR Article 17: Fully deletes user data (Right to be Forgotten).';

-- ============================================================================
-- FINAL SETUP COMPLETE
-- ============================================================================
