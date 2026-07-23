import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "./use-auth";
import type { CareerProfile as DBCareerProfile, ExperienceLog as DBExperienceLog, Milestone as DBMilestone } from "@/types/database";

export type CareerCluster = "STEM" | "Arts" | "Business" | "Healthcare" | "Trades" | "Public Service";

export interface QuizQuestion {
  id: number;
  optionA: { text: string; clusters: CareerCluster[] };
  optionB: { text: string; clusters: CareerCluster[] };
}

export interface Opportunity {
  id: string;
  title: string;
  category: CareerCluster;
  description: string;
  requirements: string[];
  location: string;
  type: "Internship" | "Volunteer" | "Scholarship" | "Workshop" | "Job Shadow" | "Mentorship";
}

export interface ExperienceLog {
  id: string;
  title: string;
  type: string;
  date: string;
  hours: number;
  supervisor_email: string;
  reflection: string;
  status: string;
  created_at: string;
  user_id: string;
}

export interface Milestone {
  id: string;
  milestone_key: string;
  label: string;
  description: string;
  completed: boolean;
  completed_at: string | null;
  icon: string;
}

export interface CareerProfile {
  careerInterests: CareerCluster[];
  personalityType: string;
  totalLoggedHours: number;
  quizCompleted: boolean;
  quizResults: Record<CareerCluster, number>;
  savedOpportunities: string[];
  experienceLogs: ExperienceLog[];
  milestones: Milestone[];
}

const defaultQuizResults: Record<CareerCluster, number> = {
  STEM: 0, Arts: 0, Business: 0, Healthcare: 0, Trades: 0, "Public Service": 0,
};

const defaultProfile: CareerProfile = {
  careerInterests: [],
  personalityType: "",
  totalLoggedHours: 0,
  quizCompleted: false,
  quizResults: { ...defaultQuizResults },
  savedOpportunities: [],
  experienceLogs: [],
  milestones: [],
};

