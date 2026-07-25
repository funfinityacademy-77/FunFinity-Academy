import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, Wand2, X, ChevronRight, Download, 
  Palette, Star, Zap, Heart, Flame, Crown, Gem,
  Search, Filter, Grid, List, Plus, Trash2, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { useStickerPipeline } from "@/hooks/useStickerPipeline";

interface GeneratedAsset {
  id: string;
  prompt: string;
  style: string;
  imageUrl: string;
  createdAt: Date;
}

interface AIAssetGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  onAssetGenerated?: (asset: GeneratedAsset) => void;
  onAssetInsert?: (asset: GeneratedAsset, position: { x: number; y: number }) => void;
  canvasCenter?: { x: number; y: number };
}

const styles = [
  { id: "sticker", label: "Sticker", icon: Star, color: "bg-yellow-500/10 text-yellow-500" },
  { id: "badge", label: "Badge", icon: Crown, color: "bg-purple-500/10 text-purple-500" },
  { id: "icon", label: "Icon", icon: Gem, color: "bg-cyan-500/10 text-cyan-500" },
  { id: "emoji", label: "Emoji", icon: Zap, color: "bg-orange-500/10 text-orange-500" },
  { id: "decoration", label: "Decoration", icon: Flame, color: "bg-red-500/10 text-red-500" },
];

const categories = [
  "Academic", "Celebration", "Motivation", "Science", "Art", "Sports", "Nature", "Technology"
];

const promptTemplates = [
  "A cute {category} sticker with vibrant colors",
  "A motivational {category} badge with gold accents",
  "A minimalist {category} icon for study notes",
  "A playful {category} emoji style illustration",
  "An elegant {category} decoration with gradient",
];

