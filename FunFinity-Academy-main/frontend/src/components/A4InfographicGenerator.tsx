/**
 * A4 Infographic Generator Component
 * Provides a canvas for generating AI-powered study notes and infographics in A4 format
 * Aspect ratio: 1:1.414 (A4 standard: 210mm x 297mm)
 */

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Download, 
  Sparkles, 
  Image as ImageIcon, 
  Type, 
  Layout,
  Palette,
  Maximize2,
  Minimize2,
  RotateCcw,
  Save
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

export interface InfographicConfig {
  topic: string;
  style: 'minimal' | 'colorful' | 'academic' | 'creative';
  layout: 'single-column' | 'two-column' | 'grid' | 'timeline';
  colorScheme: 'blue' | 'green' | 'purple' | 'orange' | 'custom';
  includeImages: boolean;
  includeIcons: boolean;
  fontSize: number;
  density: number;
}

const colorSchemes = {
  blue: { primary: '#3b82f6', secondary: '#1e40af', accent: '#60a5fa' },
  green: { primary: '#22c55e', secondary: '#15803d', accent: '#4ade80' },
  purple: { primary: '#a855f7', secondary: '#7e22ce', accent: '#c084fc' },
  orange: { primary: '#f97316', secondary: '#c2410c', accent: '#fb923c' },
  custom: { primary: '#000000', secondary: '#333333', accent: '#666666' },
};

const stylePresets = {
  minimal: { description: 'Clean, simple design with plenty of whitespace' },
  colorful: { description: 'Vibrant colors and engaging visual elements' },
  academic: { description: 'Professional, research-focused layout' },
  creative: { description: 'Artistic and visually dynamic design' },
};

const layoutPresets = {
  'single-column': { description: 'Vertical flow, ideal for step-by-step content' },
  'two-column': { description: 'Side-by-side comparison or related content' },
  grid: { description: 'Structured grid for multiple concepts' },
  timeline: { description: 'Chronological or sequential information' },
};

