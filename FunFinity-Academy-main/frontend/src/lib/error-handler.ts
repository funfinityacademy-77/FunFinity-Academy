/**
 * Error Handler Utility
 * Converts technical errors into user-friendly messages with actionable solutions
 */

export type ErrorCategory = 'backend' | 'frontend' | 'network' | 'auth' | 'validation' | 'database' | 'permission' | 'timeout';

export interface UserFriendlyError {
  message: string;
  category: ErrorCategory;
  technical?: string;
  action?: string;
  retryable?: boolean;
}

/**
 * Maps technical error messages to user-friendly messages with actionable solutions
 */
export function getUserFriendlyError(error: any): UserFriendlyError {
  const errorMessage = error?.message || String(error);
  const errorStatus = error?.status;
  const errorCode = error?.code;
  
  // Rate limiting errors
  if (errorMessage.includes('rate limit') || errorMessage.includes('too many requests') || errorStatus === 429) {
    return {
      message: 'Rate Limit Exceeded',
      category: 'backend',
      technical: errorMessage,
      action: 'Please wait a few minutes before trying again. You can also try refreshing the page.',
      retryable: true
    };
  }
  
  // Supabase RLS policy errors
  if (errorMessage.includes('row-level security policy') || errorMessage.includes('RLS') || errorCode === '42501') {
    return {
      message: 'Permission Denied',
      category: 'permission',
      technical: errorMessage,
      action: 'You do not have permission to perform this action. Please contact support if you believe this is an error.',
      retryable: false
    };
  }
  
  // Database connection errors
  if (errorMessage.includes('connection') || errorMessage.includes('network') || errorMessage.includes('fetch') || errorStatus === 503) {
    return {
      message: 'Connection Error',
      category: 'network',
      technical: errorMessage,
      action: 'Unable to connect to the server. Please check your internet connection and try again.',
      retryable: true
    };
  }
  
  // Database unique constraint violations
  if (errorMessage.includes('duplicate key') || errorMessage.includes('unique constraint') || errorCode === '23505' || errorStatus === 409) {
    return {
      message: 'Account Already Exists',
      category: 'auth',
      technical: errorMessage,
      action: 'An account with this email already exists. Please try logging in instead.',
      retryable: false
    };
  }
  
  // Timeout errors
  if (errorMessage.includes('timeout') || errorMessage.includes('timed out') || errorStatus === 408) {
    return {
      message: 'Request Timeout',
      category: 'timeout',
      technical: errorMessage,
      action: 'The request took too long to complete. Please try again.',
      retryable: true
    };
  }
  
  // Backend/Database errors
  if (errorMessage.includes('table') || errorMessage.includes('schema') || errorMessage.includes('relation') || errorMessage.includes('column')) {
    return {
      message: 'Database Error',
      category: 'database',
      technical: errorMessage,
      action: 'Unable to save your data. This may be a temporary issue. Please try again later.',
      retryable: true
    };
  }
  
  // Auth errors
  if (errorMessage.includes('auth') || errorMessage.includes('login') || errorMessage.includes('password') || errorStatus === 401) {
    if (errorMessage.includes('Email not confirmed') || errorMessage.includes('not confirmed') || errorMessage.includes('email confirmation')) {
      return {
        message: 'Email Not Confirmed',
        category: 'auth',
        technical: errorMessage,
        action: 'Please check your email and click the confirmation link to activate your account. If you didn\'t receive the email, please sign up again.',
        retryable: false
      };
    }
    if (errorMessage.includes('Invalid') || errorMessage.includes('credentials') || errorMessage.includes('Invalid login credentials')) {
      return {
        message: 'Invalid Credentials',
        category: 'auth',
        technical: errorMessage,
        action: 'Please check your email and password and try again.',
        retryable: false
      };
    }
    if (errorMessage.includes('already registered') || errorMessage.includes('already exists') || errorMessage.includes('User already registered')) {
      return {
        message: 'Account Already Exists',
        category: 'auth',
        technical: errorMessage,
        action: 'An account with this email already exists. Please try logging in instead.',
        retryable: false
      };
    }
    return {
      message: 'Authentication Error',
      category: 'auth',
      technical: errorMessage,
      action: 'Please check your credentials and try again, or contact support if the issue persists.',
      retryable: false
    };
  }
  
  // Permission errors
  if (errorStatus === 403 || errorMessage.includes('forbidden') || errorMessage.includes('permission')) {
    return {
      message: 'Access Denied',
      category: 'permission',
      technical: errorMessage,
      action: 'You do not have permission to access this resource. Please contact support if you believe this is an error.',
      retryable: false
    };
  }
  
  // Not found errors
  if (errorStatus === 404 || errorMessage.includes('not found') || errorMessage.includes('does not exist')) {
    return {
      message: 'Resource Not Found',
      category: 'frontend',
      technical: errorMessage,
      action: 'The requested resource could not be found. Please check the URL or navigate back.',
      retryable: false
    };
  }
  
  // Validation errors
  if (errorMessage.includes('required') || errorMessage.includes('invalid') || errorMessage.includes('format') || errorStatus === 400) {
    if (errorMessage.includes('email')) {
      return {
        message: 'Invalid Email Format',
        category: 'validation',
        technical: errorMessage,
        action: 'Please enter a valid email address.',
        retryable: false
      };
    }
    if (errorMessage.includes('password')) {
      return {
        message: 'Invalid Password',
        category: 'validation',
        technical: errorMessage,
        action: 'Password must be at least 8 characters long and contain letters and numbers.',
        retryable: false
      };
    }
    return {
      message: 'Validation Error',
      category: 'validation',
      technical: errorMessage,
      action: 'Please check your input and ensure all required fields are filled correctly.',
      retryable: false
    };
  }
  
  // Server errors
  if (errorStatus >= 500) {
    return {
      message: 'Server Error',
      category: 'backend',
      technical: errorMessage,
      action: 'Our servers are experiencing issues. Please try again later or contact support.',
      retryable: true
    };
  }
  
  // Default fallback
  return {
    message: 'An Unexpected Error Occurred',
    category: 'frontend',
    technical: errorMessage,
    action: 'Please try refreshing the page. If the issue persists, contact support.',
    retryable: true
  };
}

