import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Accessibility, Type, Eye, Zap, BookOpen, RotateCcw } from "lucide-react";
import { useAccessibility } from "@/hooks/use-accessibility";
import { cn } from "@/lib/utils";

export function AccessibilityPanel() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { settings, updateSetting, resetSettings } = useAccessibility();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fontSizes = [
    { value: "normal" as const, label: "A", desc: "Default" },
    { value: "large" as const, label: "A", desc: "Large" },
    { value: "x-large" as const, label: "A", desc: "X-Large" },
  ];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-lg hover:bg-secondary/50 transition-colors"
        aria-label="Accessibility options"
      >
        <Accessibility className="w-5 h-5 text-muted-foreground" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-72 rounded-2xl glass-card-heavy border border-border/30 shadow-heavy z-50 overflow-hidden"
          >
            <div className="p-4 border-b border-border/30 flex items-center justify-between">
              <h3 className="font-display font-semibold text-foreground text-sm">Accessibility</h3>
              <button onClick={resetSettings} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Font Size */}
              <div>
                <label className="text-xs font-medium text-foreground flex items-center gap-1.5 mb-2">
                  <Type className="w-3.5 h-3.5" /> Font Size
                </label>
                <div className="flex gap-2">
                  {fontSizes.map((fs, i) => (
                    <button
                      key={fs.value}
                      onClick={() => updateSetting("fontSize", fs.value)}
                      className={cn(
                        "flex-1 py-2 rounded-xl text-center border transition-all",
                        settings.fontSize === fs.value
                          ? "bg-primary/10 border-primary/30 text-primary"
                          : "border-border/30 text-muted-foreground hover:bg-secondary/50"
                      )}
                    >
                      <span className={cn("block font-semibold", i === 0 ? "text-xs" : i === 1 ? "text-sm" : "text-base")}>{fs.label}</span>
                      <span className="text-[10px]">{fs.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              {[
                { key: "highContrast" as const, icon: Eye, label: "High Contrast", desc: "Increase color contrast" },
                { key: "reducedMotion" as const, icon: Zap, label: "Reduced Motion", desc: "Minimize animations" },
                { key: "dyslexiaFont" as const, icon: BookOpen, label: "Dyslexia Font", desc: "Use OpenDyslexic font" },
              ].map(({ key, icon: Icon, label, desc }) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                    <div>
                      <p className="text-xs font-medium text-foreground">{label}</p>
                      <p className="text-[10px] text-muted-foreground">{desc}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => updateSetting(key, !settings[key])}
                    className={cn(
                      "w-10 h-5 rounded-full transition-colors relative",
                      settings[key] ? "bg-primary" : "bg-secondary"
                    )}
                    role="switch"
                    aria-checked={settings[key]}
                    aria-label={label}
                  >
                    <span className={cn(
                      "absolute top-0.5 w-4 h-4 rounded-full bg-background shadow transition-transform",
                      settings[key] ? "left-[22px]" : "left-0.5"
                    )} />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
