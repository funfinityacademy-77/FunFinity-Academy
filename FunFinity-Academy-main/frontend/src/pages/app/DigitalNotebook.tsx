import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Pen, Highlighter, Eraser, Type, Square, Circle, 
  Undo, Redo, Download, Upload, Trash2, Layers,
  Grid, FileText, Sparkles, Save, ZoomIn, ZoomOut, Plus,
  RotateCw, Move, Maximize2, Minimize2, Bold, Italic,
  Underline, AlignLeft, AlignCenter, AlignRight, List,
  FileImage, ChevronRight, ChevronDown, Lock, Unlock, X, Wand2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import AIAssetGenerator from "@/components/notebook/AIAssetGenerator";

type Tool = "pen" | "highlighter" | "eraser" | "text" | "rectangle" | "circle";
type Background = "blank" | "dot-grid" | "graph" | "lined";
type BrushType = "pen" | "fineliner" | "highlighter" | "eraser";

interface Point {
  x: number;
  y: number;
  pressure?: number;
}

interface Stroke {
  points: Point[];
  color: string;
  width: number;
  brushType: BrushType;
  opacity?: number;
}

interface Layer {
  id: string;
  type: "canvas" | "text" | "pdf" | "image" | "vector";
  visible: boolean;
  locked: boolean;
  zIndex: number;
  data?: any;
  strokes?: Stroke[];
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rotation?: number;
  content?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  fontStyle?: string;
  textDecoration?: string;
  textAlign?: string;
  color?: string;
}

interface TextElement {
  id: string;
  content: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  fontWeight: string;
  fontStyle: string;
  textDecoration: string;
  textAlign: string;
  color: string;
}

interface TransformHandle {
  type: 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'rotate';
  x: number;
  y: number;
}