/**
 * Logs technical error details to console (for debugging)
 * while showing user-friendly message to user
 */
export function logError(error: any, context: string = 'Error') {
  const userError = getUserFriendlyError(error);
  console.error(`[${context}]`, {
    userMessage: userError.message,
    category: userError.category,
    technical: userError.technical,
    action: userError.action,
    retryable: userError.retryable,
    timestamp: new Date().toISOString()
  });
  return userError;
}

/**
 * Test function to simulate different error scenarios
 * Useful for testing error handling UI
 */
export function testErrorScenarios() {
  const scenarios = [
    { name: 'Rate Limit', error: { message: 'Rate limit exceeded', status: 429 } },
    { name: 'Auth Invalid', error: { message: 'Invalid login credentials', status: 401 } },
    { name: 'Auth Exists', error: { message: 'User already registered', status: 409 } },
    { name: 'Network', error: { message: 'Network connection failed' } },
    { name: 'Timeout', error: { message: 'Request timeout', status: 408 } },
    { name: 'Permission', error: { message: 'Access denied', status: 403 } },
    { name: 'Not Found', error: { message: 'Resource not found', status: 404 } },
    { name: 'Validation', error: { message: 'Invalid email format', status: 400 } },
    { name: 'Database', error: { message: 'Table does not exist' } },
    { name: 'Server', error: { message: 'Internal server error', status: 500 } },
  ];
  
  return scenarios.map(scenario => ({
    ...scenario,
    userError: getUserFriendlyError(scenario.error)
  }));
}

