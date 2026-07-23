import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Trash2, GripVertical, Maximize2, Minimize2, Palette } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface CanvasNote {
  id: string;
  title: string;
  content: string;
  tags: string[];
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  createdAt: string;
  updatedAt: string;
  zIndex: number;
}

const CARD_COLORS = [
  { name: "Default", value: "glass", bg: "bg-card/80 border-border/40" },
  { name: "Cyan", value: "cyan", bg: "bg-cyan/5 border-cyan/20" },
  { name: "Orange", value: "orange", bg: "bg-accent/5 border-accent/20" },
  { name: "Magenta", value: "magenta", bg: "bg-magenta/5 border-magenta/20" },
  { name: "Success", value: "success", bg: "bg-success/5 border-success/20" },
];

export function getCardBg(color: string) {
  return CARD_COLORS.find(c => c.value === color)?.bg ?? CARD_COLORS[0].bg;
}

interface NoteCardProps {
  note: CanvasNote;
  scale: number;
  onUpdate: (note: CanvasNote) => void;
  onDelete: (id: string) => void;
  onBringToFront: (id: string) => void;
  onOpenEditor: (note: CanvasNote) => void;
}

export default function NoteCard({ note, scale, onUpdate, onDelete, onBringToFront, onOpenEditor }: NoteCardProps) {
  const [showColors, setShowColors] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef<{ startX: number; startY: number; startW: number; startH: number } | null>(null);

  const handleResizeStart = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    resizeRef.current = { startX: e.clientX, startY: e.clientY, startW: note.width, startH: note.height };

    const onMove = (ev: PointerEvent) => {
      if (!resizeRef.current) return;
      const dx = (ev.clientX - resizeRef.current.startX) / scale;
      const dy = (ev.clientY - resizeRef.current.startY) / scale;
      onUpdate({
        ...note,
        width: Math.max(200, resizeRef.current.startW + dx),
        height: Math.max(120, resizeRef.current.startH + dy),
      });
    };
    const onUp = () => {
      setIsResizing(false);
      resizeRef.current = null;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0}
      onDragStart={() => onBringToFront(note.id)}
      onDragEnd={(_, info) => {
        onUpdate({
          ...note,
          x: note.x + info.offset.x / scale,
          y: note.y + info.offset.y / scale,
        });
      }}
      style={{
        position: "absolute",
        left: note.x,
        top: note.y,
        width: note.width,
        height: note.height,
        zIndex: note.zIndex,
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "group rounded-2xl border backdrop-blur-xl shadow-soft cursor-grab active:cursor-grabbing select-none flex flex-col overflow-hidden transition-colors",
        getCardBg(note.color),
        isResizing && "pointer-events-none"
      )}
      onDoubleClick={() => onOpenEditor(note)}
    >
      {/* Header bar */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border-border/20 shrink-0">
        <GripVertical className="w-3.5 h-3.5 text-muted-foreground/40" />
        <span className="text-xs font-semibold text-foreground truncate flex-1">
          {note.title || "Untitled"}
        </span>
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={(e) => { e.stopPropagation(); setShowColors(!showColors); }}
            className="p-1 rounded-md hover:bg-secondary/60 text-muted-foreground hover:text-foreground transition-colors">
            <Palette className="w-3 h-3" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(note.id); }}
            className="p-1 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Color picker */}
      {showColors && (
        <div className="flex gap-1.5 px-3 py-2 border-b border-border/20">
          {CARD_COLORS.map(c => (
            <button key={c.value}
              onClick={(e) => { e.stopPropagation(); onUpdate({ ...note, color: c.value }); setShowColors(false); }}
              className={cn("w-5 h-5 rounded-full border-2 transition-all",
                c.value === "glass" && "bg-card border-border",
                c.value === "cyan" && "bg-cyan/30 border-cyan/50",
                c.value === "orange" && "bg-accent/30 border-accent/50",
                c.value === "magenta" && "bg-magenta/30 border-magenta/50",
                c.value === "success" && "bg-success/30 border-success/50",
                note.color === c.value && "ring-2 ring-primary ring-offset-1 ring-offset-background"
              )} />
          ))}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-hidden px-3 py-2">
        <p className="text-xs text-muted-foreground whitespace-pre-wrap line-clamp-[12] leading-relaxed">
          {note.content || "Double-click to edit..."}
        </p>
      </div>

      {/* Tags */}
      {note.tags.length > 0 && (
        <div className="flex gap-1 px-3 py-1.5 flex-wrap border-t border-border/10">
          {note.tags.slice(0, 3).map(t => (
            <Badge key={t} variant="secondary" className="text-[9px] px-1.5 py-0">{t}</Badge>
          ))}
          {note.tags.length > 3 && (
            <span className="text-[9px] text-muted-foreground">+{note.tags.length - 3}</span>
          )}
        </div>
      )}

      {/* Resize handle */}
      <div
        onPointerDown={handleResizeStart}
        className="absolute bottom-0 right-0 w-5 h-5 cursor-se-resize opacity-0 group-hover:opacity-60 transition-opacity"
        style={{ touchAction: "none" }}
      >
        <svg viewBox="0 0 20 20" className="w-full h-full text-muted-foreground">
          <path d="M14 20L20 14M10 20L20 10M6 20L20 6" stroke="currentColor" strokeWidth="1.5" fill="none" />
        </svg>
      </div>
    </motion.div>
  );
}
