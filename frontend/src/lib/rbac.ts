/**
 * Role-Based Access Control (RBAC) System
 * 
 * This file defines the RBAC system for FunFinity Academy
 * ensuring proper access control based on user roles and permissions.
 */

export enum UserRole {
  STUDENT = 'student',
  TEACHER = 'teacher',
  PARENT = 'parent',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin'
}

export enum Permission {
  // Student permissions
  VIEW_COURSES = 'view_courses',
  ENROLL_COURSES = 'enroll_courses',
  SUBMIT_QUIZZES = 'submit_quizzes',
  VIEW_PROGRESS = 'view_progress',
  VIEW_OWN_PROFILE = 'view_own_profile',
  EDIT_OWN_PROFILE = 'edit_own_profile',
  
  // Teacher permissions
  CREATE_COURSES = 'create_courses',
  EDIT_COURSES = 'edit_courses',
  DELETE_COURSES = 'delete_courses',
  GRADE_QUIZZES = 'grade_quizzes',
  VIEW_STUDENT_PROGRESS = 'view_student_progress',
  MANAGE_CLASSROOM = 'manage_classroom',
  
  // Parent permissions
  VIEW_CHILD_PROGRESS = 'view_child_progress',
  MANAGE_CHILD_CONSENT = 'manage_child_consent',
  VIEW_CHILD_PROFILE = 'view_child_profile',
  
  // Admin permissions
  MANAGE_USERS = 'manage_users',
  MANAGE_ROLES = 'manage_roles',
  VIEW_ANALYTICS = 'view_analytics',
  MANAGE_CONTENT = 'manage_content',
  MANAGE_GAMIFICATION = 'manage_gamification',
  MANAGE_NOTIFICATIONS = 'manage_notifications',
  MANAGE_SETTINGS = 'manage_settings',
  VIEW_AUDIT_LOGS = 'view_audit_logs',
  
  // Super Admin permissions
  DELETE_USERS = 'delete_users',
  MANAGE_ADMIN_USERS = 'manage_admin_users',
  MANAGE_SYSTEM_CONFIG = 'manage_system_config',
  EXPORT_DATA = 'export_data'
}

// Role to permissions mapping
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.STUDENT]: [
    Permission.VIEW_COURSES,
    Permission.ENROLL_COURSES,
    Permission.SUBMIT_QUIZZES,
    Permission.VIEW_PROGRESS,
    Permission.VIEW_OWN_PROFILE,
    Permission.EDIT_OWN_PROFILE
  ],
  
  [UserRole.TEACHER]: [
    Permission.VIEW_COURSES,
    Permission.CREATE_COURSES,
    Permission.EDIT_COURSES,
    Permission.GRADE_QUIZZES,
    Permission.VIEW_STUDENT_PROGRESS,
    Permission.MANAGE_CLASSROOM,
    Permission.VIEW_OWN_PROFILE,
    Permission.EDIT_OWN_PROFILE
  ],
  
  [UserRole.PARENT]: [
    Permission.VIEW_CHILD_PROGRESS,
    Permission.MANAGE_CHILD_CONSENT,
    Permission.VIEW_CHILD_PROFILE
  ],
  
  [UserRole.ADMIN]: [
    Permission.VIEW_COURSES,
    Permission.MANAGE_USERS,
    Permission.MANAGE_ROLES,
    Permission.VIEW_ANALYTICS,
    Permission.MANAGE_CONTENT,
    Permission.MANAGE_GAMIFICATION,
    Permission.MANAGE_NOTIFICATIONS,
    Permission.MANAGE_SETTINGS,
    Permission.VIEW_AUDIT_LOGS,
    Permission.VIEW_OWN_PROFILE,
    Permission.EDIT_OWN_PROFILE
  ],
  
  [UserRole.SUPER_ADMIN]: [
    // All permissions
    ...Object.values(Permission)
  ]
};

/**
 * Check if a user has a specific permission
 */
export function hasPermission(userRole: UserRole, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[userRole] || [];
  return permissions.includes(permission);
}

/**
 * Check if a user has any of the specified permissions
 */
export function hasAnyPermission(userRole: UserRole, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(userRole, permission));
}

/**
 * Check if a user has all of the specified permissions
 */
export function hasAllPermissions(userRole: UserRole, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(userRole, permission));
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(userRole: UserRole): Permission[] {
  return ROLE_PERMISSIONS[userRole] || [];
}

/**
 * Check if a role can access a specific route
 */
export function canAccessRoute(userRole: UserRole, route: string): boolean {
  const routePermissions: Record<string, Permission[]> = {
    '/app/courses': [Permission.VIEW_COURSES],
    '/app/my-learning': [Permission.VIEW_PROGRESS],
    '/app/quizzes': [Permission.SUBMIT_QUIZZES],
    '/app/profile': [Permission.VIEW_OWN_PROFILE],
    '/app/settings': [Permission.EDIT_OWN_PROFILE],
    
    '/admin/users': [Permission.MANAGE_USERS],
    '/admin/analytics': [Permission.VIEW_ANALYTICS],
    '/admin/courses': [Permission.MANAGE_CONTENT],
    '/admin/gamification': [Permission.MANAGE_GAMIFICATION],
    '/admin/notifications': [Permission.MANAGE_NOTIFICATIONS],
    '/admin/settings': [Permission.MANAGE_SETTINGS],
    
    '/teacher/courses': [Permission.CREATE_COURSES],
    '/teacher/classroom': [Permission.MANAGE_CLASSROOM],
    
    '/parent/dashboard': [Permission.VIEW_CHILD_PROGRESS],
    '/parent/consent': [Permission.MANAGE_CHILD_CONSENT]
  };

  const requiredPermissions = routePermissions[route];
  if (!requiredPermissions) return true; // No specific permissions required
  
  return hasAnyPermission(userRole, requiredPermissions);
}

/**
 * Audit log entry structure
 */
export interface AuditLogEntry {
  id: string;
  userId: string;
  userRole: UserRole;
  action: string;
  resource: string;
  resourceId?: string;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  errorMessage?: string;
}

/**
 * Log an action for audit purposes
 */
export function logAuditAction(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): AuditLogEntry {
  const auditEntry: AuditLogEntry = {
    ...entry,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString()
  };
  
  // In production, this would be sent to a secure audit log service
  console.log('[AUDIT LOG]', auditEntry);
  
  return auditEntry;
}
