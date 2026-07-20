import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export function useForumPosts(category?: string) {
  return useQuery({
    queryKey: ["forum_posts", category],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (category && category !== "All Topics") {
        params.append("category", category);
      }
      const queryString = params.toString();
      const endpoint = `/api/forum/posts${queryString ? `?${queryString}` : ''}`;
      return apiClient.get<any[]>(endpoint);
    },
  });
}

export function useCreateForumPost() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (post: { title: string; content: string; category?: string }) => {
      await apiClient.post('/api/forum/posts', { ...post, author_id: user!.id });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["forum_posts"] });
      toast.success("Discussion started!");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useForumReplies(postId: string) {
  return useQuery({
    queryKey: ["forum_replies", postId],
    queryFn: async () => {
      return apiClient.get<any[]>(`/api/forum/posts/${postId}/replies`);
    },
    enabled: !!postId,
  });
}


export function useCreateForumReply() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ postId, content }: { postId: string; content: string }) => {
      await apiClient.post(`/api/forum/posts/${postId}/replies`, { post_id: postId, author_id: user!.id, content });
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["forum_replies", vars.postId] });
      qc.invalidateQueries({ queryKey: ["forum_posts"] });
    },
    onError: (e: any) => toast.error(e.message),
  });
}
