/**
 * useMounted Hook
 * Prevents hydration mismatches by checking if component is mounted on client
 * Use this for components that rely on window, localStorage, or other browser APIs
 */

import { useEffect, useState } from 'react';

export function useMounted() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return isMounted;
}

/**
 * useClientOnly Hook
 * Returns null during SSR, renders children only on client
 */
export function useClientOnly() {
  const isMounted = useMounted();
  return isMounted;
}
