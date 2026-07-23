import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlusCircle, BookOpen, Video, Target, FileText, GripVertical, Trash2, Save, Eye, ChevronDown, ChevronUp, Map as MapIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

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

interface CourseBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (courseData: any) => void;
}

const typeIcon: Record<string, typeof Video> = { video: Video, reading: FileText, quiz: Target, assignment: BookOpen };
const typeColor: Record<string, string> = {
  video: "bg-cyan/10 text-cyan", reading: "bg-primary/10 text-primary",
  quiz: "bg-accent/10 text-accent", assignment: "bg-magenta/10 text-magenta",
};

export default function CourseBuilderModal({ isOpen, onClose, onSave }: CourseBuilderModalProps) {
  const [courseTitle, setCourseTitle] = useState("");
  const [courseDesc, setCourseDesc] = useState("");
  const [modules, setModules] = useState<Module[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const toggleModule = (id: number) => {
    setModules(m => m.map(mod => mod.id === id ? { ...mod, expanded: !mod.expanded } : mod));
  };

  const addLesson = (moduleId: number) => {
    setModules(m => m.map(mod => mod.id === moduleId ? {
      ...mod,
      lessons: [...mod.lessons, { id: Date.now(), title: "New Lesson", type: "video" as const, duration: "10 min" }]
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

  const handleSave = async () => {
    if (!courseTitle.trim()) return;
    
    setIsSaving(true);
    const courseData = {
      title: courseTitle,
      description: courseDesc,
      modules,
    };
    
    if (onSave) {
      await onSave(courseData);
    }
    
    setIsSaving(false);
    onClose();
  };

  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl">Course Builder</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">Design and structure your curriculum</p>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Course Meta */}
          <div className="platform-card p-6">
            <h2 className="font-display text-base font-semibold text-foreground mb-4">Course Details</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Course Title</label>
                <Input 
                  value={courseTitle} 
                  onChange={e => setCourseTitle(e.target.value)}
                  placeholder="Enter course title..."
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Description</label>
                <Textarea 
                  value={courseDesc} 
                  onChange={e => setCourseDesc(e.target.value)} 
                  rows={2}
                  placeholder="Enter course description..."
                  className="w-full resize-none"
                />
              </div>
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span>{modules.length} modules</span>
                <span>{totalLessons} lessons</span>
              </div>
            </div>
          </div>

          {/* Modules */}
          <div className="space-y-3">
            {modules.length === 0 ? (
              <div className="platform-card p-12 flex flex-col items-center justify-center text-center">
                <GripVertical className="w-12 h-12 text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground text-sm">No modules added yet</p>
              </div>
            ) : (
              modules.map((mod) => (
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
                            <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0", typeColor[lesson.type])}>
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <Input 
                              defaultValue={lesson.title}
                              className="flex-1 bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 px-2 py-1 text-sm"
                            />
                            <span className="text-[10px] text-muted-foreground shrink-0">{lesson.duration}</span>
                            <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-semibold capitalize", typeColor[lesson.type])}>{lesson.type}</span>
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
              ))
            )}
          </div>

          <Button variant="outline" size="default" className="w-full" onClick={addModule}>
            <PlusCircle className="w-4 h-4 mr-2" /> Add Module
          </Button>

          <div className="flex gap-3 pt-4 border-t border-border/20">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="hero" className="flex-1" onClick={handleSave} disabled={isSaving || !courseTitle.trim()}>
              {isSaving ? <><Save className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : <><Save className="w-4 h-4 mr-2" /> Save & Publish</>}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

