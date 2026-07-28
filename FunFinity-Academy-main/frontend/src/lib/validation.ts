/**
 * Zod Validation Schemas for FunFinity Academy
 * Provides strict runtime validation for all data entering the application
 */

import { z } from 'zod';

// ============================================================================
// USER & AUTHENTICATION SCHEMAS
// ============================================================================

/**
 * User Profile Schema
 */
export const userProfileSchema = z.object({
  id: z.string().uuid('Invalid user ID format'),
  email: z.string().email('Invalid email address'),
  display_name: z.string()
    .min(2, 'Display name must be at least 2 characters')
    .max(50, 'Display name must be less than 50 characters')
    .regex(/^[a-zA-Z0-9\s\-_.]+$/, 'Display name contains invalid characters'),
  role: z.enum(['student', 'teacher', 'admin'], {
    errorMap: () => ({ message: 'Invalid user role' }),
  }),
  avatar_url: z.string().url('Invalid avatar URL').optional().nullable(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export type UserProfile = z.infer<typeof userProfileSchema>;

/**
 * Sign Up Schema
 */
export const signUpSchema = z.object({
  email: z.string()
    .email('Invalid email address')
    .min(5, 'Email must be at least 5 characters')
    .max(255, 'Email must be less than 255 characters'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  fullName: z.string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be less than 100 characters')
    .regex(/^[a-zA-Z\s\-']+$/, 'Full name contains invalid characters'),
  role: z.enum(['student', 'teacher'], {
    errorMap: () => ({ message: 'Invalid role selection' }),
  }).default('student'),
});

export type SignUpInput = z.infer<typeof signUpSchema>;

/**
 * Sign In Schema
 */
export const signInSchema = z.object({
  email: z.string()
    .email('Invalid email address')
    .min(5, 'Email must be at least 5 characters')
    .max(255, 'Email must be less than 255 characters'),
  password: z.string()
    .min(1, 'Password is required')
    .max(128, 'Password must be less than 128 characters'),
});

export type SignInInput = z.infer<typeof signInSchema>;

/**
 * Password Reset Schema
 */
export const passwordResetSchema = z.object({
  email: z.string()
    .email('Invalid email address')
    .min(5, 'Email must be at least 5 characters')
    .max(255, 'Email must be less than 255 characters'),
});

export type PasswordResetInput = z.infer<typeof passwordResetSchema>;

/**
 * Update Password Schema
 */
export const updatePasswordSchema = z.object({
  currentPassword: z.string()
    .min(1, 'Current password is required')
    .max(128, 'Password must be less than 128 characters'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;

// ============================================================================
// COURSE & CONTENT SCHEMAS
// ============================================================================

/**
 * Course Schema
 */
export const courseSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string()
    .min(5, 'Course title must be at least 5 characters')
    .max(200, 'Course title must be less than 200 characters'),
  description: z.string()
    .min(20, 'Course description must be at least 20 characters')
    .max(2000, 'Course description must be less than 2000 characters'),
  subject: z.enum(['math', 'science', 'english', 'social', 'other'], {
    errorMap: () => ({ message: 'Invalid subject' }),
  }),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced'], {
    errorMap: () => ({ message: 'Invalid difficulty level' }),
  }),
  age_range: z.object({
    min: z.number().min(5, 'Minimum age must be at least 5').max(18, 'Minimum age must be at most 18'),
    max: z.number().min(5, 'Maximum age must be at least 5').max(18, 'Maximum age must be at most 18'),
  }).refine((data) => data.min < data.max, {
    message: 'Minimum age must be less than maximum age',
  }),
  duration_weeks: z.number()
    .min(1, 'Duration must be at least 1 week')
    .max(52, 'Duration must be at most 52 weeks'),
  price: z.number()
    .min(0, 'Price cannot be negative')
    .max(10000, 'Price cannot exceed $10,000'),
  thumbnail_url: z.string().url('Invalid thumbnail URL').optional().nullable(),
  is_published: z.boolean().default(false),
  created_by: z.string().uuid('Invalid creator ID'),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export type Course = z.infer<typeof courseSchema>;

/**
 * Lesson Schema
 */
export const lessonSchema = z.object({
  id: z.string().uuid().optional(),
  course_id: z.string().uuid('Invalid course ID'),
  title: z.string()
    .min(5, 'Lesson title must be at least 5 characters')
    .max(200, 'Lesson title must be less than 200 characters'),
  description: z.string()
    .max(1000, 'Lesson description must be less than 1000 characters')
    .optional(),
  content: z.string()
    .min(10, 'Lesson content must be at least 10 characters'),
  order_index: z.number()
    .min(0, 'Order index cannot be negative')
    .max(1000, 'Order index cannot exceed 1000'),
  duration_minutes: z.number()
    .min(1, 'Duration must be at least 1 minute')
    .max(300, 'Duration cannot exceed 300 minutes'),
  video_url: z.string().url('Invalid video URL').optional().nullable(),
  resources: z.array(z.string().url('Invalid resource URL')).optional(),
  is_published: z.boolean().default(false),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export type Lesson = z.infer<typeof lessonSchema>;

/**
 * Quiz Schema
 */
export const quizSchema = z.object({
  id: z.string().uuid().optional(),
  lesson_id: z.string().uuid('Invalid lesson ID'),
  title: z.string()
    .min(3, 'Quiz title must be at least 3 characters')
    .max(200, 'Quiz title must be less than 200 characters'),
  questions: z.array(z.object({
    id: z.string().uuid().optional(),
    question_text: z.string()
      .min(5, 'Question must be at least 5 characters')
      .max(500, 'Question must be less than 500 characters'),
    options: z.array(z.string()
      .min(1, 'Option cannot be empty')
      .max(200, 'Option must be less than 200 characters')
    ).min(2, 'At least 2 options required').max(6, 'Maximum 6 options allowed'),
    correct_answer: z.number()
      .min(0, 'Correct answer index cannot be negative')
      .max(5, 'Correct answer index cannot exceed 5'),
    points: z.number()
      .min(1, 'Points must be at least 1')
      .max(100, 'Points cannot exceed 100')
      .default(10),
  })).min(1, 'At least 1 question required').max(50, 'Maximum 50 questions allowed'),
  passing_score: z.number()
    .min(0, 'Passing score cannot be negative')
    .max(100, 'Passing score cannot exceed 100')
    .default(70),
  time_limit_minutes: z.number()
    .min(1, 'Time limit must be at least 1 minute')
    .max(180, 'Time limit cannot exceed 180 minutes')
    .optional(),
  is_published: z.boolean().default(false),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export type Quiz = z.infer<typeof quizSchema>;

// ============================================================================
// ENROLLMENT & PROGRESS SCHEMAS
// ============================================================================

/**
 * Enrollment Schema
 */
export const enrollmentSchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string().uuid('Invalid user ID'),
  course_id: z.string().uuid('Invalid course ID'),
  enrolled_at: z.string().datetime().optional(),
  completed_at: z.string().datetime().optional().nullable(),
  progress_percentage: z.number()
    .min(0, 'Progress cannot be negative')
    .max(100, 'Progress cannot exceed 100')
    .default(0),
  status: z.enum(['active', 'completed', 'dropped'], {
    errorMap: () => ({ message: 'Invalid enrollment status' }),
  }).default('active'),
});

export type Enrollment = z.infer<typeof enrollmentSchema>;

/**
 * Lesson Progress Schema
 */
export const lessonProgressSchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string().uuid('Invalid user ID'),
  lesson_id: z.string().uuid('Invalid lesson ID'),
  completed: z.boolean().default(false),
  time_spent_seconds: z.number()
    .min(0, 'Time spent cannot be negative')
    .default(0),
  last_accessed_at: z.string().datetime().optional(),
  completed_at: z.string().datetime().optional().nullable(),
});

export type LessonProgress = z.infer<typeof lessonProgressSchema>;

/**
 * Quiz Attempt Schema
 */
export const quizAttemptSchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string().uuid('Invalid user ID'),
  quiz_id: z.string().uuid('Invalid quiz ID'),
  answers: z.array(z.object({
    question_id: z.string().uuid('Invalid question ID'),
    selected_answer: z.number(),
    is_correct: z.boolean(),
  })),
  score: z.number()
    .min(0, 'Score cannot be negative')
    .max(100, 'Score cannot exceed 100'),
  passed: z.boolean(),
  time_taken_seconds: z.number()
    .min(0, 'Time taken cannot be negative'),
  attempted_at: z.string().datetime().optional(),
});

export type QuizAttempt = z.infer<typeof quizAttemptSchema>;

// ============================================================================
// AI & INFGRAPHIC SCHEMAS
// ============================================================================

/**
 * Infographic Generation Schema
 */
export const infographicSchema = z.object({
  topic: z.string()
    .min(3, 'Topic must be at least 3 characters')
    .max(500, 'Topic must be less than 500 characters'),
  style: z.enum(['minimal', 'colorful', 'academic', 'creative'], {
    errorMap: () => ({ message: 'Invalid style selection' }),
  }),
  layout: z.enum(['single-column', 'two-column', 'grid', 'timeline'], {
    errorMap: () => ({ message: 'Invalid layout selection' }),
  }),
  colorScheme: z.enum(['blue', 'green', 'purple', 'orange', 'custom'], {
    errorMap: () => ({ message: 'Invalid color scheme' }),
  }),
  includeImages: z.boolean().default(true),
  includeIcons: z.boolean().default(true),
  fontSize: z.number()
    .min(10, 'Font size must be at least 10px')
    .max(24, 'Font size cannot exceed 24px')
    .default(14),
  density: z.number()
    .min(20, 'Density must be at least 20%')
    .max(100, 'Density cannot exceed 100%')
    .default(50),
});

export type InfographicInput = z.infer<typeof infographicSchema>;

/**
 * Study Note Generation Schema
 */
export const studyNoteSchema = z.object({
  topic: z.string()
    .min(3, 'Topic must be at least 3 characters')
    .max(500, 'Topic must be less than 500 characters'),
  subject: z.enum(['math', 'science', 'english', 'social', 'other'], {
    errorMap: () => ({ message: 'Invalid subject' }),
  }),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced'], {
    errorMap: () => ({ message: 'Invalid difficulty level' }),
  }),
  format: z.enum(['bullet-points', 'summary', 'detailed', 'outline'], {
    errorMap: () => ({ message: 'Invalid format selection' }),
  }),
  length: z.enum(['short', 'medium', 'long'], {
    errorMap: () => ({ message: 'Invalid length selection' }),
  }),
  includeExamples: z.boolean().default(true),
  includeKeyTerms: z.boolean().default(true),
});

export type StudyNoteInput = z.infer<typeof studyNoteSchema>;

// ============================================================================
// PAYMENT & BILLING SCHEMAS
// ============================================================================

/**
 * Checkout Session Schema
 */
export const checkoutSessionSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  email: z.string().email('Invalid email address'),
  countryCode: z.string()
    .length(2, 'Country code must be 2 characters')
    .regex(/^[A-Z]{2}$/i, 'Invalid country code format'),
  tier: z.enum(['monthly', 'annual'], {
    errorMap: () => ({ message: 'Invalid subscription tier' }),
  }),
  successUrl: z.string().url('Invalid success URL'),
  cancelUrl: z.string().url('Invalid cancel URL'),
});

export type CheckoutSessionInput = z.infer<typeof checkoutSessionSchema>;

/**
 * Subscription Schema
 */
export const subscriptionSchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string().uuid('Invalid user ID'),
  stripe_subscription_id: z.string().optional(),
  tier: z.enum(['monthly', 'annual'], {
    errorMap: () => ({ message: 'Invalid subscription tier' }),
  }),
  status: z.enum(['active', 'past_due', 'canceled', 'unpaid', 'trialing'], {
    errorMap: () => ({ message: 'Invalid subscription status' }),
  }),
  currency: z.string()
    .length(3, 'Currency code must be 3 characters')
    .regex(/^[A-Z]{3}$/, 'Invalid currency code format'),
  amount: z.number()
    .min(0, 'Amount cannot be negative')
    .max(100000, 'Amount cannot exceed $100,000'),
  current_period_start: z.string().datetime().optional(),
  current_period_end: z.string().datetime().optional(),
  cancel_at_period_end: z.boolean().default(false),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export type Subscription = z.infer<typeof subscriptionSchema>;

// ============================================================================
// ADMIN & ACTIVITY LOG SCHEMAS
// ============================================================================

/**
 * Activity Log Schema
 */
export const activityLogSchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string().uuid('Invalid user ID').optional(),
  user_email: z.string().email('Invalid email address').optional(),
  role: z.enum(['student', 'teacher', 'admin', 'system'], {
    errorMap: () => ({ message: 'Invalid role' }),
  }),
  action: z.string()
    .min(1, 'Action cannot be empty')
    .max(500, 'Action must be less than 500 characters'),
  category: z.enum(['Security', 'Course', 'Grade', 'Settings', 'Billing', 'System', 'Live'], {
    errorMap: () => ({ message: 'Invalid category' }),
  }),
  severity: z.enum(['info', 'warning', 'critical', 'success'], {
    errorMap: () => ({ message: 'Invalid severity level' }),
  }),
  details: z.string().max(2000, 'Details must be less than 2000 characters').optional(),
  ip_address: z.string()
    .regex(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/, 'Invalid IP address format')
    .optional(),
  user_agent: z.string().max(500, 'User agent must be less than 500 characters').optional(),
  created_at: z.string().datetime().optional(),
});

