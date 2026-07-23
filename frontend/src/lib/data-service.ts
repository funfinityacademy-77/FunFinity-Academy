/**
 * Data Service Layer
 * Centralized data fetching from Supabase database
 */

import { supabase } from './supabase';

// Generate Learning Plan using custom algorithm
export const generateLearningPlan = async (userId: string, learningDNA: any) => {
  try {
    // Custom algorithm to analyze user data and generate personalized plan
    const plan = analyzeAndGeneratePlan(learningDNA);
    
    // Store the plan in the database
    const { data, error } = await supabase
      .from('system_suggested_plans')
      .upsert({
        user_id: userId,
        plan_content: plan,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error generating learning plan:', error);
    throw error;
  }
};

// Custom algorithm to analyze user data and generate plan
const analyzeAndGeneratePlan = (dna: any) => {
  if (!dna) {
    return "No Learning DNA data available. Please complete the Learning DNA assessment first.";
  }

  let plan = "🎯 **System Suggested Learning Plan**\n\n";
  
  // Analyze learning needs
  const needs = [];
  if (dna.has_adhd) needs.push("ADHD - Focus management and distraction reduction strategies");
  if (dna.has_dyslexia) needs.push("Dyslexia - Audio-based learning and text-to-speech tools");
  if (dna.has_anxiety) needs.push("Anxiety - Stress reduction and confidence-building techniques");
  if (dna.has_dyscalculia) needs.push("Dyscalculia - Visual math tools and step-by-step problem solving");
  if (dna.has_asd) needs.push("ASD - Structured learning environments with clear routines");
  
  if (needs.length > 0) {
    plan += "📋 **Learning Needs Analysis:**\n";
    needs.forEach((need, i) => {
      plan += `${i + 1}. ${need}\n`;
    });
    plan += "\n";
  }
  
  // Analyze learning styles
  const styles = [];
  if (dna.style_visual) styles.push("Visual learning (diagrams, charts, videos)");
  if (dna.style_reading) styles.push("Reading & writing (notes, text summaries)");
  if (dna.style_auditory) styles.push("Auditory learning (discussions, explanations)");
  if (dna.style_kinesthetic) styles.push("Hands-on practice (experiments, building)");
  if (dna.style_social) styles.push("Collaborative learning (group work, discussions)");
  if (dna.style_solo) styles.push("Independent study (self-paced, focused)");
  
  if (styles.length > 0) {
    plan += "🎨 **Preferred Learning Styles:**\n";
    styles.forEach((style, i) => {
      plan += `${i + 1}. ${style}\n`;
    });
    plan += "\n";
  }
  
  // Generate personalized recommendations
  plan += "📚 **Personalized Recommendations:**\n\n";
  
  // Study schedule based on focus mode
  const focusMode = dna.focus_mode || 'flexible';
  if (focusMode === 'morning') {
    plan += "⏰ **Optimal Study Time:** 6AM-10AM when your mind is freshest\n";
  } else if (focusMode === 'afternoon') {
    plan += "⏰ **Optimal Study Time:** 2PM-6PM for peak afternoon focus\n";
  } else if (focusMode === 'evening') {
    plan += "⏰ **Optimal Study Time:** 6PM-10PM for evening concentration\n";
  } else {
    plan += "⏰ **Optimal Study Time:** Varies by day - track your energy patterns\n";
  }
  plan += "\n";
  
  // Session structure
  const sessionLength = dna.session_length || 'medium';
  const breakFrequency = dna.break_frequency || 'normal';
  plan += `📝 **Session Structure:**\n`;
  plan += `• Session length: ${sessionLength === 'short' ? '25-30 minutes' : sessionLength === 'medium' ? '45-60 minutes' : '90-120 minutes'}\n`;
  plan += `• Break interval: ${breakFrequency === 'frequent' ? 'Every 15-20 minutes' : breakFrequency === 'normal' ? 'Every 25-30 minutes' : 'Every 45-50 minutes'}\n`;
  plan += `• Break activities: ${dna.style_kinesthetic ? 'Physical movement, stretching' : 'Mental relaxation, breathing exercises'}\n`;
  plan += "\n";
  
  // Learning techniques based on styles
  plan += "🧠 **Recommended Learning Techniques:**\n";
  if (dna.style_visual) {
    plan += "• Use mind maps and diagrams to visualize concepts\n";
    plan += "• Watch video tutorials before reading text\n";
    plan += "• Color-code your notes by topic\n";
  }
  if (dna.style_reading) {
    plan += "• Take detailed notes with summaries\n";
    plan += "• Use flashcards for memorization\n";
    plan += "• Read material multiple times for retention\n";
  }
  if (dna.style_auditory) {
    plan += "• Record lectures and listen again\n";
    plan += "• Discuss concepts with peers or tutors\n";
    plan += "• Use text-to-speech for reading material\n";
  }
  if (dna.style_kinesthetic) {
    plan += "• Practice with hands-on exercises and experiments\n";
    plan += "• Build physical models or prototypes\n";
    plan += "• Use interactive simulations and games\n";
  }
  plan += "\n";
  
  // Focus strategies based on needs
  if (dna.has_adhd) {
    plan += "🎯 **ADHD Focus Strategies:**\n";
    plan += "• Use the Pomodoro technique with 25-minute focused sessions\n";
    plan += "• Remove all distractions from your study environment\n";
    plan += "• Use fidget tools or stress balls during study sessions\n";
    plan += "• Break large tasks into smaller, manageable chunks\n";
    plan += "\n";
  }
  
  if (dna.has_anxiety) {
    plan += "😌 **Anxiety Management:**\n";
    plan += "• Practice deep breathing exercises before study sessions\n";
    plan += "• Start with easier tasks to build confidence\n";
    plan += "• Use positive self-talk and affirmations\n";
    plan += "• Take regular breaks to prevent overwhelm\n";
    plan += "\n";
  }
  
  // Weekly schedule template
  plan += "📅 **Weekly Study Schedule Template:**\n";
  plan += "• Monday: New concepts and foundational material\n";
  plan += "• Tuesday: Practice exercises and reinforcement\n";
  plan += "• Wednesday: Review and connect concepts\n";
  plan += "• Thursday: Advanced applications and problem-solving\n";
  plan += "• Friday: Assessment and self-reflection\n";
  plan += "• Weekend: Creative projects or review of weak areas\n";
  plan += "\n";
  
  // Progress tracking
  plan += "📊 **Progress Tracking:**\n";
  plan += "• Set weekly goals based on your focus pattern\n";
  plan += "• Use the platform's gamification features for motivation\n";
  plan += "• Review your progress every " + (breakFrequency === 'frequent' ? 'few days' : 'week') + "\n";
  plan += "• Adjust your plan based on what works best for you\n";
  plan += "\n";
  
  plan += "💡 **Remember:** This plan is personalized based on your Learning DNA. Adjust as needed and track your progress to optimize your learning experience.\n";
  
  return plan;
};

// Users & Profiles
export const fetchUsers = async () => {
  try {
    // Use RPC function to fetch users with roles to avoid RLS recursion
    const { data, error } = await supabase.rpc('fetch_all_users_with_roles');
    
    if (error) {
      console.error('Error fetching users via RPC:', error);
      // Fallback to manual fetch if RPC fails
      return await fetchUsersFallback();
    }
    
    console.log('Fetched users via RPC:', data?.length || 0, 'users');
    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error in fetchUsers:', error);
    return await fetchUsersFallback();
  }
};

// Fallback function that fetches profiles and uses profile.role instead of user_roles
const fetchUsersFallback = async () => {
  // First fetch all profiles (profiles table has role field)
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (profilesError) {
    console.error('Error fetching profiles:', profilesError);
    return { data: [], error: profilesError };
  }
  
  // Map profiles to include user_roles structure using profile.role
  const usersWithRoles = profiles?.map((profile: any) => ({
    ...profile,
    user_roles: profile.role ? { role: profile.role } : null
  })) || [];
  
  console.log('Fetched users via fallback:', usersWithRoles.length, 'profiles');
  console.log('Sample user:', usersWithRoles[0]);
  
  return { data: usersWithRoles, error: null };
};

export const fetchUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return { data, error };
};

export const createUser = async (userData: {
  email: string;
  password: string;
  display_name: string;
  role?: string;
}) => {
  try {
    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
    });

    if (authError) {
      return { data: null, error: authError };
    }

    if (!authData.user) {
      return { data: null, error: new Error('Failed to create user') };
    }

    // Create profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: userData.email,
        display_name: userData.display_name,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (profileError) {
      return { data: null, error: profileError };
    }

    // Assign role
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: authData.user.id,
        role: userData.role || 'student',
        created_at: new Date().toISOString(),
      });

    if (roleError) {
      return { data: null, error: roleError };
    }

    return { data: profileData, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
};

