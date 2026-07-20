import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import type { Announcement } from "@/types/database";

export function useAnnouncements() {
  return useQuery({
    queryKey: ["announcements"],
    queryFn: async () => {
      return apiClient.get<Announcement[]>('/api/announcements');
    },
  });
}

export function useCreateAnnouncement() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (announcement: { title: string; content: string; target_role?: string; priority?: string }) => {
      await apiClient.post('/api/announcements', { ...announcement, author_id: user!.id });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["announcements"] });
      toast.success("Announcement published!");
    },
    onError: (e: any) => toast.error(e.message),
  });
}