export type ActivityLog = z.infer<typeof activityLogSchema>;

/**
 * Announcement Schema
 */
export const announcementSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string()
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title must be less than 200 characters'),
  content: z.string()
    .min(10, 'Content must be at least 10 characters')
    .max(5000, 'Content must be less than 5000 characters'),
  priority: z.enum(['low', 'medium', 'high', 'urgent'], {
    errorMap: () => ({ message: 'Invalid priority level' }),
  }).default('medium'),
  target_audience: z.enum(['all', 'students', 'teachers', 'admins'], {
    errorMap: () => ({ message: 'Invalid target audience' }),
  }).default('all'),
  is_published: z.boolean().default(false),
  published_at: z.string().datetime().optional().nullable(),
  expires_at: z.string().datetime().optional().nullable(),
  created_by: z.string().uuid('Invalid creator ID'),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export type Announcement = z.infer<typeof announcementSchema>;

// ============================================================================
// FEEDBACK & SUPPORT SCHEMAS
// ============================================================================

/**
 * Feedback Schema
 */
export const feedbackSchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string().uuid('Invalid user ID'),
  category: z.enum(['bug', 'feature', 'improvement', 'other'], {
    errorMap: () => ({ message: 'Invalid feedback category' }),
  }),
  subject: z.string()
    .min(5, 'Subject must be at least 5 characters')
    .max(200, 'Subject must be less than 200 characters'),
  message: z.string()
    .min(10, 'Message must be at least 10 characters')
    .max(2000, 'Message must be less than 2000 characters'),
  rating: z.number()
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating cannot exceed 5')
    .optional(),
  screenshots: z.array(z.string().url('Invalid screenshot URL')).optional(),
  created_at: z.string().datetime().optional(),
});

