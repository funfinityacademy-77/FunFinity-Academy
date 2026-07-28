import { supabase } from './supabase';

interface UserRouteInfo {
  isSearch: boolean;
  userId?: string;
  subResource?: string;
  subId?: string;
}

class ApiClient {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  clearToken() {
    this.token = null;
  }

  // Helper to parse /api/users/:userId/:subResource?/:subId? or /api/users/search
  private parseUserRoute(endpoint: string): UserRouteInfo | null {
    const path = endpoint.split('?')[0];
    const parts = path.split('/').filter(Boolean);
    // Expected parts format: ['api', 'users', userId, subResource, subId]
    if (parts.length >= 3 && parts[0] === 'api' && parts[1] === 'users') {
      if (parts[2] === 'search') {
        return { isSearch: true };
      }
      return {
        isSearch: false,
        userId: parts[2],
        subResource: parts[3], // e.g. 'profile', 'learning-dna', 'notes'
        subId: parts[4] // e.g. noteId or milestone key
      };
    }
    return null;
  }

  private async handleNotificationsEndpoint<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const path = endpoint.split('?')[0];
    const parts = path.split('/').filter(Boolean);
    
    // Handle /api/notifications/public - GET public notifications
    if (parts[2] === 'public') {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('active', true)
        .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString())
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as T;
    }
    
    // Handle /api/notifications - GET all notifications (admin only)
    if (parts.length === 3 && parts[2] === 'notifications') {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as T;
    }
    
    // Handle /api/notifications/:id - GET single notification
    if (parts.length === 4 && parts[2] === 'notifications') {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('id', parts[3])
        .single();
      
      if (error) throw error;
      return data as T;
    }
    
    // Handle POST /api/notifications - Create notification
    if (options?.method === 'POST' && parts[2] === 'notifications') {
      const body = JSON.parse(options.body as string);
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          ...body,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as T;
    }
    
    // Handle PUT /api/notifications/:id - Update notification
    if (options?.method === 'PUT' && parts.length === 4 && parts[2] === 'notifications') {
      const body = JSON.parse(options.body as string);
      const { data, error } = await supabase
        .from('notifications')
        .update(body)
        .eq('id', parts[3])
        .select()
        .single();
      
      if (error) throw error;
      return data as T;
    }
    
    // Handle DELETE /api/notifications/:id - Delete notification
    if (options?.method === 'DELETE' && parts.length === 4 && parts[2] === 'notifications') {
      const { data, error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', parts[3])
        .select();
      
      if (error) throw error;
      return data as T;
    }
    
    throw new Error(`Unsupported notifications endpoint: ${endpoint}`);
  }

  // REST-style endpoint handler (backward compatibility)
  private async handleRestEndpoint<T>(endpoint: string, options?: RequestInit): Promise<T> {
    // Handle notifications endpoints
    if (endpoint.startsWith('/api/notifications')) {
      return this.handleNotificationsEndpoint<T>(endpoint, options);
    }

    const userRoute = this.parseUserRoute(endpoint);
    if (userRoute) {
      if (userRoute.isSearch) {
        // GET /api/users/search?q=xxx&limit=yyy
        const urlParams = new URLSearchParams(endpoint.split('?')[1] || '');
        const query = urlParams.get('q') || '';
        const limit = parseInt(urlParams.get('limit') || '10', 10);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .or(`display_name.ilike.%${query}%,email.ilike.%${query}%`)
          .limit(limit);
        if (error) throw error;
        return data as T;
      }

      const { userId, subResource, subId } = userRoute;

      if (!subResource) {
        // GET /api/users/:userId
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        if (error && error.code !== 'PGRST116') throw error;
        return (data || null) as T;
      }

      switch (subResource) {
        case 'profile': {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
          if (error && error.code !== 'PGRST116') throw error;
          return (data || null) as T;
        }
        case 'learning-dna': {
          const { data, error } = await supabase
            .from('learning_dna_profiles')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();
          if (error) return null as T;
          return data as T;
        }
        case 'career-profile': {
          const { data, error } = await supabase
            .from('career_profiles')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();
          if (error) return null as T;
          return data as T;
        }
        case 'experience-logs': {
          const { data, error } = await supabase
            .from('experience_logs')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
          if (error) throw error;
          return data as T;
        }
        case 'milestones': {
          const { data, error } = await supabase
            .from('milestones')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: true });
          if (error) throw error;
          return data as T;
        }
        case 'notes': {
          if (subId) {
            // GET /api/users/:userId/notes/:noteId
            const { data, error } = await supabase
              .from('notes')
              .select('*')
              .eq('id', subId)
              .single();
            if (error && error.code !== 'PGRST116') throw error;
            return (data || null) as T;
          }
          const { data, error } = await supabase
            .from('notes')
            .select('*')
            .eq('user_id', userId)
            .order('updated_at', { ascending: false });
          if (error) throw error;
          return data as T;
        }
        case 'bookmarks': {
          const { data, error } = await supabase
            .from('bookmarks')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
          if (error) throw error;
          return data as T;
        }
        case 'quiz-attempts': {
          const { data, error } = await supabase
            .from('quiz_submissions')
            .select('*')
            .eq('user_id', userId)
            .order('submitted_at', { ascending: false });
          if (error) throw error;
          return data as T;
        }
        case 'roles': {
          const { data, error } = await supabase
            .from('user_roles')
            .select('*')
            .eq('user_id', userId);
          if (error) throw error;
          return data as T;
        }
        case 'resume': {
          const { data, error } = await supabase
            .from('resumes')
            .select('*')
            .eq('user_id', userId)
            .single();
          if (error && error.code !== 'PGRST116') throw error;
          return (data || null) as T;
        }
        case 'enrollments': {
          const { data, error } = await supabase
            .from('enrollments')
            .select(`
              *,
              profiles:user_id (*),
              courses:course_id (*)
            `)
            .eq('user_id', userId)
            .order('enrolled_at', { ascending: false });
          if (error) throw error;
          return data as T;
        }
        case 'academic-profile': {
          const { data, error } = await supabase
            .from('academic_profiles')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();
          if (error) return null as T;
          return data as T;
        }
        default:
          return [] as T;
      }
    }

    // Direct translations for other legacy REST endpoints
    if (endpoint.startsWith('/api/courses')) {
      const { data, error } = await supabase.from('courses').select('*');
      if (error) throw error;
      return data as T;
    }
    
    if (endpoint.startsWith('/api/notes')) {
      const userId = endpoint.split('/').pop();
      const { data, error } = await supabase.from('notes').select('*').eq('user_id', userId);
      if (error) throw error;
      return data as T;
    }

    if (endpoint.startsWith('/api/bookmarks')) {
      const userId = endpoint.split('/').pop();
      const { data, error } = await supabase.from('bookmarks').select('*').eq('user_id', userId);
      if (error) throw error;
      return data as T;
    }

    if (endpoint.startsWith('/api/forums')) {
      const { data, error } = await supabase.from('forum_posts').select('*');
      if (error) throw error;
      return data as T;
    }

    if (endpoint.startsWith('/api/announcements')) {
      const { data, error } = await supabase.from('announcements').select('*');
      if (error) throw error;
      return data as T;
    }

    if (endpoint.startsWith('/api/quizzes')) {
      const parts = endpoint.split('/');
      const quizId = parts[3];
      
      if (endpoint.includes('/submit')) {
        // Handle quiz submission (Rest compatibility)
        const { data, error } = await supabase
          .from('quiz_submissions')
          .insert({
            quiz_id: quizId,
            user_id: (options as any)?.user_id,
            answers: JSON.stringify((options as any)?.answers),
            score: (options as any)?.score,
            max_score: (options as any)?.max_score,
            submitted_at: new Date().toISOString(),
          })
          .select()
          .single();
        if (error) throw error;
        return data as T;
      }
      
      if (endpoint.includes('/questions')) {
        const { data, error } = await supabase.from('quiz_questions').select('*').eq('quiz_id', quizId);
        if (error) throw error;
        return data as T;
      }
      
      const { data, error } = await supabase.from('quizzes').select('*').eq('id', quizId).single();
      if (error) throw error;
      return data as T;
    }
    
    if (endpoint.startsWith('/api/enrollments')) {
      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          *,
          profiles:user_id (*),
          courses:course_id (*)
        `)
        .order('enrolled_at', { ascending: false });
      if (error) throw error;
      return data as T;
    }
    
    if (endpoint.startsWith('/api/quiz-attempts')) {
      const { data, error } = await supabase
        .from('quiz_submissions')
        .select(`
          *,
          quizzes:quiz_id (*),
          profiles:user_id (*)
        `)
        .order('submitted_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as T;
    }

    return [] as T;
  }

  async get<T>(endpointOrTable: string, options?: {
    select?: string;
    filters?: Record<string, any>;
    orderBy?: { column: string; ascending?: boolean };
    limit?: number;
  }): Promise<T> {
    if (endpointOrTable.startsWith('/api/')) {
      return this.handleRestEndpoint<T>(endpointOrTable);
    }

    let query = supabase.from(endpointOrTable).select(options?.select || '*');

    if (options?.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }

    if (options?.orderBy) {
      query = query.order(options.orderBy.column, { ascending: options.orderBy.ascending ?? true });
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as T;
  }

  async post<T>(endpointOrTable: string, data: any): Promise<T> {
    if (endpointOrTable.startsWith('/api/')) {
      if (endpointOrTable.includes('/auth/register') || endpointOrTable.includes('/auth/login')) {
        return {} as T;
      }
      
      const userRoute = this.parseUserRoute(endpointOrTable);
      if (userRoute && !userRoute.isSearch) {
        const { userId, subResource } = userRoute;
        
        switch (subResource) {
          case 'notes': {
            const { data: result, error } = await supabase
              .from('notes')
              .insert({ ...data, user_id: userId })
              .select()
              .single();
            if (error) throw error;
            return result as T;
          }
          case 'bookmarks': {
            const { data: result, error } = await supabase
              .from('bookmarks')
              .insert({ ...data, user_id: userId })
              .select()
              .single();
            if (error) throw error;
            return result as T;
          }
          case 'experience-logs': {
            const { data: result, error } = await supabase
              .from('experience_logs')
              .insert({ ...data, user_id: userId })
              .select()
              .single();
            if (error) throw error;
            return result as T;
          }
          default:
            throw new Error(`Unsupported POST subresource: ${subResource}`);
        }
      }

      if (endpointOrTable.startsWith('/api/notes')) {
        const { data: result, error } = await supabase.from('notes').insert(data).select().single();
        if (error) throw error;
        return result as T;
      }

      if (endpointOrTable.startsWith('/api/bookmarks')) {
        const { data: result, error } = await supabase.from('bookmarks').insert(data).select().single();
        if (error) throw error;
        return result as T;
      }

      if (endpointOrTable.startsWith('/api/forums')) {
        const { data: result, error } = await supabase.from('forum_posts').insert(data).select().single();
        if (error) throw error;
        return result as T;
      }

      if (endpointOrTable.startsWith('/api/quizzes')) {
        if (endpointOrTable.includes('/submit')) {
          const quizId = endpointOrTable.split('/')[3];
          const { data: result, error } = await supabase
            .from('quiz_submissions')
            .insert({
              quiz_id: quizId,
              user_id: data.user_id,
              answers: JSON.stringify(data.answers),
              score: data.score,
              max_score: data.max_score,
              submitted_at: new Date().toISOString(),
            })
            .select()
            .single();
          if (error) throw error;
          return result as T;
        }
        const { data: result, error } = await supabase.from('quizzes').insert(data).select().single();
        if (error) throw error;
        return result as T;
      }

      if (endpointOrTable.startsWith('/api/quiz-questions')) {
        const { data: result, error } = await supabase.from('quiz_questions').insert(data).select().single();
        if (error) throw error;
        return result as T;
      }

      if (endpointOrTable.startsWith('/api/quiz-options')) {
        const { data: result, error } = await supabase.from('quiz_options').insert(data).select().single();
        if (error) throw error;
        return result as T;
      }

      return {} as T;
    }

    const { data: result, error } = await supabase.from(endpointOrTable).insert(data).select().single();
    if (error) throw error;
    return result as T;
  }

  async put<T>(endpointOrTable: string, data: any, filters?: Record<string, any>): Promise<T> {
    if (endpointOrTable.startsWith('/api/')) {
      const userRoute = this.parseUserRoute(endpointOrTable);
      if (userRoute && !userRoute.isSearch) {
        const { userId, subResource, subId } = userRoute;

        switch (subResource) {
          case 'profile': {
            const { data: result, error } = await supabase
              .from('profiles')
              .upsert({ id: userId, ...data })
              .select()
              .single();
            if (error) throw error;
            return result as T;
          }
          case 'learning-dna': {
            const { data: existing } = await supabase
              .from('learning_dna_profiles')
              .select('id')
              .eq('user_id', userId)
              .maybeSingle();
            
            const recordId = existing?.id || userId;
            const { data: result, error } = await supabase
              .from('learning_dna_profiles')
              .upsert({ id: recordId, user_id: userId, ...data })
              .select()
              .single();
            if (error) throw error;
            return result as T;
          }
          case 'career-profile': {
            const { data: existing } = await supabase
              .from('career_profiles')
              .select('id')
              .eq('user_id', userId)
              .maybeSingle();

            const recordId = existing?.id || userId;
            const { data: result, error } = await supabase
              .from('career_profiles')
              .upsert({ id: recordId, user_id: userId, ...data })
              .select()
              .single();
            if (error) throw error;
            return result as T;
          }
          case 'academic-profile': {
            const { data: existing } = await supabase
              .from('academic_profiles')
              .select('id')
              .eq('user_id', userId)
              .maybeSingle();

            const recordId = existing?.id || userId;
            const { data: result, error } = await supabase
              .from('academic_profiles')
              .upsert({ id: recordId, user_id: userId, ...data })
              .select()
              .single();
            if (error) throw error;
            return result as T;
          }
          case 'resume': {
            const { data: existing } = await supabase
              .from('resumes')
              .select('id')
              .eq('user_id', userId)
              .maybeSingle();

            const recordId = existing?.id || userId;
            const { data: result, error } = await supabase
              .from('resumes')
              .upsert({ id: recordId, user_id: userId, ...data })
              .select()
              .single();
            if (error) throw error;
            return result as T;
          }
          case 'notes': {
            if (subId) {
              const { data: result, error } = await supabase
                .from('notes')
                .upsert({ id: subId, user_id: userId, ...data })
                .select()
                .single();
              if (error) throw error;
              return result as T;
            }
            throw new Error('Note ID is required for notes update');
          }
          case 'milestones': {
            if (subId) {
              if (subId === 'quiz') {
                const { data: result, error } = await supabase
                  .from('milestones')
                  .upsert({ user_id: userId, milestone_key: 'quiz', ...data })
                  .select();
                if (error) throw error;
                return result as T;
              }
              if (subId === 'reset') {
                const { data: result, error } = await supabase
                  .from('milestones')
                  .delete()
                  .eq('user_id', userId)
                  .select();
                if (error) throw error;
                return result as T;
              }
              const { data: result, error } = await supabase
                .from('milestones')
                .upsert({ user_id: userId, milestone_key: subId, ...data })
                .select();
              if (error) throw error;
              return result as T;
            }
            throw new Error('Milestone key is required for milestone update');
          }
          default:
            throw new Error(`Unsupported PUT subresource: ${subResource}`);
        }
      }

      const table = endpointOrTable.split('/')[2];
      let query = supabase.from(table).upsert(data).select();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }

      const { data: result, error } = await query;
      if (error) throw error;
      return result as T;
    }

    let query = supabase.from(endpointOrTable).upsert(data).select();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }

    const { data: result, error } = await query;
    if (error) throw error;
    return result as T;
  }

  async delete<T>(endpointOrTable: string, filters?: Record<string, any>): Promise<T> {
    if (endpointOrTable.startsWith('/api/')) {
      const userRoute = this.parseUserRoute(endpointOrTable);
      if (userRoute && !userRoute.isSearch) {
        const { userId, subResource, subId } = userRoute;

        switch (subResource) {
          case 'notes': {
            if (subId) {
              const { data, error } = await supabase
                .from('notes')
                .delete()
                .eq('id', subId)
                .eq('user_id', userId)
                .select();
              if (error) throw error;
              return data as T;
            }
            throw new Error('Note ID is required for deletion');
          }
          case 'bookmarks': {
            if (subId) {
              const { data, error } = await supabase
                .from('bookmarks')
                .delete()
                .eq('id', subId)
                .eq('user_id', userId)
                .select();
              if (error) throw error;
              return data as T;
            }
            let query = supabase.from('bookmarks').delete().eq('user_id', userId);
            if (filters) {
              Object.entries(filters).forEach(([key, value]) => {
                query = query.eq(key, value);
              });
            }
            const { data, error } = await query.select();
            if (error) throw error;
            return data as T;
          }
          default:
            throw new Error(`Unsupported DELETE subresource: ${subResource}`);
        }
      }

      const table = endpointOrTable.split('/')[2];
      let query = supabase.from(table).delete();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }

      const { data, error } = await query.select();
      if (error) throw error;
      return data as T;
    }

    let query = supabase.from(endpointOrTable).delete();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }

    const { data, error } = await query.select();
    if (error) throw error;
    return data as T;
  }

  async uploadFile(bucket: string, path: string, file: File): Promise<any> {
    const { data, error } = await supabase.storage.from(bucket).upload(path, file);
    if (error) throw error;
    return data;
  }

  async getPublicUrl(bucket: string, path: string): Promise<string> {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }
}

export const apiClient = new ApiClient();
