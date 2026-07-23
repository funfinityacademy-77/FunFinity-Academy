import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import { toast } from "sonner";
import { useNotifications } from "@/hooks/use-notifications";
import type { Conversation, Message, ConversationMember } from "@/types/database";

export const PREDEFINED_RESPONSES = [
  "Understood",
  "I will complete this",
  "I'm working on it",
  "Need help",
  "Can you explain more?",
  "Thank you",
  "I have a question"
];

export const getContextAwareResponses = (lastMessage: string) => {
  const msg = lastMessage.toLowerCase();
  if (msg.includes("assignment") || msg.includes("homework") || msg.includes("submit")) {
    return ["I will submit on time", "I need more time", "I have a question about the task"];
  }
  if (msg.includes("meeting") || msg.includes("class") || msg.includes("call")) {
    return ["I will be there", "I cannot attend", "What is the time?"];
  }
  if (msg.includes("grade") || msg.includes("score") || msg.includes("result")) {
    return ["Thank you for the feedback", "Can we discuss this?", "I will improve next time"];
  }
  return [];
};


export function useConversations() {
  const { user, role } = useAuth();
  const qc = useQueryClient();

  // Realtime subscription for conversations list - TODO: Replace with WebSocket to Durable Objects
  useEffect(() => {
    if (!user) return;
    
    // For now, disable realtime subscription until WebSocket implementation
    
    return () => { /* cleanup */ };
  }, [user, qc]);

  return useQuery({
    queryKey: ["conversations", user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Fetch conversations via API
      return apiClient.get<any[]>(`/api/users/${user.id}/conversations?role=${role}`);
    },
    enabled: !!user,
  });
}

export function useSearchUsers(query: string) {
  return useQuery({
    queryKey: ["search_users", query],
    queryFn: async () => {
      if (!query || query.length < 2) return [];
      return apiClient.get<any[]>(`/api/users/search?q=${query}&limit=10`);
    },
    enabled: query.length > 1
  });
}

export function useUpdateConversationStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await apiClient.put(`/api/conversations/${id}`, { type: status });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["conversations"] })
  });
}

export function useChatRealtimeNotifications() {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const qc = useQueryClient();

  // TODO: Replace with WebSocket to Durable Objects for realtime notifications
  useEffect(() => {
    if (!user) return;
    // Realtime notifications will be implemented via WebSocket to Durable Objects
    return () => { /* cleanup */ };
  }, [user, addNotification, qc]);
}

export function useMessages(conversationId: string | null) {
  const qc = useQueryClient();

  // TODO: Replace with WebSocket to Durable Objects for realtime messages
  useEffect(() => {
    if (!conversationId) return;
    // Realtime messages will be implemented via WebSocket to Durable Objects
    return () => { /* cleanup */ };
  }, [conversationId, qc]);

  return useQuery({
    queryKey: ["messages", conversationId],
    queryFn: async () => {
      return apiClient.get<Message[]>(`/api/conversations/${conversationId}/messages`);
    },
    enabled: !!conversationId,
  });
}

export function useSendMessage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ conversationId, content }: { conversationId: string; content: string }) => {
      await apiClient.post(`/api/conversations/${conversationId}/messages`, {
        content,
        sender_id: user!.id,
      });
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["messages", vars.conversationId] });
      qc.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useCreateConversation() {
  const { user, role: currentUserRole } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, memberIds, otherUserRole }: { name?: string; memberIds: string[]; otherUserRole?: string }) => {
      // Determine connection type logic
      let type = "direct";
      
      if (currentUserRole === "admin" || otherUserRole === "admin") {
        type = "direct";
      } else if (currentUserRole === "student" && otherUserRole === "student") {
        type = "pending_student";
      } else if ((currentUserRole === "parent" && otherUserRole === "student") || (currentUserRole === "student" && otherUserRole === "parent")) {
        type = "direct"; // Auto-connect Parent <-> Student
      } else {
        type = "direct";
      }

      // Create conversation via API
      return apiClient.post<any>('/api/conversations', {
        name,
        type,
        created_by: user!.id,
        member_ids: [user!.id, ...memberIds],
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["conversations"] });
      toast.success("Chat created or request sent!");
    },
    onError: (e: any) => toast.error(e.message),
  });
}