export default function AIAssetGenerator({ isOpen, onClose, onAssetGenerated, onAssetInsert, canvasCenter }: AIAssetGeneratorProps) {
  const [prompt, setPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("sticker");
  const [selectedCategory, setSelectedCategory] = useState("Academic");
  const [generatedAssets, setGeneratedAssets] = useState<GeneratedAsset[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [creativity, setCreativity] = useState([50]);
  const [autoInject, setAutoInject] = useState(true);
  const [lastInsertedId, setLastInsertedId] = useState<string | null>(null);

  const { state: pipelineState, generateSticker, injectStickerToCanvas, resetState } = useStickerPipeline();

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    try {
      const newAsset = await generateSticker(prompt, selectedStyle, creativity[0]);
      setGeneratedAssets([newAsset, ...generatedAssets]);
      
      if (onAssetGenerated) {
        onAssetGenerated(newAsset);
      }

      // Auto-inject to canvas if enabled and position available
      if (autoInject && onAssetInsert && canvasCenter) {
        onAssetInsert(newAsset, canvasCenter);
        setLastInsertedId(newAsset.id);
        
        // Clear the success indicator after 2 seconds
        setTimeout(() => setLastInsertedId(null), 2000);
      }
    } catch (error) {
      console.error('Failed to generate sticker:', error);
    }
  };

  const handleUseTemplate = (template: string) => {
    const filledPrompt = template.replace("{category}", selectedCategory.toLowerCase());
    setPrompt(filledPrompt);
  };

  const handleDeleteAsset = (id: string) => {
    setGeneratedAssets(generatedAssets.filter(a => a.id !== id));
  };

  const handleInsertAsset = useCallback((asset: GeneratedAsset) => {
    if (onAssetInsert && canvasCenter) {
      onAssetInsert(asset, canvasCenter);
      setLastInsertedId(asset.id);
      setTimeout(() => setLastInsertedId(null), 2000);
    }
  }, [onAssetInsert, canvasCenter]);

  // Listen for sticker injection events from the hook
  useEffect(() => {
    const handleStickerInjected = (event: CustomEvent) => {
      const { sticker, position } = event.detail;
      if (onAssetInsert) {
        onAssetInsert(sticker, position);
      }
    };

    window.addEventListener('sticker-injected', handleStickerInjected as EventListener);
    return () => {
      window.removeEventListener('sticker-injected', handleStickerInjected as EventListener);
    };
  }, [onAssetInsert]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-[400px] bg-background border-l border-border/30 z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="p-4 border-b border-border/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground text-sm">AI Asset Generator</h2>
                  <p className="text-[10px] text-muted-foreground">Create custom stickers & assets</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Prompt Input */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-foreground">Describe your asset</label>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="A cute study buddy sticker with books..."
                  rows={3}
                  className="resize-none text-sm"
                />
                
                {/* Quick Templates */}
                <div className="flex flex-wrap gap-2">
                  {promptTemplates.slice(0, 3).map((template, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      size="sm"
                      onClick={() => handleUseTemplate(template)}
                      className="text-[10px] h-7"
                    >
                      {template.split(" ").slice(0, 3).join(" ")}...
                    </Button>
                  ))}
                </div>
              </div>

              {/* Style Selection */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-foreground">Style</label>
                <div className="grid grid-cols-3 gap-2">
                  {styles.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setSelectedStyle(style.id)}
                      className={cn(
                        "flex flex-col items-center gap-1 p-3 rounded-xl border transition-all",
                        selectedStyle === style.id
                          ? "border-primary bg-primary/10"
                          : "border-border/30 hover:border-border/50"
                      )}
                    >
                      <style.icon className={cn("w-5 h-5", style.color)} />
                      <span className="text-[10px]">{style.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Selection */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-foreground">Category</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Creativity Slider */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground">Creativity Level</label>
                  <span className="text-[10px] text-muted-foreground">{creativity[0]}%</span>
                </div>
                <Slider
                  value={creativity}
                  onValueChange={setCreativity}
                  max={100}
                  step={10}
                  className="w-full"
                />
              </div>

              {/* Auto-inject Toggle */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/30">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="auto-inject"
                    checked={autoInject}
                    onChange={(e) => setAutoInject(e.target.checked)}
                    className="w-4 h-4 rounded border-border/30"
                  />
                  <label htmlFor="auto-inject" className="text-xs text-foreground">
                    Auto-inject to canvas center
                  </label>
                </div>
                {canvasCenter ? (
                  <span className="text-[10px] text-muted-foreground">
                    Center: ({Math.round(canvasCenter.x)}, {Math.round(canvasCenter.y)})
                  </span>
                ) : (
                  <span className="text-[10px] text-muted-foreground">No canvas position</span>
                )}
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={pipelineState.isGenerating || !prompt.trim()}
                className="w-full gap-2"
                variant="hero"
              >
                {pipelineState.isGenerating ? (
                  <>
                    <Wand2 className="w-4 h-4 animate-spin" />
                    Generating... {pipelineState.progress}%
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Asset
                  </>
                )}
              </Button>

              {/* Error Display */}
              {pipelineState.error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
                  {pipelineState.error}
                </div>
              )}

              {/* Generated Assets */}
              {generatedAssets.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-foreground">
                      Generated Assets ({generatedAssets.length})
                    </label>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewMode("grid")}
                        className={cn("h-6 w-6 p-0", viewMode === "grid" && "bg-secondary")}
                      >
                        <Grid className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewMode("list")}
                        className={cn("h-6 w-6 p-0", viewMode === "list" && "bg-secondary")}
                      >
                        <List className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  <div className={cn(
                    viewMode === "grid" ? "grid grid-cols-2 gap-2" : "space-y-2"
                  )}>
                    {generatedAssets.map((asset) => (
                      <Card key={asset.id} className="overflow-hidden">
                        <CardContent className="p-3">
                          <div className="relative group">
                            <img
                              src={asset.imageUrl}
                              alt={asset.prompt}
                              className="w-full aspect-square object-cover rounded-lg"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-lg">
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => handleInsertAsset(asset)}
                                className="h-7 text-[10px]"
                              >
                                <Plus className="w-3 h-3 mr-1" />
                                Insert
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteAsset(asset.id)}
                                className="h-7 w-7 p-0 text-destructive"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                            {/* Success indicator for auto-injected stickers */}
                            {lastInsertedId === asset.id && (
                              <div className="absolute top-2 right-2 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-2 line-clamp-2">
                            {asset.prompt}
                          </p>
                          <Badge variant="outline" className="text-[9px] mt-1">
                            {asset.style}
                          </Badge>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border/30">
              <Button variant="outline" className="w-full gap-2" onClick={onClose}>
                <ChevronRight className="w-4 h-4" />
                Close Generator
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
