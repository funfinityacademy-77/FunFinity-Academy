import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export function useQuizzes() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["quizzes", user?.id],
    queryFn: async () => {
      if (!user) return [];
      return apiClient.get<any[]>(`/api/users/${user.id}/quizzes`);
    },
    enabled: !!user,
  });
}

export function useQuizQuestions(quizId: string) {
  return useQuery({
    queryKey: ["quiz_questions", quizId],
    queryFn: async () => {
      return apiClient.get<any[]>(`/api/quizzes/${quizId}/questions`);
    },
    enabled: !!quizId,
  });
}

export function useQuizSubmissions() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["quiz_submissions", user?.id],
    queryFn: async () => {
      return apiClient.get<any[]>(`/api/users/${user!.id}/quiz-attempts`);
    },
    enabled: !!user,
  });
}

export function useSubmitQuiz() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ quizId, answers, score, maxScore }: { 
      quizId: string; 
      answers: Record<string, string>; 
      score: number; 
      maxScore: number;
    }) => {
      await apiClient.post(`/api/quizzes/${quizId}/submit`, {
        user_id: user!.id,
        answers,
        score,
        max_score: maxScore,
        passed: score >= 70,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["quiz_submissions"] });
      toast.success("Quiz submitted successfully!");
    },
    onError: (e: any) => toast.error(e.message),
  });
}
