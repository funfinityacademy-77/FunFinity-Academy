import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Trash2, Copy, MoreVertical, ZoomIn, ZoomOut, 
  Maximize2, Grid, List, FileText, Sparkles, Clock,
  Layers, Eye, EyeOff, Lock, Unlock, Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Slider } from "@/components/ui/slider";

interface NotebookPage {
  id: string;
  title: string;
  thumbnail: string;
  createdAt: Date;
  modifiedAt: Date;
  isLocked?: boolean;
  isVisible?: boolean;
  isStarred?: boolean;
  layerCount?: number;
}

interface NotebookPageMatrixProps {
  pages?: NotebookPage[];
  onPageSelect?: (pageId: string) => void;
  onPageAdd?: () => void;
  onPageDelete?: (pageId: string) => void;
  onPageDuplicate?: (pageId: string) => void;
}

const samplePages: NotebookPage[] = [
  {
    id: "1",
    title: "Calculus Notes - Chapter 1",
    thumbnail: "data:image/svg+xml,",
    createdAt: new Date("2024-01-15"),
    modifiedAt: new Date("2024-01-20"),
    isStarred: true,
    layerCount: 3,
  },
  {
    id: "2",
    title: "Physics Lab Report",
    thumbnail: "data:image/svg+xml,",
    createdAt: new Date("2024-01-18"),
    modifiedAt: new Date("2024-01-22"),
    layerCount: 5,
  },
  {
    id: "3",
    title: "Chemistry Formulas",
    thumbnail: "data:image/svg+xml,",
    createdAt: new Date("2024-01-20"),
    modifiedAt: new Date("2024-01-25"),
    isLocked: true,
    layerCount: 2,
  },
  {
    id: "4",
    title: "History Timeline",
    thumbnail: "data:image/svg+xml,",
    createdAt: new Date("2024-01-22"),
    modifiedAt: new Date("2024-01-28"),
    layerCount: 4,
  },
  {
    id: "5",
    title: "Literature Analysis",
    thumbnail: "data:image/svg+xml,",
    createdAt: new Date("2024-01-25"),
    modifiedAt: new Date("2024-02-01"),
    isStarred: true,
    layerCount: 6,
  },
];

