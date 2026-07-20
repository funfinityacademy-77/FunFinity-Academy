import { createContext, useContext, useState, useCallback } from "react";

export interface Announcement {
  id: string;
  title: string;
  body: string;
  target: "All" | "Students" | "Teachers" | "Parents";
  date: string;
  urgent: boolean;
  author: string;
}

const initialAnnouncements: Announcement[] = [];

interface AnnouncementContextType {
  announcements: Announcement[];
  addAnnouncement: (a: Omit<Announcement, "id">) => void;
  deleteAnnouncement: (id: string) => void;
  getAnnouncementsForRole: (role: "Students" | "Teachers" | "Parents") => Announcement[];
}

const AnnouncementContext = createContext<AnnouncementContextType>({
  announcements: [],
  addAnnouncement: () => {},
  deleteAnnouncement: () => {},
  getAnnouncementsForRole: () => [],
});

export function AnnouncementProvider({ children }: { children: React.ReactNode }) {
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);

  const addAnnouncement = useCallback((a: Omit<Announcement, "id">) => {
    setAnnouncements((prev) => [{ ...a, id: Date.now().toString() }, ...prev]);
  }, []);

  const deleteAnnouncement = useCallback((id: string) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const getAnnouncementsForRole = useCallback(
    (role: "Students" | "Teachers" | "Parents") => {
      return announcements.filter((a) => a.target === "All" || a.target === role);
    },
    [announcements]
  );

  return (
    <AnnouncementContext.Provider value={{ announcements, addAnnouncement, deleteAnnouncement, getAnnouncementsForRole }}>
      {children}
    </AnnouncementContext.Provider>
  );
}

export const useAnnouncements = () => useContext(AnnouncementContext);
