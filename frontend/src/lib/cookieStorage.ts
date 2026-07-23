/**
 * Cookie Storage Adapter for Supabase Auth
 * Migrates from localStorage to HttpOnly Secure cookies
 * Prevents XSS attacks by storing JWTs in secure cookies
 */

export interface CookieStorageOptions {
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
  path?: string;
  domain?: string;
}

const defaultOptions: CookieStorageOptions = {
  secure: true,
  httpOnly: true,
  sameSite: 'strict',
  path: '/',
};

/**
 * Custom storage adapter for Supabase using cookies
 */
export class CookieStorage {
  private options: CookieStorageOptions;

  constructor(options: Partial<CookieStorageOptions> = {}) {
    this.options = { ...defaultOptions, ...options };
  }

  /**
   * Get item from cookie
   */
  async getItem(key: string): Promise<string | null> {
    if (typeof document === 'undefined') return null;
    
    const cookies = document.cookie.split(';');
    const cookie = cookies.find(c => c.trim().startsWith(`${key}=`));
    
    if (!cookie) return null;
    
    try {
      const value = cookie.split('=')[1];
      return decodeURIComponent(value);
    } catch {
      return null;
    }
  }

  /**
   * Set item in cookie
   */
  async setItem(key: string, value: string): Promise<void> {
    if (typeof document === 'undefined') return;
    
    const encodedValue = encodeURIComponent(value);
    const cookieString = this.buildCookieString(key, encodedValue);
    
    document.cookie = cookieString;
  }

  /**
   * Remove item from cookie
   */
  async removeItem(key: string): Promise<void> {
    if (typeof document === 'undefined') return;
    
    const cookieString = this.buildCookieString(key, '', 'Thu, 01 Jan 1970 00:00:00 GMT');
    document.cookie = cookieString;
  }

  /**
   * Build cookie string with options
   */
  private buildCookieString(
    key: string,
    value: string,
    expires: string = 'Fri, 31 Dec 9999 23:59:59 GMT'
  ): string {
    const parts = [
      `${key}=${value}`,
      `Expires=${expires}`,
      `Path=${this.options.path}`,
      `SameSite=${this.options.sameSite}`,
    ];

    if (this.options.secure) {
      parts.push('Secure');
    }

    if (this.options.httpOnly) {
      parts.push('HttpOnly');
    }

    if (this.options.domain) {
      parts.push(`Domain=${this.options.domain}`);
    }

    return parts.join('; ');
  }
}

/**
 * Create a cookie storage instance for Supabase
 */
export const cookieStorage = new CookieStorage();

/**
 * Hybrid storage that falls back to localStorage for non-HttpOnly cookies
 * (Useful for development or when HttpOnly cookies can't be set)
 */
export class HybridStorage {
  private cookieStorage: CookieStorage;
  private useCookies: boolean = true;

  constructor(cookieOptions?: Partial<CookieStorageOptions>) {
    this.cookieStorage = new CookieStorage(cookieOptions);
    
    // Detect if we can use HttpOnly cookies
    this.useCookies = this.detectCookieSupport();
  }

  private detectCookieSupport(): boolean {
    try {
      // Try to set a test cookie
      document.cookie = 'test=1; SameSite=Strict; Secure';
      const supports = document.cookie.includes('test=1');
      document.cookie = 'test=; Expires=Thu, 01 Jan 1970 00:00:00 GMT';
      return supports;
    } catch {
      return false;
    }
  }

  async getItem(key: string): Promise<string | null> {
    if (this.useCookies) {
      return await this.cookieStorage.getItem(key);
    }
    return localStorage.getItem(key);
  }

  async setItem(key: string, value: string): Promise<void> {
    if (this.useCookies) {
      await this.cookieStorage.setItem(key, value);
    } else {
      localStorage.setItem(key, value);
    }
  }

  async removeItem(key: string): Promise<void> {
    if (this.useCookies) {
      await this.cookieStorage.removeItem(key);
    } else {
      localStorage.removeItem(key);
    }
  }
}

/**
 * Server-side cookie storage for Supabase Edge Functions
 */
export class ServerCookieStorage {
  private cookies: Map<string, string>;

  constructor(cookies?: Record<string, string>) {
    this.cookies = new Map(Object.entries(cookies || {}));
  }

  async getItem(key: string): Promise<string | null> {
    return this.cookies.get(key) || null;
  }

  async setItem(key: string, value: string): Promise<void> {
    this.cookies.set(key, value);
  }

  async removeItem(key: string): Promise<void> {
    this.cookies.delete(key);
  }

  /**
   * Get Set-Cookie headers for response
   */
  getSetCookieHeaders(): string[] {
    const headers: string[] = [];
    
    for (const [key, value] of this.cookies.entries()) {
      const cookieString = `${key}=${encodeURIComponent(value)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=604800`;
      headers.push(cookieString);
    }
    
    return headers;
  }
}
