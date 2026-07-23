import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Search, PlusCircle, FileText, Video, Download, Link as LinkIcon, Star, Eye, Users, Calculator, Microscope, History as HistoryIcon, Bot, PenTool, FlaskConical, Activity, Atom, Beaker, Globe, Palette, Music, Globe2, Compass, GraduationCap, BrainCircuit } from "lucide-react";
import { Button } from "@/components/ui/button";

const resources = [
  { id: 1, title: "Quadratic Equations Worksheet", type: "PDF", subject: "Mathematics", shared: true, downloads: 142, rating: 4.8, author: "Dr. Jane Smith" },
  { id: 2, title: "Probability Video Lecture", type: "Video", subject: "Statistics", shared: true, downloads: 98, rating: 4.6, author: "Dr. Jane Smith" },
  { id: 3, title: "Cell Division Diagram Pack", type: "Image", subject: "Biology", shared: false, downloads: 67, rating: 4.2, author: "Prof. Williams" },
  { id: 4, title: "History Timeline Template", type: "Template", subject: "History", shared: true, downloads: 201, rating: 4.9, author: "Ms. Garcia" },
  { id: 5, title: "Python Exercises Collection", type: "PDF", subject: "Coding", shared: true, downloads: 156, rating: 4.7, author: "Mr. Lee" },
  { id: 6, title: "Grammar Rules Quick Reference", type: "PDF", subject: "Literature", shared: false, downloads: 34, rating: 4.1, author: "Mrs. Clark" },
];

const typeIcon: Record<string, typeof FileText> = { PDF: FileText, Video: Video, Image: BookOpen, Template: FileText };
const typeColor: Record<string, string> = {
  PDF: "bg-destructive/10 text-destructive", Video: "bg-cyan/10 text-cyan",
  Image: "bg-magenta/10 text-magenta", Template: "bg-accent/10 text-accent",
};

const subjectIcons: Record<string, any> = {
  Mathematics: Calculator,
  Statistics: Activity,
  Biology: Microscope,
  History: HistoryIcon,
  Coding: Bot,
  Literature: PenTool,
  Physics: Atom,
  Chemistry: Beaker,
  Geography: Globe2,
  Music: Music,
  English: BookOpen,
  "Social Studies": Compass,
  "Computer Science": BrainCircuit,
  "General Studies": GraduationCap,
  Science: FlaskConical,
  Languages: Globe,
  Arts: Palette,
};

const subjects = ["All", "Mathematics", "Statistics", "Biology", "History", "Coding", "Literature", "Physics", "Chemistry", "Geography", "Music", "English", "Social Studies", "Computer Science", "Science", "Languages", "Arts"];

export default function TeacherResources() {
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("All");

  const filtered = resources.filter(r =>
    (subject === "All" || r.subject === subject) &&
    r.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Resource Library</h1>
            <p className="text-muted-foreground text-sm mt-1">Share and discover teaching resources with colleagues</p>
          </div>
          <Button variant="hero" size="default"><PlusCircle className="w-4 h-4 mr-2" /> Upload Resource</Button>
        </div>

        {/* Filters */}
        <div className="platform-card p-4 flex flex-wrap items-center gap-3 mb-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-secondary/50 border border-border/30 flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input value={search} onChange={e => setSearch(e.target.value)} type="text" placeholder="Search resources..."
              className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {subjects.map(s => (
              <button key={s} onClick={() => setSubject(s)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${subject === s ? "bg-primary/10 text-primary border-primary/30" : "border-border/30 text-muted-foreground hover:bg-secondary/50"}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Resource Grid */}
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((r, i) => {
            const Icon = typeIcon[r.type] || FileText;
            return (
              <motion.div key={r.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="platform-card p-4 hover:shadow-medium transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${typeColor[r.type]}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-accent fill-accent" />
                    <span className="text-xs font-bold text-foreground">{r.rating}</span>
                  </div>
                </div>
                <h3 className="font-semibold text-foreground text-sm mb-1">{r.title}</h3>
                <p className="text-xs text-muted-foreground mb-3">{r.subject} · by {r.author}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Download className="w-3 h-3" /> {r.downloads}</span>
                  {r.shared ? (
                    <span className="flex items-center gap-1 text-cyan"><Users className="w-3 h-3" /> Shared</span>
                  ) : (
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> Private</span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
