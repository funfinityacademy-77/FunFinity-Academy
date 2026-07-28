import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import type { Course, Lesson, Enrollment } from "@/types/database";

export function useCourses(filters?: { subject?: string; search?: string }) {
  return useQuery({
    queryKey: ["courses", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.subject && filters.subject !== "All") {
        params.append("subject", filters.subject);
      }
      if (filters?.search) {
        params.append("search", filters.search);
      }
      
      const queryString = params.toString();
      const endpoint = `/api/courses${queryString ? `?${queryString}` : ''}`;
      
      return apiClient.get<Course[]>(endpoint);
    },
  });
}

export function useCourseDetail(courseId: string) {
  return useQuery({
    queryKey: ["course", courseId],
    queryFn: async () => {
      return apiClient.get<Course>(`/api/courses/${courseId}`);
    },
    enabled: !!courseId,
  });
}

export function useCourseLessons(courseId: string) {
  return useQuery({
    queryKey: ["lessons", courseId],
    queryFn: async () => {
      return apiClient.get<Lesson[]>(`/api/courses/${courseId}/lessons`);
    },
    enabled: !!courseId,
  });
}

export function useEnrollments() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["enrollments", user?.id],
    queryFn: async () => {
      try {
        return await apiClient.get<Enrollment[]>(`/api/users/${user!.id}/enrollments`);
      } catch (error) {
        console.error('Failed to load enrollments:', error);
        return [];
      }
    },
    enabled: !!user,
  });
}

export function useEnrollInCourse() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (courseId: string) => {
      await apiClient.post(`/api/courses/${courseId}/enroll`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["enrollments"] });
      toast.success("Enrolled successfully!");
    },
    onError: (e: any, _variables: any) => toast.error(e.message),
  });
}

export function useUnenrollFromCourse() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (courseId: string) => {
      await apiClient.delete(`/api/courses/${courseId}/enroll`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["enrollments"] });
      toast.success("Unenrolled successfully!");
    },
    onError: (e: any, _variables: any) => toast.error(e.message),
  });
}
