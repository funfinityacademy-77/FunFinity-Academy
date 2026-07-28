// Production-ready theme system with monochrome architecture
export interface ThemeVariables {
  // Primary brand colors (monochrome with accent)
  primary: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string; // Main brand color
    600: string;
    700: string;
    800: string;
    900: string;
  };
  
  // Semantic colors
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // Neutral palette (monochrome base)
  neutral: {
    0: string;   // White
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string; // Gray base
    600: string;
    700: string;
    800: string;
    900: string; // Black
  };
  
  // Typography
  fontFamily: {
    sans: string[];
    mono: string[];
    display: string[];
  };
  
  // Spacing (8px base unit system)
  spacing: {
    0: string;
    1: string;  // 4px
    2: string;  // 8px
    3: string;  // 12px
    4: string;  // 16px
    5: string;  // 20px
    6: string;  // 24px
    8: string;  // 32px
    10: string; // 40px
    12: string; // 48px
    16: string; // 64px
    20: string; // 80px
  };
  
  // Border radius
  borderRadius: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
  
  // Shadows (subtle, professional)
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  
  // Transitions
  transitions: {
    fast: string;
    normal: string;
    slow: string;
  };
}

// Production theme configurations
export const productionThemes: Record<string, ThemeVariables> = {
  // Light theme - Clean, professional
  light: {
    primary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9', // Main blue
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
    },
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    neutral: {
      0: '#ffffff',
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      display: ['Inter Display', 'Inter', 'system-ui', 'sans-serif'],
    },
    spacing: {
      0: '0px',
      1: '0.25rem',  // 4px
      2: '0.5rem',   // 8px
      3: '0.75rem',  // 12px
      4: '1rem',     // 16px
      5: '1.25rem',  // 20px
      6: '1.5rem',   // 24px
      8: '2rem',     // 32px
      10: '2.5rem',  // 40px
      12: '3rem',    // 48px
      16: '4rem',    // 64px
      20: '5rem',    // 80px
    },
    borderRadius: {
      none: '0',
      sm: '0.125rem',  // 2px
      md: '0.375rem',  // 6px
      lg: '0.5rem',    // 8px
      xl: '0.75rem',   // 12px
      full: '9999px',
    },
    shadows: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    },
    transitions: {
      fast: '150ms ease-in-out',
      normal: '250ms ease-in-out',
      slow: '350ms ease-in-out',
    },
  },

  // Dark theme - Professional, easy on eyes
  dark: {
    primary: {
      50: '#0c4a6e',
      100: '#075985',
      200: '#0369a1',
      300: '#0284c7',
      400: '#0ea5e9',
      500: '#38bdf8', // Main blue
      600: '#7dd3fc',
      700: '#bae6fd',
      800: '#e0f2fe',
      900: '#f0f9ff',
    },
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    neutral: {
      0: '#ffffff',
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      display: ['Inter Display', 'Inter', 'system-ui', 'sans-serif'],
    },
    spacing: {
      0: '0px',
      1: '0.25rem',
      2: '0.5rem',
      3: '0.75rem',
      4: '1rem',
      5: '1.25rem',
      6: '1.5rem',
      8: '2rem',
      10: '2.5rem',
      12: '3rem',
      16: '4rem',
      20: '5rem',
    },
    borderRadius: {
      none: '0',
      sm: '0.125rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem',
      full: '9999px',
    },
    shadows: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.3)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.3), 0 2px 4px -2px rgb(0 0 0 / 0.3)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.3), 0 4px 6px -4px rgb(0 0 0 / 0.3)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.3), 0 8px 10px -6px rgb(0 0 0 / 0.3)',
    },
    transitions: {
      fast: '150ms ease-in-out',
      normal: '250ms ease-in-out',
      slow: '350ms ease-in-out',
    },
  },

  // Cosmic theme - Premium, elegant
  cosmic: {
    primary: {
      50: '#1e1b4b',
      100: '#312e81',
      200: '#4c1d95',
      300: '#6d28d9',
      400: '#7c3aed',
      500: '#8b5cf6', // Main purple
      600: '#a78bfa',
      700: '#c4b5fd',
      800: '#ddd6fe',
      900: '#ede9fe',
    },
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    neutral: {
      0: '#ffffff',
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      display: ['Inter Display', 'Inter', 'system-ui', 'sans-serif'],
    },
    spacing: {
      0: '0px',
      1: '0.25rem',
      2: '0.5rem',
      3: '0.75rem',
      4: '1rem',
      5: '1.25rem',
      6: '1.5rem',
      8: '2rem',
      10: '2.5rem',
      12: '3rem',
      16: '4rem',
      20: '5rem',
    },
    borderRadius: {
      none: '0',
      sm: '0.125rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem',
      full: '9999px',
    },
    shadows: {
      sm: '0 1px 2px 0 rgb(139 92 246 / 0.3)',
      md: '0 4px 6px -1px rgb(139 92 246 / 0.3), 0 2px 4px -2px rgb(139 92 246 / 0.3)',
      lg: '0 10px 15px -3px rgb(139 92 246 / 0.3), 0 4px 6px -4px rgb(139 92 246 / 0.3)',
      xl: '0 20px 25px -5px rgb(139 92 246 / 0.3), 0 8px 10px -6px rgb(139 92 246 / 0.3)',
    },
    transitions: {
      fast: '150ms ease-in-out',
      normal: '250ms ease-in-out',
      slow: '350ms ease-in-out',
    },
  },
};

