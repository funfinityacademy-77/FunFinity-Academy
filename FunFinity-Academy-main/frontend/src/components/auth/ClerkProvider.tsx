import { ClerkProvider as ClerkReactProvider } from '@clerk/clerk-react';
import { ReactNode } from 'react';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 'pk_test_placeholder';

interface ClerkProviderProps {
  children: ReactNode;
}

export function ClerkProvider({ children }: ClerkProviderProps) {
  if (!clerkPubKey || clerkPubKey === 'pk_test_placeholder') {
    console.warn('Clerk publishable key not configured. Using fallback authentication.');
    // Fall back to existing auth system if Clerk is not configured
    return <>{children}</>;
  }

  return (
    <ClerkReactProvider publishableKey={clerkPubKey}>
      {children}
    </ClerkReactProvider>
  );
}
