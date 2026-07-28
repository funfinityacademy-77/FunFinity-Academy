import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Clock,
  Video, BookOpen, Target, Users, Filter, X, Loader2, Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addMonths, subMonths, addWeeks, subWeeks, addDays, subDays,
  isSameMonth, isSameDay, isToday, eachDayOfInterval, parseISO
} from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

type ViewMode = "daily" | "weekly" | "monthly";
type RoleFilter = "all" | "student" | "teacher" | "parent";

interface CalendarEvent {
  id: string;
  title: string;
  type: string;
  date: Date;
  time: string;
  duration: string;
  color: string;
  role: RoleFilter[];
  description?: string;
}

const typeIcons: Record<string, typeof BookOpen> = {
  lesson: BookOpen,
  live: Video,
  quiz: Target,
  assignment: BookOpen,
  holiday: CalendarIcon,
  meeting: Users,
};

const typeColors: Record<string, { bg: string; text: string; border: string }> = {
  cyan: { bg: "bg-cyan/10", text: "text-cyan", border: "border-cyan/20" },
  magenta: { bg: "bg-magenta/10", text: "text-magenta", border: "border-magenta/20" },
  orange: { bg: "bg-accent/10", text: "text-accent", border: "border-accent/20" },
  primary: { bg: "bg-primary/10", text: "text-primary", border: "border-primary/20" },
};

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function MasterCalendar() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewMode>("monthly");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Fetch real assignments as calendar events - filtered by current student
  const { data: assignmentEvents = [] } = useQuery({
    queryKey: ["calendar-assignments", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const data = await apiClient.get<any[]>(`/api/assignments?user_id=${user.id}`);
      return (data || []).map(a => ({
        id: a.id,
        title: a.title,
        type: "assignment",
        date: new Date(a.due_date!),
        time: format(new Date(a.due_date!), "h:mm a"),
        duration: "—",
        color: "orange",
        role: ["student"] as RoleFilter[],
        description: `Course: ${(a.courses as any)?.title || "General"}`,
      }));
    },
    enabled: !!user?.id,
  });

  // Fetch quizzes - filtered by current student
  const { data: quizEvents = [] } = useQuery({
    queryKey: ["calendar-quizzes", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const data = await apiClient.get<any[]>(`/api/quizzes?user_id=${user.id}`);
      return (data || []).map(q => ({
        id: q.id,
        title: q.title,
        type: "quiz",
        date: new Date(q.created_at),
        time: format(new Date(q.created_at), "h:mm a"),
        duration: q.time_limit_minutes ? `${q.time_limit_minutes} min` : "—",
        color: "magenta",
        role: ["student"] as RoleFilter[],
        description: `Course: ${(q.courses as any)?.title || "General"}`,
      }));
    },
    enabled: !!user?.id,
  });

  // Fetch announcements - only show those targeting student role
  const { data: announcementEvents = [] } = useQuery({
    queryKey: ["calendar-announcements"],
    queryFn: async () => {
      const data = await apiClient.get<any[]>('/api/announcements?published=true');
      return (data || [])
        .filter(a => !a.target_role || a.target_role === "student" || a.target_role === "all")
        .map(a => ({
          id: a.id,
          title: a.title,
          type: "meeting",
          date: new Date(a.created_at),
          time: format(new Date(a.created_at), "h:mm a"),
          duration: "—",
          color: "primary",
          role: ["student"] as RoleFilter[],
          description: `Announcement for ${a.target_role || "everyone"}`,
        }));
    },
  });

  // Initial state should be clean
  const [localEvents, setLocalEvents] = useState<CalendarEvent[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    const saved = localStorage.getItem(`calendar_events_${user.id}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setLocalEvents(parsed.map((e: any) => ({
          ...e,
          date: new Date(e.date)
        })));
      } catch (e) {
        console.warn("Failed to parse calendar events", e);
      }
    }
    setIsInitialized(true);
  }, [user?.id]);

  const saveLocalEvents = (newEvents: CalendarEvent[]) => {
    setLocalEvents(newEvents);
    if (user?.id) {
      localStorage.setItem(`calendar_events_${user.id}`, JSON.stringify(newEvents));
    }
  };

  const allEvents = useMemo(() => [
    ...assignmentEvents,
    ...quizEvents,
    ...announcementEvents,
    ...localEvents,
  ], [assignmentEvents, quizEvents, announcementEvents, localEvents]);

  const filteredEvents = useMemo(() =>
    allEvents.filter(e => roleFilter === "all" || e.role.includes(roleFilter) || e.role.includes("all")),
    [allEvents, roleFilter]
  );

  const navigate = (dir: 1 | -1) => {
    if (view === "monthly") setCurrentDate(d => dir === 1 ? addMonths(d, 1) : subMonths(d, 1));
    else if (view === "weekly") setCurrentDate(d => dir === 1 ? addWeeks(d, 1) : subWeeks(d, 1));
    else setCurrentDate(d => dir === 1 ? addDays(d, 1) : subDays(d, 1));
  };

  const goToday = () => setCurrentDate(new Date());
  const getEventsForDay = (day: Date) => filteredEvents.filter(e => isSameDay(e.date, day));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);
  const calDays = eachDayOfInterval({ start: calStart, end: calEnd });

  const weekStart = startOfWeek(currentDate);
  const weekDays = eachDayOfInterval({ start: weekStart, end: endOfWeek(weekStart) });

  const { toast } = useToast();
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDesc, setNewEventDesc] = useState("");
  const [newEventTime, setNewEventTime] = useState("10:00");

  const handleAddEvent = () => {
    if (!newEventTitle) return;
    const timeParts = newEventTime.split(":");
    const newDate = new Date(currentDate);
    newDate.setHours(parseInt(timeParts[0]), parseInt(timeParts[1]));

    const newEvent: CalendarEvent = {
      id: "local-" + Date.now(),
      title: newEventTitle,
      type: "meeting",
      date: newDate,
      time: format(newDate, "h:mm a"),
      duration: "1 hr",
      color: "magenta",
      role: ["parent", "student", "all"],
      description: newEventDesc,
    };

    saveLocalEvents([...localEvents, newEvent]);
    setIsAddingEvent(false);
    setNewEventTitle("");
    setNewEventDesc("");
    toast({ title: "Event Added", description: "Successfully synced to shared calendar." });
  };

  const handleDeleteEvent = (id: string) => {
    saveLocalEvents(localEvents.filter(e => e.id !== id));
    setSelectedEvent(null);
    toast({ title: "Event Deleted" });
  };

  const EventChip = ({ event, compact = false }: { event: CalendarEvent; compact?: boolean }) => {
    const colors = typeColors[event.color] || typeColors.primary;
    const Icon = typeIcons[event.type] || BookOpen;
    return (
      <button
        onClick={(e) => { e.stopPropagation(); setSelectedEvent(event); }}
        className={cn(
          "w-full text-left rounded-lg transition-all hover:shadow-sm",
          compact ? "px-1.5 py-0.5" : "px-2 py-1.5",
          colors.bg, colors.border, "border"
        )}
      >
        <div className="flex items-center gap-1 min-w-0">
          {!compact && <Icon className={cn("w-3 h-3 shrink-0", colors.text)} />}
          <span className={cn("truncate font-medium", colors.text, compact ? "text-[9px]" : "text-[11px]")}>
            {event.title}
          </span>
        </div>
        {!compact && <p className={cn("text-[9px] opacity-70 mt-0.5", colors.text)}>{event.time}</p>}
      </button>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">
            <span className="text-gradient-brand">Calendar</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Master schedule for your learning journey</p>
        </div>
        <Button variant="hero" onClick={() => setIsAddingEvent(true)}>
          <Plus className="w-4 h-4 mr-2" /> Add Event
        </Button>
      </motion.div>

      {/* Controls */}
      <div className="platform-card p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="h-8 w-8"><ChevronLeft className="w-4 h-4" /></Button>
          <button onClick={goToday} className="px-3 py-1 rounded-lg text-xs font-medium border border-border/30 hover:bg-secondary/50 transition-colors text-foreground">Today</button>
          <Button variant="ghost" size="icon" onClick={() => navigate(1)} className="h-8 w-8"><ChevronRight className="w-4 h-4" /></Button>
          <span className="text-sm font-semibold text-foreground px-2">
            {view === "daily" ? format(currentDate, "EEEE, MMMM d, yyyy") :
              view === "weekly" ? `${format(weekStart, "MMM d")} – ${format(endOfWeek(weekStart), "MMM d, yyyy")}` :
                format(currentDate, "MMMM yyyy")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl border border-border/30 overflow-hidden">
            {(["daily", "weekly", "monthly"] as ViewMode[]).map(v => (
              <button key={v} onClick={() => setView(v)}
                className={cn("px-3 py-1.5 text-xs font-medium capitalize transition-colors",
                  view === v ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary/50")}>
                {v}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 border-l border-border/30 pl-2">
            <Filter className="w-3 h-3 text-muted-foreground" />
            {(["all", "student", "teacher", "parent"] as RoleFilter[]).map(r => (
              <button key={r} onClick={() => setRoleFilter(r)}
                className={cn("px-2 py-1 rounded-lg text-[10px] font-medium capitalize transition-all",
                  roleFilter === r ? "bg-primary/10 text-primary border border-primary/20" : "text-muted-foreground hover:bg-secondary/50")}>
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <AnimatePresence mode="wait">
        {view === "monthly" && (
          <motion.div key="monthly" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="platform-card overflow-hidden">
            <div className="grid grid-cols-7 border-b border-border/20">
              {daysOfWeek.map(d => (
                <div key={d} className="px-2 py-2 text-center text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {calDays.map((day, idx) => {
                const dayEvents = getEventsForDay(day);
                const isCurrentMonth = isSameMonth(day, currentDate);
                const today = isToday(day);
                return (
                  <div key={idx}
                    onClick={() => { setCurrentDate(day); setView("daily"); }}
                    className={cn(
                      "min-h-[100px] p-1.5 border-b border-r border-border/10 cursor-pointer hover:bg-secondary/20 transition-colors",
                      !isCurrentMonth && "opacity-40",
                      today && "bg-primary/5"
                    )}>
                    <div className={cn(
                      "text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full",
                      today ? "bg-primary text-primary-foreground" : "text-foreground"
                    )}>
                      {format(day, "d")}
                    </div>
                    <div className="space-y-0.5">
                      {dayEvents.slice(0, 3).map(e => <EventChip key={e.id} event={e} compact />)}
                      {dayEvents.length > 3 && (
                        <span className="text-[9px] text-muted-foreground pl-1">+{dayEvents.length - 3} more</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {view === "weekly" && (
          <motion.div key="weekly" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="platform-card overflow-hidden">
            <div className="grid grid-cols-7">
              {weekDays.map((day, idx) => {
                const dayEvents = getEventsForDay(day);
                const today = isToday(day);
                return (
                  <div key={idx} className={cn("min-h-[300px] border-r border-border/10 last:border-r-0", today && "bg-primary/5")}>
                    <div className={cn("px-2 py-2 border-b border-border/20 text-center", today && "bg-primary/10")}>
                      <p className="text-[10px] text-muted-foreground uppercase">{format(day, "EEE")}</p>
                      <p className={cn("text-sm font-bold", today ? "text-primary" : "text-foreground")}>{format(day, "d")}</p>
                    </div>
                    <div className="p-1.5 space-y-1">
                      {dayEvents.map(e => <EventChip key={e.id} event={e} />)}
                      {dayEvents.length === 0 && (
                        <p className="text-[10px] text-muted-foreground/40 text-center mt-8">No events</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {view === "daily" && (
          <motion.div key="daily" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="space-y-2">
              {getEventsForDay(currentDate).length > 0 ? getEventsForDay(currentDate).map(event => {
                const Icon = typeIcons[event.type] || BookOpen;
                const colors = typeColors[event.color] || typeColors.primary;
                return (
                  <div key={event.id} onClick={() => setSelectedEvent(event)}
                    className={cn("platform-card p-4 flex items-center gap-4 cursor-pointer hover:shadow-medium transition-all", colors.border, "border")}>
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", colors.bg)}>
                      <Icon className={cn("w-5 h-5", colors.text)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm">{event.title}</p>
                      <p className="text-xs text-muted-foreground">{event.time} · {event.duration}</p>
                      {event.description && <p className="text-xs text-muted-foreground mt-1">{event.description}</p>}
                    </div>
                  </div>
                );
              }) : (
                <div className="platform-card p-20 text-center border-dashed">
                  <CalendarIcon className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                  <p className="text-muted-foreground font-medium">No events scheduled</p>
                  <p className="text-sm text-muted-foreground mt-1 mb-6">Your schedule for this day is clear.</p>
                  <Button variant="outline" size="sm" onClick={() => setIsAddingEvent(true)}>
                    <Plus className="w-4 h-4 mr-2" /> Add Your First Event
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Event Detail Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedEvent(null)} className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-md platform-card p-6 shadow-heavy">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {(() => {
                    const Icon = typeIcons[selectedEvent.type] || BookOpen; const c = typeColors[selectedEvent.color] || typeColors.primary; return (
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", c.bg)}>
                        <Icon className={cn("w-5 h-5", c.text)} />
                      </div>
                    );
                  })()}
                  <div>
                    <h3 className="font-display text-base font-semibold text-foreground">{selectedEvent.title}</h3>
                    <p className="text-xs text-muted-foreground capitalize">{selectedEvent.type}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedEvent(null)} className="p-1 rounded-lg hover:bg-secondary/50"><X className="w-4 h-4 text-muted-foreground" /></button>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                  {format(selectedEvent.date, "EEEE, MMMM d, yyyy")}
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  {selectedEvent.time} · {selectedEvent.duration}
                </div>
                {selectedEvent.description && (
                  <p className="text-sm text-muted-foreground">{selectedEvent.description}</p>
                )}
              </div>
              <div className="flex gap-2 mt-5">
                {selectedEvent.id.startsWith("local-") && (
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteEvent(selectedEvent.id)}>
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => setSelectedEvent(null)} className="ml-auto">Close</Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Add Event Modal */}
      <AnimatePresence>
        {isAddingEvent && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsAddingEvent(false)} className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-md platform-card p-6 shadow-heavy">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-lg font-semibold text-foreground">Add New Event</h3>
                <button onClick={() => setIsAddingEvent(false)} className="p-1 rounded-lg hover:bg-secondary/50"><X className="w-4 h-4 text-muted-foreground" /></button>
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Title</label>
                  <Input value={newEventTitle} onChange={e => setNewEventTitle(e.target.value)} placeholder="Event title..." />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Date</label>
                  <div className="text-sm font-medium p-2 border rounded-xl bg-secondary/30">
                    {format(currentDate, "MMMM d, yyyy")}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Time</label>
                  <Input type="time" value={newEventTime} onChange={e => setNewEventTime(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Description</label>
                  <Textarea value={newEventDesc} onChange={e => setNewEventDesc(e.target.value)} placeholder="Event description..." className="resize-none" rows={3} />
                </div>
              </div>
              <div className="flex gap-2 mt-5">
                <Button variant="hero" className="flex-1" onClick={handleAddEvent}>Save Event</Button>
                <Button variant="outline" onClick={() => setIsAddingEvent(false)}>Cancel</Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