export const quizQuestions: QuizQuestion[] = [
  { id: 1, optionA: { text: "Build a robot that solves problems", clusters: ["STEM", "Trades"] }, optionB: { text: "Design a mural for a community center", clusters: ["Arts", "Public Service"] } },
  { id: 2, optionA: { text: "Start a small business selling crafts", clusters: ["Business", "Arts"] }, optionB: { text: "Volunteer at a hospital or clinic", clusters: ["Healthcare", "Public Service"] } },
  { id: 3, optionA: { text: "Write code for a mobile app", clusters: ["STEM", "Business"] }, optionB: { text: "Fix and restore a classic car engine", clusters: ["Trades"] } },
  { id: 4, optionA: { text: "Lead a fundraiser for a local charity", clusters: ["Public Service", "Business"] }, optionB: { text: "Conduct a science experiment", clusters: ["STEM", "Healthcare"] } },
  { id: 5, optionA: { text: "Create a short film or documentary", clusters: ["Arts"] }, optionB: { text: "Install solar panels on a house", clusters: ["Trades", "STEM"] } },
  { id: 6, optionA: { text: "Manage a team project at school", clusters: ["Business", "Public Service"] }, optionB: { text: "Study human anatomy and medicine", clusters: ["Healthcare", "STEM"] } },
  { id: 7, optionA: { text: "Compose music or write poetry", clusters: ["Arts"] }, optionB: { text: "Build furniture or renovate a room", clusters: ["Trades"] } },
  { id: 8, optionA: { text: "Analyze stock market data", clusters: ["Business", "STEM"] }, optionB: { text: "Organize a community cleanup event", clusters: ["Public Service"] } },
  { id: 9, optionA: { text: "Research new medical treatments", clusters: ["Healthcare", "STEM"] }, optionB: { text: "Perform on stage in a play or concert", clusters: ["Arts"] } },
  { id: 10, optionA: { text: "Wire the electrical systems in a building", clusters: ["Trades", "STEM"] }, optionB: { text: "Counsel and support people in need", clusters: ["Healthcare", "Public Service"] } },
  { id: 11, optionA: { text: "Design a sustainable city infrastructure", clusters: ["STEM", "Public Service"] }, optionB: { text: "Create marketing campaigns for a brand", clusters: ["Business", "Arts"] } },
  { id: 12, optionA: { text: "Teach children how to read and write", clusters: ["Public Service", "Healthcare"] }, optionB: { text: "Develop video games and animations", clusters: ["STEM", "Arts"] } },
  { id: 13, optionA: { text: "Run a farm-to-table restaurant", clusters: ["Business", "Trades"] }, optionB: { text: "Advocate for environmental policies", clusters: ["Public Service", "STEM"] } },
  { id: 14, optionA: { text: "Design fashion clothing and accessories", clusters: ["Arts", "Business"] }, optionB: { text: "Provide physical therapy to patients", clusters: ["Healthcare"] } },
  { id: 15, optionA: { text: "Build and maintain computer networks", clusters: ["STEM", "Trades"] }, optionB: { text: "Organize political campaigns", clusters: ["Public Service", "Business"] } },
  { id: 16, optionA: { text: "Create sculptures and pottery", clusters: ["Arts"] }, optionB: { text: "Work as an EMT or paramedic", clusters: ["Healthcare", "Public Service"] } },
  { id: 17, optionA: { text: "Invest in real estate and properties", clusters: ["Business"] }, optionB: { text: "Conduct archaeological excavations", clusters: ["STEM", "Public Service"] } },
  { id: 18, optionA: { text: "Weld and fabricate metal structures", clusters: ["Trades", "STEM"] }, optionB: { text: "Write and publish novels", clusters: ["Arts"] } },
  { id: 19, optionA: { text: "Manage a nonprofit organization", clusters: ["Public Service", "Business"] }, optionB: { text: "Research genetic engineering", clusters: ["STEM", "Healthcare"] } },
  { id: 20, optionA: { text: "Photograph weddings and events", clusters: ["Arts", "Business"] }, optionB: { text: "Install plumbing and HVAC systems", clusters: ["Trades"] } },
  { id: 21, optionA: { text: "Develop artificial intelligence algorithms", clusters: ["STEM", "Business"] }, optionB: { text: "Provide legal aid to underserved communities", clusters: ["Public Service"] } },
  { id: 22, optionA: { text: "Create graphic novels and comics", clusters: ["Arts"] }, optionB: { text: "Work as a dental hygienist", clusters: ["Healthcare"] } },
  { id: 23, optionA: { text: "Start a construction company", clusters: ["Business", "Trades"] }, optionB: { text: "Conduct climate change research", clusters: ["STEM", "Public Service"] } },
  { id: 24, optionA: { text: "Choreograph dance performances", clusters: ["Arts"] }, optionB: { text: "Work as a veterinary technician", clusters: ["Healthcare", "STEM"] } },
  { id: 25, optionA: { text: "Manage investment portfolios", clusters: ["Business", "STEM"] }, optionB: { text: "Teach special education students", clusters: ["Public Service", "Healthcare"] } },
];

export const allOpportunities: Opportunity[] = [
  { id: "opp1", title: "NASA STEM Summer Internship", category: "STEM", description: "Work alongside NASA engineers on real aerospace projects.", requirements: ["GPA 3.0+", "Grade 10+", "Science coursework"], location: "Remote / Houston, TX", type: "Internship" },
  { id: "opp2", title: "City Youth Arts Apprenticeship", category: "Arts", description: "Apprentice under local artists creating public installations.", requirements: ["Portfolio submission", "Grade 9+"], location: "Local", type: "Internship" },
  { id: "opp3", title: "Junior Achievement Business Camp", category: "Business", description: "Learn entrepreneurship, marketing, and financial literacy.", requirements: ["Application essay", "Grade 8+"], location: "Virtual", type: "Workshop" },
  { id: "opp4", title: "Red Cross First Aid Volunteer", category: "Healthcare", description: "Train in first aid and assist at community health fairs.", requirements: ["Age 14+", "Background check"], location: "Local chapters", type: "Volunteer" },
  { id: "opp5", title: "Habitat for Humanity Build Day", category: "Trades", description: "Hands-on construction experience building homes for families.", requirements: ["Age 16+", "Signed waiver"], location: "Local", type: "Volunteer" },
  { id: "opp6", title: "City Council Youth Advisory Board", category: "Public Service", description: "Advise city council on policies affecting young people.", requirements: ["Application", "Teacher recommendation"], location: "City Hall", type: "Mentorship" },
  { id: "opp7", title: "Google Code Next Program", category: "STEM", description: "Free computer science education and mentorship from Google engineers.", requirements: ["Grade 9-12", "Interest in CS"], location: "Virtual / Select cities", type: "Mentorship" },
  { id: "opp8", title: "Scholastic Art & Writing Awards", category: "Arts", description: "National competition for creative teens with scholarship prizes.", requirements: ["Grades 7-12", "Original work"], location: "National", type: "Scholarship" },
  { id: "opp9", title: "DECA Business Competition", category: "Business", description: "Compete in marketing, finance, and management challenges.", requirements: ["DECA membership", "School chapter"], location: "Regional / National", type: "Workshop" },
  { id: "opp10", title: "Hospital Candy Striper Program", category: "Healthcare", description: "Shadow nurses and support patient care in a real hospital.", requirements: ["Age 14+", "Orientation required"], location: "Local hospital", type: "Job Shadow" },
  { id: "opp11", title: "Plumbing & HVAC Pre-Apprenticeship", category: "Trades", description: "Learn plumbing and HVAC basics from certified professionals.", requirements: ["Age 16+", "Math proficiency"], location: "Trade school", type: "Workshop" },
  { id: "opp12", title: "Model United Nations Conference", category: "Public Service", description: "Debate global issues and develop diplomacy and public speaking skills.", requirements: ["Grade 9+", "Research paper"], location: "Regional", type: "Workshop" },
];

