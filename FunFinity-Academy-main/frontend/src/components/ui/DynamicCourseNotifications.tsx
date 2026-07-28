import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Clock, Users, Star, TrendingUp, Calendar, AlertCircle } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

interface Course {
  id: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  subject: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  instructor: string;
  enrollment_count: number;
  rating: number;
  published: boolean;
  created_at: string;
  updated_at: string;
}

interface CourseNotification {
  id: string;
  type: 'new_course' | 'course_update' | 'enrollment_milestone' | 'rating_update' | 'deadline_reminder';
  title: string;
  message: string;
  course_id: string;
  user_id?: string;
  read: boolean;
  created_at: string;
  metadata?: any;
}

export function DynamicCourseNotifications() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [notifications, setNotifications] = useState<CourseNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'new' | 'updated' | 'enrolling'>('all');

  useEffect(() => {
    fetchCourses();
    fetchNotifications();
  }, []);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      
      const data = await apiClient.get<Course[]>('/api/courses?published=true&limit=12');
      setCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const data = await apiClient.get<CourseNotification[]>('/api/course-notifications?limit=10');
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const getFilteredCourses = () => {
    switch (filter) {
      case 'new':
        return courses.filter(course => {
          const createdDate = new Date(course.created_at);
          const daysAgo = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
          return daysAgo <= 7; // Courses created in last 7 days
        });
      case 'updated':
        return courses.filter(course => {
          const updatedDate = new Date(course.updated_at);
          const daysAgo = (Date.now() - updatedDate.getTime()) / (1000 * 60 * 60 * 24);
          return daysAgo <= 3; // Updated in last 3 days
        });
      case 'enrolling':
        return courses.filter(course => course.enrollment_count > 0).sort((a, b) => b.enrollment_count - a.enrollment_count);
      default:
        return courses;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_course':
        return <BookOpen className="w-4 h-4" />;
      case 'course_update':
        return <TrendingUp className="w-4 h-4" />;
      case 'enrollment_milestone':
        return <Users className="w-4 h-4" />;
      case 'rating_update':
        return <Star className="w-4 h-4" />;
      case 'deadline_reminder':
        return <Clock className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'new_course':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'course_update':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'enrollment_milestone':
        return 'bg-purple-50 border-purple-200 text-purple-800';
      case 'rating_update':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'deadline_reminder':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInHours = Math.floor((diffInMs % (1000 * 60 * 60 * 24)) / (1000 * 60));
    const diffInMinutes = Math.floor((diffInMs % (1000 * 60)) / 1000);

    if (diffInDays > 0) {
      return `${diffInDays}d ago`;
    } else if (diffInHours > 0) {
      return `${diffInHours}h ago`;
    } else if (diffInMinutes > 0) {
      return `${diffInMinutes}m ago`;
    } else {
      return 'Just now';
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await apiClient.put(`/api/course-notifications/${notificationId}`, { read: true });

      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const filteredCourses = getFilteredCourses();
  const hasCourses = filteredCourses.length > 0;
  const hasNotifications = notifications.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Course Updates</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              filter === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('new')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              filter === 'new' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            New
          </button>
          <button
            onClick={() => setFilter('updated')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              filter === 'updated' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Updated
          </button>
          <button
            onClick={() => setFilter('enrolling')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              filter === 'enrolling' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Trending
          </button>
        </div>
      </div>

      {/* Notifications */}
      {hasNotifications && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Notifications</h3>
          <div className="space-y-3">
            <AnimatePresence>
              {notifications.slice(0, 5).map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className={`p-4 rounded-lg border ${getNotificationColor(notification.type)} ${
                    notification.read ? 'opacity-60' : ''
                  }`}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                  style={{ cursor: notification.read ? 'default' : 'pointer' }}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900">{notification.title}</h4>
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(notification.created_at)}
                        </span>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mt-2">{notification.message}</p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Course Grid */}
      {hasCourses ? (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {filter === 'all' && 'All Courses'}
            {filter === 'new' && 'New Courses'}
            {filter === 'updated' && 'Recently Updated'}
            {filter === 'enrolling' && 'Trending Courses'}
            <span className="text-sm text-gray-500 ml-2">({filteredCourses.length})</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredCourses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ 
                    duration: 0.5, 
                    delay: index * 0.1 
                  }}
                  whileHover={{ scale: 1.05 }}
                  className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  <div className="relative">
                    <div className="aspect-video bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                      <BookOpen className="w-16 h-16 text-primary/50" />
                    </div>
                    
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          course.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                          course.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {course.difficulty}
                        </span>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm font-medium text-gray-900">
                            {course.rating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                        {course.title}
                      </h3>
                      
                      {course.description && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                          {course.description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {course.enrollment_count} enrolled
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {Math.round(course.duration / 60)}h {course.duration % 60}m
                          </span>
                        </div>
                        <span>
                          by {course.instructor}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      ) : (
        /* Coming Soon Component */
        <div className="text-center py-16">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-100 border border-yellow-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <span className="text-yellow-800 font-medium">No courses available</span>
          </div>
          <p className="mt-4 text-gray-600">
            Check back soon for new course updates and enrollments!
          </p>
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => fetchCourses()}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Refresh Courses
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
