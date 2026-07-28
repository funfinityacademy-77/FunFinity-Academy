import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import type { Bookmark } from "@/types/database";

export function useBookmarks() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["bookmarks", user?.id],
    queryFn: async () => {
      return apiClient.get<Bookmark[]>(`/api/users/${user!.id}/bookmarks`);
    },
    enabled: !!user,
  });
}

export function useAddBookmark() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (bookmark: { resource_type: string; resource_id?: string; title: string; url?: string }) => {
      await apiClient.post(`/api/users/${user!.id}/bookmarks`, { ...bookmark, user_id: user!.id });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bookmarks"] });
      toast.success("Bookmarked!");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useRemoveBookmark() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/api/bookmarks/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bookmarks"] });
      toast.success("Bookmark removed");
    },
    onError: (e: any) => toast.error(e.message),
  });
}
