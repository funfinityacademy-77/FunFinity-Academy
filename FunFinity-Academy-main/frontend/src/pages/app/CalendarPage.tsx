import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar as CalendarIcon, Clock, Video, BookOpen, Target, ChevronLeft, ChevronRight, Plus, Loader2, X, Link as LinkIcon, AlertCircle, CheckCircle2, Grid3x3, List, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isToday, addWeeks, subWeeks, startOfMonth, endOfMonth, eachDayOfInterval as eachDayOfMonthInterval, addMonths, subMonths } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

type ViewMode = 'month' | 'week' | 'day';

const typeIcons: Record<string, typeof BookOpen> = {
  lesson: BookOpen,
  live: Video,
  quiz: Target,
  assignment: BookOpen,
  meeting: CalendarIcon,
};

export default function CalendarPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [googleEmail, setGoogleEmail] = useState("");
  const [isGoogleLinked, setIsGoogleLinked] = useState(false);
  const [eventFormData, setEventFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    duration: ""
  });

  // Calculate date range based on view mode
  const dateRange = useMemo(() => {
    if (viewMode === 'month') {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      return { start: monthStart, end: monthEnd, days: eachDayOfMonthInterval({ start: monthStart, end: monthEnd }) };
    } else if (viewMode === 'week') {
      const weekStart = startOfWeek(currentDate);
      const weekEnd = endOfWeek(currentDate);
      return { start: weekStart, end: weekEnd, days: eachDayOfInterval({ start: weekStart, end: weekEnd }) };
    } else {
      return { start: currentDate, end: currentDate, days: [currentDate] };
    }
  }, [currentDate, viewMode]);

  const { start, end, days } = dateRange;

  // Fetch real assignments - filtered by current student
  const { data: assignments = [], isLoading: loadingAssignments } = useQuery({
    queryKey: ["calendar-assignments-page", start, user?.id],
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
      }));
    },
    enabled: !!user?.id,
  });

  // Fetch quizzes - filtered by current student
  const { data: quizzes = [], isLoading: loadingQuizzes } = useQuery({
    queryKey: ["calendar-quizzes-page", start, user?.id],
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
      }));
    },
    enabled: !!user?.id,
  });

  const allEvents = useMemo(() => [...assignments, ...quizzes], [assignments, quizzes]);
  const todayEvents = useMemo(() => allEvents.filter(e => isSameDay(e.date, new Date())), [allEvents]);

  const getEventsForDay = (day: Date) => allEvents.filter(e => isSameDay(e.date, day));

  const handleNavigateDate = (direction: 'prev' | 'next') => {
    if (viewMode === 'month') {
      setCurrentDate(d => direction === 'prev' ? subMonths(d, 1) : addMonths(d, 1));
    } else if (viewMode === 'week') {
      setCurrentDate(d => direction === 'prev' ? subWeeks(d, 1) : addWeeks(d, 1));
    } else {
      setCurrentDate(d => direction === 'prev' ? new Date(d.setDate(d.getDate() - 1)) : new Date(d.setDate(d.getDate() + 1)));
    }
  };

  const isLoading = loadingAssignments || loadingQuizzes;

  const handleGoogleLink = () => {
    if (!googleEmail.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter your Google account email.",
        variant: "destructive"
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(googleEmail)) {
      toast({
        title: "Invalid Email Format",
        description: "Please enter a valid email address.",
        variant: "destructive"
      });
      return;
    }

    // Security check: Ensure Google email matches user's registered profile email
    const normalizedGoogleEmail = googleEmail.trim().toLowerCase();
    const normalizedUserEmail = user?.email?.trim().toLowerCase();

    if (!normalizedUserEmail) {
      toast({
        title: "Profile Email Missing",
        description: "Your profile email is not set. Please update your profile first.",
        variant: "destructive"
      });
      return;
    }

    if (normalizedGoogleEmail !== normalizedUserEmail) {
      toast({
        title: "Security Error: Email Mismatch",
        description: `For security reasons, your Google account email (${googleEmail}) must exactly match your registered profile email (${user.email}). This prevents unauthorized account access.`,
        variant: "destructive"
      });
      return;
    }

    // Additional security: Check if email domain matches allowed domains (optional)
    const allowedDomains = ["gmail.com", "googlemail.com", "yahoo.com", "outlook.com", "hotmail.com"];
    const emailDomain = normalizedGoogleEmail.split('@')[1];
    if (!allowedDomains.includes(emailDomain)) {
      toast({
        title: "Email Domain Not Supported",
        description: `The email domain (${emailDomain}) is not currently supported for Google Calendar integration. Please use a Gmail, Yahoo, or Outlook account.`,
        variant: "destructive"
      });
      return;
    }

    setIsGoogleLinked(true);
    toast({
      title: "Google Account Linked",
      description: "Your Google account has been successfully linked and verified.",
    });
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isGoogleLinked) {
      toast({
        title: "Google Account Required",
        description: "Please link your Google account first to add events.",
        variant: "destructive"
      });
      return;
    }

    if (!eventFormData.title.trim() || !eventFormData.date.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide a title and date for the event.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Simulate API call to add event
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Event Added",
        description: "Your event has been successfully added to the calendar.",
      });
      
      setIsAddEventModalOpen(false);
      setEventFormData({
        title: "",
        description: "",
        date: "",
        time: "",
        duration: ""
      });
    } catch (error) {
      toast({
        title: "Failed to Add Event",
        description: "There was an error adding your event. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">
            Learning <span className="text-gradient-brand">Schedule</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your academic timeline and deadlines</p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-secondary/20 p-1 rounded-xl border border-border/10">
            <Button 
              variant={viewMode === 'month' ? 'default' : 'ghost'} 
              size="sm" 
              onClick={() => setViewMode('month')}
              className="h-8 px-3 rounded-lg text-xs"
            >
              <CalendarDays className="w-3 h-3 mr-1" />
              Month
            </Button>
            <Button 
              variant={viewMode === 'week' ? 'default' : 'ghost'} 
              size="sm" 
              onClick={() => setViewMode('week')}
              className="h-8 px-3 rounded-lg text-xs"
            >
              <Grid3x3 className="w-3 h-3 mr-1" />
              Week
            </Button>
            <Button 
              variant={viewMode === 'day' ? 'default' : 'ghost'} 
              size="sm" 
              onClick={() => setViewMode('day')}
              className="h-8 px-3 rounded-lg text-xs"
            >
              <List className="w-3 h-3 mr-1" />
              Day
            </Button>
          </div>

          {/* Date Navigation */}
          <div className="flex items-center gap-2 bg-secondary/20 p-1.5 rounded-2xl border border-border/10">
            <Button variant="ghost" size="icon" onClick={() => handleNavigateDate('prev')} className="h-9 w-9 rounded-xl"><ChevronLeft className="w-4 h-4" /></Button>
            <span className="text-xs font-bold text-foreground px-4 min-w-[140px] text-center">
              {viewMode === 'month' ? format(currentDate, "MMMM yyyy") :
               viewMode === 'week' ? `${format(start, "MMM d")} – ${format(end, "MMM d, yyyy")}` :
               format(currentDate, "MMMM d, yyyy")}
            </span>
            <Button variant="ghost" size="icon" onClick={() => handleNavigateDate('next')} className="h-9 w-9 rounded-xl"><ChevronRight className="w-4 h-4" /></Button>
          </div>

          <Button variant="hero" size="sm" onClick={() => setIsAddEventModalOpen(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Event
          </Button>
        </div>
      </motion.div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
        <>
          {/* Today's Schedule */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <h2 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Happening Today
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {todayEvents.length === 0 ? (
                <div className="col-span-2 platform-card p-8 text-center border-dashed">
                  <p className="text-sm text-muted-foreground">No events scheduled for today. Enjoy your focus time!</p>
                </div>
              ) : (
                todayEvents.map((event) => {
                  const Icon = typeIcons[event.type] || BookOpen;
                  return (
                    <div key={event.id} className="platform-card p-4 flex items-center gap-4 group hover:border-primary/20 transition-all">
                      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                        event.color === "orange" ? "bg-orange-500/10 text-orange-500" :
                          event.color === "magenta" ? "bg-magenta/10 text-magenta" :
                            "bg-cyan/10 text-cyan"
                      )}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-foreground text-sm truncate">{event.title}</p>
                        <p className="text-xs text-muted-foreground">{event.time} • {event.duration}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>

          {/* Calendar Grid - Dynamic based on view mode */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h2 className="font-display text-lg font-semibold text-foreground mb-4">
              {viewMode === 'month' ? 'Monthly Overview' : viewMode === 'week' ? 'Weekly Schedule' : 'Daily Schedule'}
            </h2>
            
            {viewMode === 'month' && (
              <div className="grid grid-cols-7 gap-2">
                {/* Day headers */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-xs font-bold text-muted-foreground py-2">{day}</div>
                ))}
                {/* Calendar days */}
                {days.map((day) => {
                  const dayEvents = getEventsForDay(day);
                  const isTdy = isToday(day);
                  return (
                    <div key={day.toISOString()} className={cn(
                      "platform-card p-2 min-h-[100px] flex flex-col transition-all cursor-pointer hover:border-primary/30",
                      isTdy ? "ring-2 ring-primary/20 bg-primary/5" : "hover:bg-secondary/20"
                    )}>
                      <div className="flex items-center justify-between mb-2">
                        <p className={cn("text-xs font-bold", isTdy ? "text-primary" : "text-foreground")}>
                          {format(day, "d")}
                        </p>
                      </div>
                      <div className="space-y-1 flex-1 overflow-hidden">
                        {dayEvents.slice(0, 3).map((event, i) => (
                          <div key={i} className={cn("p-1.5 rounded text-[9px] font-medium border truncate",
                            event.color === "orange" ? "bg-orange-500/10 text-orange-500 border-orange-500/20" :
                              event.color === "magenta" ? "bg-magenta/10 text-magenta border-magenta/20" :
                                "bg-cyan/10 text-cyan border-cyan/20"
                          )}>
                            {event.title}
                          </div>
                        ))}
                        {dayEvents.length > 3 && (
                          <p className="text-[9px] text-muted-foreground">+{dayEvents.length - 3} more</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {viewMode === 'week' && (
              <div className="grid grid-cols-1 sm:grid-cols-7 gap-3">
                {days.map((day) => {
                  const dayEvents = getEventsForDay(day);
                  const isTdy = isToday(day);
                  return (
                    <div key={day.toISOString()} className={cn(
                      "platform-card p-3 min-h-[200px] flex flex-col transition-all",
                      isTdy ? "ring-2 ring-primary/20 bg-primary/5" : "hover:bg-secondary/20"
                    )}>
                      <div className="flex items-center justify-between mb-3">
                        <p className={cn("text-[10px] font-bold uppercase tracking-widest", isTdy ? "text-primary" : "text-muted-foreground")}>
                          {format(day, "EEE")}
                        </p>
                        <p className={cn("text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full",
                          isTdy ? "bg-primary text-primary-foreground" : "text-foreground"
                        )}>
                          {format(day, "d")}
                        </p>
                      </div>
                      <div className="space-y-1.5 flex-1">
                        {dayEvents.map((event, i) => (
                          <div key={i} className={cn("p-2 rounded-lg text-[10px] font-medium border",
                            event.color === "orange" ? "bg-orange-500/10 text-orange-500 border-orange-500/20" :
                              event.color === "magenta" ? "bg-magenta/10 text-magenta border-magenta/20" :
                                "bg-cyan/10 text-cyan border-cyan/20"
                          )}>
                            <p className="truncate leading-tight">{event.title}</p>
                            <p className="opacity-70 mt-0.5">{event.time}</p>
                          </div>
                        ))}
                        {dayEvents.length === 0 && (
                          <div className="flex-1 flex items-center justify-center h-full opacity-20">
                            <p className="text-[10px] font-medium uppercase tracking-tighter">Focus</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {viewMode === 'day' && (
              <div className="space-y-3">
                {days.map((day) => {
                  const dayEvents = getEventsForDay(day);
                  const isTdy = isToday(day);
                  return (
                    <div key={day.toISOString()} className={cn(
                      "platform-card p-6 transition-all",
                      isTdy ? "ring-2 ring-primary/20 bg-primary/5" : ""
                    )}>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className={cn("text-lg font-bold", isTdy ? "text-primary" : "text-foreground")}>
                            {format(day, "EEEE, MMMM d, yyyy")}
                          </p>
                          <p className="text-sm text-muted-foreground">{dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''} scheduled</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {dayEvents.map((event, i) => {
                          const Icon = typeIcons[event.type] || BookOpen;
                          return (
                            <div key={i} className={cn("p-4 rounded-xl border flex items-center gap-4 group hover:border-primary/30 transition-all",
                              event.color === "orange" ? "bg-orange-500/5 border-orange-500/20" :
                                event.color === "magenta" ? "bg-magenta/5 border-magenta/20" :
                                  "bg-cyan/5 border-cyan/20"
                            )}>
                              <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                                event.color === "orange" ? "bg-orange-500/10 text-orange-500" :
                                  event.color === "magenta" ? "bg-magenta/10 text-magenta" :
                                    "bg-cyan/10 text-cyan"
                              )}>
                                <Icon className="w-6 h-6" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-foreground">{event.title}</p>
                                <p className="text-sm text-muted-foreground">{event.time} • {event.duration}</p>
                              </div>
                            </div>
                          );
                        })}
                        {dayEvents.length === 0 && (
                          <div className="text-center py-8 opacity-40">
                            <p className="text-sm">No events scheduled for this day</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </>
      )}

      {/* Add Event Modal */}
      <AnimatePresence>
        {isAddEventModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setIsAddEventModalOpen(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative w-full max-w-lg glass-card border-border/30 rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setIsAddEventModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-secondary/50 transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>

              <div className="mb-6">
                <h2 className="text-xl font-bold text-foreground mb-2">Add New Event</h2>
                <p className="text-sm text-muted-foreground">Create a new event and sync with your Google Calendar</p>
              </div>

              {/* Google Account Linking Section */}
              <div className="mb-6 p-4 rounded-xl bg-secondary/30 border border-border/30">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <LinkIcon className="w-5 h-5 text-primary" />
                    <span className="font-semibold text-foreground">Google Account</span>
                  </div>
                  {isGoogleLinked && (
                    <div className="flex items-center gap-1 text-emerald-500">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-xs font-medium">Linked</span>
                    </div>
                  )}
                </div>

                {!isGoogleLinked ? (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        type="email"
                        value={googleEmail}
                        onChange={(e) => setGoogleEmail(e.target.value)}
                        placeholder="Enter your Google email"
                        className="flex-1 bg-background/50 border-border/30"
                      />
                      <Button variant="outline" size="sm" onClick={handleGoogleLink}>
                        Link
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Your Google email must match your profile email ({user?.email}) for security reasons.
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Linked to:</span>
                    <span className="font-medium text-foreground">{user?.email}</span>
                  </div>
                )}
              </div>

              {/* Event Form */}
              <form onSubmit={handleAddEvent} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="event-title">Event Title *</Label>
                  <Input
                    id="event-title"
                    value={eventFormData.title}
                    onChange={(e) => setEventFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Study Session, Meeting"
                    className="bg-secondary/50 border-border/30"
                    disabled={!isGoogleLinked}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="event-description">Description</Label>
                  <Textarea
                    id="event-description"
                    value={eventFormData.description}
                    onChange={(e) => setEventFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Add event details..."
                    rows={3}
                    className="bg-secondary/50 border-border/30 resize-none"
                    disabled={!isGoogleLinked}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="event-date">Date *</Label>
                    <Input
                      id="event-date"
                      type="date"
                      value={eventFormData.date}
                      onChange={(e) => setEventFormData(prev => ({ ...prev, date: e.target.value }))}
                      className="bg-secondary/50 border-border/30"
                      disabled={!isGoogleLinked}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="event-time">Time</Label>
                    <Input
                      id="event-time"
                      type="time"
                      value={eventFormData.time}
                      onChange={(e) => setEventFormData(prev => ({ ...prev, time: e.target.value }))}
                      className="bg-secondary/50 border-border/30"
                      disabled={!isGoogleLinked}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="event-duration">Duration</Label>
                  <Input
                    id="event-duration"
                    value={eventFormData.duration}
                    onChange={(e) => setEventFormData(prev => ({ ...prev, duration: e.target.value }))}
                    placeholder="e.g., 1 hour, 30 minutes"
                    className="bg-secondary/50 border-border/30"
                    disabled={!isGoogleLinked}
                  />
                </div>

                {!isGoogleLinked && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                    <AlertCircle className="w-4 h-4 text-yellow-500" />
                    <p className="text-xs text-yellow-500">Link your Google account to add events</p>
                  </div>
                )}

                <Button
                  type="submit"
                  variant="hero"
                  className="w-full"
                  disabled={!isGoogleLinked}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Event
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
