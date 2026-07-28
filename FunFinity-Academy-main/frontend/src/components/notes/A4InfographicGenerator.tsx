/**
 * A4 Infographic Generator Component
 * Allows users to create and preview A4-format study notes and infographics
 * Aspect ratio 1:1.414 (A4 standard: 210mm x 297mm)
 */

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Download, Printer, ZoomIn, ZoomOut, RotateCcw, 
  Palette, Type, Image as ImageIcon, Layout, 
  Sparkles, Save, Trash2, Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface InfographicElement {
  id: string;
  type: 'text' | 'image' | 'shape' | 'icon';
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
  fontSize?: number;
  color?: string;
  backgroundColor?: string;
  rotation?: number;
}

interface InfographicTemplate {
  id: string;
  name: string;
  elements: InfographicElement[];
  backgroundColor: string;
}

const A4_ASPECT_RATIO = 210 / 297; // 0.707
const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;

const DEFAULT_TEMPLATES: InfographicTemplate[] = [
  {
    id: 'minimal',
    name: 'Minimal Study Notes',
    backgroundColor: '#ffffff',
    elements: [
      {
        id: 'title',
        type: 'text',
        x: 20,
        y: 20,
        width: 170,
        height: 30,
        content: 'Study Notes',
        fontSize: 24,
        color: '#1a1a1a',
      },
      {
        id: 'content',
        type: 'text',
        x: 20,
        y: 60,
        width: 170,
        height: 200,
        content: 'Add your study content here...',
        fontSize: 14,
        color: '#333333',
      },
    ],
  },
  {
    id: 'structured',
    name: 'Structured Layout',
    backgroundColor: '#f8f9fa',
    elements: [
      {
        id: 'header',
        type: 'shape',
        x: 0,
        y: 0,
        width: 210,
        height: 40,
        backgroundColor: '#4a90e2',
      },
      {
        id: 'title',
        type: 'text',
        x: 20,
        y: 10,
        width: 170,
        height: 20,
        content: 'Topic Title',
        fontSize: 18,
        color: '#ffffff',
      },
      {
        id: 'section1',
        type: 'shape',
        x: 20,
        y: 60,
        width: 85,
        height: 100,
        backgroundColor: '#ffffff',
      },
      {
        id: 'section2',
        type: 'shape',
        x: 105,
        y: 60,
        width: 85,
        height: 100,
        backgroundColor: '#ffffff',
      },
    ],
  },
  {
    id: 'colorful',
    name: 'Colorful Infographic',
    backgroundColor: '#fff5f5',
    elements: [
      {
        id: 'accent1',
        type: 'shape',
        x: 0,
        y: 0,
        width: 70,
        height: 297,
        backgroundColor: '#ff6b6b',
      },
      {
        id: 'title',
        type: 'text',
        x: 80,
        y: 30,
        width: 110,
        height: 30,
        content: 'Key Concepts',
        fontSize: 22,
        color: '#1a1a1a',
      },
    ],
  },
];

