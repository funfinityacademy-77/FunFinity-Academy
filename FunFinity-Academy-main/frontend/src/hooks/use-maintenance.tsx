import { useState } from "react";

export interface MaintenanceConfig {
  active: boolean;
  title: string;
  reason: string;
  startTime: string;
  endTime: string;
  notes: string;
}

const STORAGE_KEY = "funfinity_maintenance";

export function useMaintenance() {
  const [maintenance, setMaintenance] = useState<MaintenanceConfig | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const enableMaintenance = (config: Omit<MaintenanceConfig, "active">) => {
    const newConfig = { ...config, active: true };
    setMaintenance(newConfig);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
  };

  const disableMaintenance = () => {
    setMaintenance(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  // Check if currently in maintenance window
  const isMaintenanceActive = () => {
    if (!maintenance || !maintenance.active) return false;
    const now = new Date().getTime();
    const start = new Date(maintenance.startTime).getTime();
    const end = new Date(maintenance.endTime).getTime();
    return now >= start && now <= end;
  };

  return { maintenance, enableMaintenance, disableMaintenance, isMaintenanceActive };
}
