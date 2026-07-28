import { useEffect, useRef, useCallback, useState } from 'react';
import { apiClient } from '@/lib/api-client';

interface SecurityEvent {
  type: 'inspect_trap' | 'sql_injection' | 'high_velocity_queries' | 'suspicious_activity' | 'multiple_admin_logins';
  timestamp: string;
  details: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
  userAgent?: string;
  ipAddress?: string;
  userId?: string;
}

interface SecurityAlert {
  id: string;
  type: 'inspect_trap' | 'sql_injection' | 'high_velocity_queries' | 'suspicious_activity' | 'multiple_admin_logins';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  acknowledged: boolean;
}

export function useSecurityMonitor() {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(true);

  const eventQueue = useRef<SecurityEvent[]>([]);
  const alertThresholds = {
    inspectTrap: 3, // 3 inspect trap triggers in 30 seconds
    sqlInjection: 2, // 2 SQL injection attempts
    highVelocityQueries: 5, // 5 high-velocity DB queries
    suspiciousActivity: 4, // 4 suspicious activities
    multipleAdminLogins: 2 // 2 multiple admin logins from different IPs
  };

  const detectInspectTrap = useCallback(() => {
    const keys = [];
    const mouseEvents = [];

    // Detect F12, Ctrl+Shift+I, Ctrl+S
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F12' || e.key === 'F11') {
        keys.push('F12');
      }
      if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i')) {
        keys.push('Ctrl+Shift+I');
      }
      if (e.ctrlKey && e.key === 's' || e.key === 'S') {
        keys.push('Ctrl+S');
      }
    };

    // Detect mouse events (right-click, double-click, etc.)
    const handleMouseEvent = (e: MouseEvent) => {
      if (e.type === 'contextmenu') {
        mouseEvents.push('contextmenu');
      }
      if (e.type === 'dblclick') {
        mouseEvents.push('double-click');
      }
      if (e.detail === 3) {
        mouseEvents.push('triple-click');
      }
    };

    // Detect DevTools opening
    const handleDevTools = async () => {
      const devtools = {
        open: (window as any).chrome?.devtools?.open || (window as any).devtools?.open,
        firebug: !(window as any).console?.firebug
      };

      if (devtools.open || devtools.firebug) {
        const event: SecurityEvent = {
          type: 'inspect_trap',
          timestamp: new Date().toISOString(),
          details: {
            keys: keys,
            mouseEvents: mouseEvents,
            devtools: devtools
          },
          severity: 'high',
          userAgent: navigator.userAgent,
          ipAddress: await getClientIP()
        };

        eventQueue.current.push(event);
        keys.length = 0;
        mouseEvents.length = 0;
      }
    };

    // Check for existing DevTools
    const devtools = setInterval(handleDevTools, 1000);

    // Add event listeners
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleMouseEvent);
    document.addEventListener('dblclick', handleMouseEvent);
    document.addEventListener('mousedown', handleMouseEvent);

    // Cleanup on unmount
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleMouseEvent);
      document.removeEventListener('dblclick', handleMouseEvent);
      document.removeEventListener('mousedown', handleMouseEvent);
      clearInterval(devtools);
    };
  }, []);

  // Process event queue
  useEffect(() => {
    if (eventQueue.current.length > 0) {
      const newEvents = eventQueue.current.splice(0);
      eventQueue.current = [];

      newEvents.forEach(event => {
        setEvents(prev => [...prev, event]);

        // Check if this exceeds thresholds
        const recentEvents = events.filter(e =>
          e.type === event.type &&
          new Date(e.timestamp).getTime() > new Date().getTime() - 30000
        );

        if (recentEvents.length >= alertThresholds.inspectTrap) {
          createSecurityAlert(event);
        }
      });
    }
  }, [events, alertThresholds]);

  // SQL Injection Detection
  const detectSQLInjection = useCallback(async (query: string) => {
    const suspiciousPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
      /(\b(OR|AND|NOT|XOR|LIKE|ILIKE|REGEXP)\b)/gi,
      /(\b(--|#|\/\*|;)\b)/gi,
      /(\b(UNION|SELECT)\b.*\b(FROM|WHERE)\b)/gi,
      /(\b(CASE|WHEN|THEN|ELSE|END)\b)/gi,
      /(\b(INFORMATION_SCHEMA|USER|SESSION|PRAGMA)\b)/gi,
      /(\b(SLEEP|BENCHMARK|LOAD_FILE|LOAD_DATA)\b)/gi
    ];

    let riskScore = 0;
    const detectedPatterns: string[] = [];

    suspiciousPatterns.forEach((pattern, index) => {
      if (pattern.test(query)) {
        riskScore += (index + 1) * 10;
        detectedPatterns.push(pattern.source);
      }
    });

    if (riskScore >= 30) {
      const event: SecurityEvent = {
        type: 'sql_injection',
        timestamp: new Date().toISOString(),
        details: {
          query: query.substring(0, 200), // First 200 chars
          riskScore,
          detectedPatterns
        },
        severity: riskScore >= 50 ? 'critical' : 'high',
        userAgent: navigator.userAgent,
        ipAddress: await getClientIP()
      };

      eventQueue.current.push(event);
      return true;
    }

    return false;
  }, []);

  // High-velocity Query Detection
  const detectHighVelocityQueries = useCallback(async () => {
    const queryCount = events.filter(e => e.type === 'high_velocity_queries').length;
    const timeWindow = 60000; // 1 minute in milliseconds

    if (queryCount >= alertThresholds.highVelocityQueries) {
      const event: SecurityEvent = {
        type: 'high_velocity_queries',
        timestamp: new Date().toISOString(),
        details: {
          queryCount,
          timeWindow: '1 minute',
          queriesPerSecond: (queryCount / timeWindow) * 1000
        },
        severity: 'high',
        userAgent: navigator.userAgent,
        ipAddress: await getClientIP()
      };

      eventQueue.current.push(event);
      return true;
    }

    return false;
  }, [events, alertThresholds]);

  // Create security alerts
  const createSecurityAlert = useCallback((event: SecurityEvent) => {
    const alert: SecurityAlert = {
      id: Date.now().toString(),
      type: event.type,
      title: getAlertTitle(event.type),
      message: getAlertMessage(event),
      severity: event.severity,
      timestamp: event.timestamp,
      acknowledged: false
    };

    setAlerts(prev => [alert, ...prev.slice(0, 99)]);

    // Log to database and send to admin
    logSecurityEvent(alert);
  }, []);

  const getAlertTitle = (type: string) => {
    switch (type) {
      case 'inspect_trap':
        return '🔍 Developer Tools Detected';
      case 'sql_injection':
        return '🛡 SQL Injection Attempt';
      case 'high_velocity_queries':
        return '⚡ High Velocity Database Queries';
      case 'suspicious_activity':
        return '🚨 Suspicious Activity Detected';
      case 'multiple_admin_logins':
        return '👥 Multiple Admin Login Attempts';
      default:
        return '🔒 Security Alert';
    }
  };

  const getAlertMessage = (event: SecurityEvent) => {
    switch (event.type) {
      case 'inspect_trap':
        return `Developer tools detected. Keys pressed: ${event.details?.keys?.join(', ') || 'Unknown'}. Mouse events: ${event.details?.mouseEvents?.join(', ') || 'None'}`;
      case 'sql_injection':
        return `SQL injection attempt detected. Risk score: ${event.details?.riskScore}. Suspicious patterns: ${event.details?.detectedPatterns?.join(', ')}`;
      case 'high_velocity_queries':
        return `High velocity database queries detected. ${event.details?.queryCount} queries in ${event.details?.timeWindow}. Rate: ${event.details?.queriesPerSecond}/sec`;
      case 'suspicious_activity':
        return 'Suspicious activity pattern detected. Review user behavior immediately.';
      case 'multiple_admin_logins':
        return 'Multiple admin login attempts detected from different IP addresses.';
      default:
        return 'Security violation detected. Immediate attention required.';
    }
  };

  const logSecurityEvent = async (alert: SecurityAlert) => {
    try {
      // Log to database via API
      await apiClient.post('/api/security/events', {
        event_type: alert.type,
        title: alert.title,
        message: alert.message,
        severity: alert.severity,
        user_agent: navigator.userAgent,
        ip_address: await getClientIP(),
        metadata: alert,
        created_at: new Date().toISOString()
      });

      // Send to admin API for immediate alerts
      if (alert.severity === 'critical' || alert.severity === 'high') {
        await sendAdminAlert(alert);
      }
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  };

  const sendAdminAlert = async (alert: SecurityAlert) => {
    try {
      // Call admin security API
      const response = await fetch('/api/admin/security-alert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(alert)
      });

      if (!response.ok) {
        console.error('Failed to send admin alert');
      }
    } catch (error) {
      console.error('Error sending admin alert:', error);
    }
  };

  // Monitor page visibility changes
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.hidden) {
        const clientIp = await getClientIP();
        const event: SecurityEvent = {
          type: 'suspicious_activity',
          timestamp: new Date().toISOString(),
          details: {
            action: 'page_hidden',
            reason: 'User switched to another tab or minimized browser'
          },
          severity: 'medium',
          userAgent: navigator.userAgent,
          ipAddress: clientIp
        };

        eventQueue.current.push(event);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Monitor clipboard access
  useEffect(() => {
    const handleClipboardEvent = async () => {
      try {
        const clipboardText = await navigator.clipboard.readText();
        const clientIp = await getClientIP();

        if (clipboardText && clipboardText.length > 1000) {
          const event: SecurityEvent = {
            type: 'suspicious_activity',
            timestamp: new Date().toISOString(),
            details: {
              action: 'large_clipboard_access',
              clipboardLength: clipboardText.length,
              preview: clipboardText.substring(0, 100)
            },
            severity: 'medium',
            userAgent: navigator.userAgent,
            ipAddress: clientIp
          };

          eventQueue.current.push(event);
        }
      } catch (err) {
        // Ignored clipboard error
      }
    };

    document.addEventListener('paste', handleClipboardEvent);
  }, []);

  const getClientIP = async (): Promise<string> => {
    try {
      // Try multiple methods to get client IP
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip || 'Unknown';
    } catch (error) {
      console.error('Failed to get client IP:', error);
      return 'Unknown';
    }
  };

  return {
    events,
    alerts,
    isMonitoring,
    detectSQLInjection,
    detectHighVelocityQueries,
    createSecurityAlert,
    acknowledgeAlert: (alertId: string) => {
      setAlerts(prev => prev.map(alert =>
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      ));
    }
  };
}
