// Strict Monochrome UI Components for FunFinity Academy
// Zero color - only black, white, and gray variations
// Professional, focus-first design system

import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';

// Monochrome color palette
export const monochromeColors = {
  // Primary colors
  white: '#FFFFFF',
  black: '#000000',
  
  // Gray scale (50 shades)
  gray50: '#FAFAFA',
  gray100: '#F5F5F5',
  gray200: '#EEEEEE',
  gray300: '#E0E0E0',
  gray400: '#BDBDBD',
  gray500: '#9E9E9E',
  gray600: '#757575',
  gray700: '#616161',
  gray800: '#424242',
  gray900: '#212121',
  
  // Semantic colors (still monochrome)
  success: '#2E7D32',      // Dark green
  warning: '#F57C00',      // Dark orange
  error: '#C62828',        // Dark red
  info: '#1565C0',         // Dark blue
};

// Monochrome theme context
interface MonochromeThemeContextType {
  colors: typeof monochromeColors;
  isDarkMode: boolean;
  toggleTheme: () => void;
  getTextColor: (variant?: 'primary' | 'secondary' | 'muted') => string;
  getBackgroundColor: (variant?: 'primary' | 'secondary' | 'surface') => string;
  getBorderColor: (variant?: 'light' | 'medium' | 'dark') => string;
}

const MonochromeThemeContext = createContext<MonochromeThemeContextType | null>(null);

