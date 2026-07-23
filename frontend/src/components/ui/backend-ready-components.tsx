// Backend-Ready Components for FunFinity Academy
// Clean, monochrome, and modular components
// Connected to actual API endpoints via API client

import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';

// Backend context for API integration
interface BackendContextType {
  isLoading: boolean;
  error: string | null;
  apiCall: (endpoint: string, options?: RequestInit) => Promise<any>;
}

const BackendContext = createContext<BackendContextType | null>(null);

// Backend Provider
export function BackendProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiCall = async (endpoint: string, options?: RequestInit) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Actual API call
      const response = await fetch(endpoint, options);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'API call failed');
      }
      
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const contextValue: BackendContextType = {
    isLoading,
    error,
    apiCall,
  };

  return (
    <BackendContext.Provider value={contextValue}>
      {children}
    </BackendContext.Provider>
  );
}

// Hook to use backend
export function useBackend() {
  const context = useContext(BackendContext);
  if (!context) {
    throw new Error('useBackend must be used within BackendProvider');
  }
  return context;
}

// Dynamic Text Component (Backend-Ready)
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
  const [text, setText] = useState(fallback || '');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        // Actual config fetch from API
        const data = await apiClient.get<any | null>(`/api/config/${configKey}`);
        setText(data?.value || fallback || '');
      } catch (err) {
        console.error('Failed to load config:', err);
        setText(fallback || '');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadConfig();
  }, [configKey, fallback]);

  if (isLoading) {
    const Tag = tag as keyof JSX.IntrinsicElements;
    return <Tag className={className}>Loading...</Tag>;
  }

  const Tag = tag as keyof JSX.IntrinsicElements;
  return <Tag className={className}>{text}</Tag>;
}

// Dynamic Button Component (Backend-Ready)
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
  const [text, setText] = useState(fallback || 'Button');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        // Actual config fetch from API
        const data = await apiClient.get<any | null>(`/api/config/${configKey}`);
        setText(data?.value || fallback || 'Button');
      } catch (error) {
        console.error('Error loading button config:', error);
        setText(fallback || 'Button');
      } finally {
        setIsLoading(false);
      }
    };

    loadConfig();
  }, [configKey, fallback]);

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

// Student Progress Component (Backend-Ready)
export function StudentProgress({ 
  userId, 
  courseId,
  className 
}: { 
  userId: string; 
  courseId?: string;
  className?: string;
}) {
  const [progress, setProgress] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProgress = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Actual progress fetch from API
        const data = await apiClient.get<any[]>(`/api/users/${userId}/enrollments?course_id=${courseId || ''}`);
        setProgress(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load progress');
      } finally {
        setIsLoading(false);
      }
    };

    loadProgress();
  }, [userId, courseId]);

  if (isLoading) {
    return (
      <div className={className}>
        <p>Loading progress...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <h3>Student Progress</h3>
      {progress.length === 0 ? (
        <p>No progress data available</p>
      ) : (
        <ul>
          {progress.map(item => (
            <li key={item.id}>
              {item.lesson_id}: {item.status} ({item.progress_percentage}%)
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Chat Component (Backend-Ready)
export function Chat({ 
  userId, 
  roomId,
  className 
}: { 
  userId: string; 
  roomId?: string;
  className?: string;
}) {
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMessages = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Actual chat messages fetch from API
        const data = await apiClient.get<any[]>(`/api/chat/rooms/${roomId || ''}/messages`);
        setMessages(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load messages');
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
  }, [userId, roomId]);

  if (isLoading) {
    return (
      <div className={className}>
        <p>Loading chat...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <h3>Chat</h3>
      {messages.length === 0 ? (
        <p>No messages yet</p>
      ) : (
        <ul>
          {messages.map(message => (
            <li key={message.id}>
              <strong>User {message.user_id}:</strong> {message.message_content.text}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Calendar Component (Backend-Ready)
export function Calendar({ 
  userId, 
  startDate,
  endDate,
  className 
}: { 
  userId: string; 
  startDate?: string;
  endDate?: string;
  className?: string;
}) {
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Actual calendar events fetch from API
        const data = await apiClient.get<any[]>(`/api/users/${userId}/calendar-events?start=${startDate || ''}&end=${endDate || ''}`);
        setEvents(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load calendar');
      } finally {
        setIsLoading(false);
      }
    };

    loadEvents();
  }, [userId, startDate, endDate]);

  if (isLoading) {
    return (
      <div className={className}>
        <p>Loading calendar...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <h3>Calendar</h3>
      {events.length === 0 ? (
        <p>No upcoming events</p>
      ) : (
        <ul>
          {events.map(event => (
            <li key={event.id}>
              <strong>{event.title}</strong> ({event.event_type}) - {new Date(event.start_time).toLocaleDateString()}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Monochrome Card Component (Backend-Ready)
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
  const getCardStyles = () => {
    const baseStyles = {
      borderRadius: '8px',
      overflow: 'hidden',
      backgroundColor: '#ffffff',
      border: '1px solid #e0e0e0',
      padding: '16px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    };

    const paddingStyles = {
      small: { padding: '12px' },
      medium: { padding: '16px' },
      large: { padding: '24px' },
    };

    const variantStyles = {
      default: baseStyles,
      elevated: {
        ...baseStyles,
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      },
      outlined: {
        ...baseStyles,
        border: '2px solid #424242',
        backgroundColor: 'transparent',
      },
    };

    return {
      ...variantStyles[variant],
      ...paddingStyles[padding],
    };
  };

  return (
    <div style={getCardStyles()} className={className}>
      {children}
    </div>
  );
}

// Monochrome Button Component (Backend-Ready)
export function MonochromeButton({ 
  children, 
  variant = 'primary', 
  size = 'medium', 
  disabled = false, 
  onClick, 
  className 
}: { 
  children: ReactNode; 
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}) {
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
        backgroundColor: '#424242',
        color: '#ffffff',
        borderColor: '#424242',
      },
      secondary: {
        backgroundColor: '#f5f5f5',
        color: '#424242',
        borderColor: '#e0e0e0',
      },
      outline: {
        backgroundColor: 'transparent',
        color: '#424242',
        borderColor: '#424242',
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

// Export all backend-ready components
export {
  BackendContext,
  type BackendContextType,
};
