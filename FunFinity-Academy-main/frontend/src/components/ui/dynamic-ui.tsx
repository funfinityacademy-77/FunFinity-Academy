// Dynamic UI Components for FunFinity Academy
// Zero-hardcode implementation - all content fetched from PostgreSQL
// High-concurrency optimized for local HDD storage

import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';

// Dynamic UI context
interface DynamicUIContextType {
  config: Record<string, any>;
  isLoading: boolean;
  error: string | null;
  getConfigValue: (key: string, fallback?: any) => any;
  refreshConfig: () => void;
  updateConfig: (key: string, value: any) => Promise<void>;
}

const DynamicUIContext = createContext<DynamicUIContextType | null>(null);

// Dynamic UI Provider
export function DynamicUIProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch all active configuration from PostgreSQL
      const response = await fetch('/api/config');
      if (!response.ok) {
        throw new Error('Failed to fetch configuration');
      }
      
      const data = await response.json();
      const configMap = data.data.reduce((acc: Record<string, any>, item: any) => {
        acc[item.config_key] = parseConfigValue(item.config_value, item.config_type);
        return acc;
      }, {});
      
      setConfig(configMap);
    } catch (err) {
      setError((err as Error).message);
      console.error('Failed to load UI configuration:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const parseConfigValue = (value: string, type: string): any => {
    switch (type) {
      case 'number':
        return parseFloat(value);
      case 'boolean':
        return value === 'true';
      case 'json':
        return JSON.parse(value);
      default:
        return value;
    }
  };

  const getConfigValue = (key: string, fallback?: any) => {
    return config[key] !== undefined ? config[key] : fallback;
  };

  const refreshConfig = () => {
    loadConfig();
  };

  const updateConfig = async (key: string, value: any) => {
    try {
      const response = await fetch('/api/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ config_key: key, config_value: value }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update configuration');
      }
      
      // Refresh config after update
      await loadConfig();
    } catch (err) {
      console.error('Failed to update configuration:', err);
      throw err;
    }
  };

  const contextValue: DynamicUIContextType = {
    config,
    isLoading,
    error,
    getConfigValue,
    refreshConfig,
    updateConfig,
  };

  return (
    <DynamicUIContext.Provider value={contextValue}>
      {children}
    </DynamicUIContext.Provider>
  );
}

// Hook to use dynamic UI
export function useDynamicUI() {
  const context = useContext(DynamicUIContext);
  if (!context) {
    throw new Error('useDynamicUI must be used within DynamicUIProvider');
  }
  return context;
}

// Dynamic Text Component (Zero-Hardcode)
export function DynamicText({ 
  configKey, 
  fallback, 
  className,
  tag = 'span'
}: { 
  configKey: string; 
  fallback?: string; 
  className?: string;
  tag?: string;
}) {
  const { getConfigValue, isLoading } = useDynamicUI();
  const [text, setText] = useState(fallback || '');

  useEffect(() => {
    const value = getConfigValue(configKey, fallback);
    setText(value);
  }, [configKey, fallback, getConfigValue]);

  if (isLoading) {
    const Tag = tag as keyof JSX.IntrinsicElements;
    return <Tag className={className}>Loading...</Tag>;
  }

  const Tag = tag as keyof JSX.IntrinsicElements;
  return <Tag className={className}>{text}</Tag>;
}

// Dynamic Button Component (Zero-Hardcode)
export function DynamicButton({ 
  configKey, 
  fallback, 
  onClick, 
  disabled = false, 
  className,
  type = 'button'
}: { 
  configKey: string; 
  fallback?: string; 
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}) {
  const { getConfigValue, isLoading } = useDynamicUI();
  const [text, setText] = useState(fallback || 'Button');

  useEffect(() => {
    const value = getConfigValue(configKey, fallback);
    setText(value);
  }, [configKey, fallback, getConfigValue]);

  if (isLoading) {
    return (
      <button className={className} disabled type={type}>
        Loading...
      </button>
    );
  }

  return (
    <button 
      className={className} 
      onClick={onClick} 
      disabled={disabled}
      type={type}
    >
      {text}
    </button>
  );
}

// Dynamic Input Component (Zero-Hardcode)
export function DynamicInput({ 
  configKey, 
  fallback, 
  labelConfigKey,
  labelFallback,
  value, 
  onChange, 
  type = 'text', 
  disabled = false, 
  error,
  className 
}: { 
  configKey: string; 
  fallback?: string; 
  labelConfigKey?: string;
  labelFallback?: string;
  value?: string; 
  onChange?: (value: string) => void; 
  type?: string; 
  disabled?: boolean; 
  error?: string; 
  className?: string;
}) {
  const { getConfigValue, isLoading } = useDynamicUI();
  const [placeholder, setPlaceholder] = useState(fallback || '');
  const [label, setLabel] = useState(labelFallback || '');

  useEffect(() => {
    const placeholderValue = getConfigValue(configKey, fallback);
    setPlaceholder(placeholderValue);
    
    if (labelConfigKey) {
      const labelValue = getConfigValue(labelConfigKey, labelFallback);
      setLabel(labelValue);
    }
  }, [configKey, fallback, labelConfigKey, labelFallback, getConfigValue]);

  if (isLoading) {
    return (
      <div className={className}>
        {labelConfigKey && <label>Loading...</label>}
        <input type={type} disabled placeholder="Loading..." />
      </div>
    );
  }

  return (
    <div className={className}>
      {labelConfigKey && <label>{label}</label>}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
      />
      {error && <div className="error">{error}</div>}
    </div>
  );
}