export const restrictUser = async (userId: string, data: {
  reason?: string;
  duration_hours?: number;
}) => {
  try {
    const { error } = await supabase
      .from('restrictions')
      .insert({
        user_id: userId,
        type: 'restrict',
        reason: data.reason || 'Restricted by admin',
        expires_at: data.duration_hours ? new Date(Date.now() + data.duration_hours * 60 * 60 * 1000).toISOString() : null,
        created_at: new Date().toISOString(),
      });

    if (error) return { data: null, error };

    // Update profile status
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ status: 'restricted', updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (profileError) return { data: null, error: profileError };

    return { data: { success: true }, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
};

export const banUser = async (userId: string, reason?: string) => {
  try {
    const { error } = await supabase
      .from('restrictions')
      .insert({
        user_id: userId,
        type: 'ban',
        reason: reason || 'Banned by admin',
        created_at: new Date().toISOString(),
      });

    if (error) return { data: null, error };

    // Update profile status
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ status: 'banned', updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (profileError) return { data: null, error: profileError };

    return { data: { success: true }, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
};

export const deleteUser = async (userId: string) => {
  try {
    // Delete from auth (requires service role)
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);
    if (authError) return { data: null, error: authError };

    // Delete from database tables
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (profileError) return { data: null, error: profileError };

    const { error: roleError } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId);

    if (roleError) return { data: null, error: roleError };

    return { data: { success: true }, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
};

export const updateUser = async (userId: string, userData: any) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      ...userData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single();
  return { data, error };
};

export const updateUserRole = async (userId: string, role: string) => {
  // First update the profile role
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ role, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (profileError) return { data: null, error: profileError };

  // Then update the user_roles table
  const { data, error } = await supabase
    .from('user_roles')
    .upsert({
      user_id: userId,
      role,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  return { data, error };
};

export const liftRestriction = async (userId: string) => {
  try {
    // Delete restriction record
    const { error } = await supabase
      .from('restrictions')
      .delete()
      .eq('user_id', userId);

    if (error) return { data: null, error };

    // Update profile status to active
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ status: 'active', updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (profileError) return { data: null, error: profileError };

    return { data: { success: true }, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
};

// Courses
export const fetchCourses = async () => {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .order('created_at', { ascending: false });
  return { data, error };
};

export const fetchCourseById = async (courseId: string) => {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('id', courseId)
    .single();
  return { data, error };
};

export const fetchCourseWithLessons = async (courseId: string) => {
  const { data, error } = await supabase
    .from('courses')
    .select(`
      *,
      lessons (*)
    `)
    .eq('id', courseId)
    .single();
  return { data, error };
};

export const createCourse = async (courseData: any) => {
  const { data, error } = await supabase
    .from('courses')
    .insert({
      ...courseData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();
  return { data, error };
};

export const updateCourse = async (courseId: string, courseData: any) => {
  const { data, error } = await supabase
    .from('courses')
    .update({
      ...courseData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', courseId)
    .select()
    .single();
  return { data, error };
};

export const deleteCourse = async (courseId: string) => {
  const { error } = await supabase
    .from('courses')
    .delete()
    .eq('id', courseId);
  return { data: null, error };
};

// Enrollments
export const fetchEnrollments = async () => {
  const { data, error } = await supabase
    .from('enrollments')
    .select(`
      *,
      profiles:user_id (*),
      courses:course_id (*)
    `)
    .order('enrolled_at', { ascending: false });
  return { data, error };
};

export const fetchUserEnrollments = async (userId: string) => {
  const { data, error } = await supabase
    .from('enrollments')
    .select(`
      *,
      courses:course_id (*)
    `)
    .eq('user_id', userId);
  return { data, error };
};

// Assignments
export const fetchAssignments = async () => {
  const { data, error } = await supabase
    .from('assignments')
    .select('*')
    .order('created_at', { ascending: false });
  return { data, error };
};

export const fetchAssignmentSubmissions = async (assignmentId: string) => {
  const { data, error } = await supabase
    .from('assignment_submissions')
    .select(`
      *,
      profiles:user_id (*)
    `)
    .eq('assignment_id', assignmentId);
  return { data, error };
};

// Quizzes
export const fetchQuizzes = async () => {
  const { data, error } = await supabase
    .from('quizzes')
    .select('*')
    .order('created_at', { ascending: false });
  return { data, error };
};

export const fetchQuizWithQuestions = async (quizId: string) => {
  const { data, error } = await supabase
    .from('quizzes')
    .select(`
      *,
      quiz_questions (*)
    `)
    .eq('id', quizId)
    .single();
  return { data, error };
};

// Announcements
export const fetchAnnouncements = async () => {
  const { data, error } = await supabase
    .from('announcements')
    .select(`
      *,
      profiles:author_id (*)
    `)
    .order('created_at', { ascending: false });
  return { data, error };
};

export const createAnnouncement = async (announcementData: any) => {
  const { data, error } = await supabase
    .from('announcements')
    .insert({
      ...announcementData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();
  return { data, error };
};

export const updateAnnouncement = async (announcementId: string, announcementData: any) => {
  const { data, error } = await supabase
    .from('announcements')
    .update({
      ...announcementData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', announcementId)
    .select()
    .single();
  return { data, error };
};

export const deleteAnnouncement = async (announcementId: string) => {
  const { error } = await supabase
    .from('announcements')
    .delete()
    .eq('id', announcementId);
  return { data: null, error };
};

// Forum
export const fetchForumPosts = async () => {
  const { data, error } = await supabase
    .from('forum_posts')
    .select(`
      *,
      profiles:author_id (*),
      forum_replies (*)
    `)
    .order('created_at', { ascending: false });
  return { data, error };
};

// Messages
export const fetchConversations = async (userId: string) => {
  const { data, error } = await supabase
    .from('conversations')
    .select('*');
  return { data, error };
};

// Notes
export const fetchUserNotes = async (userId: string) => {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return { data, error };
};

// Bookmarks
export const fetchUserBookmarks = async (userId: string) => {
  const { data, error } = await supabase
    .from('bookmarks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return { data, error };
};

// Learning DNA
export const fetchLearningDNA = async (userId: string) => {
  const { data, error } = await supabase
    .from('learning_dna_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  return { data, error };
};

// Career
export const fetchCareerProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('career_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  return { data, error };
};

export const fetchExperienceLogs = async (userId: string) => {
  const { data, error } = await supabase
    .from('experience_logs')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });
  return { data, error };
};

// Course Progress
export const fetchCourseProgress = async (userId: string, courseId: string) => {
  const { data, error } = await supabase
    .from('course_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('course_id', courseId);
  return { data, error };
};

export const fetchAllCourseProgress = async (userId: string) => {
  const { data, error } = await supabase
    .from('course_progress')
    .select(`
      *,
      courses:course_id (*),
      lessons:lesson_id (*)
    `)
    .eq('user_id', userId);
  return { data, error };
};

// Quiz Submissions
export const fetchQuizSubmissions = async (userId: string) => {
  const { data, error } = await supabase
    .from('quiz_submissions')
    .select(`
      *,
      quizzes:quiz_id (*)
    `)
    .eq('user_id', userId)
    .order('completed_at', { ascending: false });
  return { data, error };
};

export const fetchQuizSubmission = async (userId: string, quizId: string) => {
  const { data, error } = await supabase
    .from('quiz_submissions')
    .select('*')
    .eq('user_id', userId)
    .eq('quiz_id', quizId)
    .single();
  return { data, error };
};

// Messages
export const fetchMessages = async (conversationId: string) => {
  const { data, error } = await supabase
    .from('messages')
    .select(`
      *,
      profiles:sender_id (*)
    `)
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });
  return { data, error };
};

export const fetchConversationWithMembers = async (conversationId: string) => {
  const { data, error } = await supabase
    .from('conversations')
    .select(`
      *,
      conversation_members (*),
      profiles:conversation_members.user_id (*)
    `)
    .eq('id', conversationId)
    .single();
  return { data, error };
};

// Badges
export const fetchBadges = async () => {
  const { data, error } = await supabase
    .from('badges')
    .select('*')
    .order('points', { ascending: false });
  return { data, error };
};

export const fetchUserBadges = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_badges')
    .select(`
      *,
      badges:badge_id (*)
    `)
    .eq('user_id', userId)
    .order('earned_at', { ascending: false });
  return { data, error };
};

// Points History
export const fetchPointsHistory = async (userId: string) => {
  const { data, error } = await supabase
    .from('points_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return { data, error };
};

// Bug Reports
export const fetchBugReports = async () => {
  const { data, error } = await supabase
    .from('bug_reports')
    .select(`
      *,
      profiles:user_id (*)
    `)
    .order('created_at', { ascending: false });
  return { data, error };
};

export const fetchUserBugReports = async (userId: string) => {
  const { data, error } = await supabase
    .from('bug_reports')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return { data, error };
};

// Activity Logs
export const fetchActivityLogs = async (limit: number = 100) => {
  const { data, error } = await supabase
    .from('activity_logs')
    .select(`
      *,
      profiles:user_id (*)
    `)
    .order('created_at', { ascending: false })
    .limit(limit);
  return { data, error };
};

export const fetchUserActivityLogs = async (userId: string, limit: number = 50) => {
  const { data, error } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  return { data, error };
};

// Restrictions
export const fetchRestrictions = async () => {
  const { data, error } = await supabase
    .from('restrictions')
    .select(`
      *,
      profiles:user_id (*)
    `)
    .order('imposed_at', { ascending: false });
  return { data, error };
};

export const fetchUserRestriction = async (userId: string) => {
  const { data, error } = await supabase
    .from('restrictions')
    .select('*')
    .eq('user_id', userId)
    .single();
  return { data, error };
};

// Live Classes
export const fetchLiveClasses = async () => {
  const { data, error } = await supabase
    .from('live_classes')
    .select(`
      *,
      profiles:instructor_id (*),
      courses:course_id (*)
    `)
    .order('scheduled_at', { ascending: true });
  return { data, error };
};

export const fetchUserLiveClasses = async (userId: string) => {
  const { data, error } = await supabase
    .from('live_classes')
    .select(`
      *,
      profiles:instructor_id (*),
      courses:course_id (*)
    `)
    .eq('instructor_id', userId)
    .order('scheduled_at', { ascending: true });
  return { data, error };
};

// Notifications
export const fetchNotifications = async () => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: false });
  return { data, error };
};

export const fetchNotificationsByRole = async (role: string) => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('active', true)
    .or(`target_role.eq.all,target_role.eq.${role}`)
    .order('priority', { ascending: false });
  return { data, error };
};

// Academic Profiles
export const fetchAcademicProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('academic_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  return { data, error };
};

// Milestones
export const fetchMilestones = async (userId: string) => {
  const { data, error } = await supabase
    .from('milestones')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return { data, error };
};

export const fetchMilestone = async (userId: string, milestoneKey: string) => {
  const { data, error } = await supabase
    .from('milestones')
    .select('*')
    .eq('user_id', userId)
    .eq('milestone_key', milestoneKey)
    .single();
  return { data, error };
};

// Resumes
export const fetchResume = async (userId: string) => {
  const { data, error } = await supabase
    .from('resumes')
    .select('*')
    .eq('user_id', userId)
    .single();
  return { data, error };
};

// Analytics
export const fetchDashboardStats = async () => {
  const [users, courses, enrollments] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('courses').select('id', { count: 'exact', head: true }),
    supabase.from('enrollments').select('id', { count: 'exact', head: true })
  ]);

  return {
    usersCount: users.count || 0,
    coursesCount: courses.count || 0,
    enrollmentsCount: enrollments.count || 0
  };
};
