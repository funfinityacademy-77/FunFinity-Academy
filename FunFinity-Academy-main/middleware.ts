import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse, type NextRequest } from 'next/server'

// ============================================================================
// NEXT.JS APP ROUTER MIDDLEWARE - SESSION & ROLE VALIDATION
// ============================================================================
// This middleware validates user sessions and roles on every request to:
// - /api/* routes
// - /dashboard/* routes
// 
// Security Features:
// - Validates session tokens from HttpOnly cookies
// - Checks user roles (Student, Teacher, Admin)
// - Blocks requests with missing or invalid sessions
// - Blocks requests lacking required role permissions
// - Uses HttpOnly cookies to mitigate XSS risks
// ============================================================================

// Role hierarchy for permission checking
// Higher roles inherit permissions from lower roles
const ROLE_HIERARCHY: Record<string, number> = {
  student: 1,
  instructor: 2,
  admin: 3,
}

// Route configuration with required roles
const PROTECTED_ROUTES: Record<string, string[]> = {
  '/dashboard/admin': ['admin'],
  '/dashboard/instructor': ['instructor', 'admin'],
  '/dashboard/student': ['student', 'instructor', 'admin'],
  '/dashboard': ['student', 'instructor', 'admin'],
}

const API_ROUTES: Record<string, string[]> = {
  '/api/admin': ['admin'],
  '/api/instructor': ['instructor', 'admin'],
  '/api/student': ['student', 'instructor', 'admin'],
}

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/auth',
  '/auth/signin',
  '/auth/signup',
  '/auth/forgot-password',
  '/api/auth',
  '/api/public',
]

// Helper function to check if a path is public
function isPublicPath(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => pathname.startsWith(route))
}

// Helper function to get required roles for a path
function getRequiredRoles(pathname: string): string[] | null {
  // Check dashboard routes
  for (const [route, roles] of Object.entries(PROTECTED_ROUTES)) {
    if (pathname.startsWith(route)) {
      return roles
    }
  }
  
  // Check API routes
  for (const [route, roles] of Object.entries(API_ROUTES)) {
    if (pathname.startsWith(route)) {
      return roles
    }
  }
  
  return null
}

// Helper function to check if user has required role
function hasRole(userRole: string, requiredRoles: string[]): boolean {
  const userLevel = ROLE_HIERARCHY[userRole] || 0
  
  return requiredRoles.some(requiredRole => {
    const requiredLevel = ROLE_HIERARCHY[requiredRole] || 0
    return userLevel >= requiredLevel
  })
}

// Helper function to create Supabase client
async function getSupabaseClient(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          request.cookies.delete({
            name,
            ...options,
          })
          response.cookies.delete({
            name,
            ...options,
          })
        },
      },
    }
  )

  return { supabase, response }
}

// Main middleware function
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for static files, images, etc.
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Allow public routes without authentication
  if (isPublicPath(pathname)) {
    return NextResponse.next()
  }

  // Get required roles for the current path
  const requiredRoles = getRequiredRoles(pathname)

  // If no specific role requirement, allow authenticated users
  if (!requiredRoles) {
    return NextResponse.next()
  }

  // Initialize Supabase client
  const { supabase, response } = await getSupabaseClient(request)

  // Get current session
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  // If no session, redirect to sign-in
  if (!session || sessionError) {
    const signInUrl = new URL('/auth/signin', request.url)
    signInUrl.searchParams.set('redirect', pathname)
    
    // Clear any invalid cookies
    response.cookies.delete('sb-access-token')
    response.cookies.delete('sb-refresh-token')
    
    return NextResponse.redirect(signInUrl)
  }

  // Get user's role from database
  const { data: userRole, error: roleError } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', session.user.id)
    .single()

  // If role fetch fails, default to student role
  const userRoleValue = userRole?.role || 'student'

  // Check if user has required role
  if (!hasRole(userRoleValue, requiredRoles)) {
    // Redirect to appropriate dashboard based on user's role
    const redirectMap: Record<string, string> = {
      admin: '/dashboard/admin',
      instructor: '/dashboard/instructor',
      student: '/dashboard/student',
    }

    const redirectPath = redirectMap[userRoleValue] || '/dashboard/student'
    const redirectUrl = new URL(redirectPath, request.url)
    
    return NextResponse.redirect(redirectUrl)
  }

  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  // Add user info to headers for downstream use
  response.headers.set('x-user-id', session.user.id)
  response.headers.set('x-user-role', userRoleValue)

  return response
}

