import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PanelLeftClose, PanelLeftOpen, Link2, FileText,
  Plus, Trash2, ExternalLink, BookMarked
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface SourceItem {
  id: string;
  type: "link" | "text";
  title: string;
  content: string;
}

interface SourceSidebarProps {
  sources: SourceItem[];
  onAddSource: (source: SourceItem) => void;
  onDeleteSource: (id: string) => void;
  collapsed: boolean;
  onToggle: () => void;
}

export default function SourceSidebar({ sources, onAddSource, onDeleteSource, collapsed, onToggle }: SourceSidebarProps) {
  const [addingType, setAddingType] = useState<"link" | "text" | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");

  const handleAdd = () => {
    if (!newTitle.trim() && !newContent.trim()) return;
    onAddSource({
      id: crypto.randomUUID(),
      type: addingType || "text",
      title: newTitle.trim() || "Untitled",
      content: newContent.trim(),
    });
    setNewTitle("");
    setNewContent("");
    setAddingType(null);
  };

  return (
    <div className={cn(
      "h-full border-r border-border/30 glass-sidebar flex flex-col transition-all duration-300 shrink-0",
      collapsed ? "w-12" : "w-72"
    )}>
      {/* Toggle */}
      <div className="flex items-center justify-between p-3 border-b border-border/20">
        {!collapsed && (
          <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <BookMarked className="w-3.5 h-3.5 text-primary" />
            Sources
          </span>
        )}
        <button onClick={onToggle} className="p-1.5 rounded-lg hover:bg-secondary/60 text-muted-foreground hover:text-foreground transition-colors">
          {collapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>

      {!collapsed && (
        <>
          {/* Add buttons */}
          <div className="flex gap-1.5 p-3">
            <Button size="sm" variant="outline" className="flex-1 text-xs gap-1 rounded-xl h-8"
              onClick={() => setAddingType("link")}>
              <Link2 className="w-3 h-3" /> Link
            </Button>
            <Button size="sm" variant="outline" className="flex-1 text-xs gap-1 rounded-xl h-8"
              onClick={() => setAddingType("text")}>
              <FileText className="w-3 h-3" /> Note
            </Button>
          </div>

          {/* Add form */}
          <AnimatePresence>
            {addingType && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden px-3">
                <div className="space-y-2 pb-3 border-b border-border/20">
                  <Input placeholder="Title..." value={newTitle} onChange={e => setNewTitle(e.target.value)}
                    className="h-7 text-xs rounded-lg bg-secondary/40 border-border/30" />
                  <Input placeholder={addingType === "link" ? "https://..." : "Reference text..."}
                    value={newContent} onChange={e => setNewContent(e.target.value)}
                    className="h-7 text-xs rounded-lg bg-secondary/40 border-border/30" />
                  <div className="flex gap-1.5">
                    <Button size="sm" onClick={handleAdd} className="flex-1 h-7 text-xs rounded-lg gap-1">
                      <Plus className="w-3 h-3" /> Add
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setAddingType(null)} className="h-7 text-xs rounded-lg">
                      Cancel
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sources list */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {sources.length === 0 && (
              <p className="text-[10px] text-muted-foreground/50 text-center py-8">
                Add links & references here
              </p>
            )}
            {sources.map(s => (
              <div key={s.id} className="group flex items-start gap-2 p-2 rounded-xl hover:bg-secondary/40 transition-colors">
                <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  {s.type === "link" ? <Link2 className="w-3 h-3 text-primary" /> : <FileText className="w-3 h-3 text-primary" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{s.title}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{s.content}</p>
                </div>
                <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  {s.type === "link" && (
                    <a href={s.content} target="_blank" rel="noreferrer"
                      className="p-1 rounded-md hover:bg-secondary/60 text-muted-foreground">
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  <button onClick={() => onDeleteSource(s.id)}
                    className="p-1 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
