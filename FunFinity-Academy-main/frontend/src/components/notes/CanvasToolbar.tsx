import { motion } from "framer-motion";
import {
  ZoomIn, ZoomOut, Maximize, Plus, Grid3X3,
  Moon, Sun, BookOpen
} from "lucide-react";
import { cn } from "@/lib/utils";

export type PaperStyle = "plain" | "dots" | "grid" | "cornell";

interface CanvasToolbarProps {
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  onAddNote: () => void;
  paperStyle: PaperStyle;
  onPaperStyleChange: (style: PaperStyle) => void;
}

const PAPER_STYLES: { value: PaperStyle; label: string; icon: React.ReactNode }[] = [
  { value: "plain", label: "Plain", icon: <BookOpen className="w-3.5 h-3.5" /> },
  { value: "dots", label: "Dots", icon: <span className="text-[10px] font-bold">···</span> },
  { value: "grid", label: "Grid", icon: <Grid3X3 className="w-3.5 h-3.5" /> },
  { value: "cornell", label: "Cornell", icon: <span className="text-[10px] font-bold">⊞</span> },
];

export default function CanvasToolbar({
  scale, onZoomIn, onZoomOut, onResetView, onAddNote,
  paperStyle, onPaperStyleChange,
}: CanvasToolbarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1 px-2 py-1.5 rounded-2xl glass-card-heavy border border-border/40 shadow-heavy"
    >
      {/* Add Note */}
      <ToolBtn onClick={onAddNote} active>
        <Plus className="w-4 h-4" />
      </ToolBtn>

      <Divider />

      {/* Zoom controls */}
      <ToolBtn onClick={onZoomOut} disabled={scale <= 0.3}>
        <ZoomOut className="w-3.5 h-3.5" />
      </ToolBtn>
      <span className="text-[10px] font-medium text-muted-foreground w-10 text-center select-none">
        {Math.round(scale * 100)}%
      </span>
      <ToolBtn onClick={onZoomIn} disabled={scale >= 2}>
        <ZoomIn className="w-3.5 h-3.5" />
      </ToolBtn>
      <ToolBtn onClick={onResetView}>
        <Maximize className="w-3.5 h-3.5" />
      </ToolBtn>

      <Divider />

      {/* Paper styles */}
      {PAPER_STYLES.map(p => (
        <ToolBtn key={p.value} onClick={() => onPaperStyleChange(p.value)} active={paperStyle === p.value} title={p.label}>
          {p.icon}
        </ToolBtn>
      ))}
    </motion.div>
  );
}

function ToolBtn({ children, onClick, active, disabled, title }: {
  children: React.ReactNode; onClick?: () => void; active?: boolean; disabled?: boolean; title?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "p-2 rounded-xl transition-all disabled:opacity-30",
        active
          ? "bg-primary/10 text-primary shadow-sm"
          : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
      )}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-5 bg-border/40 mx-1" />;
}
