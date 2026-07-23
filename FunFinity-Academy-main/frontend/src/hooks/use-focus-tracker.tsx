import { useState, useEffect, useCallback, useRef } from "react";

export type FocusLevel = "high" | "medium" | "low" | "fatigued";

interface FocusState {
  level: FocusLevel;
  score: number; // 0-100
  sessionMinutes: number;
  idleSeconds: number;
  interactionRate: number; // interactions per minute
}

/**
 * Neuroadaptive focus tracker — monitors user interaction patterns
 * to predict cognitive fatigue and adjust UI accordingly.
 */
export function useFocusTracker() {
  const [focus, setFocus] = useState<FocusState>({
    level: "high",
    score: 100,
    sessionMinutes: 0,
    idleSeconds: 0,
    interactionRate: 0,
  });

  const interactions = useRef<number[]>([]);
  const sessionStart = useRef(Date.now());
  const lastActivity = useRef(Date.now());

  const recordInteraction = useCallback(() => {
    const now = Date.now();
    interactions.current.push(now);
    lastActivity.current = now;
    // Keep only last 5 min of interactions
    const cutoff = now - 300_000;
    interactions.current = interactions.current.filter((t) => t > cutoff);
  }, []);

  useEffect(() => {
    const handleActivity = () => recordInteraction();
    window.addEventListener("click", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("scroll", handleActivity);

    const interval = setInterval(() => {
      const now = Date.now();
      const sessionMin = (now - sessionStart.current) / 60_000;
      const idleSec = (now - lastActivity.current) / 1000;

      // Interactions in last 2 minutes
      const recentCutoff = now - 120_000;
      const recentCount = interactions.current.filter((t) => t > recentCutoff).length;
      const rate = recentCount / 2;

      // Score: starts at 100, decays with session length and idle time
      let score = 100;
      score -= Math.min(30, sessionMin * 0.5); // session fatigue
      score -= Math.min(30, idleSec > 30 ? (idleSec - 30) * 0.5 : 0); // idle penalty
      score += Math.min(20, rate * 2); // interaction bonus
      score = Math.max(0, Math.min(100, score));

      const level: FocusLevel =
        score > 75 ? "high" : score > 50 ? "medium" : score > 25 ? "low" : "fatigued";

      setFocus({ level, score: Math.round(score), sessionMinutes: Math.round(sessionMin), idleSeconds: Math.round(idleSec), interactionRate: Math.round(rate) });
    }, 5000);

    return () => {
      window.removeEventListener("click", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("scroll", handleActivity);
      clearInterval(interval);
    };
  }, [recordInteraction]);

  // Adaptive UI values based on focus
  const adaptiveStyles = {
    glassOpacity: focus.level === "high" ? 0.08 : focus.level === "medium" ? 0.12 : focus.level === "low" ? 0.18 : 0.25,
    colorTemp: focus.level === "high" ? "cool" as const : focus.level === "fatigued" ? "warm" as const : "neutral" as const,
    reducedComplexity: focus.level === "fatigued" || focus.level === "low",
    suggestBreak: focus.level === "fatigued" && focus.sessionMinutes > 25,
  };

  return { focus, adaptiveStyles };
}
