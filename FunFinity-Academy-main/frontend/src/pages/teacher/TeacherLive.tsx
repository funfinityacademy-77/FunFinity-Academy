import { motion } from "framer-motion";
import { Video, Users, Clock, Play, PlusCircle, Calendar, Mic, MicOff, VideoOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const scheduledClasses = [
  { id: 1, title: "Statistics 101 - Probability", date: "Today, 3:00 PM", duration: "60 min", students: 25, status: "upcoming" },
  { id: 2, title: "Algebra Review Session", date: "Tomorrow, 2:00 PM", duration: "45 min", students: 28, status: "scheduled" },
  { id: 3, title: "Geometry - Circle Theorems", date: "Feb 20, 10:00 AM", duration: "60 min", students: 12, status: "scheduled" },
];

const pastClasses = [
  { id: 4, title: "Algebra - Quadratic Equations", date: "Feb 14", attendees: 24, recording: true },
  { id: 5, title: "Statistics - Normal Distribution", date: "Feb 12", attendees: 22, recording: true },
  { id: 6, title: "Calculus - Derivatives", date: "Feb 10", attendees: 20, recording: false },
];

export default function TeacherLive() {
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Live Classes</h1>
            <p className="text-muted-foreground text-sm mt-1">Schedule, host, and review your live sessions</p>
          </div>
          <Button variant="hero" size="default">
            <PlusCircle className="w-4 h-4 mr-2" /> Schedule Class
          </Button>
        </div>

        {/* Quick Start */}
        <div className="platform-card p-6 relative overflow-hidden mb-6">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-cyan/5" />
          <div className="relative z-10">
            <h2 className="font-display text-lg font-semibold text-foreground mb-4">Quick Start Session</h2>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-20 h-20 rounded-2xl bg-secondary/50 border border-border/30 flex items-center justify-center">
                <Video className="w-8 h-8 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-foreground font-medium mb-1">Instant classroom — your students can join immediately</p>
                <p className="text-xs text-muted-foreground">Up to 100 students · HD video · Screen sharing · Whiteboard</p>
                <div className="flex items-center gap-3 mt-3">
                  <button onClick={() => setMicOn(!micOn)}
                    className={`p-2 rounded-lg border transition-colors ${micOn ? "bg-primary/10 border-primary/20 text-primary" : "bg-destructive/10 border-destructive/20 text-destructive"}`}>
                    {micOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                  </button>
                  <button onClick={() => setCamOn(!camOn)}
                    className={`p-2 rounded-lg border transition-colors ${camOn ? "bg-primary/10 border-primary/20 text-primary" : "bg-destructive/10 border-destructive/20 text-destructive"}`}>
                    {camOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                  </button>
                  <Button variant="hero" size="default">
                    <Play className="w-4 h-4 mr-2" /> Start Instant Class
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming */}
        <div className="space-y-3 mb-6">
          <h2 className="font-display text-lg font-semibold text-foreground">Scheduled Classes</h2>
          {scheduledClasses.map((cls, i) => (
            <motion.div key={cls.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              className={`platform-card p-4 ${cls.status === "upcoming" ? "border-primary/20 bg-primary/5" : ""}`}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cls.status === "upcoming" ? "bg-primary/10" : "bg-secondary"}`}>
                    <Video className={`w-4 h-4 ${cls.status === "upcoming" ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">{cls.title}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="w-3 h-3" />{cls.date}</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{cls.duration}</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1"><Users className="w-3 h-3" />{cls.students} students</span>
                    </div>
                  </div>
                </div>
                {cls.status === "upcoming"
                  ? <Button variant="hero" size="sm"><Play className="w-3 h-3 mr-1" />Start Now</Button>
                  : <Button variant="outline" size="sm">Edit</Button>}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Past recordings */}
        <div>
          <h2 className="font-display text-base font-semibold text-foreground mb-3">Past Recordings</h2>
          <div className="space-y-2">
            {pastClasses.map((cls) => (
              <div key={cls.id} className="platform-card p-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                    <Video className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{cls.title}</p>
                    <p className="text-xs text-muted-foreground">{cls.date} · {cls.attendees} attended</p>
                  </div>
                </div>
                {cls.recording
                  ? <Button variant="ghost" size="sm" className="text-primary"><Play className="w-3 h-3 mr-1" />Watch</Button>
                  : <span className="text-xs text-muted-foreground">No recording</span>}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