// Monochrome Theme Provider
export function MonochromeThemeProvider({ children }: { children: ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const getTextColor = (variant: 'primary' | 'secondary' | 'muted' = 'primary') => {
    if (isDarkMode) {
      switch (variant) {
        case 'primary': return monochromeColors.white;
        case 'secondary': return monochromeColors.gray300;
        case 'muted': return monochromeColors.gray500;
        default: return monochromeColors.white;
      }
    } else {
      switch (variant) {
        case 'primary': return monochromeColors.black;
        case 'secondary': return monochromeColors.gray700;
        case 'muted': return monochromeColors.gray500;
        default: return monochromeColors.black;
      }
    }
  };

  const getBackgroundColor = (variant: 'primary' | 'secondary' | 'surface' = 'primary') => {
    if (isDarkMode) {
      switch (variant) {
        case 'primary': return monochromeColors.black;
        case 'secondary': return monochromeColors.gray900;
        case 'surface': return monochromeColors.gray800;
        default: return monochromeColors.black;
      }
    } else {
      switch (variant) {
        case 'primary': return monochromeColors.white;
        case 'secondary': return monochromeColors.gray50;
        case 'surface': return monochromeColors.gray100;
        default: return monochromeColors.white;
      }
    }
  };

  const getBorderColor = (variant: 'light' | 'medium' | 'dark' = 'medium') => {
    if (isDarkMode) {
      switch (variant) {
        case 'light': return monochromeColors.gray700;
        case 'medium': return monochromeColors.gray600;
        case 'dark': return monochromeColors.gray500;
        default: return monochromeColors.gray600;
      }
    } else {
      switch (variant) {
        case 'light': return monochromeColors.gray300;
        case 'medium': return monochromeColors.gray400;
        case 'dark': return monochromeColors.gray500;
        default: return monochromeColors.gray400;
      }
    }
  };

  const contextValue: MonochromeThemeContextType = {
    colors: monochromeColors,
    isDarkMode,
    toggleTheme,
    getTextColor,
    getBackgroundColor,
    getBorderColor,
  };

  return (
    <MonochromeThemeContext.Provider value={contextValue}>
      {children}
    </MonochromeThemeContext.Provider>
  );
}

// Hook to use monochrome theme
export function useMonochromeTheme() {
  const context = useContext(MonochromeThemeContext);
  if (!context) {
    throw new Error('useMonochromeTheme must be used within MonochromeThemeProvider');
  }
  return context;
}

// Monochrome Button Component
export function MonochromeButton({ 
  children, 
  variant = 'primary', 
  size = 'medium', 
  disabled = false, 
  onClick, 
  className 
}: { 
  children: ReactNode; 
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  const { getTextColor, getBackgroundColor, getBorderColor } = useMonochromeTheme();

  const getButtonStyles = () => {
    const baseStyles = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '1px solid',
      borderRadius: '4px',
      fontWeight: 500,
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'all 0.2s ease',
      textDecoration: 'none',
    };

    const sizeStyles = {
      small: { padding: '6px 12px', fontSize: '14px' },
      medium: { padding: '8px 16px', fontSize: '16px' },
      large: { padding: '12px 24px', fontSize: '18px' },
    };

    const variantStyles = {
      primary: {
        backgroundColor: getBackgroundColor('primary'),
        color: getTextColor('primary'),
        borderColor: getBorderColor('medium'),
      },
      secondary: {
        backgroundColor: getBackgroundColor('secondary'),
        color: getTextColor('primary'),
        borderColor: getBorderColor('light'),
      },
      outline: {
        backgroundColor: 'transparent',
        color: getTextColor('primary'),
        borderColor: getBorderColor('medium'),
      },
      ghost: {
        backgroundColor: 'transparent',
        color: getTextColor('secondary'),
        borderColor: 'transparent',
      },
    };

    const disabledStyles = disabled ? {
      opacity: 0.5,
      cursor: 'not-allowed',
    } : {};

    return {
      ...baseStyles,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...disabledStyles,
    };
  };

  return (
    <button
      style={getButtonStyles()}
      onClick={onClick}
      disabled={disabled}
      className={className}
    >
      {children}
    </button>
  );
}

// Monochrome Card Component
export function MonochromeCard({ 
  children, 
  variant = 'default', 
  padding = 'medium', 
  className 
}: { 
  children: ReactNode; 
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'small' | 'medium' | 'large';
  className?: string;
}) {
  const { getBackgroundColor, getBorderColor } = useMonochromeTheme();

  const getCardStyles = () => {
    const baseStyles = {
      borderRadius: '8px',
      overflow: 'hidden',
    };

    const paddingStyles = {
      small: { padding: '12px' },
      medium: { padding: '16px' },
      large: { padding: '24px' },
    };

    const variantStyles = {
      default: {
        backgroundColor: getBackgroundColor('primary'),
        border: `1px solid ${getBorderColor('light')}`,
      },
      elevated: {
        backgroundColor: getBackgroundColor('primary'),
        border: `1px solid ${getBorderColor('light')}`,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      },
      outlined: {
        backgroundColor: 'transparent',
        border: `1px solid ${getBorderColor('medium')}`,
      },
    };

    return {
      ...baseStyles,
      ...paddingStyles[padding],
      ...variantStyles[variant],
    };
  };

  return (
    <div style={getCardStyles()} className={className}>
      {children}
    </div>
  );
}

// Monochrome Input Component
export function MonochromeInput({ 
  label, 
  placeholder, 
  value, 
  onChange, 
  type = 'text', 
  disabled = false, 
  error,
  className 
}: { 
  label?: string; 
  placeholder?: string; 
  value?: string; 
  onChange?: (value: string) => void; 
  type?: string; 
  disabled?: boolean; 
  error?: string; 
  className?: string;
}) {
  const { getTextColor, getBackgroundColor, getBorderColor } = useMonochromeTheme();

  const getInputStyles = () => ({
    width: '100%',
    padding: '8px 12px',
    border: `1px solid ${error ? monochromeColors.error : getBorderColor('medium')}`,
    borderRadius: '4px',
    backgroundColor: getBackgroundColor('primary'),
    color: getTextColor('primary'),
    fontSize: '16px',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    cursor: disabled ? 'not-allowed' : 'text',
  });

  const getLabelStyles = () => ({
    display: 'block',
    marginBottom: '4px',
    fontSize: '14px',
    fontWeight: 500,
    color: getTextColor('secondary'),
  });

  const getErrorStyles = () => ({
    color: monochromeColors.error,
    fontSize: '12px',
    marginTop: '4px',
  });

  return (
    <div className={className}>
      {label && <label style={getLabelStyles()}>{label}</label>}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        style={getInputStyles()}
      />
      {error && <div style={getErrorStyles()}>{error}</div>}
    </div>
  );
}

// Monochrome Navigation Component
export function MonochromeNavigation({ 
  items, 
  activeItem, 
  onItemClick, 
  className 
}: { 
  items: Array<{ id: string; label: string; href?: string }>; 
  activeItem?: string; 
  onItemClick?: (item: any) => void; 
  className?: string;
}) {
  const { getTextColor, getBackgroundColor, getBorderColor } = useMonochromeTheme();

  const getNavStyles = () => ({
    display: 'flex',
    flexDirection: 'row' as const,
    gap: '1px',
    backgroundColor: getBorderColor('light'),
    borderRadius: '4px',
    overflow: 'hidden',
  });

  const getNavItemStyles = (isActive: boolean) => ({
    padding: '12px 16px',
    backgroundColor: isActive ? getBackgroundColor('secondary') : getBackgroundColor('primary'),
    color: getTextColor(isActive ? 'primary' : 'secondary'),
    border: 'none',
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
    fontWeight: isActive ? 600 : 400,
  });

  return (
    <nav style={getNavStyles()} className={className}>
      {items.map(item => (
        <a
          key={item.id}
          href={item.href}
          style={getNavItemStyles(item.id === activeItem)}
          onClick={() => onItemClick?.(item)}
        >
          {item.label}
        </a>
      ))}
    </nav>
  );
}

// Monochrome Progress Component
export function MonochromeProgress({ 
  value, 
  max = 100, 
  size = 'medium', 
  showLabel = true, 
  className 
}: { 
  value: number; 
  max?: number; 
  size?: 'small' | 'medium' | 'large'; 
  showLabel?: boolean; 
  className?: string;
}) {
  const { getTextColor, getBackgroundColor, getBorderColor } = useMonochromeTheme();
  const percentage = Math.min((value / max) * 100, 100);

  const getProgressStyles = () => {
    const baseStyles = {
      width: '100%',
      backgroundColor: getBackgroundColor('secondary'),
      borderRadius: '2px',
      overflow: 'hidden',
    };

    const sizeStyles = {
      small: { height: '4px' },
      medium: { height: '8px' },
      large: { height: '12px' },
    };

    return {
      ...baseStyles,
      ...sizeStyles[size],
    };
  };

  const getProgressBarStyles = () => ({
    height: '100%',
    backgroundColor: getTextColor('primary'),
    transition: 'width 0.3s ease',
  });

  const getLabelStyles = () => ({
    marginTop: '4px',
    fontSize: '12px',
    color: getTextColor('muted'),
    textAlign: 'right' as const,
  });

  return (
    <div className={className}>
      <div style={getProgressStyles()}>
        <div style={{ ...getProgressBarStyles(), width: `${percentage}%` }} />
      </div>
      {showLabel && (
        <div style={getLabelStyles()}>
          {Math.round(percentage)}%
        </div>
      )}
    </div>
  );
}

// Monochrome Alert Component
export function MonochromeAlert({ 
  children, 
  variant = 'info', 
  dismissible = false, 
  onDismiss, 
  className 
}: { 
  children: ReactNode; 
  variant?: 'info' | 'success' | 'warning' | 'error'; 
  dismissible?: boolean; 
  onDismiss?: () => void; 
  className?: string;
}) {
  const { getTextColor, getBackgroundColor } = useMonochromeTheme();

  const getAlertStyles = () => {
    const baseStyles = {
      padding: '12px 16px',
      borderRadius: '4px',
      border: '1px solid',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    };

    const variantStyles = {
      info: {
        backgroundColor: '#E3F2FD',
        borderColor: monochromeColors.info,
        color: monochromeColors.info,
      },
      success: {
        backgroundColor: '#E8F5E8',
        borderColor: monochromeColors.success,
        color: monochromeColors.success,
      },
      warning: {
        backgroundColor: '#FFF3E0',
        borderColor: monochromeColors.warning,
        color: monochromeColors.warning,
      },
      error: {
        backgroundColor: '#FFEBEE',
        borderColor: monochromeColors.error,
        color: monochromeColors.error,
      },
    };

    return {
      ...baseStyles,
      ...variantStyles[variant],
    };
  };

  return (
    <div style={getAlertStyles()} className={className}>
      {children}
      {dismissible && (
        <button
          onClick={onDismiss}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '16px',
            cursor: 'pointer',
            padding: '0',
            marginLeft: 'auto',
          }}
        >
          ×
        </button>
      )}
    </div>
  );
}

// Monochrome Loading Component
export function MonochromeLoading({ 
  size = 'medium', 
  text, 
  className 
}: { 
  size?: 'small' | 'medium' | 'large'; 
  text?: string; 
  className?: string;
}) {
  const { getTextColor } = useMonochromeTheme();

  const getContainerStyles = () => ({
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '8px',
  });

  const getSpinnerStyles = () => {
    const sizeStyles = {
      small: { width: '16px', height: '16px' },
      medium: { width: '24px', height: '24px' },
      large: { width: '32px', height: '32px' },
    };

    return {
      ...sizeStyles[size],
      border: `2px solid ${getBorderColor('light')}`,
      borderTop: `2px solid ${getTextColor('primary')}`,
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
    };
  };

  const getTextStyles = () => ({
    color: getTextColor('muted'),
    fontSize: '14px',
  });

  return (
    <div style={getContainerStyles()} className={className}>
      <div style={getSpinnerStyles()} />
      {text && <div style={getTextStyles()}>{text}</div>}
    </div>
  );
}

// Add CSS animation for spinner
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}

// Export all monochrome components
export {
  MonochromeThemeContext,
  type MonochromeThemeContextType,
};
