import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Pen, Highlighter, Eraser, Type, Square, Circle, 
  Undo, Redo, Download, Upload, Trash2, Layers,
  Grid, FileText, Sparkles, Save, ZoomIn, ZoomOut, Plus,
  RotateCw, Move, Maximize2, Minimize2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Tool = "pen" | "highlighter" | "eraser" | "text" | "rectangle" | "circle";
type Background = "blank" | "dot-grid" | "graph" | "lined";

interface Layer {
  id: string;
  type: "canvas" | "text" | "pdf" | "image";
  visible: boolean;
  locked: boolean;
  data?: any;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rotation?: number;
}

interface TransformHandle {
  type: 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'rotate';
  x: number;
  y: number;
}

export default function DigitalNotebook() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null);
  const [tool, setTool] = useState<Tool>("pen");
  const [background, setBackground] = useState<Background>("dot-grid");
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [zoom, setZoom] = useState(1);
  const [layers, setLayers] = useState<Layer[]>([
    { id: "1", type: "canvas", visible: true, locked: false }
  ]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeHandle, setResizeHandle] = useState<TransformHandle | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Background patterns
  const backgroundStyles: Record<Background, string> = {
    "blank": "bg-background",
    "dot-grid": "bg-[radial-gradient(circle,#888_1px,transparent_1px)] [background-size:20px_20px]",
    "graph": "bg-[linear-gradient(#e5e5e5_1px,transparent_1px),linear-gradient(90deg,#e5e5e5_1px,transparent_1px)] [background-size:20px_20px]",
    "lined": "bg-[linear-gradient(transparent_24px,#e5e5e5_25px)] [background-size:100%_25px]"
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      if (containerRef.current) {
        canvas.width = containerRef.current.offsetWidth;
        canvas.height = containerRef.current.offsetHeight;
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool === "text") return;
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;

    ctx.beginPath();
    ctx.moveTo(x, y);

    // Save state for undo
    if (historyIndex === -1 || historyIndex < history.length - 1) {
      setHistory(history.slice(0, historyIndex + 1));
    }
    setHistory([...history, ctx.getImageData(0, 0, canvas.width, canvas.height)]);
    setHistoryIndex(prev => prev + 1);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || tool === "text") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;

    ctx.lineWidth = strokeWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = "rgba(0,0,0,1)";
    } else if (tool === "highlighter") {
      ctx.globalCompositeOperation = "multiply";
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth * 3;
      ctx.globalAlpha = 0.5;
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = strokeColor;
      ctx.globalAlpha = 1;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.closePath();
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      setHistoryIndex(historyIndex - 1);
      ctx.putImageData(history[historyIndex - 1], 0, 0);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      setHistoryIndex(historyIndex + 1);
      ctx.putImageData(history[historyIndex + 1], 0, 0);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const calculateRotation = (x1: number, y1: number, x2: number, y2: number) => {
    return Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
  };

  const getTransformHandles = (element: Layer) => {
    if (!element.x || !element.y || !element.width || !element.height) return [];
    
    const { x, y, width, height } = element;
    const handles: TransformHandle[] = [
      { type: 'nw', x: x, y: y },
      { type: 'n', x: x + width / 2, y: y },
      { type: 'ne', x: x + width, y: y },
      { type: 'e', x: x + width, y: y + height / 2 },
      { type: 'se', x: x + width, y: y + height },
      { type: 's', x: x + width / 2, y: y + height },
      { type: 'sw', x: x, y: y + height },
      { type: 'w', x: x, y: y + height / 2 },
      { type: 'rotate', x: x + width, y: y - 20 },
    ];
    return handles;
  };

  const handleElementMouseDown = (e: React.MouseEvent, elementId: string, element: Layer) => {
    if (element.locked) return;
    e.stopPropagation();
    setSelectedElement(elementId);
    setIsDragging(true);
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleResizeMouseDown = (e: React.MouseEvent, handle: TransformHandle, elementId: string) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeHandle(handle);
  };

  const handleRotateMouseDown = (e: React.MouseEvent, elementId: string, element: Layer) => {
    e.stopPropagation();
    setIsRotating(true);
    setSelectedElement(elementId);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!selectedElement) return;
    
    const element = layers.find(l => l.id === selectedElement);
    if (!element) return;

    if (isDragging) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / zoom - dragOffset.x;
      const y = (e.clientY - rect.top) / zoom - dragOffset.y;
      
      setLayers(layers.map(l => 
        l.id === selectedElement ? { ...l, x, y } : l
      ));
    }

    if (isRotating && element.x !== undefined && element.y !== undefined && element.width !== undefined) {
      const centerX = element.x + element.width / 2;
      const centerY = element.y + (element.height || 50) / 2;
      const rotation = calculateRotation(centerX, centerY, e.clientX, e.clientY);
      
      setLayers(layers.map(l => 
        l.id === selectedElement ? { ...l, rotation } : l
      ));
    }

    if (isResizing && resizeHandle && element.x !== undefined) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left) / zoom;
      const mouseY = (e.clientY - rect.top) / zoom;

      let newWidth = element.width || 100;
      let newHeight = element.height || 50;
      let newX = element.x;
      let newY = element.y;

      switch (resizeHandle.type) {
        case 'se':
          newWidth = mouseX - element.x;
          newHeight = mouseY - element.y;
          break;
        case 'e':
          newWidth = mouseX - element.x;
          break;
        case 's':
          newHeight = mouseY - element.y;
          break;
        case 'nw':
          newWidth = (element.x + (element.width || 100)) - mouseX;
          newHeight = (element.y + (element.height || 50)) - mouseY;
          newX = mouseX;
          newY = mouseY;
          break;
        case 'ne':
          newWidth = mouseX - element.x;
          newHeight = (element.y + (element.height || 50)) - mouseY;
          newY = mouseY;
          break;
        case 'sw':
          newWidth = (element.x + (element.width || 100)) - mouseX;
          newHeight = mouseY - element.y;
          newX = mouseX;
          break;
        case 'n':
          newHeight = (element.y + (element.height || 50)) - mouseY;
          newY = mouseY;
          break;
        case 'w':
          newWidth = (element.x + (element.width || 100)) - mouseX;
          newX = mouseX;
          break;
      }

      setLayers(layers.map(l => 
        l.id === selectedElement ? { ...l, x: newX, y: newY, width: Math.max(20, newWidth), height: Math.max(20, newHeight) } : l
      ));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setIsRotating(false);
    setResizeHandle(null);
  };

  const getCursorForHandle = (type: string) => {
    const cursors: Record<string, string> = {
      'nw': 'nw-resize', 'n': 'n-resize', 'ne': 'ne-resize',
      'e': 'e-resize', 'se': 'se-resize', 's': 's-resize',
      'sw': 'sw-resize', 'w': 'w-resize', 'rotate': 'grab'
    };
    return cursors[type] || 'default';
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Toolbar */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="border-b border-border/30 bg-card/50 backdrop-blur-sm p-3 flex items-center justify-between gap-4"
      >
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 rounded-lg bg-secondary/50 border border-border/30">
            {[
              { id: "pen", icon: Pen, label: "Pen" },
              { id: "highlighter", icon: Highlighter, label: "Highlighter" },
              { id: "eraser", icon: Eraser, label: "Eraser" },
              { id: "text", icon: Type, label: "Text" },
            ].map((t) => (
              <Button
                key={t.id}
                variant={tool === t.id ? "default" : "ghost"}
                size="sm"
                onClick={() => setTool(t.id as Tool)}
                className={cn("h-8 w-8 p-0", tool === t.id && "bg-primary text-primary-foreground")}
                title={t.label}
              >
                <t.icon className="w-4 h-4" />
              </Button>
            ))}
          </div>

          <div className="h-6 w-px bg-border/30" />

          <div className="flex items-center gap-2">
            <input
              type="color"
              value={strokeColor}
              onChange={(e) => setStrokeColor(e.target.value)}
              className="w-8 h-8 rounded cursor-pointer border-0"
              title="Stroke Color"
            />
            <Select value={strokeWidth.toString()} onValueChange={(v) => setStrokeWidth(Number(v))}>
              <SelectTrigger className="w-20 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 8, 12].map((size) => (
                  <SelectItem key={size} value={size.toString()}>{size}px</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Select value={background} onValueChange={(v) => setBackground(v as Background)}>
            <SelectTrigger className="w-32 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="blank">Blank</SelectItem>
              <SelectItem value="dot-grid">Dot Grid</SelectItem>
              <SelectItem value="graph">Graph</SelectItem>
              <SelectItem value="lined">Lined</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-1 p-1 rounded-lg bg-secondary/50 border border-border/30">
            <Button variant="ghost" size="sm" onClick={handleUndo} disabled={historyIndex <= 0} className="h-8 w-8 p-0">
              <Undo className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleRedo} disabled={historyIndex >= history.length - 1} className="h-8 w-8 p-0">
              <Redo className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={clearCanvas} className="h-8 w-8 p-0">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center gap-1 p-1 rounded-lg bg-secondary/50 border border-border/30">
            <Button variant="ghost" size="sm" onClick={() => setZoom(Math.max(0.5, zoom - 0.1))} className="h-8 w-8 p-0">
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-xs font-medium w-12 text-center">{Math.round(zoom * 100)}%</span>
            <Button variant="ghost" size="sm" onClick={() => setZoom(Math.min(3, zoom + 0.1))} className="h-8 w-8 p-0">
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>

          <Button variant="hero" size="sm" className="gap-2">
            <Save className="w-4 h-4" />
            Save
          </Button>
        </div>
      </motion.div>

      {/* Canvas Workspace */}
      <div 
        ref={containerRef}
        className={cn(
          "flex-1 relative overflow-hidden",
          backgroundStyles[background]
        )}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Card 
          className="relative shadow-2xl" 
          style={{ transform: `scale(${zoom})` }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
            <canvas
              ref={canvasRef}
              className="cursor-crosshair"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              style={{ touchAction: 'none' }}
            />

            {/* Selected Element Controls */}
            {selectedElement && (() => {
              const element = layers.find(l => l.id === selectedElement);
              if (!element || element.x === undefined) return null;
              const handles = getTransformHandles(element);
              
              return (
                <>
                  {/* Bounding Box */}
                  <div
                    className="absolute border-2 border-primary rounded pointer-events-none"
                    style={{
                      left: element.x,
                      top: element.y,
                      width: element.width || 100,
                      height: element.height || 50,
                      transform: `rotate(${element.rotation || 0}deg)`,
                      transformOrigin: 'center center'
                    }}
                  />
                  
                  {/* Resize Handles */}
                  {handles.slice(0, 8).map((handle) => (
                    <div
                      key={handle.type}
                      className="absolute w-3 h-3 bg-white border-2 border-primary rounded-full cursor-pointer hover:bg-primary hover:border-white transition-colors"
                      style={{
                        left: handle.x - 6,
                        top: handle.y - 6,
                        cursor: getCursorForHandle(handle.type)
                      }}
                      onMouseDown={(e) => handleResizeMouseDown(e, handle, selectedElement)}
                    />
                  ))}
                  
                  {/* Rotation Handle */}
                  {handles[8] && (
                    <div
                      className="absolute cursor-pointer"
                      style={{ left: handles[8].x - 10, top: handles[8].y - 10 }}
                      onMouseDown={(e) => handleRotateMouseDown(e, selectedElement, element)}
                    >
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white shadow-lg">
                        <RotateCw className="w-3 h-3" />
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </Card>
        </motion.div>

        {/* Layer Panel */}
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="absolute top-4 right-4 w-64 glass-card border-border/30 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <Layers className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-sm">Layers</h3>
          </div>
          <div className="space-y-2">
            {layers.map((layer) => (
              <div
                key={layer.id}
                className={cn(
                  "flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors",
                  selectedElement === layer.id ? "bg-primary/20 border border-primary/30" : "bg-secondary/30 hover:bg-secondary/50"
                )}
                onClick={() => setSelectedElement(layer.id)}
              >
                <div className="w-8 h-8 rounded bg-background border border-border/30 flex items-center justify-center">
                  {layer.type === "canvas" && <Pen className="w-4 h-4 text-muted-foreground" />}
                  {layer.type === "text" && <Type className="w-4 h-4 text-muted-foreground" />}
                  {layer.type === "pdf" && <FileText className="w-4 h-4 text-muted-foreground" />}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium">Layer {layer.id}</p>
                  <p className="text-[10px] text-muted-foreground capitalize">{layer.type}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLayers(layers.map(l => l.id === layer.id ? { ...l, visible: !l.visible } : l));
                  }}
                >
                  {layer.visible ? <Sparkles className="w-3 h-3" /> : <Grid className="w-3 h-3 opacity-50" />}
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-2 gap-2"
              onClick={() => setLayers([...layers, { id: String(layers.length + 1), type: "canvas", visible: true, locked: false }])}
            >
              <Plus className="w-4 h-4" />
              Add Layer
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