interface CareerContextType {
  profile: CareerProfile;
  loading: boolean;
  completeQuiz: (results: Record<CareerCluster, number>) => Promise<void>;
  toggleSaveOpportunity: (id: string) => Promise<void>;
  addExperienceLog: (log: { title: string; type: string; date: string; hours: number; supervisorEmail: string; reflection: string }) => Promise<void>;
  completeMilestone: (key: string) => Promise<void>;
  getTopClusters: () => CareerCluster[];
  getRecommendedOpportunities: () => Opportunity[];
  getCompletionPercentage: () => number;
  resetQuiz: () => Promise<void>;
  resetRoadmap: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const CareerContext = createContext<CareerContextType | undefined>(undefined);

export function CareerProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const user = auth?.user;
  const [profile, setProfile] = useState<CareerProfile>(defaultProfile);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(defaultProfile);
      setLoading(false);
      return;
    }

    try {
      const [careerData, logsData, milestonesData] = await Promise.all([
        apiClient.get<DBCareerProfile | null>(`/api/users/${user.id}/career-profile`).catch(() => null),
        apiClient.get<DBExperienceLog[]>(`/api/users/${user.id}/experience-logs`).catch(() => []),
        apiClient.get<DBMilestone[]>(`/api/users/${user.id}/milestones`).catch(() => []),
      ]);

      const cp = careerData;
      const logs = logsData || [];
      const milestones = milestonesData || [];

      if (cp) {
        const quizResults = (cp.quiz_results as unknown as Record<CareerCluster, number>) || { ...defaultQuizResults };
        setProfile({
          careerInterests: (cp.career_interests as unknown as CareerCluster[]) || [],
          personalityType: cp.personality_type || "",
          totalLoggedHours: Number(cp.total_logged_hours) || 0,
          quizCompleted: Boolean(cp.quiz_completed),
          quizResults,
          savedOpportunities: (cp.saved_opportunities as unknown as string[]) || [],
          experienceLogs: logs.map(l => ({
            id: l.id,
            title: l.title,
            type: l.type,
            date: l.date,
            hours: Number(l.hours),
            supervisor_email: l.supervisor_email,
            reflection: l.reflection || "",
            status: l.status,
            created_at: l.created_at,
            user_id: l.user_id,
          })),
          milestones: milestones.map(m => ({
            id: m.id,
            milestone_key: m.milestone_key,
            label: m.label,
            description: m.description,
            completed: Boolean(m.completed),
            completed_at: m.completed_at,
            icon: m.icon || "Star",
          })),
        });
      } else {
        setProfile(defaultProfile);
      }
    } catch (err) {
      // Silently handle errors - set default profile
      console.error('CareerProvider error:', err);
      setProfile(defaultProfile);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Real-time subscriptions - TODO: Replace with WebSocket to Durable Objects
  useEffect(() => {
    if (!user) return;
    // Realtime subscriptions will be implemented via WebSocket to Durable Objects
    return () => { /* cleanup */ };
  }, [user, fetchProfile]);

  const completeQuiz = async (results: Record<CareerCluster, number>) => {
    if (!user) return;
    const sorted = Object.entries(results).sort(([, a], [, b]) => b - a);
    const top = sorted.slice(0, 3).map(([c]) => c as CareerCluster);
    const topCluster = sorted[0][0];
    const personalityMap: Record<string, string> = {
      STEM: "The Innovator", Arts: "The Creator", Business: "The Strategist",
      Healthcare: "The Healer", Trades: "The Builder", "Public Service": "The Advocate",
    };

    await apiClient.put(`/api/users/${user.id}/career-profile`, {
      quiz_completed: true,
      quiz_results: results,
      career_interests: top,
      personality_type: personalityMap[topCluster] || "Explorer",
    });

    await apiClient.put(`/api/users/${user.id}/milestones/quiz`, {
      completed: true,
      completed_at: new Date().toISOString(),
    });

    await fetchProfile();
  };

  const resetQuiz = async () => {
    if (!user) return;
    await apiClient.put(`/api/users/${user.id}/career-profile`, {
      quiz_completed: false,
      quiz_results: defaultQuizResults,
      career_interests: [],
      personality_type: "",
    });

    await apiClient.put(`/api/users/${user.id}/milestones/quiz`, {
      completed: false,
      completed_at: null,
    });

    await fetchProfile();
  };

  const resetRoadmap = async () => {
    if (!user) return;
    await apiClient.put(`/api/users/${user.id}/milestones/reset`, {
      completed: false,
      completed_at: null,
    });
    await fetchProfile();
  };

  const toggleSaveOpportunity = async (id: string) => {
    if (!user) return;
    const saved = profile.savedOpportunities.includes(id)
      ? profile.savedOpportunities.filter(s => s !== id)
      : [...profile.savedOpportunities, id];

    await apiClient.put(`/api/users/${user.id}/career-profile`, {
      saved_opportunities: saved,
    });

    if (saved.length >= 3) {
      await apiClient.put(`/api/users/${user.id}/milestones/explore`, {
        completed: true,
        completed_at: new Date().toISOString(),
      });
    }

    await fetchProfile();
  };

  const addExperienceLog = async (log: { title: string; type: string; date: string; hours: number; supervisorEmail: string; reflection: string }) => {
    if (!user) return;

    await apiClient.post(`/api/users/${user.id}/experience-logs`, {
      user_id: user.id,
      title: log.title,
      type: log.type,
      date: log.date,
      hours: log.hours,
      supervisor_email: log.supervisorEmail,
      reflection: log.reflection,
    });

    // Update total hours
    const newTotal = profile.totalLoggedHours + log.hours;
    await apiClient.put(`/api/users/${user.id}/career-profile`, {
      total_logged_hours: newTotal,
    });

    // Complete experience milestone
    await apiClient.put(`/api/users/${user.id}/milestones/experience`, {
      completed: true,
      completed_at: new Date().toISOString(),
    });

    await fetchProfile();
  };

  const completeMilestone = async (key: string) => {
    if (!user) return;
    await apiClient.put(`/api/users/${user.id}/milestones/${key}`, {
      completed: true,
      completed_at: new Date().toISOString(),
    });
    await fetchProfile();
  };

  const getTopClusters = (): CareerCluster[] => profile.careerInterests;

  const getRecommendedOpportunities = (): Opportunity[] => {
    if (!profile.quizCompleted) return allOpportunities;
    const top = profile.careerInterests;
    const recommended = allOpportunities.filter(o => top.includes(o.category));
    const others = allOpportunities.filter(o => !top.includes(o.category));
    return [...recommended, ...others];
  };

  const getCompletionPercentage = (): number => {
    if (profile.milestones.length === 0) return 0;
    const completed = profile.milestones.filter(m => m.completed).length;
    return Math.round((completed / profile.milestones.length) * 100);
  };

  return (
    <CareerContext.Provider value={{
      profile, loading, completeQuiz, toggleSaveOpportunity, addExperienceLog,
      completeMilestone, getTopClusters, getRecommendedOpportunities, getCompletionPercentage,
      resetQuiz, resetRoadmap, refreshProfile: fetchProfile,
    }}>
      {children}
    </CareerContext.Provider>
  );
}

export function useCareer() {
  const ctx = useContext(CareerContext);
  if (!ctx) throw new Error("useCareer must be used within CareerProvider");
  return ctx;
}
