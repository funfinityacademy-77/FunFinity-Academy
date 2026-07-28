import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  Cpu, 
  HardDrive, 
  Wifi, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  TrendingDown,
  Clock,
  Zap,
  Server,
  Database,
  MessageSquare
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api-client';

interface HealthMetric {
  type: 'cpu_usage' | 'memory_usage' | 'disk_usage' | 'active_connections' | 'bandwidth_usage' | 'response_time' | 'error_rate';
  value: number;
  unit: string;
  thresholdWarning: number;
  thresholdCritical: number;
  status: 'normal' | 'warning' | 'critical';
  recordedAt: string;
  metadata?: any;
}

interface LiveSession {
  id: string;
  title: string;
  instructorName: string;
  status: 'scheduled' | 'live' | 'ended' | 'cancelled';
  currentParticipants: number;
  maxParticipants: number;
  scheduledStart: string;
  actualStart?: string;
  duration?: number;
  recordingAvailable: boolean;
}

interface SystemStatus {
  uptime: string;
  version: string;
  nodeVersion: string;
  databaseConnections: number;
  webSocketConnections: number;
  lastRestart: string;
}

export function AdminPulse() {
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([]);
  const [liveSessions, setLiveSessions] = useState<LiveSession[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'1h' | '6h' | '24h' | '7d'>('1h');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch health metrics
  useEffect(() => {
    const fetchHealthMetrics = async () => {
      try {
        const data = await apiClient.get<HealthMetric[]>(`/api/admin/health-metrics?since=${getTimeRangeFilter(selectedTimeRange)}`);
        setHealthMetrics(data || []);
      } catch (error) {
        console.error('Health metrics fetch error:', error);
      }
    };

    const fetchLiveSessions = async () => {
      try {
        const data = await apiClient.get<LiveSession[]>('/api/admin/live-sessions');
        setLiveSessions(data || []);
      } catch (error) {
        console.error('Live sessions fetch error:', error);
      }
    };

    const fetchSystemStatus = async () => {
      try {
        // In a real implementation, this would fetch from system APIs
        // For now, we'll simulate system status
        const status: SystemStatus = {
          uptime: '15 days, 8 hours, 32 minutes',
          version: '1.0.0',
          nodeVersion: '18.17.0',
          databaseConnections: 45,
          webSocketConnections: 128,
          lastRestart: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        };

        setSystemStatus(status);
      } catch (error) {
        console.error('System status fetch error:', error);
      }
    };

    // Initial fetch
    const fetchData = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchHealthMetrics(),
        fetchLiveSessions(),
        fetchSystemStatus()
      ]);
      setIsLoading(false);
    };

    fetchData();

    // Set up auto-refresh
    if (autoRefresh) {
      intervalRef.current = setInterval(fetchData, 30000); // Refresh every 30 seconds
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [selectedTimeRange, autoRefresh]);

  // Real-time subscriptions
  useEffect(() => {
    // TODO: Replace with WebSocket to Durable Objects for realtime updates
    return () => { /* cleanup */ };
  }, [selectedTimeRange]);

  const getTimeRangeFilter = (range: string) => {
    const now = new Date();
    let filterDate: Date;

    switch (range) {
      case '1h':
        filterDate = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '6h':
        filterDate = new Date(now.getTime() - 6 * 60 * 60 * 1000);
        break;
      case '24h':
        filterDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        filterDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      default:
        filterDate = new Date(now.getTime() - 60 * 60 * 1000);
    }

    return filterDate.toISOString();
  };

  const getMetricIcon = (type: string) => {
    switch (type) {
      case 'cpu_usage':
        return <Cpu className="w-4 h-4" />;
      case 'memory_usage':
        return <Activity className="w-4 h-4" />;
      case 'disk_usage':
        return <HardDrive className="w-4 h-4" />;
      case 'active_connections':
        return <Users className="w-4 h-4" />;
      case 'bandwidth_usage':
        return <Wifi className="w-4 h-4" />;
      case 'response_time':
        return <Clock className="w-4 h-4" />;
      case 'error_rate':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getMetricColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'critical':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'normal':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'critical':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Activity className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatMetricValue = (value: number, unit: string) => {
    if (unit === '%') {
      return `${value.toFixed(1)}%`;
    } else if (unit === 'ms') {
      return `${value.toFixed(0)}ms`;
    } else if (unit === 'MB' || unit === 'GB') {
      return `${value.toFixed(1)}${unit}`;
    }
    return value.toString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Pulse</h1>
          <p className="text-gray-600">Real-time system monitoring and health metrics</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Time Range:</label>
            <select 
              value={selectedTimeRange} 
              onChange={(e) => setSelectedTimeRange(e.target.value as any)}
              className="px-3 py-2 border border rounded-md text-sm"
            >
              <option value="1h">Last Hour</option>
              <option value="6h">Last 6 Hours</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Auto Refresh:</label>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                autoRefresh 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {autoRefresh ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
      </div>

      {/* System Status */}
      {systemStatus && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="w-5 h-5" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-500">Uptime</div>
                <div className="text-lg font-semibold">{systemStatus.uptime}</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-500">Version</div>
                <div className="text-lg font-semibold">{systemStatus.version}</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-500">Node.js</div>
                <div className="text-lg font-semibold">{systemStatus.nodeVersion}</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-500">DB Connections</div>
                <div className="text-lg font-semibold">{systemStatus.databaseConnections}</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-500">WebSocket Connections</div>
                <div className="text-lg font-semibold">{systemStatus.webSocketConnections}</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-500">Last Restart</div>
                <div className="text-lg font-semibold">
                  {new Date(systemStatus.lastRestart).toLocaleDateString()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Health Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CPU & Memory */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="w-5 h-5" />
              System Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {healthMetrics
                .filter(m => m.type === 'cpu_usage' || m.type === 'memory_usage')
                .map((metric, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getMetricIcon(metric.type)}
                        <span className="font-medium">{metric.type.replace('_', ' ').toUpperCase()}</span>
                      </div>
                      <div className={`text-right font-semibold ${getMetricColor(metric.status)}`}>
                        {formatMetricValue(metric.value, metric.unit)}
                      </div>
                    </div>
                    <div className="w-full">
                      <Progress 
                        value={metric.value} 
                        max={100} 
                        className="h-2"
                      />
                    </div>
                    {metric.status !== 'normal' && (
                      <div className="flex items-center gap-2 mt-2">
                        {getStatusIcon(metric.status)}
                        <span className="text-sm text-gray-600">
                          {metric.status === 'warning' ? 'Above warning threshold' : 'Critical level'}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Network & Storage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wifi className="w-5 h-5" />
              Network & Storage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {healthMetrics
                .filter(m => m.type === 'bandwidth_usage' || m.type === 'disk_usage')
                .map((metric, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getMetricIcon(metric.type)}
                        <span className="font-medium">{metric.type.replace('_', ' ').toUpperCase()}</span>
                      </div>
                      <div className={`text-right font-semibold ${getMetricColor(metric.status)}`}>
                        {formatMetricValue(metric.value, metric.unit)}
                      </div>
                    </div>
                    <div className="w-full">
                      <Progress 
                        value={metric.value} 
                        max={metric.thresholdCritical || 100} 
                        className="h-2"
                      />
                    </div>
                    {metric.status !== 'normal' && (
                      <div className="flex items-center gap-2 mt-2">
                        {getStatusIcon(metric.status)}
                        <span className="text-sm text-gray-600">
                          {metric.status === 'warning' ? 'Above warning threshold' : 'Critical level'}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Connections & Response Time */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Active Connections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {healthMetrics
                .filter(m => m.type === 'active_connections' || m.type === 'response_time')
                .map((metric, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getMetricIcon(metric.type)}
                        <span className="font-medium">{metric.type.replace('_', ' ').toUpperCase()}</span>
                      </div>
                      <div className={`text-right font-semibold ${getMetricColor(metric.status)}`}>
                        {formatMetricValue(metric.value, metric.unit)}
                      </div>
                    </div>
                    {metric.type === 'active_connections' && (
                      <div className="flex items-center gap-2 mt-2">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-600">
                          {metric.value > 50 ? 'High traffic' : 'Normal activity'}
                        </span>
                      </div>
                    )}
                    {metric.type === 'response_time' && (
                      <div className="flex items-center gap-2 mt-2">
                        {metric.value < 200 ? (
                          <TrendingUp className="w-4 h-4 text-green-500" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-500" />
                        )}
                        <span className="text-sm text-gray-600">
                          {metric.value < 200 ? 'Good performance' : 'Slow response'}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Database Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {healthMetrics
                .filter(m => m.type === 'error_rate')
                .map((metric, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getMetricIcon(metric.type)}
                        <span className="font-medium">{metric.type.replace('_', ' ').toUpperCase()}</span>
                      </div>
                      <div className={`text-right font-semibold ${getMetricColor(metric.status)}`}>
                        {formatMetricValue(metric.value, metric.unit)}
                      </div>
                    </div>
                    <div className="w-full">
                      <Progress 
                        value={metric.value} 
                        max={10} 
                        className="h-2"
                      />
                    </div>
                    {metric.status !== 'normal' && (
                      <div className="flex items-center gap-2 mt-2">
                        {getStatusIcon(metric.status)}
                        <span className="text-sm text-gray-600">
                          {metric.value > 5 ? 'High error rate' : 'Elevated errors'}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Active Live Sessions
            <Badge variant="secondary" className="ml-2">
              {liveSessions.length} active
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {liveSessions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="w-8 h-8 mx-auto mb-4 text-gray-400" />
              <p>No active live sessions</p>
            </div>
          ) : (
            <div className="space-y-4">
              {liveSessions.map((session, index) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{session.title}</h3>
                      <p className="text-sm text-gray-600">
                        with {session.instructorName}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={
                          session.status === 'live' ? 'default' :
                          session.status === 'scheduled' ? 'secondary' : 'outline'
                        }
                        className="capitalize"
                      >
                        {session.status}
                      </Badge>
                      {session.recordingAvailable && (
                        <Badge variant="outline" className="ml-2">
                          <Database className="w-3 h-3 mr-1" />
                          Recording
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Participants:</span>
                      <span className="font-medium">
                        {session.currentParticipants}/{session.maxParticipants}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Duration:</span>
                      <span className="font-medium">
                        {session.duration ? `${Math.round(session.duration / 60)}m` : 'Not started'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Start:</span>
                      <span className="font-medium">
                        {new Date(session.scheduledStart).toLocaleTimeString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Course:</span>
                      <span className="font-medium">{session.course?.title || 'N/A'}</span>
                    </div>
                  </div>

                  {session.status === 'live' && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-green-600 font-medium">
                          🔴 Session is LIVE
                        </span>
                        <div className="flex gap-2">
                          <button className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700">
                            End Session
                          </button>
                          <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                            Manage
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
