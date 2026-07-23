/**
 * Server-Side Role-Based Access Control (RBAC)
 * Validates user roles and permissions before allowing access to protected routes
 * OWASP A01: Broken Access Control mitigation
 */

export enum UserRole {
  STUDENT = 'student',
  TEACHER = 'teacher',
  PARENT = 'parent',
  ADMIN = 'admin',
}

export enum Permission {
  // Student permissions
  VIEW_COURSES = 'view_courses',
  ENROLL_COURSES = 'enroll_courses',
  SUBMIT_ASSIGNMENTS = 'submit_assignments',
  VIEW_PROGRESS = 'view_progress',
  
  // Teacher permissions
  CREATE_COURSES = 'create_courses',
  EDIT_COURSES = 'edit_courses',
  GRADE_ASSIGNMENTS = 'grade_assignments',
  VIEW_STUDENT_PROGRESS = 'view_student_progress',
  MANAGE_STUDENTS = 'manage_students',
  
  // Parent permissions
  VIEW_CHILD_PROGRESS = 'view_child_progress',
  MANAGE_CHILD_ACCOUNT = 'manage_child_account',
  
  // Admin permissions
  MANAGE_USERS = 'manage_users',
  MANAGE_ROLES = 'manage_roles',
  VIEW_ANALYTICS = 'view_analytics',
  MANAGE_SETTINGS = 'manage_settings',
  DELETE_DATA = 'delete_data',
}

/**
 * Role to permissions mapping
 */
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.STUDENT]: [
    Permission.VIEW_COURSES,
    Permission.ENROLL_COURSES,
    Permission.SUBMIT_ASSIGNMENTS,
    Permission.VIEW_PROGRESS,
  ],
  [UserRole.TEACHER]: [
    Permission.VIEW_COURSES,
    Permission.CREATE_COURSES,
    Permission.EDIT_COURSES,
    Permission.GRADE_ASSIGNMENTS,
    Permission.VIEW_STUDENT_PROGRESS,
    Permission.MANAGE_STUDENTS,
  ],
  [UserRole.PARENT]: [
    Permission.VIEW_COURSES,
    Permission.VIEW_CHILD_PROGRESS,
    Permission.MANAGE_CHILD_ACCOUNT,
  ],
  [UserRole.ADMIN]: [
    Permission.VIEW_COURSES,
    Permission.ENROLL_COURSES,
    Permission.SUBMIT_ASSIGNMENTS,
    Permission.VIEW_PROGRESS,
    Permission.CREATE_COURSES,
    Permission.EDIT_COURSES,
    Permission.GRADE_ASSIGNMENTS,
    Permission.VIEW_STUDENT_PROGRESS,
    Permission.MANAGE_STUDENTS,
    Permission.VIEW_CHILD_PROGRESS,
    Permission.MANAGE_CHILD_ACCOUNT,
    Permission.MANAGE_USERS,
    Permission.MANAGE_ROLES,
    Permission.VIEW_ANALYTICS,
    Permission.MANAGE_SETTINGS,
    Permission.DELETE_DATA,
  ],
};

/**
 * Route to required permissions mapping
 */
const ROUTE_PERMISSIONS: Record<string, Permission[]> = {
  '/app/dashboard': [Permission.VIEW_COURSES],
  '/app/courses': [Permission.VIEW_COURSES],
  '/app/courses/create': [Permission.CREATE_COURSES],
  '/app/courses/edit': [Permission.EDIT_COURSES],
  '/app/assignments': [Permission.SUBMIT_ASSIGNMENTS],
  '/app/grading': [Permission.GRADE_ASSIGNMENTS],
  '/app/students': [Permission.MANAGE_STUDENTS],
  '/app/progress': [Permission.VIEW_PROGRESS],
  '/app/parent': [Permission.VIEW_CHILD_PROGRESS],
  '/app/admin': [Permission.MANAGE_USERS],
  '/app/admin/users': [Permission.MANAGE_USERS],
  '/app/admin/roles': [Permission.MANAGE_ROLES],
  '/app/admin/analytics': [Permission.VIEW_ANALYTICS],
  '/app/admin/settings': [Permission.MANAGE_SETTINGS],
  '/app/admin/data': [Permission.DELETE_DATA],
};