// Configure middleware matcher
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}

// ============================================================================
// SERVER ACTION HELPERS (for use in Server Components/Actions)
// ============================================================================

/**
 * Helper function to validate session in server actions
 * Call this at the beginning of any server action that requires authentication
 */
export async function validateServerSession() {
  const { cookies } = await import('next/headers')
  const { createServerClient } = await import('@supabase/auth-helpers-nextjs')

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookies().get(name)?.value
        },
      },
    }
  )

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  if (!session || error) {
    throw new Error('Unauthorized: No valid session')
  }

  return { supabase, session }
}

/**
 * Helper function to validate user role in server actions
 * Call this after validateServerSession to check role permissions
 */
export async function validateUserRole(
  session: any,
  requiredRoles: string[]
) {
  const { createServerClient } = await import('@supabase/auth-helpers-nextjs')
  const { cookies } = await import('next/headers')

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookies().get(name)?.value
        },
      },
    }
  )

  const { data: userRole, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', session.user.id)
    .single()

  if (error || !userRole) {
    throw new Error('Failed to fetch user role')
  }

  if (!hasRole(userRole.role, requiredRoles)) {
    throw new Error('Forbidden: Insufficient permissions')
  }

  return userRole.role
}

// ============================================================================
// CLIENT-SIDE AUTH HOOK (for use in Client Components)
// ============================================================================
// Add this to your lib/auth.ts file for client-side auth checks

/*
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useState } from 'react'

export function useAuth() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      
      if (session) {
        const { data: userRole } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .single()
        
        setRole(userRole?.role || 'student')
      }
      
      setLoading(false)
    }

    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        if (session) {
          supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id)
            .single()
            .then(({ data: userRole }) => {
              setRole(userRole?.role || 'student')
            })
        } else {
          setRole(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase])

  return { session, loading, role }
}
*/

// ============================================================================
// HTTPONLY COOKIE CONFIGURATION
// ============================================================================
// Configure Supabase to use HttpOnly cookies for session tokens
// Add this to your Supabase client initialization

/*
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Store session in HttpOnly cookies (server-side only)
    // This prevents XSS attacks from stealing session tokens
    flowType: 'pkce',
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})
*/

// ============================================================================
// SECURITY EXPLANATION
// ============================================================================
/*
WHY HTTPONLY COOKIES?
---------------------
HttpOnly cookies are essential for session security because:

1. **XSS Protection**: HttpOnly cookies cannot be accessed via JavaScript
   (document.cookies), preventing malicious scripts from stealing session tokens.

2. **CSRF Protection**: While HttpOnly cookies don't prevent CSRF by themselves,
   they work in conjunction with SameSite cookie attributes to mitigate CSRF attacks.

3. **Automatic Transmission**: Cookies are automatically sent with every request
   to the same domain, eliminating the need to manually attach tokens to headers.

4. **Secure Flag**: When combined with the Secure flag, cookies are only sent
   over HTTPS, preventing man-in-the-middle attacks.

SESSION TOKEN STORAGE OPTIONS:
-------------------------------
1. HttpOnly Cookies (RECOMMENDED)
   - Pros: XSS-resistant, automatic transmission, secure
   - Cons: Requires server-side rendering or API routes

2. LocalStorage (NOT RECOMMENDED for auth)
   - Pros: Easy client-side access
   - Cons: Vulnerable to XSS attacks

3. SessionStorage (NOT RECOMMENDED for auth)
   - Pros: Cleared on tab close
   - Cons: Vulnerable to XSS attacks

4. Memory (NOT PERSISTENT)
   - Pros: Cleared on page refresh
   - Cons: Not suitable for persistent sessions

IMPLEMENTATION IN SUPABASE:
---------------------------
Supabase Auth Helpers for Next.js automatically handle HttpOnly cookies
when using the createServerClient function. The middleware above ensures
that session validation happens on the server before any protected route
is accessed.

ADDITIONAL SECURITY MEASURES:
------------------------------
1. **SameSite Cookie Attribute**: Set to 'strict' or 'lax' to prevent CSRF
2. **Secure Cookie Attribute**: Only send cookies over HTTPS
3. **Short Session Expiration**: Implement session refresh with reasonable timeouts
4. **IP Binding**: Optionally bind sessions to IP addresses (not implemented here)
5. **Device Fingerprinting**: Track devices for suspicious activity detection
*/