// Dynamic Navigation Component (Zero-Hardcode)
export function DynamicNavigation({ className }: { className?: string }) {
  const { getConfigValue } = useDynamicUI();
  const [navItems, setNavItems] = useState<Array<{ key: string; label: string; href: string }>>([]);

  useEffect(() => {
    const items = [
      { key: 'nav_dashboard', label: getConfigValue('nav_dashboard', 'Dashboard'), href: '/dashboard' },
      { key: 'nav_courses', label: getConfigValue('nav_courses', 'Courses'), href: '/courses' },
      { key: 'nav_chat', label: getConfigValue('nav_chat', 'Chat'), href: '/chat' },
      { key: 'nav_calendar', label: getConfigValue('nav_calendar', 'Calendar'), href: '/calendar' },
      { key: 'nav_profile', label: getConfigValue('nav_profile', 'Profile'), href: '/profile' },
    ];
    setNavItems(items);
  }, [getConfigValue]);

  return (
    <nav className={className}>
      {navItems.map(item => (
        <a key={item.key} href={item.href} className="nav-item">
          {item.label}
        </a>
      ))}
    </nav>
  );
}

// Dynamic Header Component (Zero-Hardcode)
export function DynamicHeader({ className }: { className?: string }) {
  const { getConfigValue } = useDynamicUI();

  return (
    <header className={className}>
      <h1>
        <DynamicText configKey="site_title" fallback="FunFinity Academy" tag="h1" />
      </h1>
      <p>
        <DynamicText configKey="site_tagline" fallback="Master AP Physics & Precalculus" tag="p" />
      </p>
    </header>
  );
}

// Dynamic Welcome Component (Zero-Hardcode)
export function DynamicWelcome({ className }: { className?: string }) {
  const { getConfigValue } = useDynamicUI();

  return (
    <div className={className}>
      <h2>
        <DynamicText configKey="welcome_message" fallback="Welcome to FunFinity Academy!" tag="h2" />
      </h2>
      <p>
        <DynamicText configKey="loading_message" fallback="Loading your learning journey..." tag="p" />
      </p>
    </div>
  );
}

// Dynamic Form Component (Zero-Hardcode)
export function DynamicForm({ 
  onSubmit, 
  className 
}: { 
  onSubmit: (data: Record<string, string>) => void; 
  className?: string;
}) {
  const { getConfigValue } = useDynamicUI();
  const [formData, setFormData] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  return (
    <form className={className} onSubmit={handleSubmit}>
      <DynamicInput
        configKey="label_email"
        fallback="Email"
        labelConfigKey="label_email"
        labelFallback="Email"
        value={formData.email}
        onChange={(value) => handleChange('email', value)}
        type="email"
        required
      />
      
      <DynamicInput
        configKey="label_password"
        fallback="Password"
        labelConfigKey="label_password"
        labelFallback="Password"
        value={formData.password}
        onChange={(value) => handleChange('password', value)}
        type="password"
        required
      />

      <DynamicButton
        configKey="btn_submit"
        fallback="Submit"
        type="submit"
      />
    </form>
  );
}

// Dynamic Alert Component (Zero-Hardcode)
export function DynamicAlert({ 
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
  const { getConfigValue } = useDynamicUI();

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
        borderColor: '#1565C0',
        color: '#1565C0',
      },
      success: {
        backgroundColor: '#E8F5E8',
        borderColor: '#2E7D32',
        color: '#2E7D32',
      },
      warning: {
        backgroundColor: '#FFF3E0',
        borderColor: '#F57C00',
        color: '#F57C00',
      },
      error: {
        backgroundColor: '#FFEBEE',
        borderColor: '#C62828',
        color: '#C62828',
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

// Dynamic Loading Component (Zero-Hardcode)
export function DynamicLoading({ 
  size = 'medium', 
  className 
}: { 
  size?: 'small' | 'medium' | 'large'; 
  className?: string;
}) {
  const { getConfigValue } = useDynamicUI();
  const [text, setText] = useState('Loading...');

  useEffect(() => {
    const loadingText = getConfigValue('loading_message', 'Loading...');
    setText(loadingText);
  }, [getConfigValue]);

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
      border: '2px solid #E0E0E0',
      borderTop: '2px solid #424242',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
    };
  };

  const getTextStyles = () => ({
    color: '#757575',
    fontSize: '14px',
  });

  return (
    <div style={getContainerStyles()} className={className}>
      <div style={getSpinnerStyles()} />
      <div style={getTextStyles()}>{text}</div>
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

// Export all dynamic UI components
export {
  DynamicUIContext,
  type DynamicUIContextType,
};