/**
 * User session interface
 */
export interface UserSession {
  id: string;
  email: string;
  role: UserRole;
  permissions: Permission[];
  schoolId?: string;
  districtId?: string;
}

/**
 * Check if user has required permission
 */
export function hasPermission(user: UserSession, permission: Permission): boolean {
  return user.permissions.includes(permission);
}

/**
 * Check if user has any of the required permissions
 */
export function hasAnyPermission(user: UserSession, permissions: Permission[]): boolean {
  return permissions.some(permission => user.permissions.includes(permission));
}

/**
 * Check if user has all required permissions
 */
export function hasAllPermissions(user: UserSession, permissions: Permission[]): boolean {
  return permissions.every(permission => user.permissions.includes(permission));
}

/**
 * Get permissions for a role
 */
export function getPermissionsForRole(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Validate user session and extract role
 */
export async function validateSession(token: string): Promise<UserSession | null> {
  try {
    // In a real implementation, this would verify the JWT with Supabase
    // For now, we'll decode the token (in production, use Supabase auth)
    
    const payload = parseJWT(token);
    
    if (!payload || !payload.role) {
      return null;
    }
    
    const role = payload.role as UserRole;
    const permissions = getPermissionsForRole(role);
    
    return {
      id: payload.sub,
      email: payload.email,
      role,
      permissions,
      schoolId: payload.school_id,
      districtId: payload.district_id,
    };
  } catch (error) {
    console.error('Session validation failed:', error);
    return null;
  }
}

/**
 * Parse JWT token (for demonstration - use proper JWT library in production)
 */
function parseJWT(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

/**
 * Check if user can access a route
 */
export function canAccessRoute(user: UserSession, route: string): boolean {
  const requiredPermissions = ROUTE_PERMISSIONS[route];
  
  if (!requiredPermissions || requiredPermissions.length === 0) {
    return true; // Public route
  }
  
  return hasAnyPermission(user, requiredPermissions);
}

/**
 * Express middleware for RBAC
 */
export function rbacMiddleware(requiredPermissions: Permission[]) {
  return (req: any, res: any, next: any) => {
    const user = req.user as UserSession;
    
    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }
    
    if (!hasAnyPermission(user, requiredPermissions)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Insufficient permissions',
      });
    }
    
    next();
  };
}

/**
 * React Router compatible RBAC hook
 */
export function useRBAC() {
  const checkAccess = (user: UserSession | null, route: string): boolean => {
    if (!user) return false;
    return canAccessRoute(user, route);
  };
  
  const checkPermission = (user: UserSession | null, permission: Permission): boolean => {
    if (!user) return false;
    return hasPermission(user, permission);
  };
  
  return {
    checkAccess,
    checkPermission,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
}

/**
 * FERPA compliant tenant isolation check
 * Ensures users can only access data from their own school/district
 */
export function checkTenantAccess(
  user: UserSession,
  targetSchoolId?: string,
  targetDistrictId?: string
): boolean {
  // Admins can access all data
  if (user.role === UserRole.ADMIN) {
    return true;
  }
  
  // Check school isolation
  if (user.schoolId && targetSchoolId && user.schoolId !== targetSchoolId) {
    return false;
  }
  
  // Check district isolation
  if (user.districtId && targetDistrictId && user.districtId !== targetDistrictId) {
    return false;
  }
  
  return true;
}

/**
 * Apply tenant isolation to Supabase queries
 */
export function applyTenantFilter(query: any, user: UserSession): any {
  // Admins bypass tenant isolation
  if (user.role === UserRole.ADMIN) {
    return query;
  }
  
  // Apply school filter if user has school_id
  if (user.schoolId) {
    query = query.eq('school_id', user.schoolId);
  }
  
  // Apply district filter if user has district_id
  if (user.districtId) {
    query = query.eq('district_id', user.districtId);
  }
  
  return query;
}