export function A4InfographicGenerator() {
  const [config, setConfig] = useState<InfographicConfig>({
    topic: '',
    style: 'minimal',
    layout: 'single-column',
    colorScheme: 'blue',
    includeImages: true,
    includeIcons: true,
    fontSize: 14,
    density: 50,
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewMode, setPreviewMode] = useState<'fit' | 'actual'>('fit');
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleGenerate = async () => {
    if (!config.topic.trim()) return;
    
    setIsGenerating(true);
    // In production, this would call an AI API to generate the infographic
    // For now, we'll simulate the generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsGenerating(false);
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    
    // In production, this would use html2canvas or similar library
    // For now, we'll create a placeholder download
    const link = document.createElement('a');
    link.download = `${config.topic.replace(/\s+/g, '-')}-infographic.png`;
    link.href = '#';
    link.click();
  };

  const handleReset = () => {
    setConfig({
      topic: '',
      style: 'minimal',
      layout: 'single-column',
      colorScheme: 'blue',
      includeImages: true,
      includeIcons: true,
      fontSize: 14,
      density: 50,
    });
  };

  const a4Width = 210; // mm
  const a4Height = 297; // mm
  const aspectRatio = a4Width / a4Height; // 0.707

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Configuration Panel */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent" />
                Infographic Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Topic Input */}
              <div className="space-y-2">
                <Label htmlFor="topic">Topic</Label>
                <Textarea
                  id="topic"
                  placeholder="Enter your study topic or concept..."
                  value={config.topic}
                  onChange={(e) => setConfig({ ...config, topic: e.target.value })}
                  rows={3}
                  className="resize-none"
                />
              </div>

              {/* Style Selection */}
              <div className="space-y-2">
                <Label htmlFor="style">Design Style</Label>
                <Select
                  value={config.style}
                  onValueChange={(value: any) => setConfig({ ...config, style: value })}
                >
                  <SelectTrigger id="style">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(stylePresets).map(([key, preset]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex flex-col">
                          <span className="capitalize">{key}</span>
                          <span className="text-xs text-muted-foreground">{preset.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Layout Selection */}
              <div className="space-y-2">
                <Label htmlFor="layout">Layout</Label>
                <Select
                  value={config.layout}
                  onValueChange={(value: any) => setConfig({ ...config, layout: value })}
                >
                  <SelectTrigger id="layout">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(layoutPresets).map(([key, preset]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex flex-col">
                          <span className="capitalize">{key.replace('-', ' ')}</span>
                          <span className="text-xs text-muted-foreground">{preset.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Color Scheme */}
              <div className="space-y-2">
                <Label htmlFor="colorScheme">Color Scheme</Label>
                <Select
                  value={config.colorScheme}
                  onValueChange={(value: any) => setConfig({ ...config, colorScheme: value })}
                >
                  <SelectTrigger id="colorScheme">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(colorSchemes).map(([key]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: colorSchemes[key as keyof typeof colorSchemes].primary }}
                          />
                          <span className="capitalize">{key}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Font Size */}
              <div className="space-y-2">
                <Label htmlFor="fontSize">Font Size: {config.fontSize}px</Label>
                <Slider
                  id="fontSize"
                  min={10}
                  max={24}
                  step={1}
                  value={[config.fontSize]}
                  onValueChange={([value]) => setConfig({ ...config, fontSize: value })}
                  className="w-full"
                />
              </div>

              {/* Content Density */}
              <div className="space-y-2">
                <Label htmlFor="density">Content Density: {config.density}%</Label>
                <Slider
                  id="density"
                  min={20}
                  max={100}
                  step={5}
                  value={[config.density]}
                  onValueChange={([value]) => setConfig({ ...config, density: value })}
                  className="w-full"
                />
              </div>

              {/* Toggles */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="includeImages" className="flex items-center gap-2 cursor-pointer">
                    <ImageIcon className="w-4 h-4" />
                    Include Images
                  </Label>
                  <input
                    id="includeImages"
                    type="checkbox"
                    checked={config.includeImages}
                    onChange={(e) => setConfig({ ...config, includeImages: e.target.checked })}
                    className="w-4 h-4"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="includeIcons" className="flex items-center gap-2 cursor-pointer">
                    <Type className="w-4 h-4" />
                    Include Icons
                  </Label>
                  <input
                    id="includeIcons"
                    type="checkbox"
                    checked={config.includeIcons}
                    onChange={(e) => setConfig({ ...config, includeIcons: e.target.checked })}
                    className="w-4 h-4"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleGenerate}
                  disabled={!config.topic.trim() || isGenerating}
                  className="flex-1"
                >
                  {isGenerating ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="mr-2"
                      >
                        <Sparkles className="w-4 h-4" />
                      </motion.div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleReset}
                  disabled={isGenerating}
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Layout className="w-5 h-5 text-accent" />
                A4 Preview
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPreviewMode(previewMode === 'fit' ? 'actual' : 'fit')}
                >
                  {previewMode === 'fit' ? (
                    <Maximize2 className="w-4 h-4" />
                  ) : (
                    <Minimize2 className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  disabled={!config.topic}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* A4 Canvas */}
              <div className="flex items-center justify-center bg-secondary/30 rounded-lg p-4 min-h-[600px]">
                <div
                  ref={canvasRef}
                  className={`
                    bg-white shadow-2xl transition-all duration-300
                    ${previewMode === 'fit' ? 'w-full max-w-lg' : 'w-[210mm]'}
                  `}
                  style={{
                    aspectRatio: aspectRatio,
                    backgroundColor: '#ffffff',
                  }}
                >
                  {config.topic ? (
                    <div className="p-8 h-full flex flex-col">
                      {/* Placeholder for generated content */}
                      <div className="flex-1 flex items-center justify-center text-center">
                        <div className="space-y-4">
                          <motion.div
                            animate={isGenerating ? { scale: [1, 1.1, 1] } : {}}
                            transition={{ duration: 0.5, repeat: isGenerating ? Infinity : 0 }}
                          >
                            <Sparkles className="w-12 h-12 text-accent mx-auto" />
                          </motion.div>
                          <h3 className="text-2xl font-bold text-foreground">
                            {config.topic}
                          </h3>
                          <p className="text-muted-foreground">
                            {isGenerating
                              ? 'Generating your infographic...'
                              : 'Your infographic will appear here'}
                          </p>
                          {!isGenerating && (
                            <div className="flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
                              <span className="px-2 py-1 bg-secondary rounded">
                                {config.style}
                              </span>
                              <span className="px-2 py-1 bg-secondary rounded">
                                {config.layout}
                              </span>
                              <span className="px-2 py-1 bg-secondary rounded">
                                {config.colorScheme}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-center p-8">
                      <div className="space-y-4">
                        <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto" />
                        <p className="text-muted-foreground">
                          Enter a topic to generate your A4 infographic
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* A4 Dimensions Info */}
              <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <span>210mm × 297mm</span>
                <span>•</span>
                <span>Aspect Ratio: 1:1.414</span>
                <span>•</span>
                <span>8.27" × 11.69"</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