export type Feedback = z.infer<typeof feedbackSchema>;

/**
 * Support Ticket Schema
 */
export const supportTicketSchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string().uuid('Invalid user ID'),
  subject: z.string()
    .min(5, 'Subject must be at least 5 characters')
    .max(200, 'Subject must be less than 200 characters'),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(5000, 'Description must be less than 5000 characters'),
  priority: z.enum(['low', 'medium', 'high', 'urgent'], {
    errorMap: () => ({ message: 'Invalid priority level' }),
  }).default('medium'),
  status: z.enum(['open', 'in_progress', 'resolved', 'closed'], {
    errorMap: () => ({ message: 'Invalid ticket status' }),
  }).default('open'),
  category: z.enum(['technical', 'billing', 'account', 'content', 'other'], {
    errorMap: () => ({ message: 'Invalid ticket category' }),
  }),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
  resolved_at: z.string().datetime().optional().nullable(),
});

export type SupportTicket = z.infer<typeof supportTicketSchema>;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Validate data against a schema and return formatted errors
 */
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  errors?: Record<string, string>;
} {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  const errors: Record<string, string> = {};
  result.error.errors.forEach((error) => {
    const path = error.path.join('.');
    errors[path] = error.message;
  });
  
  return { success: false, errors };
}

/**
 * Create a validation error response
 */
export function createValidationError(errors: Record<string, string>) {
  return {
    error: 'Validation failed',
    details: errors,
  };
}
