import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import type { Note } from "@/types/database";

export function useNotes() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["notes", user?.id],
    queryFn: async () => {
      return apiClient.get<Note[]>(`/api/users/${user!.id}/notes`);
    },
    enabled: !!user,
  });
}

export function useCreateNote() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (note: { title: string; content?: string; tags?: string[]; is_pinned?: boolean; course_id?: string }) => {
      return apiClient.post<Note>(`/api/users/${user!.id}/notes`, { ...note, user_id: user!.id });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notes"] }),
    onError: (e: any) => toast.error(e.message),
  });
}

export function useUpdateNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; title?: string; content?: string; tags?: string[]; is_pinned?: boolean }) => {
      await apiClient.put(`/api/notes/${id}`, updates);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notes"] }),
    onError: (e: any) => toast.error(e.message),
  });
}

export function useDeleteNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/api/notes/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notes"] }),
    onError: (e: any) => toast.error(e.message),
  });
}
