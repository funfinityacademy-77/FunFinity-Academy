// Production-ready logging system
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  userId?: string;
  sessionId?: string;
  requestId?: string;
}

class ProductionLogger {
  public isProduction: boolean;
  private logBuffer: LogEntry[] = [];
  private maxBufferSize = 1000;
  private flushInterval = 5000; // 5 seconds

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    this.startBatchFlush();
  }

  private createLogEntry(level: LogLevel, message: string, context?: Record<string, any>): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      userId: this.getCurrentUserId(),
      sessionId: this.getSessionId(),
      requestId: this.getRequestId()
    };
  }

  private getCurrentUserId(): string | undefined {
    // Get from context or auth state
    return (global as any).currentUser?.id;
  }

  private getSessionId(): string | undefined {
    return (global as any).sessionId;
  }

  private getRequestId(): string | undefined {
    return (global as any).requestId;
  }

  private shouldLog(level: LogLevel): boolean {
    if (this.isProduction) {
      return level >= LogLevel.WARN; // Only log warnings and errors in production
    }
    return true; // Log everything in development
  }

  private addToBuffer(entry: LogEntry): void {
    this.logBuffer.push(entry);

    if (this.logBuffer.length >= this.maxBufferSize) {
      this.flushLogs();
    }
  }

  private async flushLogs(): Promise<void> {
    if (this.logBuffer.length === 0) return;

    const logsToFlush = [...this.logBuffer];
    this.logBuffer = [];

    if (this.isProduction) {
      try {
        // Send to logging service (e.g., Datadog, LogRocket, etc.)
        await this.sendToLoggingService(logsToFlush);
      } catch (error) {
        // Fallback to console if logging service fails
        console.error('Unable to send diagnostic information. This won\'t affect your experience.');
        logsToFlush.forEach(log => {
          console.log(JSON.stringify(log));
        });
      }
    } else {
      // Development: log to console with formatting
      logsToFlush.forEach(log => {
        const levelName = LogLevel[log.level];
        const prefix = `[${log.timestamp}] ${levelName}:`;

        switch (log.level) {
          case LogLevel.DEBUG:
            console.debug(prefix, log.message, log.context || '');
            break;
          case LogLevel.INFO:
            console.info(prefix, log.message, log.context || '');
            break;
          case LogLevel.WARN:
            console.warn(prefix, log.message, log.context || '');
            break;
          case LogLevel.ERROR:
          case LogLevel.FATAL:
            console.error(prefix, log.message, log.context || '');
            break;
        }
      });
    }
  }

  private async sendToLoggingService(logs: LogEntry[]): Promise<void> {
    // Implement your logging service integration here
    // Example: Datadog, LogRocket, Sentry, etc.
    const response = await fetch('/api/logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ logs }),
    });

    if (!response.ok) {
      throw new Error('Diagnostic service temporarily unavailable. Your experience is not affected.');
    }
  }

  private startBatchFlush(): void {
    setInterval(() => {
      this.flushLogs();
    }, this.flushInterval);
  }

  // Public logging methods
  debug(message: string, context?: Record<string, any>): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;
    this.addToBuffer(this.createLogEntry(LogLevel.DEBUG, message, context));
  }

  info(message: string, context?: Record<string, any>): void {
    if (!this.shouldLog(LogLevel.INFO)) return;
    this.addToBuffer(this.createLogEntry(LogLevel.INFO, message, context));
  }

  warn(message: string, context?: Record<string, any>): void {
    if (!this.shouldLog(LogLevel.WARN)) return;
    this.addToBuffer(this.createLogEntry(LogLevel.WARN, message, context));
  }

  error(message: string, context?: Record<string, any>): void {
    if (!this.shouldLog(LogLevel.ERROR)) return;
    this.addToBuffer(this.createLogEntry(LogLevel.ERROR, message, context));
  }

  fatal(message: string, context?: Record<string, any>): void {
    if (!this.shouldLog(LogLevel.FATAL)) return;
    this.addToBuffer(this.createLogEntry(LogLevel.FATAL, message, context));
  }

  // Specialized logging methods for common operations
  userAction(action: string, context?: Record<string, any>): void {
    this.info(`User action: ${action}`, { ...context, type: 'user_action' });
  }

  apiCall(endpoint: string, method: string, duration?: number, status?: number): void {
    this.info(`API call: ${method} ${endpoint}`, {
      endpoint,
      method,
      duration,
      status,
      type: 'api_call'
    });
  }

  performance(metric: string, value: number, unit: string = 'ms'): void {
    this.info(`Performance: ${metric}`, {
      metric,
      value,
      unit,
      type: 'performance'
    });
  }

  security(event: string, context?: Record<string, any>): void {
    this.warn(`Security event: ${event}`, { ...context, type: 'security' });
  }

  business(event: string, context?: Record<string, any>): void {
    this.info(`Business event: ${event}`, { ...context, type: 'business' });
  }

  // Force flush logs (useful for critical operations)
  async flush(): Promise<void> {
    await this.flushLogs();
  }

  // Get log statistics
  getStats(): { total: number; byLevel: Record<string, number> } {
    const byLevel: Record<string, number> = {};

    Object.values(LogLevel).forEach(level => {
      if (typeof level === 'number') {
        byLevel[LogLevel[level]] = 0;
      }
    });

    this.logBuffer.forEach(log => {
      const levelName = LogLevel[log.level];
      byLevel[levelName] = (byLevel[levelName] || 0) + 1;
    });

    return {
      total: this.logBuffer.length,
      byLevel
    };
  }
}

// Global logger instance
export const logger = new ProductionLogger();

// Development helper for backward compatibility
export const devLog = {
  log: (message: string, ...args: any[]) => {
    if (!logger.isProduction) {
      console.log(message, ...args);
    }
  },
  warn: (message: string, ...args: any[]) => {
    if (!logger.isProduction) {
      console.warn(message, ...args);
    }
  },
  error: (message: string, ...args: any[]) => {
    if (!logger.isProduction) {
      console.error(message, ...args);
    }
  }
};