// CSS custom properties generator
export function generateCSSVariables(theme: ThemeVariables, prefix = '--funfinity'): string {
  const variables: string[] = [];
  
  // Primary colors
  Object.entries(theme.primary).forEach(([key, value]) => {
    variables.push(`${prefix}-primary-${key}: ${value};`);
  });
  
  // Semantic colors
  variables.push(`${prefix}-success: ${theme.success};`);
  variables.push(`${prefix}-warning: ${theme.warning};`);
  variables.push(`${prefix}-error: ${theme.error};`);
  variables.push(`${prefix}-info: ${theme.info};`);
  
  // Neutral colors
  Object.entries(theme.neutral).forEach(([key, value]) => {
    variables.push(`${prefix}-neutral-${key}: ${value};`);
  });
  
  // Typography
  variables.push(`${prefix}-font-sans: ${theme.fontFamily.sans.join(', ')};`);
  variables.push(`${prefix}-font-mono: ${theme.fontFamily.mono.join(', ')};`);
  variables.push(`${prefix}-font-display: ${theme.fontFamily.display.join(', ')};`);
  
  // Spacing
  Object.entries(theme.spacing).forEach(([key, value]) => {
    variables.push(`${prefix}-spacing-${key}: ${value};`);
  });
  
  // Border radius
  Object.entries(theme.borderRadius).forEach(([key, value]) => {
    variables.push(`${prefix}-radius-${key}: ${value};`);
  });
  
  // Shadows
  Object.entries(theme.shadows).forEach(([key, value]) => {
    variables.push(`${prefix}-shadow-${key}: ${value};`);
  });
  
  // Transitions
  Object.entries(theme.transitions).forEach(([key, value]) => {
    variables.push(`${prefix}-transition-${key}: ${value};`);
  });
  
  return variables.join('\n  ');
}

// Theme utility functions
export function getThemeValue(theme: ThemeVariables, path: string): string {
  const keys = path.split('.');
  let value: any = theme;
  
  for (const key of keys) {
    value = value[key];
    if (value === undefined) {
      console.warn(`Theme path not found: ${path}`);
      return '';
    }
  }
  
  return value;
}

// Responsive breakpoints
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// Component-specific theme tokens
export const componentTokens = {
  // Button tokens
  button: {
    padding: {
      sm: '0.5rem 1rem',
      md: '0.75rem 1.5rem',
      lg: '1rem 2rem',
    },
    fontSize: {
      sm: '0.875rem',
      md: '1rem',
      lg: '1.125rem',
    },
    fontWeight: '500',
    transition: 'var(--funfinity-transition-fast)',
  },
  
  // Card tokens
  card: {
    padding: '1.5rem',
    borderRadius: 'var(--funfinity-radius-lg)',
    shadow: 'var(--funfinity-shadow-md)',
    background: 'var(--funfinity-neutral-0)',
    border: '1px solid var(--funfinity-neutral-200)',
  },
  
  // Input tokens
  input: {
    padding: '0.75rem 1rem',
    borderRadius: 'var(--funfinity-radius-md)',
    border: '1px solid var(--funfinity-neutral-300)',
    background: 'var(--funfinity-neutral-0)',
    fontSize: '1rem',
    transition: 'var(--funfinity-transition-fast)',
  },
  
  // Navigation tokens
  navigation: {
    height: '4rem',
    background: 'var(--funfinity-neutral-0)',
    border: '1px solid var(--funfinity-neutral-200)',
    shadow: 'var(--funfinity-shadow-sm)',
  },
};

// Export default theme
export const defaultTheme = productionThemes.light;
