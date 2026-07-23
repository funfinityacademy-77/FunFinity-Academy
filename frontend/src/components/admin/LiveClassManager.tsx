import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Video, 
  VideoOff, 
  Users, 
  Calendar, 
  Clock, 
  Settings, 
  Play, 
  Square, 
  AlertCircle, 
  CheckCircle, 
  MoreHorizontal,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Mic,
  MicOff,
  Monitor,
  Server,
  Mail,
  Bell,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiClient } from '@/lib/api-client';

interface LiveSession {
  id: string;
  title: string;
  description?: string;
  instructor_id: string;
  instructor_name: string;
  course_id: string;
  course_title: string;
  status: 'scheduled' | 'live' | 'ended' | 'cancelled';
  scheduled_start: string;
  scheduled_end: string;
  actual_start?: string;
  actual_end?: string;
  max_participants: number;
  current_participants: number;
  recording_url?: string;
  stream_url?: string;
  chat_enabled: boolean;
  screen_share_enabled: boolean;
  settings: any;
  created_at: string;
  updated_at: string;
}

interface LiveSessionParticipant {
  id: string;
  session_id: string;
  student_id: string;
  student_name: string;
  student_email: string;
  enrolled_at: string;
  joined_at?: string;
  left_at?: string;
  is_active: boolean;
  permissions: any;
}

