import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/hooks/use-auth";

export type LearningGoal =
  | "exam-preparation"
  | "skill-building"
  | "career-readiness"
  | "project-work"
  | "confidence";

export type LearningStyle = "visual" | "text-based" | "practice-based";
export type DifficultyPreference = "beginner" | "intermediate" | "advanced";
export type StudyPace = "slow" | "moderate" | "fast";

export interface StudentPreferences {
  onboardingCompleted: boolean;
  learningGoals: LearningGoal[];
  preferredLearningStyle: LearningStyle;
  difficultyPreference: DifficultyPreference;
  studyPace: StudyPace;
  interests: string[];
  completedAt: string;
  updatedAt: string;
}

export interface StudentPreferencesInput {
  learningGoals: LearningGoal[];
  preferredLearningStyle: LearningStyle;
  difficultyPreference: DifficultyPreference;
  studyPace: StudyPace;
  interests?: string[];
}

export const STUDENT_GOAL_OPTIONS: Array<{ value: LearningGoal; label: string; description: string }> = [
  { value: "exam-preparation", label: "Exam Preparation", description: "Prioritize revision plans and confidence checks." },
  { value: "skill-building", label: "Skill Building", description: "Focus on practice, repetition, and mastery." },
  { value: "career-readiness", label: "Career Readiness", description: "Connect learning to future roles and pathways." },
  { value: "project-work", label: "Project Work", description: "Learn by building and applying concepts." },
  { value: "confidence", label: "Confidence", description: "Strengthen clarity, pacing, and steady progress." },
];

export const LEARNING_STYLE_OPTIONS: Array<{ value: LearningStyle; label: string; description: string }> = [
  { value: "visual", label: "Visual", description: "Prefer diagrams, examples, and visual breakdowns." },
  { value: "text-based", label: "Text-Based", description: "Prefer written explanations, notes, and summaries." },
  { value: "practice-based", label: "Practice-Based", description: "Prefer drills, worked examples, and exercises." },
];

export const DIFFICULTY_OPTIONS: Array<{ value: DifficultyPreference; label: string; description: string }> = [
  { value: "beginner", label: "Beginner", description: "Start with fundamentals and guided explanations." },
  { value: "intermediate", label: "Intermediate", description: "Balance concept review with applied work." },
  { value: "advanced", label: "Advanced", description: "Move quickly into deeper analysis and challenge." },
];

export const STUDY_PACE_OPTIONS: Array<{ value: StudyPace; label: string; description: string }> = [
  { value: "slow", label: "Slow", description: "More scaffolding, reflection, and review." },
  { value: "moderate", label: "Moderate", description: "A balanced pace for steady progress." },
  { value: "fast", label: "Fast", description: "Condensed steps, fewer pauses, and stronger challenge." },
];

export const INTEREST_SUGGESTIONS = [
  "Mathematics",
  "Science",
  "Coding",
  "History",
  "Languages",
  "Design",
  "Business",
  "Writing",
];

interface StudentPreferencesContextValue {
  loading: boolean;
  preferences: StudentPreferences | null;
  needsOnboarding: boolean;
  replayRequested: boolean;
  completeOnboarding: (input: StudentPreferencesInput) => void;
  updatePreferences: (updates: Partial<StudentPreferencesInput>) => void;
  requestReplay: () => void;
  clearReplayRequest: () => void;
}

const StudentPreferencesContext = createContext<StudentPreferencesContextValue | undefined>(undefined);

function getPreferencesKey(userId: string) {
  return `funfinity-student-preferences:${userId}`;
}

function getReplayKey(userId: string) {
  return `funfinity-student-onboarding-replay:${userId}`;
}

function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function normalizeInterests(interests?: string[]) {
  return Array.from(
    new Set(
      (interests || [])
        .map((interest) => interest.trim())
        .filter(Boolean),
    ),
  );
}

