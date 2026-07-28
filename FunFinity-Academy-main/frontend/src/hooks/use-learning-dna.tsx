import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/hooks/use-auth";
import type { LearningDNAProfile as DBLearningDNAProfile } from "@/types/database";

export interface LearningDNAProfile {
  id?: string;
  user_id?: string;
  completed: boolean;
  has_adhd: boolean;
  has_dyslexia: boolean;
  has_anxiety: boolean;
  has_dyscalculia: boolean;
  has_asd: boolean;
  preferred_font: string;
  reduced_motion: boolean;
  high_contrast: boolean;
  focus_mode: string;
  session_length: string;
  break_frequency: string;
  content_density: string;
  color_overlay: string;
  recommended_strategies: string[];
  show_onboarding: boolean;
  achievement_emails: boolean;
}

const defaultProfile: LearningDNAProfile = {
  completed: false,
  has_adhd: false,
  has_dyslexia: false,
  has_anxiety: false,
  has_dyscalculia: false,
  has_asd: false,
  preferred_font: "default",
  reduced_motion: false,
  high_contrast: false,
  focus_mode: "steady",
  session_length: "medium",
  break_frequency: "normal",
  content_density: "standard",
  color_overlay: "none",
  recommended_strategies: [],
  show_onboarding: true,
  achievement_emails: true,
};

interface LearningDNAContextType {
  profile: LearningDNAProfile;
  loading: boolean;
  saving: boolean;
  saveProfile: (updates: Partial<LearningDNAProfile>) => Promise<void>;
  generateRecommendations: (profile: Partial<LearningDNAProfile>) => string[];
}

const LearningDNAContext = createContext<LearningDNAContextType>({
  profile: defaultProfile,
  loading: true,
  saving: false,
  saveProfile: async () => {},
  generateRecommendations: () => [],
});

export function generateRecommendations(p: Partial<LearningDNAProfile>): string[] {
  const strategies: string[] = [];
  
  if (p.has_adhd) {
    strategies.push(
      "Break study sessions into 15-20 min focus blocks",
      "Use visual timers to track progress",
      "Enable focus mode to reduce distractions",
      "Take movement breaks between sessions",
      "Use color-coded notes for organization"
    );
  }
  if (p.has_dyslexia) {
    strategies.push(
      "Enable OpenDyslexic font for easier reading",
      "Use text-to-speech for longer passages",
      "Apply color overlays to reduce visual stress",
      "Break text into smaller chunks",
      "Use multi-sensory learning approaches"
    );
  }
  if (p.has_anxiety) {
    strategies.push(
      "Start with low-stakes practice exercises",
      "Use breathing exercises before assessments",
      "Set flexible deadlines when possible",
      "Enable calming color themes",
      "Break large tasks into smaller milestones"
    );
  }
  if (p.has_dyscalculia) {
    strategies.push(
      "Use visual representations for math concepts",
      "Enable step-by-step problem walkthroughs",
      "Practice with manipulatives and visual aids",
      "Use graph paper or grid overlays",
      "Connect math to real-world examples"
    );
  }
  if (p.has_asd) {
    strategies.push(
      "Follow a consistent daily routine",
      "Use clear, structured instructions",
      "Minimize sensory distractions",
      "Provide advance notice of schedule changes",
      "Use visual schedules and checklists"
    );
  }

  if (strategies.length === 0) {
    strategies.push(
      "Set daily learning goals",
      "Review material before bed for better retention",
      "Use active recall techniques",
      "Take regular breaks using the Pomodoro method"
    );
  }

  return strategies;
}

export function LearningDNAProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<LearningDNAProfile>(defaultProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      setProfile(defaultProfile);
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const data = await apiClient.get<DBLearningDNAProfile | null>(`/api/users/${user.id}/learning-dna`);
        if (data) {
          setProfile({ 
            ...defaultProfile, 
            ...data,
            has_adhd: Boolean(data.has_adhd),
            has_dyslexia: Boolean(data.has_dyslexia),
            has_dyscalculia: Boolean(data.has_dyscalculia),
            has_asd: Boolean(data.has_asd),
            has_anxiety: Boolean(data.has_anxiety),
            completed: Boolean(data.completed),
            reduced_motion: Boolean(data.reduced_motion),
            high_contrast: Boolean(data.high_contrast),
            show_onboarding: Boolean(data.show_onboarding),
            achievement_emails: Boolean(data.achievement_emails),
            recommended_strategies: (data.recommended_strategies as unknown as string[]) || [],
          } as LearningDNAProfile);
        }
      } catch (error) {
        console.error("Error fetching learning DNA profile:", error);
        setProfile(defaultProfile);
      }
      setLoading(false);
    };

    fetchProfile();

    // TODO: Replace with WebSocket to Durable Objects for realtime updates
    return () => { /* cleanup */ };
  }, [user]);

  // Apply Learning Differences to the application root
  useEffect(() => {
    const root = document.documentElement;
    
    // Dyslexia: Apply specialized font
    root.classList.toggle("dyslexia-font", profile.has_dyslexia || profile.preferred_font === "dyslexic");
    
    // ADHD: Reduce motion to minimize distractions
    root.classList.toggle("reduce-motion", profile.has_adhd || profile.reduced_motion);
    
    // High Contrast
    root.classList.toggle("high-contrast", profile.high_contrast);

    // High Anxiety: Apply calming color tones (handled via CSS class)
    root.classList.toggle("calm-mode", profile.has_anxiety);

    // ASD: Simplify animations further
    if (profile.has_asd) {
      root.style.setProperty('--glass-blur', '4px'); // Reduce blur complexity
    } else {
      root.style.removeProperty('--glass-blur');
    }

  }, [profile]);

  const saveProfile = useCallback(async (updates: Partial<LearningDNAProfile>) => {
    if (!user) return;
    setSaving(true);

    const merged = { ...profile, ...updates };
    const recs = generateRecommendations(merged);
    const payload = {
      ...updates,
      recommended_strategies: recs,
      user_id: user.id,
    };

    try {
      await apiClient.put(`/api/users/${user.id}/learning-dna`, payload);
    } catch (error) {
      console.error("Error saving learning DNA profile:", error);
    }

    // Mark DNA complete in localStorage immediately
    if (updates.completed && user) {
      try {
        const lsKey = `funfinity_onboarding_${user.id}`;
        const existing = JSON.parse(localStorage.getItem(lsKey) || '{}');
        const updated = { ...existing, dna_complete: true };
        localStorage.setItem(lsKey, JSON.stringify(updated));
        window.dispatchEvent(new StorageEvent('storage', { key: lsKey, newValue: JSON.stringify(updated) }));
      } catch { /* ignore */ }
    }

    // Also update the main profiles table if completed
    if (updates.completed) {
      try {
        await apiClient.put(`/api/users/${user.id}/profile`, { 
          dna_complete: true, 
          dna_completed_at: new Date().toISOString() 
        });
      } catch { /* offline is fine */ }
    }

    setProfile((prev) => ({ ...prev, ...updates, recommended_strategies: recs }));
    setSaving(false);
  }, [user, profile]);

  return (
    <LearningDNAContext.Provider value={{ profile, loading, saving, saveProfile, generateRecommendations }}>
      {children}
    </LearningDNAContext.Provider>
  );
}

export const useLearningDNA = () => useContext(LearningDNAContext);