export function LiveClassManager() {
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<LiveSession | null>(null);
  const [participants, setParticipants] = useState<LiveSessionParticipant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'sessions' | 'create' | 'participants'>('sessions');

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.get<LiveSession[]>('/api/admin/live-sessions');
      setSessions(data || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchParticipants = async (sessionId: string) => {
    try {
      const data = await apiClient.get<any[]>(`/api/admin/live-sessions/${sessionId}/participants`);
      setParticipants(data || []);
    } catch (error) {
      console.error('Error fetching participants:', error);
    }
  };

  const startLiveSession = async (sessionId: string) => {
    try {
      const data = await apiClient.put<LiveSession>(`/api/admin/live-sessions/${sessionId}/start`, {
        actual_start: new Date().toISOString(),
        current_participants: 0
      });

      // Update participants who are already enrolled
      await apiClient.put(`/api/admin/live-sessions/${sessionId}/participants/activate`, {
        is_active: true,
        joined_at: new Date().toISOString()
      });

      console.log(`🔴 Started live session: ${data.title}`);
      
      // Refresh data
      await fetchSessions();
      if (selectedSession?.id === sessionId) {
        setSelectedSession(data);
      }
    } catch (error) {
      console.error('Error starting session:', error);
    }
  };

  const endLiveSession = async (sessionId: string) => {
    try {
      const data = await apiClient.put<LiveSession>(`/api/admin/live-sessions/${sessionId}/end`, {
        actual_end: new Date().toISOString()
      });

      // Update participants
      await apiClient.put(`/api/admin/live-sessions/${sessionId}/participants/deactivate`, {
        is_active: false,
        left_at: new Date().toISOString()
      });

      console.log(`🛑 Ended live session: ${data.title}`);
      
      // Refresh data
      await fetchSessions();
      if (selectedSession?.id === sessionId) {
        setSelectedSession(data);
      }
    } catch (error) {
      console.error('Error ending session:', error);
    }
  };

  const createSession = async (sessionData: Partial<LiveSession>) => {
    try {
      const data = await apiClient.post<LiveSession>('/api/admin/live-sessions', {
        ...sessionData,
        status: 'scheduled',
        created_at: new Date().toISOString()
      });

      console.log(`📅 Created live session: ${data.title}`);
      
      // Refresh data
      await fetchSessions();
      setActiveTab('sessions');
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  const updateSession = async (sessionId: string, updates: Partial<LiveSession>) => {
    try {
      const data = await apiClient.put<LiveSession>(`/api/admin/live-sessions/${sessionId}`, updates);

      console.log(`✏ Updated live session: ${data.title}`);
      
      // Refresh data
      await fetchSessions();
      if (selectedSession?.id === sessionId) {
        setSelectedSession(data);
      }
    } catch (error) {
      console.error('Error updating session:', error);
    }
  };

  const deleteSession = async (sessionId: string) => {
    try {
      await apiClient.delete(`/api/admin/live-sessions/${sessionId}`);

      console.log(`🗑 Deleted live session: ${sessionId}`);
      
      // Refresh data
      await fetchSessions();
      if (selectedSession?.id === sessionId) {
        setSelectedSession(null);
      }
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  };

  const getSessionStatus = (status: string) => {
    switch (status) {
      case 'scheduled':
        return { color: 'bg-blue-100 text-blue-800', icon: <Calendar className="w-4 h-4" />, label: 'Scheduled' };
      case 'live':
        return { color: 'bg-red-100 text-red-800', icon: <Video className="w-4 h-4" />, label: 'Live Now' };
      case 'ended':
        return { color: 'bg-gray-100 text-gray-800', icon: <VideoOff className="w-4 h-4" />, label: 'Ended' };
      case 'cancelled':
        return { color: 'bg-yellow-100 text-yellow-800', icon: <AlertCircle className="w-4 h-4" />, label: 'Cancelled' };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: <Square className="w-4 h-4" />, label: status };
    }
  };

  const filteredSessions = sessions.filter(session => {
    if (activeTab === 'sessions') return true;
    if (activeTab === 'create') return false;
    return session.status === 'scheduled' || session.status === 'live';
  });

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
          <h1 className="text-3xl font-bold text-gray-900">Live Class Manager</h1>
          <p className="text-gray-600">Schedule and manage live streaming sessions</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setActiveTab('create')}
            variant={activeTab === 'create' ? 'default' : 'outline'}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Session
          </Button>
          <Button
            onClick={() => fetchSessions()}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="create">Create</TabsTrigger>
          <TabsTrigger value="participants">Participants</TabsTrigger>
        </TabsList>

        {/* Sessions Tab */}
        <TabsContent value="sessions" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSessions.map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setSelectedSession(session);
                  fetchParticipants(session.id);
                }}
                className="border rounded-lg p-4 hover:shadow-lg transition-all cursor-pointer bg-white"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">{session.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      with {session.instructor_name}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(session.scheduled_start).toLocaleDateString()}</span>
                      <Clock className="w-4 h-4 ml-2" />
                      <span>{new Date(session.scheduled_start).toLocaleTimeString()}</span>
                    </div>
                  </div>
                  
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${getSessionStatus(session.status).color}`}>
                    {getSessionStatus(session.status).label}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Participants:</span>
                    <span className="font-medium">{session.current_participants}/{session.max_participants}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Course:</span>
                    <span className="font-medium">{session.course_title || 'N/A'}</span>
                  </div>
                </div>

                {session.status === 'live' && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-red-600 font-medium">🔴 LIVE NOW</span>
                      <Button
                        size="sm"
                        onClick={() => endLiveSession(session.id)}
                        className="ml-auto bg-red-600 text-white hover:bg-red-700"
                      >
                        End Session
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Create Tab */}
        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Create New Live Session
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                createSession({
                  title: formData.get('title') as string,
                  description: formData.get('description') as string,
                  instructor_id: formData.get('instructor_id') as string,
                  course_id: formData.get('course_id') as string,
                  scheduled_start: formData.get('scheduled_start') as string,
                  scheduled_end: formData.get('scheduled_end') as string,
                  max_participants: parseInt(formData.get('max_participants') as string) || 100,
                  chat_enabled: formData.get('chat_enabled') === 'true',
                  screen_share_enabled: formData.get('screen_share_enabled') === 'true',
                  settings: {
                    allow_recording: formData.get('allow_recording') === 'true',
                    auto_start_recording: formData.get('auto_start_recording') === 'true',
                    require_password: formData.get('require_password') === 'true',
                    password: formData.get('password') as string
                  }
                });
              }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Session Title *</Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="Introduction to React Hooks"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Session description and agenda..."
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="instructor_id">Instructor</Label>
                    <Select name="instructor_id" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select instructor" />
                      </SelectTrigger>
                      <SelectContent>
                        {/* This would be populated with actual instructors */}
                        <SelectItem value="instructor-1">John Doe</SelectItem>
                        <SelectItem value="instructor-2">Jane Smith</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="course_id">Course</Label>
                    <Select name="course_id" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select course" />
                      </SelectTrigger>
                      <SelectContent>
                        {/* This would be populated with actual courses */}
                        <SelectItem value="course-1">React Fundamentals</SelectItem>
                        <SelectItem value="course-2">Advanced JavaScript</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="scheduled_start">Start Time *</Label>
                    <Input
                      id="scheduled_start"
                      name="scheduled_start"
                      type="datetime-local"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="scheduled_end">End Time *</Label>
                    <Input
                      id="scheduled_end"
                      name="scheduled_end"
                      type="datetime-local"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="max_participants">Max Participants</Label>
                    <Input
                      id="max_participants"
                      name="max_participants"
                      type="number"
                      min="1"
                      max="1000"
                      defaultValue="100"
                    />
                  </div>
                  <div>
                    <Label htmlFor="stream_url">Stream URL (Optional)</Label>
                    <Input
                      id="stream_url"
                      name="stream_url"
                      placeholder="rtmp://your-stream-key"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 mb-3">Session Settings</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch id="chat_enabled" name="chat_enabled" defaultChecked={true} />
                      <Label htmlFor="chat_enabled" className="text-sm">Enable Chat</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="screen_share_enabled" name="screen_share_enabled" defaultChecked={true} />
                      <Label htmlFor="screen_share_enabled" className="text-sm">Enable Screen Share</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 mb-3">Recording Settings</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch id="allow_recording" name="allow_recording" defaultChecked={true} />
                      <Label htmlFor="allow_recording" className="text-sm">Allow Recording</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="auto_start_recording" name="auto_start_recording" defaultChecked={false} />
                      <Label htmlFor="auto_start_recording" className="text-sm">Auto-start Recording</Label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button type="submit" className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Create Session
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Participants Tab */}
        <TabsContent value="participants" className="space-y-6">
          {selectedSession ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Session Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Session Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label>Session Title</Label>
                      <p className="font-medium">{selectedSession.title}</p>
                    </div>
                    <div>
                      <Label>Instructor</Label>
                      <p className="font-medium">{selectedSession.instructor_name}</p>
                    </div>
                    <div>
                      <Label>Status</Label>
                      <div className="flex items-center gap-2">
                        <Badge className={getSessionStatus(selectedSession.status).color}>
                          {getSessionStatus(selectedSession.status).label}
                        </Badge>
                        {selectedSession.status === 'live' && (
                          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse ml-2"></div>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label>Participants</Label>
                      <p className="font-medium">{participants.length} enrolled</p>
                    </div>
                    <div>
                      <Label>Start Time</Label>
                      <p className="font-medium">{new Date(selectedSession.scheduled_start).toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Participants List */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Enrolled Participants ({participants.length})
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Mail className="w-4 h-4" />
                      Notify All
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Refresh
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {participants.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Users className="w-8 h-8 mx-auto mb-4 text-gray-400" />
                        <p>No participants enrolled yet</p>
                      </div>
                    ) : (
                      participants.map((participant, index) => (
                        <motion.div
                          key={participant.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <Users className="w-5 h-5 text-gray-600" />
                            </div>
                            <div>
                              <p className="font-medium">{participant.student_name}</p>
                              <p className="text-sm text-gray-500">{participant.student_email}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant={participant.is_active ? 'default' : 'secondary'}
                                className="capitalize"
                              >
                                {participant.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    // Toggle participant active status
                                  }}
                                >
                                  {participant.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    // Remove participant
                                  }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Enrolled: {new Date(participant.enrolled_at).toLocaleDateString()}
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-16 text-gray-500">
              <Monitor className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p>Select a session to view participants</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