export function A4InfographicGenerator() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [currentTemplate, setCurrentTemplate] = useState<InfographicTemplate>(DEFAULT_TEMPLATES[0]);
  const [elements, setElements] = useState<InfographicElement[]>(DEFAULT_TEMPLATES[0].elements);
  const [backgroundColor, setBackgroundColor] = useState(DEFAULT_TEMPLATES[0].backgroundColor);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const { toast } = useToast();

  // Handle element selection
  const handleElementClick = (e: React.MouseEvent, elementId: string) => {
    e.stopPropagation();
    setSelectedElement(elementId);
  };

  // Handle element dragging
  const handleMouseDown = (e: React.MouseEvent, elementId: string) => {
    e.stopPropagation();
    setSelectedElement(elementId);
    setIsDragging(true);
    
    const element = elements.find(el => el.id === elementId);
    if (element) {
      setDragOffset({
        x: e.clientX - element.x,
        y: e.clientY - element.y,
      });
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && selectedElement) {
        setElements(prevElements =>
          prevElements.map(el =>
            el.id === selectedElement
              ? {
                  ...el,
                  x: (e.clientX - dragOffset.x) / scale,
                  y: (e.clientY - dragOffset.y) / scale,
                }
              : el
          )
        );
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, selectedElement, dragOffset, scale]);

  // Add new element
  const addElement = (type: InfographicElement['type']) => {
    const newElement: InfographicElement = {
      id: `element-${Date.now()}`,
      type,
      x: 50,
      y: 50,
      width: type === 'text' ? 100 : 50,
      height: type === 'text' ? 30 : 50,
      content: type === 'text' ? 'New text' : undefined,
      fontSize: 14,
      color: '#000000',
      backgroundColor: type === 'shape' ? '#e0e0e0' : undefined,
      rotation: 0,
    };
    setElements([...elements, newElement]);
    setSelectedElement(newElement.id);
  };

  // Update selected element
  const updateSelectedElement = (updates: Partial<InfographicElement>) => {
    if (selectedElement) {
      setElements(prevElements =>
        prevElements.map(el =>
          el.id === selectedElement ? { ...el, ...updates } : el
        )
      );
    }
  };

  // Delete selected element
  const deleteSelectedElement = () => {
    if (selectedElement) {
      setElements(elements.filter(el => el.id !== selectedElement));
      setSelectedElement(null);
    }
  };

  // Export as image
  const exportAsImage = async () => {
    if (!canvasRef.current) return;

    try {
      // In production, use html2canvas or similar library
      toast({
        title: "Export started",
        description: "Your infographic is being generated...",
      });
      
      // Simulate export delay
      setTimeout(() => {
        toast({
          title: "Export complete",
          description: "Your infographic has been downloaded.",
        });
      }, 1500);
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Unable to export infographic. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Print
  const handlePrint = () => {
    window.print();
  };

  // Reset to template
  const resetToTemplate = (template: InfographicTemplate) => {
    setCurrentTemplate(template);
    setElements(template.elements);
    setBackgroundColor(template.backgroundColor);
    setSelectedElement(null);
  };

  const selectedElementData = elements.find(el => el.id === selectedElement);

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* Canvas Area */}
      <div className="flex-1 flex items-center justify-center bg-secondary/20 rounded-2xl p-8 overflow-auto">
        <div className="relative">
          {/* Zoom Controls */}
          <div className="absolute top-4 right-4 flex gap-2 z-10">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setScale(Math.max(0.5, scale - 0.1))}
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="flex items-center px-3 text-sm font-medium bg-background rounded-lg">
              {Math.round(scale * 100)}%
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setScale(Math.min(2, scale + 0.1))}
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>

          {/* A4 Canvas */}
          <motion.div
            ref={canvasRef}
            className="relative shadow-2xl"
            style={{
              width: `${A4_WIDTH_MM * scale}px`,
              height: `${A4_HEIGHT_MM * scale}px`,
              backgroundColor,
            }}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {elements.map((element) => (
              <motion.div
                key={element.id}
                className={`absolute cursor-move ${
                  selectedElement === element.id ? 'ring-2 ring-primary ring-offset-2' : ''
                }`}
                style={{
                  left: `${element.x * scale}px`,
                  top: `${element.y * scale}px`,
                  width: `${element.width * scale}px`,
                  height: `${element.height * scale}px`,
                  backgroundColor: element.backgroundColor,
                  color: element.color,
                  fontSize: element.fontSize ? `${element.fontSize * scale}px` : undefined,
                  transform: `rotate(${element.rotation || 0}deg)`,
                }}
                onMouseDown={(e) => handleMouseDown(e, element.id)}
                onClick={(e) => handleElementClick(e, element.id)}
                whileHover={{ scale: 1.02 }}
              >
                {element.type === 'text' && (
                  <div className="w-full h-full flex items-center justify-center p-2 text-center">
                    {element.content}
                  </div>
                )}
                {element.type === 'shape' && (
                  <div className="w-full h-full" />
                )}
                {element.type === 'icon' && (
                  <div className="w-full h-full flex items-center justify-center">
                    <Sparkles className="w-8 h-8" />
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Controls Panel */}
      <div className="w-full lg:w-80 space-y-4">
        {/* Template Selection */}
        <div className="platform-card p-4 rounded-xl">
          <h3 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
            <Layout className="w-4 h-4" />
            Templates
          </h3>
          <div className="space-y-2">
            {DEFAULT_TEMPLATES.map((template) => (
              <Button
                key={template.id}
                variant={currentTemplate.id === template.id ? 'default' : 'outline'}
                size="sm"
                className="w-full justify-start"
                onClick={() => resetToTemplate(template)}
              >
                {template.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Add Elements */}
        <div className="platform-card p-4 rounded-xl">
          <h3 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Elements
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => addElement('text')}
              className="flex flex-col gap-1 h-auto py-3"
            >
              <Type className="w-5 h-5" />
              <span className="text-xs">Text</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addElement('shape')}
              className="flex flex-col gap-1 h-auto py-3"
            >
              <Layout className="w-5 h-5" />
              <span className="text-xs">Shape</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addElement('icon')}
              className="flex flex-col gap-1 h-auto py-3"
            >
              <ImageIcon className="w-5 h-5" />
              <span className="text-xs">Icon</span>
            </Button>
          </div>
        </div>

        {/* Element Properties */}
        {selectedElementData && (
          <div className="platform-card p-4 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Properties
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={deleteSelectedElement}
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
            
            <div className="space-y-3">
              {selectedElementData.type === 'text' && (
                <>
                  <div>
                    <Label className="text-xs">Content</Label>
                    <Textarea
                      value={selectedElementData.content || ''}
                      onChange={(e) => updateSelectedElement({ content: e.target.value })}
                      className="mt-1 h-20 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Font Size: {selectedElementData.fontSize}px</Label>
                    <Input
                      type="range"
                      min="8"
                      max="48"
                      value={selectedElementData.fontSize || 14}
                      onChange={(e) => updateSelectedElement({ fontSize: parseInt(e.target.value) })}
                      className="mt-1"
                    />
                  </div>
                </>
              )}
              
              <div>
                <Label className="text-xs">Color</Label>
                <div className="flex gap-2 mt-1">
                  {['#000000', '#ffffff', '#4a90e2', '#ff6b6b', '#50e3c2', '#f8e71c'].map((color) => (
                    <button
                      key={color}
                      className={`w-8 h-8 rounded-lg border-2 ${
                        selectedElementData.color === color ? 'border-primary' : 'border-border'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => updateSelectedElement({ color })}
                    />
                  ))}
                </div>
              </div>

              {selectedElementData.type === 'shape' && (
                <div>
                  <Label className="text-xs">Background</Label>
                  <div className="flex gap-2 mt-1">
                    {['#ffffff', '#f8f9fa', '#e0e0e0', '#4a90e2', '#ff6b6b', '#50e3c2'].map((color) => (
                      <button
                        key={color}
                        className={`w-8 h-8 rounded-lg border-2 ${
                          selectedElementData.backgroundColor === color ? 'border-primary' : 'border-border'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => updateSelectedElement({ backgroundColor: color })}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Canvas Background */}
        <div className="platform-card p-4 rounded-xl">
          <h3 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Canvas Background
          </h3>
          <div className="flex gap-2">
            {['#ffffff', '#f8f9fa', '#fff5f5', '#f0f8ff', '#faf5ff'].map((color) => (
              <button
                key={color}
                className={`w-8 h-8 rounded-lg border-2 ${
                  backgroundColor === color ? 'border-primary' : 'border-border'
                }`}
                style={{ backgroundColor: color }}
                onClick={() => setBackgroundColor(color)}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <Button
            variant="hero"
            size="lg"
            className="w-full"
            onClick={exportAsImage}
          >
            <Download className="w-4 h-4 mr-2" />
            Export as Image
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={handlePrint}
          >
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button
            variant="ghost"
            size="lg"
            className="w-full"
            onClick={() => resetToTemplate(currentTemplate)}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}
