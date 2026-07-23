// Server-Sent Events for Live Stats
// This would typically be implemented on backend, but here's the client-side setup
import { useState, useEffect, useRef } from 'react';

export class LiveStatsSSE {
  private eventSource: EventSource | null = null;
  private listeners: Map<string, ((data: any) => void)> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  constructor(private url: string) { }

  connect() {
    try {
      this.eventSource = new EventSource(this.url);

      this.eventSource.onopen = () => {
        console.log('SSE Connection opened');
        this.reconnectAttempts = 0;
      };

      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.notifyListeners('message', data);
        } catch (error) {
          console.error('Error parsing SSE message:', error);
        }
      };

      this.eventSource.onerror = (error) => {
        console.error('SSE Connection error:', error);
        this.handleReconnect();
      };

      // Listen for specific event types
      this.eventSource.addEventListener('student-joined', (event) => {
        const data = JSON.parse((event as MessageEvent).data);
        this.notifyListeners('student-joined', data);
      });

      this.eventSource.addEventListener('course-published', (event) => {
        const data = JSON.parse((event as MessageEvent).data);
        this.notifyListeners('course-published', data);
      });

      this.eventSource.addEventListener('rating-submitted', (event) => {
        const data = JSON.parse((event as MessageEvent).data);
        this.notifyListeners('rating-submitted', data);
      });

    } catch (error) {
      console.error('Error creating SSE connection:', error);
      this.handleReconnect();
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

      setTimeout(() => {
        this.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  addEventListener(event: string, callback: (data: any) => void) {
    this.listeners.set(event, callback);
  }

  removeEventListener(event: string) {
    this.listeners.delete(event);
  }

  private notifyListeners(event: string, data: any) {
    const callback = this.listeners.get(event);
    if (callback) {
      callback(data);
    }
  }

  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.listeners.clear();
  }
}

// Client-side hook for using SSE
export function useLiveStatsSSE() {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<any>(null);
  const sseRef = useRef<LiveStatsSSE | null>(null);

  useEffect(() => {
    // In a real implementation, this would be your actual SSE endpoint
    const sseUrl = '/api/live-stats';

    sseRef.current = new LiveStatsSSE(sseUrl);

    sseRef.current.addEventListener('student-joined', (data) => {
      setLastUpdate({ type: 'student-joined', data, timestamp: Date.now() });
    });

    sseRef.current.addEventListener('course-published', (data) => {
      setLastUpdate({ type: 'course-published', data, timestamp: Date.now() });
    });

    sseRef.current.addEventListener('rating-submitted', (data) => {
      setLastUpdate({ type: 'rating-submitted', data, timestamp: Date.now() });
    });

    sseRef.current.addEventListener('message', (data) => {
      setIsConnected(true);
    });

    // For demo purposes, we'll simulate the connection
    // In production, you would call: sseRef.current.connect();
    setIsConnected(true);

    return () => {
      if (sseRef.current) {
        sseRef.current.disconnect();
      }
    };
  }, []);

  return { isConnected, lastUpdate };
}
