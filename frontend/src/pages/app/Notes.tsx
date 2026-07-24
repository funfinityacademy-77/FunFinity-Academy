import { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { StickyNote, Loader2 } from "lucide-react";
import NoteCard, { type CanvasNote } from "@/components/notes/NoteCard";
import NoteEditor from "@/components/notes/NoteEditor";
import CanvasToolbar, { type PaperStyle } from "@/components/notes/CanvasToolbar";
import SourceSidebar, { type SourceItem } from "@/components/notes/SourceSidebar";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

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
        <div className="absolute inset-0 pointer-events-none" style={paperBg} />
        <div
          ref={canvasRef}
          className={cn("absolute inset-0", isPanning ? "cursor-grabbing" : "cursor-default")}
          onPointerDown={handleCanvasPointerDown}
          onPointerMove={handleCanvasPointerMove}
          onPointerUp={handleCanvasPointerUp}
          onPointerLeave={handleCanvasPointerUp}
        >
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
