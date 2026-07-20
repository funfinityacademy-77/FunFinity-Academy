export interface User {
  id: string;
  email: string;
  password_hash: string;
  display_name: string | null;
  avatar_url: string | null;
  role: 'admin' | 'student' | 'teacher' | 'parent';
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  learning_goals: string | null;
  preferred_learning_style: string | null;
  difficulty_preference: string | null;
  study_pace: string | null;
  interests: string | null;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  title: string;
  description: string | null;
  instructor_id: string | null;
  thumbnail_url: string | null;
  difficulty: string | null;
  subject: string | null;
  published: number;
  enrollment_count: number;
  created_at: string;
  updated_at: string;
}

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  content: string | null;
  video_url: string | null;
  duration_minutes: number | null;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface CourseProgress {
  id: string;
  user_id: string;
  course_id: string;
  lesson_id: string;
  completed: number;
  completed_at: string | null;
  created_at: string;
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  progress: number;
  completed: number;
  enrolled_at: string;
  updated_at: string;
}

export interface Assignment {
  id: string;
  course_id: string | null;
  title: string;
  description: string | null;
  due_date: string | null;
  max_points: number | null;
  published: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface AssignmentSubmission {
  id: string;
  assignment_id: string;
  user_id: string;
  content: string | null;
  file_url: string | null;
  grade: number | null;
  feedback: string | null;
  graded_at: string | null;
  submitted_at: string;
}

export interface Feedback {
  id: string;
  user_id: string;
  user_name: string | null;
  user_email: string | null;
  type: 'bug' | 'feature' | 'feedback' | 'support';
  category: string;
  subject: string;
  message: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  priority: 'low' | 'medium' | 'high';
  admin_response: string | null;
  rating: number | null;
  created_at: string;
  updated_at: string;
}

export interface Quiz {
  id: string;
  course_id: string | null;
  title: string;
  description: string | null;
  time_limit_minutes: number | null;
  published: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question_text: string;
  question_type: string;
  options: string | null;
  correct_answer: string;
  points: number | null;
  order_index: number | null;
}

export interface QuizSubmission {
  id: string;
  quiz_id: string;
  user_id: string;
  answers: string | null;
  score: number | null;
  max_score: number | null;
  submitted_at: string;
}

export interface Announcement {
  id: string;
  author_id: string;
  title: string;
  content: string;
  priority: string;
  published: number;
  target_role: string | null;
  created_at: string;
  updated_at: string;
}

export interface ForumPost {
  id: string;
  author_id: string;
  title: string;
  content: string;
  category: string | null;
  pinned: number;
  reply_count: number;
  created_at: string;
  updated_at: string;
}

export interface ForumReply {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  read: number;
  created_at: string;
}

export interface ConversationMember {
  id: string;
  conversation_id: string;
  user_id: string;
  joined_at: string;
}

export interface Conversation {
  id: string;
  created_by: string;
  name: string | null;
  type: string;
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: string;
  user_id: string;
  course_id: string | null;
  title: string;
  content: string | null;
  tags: string | null;
  is_pinned: number;
  created_at: string;
  updated_at: string;
}

export interface Bookmark {
  id: string;
  user_id: string;
  resource_type: string;
  resource_id: string | null;
  title: string;
  url: string | null;
  created_at: string;
}

export interface Milestone {
  id: string;
  user_id: string;
  milestone_key: string;
  label: string;
  description: string;
  icon: string | null;
  completed: number;
  completed_at: string | null;
  created_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: string;
}

export interface CareerProfile {
  id: string;
  user_id: string;
  personality_type: string | null;
  career_interests: string | null;
  saved_opportunities: string | null;
  quiz_completed: number;
  quiz_results: string | null;
  total_logged_hours: number | null;
  created_at: string;
  updated_at: string;
}

export interface ExperienceLog {
  id: string;
  user_id: string;
  title: string;
  type: string;
  date: string;
  hours: number;
  reflection: string | null;
  supervisor_email: string;
  status: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  created_at: string;
}

export interface Resume {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  summary: string | null;
  skills: string | null;
  education: string | null;
  template: string | null;
  created_at: string;
  updated_at: string;
}

export interface LearningDNAProfile {
  id: string;
  user_id: string;
  has_adhd: number;
  has_dyslexia: number;
  has_dyscalculia: number;
  has_asd: number;
  has_anxiety: number;
  preferred_font: string | null;
  content_density: string | null;
  focus_mode: string | null;
  session_length: string | null;
  break_frequency: string | null;
  color_overlay: string | null;
  high_contrast: number;
  reduced_motion: number;
  recommended_strategies: string | null;
  achievement_emails: number;
  show_onboarding: number;
  completed: number;
  created_at: string;
  updated_at: string;
}