export default function DigitalNotebook() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pdfLayerRef = useRef<HTMLDivElement>(null);
  const domLayerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tool, setTool] = useState<Tool>("pen");
  const [brushType, setBrushType] = useState<BrushType>("pen");
  const [background, setBackground] = useState<Background>("dot-grid");
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [opacity, setOpacity] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [layers, setLayers] = useState<Layer[]>([
    { id: "1", type: "vector", visible: true, locked: false, zIndex: 1, strokes: [] }
  ]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeHandle, setResizeHandle] = useState<TransformHandle | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
  const [history, setHistory] = useState<Layer[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showTextToolbar, setShowTextToolbar] = useState(false);
  const [textToolbarPosition, setTextToolbarPosition] = useState({ x: 0, y: 0 });
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfScale, setPdfScale] = useState(1.5);
  const animationFrameRef = useRef<number>();
  const [isAssetGeneratorOpen, setIsAssetGeneratorOpen] = useState(false);
  const [canvasCenter, setCanvasCenter] = useState({ x: 0, y: 0 });

  // Background patterns
  const backgroundStyles: Record<Background, string> = {
    "blank": "bg-background",
    "dot-grid": "bg-[radial-gradient(circle,#888_1px,transparent_1px)] [background-size:20px_20px]",
    "graph": "bg-[linear-gradient(#e5e5e5_1px,transparent_1px),linear-gradient(90deg,#e5e5e5_1px,transparent_1px)] [background-size:20px_20px]",
    "lined": "bg-[linear-gradient(transparent_24px,#e5e5e5_25px)] [background-size:100%_25px]"
  };

  // Canvas setup with proper sizing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const resizeCanvas = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        redrawCanvas();
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [layers, zoom]);

  // Redraw canvas with all strokes
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw all visible vector layers
    layers.forEach(layer => {
      if (layer.visible && layer.type === 'vector' && layer.strokes) {
        layer.strokes.forEach(stroke => {
          drawStroke(ctx, stroke);
        });
      }
    });
  }, [layers]);

  // Draw a single stroke
  const drawStroke = (ctx: CanvasRenderingContext2D, stroke: Stroke) => {
    if (stroke.points.length < 2) return;

    ctx.beginPath();
    ctx.moveTo(stroke.points[0].x, stroke.points[0].y);

    for (let i = 1; i < stroke.points.length; i++) {
      const point = stroke.points[i];
      ctx.lineTo(point.x, point.y);
    }

    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (stroke.brushType === 'highlighter') {
      ctx.globalCompositeOperation = 'multiply';
      ctx.globalAlpha = stroke.opacity || 0.4;
    } else if (stroke.brushType === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.globalAlpha = 1;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = stroke.opacity || 1;
    }

    ctx.stroke();
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
  };

  // Pointer event handlers for pressure-sensitive drawing
  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (tool === "text") return;
    e.preventDefault();
    setIsDrawing(true);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;
    const pressure = e.pressure || 0.5;

    // Create new stroke
    const newStroke: Stroke = {
      points: [{ x, y, pressure }],
      color: strokeColor,
      width: brushType === 'highlighter' ? strokeWidth * 3 : strokeWidth,
      brushType: brushType,
      opacity: brushType === 'highlighter' ? 0.4 : opacity
    };

    setCurrentStroke(newStroke);

    // Save state for undo
    if (historyIndex === -1 || historyIndex < history.length - 1) {
      setHistory(history.slice(0, historyIndex + 1));
    }
    setHistory([...history, JSON.parse(JSON.stringify(layers))]);
    setHistoryIndex(prev => prev + 1);
  }, [tool, zoom, strokeColor, strokeWidth, brushType, opacity, layers, history, historyIndex]);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentStroke || tool === "text") return;
    e.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;
    const pressure = e.pressure || 0.5;

    // Add point to current stroke with pressure sensitivity
    const updatedStroke = {
      ...currentStroke,
      points: [...currentStroke.points, { x, y, pressure }]
    };
    setCurrentStroke(updatedStroke);

    // Real-time rendering with requestAnimationFrame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      drawStroke(ctx, updatedStroke);
    });
  }, [isDrawing, currentStroke, tool, zoom]);

  const handlePointerUp = useCallback(() => {
    if (!isDrawing || !currentStroke) return;
    setIsDrawing(false);

    // Add stroke to current vector layer
    setLayers(prevLayers => {
      const updatedLayers = prevLayers.map(layer => {
        if (layer.type === 'vector' && layer.visible && !layer.locked) {
          return {
            ...layer,
            strokes: [...(layer.strokes || []), currentStroke]
          };
        }
        return layer;
      });
      return updatedLayers;
    });

    setCurrentStroke(null);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, [isDrawing, currentStroke]);


  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setLayers(history[historyIndex - 1]);
      redrawCanvas();
    }
  }, [historyIndex, history, redrawCanvas]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setLayers(history[historyIndex + 1]);
      redrawCanvas();
    }
  }, [historyIndex, history, redrawCanvas]);

  const clearCanvas = useCallback(() => {
    setLayers(prevLayers => 
      prevLayers.map(layer => 
        layer.type === 'vector' ? { ...layer, strokes: [] } : layer
      )
    );
    redrawCanvas();
  }, [redrawCanvas]);

  // Export functionality
  const exportAsJSON = useCallback(() => {
    const exportData = {
      version: '1.0',
      background,
      zoom,
      layers: layers.map(l => ({
        ...l,
        data: l.type === 'vector' ? { strokes: l.strokes } : l.data
      }))
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'notebook.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [background, zoom, layers]);

  const exportAsPNG = useCallback(($ => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'notebook.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, []);

  // PDF import handler
  const handlePDFImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      // Add PDF layer
      const pdfLayer: Layer = {
        id: `pdf-${Date.now()}`,
        type: 'pdf',
        visible: true,
        locked: false,
        zIndex: layers.length + 1,
        data: { file, scale: pdfScale }
      };
      setLayers([...layers, pdfLayer]);
    }
  }, [layers, pdfScale]);

  // Calculate canvas center for sticker injection
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      setCanvasCenter({
        x: canvas.width / 2,
        y: canvas.height / 2
      });
    }
  }, [zoom]);

  // Handle sticker injection from AI Asset Generator
  const handleAssetInsert = useCallback((asset: any, position: { x: number; y: number }) => {
    const imageLayer: Layer = {
      id: `image-${Date.now()}`,
      type: 'image',
      visible: true,
      locked: false,
      zIndex: layers.length + 1,
      x: position.x - 64, // Center the 128x128 sticker
      y: position.y - 64,
      width: 128,
      height: 128,
      rotation: 0,
      data: { src: asset.imageUrl }
    };
    setLayers([...layers, imageLayer]);
    setSelectedElement(imageLayer.id);
  }, [layers]);

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

  // Text element creation
  const handleTextCreate = useCallback((e: React.MouseEvent) => {
    if (tool !== "text") return;
    e.preventDefault();
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;

    const newTextLayer: Layer = {
      id: `text-${Date.now()}`,
      type: 'text',
      visible: true,
      locked: false,
      zIndex: layers.length + 1,
      x,
      y,
      width: 200,
      height: 40,
      content: 'Type here...',
      fontSize: 16,
      fontFamily: 'sans-serif',
      fontWeight: 'normal',
      fontStyle: 'normal',
      textDecoration: 'none',
      textAlign: 'left',
      color: strokeColor
    };

    setLayers([...layers, newTextLayer]);
    setSelectedText(newTextLayer.id);
    setShowTextToolbar(true);
    setTextToolbarPosition({ x: e.clientX, y: e.clientY });
  }, [tool, zoom, layers, strokeColor]);

  // Text style updates
  const updateTextStyle = useCallback((property: string, value: string) => {
    if (!selectedText) return;
    setLayers(prevLayers => 
      prevLayers.map(layer => 
        layer.id === selectedText ? { ...layer, [property]: value } : layer
      )
    );
  }, [selectedText]);

  const handleElementMouseDown = (e: React.MouseEvent, elementId: string, element: Layer) => {
    if (element.locked) return;
    e.stopPropagation();
    setSelectedElement(elementId);
    if (element.type === 'text') {
      setSelectedText(elementId);
      setShowTextToolbar(true);
      setTextToolbarPosition({ x: e.clientX, y: e.clientY });
    }
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

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
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
  }, [selectedElement, layers, isDragging, isRotating, isResizing, resizeHandle, zoom, dragOffset]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    setIsRotating(false);
    setResizeHandle(null);
  }, []);

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
      {/* Enhanced Toolbar */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="border-b border-border/30 bg-card/50 backdrop-blur-sm p-3 flex items-center justify-between gap-4"
      >
        <div className="flex items-center gap-2">
          {/* Brush Type Selection */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-secondary/50 border border-border/30">
            {[
              { id: "pen", icon: Pen, label: "Pen", brush: "pen" as BrushType },
              { id: "fineliner", icon: Pen, label: "Fineliner", brush: "fineliner" as BrushType },
              { id: "highlighter", icon: Highlighter, label: "Highlighter", brush: "highlighter" as BrushType },
              { id: "eraser", icon: Eraser, label: "Eraser", brush: "eraser" as BrushType },
              { id: "text", icon: Type, label: "Text", brush: "pen" as BrushType },
            ].map((t) => (
              <Button
                key={t.id}
                variant={tool === t.id ? "default" : "ghost"}
                size="sm"
                onClick={() => {
                  setTool(t.id as Tool);
                  setBrushType(t.brush);
                }}
                className={cn("h-8 w-8 p-0", tool === t.id && "bg-primary text-primary-foreground")}
                title={t.label}
              >
                <t.icon className="w-4 h-4" />
              </Button>
            ))}
          </div>

          <div className="h-6 w-px bg-border/30" />

          {/* Color & Stroke Controls */}
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
                {[1, 2, 3, 4, 5, 8, 12, 16, 20, 30, 40, 50].map((size) => (
                  <SelectItem key={size} value={size.toString()}>{size}px</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-secondary/50 border border-border/30">
              <span className="text-xs text-muted-foreground">Opacity</span>
              <Slider
                value={[opacity * 100]}
                onValueChange={(v) => setOpacity(v[0] / 100)}
                max={100}
                min={10}
                step={10}
                className="w-20"
              />
              <span className="text-xs w-8">{Math.round(opacity * 100)}%</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Background Selection */}
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

          {/* PDF Import */}
          <div className="relative">
            <input
              type="file"
              accept="application/pdf"
              onChange={handlePDFImport}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <Button variant="outline" size="sm" className="h-8 gap-2">
              <FileText className="w-4 h-4" />
              Import PDF
            </Button>
          </div>

          {/* AI Asset Generator */}
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-2"
            onClick={() => setIsAssetGeneratorOpen(true)}
          >
            <Wand2 className="w-4 h-4" />
            AI Stickers
          </Button>

          {/* Undo/Redo/Clear */}
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

          {/* Zoom Controls */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-secondary/50 border border-border/30">
            <Button variant="ghost" size="sm" onClick={() => setZoom(Math.max(0.5, zoom - 0.1))} className="h-8 w-8 p-0">
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-xs font-medium w-12 text-center">{Math.round(zoom * 100)}%</span>
            <Button variant="ghost" size="sm" onClick={() => setZoom(Math.min(3, zoom + 0.1))} className="h-8 w-8 p-0">
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>

          {/* Export Options */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-secondary/50 border border-border/30">
            <Button variant="ghost" size="sm" onClick={exportAsJSON} className="h-8 gap-1">
              <Download className="w-4 h-4" />
              JSON
            </Button>
            <Button variant="ghost" size="sm" onClick={exportAsPNG} className="h-8 gap-1">
              <Download className="w-4 h-4" />
              PNG
            </Button>
          </div>

          <Button variant="hero" size="sm" className="gap-2">
            <Save className="w-4 h-4" />
            Save
          </Button>
        </div>
      </motion.div>

      {/* Multi-Layer Canvas Workspace */}
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
            className="relative shadow-2xl overflow-hidden" 
            style={{ transform: `scale(${zoom})` }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onClick={handleTextCreate}
          >
            {/* Layer A: Background (CSS patterns applied to container) */}
            
            {/* Layer B: PDF Viewer */}
            {layers.filter(l => l.type === 'pdf' && l.visible).map(layer => (
              <div
                key={layer.id}
                ref={pdfLayerRef}
                className="absolute inset-0 pointer-events-none"
                style={{ zIndex: layer.zIndex }}
              >
                {layer.data?.file && (
                  <div className="w-full h-full flex items-center justify-center bg-white/50">
                    <div className="text-center p-4">
                      <FileText className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">PDF: {layer.data.file.name}</p>
                      <p className="text-xs text-muted-foreground">Scale: {layer.data.scale}x</p>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Layer C: Vector Ink Layer (Canvas) */}
            {layers.filter(l => l.type === 'vector' && l.visible).map(layer => (
              <canvas
                key={layer.id}
                ref={canvasRef}
                className={cn(
                  "absolute inset-0",
                  tool === "text" ? "cursor-text" : "cursor-crosshair"
                )}
                style={{ zIndex: layer.zIndex, touchAction: 'none' }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
              />
            ))}

            {/* Layer D: DOM Layer (Text elements, images, UI controls) */}
            <div
              ref={domLayerRef}
              className="absolute inset-0 pointer-events-none"
              style={{ zIndex: 1000 }}
            >
              {/* Text Elements */}
              {layers.filter(l => l.type === 'text' && l.visible).map(layer => (
                <div
                  key={layer.id}
                  className={cn(
                    "absolute pointer-events-auto border-2 border-transparent hover:border-primary/30 rounded",
                    selectedElement === layer.id && "border-primary"
                  )}
                  style={{
                    left: layer.x,
                    top: layer.y,
                    width: layer.width,
                    height: layer.height,
                    transform: `rotate(${layer.rotation || 0}deg)`,
                    zIndex: layer.zIndex
                  }}
                  onMouseDown={(e) => handleElementMouseDown(e, layer.id, layer)}
                >
                  <textarea
                    className="w-full h-full bg-transparent resize-none outline-none p-2"
                    style={{
                      fontSize: `${layer.fontSize}px`,
                      fontFamily: layer.fontFamily,
                      fontWeight: layer.fontWeight,
                      fontStyle: layer.fontStyle,
                      textDecoration: layer.textDecoration,
                      textAlign: layer.textAlign as any,
                      color: layer.color
                    }}
                    value={layer.content}
                    onChange={(e) => updateTextStyle('content', e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              ))}

              {/* Image Elements */}
              {layers.filter(l => l.type === 'image' && l.visible).map(layer => (
                <div
                  key={layer.id}
                  className={cn(
                    "absolute pointer-events-auto border-2 border-transparent hover:border-primary/30 rounded",
                    selectedElement === layer.id && "border-primary"
                  )}
                  style={{
                    left: layer.x,
                    top: layer.y,
                    width: layer.width,
                    height: layer.height,
                    transform: `rotate(${layer.rotation || 0}deg)`,
                    zIndex: layer.zIndex
                  }}
                  onMouseDown={(e) => handleElementMouseDown(e, layer.id, layer)}
                >
                  {layer.data?.src && (
                    <img
                      src={layer.data.src}
                      alt="Sticker"
                      className="w-full h-full object-contain"
                      draggable={false}
                    />
                  )}
                </div>
              ))}

              {/* Selected Element Controls (Bounding Box) */}
              {selectedElement && (() => {
                const element = layers.find(l => l.id === selectedElement);
                if (!element || element.x === undefined || element.type === 'vector') return null;
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
                        transformOrigin: 'center center',
                        zIndex: layer.zIndex + 1
                      }}
                    />
                    
                    {/* 8-Point Resize Handles */}
                    {handles.slice(0, 8).map((handle) => (
                      <div
                        key={handle.type}
                        className="absolute w-3 h-3 bg-white border-2 border-primary rounded-full cursor-pointer hover:bg-primary hover:border-white transition-colors pointer-events-auto"
                        style={{
                          left: handle.x - 6,
                          top: handle.y - 6,
                          cursor: getCursorForHandle(handle.type),
                          zIndex: layer.zIndex + 2
                        }}
                        onMouseDown={(e) => handleResizeMouseDown(e, handle, selectedElement)}
                      />
                    ))}
                    
                    {/* Rotation Handle with atan2 calculation */}
                    {handles[8] && (
                      <div
                        className="absolute cursor-pointer pointer-events-auto"
                        style={{ 
                          left: handles[8].x - 10, 
                          top: handles[8].y - 10,
                          zIndex: layer.zIndex + 2
                        }}
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
            </div>
          </Card>
        </motion.div>

        {/* Enhanced Layer Panel */}
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="absolute top-4 right-4 w-72 glass-card border-border/30 rounded-xl p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-sm">Layers</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => setLayers([...layers, { 
                id: `layer-${Date.now()}`, 
                type: "vector", 
                visible: true, 
                locked: false, 
                zIndex: layers.length + 1,
                strokes: []
              }])}
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {layers
              .sort((a, b) => a.zIndex - b.zIndex)
              .reverse()
              .map((layer) => (
              <div
                key={layer.id}
                className={cn(
                  "flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors",
                  selectedElement === layer.id ? "bg-primary/20 border border-primary/30" : "bg-secondary/30 hover:bg-secondary/50"
                )}
                onClick={() => setSelectedElement(layer.id)}
              >
                <div className="w-8 h-8 rounded bg-background border border-border/30 flex items-center justify-center">
                  {layer.type === "vector" && <Pen className="w-4 h-4 text-muted-foreground" />}
                  {layer.type === "text" && <Type className="w-4 h-4 text-muted-foreground" />}
                  {layer.type === "pdf" && <FileText className="w-4 h-4 text-muted-foreground" />}
                  {layer.type === "image" && <FileImage className="w-4 h-4 text-muted-foreground" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">Layer {layer.id}</p>
                  <p className="text-[10px] text-muted-foreground capitalize">{layer.type}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLayers(layers.map(l => l.id === layer.id ? { ...l, locked: !l.locked } : l));
                    }}
                  >
                    {layer.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                  </Button>
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
              </div>
            ))}
          </div>
        </motion.div>

        {/* Floating Text Toolbar */}
        <AnimatePresence>
          {showTextToolbar && selectedText && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="absolute glass-card border-border/30 rounded-xl p-2 flex items-center gap-1"
              style={{
                left: textToolbarPosition.x,
                top: textToolbarPosition.y + 40,
                zIndex: 2000
              }}
            >
              {/* Font Family */}
              <Select value={layers.find(l => l.id === selectedText)?.fontFamily} onValueChange={(v) => updateTextStyle('fontFamily', v)}>
                <SelectTrigger className="w-24 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sans-serif">Sans</SelectItem>
                  <SelectItem value="serif">Serif</SelectItem>
                  <SelectItem value="monospace">Mono</SelectItem>
                  <SelectItem value="OpenDyslexic">Dyslexic</SelectItem>
                </SelectContent>
              </Select>

              <div className="h-6 w-px bg-border/30" />

              {/* Font Size */}
              <Select 
                value={layers.find(l => l.id === selectedText)?.fontSize?.toString()} 
                onValueChange={(v) => updateTextStyle('fontSize', v)}
              >
                <SelectTrigger className="w-16 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[12, 14, 16, 18, 20, 24, 28, 32, 36, 48].map((size) => (
                    <SelectItem key={size} value={size.toString()}>{size}px</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="h-6 w-px bg-border/30" />

              {/* Text Alignment */}
              <div className="flex items-center gap-1">
                <Button
                  variant={layers.find(l => l.id === selectedText)?.textAlign === 'left' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => updateTextStyle('textAlign', 'left')}
                >
                  <AlignLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant={layers.find(l => l.id === selectedText)?.textAlign === 'center' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => updateTextStyle('textAlign', 'center')}
                >
                  <AlignCenter className="w-4 h-4" />
                </Button>
                <Button
                  variant={layers.find(l => l.id === selectedText)?.textAlign === 'right' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => updateTextStyle('textAlign', 'right')}
                >
                  <AlignRight className="w-4 h-4" />
                </Button>
              </div>

              <div className="h-6 w-px bg-border/30" />

              {/* Text Styles */}
              <div className="flex items-center gap-1">
                <Button
                  variant={layers.find(l => l.id === selectedText)?.fontWeight === 'bold' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => updateTextStyle('fontWeight', layers.find(l => l.id === selectedText)?.fontWeight === 'bold' ? 'normal' : 'bold')}
                >
                  <Bold className="w-4 h-4" />
                </Button>
                <Button
                  variant={layers.find(l => l.id === selectedText)?.fontStyle === 'italic' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => updateTextStyle('fontStyle', layers.find(l => l.id === selectedText)?.fontStyle === 'italic' ? 'normal' : 'italic')}
                >
                  <Italic className="w-4 h-4" />
                </Button>
                <Button
                  variant={layers.find(l => l.id === selectedText)?.textDecoration === 'underline' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => updateTextStyle('textDecoration', layers.find(l => l.id === selectedText)?.textDecoration === 'underline' ? 'none' : 'underline')}
                >
                  <Underline className="w-4 h-4" />
                </Button>
              </div>

              <div className="h-6 w-px bg-border/30" />

              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setShowTextToolbar(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* AI Asset Generator Side Drawer */}
      <AIAssetGenerator
        isOpen={isAssetGeneratorOpen}
        onClose={() => setIsAssetGeneratorOpen(false)}
        onAssetInsert={handleAssetInsert}
        canvasCenter={canvasCenter}
      />
    </div>
  );
}
