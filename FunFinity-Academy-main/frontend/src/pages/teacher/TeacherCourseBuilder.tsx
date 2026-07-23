import { useState } from "react";
import { motion } from "framer-motion";
import { PlusCircle, BookOpen, Video, Target, FileText, GripVertical, Trash2, Save, Eye, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Lesson {
  id: number;
  title: string;
  type: "video" | "reading" | "quiz" | "assignment";
  duration: string;
}

interface Module {
  id: number;
  title: string;
  lessons: Lesson[];
  expanded: boolean;
}

const typeIcon: Record<string, typeof Video> = { video: Video, reading: FileText, quiz: Target, assignment: BookOpen };
const typeColor: Record<string, string> = {
  video: "bg-cyan/10 text-cyan", reading: "bg-primary/10 text-primary",
  quiz: "bg-accent/10 text-accent", assignment: "bg-magenta/10 text-magenta",
};

const initialModules: Module[] = [
  {
    id: 1, title: "Module 1: Introduction", expanded: true,
    lessons: [
      { id: 1, title: "Welcome & Course Overview", type: "video", duration: "10 min" },
      { id: 2, title: "Course Syllabus", type: "reading", duration: "5 min" },
      { id: 3, title: "Pre-Assessment Quiz", type: "quiz", duration: "15 min" },
    ],
  },
  {
    id: 2, title: "Module 2: Core Concepts", expanded: true,
    lessons: [
      { id: 4, title: "Fundamentals Lecture", type: "video", duration: "25 min" },
      { id: 5, title: "Practice Problems", type: "assignment", duration: "30 min" },
      { id: 6, title: "Key Terms & Definitions", type: "reading", duration: "10 min" },
      { id: 7, title: "Chapter Quiz", type: "quiz", duration: "20 min" },
    ],
  },
  {
    id: 3, title: "Module 3: Advanced Topics", expanded: false,
    lessons: [
      { id: 8, title: "Deep Dive Lecture", type: "video", duration: "35 min" },
      { id: 9, title: "Case Study Analysis", type: "assignment", duration: "45 min" },
    ],
  },
];

export default function TeacherCourseBuilder() {
  const [courseTitle, setCourseTitle] = useState("Algebra Foundations");
  const [courseDesc, setCourseDesc] = useState("A comprehensive introduction to algebraic concepts for Grade 8 students.");
  const [modules, setModules] = useState(initialModules);

  const toggleModule = (id: number) => {
    setModules(m => m.map(mod => mod.id === id ? { ...mod, expanded: !mod.expanded } : mod));
  };

  const addLesson = (moduleId: number) => {
    setModules(m => m.map(mod => mod.id === moduleId ? {
      ...mod,
      lessons: [...mod.lessons, { id: Date.now(), title: "New Lesson", type: "video", duration: "10 min" }]
    } : mod));
  };

  const removeLesson = (moduleId: number, lessonId: number) => {
    setModules(m => m.map(mod => mod.id === moduleId ? {
      ...mod, lessons: mod.lessons.filter(l => l.id !== lessonId)
    } : mod));
  };

  const addModule = () => {
    setModules(m => [...m, { id: Date.now(), title: `Module ${m.length + 1}: New Module`, lessons: [], expanded: true }]);
  };

  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Course Builder</h1>
            <p className="text-muted-foreground text-sm mt-1">Design and structure your curriculum</p>
          </div>
          <div className="flex gap-2">
            <Button variant="heroOutline" size="default"><Eye className="w-4 h-4 mr-2" /> Preview</Button>
            <Button variant="hero" size="default"><Save className="w-4 h-4 mr-2" /> Save & Publish</Button>
          </div>
        </div>

        {/* Course Meta */}
        <div className="platform-card p-6 mb-4">
          <h2 className="font-display text-base font-semibold text-foreground mb-4">Course Details</h2>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Course Title</label>
              <input value={courseTitle} onChange={e => setCourseTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border/30 text-sm font-medium text-foreground outline-none focus:border-primary/50" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Description</label>
              <textarea value={courseDesc} onChange={e => setCourseDesc(e.target.value)} rows={2}
                className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border/30 text-sm text-foreground outline-none focus:border-primary/50 resize-none" />
            </div>
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span>{modules.length} modules</span>
              <span>{totalLessons} lessons</span>
            </div>
          </div>
        </div>

        {/* Modules */}
        <div className="space-y-3">
          {modules.map((mod) => (
            <div key={mod.id} className="platform-card overflow-hidden">
              <button onClick={() => toggleModule(mod.id)}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-secondary/20 transition-colors">
                <div className="flex items-center gap-3">
                  <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                  <h3 className="font-display text-sm font-semibold text-foreground">{mod.title}</h3>
                  <span className="text-[10px] text-muted-foreground">{mod.lessons.length} lessons</span>
                </div>
                {mod.expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </button>

              {mod.expanded && (
                <div className="border-t border-border/20">
                  {mod.lessons.map((lesson) => {
                    const Icon = typeIcon[lesson.type];
                    return (
                      <div key={lesson.id} className="px-5 py-3 flex items-center gap-3 border-b border-border/10 last:border-b-0 hover:bg-secondary/10 transition-colors group">
                        <GripVertical className="w-3 h-3 text-muted-foreground/50 cursor-grab" />
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${typeColor[lesson.type]}`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <input defaultValue={lesson.title}
                          className="flex-1 bg-transparent text-sm text-foreground outline-none focus:bg-secondary/30 px-2 py-1 rounded-lg" />
                        <span className="text-[10px] text-muted-foreground shrink-0">{lesson.duration}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold capitalize ${typeColor[lesson.type]}`}>{lesson.type}</span>
                        <button onClick={() => removeLesson(mod.id, lesson.id)}
                          className="p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-destructive/10 text-destructive transition-all">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                  <button onClick={() => addLesson(mod.id)}
                    className="w-full px-5 py-3 text-xs text-primary hover:bg-primary/5 transition-colors flex items-center gap-2">
                    <PlusCircle className="w-3 h-3" /> Add Lesson
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <Button variant="outline" size="default" className="w-full mt-2" onClick={addModule}>
          <PlusCircle className="w-4 h-4 mr-2" /> Add Module
        </Button>
      </motion.div>
    </div>
  );
}
