/**
 * Zod Validation Schemas
 * Runtime validation for all form inputs and API responses
 */

import { z } from 'zod';

// ============================================================================
// AUTHENTICATION SCHEMAS
// ============================================================================

export const signUpSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(255, 'Email is too long')
    .refine(
      (email) => !email.includes('+'),
      'Email addresses with + are not supported'
    )
    .refine(
      (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
      'Please enter a valid email format'
    ),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long')
    .refine(
      (password) => /[A-Z]/.test(password),
      'Password must contain at least one uppercase letter'
    )
    .refine(
      (password) => /[a-z]/.test(password),
      'Password must contain at least one lowercase letter'
    )
    .refine(
      (password) => /[0-9]/.test(password),
      'Password must contain at least one number'
    )
    .refine(
      (password) => /[!@#$%^&*(),.?":{}|<>]/.test(password),
      'Password must contain at least one special character'
    ),
  displayName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name is too long')
    .refine(
      (name) => /^[a-zA-Z\s\-']+$/.test(name),
      'Name can only contain letters, spaces, hyphens, and apostrophes'
    )
    .refine(
      (name) => !name.includes('  '),
      'Name cannot contain consecutive spaces'
    ),
  role: z.enum(['student', 'teacher', 'parent'], {
    errorMap: () => ({ message: 'Please select a valid role' }),
  }),
});

export const signInSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(255, 'Email is too long'),
  password: z
    .string()
    .min(1, 'Password is required')
    .max(128, 'Password is too long'),
});

export const resetPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(255, 'Email is too long'),
});

export const updatePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'Current password is required')
    .max(128, 'Password is too long'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long')
    .refine(
      (password) => /[A-Z]/.test(password),
      'Password must contain at least one uppercase letter'
    )
    .refine(
      (password) => /[a-z]/.test(password),
      'Password must contain at least one lowercase letter'
    )
    .refine(
      (password) => /[0-9]/.test(password),
      'Password must contain at least one number'
    )
    .refine(
      (password) => /[!@#$%^&*(),.?":{}|<>]/.test(password),
      'Password must contain at least one special character'
    ),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// ============================================================================
// PROFILE SCHEMAS
// ============================================================================

export const updateProfileSchema = z.object({
  displayName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name is too long')
    .optional(),
  bio: z
    .string()
    .max(500, 'Bio is too long')
    .optional(),
  avatarUrl: z
    .string()
    .url('Please enter a valid URL')
    .optional()
    .or(z.literal('')),
  grade: z
    .string()
    .optional(),
  interests: z
    .array(z.string())
    .max(10, 'You can select up to 10 interests')
    .optional(),
});

// ============================================================================
// COURSE SCHEMAS
// ============================================================================

export const createCourseSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title is too long')
    .refine(
      (title) => !/^\s+$/.test(title),
      'Title cannot be only whitespace'
    ),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description is too long')
    .refine(
      (desc) => !/^\s+$/.test(desc),
      'Description cannot be only whitespace'
    ),
  subject: z.enum(['math', 'science', 'english', 'social', 'other'], {
    errorMap: () => ({ message: 'Please select a valid subject' }),
  }),
  gradeLevel: z.enum(['elementary', 'middle', 'high'], {
    errorMap: () => ({ message: 'Please select a valid grade level' }),
  }),
  thumbnailUrl: z
    .string()
    .url('Please enter a valid URL')
    .optional()
    .or(z.literal('')),
  isPublished: z.boolean().default(false),
});

export const updateCourseSchema = createCourseSchema.partial().extend({
  id: z.string().uuid('Invalid course ID'),
});

// ============================================================================
// A4 INFOGRAPHIC SCHEMAS
// ============================================================================

export const infographicElementSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(['text', 'image', 'shape', 'icon']),
  x: z.number().min(0).max(210),
  y: z.number().min(0).max(297),
  width: z.number().min(10).max(210),
  height: z.number().min(10).max(297),
  content: z.string().max(5000).optional(),
  fontSize: z.number().min(8).max(72).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format').optional(),
  backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format').optional(),
  rotation: z.number().min(-180).max(180).optional(),
});

export const saveInfographicSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title is too long')
    .refine(
      (title) => !/^\s+$/.test(title),
      'Title cannot be only whitespace'
    ),
  elements: z.array(infographicElementSchema).min(1, 'At least one element is required'),
  backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format'),
  templateId: z.string().optional(),
});

// ============================================================================
// PAYMENT SCHEMAS
// ============================================================================

export const checkoutSessionSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  userEmail: z.string().email('Please enter a valid email address'),
  currency: z.enum(['USD', 'INR', 'BRL', 'MXN', 'PHP', 'IDR', 'NGN', 'PKR', 'BDT', 'VND', 'EGP', 'TRY', 'COP', 'ARS', 'ZAR', 'KE']),
  amount: z.number().positive('Amount must be positive'),
  successUrl: z.string().url('Please enter a valid URL'),
  cancelUrl: z.string().url('Please enter a valid URL'),
  metadata: z.record(z.string()).optional(),
});

// ============================================================================
// PRIVACY REQUEST SCHEMAS
// ============================================================================

export const privacyRequestSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  email: z.string().email('Please enter a valid email address'),
  requestType: z.enum(['deletion', 'export', 'restrict'], {
    errorMap: () => ({ message: 'Please select a valid request type' }),
  }),
  reason: z.string().max(500, 'Reason is too long').optional(),
  verificationToken: z.string().optional(),
});

// ============================================================================
// FEEDBACK SCHEMAS
// ============================================================================

export const feedbackSchema = z.object({
  type: z.enum(['bug', 'feature', 'general'], {
    errorMap: () => ({ message: 'Please select a valid feedback type' }),
  }),
  subject: z
    .string()
    .min(5, 'Subject must be at least 5 characters')
    .max(100, 'Subject is too long'),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(2000, 'Message is too long'),
  screenshot: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
});

// ============================================================================
// API RESPONSE SCHEMAS
// ============================================================================

export const apiResponseSchema = <T>(dataSchema: z.ZodType<T>) =>
  z.object({
    data: dataSchema,
    error: z.string().optional(),
    message: z.string().optional(),
  });

export const paginatedResponseSchema = <T>(dataSchema: z.ZodType<T>) =>
  z.object({
    data: z.array(dataSchema),
    pagination: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      totalPages: z.number(),
    }),
    error: z.string().optional(),
  });

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
export type InfographicElement = z.infer<typeof infographicElementSchema>;
export type SaveInfographicInput = z.infer<typeof saveInfographicSchema>;
export type CheckoutSessionInput = z.infer<typeof checkoutSessionSchema>;
export type PrivacyRequestInput = z.infer<typeof privacyRequestSchema>;
export type FeedbackInput = z.infer<typeof feedbackSchema>;