function normalizePreferences(input: StudentPreferencesInput, base?: StudentPreferences | null): StudentPreferences {
  const timestamp = new Date().toISOString();

  return {
    onboardingCompleted: true,
    learningGoals: input.learningGoals,
    preferredLearningStyle: input.preferredLearningStyle,
    difficultyPreference: input.difficultyPreference,
    studyPace: input.studyPace,
    interests: normalizeInterests(input.interests),
    completedAt: base?.completedAt || timestamp,
    updatedAt: timestamp,
  };
}

export function StudentPreferencesProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [preferences, setPreferences] = useState<StudentPreferences | null>(null);
  const [replayRequested, setReplayRequested] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      setPreferences(null);
      setReplayRequested(false);
      setLoading(false);
      return;
    }

    const nextPreferences = readJson<StudentPreferences>(getPreferencesKey(user.id));
    const nextReplay = localStorage.getItem(getReplayKey(user.id)) === "true";

    setPreferences(nextPreferences);
    setReplayRequested(nextReplay);
    setLoading(false);
  }, [authLoading, user]);

  const persistPreferences = useCallback(
    (value: StudentPreferences | null) => {
      if (!user) {
        return;
      }

      const key = getPreferencesKey(user.id);
      if (!value) {
        localStorage.removeItem(key);
        return;
      }

      localStorage.setItem(key, JSON.stringify(value));
    },
    [user],
  );

  const completeOnboarding = useCallback(
    (input: StudentPreferencesInput) => {
      const nextValue = normalizePreferences(input, preferences);
      setPreferences(nextValue);
      persistPreferences(nextValue);

      if (user) {
        localStorage.removeItem(getReplayKey(user.id));
      }
      setReplayRequested(false);
    },
    [persistPreferences, preferences, user],
  );

  const updatePreferences = useCallback(
    (updates: Partial<StudentPreferencesInput>) => {
      if (!preferences) {
        return;
      }

      const nextValue = normalizePreferences(
        {
          learningGoals: updates.learningGoals || preferences.learningGoals,
          preferredLearningStyle: updates.preferredLearningStyle || preferences.preferredLearningStyle,
          difficultyPreference: updates.difficultyPreference || preferences.difficultyPreference,
          studyPace: updates.studyPace || preferences.studyPace,
          interests: updates.interests || preferences.interests,
        },
        preferences,
      );

      setPreferences(nextValue);
      persistPreferences(nextValue);
    },
    [persistPreferences, preferences],
  );

  const requestReplay = useCallback(() => {
    if (!user) {
      return;
    }

    localStorage.setItem(getReplayKey(user.id), "true");
    setReplayRequested(true);
  }, [user]);

  const clearReplayRequest = useCallback(() => {
    if (!user) {
      return;
    }

    localStorage.removeItem(getReplayKey(user.id));
    setReplayRequested(false);
  }, [user]);

  const value = useMemo(
    () => ({
      loading,
      preferences,
      needsOnboarding: Boolean(user) && !preferences?.onboardingCompleted,
      replayRequested,
      completeOnboarding,
      updatePreferences,
      requestReplay,
      clearReplayRequest,
    }),
    [clearReplayRequest, completeOnboarding, loading, preferences, replayRequested, requestReplay, updatePreferences, user],
  );

  return <StudentPreferencesContext.Provider value={value}>{children}</StudentPreferencesContext.Provider>;
}

export function useStudentPreferences() {
  const context = useContext(StudentPreferencesContext);

  if (!context) {
    throw new Error("useStudentPreferences must be used within StudentPreferencesProvider");
  }

  return context;
}

export function formatStudentPreferenceSummary(preferences: StudentPreferences | null) {
  if (!preferences) {
    return "No student preferences set.";
  }

  return [
    `Goals: ${preferences.learningGoals.join(", ") || "Not set"}`,
    `Learning style: ${preferences.preferredLearningStyle}`,
    `Difficulty preference: ${preferences.difficultyPreference}`,
    `Study pace: ${preferences.studyPace}`,
    `Interests: ${preferences.interests.join(", ") || "Not set"}`,
  ].join("\n");
}
