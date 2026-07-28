/**
 * FERPA Compliant Tenant Isolation
 * Ensures educational data cannot leak across organization perimeters
 * Implements row-level security via school_id and district_id
 */

import { supabase } from './supabase';
import { UserRole } from '../middleware/rbac';

export interface TenantContext {
  schoolId?: string;
  districtId?: string;
  userId: string;
  role: UserRole;
}

/**
 * Apply tenant isolation to a Supabase query
 * This ensures users can only access data from their own school/district
 */
export function applyTenantIsolation(
  query: any,
  context: TenantContext
): any {
  // Admins bypass tenant isolation for system-wide operations
  if (context.role === UserRole.ADMIN) {
    return query;
  }

  // Apply school isolation if user has a school_id
  if (context.schoolId) {
    query = query.eq('school_id', context.schoolId);
  }

  // Apply district isolation if user has a district_id
  if (context.districtId) {
    query = query.eq('district_id', context.districtId);
  }

  return query;
}

/**
 * Get user's tenant context from their profile
 */
export async function getUserTenantContext(userId: string): Promise<TenantContext> {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, school_id, district_id, role')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      console.error('Failed to fetch user tenant context:', error);
      return {
        userId,
        role: UserRole.STUDENT,
      };
    }

    return {
      userId: profile.id,
      schoolId: profile.school_id,
      districtId: profile.district_id,
      role: profile.role as UserRole,
    };
  } catch (error) {
    console.error('Error fetching tenant context:', error);
    return {
      userId,
      role: UserRole.STUDENT,
    };
  }
}

/**
 * Check if a user can access a specific resource
 */
export async function canAccessResource(
  userId: string,
  resourceTable: string,
  resourceId: string
): Promise<boolean> {
  const context = await getUserTenantContext(userId);

  try {
    let query = supabase
      .from(resourceTable)
      .select('id, school_id, district_id')
      .eq('id', resourceId);

    query = applyTenantIsolation(query, context);

    const { data, error } = await query.single();

    if (error || !data) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Filter data by tenant context
 */
export function filterByTenant<T extends { school_id?: string; district_id?: string }>(
  data: T[],
  context: TenantContext
): T[] {
  if (context.role === UserRole.ADMIN) {
    return data;
  }

  return data.filter(item => {
    if (context.schoolId && item.school_id !== context.schoolId) {
      return false;
    }
    if (context.districtId && item.district_id !== context.district_id) {
      return false;
    }
    return true;
  });
}

/**
 * Create a resource with tenant context
 */
export async function createResourceWithTenant(
  table: string,
  data: any,
  context: TenantContext
) {
  const resourceData = {
    ...data,
    school_id: context.schoolId,
    district_id: context.districtId,
  };

  const { data: result, error } = await supabase
    .from(table)
    .insert(resourceData)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return result;
}

/**
 * Update a resource with tenant validation
 */
export async function updateResourceWithTenant(
  table: string,
  resourceId: string,
  data: any,
  context: TenantContext
) {
  // First check if user has access
  const canAccess = await canAccessResource(context.userId, table, resourceId);
  
  if (!canAccess) {
    throw new Error('Access denied: Resource not in your tenant');
  }

  const { data: result, error } = await supabase
    .from(table)
    .update(data)
    .eq('id', resourceId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return result;
}

/**
 * Delete a resource with tenant validation
 */
export async function deleteResourceWithTenant(
  table: string,
  resourceId: string,
  context: TenantContext
) {
  // First check if user has access
  const canAccess = await canAccessResource(context.userId, table, resourceId);
  
  if (!canAccess) {
    throw new Error('Access denied: Resource not in your tenant');
  }

  const { error } = await supabase
    .from(table)
    .delete()
    .eq('id', resourceId);

  if (error) {
    throw error;
  }
}

/**
 * Query resources with tenant isolation
 */
export async function queryResourcesWithTenant(
  table: string,
  context: TenantContext,
  options?: {
    select?: string;
    orderBy?: { column: string; ascending?: boolean };
    limit?: number;
    offset?: number;
  }
) {
  let query = supabase.from(table).select(options?.select || '*');

  query = applyTenantIsolation(query, context);

  if (options?.orderBy) {
    query = query.order(options.orderBy.column, { 
      ascending: options.orderBy.ascending ?? true 
    });
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data;
}

/**
 * FERPA compliance check for student data access
 * Parents can only access their own children's data
 */
export async function canAccessStudentData(
  parentUserId: string,
  studentUserId: string
): Promise<boolean> {
  try {
    const { data: parentProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', parentUserId)
      .single();

    if (!parentProfile || parentProfile.role !== 'parent') {
      return false;
    }

    // Check if student is linked to this parent
    const { data: link } = await supabase
      .from('parent_child_links')
      .select('*')
      .eq('parent_id', parentUserId)
      .eq('child_id', studentUserId)
      .single();

    return !!link;
  } catch {
    return false;
  }
}

/**
 * Mask PII for FERPA compliance
 * Reduces sensitive information in logs and exports
 */
export function maskStudentPII(data: any): any {
  if (!data || typeof data !== 'object') return data;

  const sensitiveFields = [
    'first_name', 'last_name', 'full_name', 'display_name',
    'email', 'phone', 'address', 'date_of_birth',
    'ssn', 'student_id', 'parent_email',
  ];

  const masked: any = Array.isArray(data) ? [] : {};

  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();
    
    if (sensitiveFields.some(field => lowerKey.includes(field))) {
      if (typeof value === 'string') {
        // Show only first 2 and last 2 characters
        masked[key] = value.length > 4 
          ? `${value.substring(0, 2)}${'*'.repeat(value.length - 4)}${value.substring(value.length - 2)}`
          : '****';
      } else {
        masked[key] = '[REDACTED]';
      }
    } else if (typeof value === 'object' && value !== null) {
      masked[key] = maskStudentPII(value);
    } else {
      masked[key] = value;
    }
  }

  return masked;
}