export default function NotebookPageMatrix({ 
  pages = samplePages, 
  onPageSelect, 
  onPageAdd, 
  onPageDelete, 
  onPageDuplicate 
}: NotebookPageMatrixProps) {
  const [selectedPage, setSelectedPage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [zoom, setZoom] = useState([100]);
  const [showAddNode, setShowAddNode] = useState(false);
  const [hoveredPage, setHoveredPage] = useState<string | null>(null);
  const addNodeRef = useRef<HTMLDivElement>(null);

  const handlePageClick = (pageId: string) => {
    setSelectedPage(pageId);
    onPageSelect?.(pageId);
  };

  const handleAddPage = () => {
    setShowAddNode(true);
    onPageAdd?.();
  };

  const handleDeletePage = (pageId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onPageDelete?.(pageId);
  };

  const handleDuplicatePage = (pageId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onPageDuplicate?.(pageId);
  };

  const toggleLock = (pageId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Toggle lock logic would go here
  };

  const toggleVisibility =(pageId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Toggle visibility logic would go here
  };

  const toggleStar = (pageId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Toggle star logic would go here
  };

  const generateThumbnail = (page: NotebookPage) => {
    // Generate a simple SVG thumbnail based on page content
    const colors = ["#8B5CF6", "#EC4899", "#06B6D4", "#10B981", "#F59E0B"];
    const color = colors[parseInt(page.id) % colors.length];
    
    return `data:image/svg+xml,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150">
        <rect width="200" height="150" fill="#f8fafc" rx="8" />
        <rect x="10" y="10" width="180" height="130" fill="white" rx="4" />
        <rect x="20" y="20" width="160" height="2" fill="${color}" />
        <rect x="20" y="30" width="100" height="1" fill="#e2e8f0" />
        <rect x="20" y="35" width="120" height="1" fill="#e2e8f0" />
        <rect x="20" y="40" width="80" height="1" fill="#e2e8f0" />
        <circle cx="160" cy="120" r="15" fill="${color}" opacity="0.2" />
        <text x="160" y="125" font-size="12" text-anchor="middle" fill="${color}">${page.layerCount}</text>
      </svg>
    `)}`;
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-4 border-b border-border/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-foreground">Pages</h2>
            <Badge variant="outline" className="text-[10px]">{pages.length}</Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom Control */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-secondary/50 border border-border/30">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setZoom([Math.max(50, zoom[0] - 10)])}
              className="h-6 w-6 p-0"
            >
              <ZoomOut className="w-3 h-3" />
            </Button>
            <span className="text-xs font-medium w-12 text-center">{zoom[0]}%</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setZoom([Math.min(200, zoom[0] + 10)])}
              className="h-6 w-6 p-0"
            >
              <ZoomIn className="w-3 h-3" />
            </Button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 border-l border-border/30 pl-2">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="h-8 w-8 p-0"
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="h-8 w-8 p-0"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Page Matrix */}
      <div className="flex-1 overflow-y-auto p-4">
        <div 
          className={cn(
            "transition-all",
            viewMode === "grid" ? "grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3" : "space-y-2"
          )}
          style={{ transform: `scale(${zoom[0] / 100})`, transformOrigin: "top left" }}
        >
          {pages.map((page, index) => (
            <motion.div
              key={page.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="relative group"
              onMouseEnter={() => setHoveredPage(page.id)}
              onMouseLeave={() => setHoveredPage(null)}
            >
              <Card
                className={cn(
                  "cursor-pointer transition-all hover:shadow-medium overflow-hidden",
                  selectedPage === page.id && "ring-2 ring-primary",
                  !page.isVisible && "opacity-50"
                )}
                onClick={() => handlePageClick(page.id)}
              >
                <CardContent className="p-0">
                  {/* Thumbnail */}
                  <div className="relative aspect-[4/3] bg-secondary/30">
                    <img
                      src={generateThumbnail(page)}
                      alt={page.title}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Overlay Actions */}
                    <div className={cn(
                      "absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2",
                      selectedPage === page.id && "opacity-100"
                    )}>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePageClick(page.id);
                        }}
                        className="h-8"
                      >
                        <Maximize2 className="w-4 h-4 mr-1" />
                        Open
                      </Button>
                    </div>

                    {/* Status Badges */}
                    <div className="absolute top-2 right-2 flex flex-col gap-1">
                      {page.isLocked && (
                        <div className="w-6 h-6 rounded-full bg-background/80 backdrop-blur flex items-center justify-center">
                          <Lock className="w-3 h-3 text-muted-foreground" />
                        </div>
                      )}
                      {!page.isVisible && (
                        <div className="w-6 h-6 rounded-full bg-background/80 backdrop-blur flex items-center justify-center">
                          <EyeOff className="w-3 h-3 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Layer Count */}
                    <div className="absolute bottom-2 left-2">
                      <Badge variant="secondary" className="text-[10px] bg-background/80 backdrop-blur">
                        <Layers className="w-3 h-3 mr-1" />
                        {page.layerCount}
                      </Badge>
                    </div>
                  </div>

                  {/* Page Info */}
                  <div className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{page.title}</p>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {page.modifiedAt.toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => toggleStar(page.id, e)}
                          className={cn(
                            "h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity",
                            page.isStarred && "opacity-100 text-yellow-500"
                          )}
                        >
                          <Star className={cn("w-3 h-3", page.isStarred && "fill-yellow-500")} />
                        </Button>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MoreVertical className="w-3 h-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => handleDuplicatePage(page.id, e)}>
                              <Copy className="w-4 h-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => toggleLock(page.id, e)}>
                              {page.isLocked ? (
                                <>
                                  <Unlock className="w-4 h-4 mr-2" />
                                  Unlock
                                </>
                              ) : (
                                <>
                                  <Lock className="w-4 h-4 mr-2" />
                                  Lock
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => toggleVisibility(page.id, e)}>
                              {page.isVisible ? (
                                <>
                                  <EyeOff className="w-4 h-4 mr-2" />
                                  Hide
                                </>
                              ) : (
                                <>
                                  <Eye className="w-4 h-4 mr-2" />
                                  Show
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={(e) => handleDeletePage(page.id, e)}>
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Page Number Badge */}
              <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shadow-lg">
                {index + 1}
              </div>
            </motion.div>
          ))}

          {/* Add Page Node */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative group"
            ref={addNodeRef}
          >
            <Card
              className="cursor-pointer border-2 border-dashed border-border/30 hover:border-primary/50 hover:bg-primary/5 transition-all min-h-[200px] flex items-center justify-center"
              onClick={handleAddPage}
            >
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <Plus className="w-6 h-6 text-primary" />
                </div>
                <p className="text-sm font-medium text-foreground">Add New Page</p>
                <p className="text-xs text-muted-foreground mt-1">Create a blank notebook page</p>
              </CardContent>
            </Card>

            {/* Sparkle Effect */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
              <motion.div
                className="absolute top-1/2 left-1/2 w-20 h-20 bg-primary/20 rounded-full blur-xl"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 0, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-border/30 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <FileText className="w-3 h-3" />
          <span>{pages.length} pages</span>
          <span>•</span>
          <span>{pages.reduce((acc, p) => acc + (p.layerCount || 0), 0)} total layers</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2 text-xs">
            <Sparkles className="w-3 h-3" />
            Auto-arrange
          </Button>
        </div>
      </div>
    </div>
  );
}
