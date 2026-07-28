import { useState } from "react";
import { motion } from "framer-motion";
import { X, Save, Tag, FileText, Sparkles, Clock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { CanvasNote } from "./NoteCard";
import { RichTextEditor } from "./RichTextEditor";
import { format } from "date-fns";

interface NoteEditorProps {
  note: CanvasNote;
  onSave: (note: CanvasNote) => void;
  onClose: () => void;
}

export default function NoteEditor({ note, onSave, onClose }: NoteEditorProps) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState(note.tags);

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput("");
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/40 backdrop-blur-md"
      onClick={onClose}>
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-4xl max-h-[90vh] flex flex-col glass-card-heavy rounded-[2rem] border border-border/40 shadow-2xl overflow-hidden bg-background/80">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-border/20">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-primary">
              <FileText className="w-5 h-5" />
              <span className="text-sm font-bold uppercase tracking-wider">Workspace Note</span>
            </div>
            <div className="flex items-center gap-4 mt-1 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Updated {format(new Date(note.updatedAt), "MMM d, h:mm a")}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button size="sm" variant="ghost" onClick={onClose} className="rounded-xl h-10 w-10 p-0"><X className="w-5 h-5" /></Button>
            <Button size="default" variant="hero" onClick={() => onSave({ ...note, title, content, tags, updatedAt: new Date().toISOString() })} className="gap-2 px-6 rounded-xl shadow-glow-primary">
              <Save className="w-4 h-4" /> Save Note
            </Button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Untitled Note"
            className="w-full bg-transparent font-display text-3xl font-bold text-foreground placeholder:text-muted-foreground/30 outline-none border-none focus:ring-0"
          />

          <RichTextEditor
            content={content}
            onChange={setContent}
            placeholder="Start capturing your thoughts, paste references, or use AI to generate summaries..."
          />

          {/* Tags Section */}
          <div className="space-y-3 pt-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              <Tag className="w-3.5 h-3.5" />
              Tags & Taxonomy
            </div>
            <div className="flex flex-wrap items-center gap-2 p-4 rounded-2xl bg-secondary/20 border border-border/10">
              {tags.map(t => (
                <Badge key={t} variant="secondary" className="pl-3 pr-1 py-1.5 rounded-lg text-xs gap-2 bg-background/50 border-border/30">
                  {t}
                  <button onClick={() => setTags(tags.filter(x => x !== t))} className="w-5 h-5 flex items-center justify-center rounded-md hover:bg-destructive/10 hover:text-destructive transition-colors"><X className="w-3 h-3" /></button>
                </Badge>
              ))}
              <input
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                placeholder="Add classification..."
                className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 outline-none min-w-[150px] px-2"
              />
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
