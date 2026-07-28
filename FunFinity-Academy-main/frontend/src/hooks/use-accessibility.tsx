import { createContext, useContext, useState, useEffect } from "react";

interface AccessibilitySettings {
  fontSize: "normal" | "large" | "x-large";
  highContrast: boolean;
  reducedMotion: boolean;
  dyslexiaFont: boolean;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSetting: <K extends keyof AccessibilitySettings>(key: K, value: AccessibilitySettings[K]) => void;
  resetSettings: () => void;
}

const defaults: AccessibilitySettings = {
  fontSize: "normal",
  highContrast: false,
  reducedMotion: false,
  dyslexiaFont: false,
};

const AccessibilityContext = createContext<AccessibilityContextType>({
  settings: defaults,
  updateSetting: () => {},
  resetSettings: () => {},
});

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    try {
      const stored = localStorage.getItem("a11y-settings");
      return stored ? { ...defaults, ...JSON.parse(stored) } : defaults;
    } catch {
      return defaults;
    }
  });

  useEffect(() => {
    localStorage.setItem("a11y-settings", JSON.stringify(settings));
    const root = document.documentElement;

    // Font size
    root.classList.remove("text-base", "text-lg", "text-xl");
    if (settings.fontSize === "large") root.classList.add("text-lg");
    else if (settings.fontSize === "x-large") root.classList.add("text-xl");

    // High contrast
    root.classList.toggle("high-contrast", settings.highContrast);

    // Reduced motion
    root.classList.toggle("reduce-motion", settings.reducedMotion);

    // Dyslexia font
    root.classList.toggle("dyslexia-font", settings.dyslexiaFont);
  }, [settings]);

  const updateSetting = <K extends keyof AccessibilitySettings>(key: K, value: AccessibilitySettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const resetSettings = () => setSettings(defaults);

  return (
    <AccessibilityContext.Provider value={{ settings, updateSetting, resetSettings }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export const useAccessibility = () => useContext(AccessibilityContext);
