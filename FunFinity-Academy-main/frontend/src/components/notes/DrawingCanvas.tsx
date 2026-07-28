import { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Pen, 
  Eraser, 
  Palette, 
  Download, 
  RotateCcw, 
  Save,
  Minus,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Toggle } from '@/components/ui/toggle';

interface DrawingCanvasProps {
  onSave: (dataUrl: string) => void;
  onCancel: () => void;
}

interface Point {
  x: number;
  y: number;
}

interface Stroke {
  points: Point[];
  color: string;
  width: number;
}

export function DrawingCanvas({ onSave, onCancel }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
  const [currentColor, setCurrentColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(3);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });

  const colors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF', 
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500',
    '#800080', '#FFC0CB', '#A52A2A', '#808080'
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    setCanvasSize({ width: rect.width, height: rect.height });

    // Clear and redraw
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Redraw all strokes
    strokes.forEach(stroke => {
      if (stroke.points.length < 2) return;
      
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      
      ctx.stroke();
    });

    // Draw current stroke
    if (currentStroke && currentStroke.points.length > 1) {
      ctx.strokeStyle = currentStroke.color;
      ctx.lineWidth = currentStroke.width;
      ctx.beginPath();
      ctx.moveTo(currentStroke.points[0].x, currentStroke.points[0].y);
      
      for (let i = 1; i < currentStroke.points.length; i++) {
        ctx.lineTo(currentStroke.points[i].x, currentStroke.points[i].y);
      }
      
      ctx.stroke();
    }
  }, [strokes, currentStroke]);

  const getCoordinates = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  }, []);

  const startDrawing = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const point = getCoordinates(e);
    
    const newStroke: Stroke = {
      points: [point],
      color: tool === 'eraser' ? '#FFFFFF' : currentColor,
      width: tool === 'eraser' ? brushSize * 3 : brushSize
    };
    
    setCurrentStroke(newStroke);
    setIsDrawing(true);
  }, [getCoordinates, currentColor, brushSize, tool]);

  const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing || !currentStroke) return;

    const point = getCoordinates(e);
    setCurrentStroke(prev => prev ? {
      ...prev,
      points: [...prev.points, point]
    } : null);
  }, [isDrawing, currentStroke, getCoordinates]);

  const stopDrawing = useCallback(() => {
    if (currentStroke && currentStroke.points.length > 1) {
      setStrokes(prev => [...prev, currentStroke]);
    }
    setCurrentStroke(null);
    setIsDrawing(false);
  }, [currentStroke]);

  const clearCanvas = useCallback(() => {
    setStrokes([]);
    setCurrentStroke(null);
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, []);

  const undo = useCallback(() => {
    setStrokes(prev => prev.slice(0, -1));
  }, []);

  const saveDrawing = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    onSave(dataUrl);
  }, [onSave]);

  const downloadDrawing = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `drawing-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b bg-muted/50">
        <div className="flex items-center gap-4">
          {/* Tool Selection */}
          <div className="flex items-center gap-2">
            <Toggle
              pressed={tool === 'pen'}
              onPressedChange={() => setTool('pen')}
              size="sm"
            >
              <Pen className="w-4 h-4" />
            </Toggle>
            <Toggle
              pressed={tool === 'eraser'}
              onPressedChange={() => setTool('eraser')}
              size="sm"
            >
              <Eraser className="w-4 h-4" />
            </Toggle>
          </div>

          {/* Color Palette */}
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-muted-foreground" />
            <div className="flex gap-1">
              {colors.map(color => (
                <button
                  key={color}
                  className={`w-6 h-6 rounded border-2 ${
                    currentColor === color ? 'border-primary' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setCurrentColor(color)}
                  disabled={tool === 'eraser'}
                />
              ))}
            </div>
          </div>

          {/* Brush Size */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Size:</span>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setBrushSize(prev => Math.max(1, prev - 1))}
              >
                <Minus className="w-3 h-3" />
              </Button>
              <div className="w-12 text-center text-sm font-medium">
                {brushSize}
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setBrushSize(prev => Math.min(20, prev + 1))}
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={undo}>
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={clearCanvas}>
            Clear
          </Button>
          <Button variant="outline" size="sm" onClick={downloadDrawing}>
            <Download className="w-4 h-4" />
          </Button>
          <Button size="sm" onClick={saveDrawing}>
            <Save className="w-4 h-4 mr-1" />
            Save to Note
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 flex items-center justify-center p-4 bg-gray-50">
        <div className="relative bg-white rounded-lg shadow-lg">
          <canvas
            ref={canvasRef}
            className="border border-gray-300 rounded-lg cursor-crosshair touch-none"
            style={{ 
              width: '100%', 
              height: '100%',
              maxWidth: canvasSize.width,
              maxHeight: canvasSize.height
            }}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
          
          {/* Brush preview */}
          <div 
            className="absolute pointer-events-none rounded-full border border-gray-400"
            style={{
              width: brushSize * 2,
              height: brushSize * 2,
              backgroundColor: tool === 'eraser' ? '#FFFFFF' : currentColor,
              display: isDrawing ? 'block' : 'none',
            }}
          />
        </div>
      </div>

      {/* Instructions */}
      <div className="p-4 border-t bg-muted/30 text-center text-sm text-muted-foreground">
        Use mouse or touch to draw. Select pen or eraser tool. Choose colors and adjust brush size.
      </div>
    </div>
  );
}
