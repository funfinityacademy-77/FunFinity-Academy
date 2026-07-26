import { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { StickyNote, Loader2, Pen, Eraser, Square, Circle, Download, Undo, Redo } from "lucide-react";
import NoteCard, { type CanvasNote } from "@/components/notes/NoteCard";
import NoteEditor from "@/components/notes/NoteEditor";
import CanvasToolbar, { type PaperStyle } from "@/components/notes/CanvasToolbar";
import SourceSidebar, { type SourceItem } from "@/components/notes/SourceSidebar";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

const SOURCES_KEY = "funfinity_sources";

function load<T>(key: string, fallback: T): T {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fallback; } catch { return fallback; }
}

export default function Notes() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch notes from DB
  const { data: dbNotes = [], isLoading } = useQuery({
    queryKey: ["notes", user?.id],
    queryFn: async () => {
      const data = await apiClient.get<any[]>(`/api/users/${user!.id}/notes`);
      return data;
    },
    enabled: !!user,
  });

  // Convert DB notes to canvas notes
  const [notes, setNotes] = useState<CanvasNote[]>([]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (dbNotes.length > 0 && !initialized) {
      setNotes(dbNotes.map((n, i) => ({
        id: n.id,
        title: n.title || "",
        content: n.content || "",
        tags: n.tags || [],
        x: 50 + (i % 3) * 280,
        y: 50 + Math.floor(i / 3) * 220,
        width: 260,
        height: 200,
        color: "glass" as const,
        createdAt: n.created_at,
        updatedAt: n.updated_at,
        zIndex: i + 1,
      })));
      setInitialized(true);
    } else if (dbNotes.length === 0 && !initialized) {
      setInitialized(true);
    }
  }, [dbNotes, initialized]);

  const [sources, setSources] = useState<SourceItem[]>(() => load(SOURCES_KEY, []));
  const [editingNote, setEditingNote] = useState<CanvasNote | null>(null);
  const [paperStyle, setPaperStyle] = useState<PaperStyle>("dots");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0, ox: 0, oy: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const maxZ = useRef(notes.reduce((m, n) => Math.max(m, n.zIndex), 0));

  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingMode, setDrawingMode] = useState<'none' | 'pen' | 'eraser' | 'rectangle' | 'circle'>('none');
  const [drawingColor, setDrawingColor] = useState('#3b82f6');
  const [drawingSize, setDrawingSize] = useState(3);
  const [drawings, setDrawings] = useState<Array<{ type: string; points: number[]; color: string; size: number }>>([]);
  const [currentDrawing, setCurrentDrawing] = useState<number[] | null>(null);
  const [history, setHistory] = useState<Array<typeof drawings>>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const canvasDrawRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  useEffect(() => { localStorage.setItem(SOURCES_KEY, JSON.stringify(sources)); }, [sources]);

  // Upsert note to DB
  const upsertNote = useMutation({
    mutationFn: async (note: CanvasNote) => {
      if (!user) return;
      await apiClient.put(`/api/users/${user.id}/notes/${note.id}`, {
        id: note.id,
        user_id: user.id,
        title: note.title || "Untitled",
        content: note.content,
        tags: note.tags,
        is_pinned: false,
      });
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/api/notes/${id}`);
    },
  });

  const addNote = useCallback(() => {
    maxZ.current += 1;
    const centerX = (-offset.x + 400) / scale;
    const centerY = (-offset.y + 300) / scale;
    const newNote: CanvasNote = {
      id: crypto.randomUUID(),
      title: "",
      content: "",
      tags: [],
      x: centerX + Math.random() * 100,
      y: centerY + Math.random() * 100,
      width: 260,
      height: 200,
      color: "glass",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      zIndex: maxZ.current,
    };
    setNotes(prev => [...prev, newNote]);
    setEditingNote(newNote);
    upsertNote.mutate(newNote);
  }, [offset, scale, upsertNote]);

  const updateNote = useCallback((updated: CanvasNote) => {
    setNotes(prev => prev.map(n => n.id === updated.id ? { ...updated, updatedAt: new Date().toISOString() } : n));
  }, []);

  const saveFromEditor = useCallback((updated: CanvasNote) => {
    updateNote(updated);
    setEditingNote(null);
    upsertNote.mutate(updated);
  }, [updateNote, upsertNote]);

  const deleteNote = useCallback((id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    if (editingNote?.id === id) setEditingNote(null);
    deleteNoteMutation.mutate(id);
  }, [editingNote, deleteNoteMutation]);

  const bringToFront = useCallback((id: string) => {
    maxZ.current += 1;
    setNotes(prev => prev.map(n => n.id === id ? { ...n, zIndex: maxZ.current } : n));
  }, []);

  // Drawing handlers
  const handleCanvasDrawStart = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (drawingMode === 'none') return;
    e.preventDefault();
    setIsDrawing(true);
    const rect = canvasDrawRef.current?.getBoundingClientRect();
    const x = (e.clientX - (rect?.left || 0)) / scale - offset.x;
    const y = (e.clientY - (rect?.top || 0)) / scale - offset.y;
    setCurrentDrawing([x, y]);
  }, [drawingMode, scale, offset]);

  const handleCanvasDrawMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || drawingMode === 'none') return;
    e.preventDefault();
    const rect = canvasDrawRef.current?.getBoundingClientRect();
    const x = (e.clientX - (rect?.left || 0)) / scale - offset.x;
    const y = (e.clientY - (rect?.top || 0)) / scale - offset.y;
    setCurrentDrawing(prev => prev ? [...prev, x, y] : [x, y]);
  }, [isDrawing, drawingMode, scale, offset]);

  const handleCanvasDrawEnd = useCallback(() => {
    if (!isDrawing || !currentDrawing || currentDrawing.length < 4) {
      setIsDrawing(false);
      setCurrentDrawing(null);
      return;
    }
    
    const newDrawing = {
      type: drawingMode,
      points: currentDrawing,
      color: drawingMode === 'eraser' ? 'transparent' : drawingColor,
      size: drawingSize
    };
    
    setDrawings(prev => [...prev, newDrawing]);
    setHistory(prev => [...prev.slice(0, historyIndex + 1), [...drawings, newDrawing]]);
    setHistoryIndex(prev => prev + 1);
    setIsDrawing(false);
    setCurrentDrawing(null);
  }, [isDrawing, currentDrawing, drawingMode, drawingColor, drawingSize, drawings, historyIndex]);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
      setDrawings(history[historyIndex - 1]);
    }
  }, [history, historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1);
      setDrawings(history[historyIndex + 1]);
    }
  }, [history, historyIndex]);

  const handleClearCanvas = useCallback(() => {
    setDrawings([]);
    setHistory([]);
    setHistoryIndex(-1);
  }, []);

  const handleDownloadCanvas = useCallback(() => {
    const canvas = canvasDrawRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `funfinity-notes-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  }, []);

  const handleCanvasPointerDown = (e: React.PointerEvent) => {
    if (e.target !== canvasRef.current) return;
    setIsPanning(true);
    panStart.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
  };
  const handleCanvasPointerMove = (e: React.PointerEvent) => {
    if (!isPanning) return;
    setOffset({
      x: panStart.current.ox + (e.clientX - panStart.current.x),
      y: panStart.current.oy + (e.clientY - panStart.current.y),
    });
  };
  const handleCanvasPointerUp = () => setIsPanning(false);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.08 : 0.08;
      setScale(s => Math.min(2, Math.max(0.3, s + delta)));
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, []);

  const paperBg = getPaperBackground(paperStyle);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)] p-8">
        <div className="w-full max-w-4xl space-y-6">
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden rounded-2xl border border-border/30">
      <SourceSidebar
        sources={sources}
        onAddSource={s => setSources(prev => [...prev, s])}
        onDeleteSource={id => setSources(prev => prev.filter(s => s.id !== id))}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className="flex-1 relative overflow-hidden" style={{ background: "hsl(var(--background))" }}>
        {/* Drawing Toolbar */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-card/90 backdrop-blur-xl border border-border/30 rounded-2xl p-2 shadow-2xl">
          <Button
            variant={drawingMode === 'none' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setDrawingMode('none')}
            className="h-9 w-9 p-0 rounded-xl"
          >
            <StickyNote className="w-4 h-4" />
          </Button>
          <div className="w-px h-6 bg-border/30" />
          <Button
            variant={drawingMode === 'pen' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setDrawingMode('pen')}
            className="h-9 w-9 p-0 rounded-xl"
          >
            <Pen className="w-4 h-4" />
          </Button>
          <Button
            variant={drawingMode === 'eraser' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setDrawingMode('eraser')}
            className="h-9 w-9 p-0 rounded-xl"
          >
            <Eraser className="w-4 h-4" />
          </Button>
          <div className="w-px h-6 bg-border/30" />
          <input
            type="color"
            value={drawingColor}
            onChange={(e) => setDrawingColor(e.target.value)}
            className="w-8 h-8 rounded-lg cursor-pointer border-2 border-border/30"
          />
          <input
            type="range"
            min="1"
            max="20"
            value={drawingSize}
            onChange={(e) => setDrawingSize(Number(e.target.value))}
            className="w-20"
          />
          <div className="w-px h-6 bg-border/30" />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="h-9 w-9 p-0 rounded-xl"
          >
            <Undo className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="h-9 w-9 p-0 rounded-xl"
          >
            <Redo className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownloadCanvas}
            className="h-9 w-9 p-0 rounded-xl"
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>

        <div className="absolute inset-0 pointer-events-none" style={paperBg} />
        <div
          ref={canvasRef}
          className={cn("absolute inset-0", isPanning ? "cursor-grabbing" : drawingMode !== 'none' ? "crosshair" : "cursor-default")}
          onPointerDown={handleCanvasPointerDown}
          onPointerMove={handleCanvasPointerMove}
          onPointerUp={handleCanvasPointerUp}
          onPointerLeave={handleCanvasPointerUp}
        >
          <canvas
            ref={canvasDrawRef}
            className="absolute inset-0 pointer-events-none"
            style={{ width: '100%', height: '100%' }}
            onPointerDown={handleCanvasDrawStart}
            onPointerMove={handleCanvasDrawMove}
            onPointerUp={handleCanvasDrawEnd}
            onPointerLeave={handleCanvasDrawEnd}
          />
          <div style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            transformOrigin: "0 0",
            width: "5000px",
            height: "5000px",
            position: "relative",
          }}>
            {notes.map(note => (
              <NoteCard
                key={note.id}
                note={note}
                scale={scale}
                onUpdate={updateNote}
                onDelete={deleteNote}
                onBringToFront={bringToFront}
                onOpenEditor={setEditingNote}
              />
            ))}
          </div>
        </div>

        {notes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <StickyNote className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
              <p className="text-muted-foreground/60 font-display font-semibold text-lg">Your Canvas is Empty</p>
              <p className="text-muted-foreground/40 text-sm mt-1">Click + to create your first note</p>
            </div>
          </div>
        )}

        <div className="absolute top-4 right-4 z-10 px-3 py-1.5 rounded-full glass-card border border-border/30 text-xs text-muted-foreground font-medium">
          {notes.length} note{notes.length !== 1 ? "s" : ""}
        </div>
      </div>

      <CanvasToolbar
        scale={scale}
        onZoomIn={() => setScale(s => Math.min(2, s + 0.15))}
        onZoomOut={() => setScale(s => Math.max(0.3, s - 0.15))}
        onResetView={() => { setScale(1); setOffset({ x: 0, y: 0 }); }}
        onAddNote={addNote}
        paperStyle={paperStyle}
        onPaperStyleChange={setPaperStyle}
      />

      <AnimatePresence>
        {editingNote && (
          <NoteEditor
            key={editingNote.id}
            note={editingNote}
            onSave={saveFromEditor}
            onClose={() => setEditingNote(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function getPaperBackground(style: PaperStyle): React.CSSProperties {
  switch (style) {
    case "dots":
      return {
        backgroundImage: "radial-gradient(circle, hsl(var(--border) / 0.4) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      };
    case "grid":
      return {
        backgroundImage:
          "linear-gradient(hsl(var(--border) / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border) / 0.3) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      };
    case "cornell":
      return {
        backgroundImage:
          "linear-gradient(hsl(var(--border) / 0.2) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--destructive) / 0.15) 1px, transparent 1px)",
        backgroundSize: "24px 24px, 200px 24px",
      };
    default:
      return {};
  }
}
