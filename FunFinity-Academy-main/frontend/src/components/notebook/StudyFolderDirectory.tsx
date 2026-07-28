import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Folder, FolderOpen, ChevronRight, ChevronDown, 
  Plus, MoreVertical, Search, Grid, List, 
  FileText, Image, Video, Music, Archive, Trash2,
  Edit2, Copy, Share, Star, Clock, Upload
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface StudyFolder {
  id: string;
  name: string;
  itemCount: number;
  subfolders?: StudyFolder[];
  createdAt: Date;
  isStarred?: boolean;
}

interface StudyFile {
  id: string;
  name: string;
  type: "notebook" | "pdf" | "image" | "video" | "audio" | "archive";
  size: string;
  modifiedAt: Date;
}

interface StudyFolderDirectoryProps {
  onFolderSelect?: (folderId: string) => void;
  onFileSelect?: (fileId: string) => void;
}

const sampleFolders: StudyFolder[] = [
  {
    id: "1",
    name: "Mathematics",
    itemCount: 12,
    createdAt: new Date("2024-01-15"),
    isStarred: true,
    subfolders: [
      { id: "1-1", name: "Calculus", itemCount: 5, createdAt: new Date("2024-01-20") },
      { id: "1-2", name: "Algebra", itemCount: 4, createdAt: new Date("2024-01-22") },
      { id: "1-3", name: "Geometry", itemCount: 3, createdAt: new Date("2024-01-25") },
    ],
  },
  {
    id: "2",
    name: "Science",
    itemCount: 8,
    createdAt: new Date("2024-02-01"),
    subfolders: [
      { id: "2-1", name: "Physics", itemCount: 4, createdAt: new Date("2024-02-05") },
      { id: "2-2", name: "Chemistry", itemCount: 4, createdAt: new Date("2024-02-10") },
    ],
  },
  {
    id: "3",
    name: "History",
    itemCount: 6,
    createdAt: new Date("2024-02-15"),
    subfolders: [],
  },
  {
    id: "4",
    name: "Literature",
    itemCount: 10,
    createdAt: new Date("2024-03-01"),
    isStarred: true,
    subfolders: [
      { id: "4-1", name: "Poetry", itemCount: 3, createdAt: new Date("2024-03-05") },
      { id: "4-2", name: "Novels", itemCount: 4, createdAt: new Date("2024-03-10") },
      { id: "4-3", name: "Essays", itemCount: 3, createdAt: new Date("2024-03-15") },
    ],
  },
];

const sampleFiles: StudyFile[] = [
  { id: "f1", name: "Calculus Notes.nb", type: "notebook", size: "2.4 MB", modifiedAt: new Date() },
  { id: "f2", name: "Physics Lab Report.pdf", type: "pdf", size: "1.8 MB", modifiedAt: new Date() },
  { id: "f3", name: "Chemistry Diagram.png", type: "image", size: "450 KB", modifiedAt: new Date() },
];

export default function StudyFolderDirectory({ onFolderSelect, onFileSelect }: StudyFolderDirectoryProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(["1", "2", "4"]));
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"tree" | "grid">("tree");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateFolder, setShowCreateFolder] = useState(false);

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };

  const handleFolderClick = (folderId: string) => {
    setSelectedFolder(folderId);
    setSelectedFile(null);
    onFolderSelect?.(folderId);
  };

  const handleFileClick = (fileId: string) => {
    setSelectedFile(fileId);
    onFileSelect?.(fileId);
  };

  const toggleStar = (folderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Toggle star logic would go here
  };

  const getFileIcon = (type: StudyFile["type"]) => {
    const icons = {
      notebook: FileText,
      pdf: FileText,
      image: Image,
      video: Video,
      audio: Music,
      archive: Archive,
    };
    return icons[type] || FileText;
  };

  const getFileTypeColor = (type: StudyFile["type"]) => {
    const colors = {
      notebook: "text-primary",
      pdf: "text-red-500",
      image: "text-cyan-500",
      video: "text-purple-500",
      audio: "text-orange-500",
      archive: "text-yellow-500",
    };
    return colors[type] || "text-muted-foreground";
  };

  // Filter folders and files based on search
  const filteredFolders = sampleFolders.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.subfolders?.some(sf => sf.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredFiles = sampleFiles.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Build breadcrumb path
  const getBreadcrumbPath = () => {
    if (!selectedFolder) return [{ id: "root", name: "My Study" }];
    
    const findPath = (folders: StudyFolder[], targetId: string, path: StudyFolder[] = []): StudyFolder[] | null => {
      for (const folder of folders) {
        if (folder.id === targetId) {
          return [...path, folder];
        }
        if (folder.subfolders) {
          const result = findPath(folder.subfolders, targetId, [...path, folder]);
          if (result) return result;
        }
      }
      return null;
    };

    const path = findPath(sampleFolders, selectedFolder);
    return path ? [{ id: "root", name: "My Study" }, ...path] : [{ id: "root", name: "My Study" }];
  };

  const breadcrumbs = getBreadcrumbPath();

  const renderFolderTree = (folders: StudyFolder[], level: number = 0) => {
    return folders.map((folder) => (
      <div key={folder.id} style={{ paddingLeft: `${level * 16}px` }}>
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 py-2 px-2 rounded-lg hover:bg-secondary/50 cursor-pointer transition-colors group"
          onClick={() => handleFolderClick(folder.id)}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFolder(folder.id);
            }}
            className="p-1 rounded hover:bg-secondary transition-colors"
          >
            {expandedFolders.has(folder.id) && folder.subfolders && folder.subfolders.length > 0 ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
          
          {expandedFolders.has(folder.id) ? (
            <FolderOpen className="w-4 h-4 text-primary" />
          ) : (
            <Folder className="w-4 h-4 text-muted-foreground" />
          )}
          
          <span className={cn(
            "text-sm flex-1",
            selectedFolder === folder.id && "font-semibold text-primary"
          )}>
            {folder.name}
          </span>
          
          <Badge variant="outline" className="text-[10px]">
            {folder.itemCount}
          </Badge>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => toggleStar(folder.id, e)}
            className={cn(
              "h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity",
              folder.isStarred && "opacity-100 text-yellow-500"
            )}
          >
            <Star className={cn("w-3 h-3", folder.isStarred && "fill-yellow-500")} />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Edit2 className="w-4 h-4 mr-2" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Copy className="w-4 h-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Share className="w-4 h-4 mr-2" />
                Share
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </motion.div>
        
        <AnimatePresence>
          {expandedFolders.has(folder.id) && folder.subfolders && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              {renderFolderTree(folder.subfolders, level + 1)}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    ));
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-4 border-b border-border/30 space-y-3">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm">
          {breadcrumbs.map((crumb, index) => (
            <div key={crumb.id} className="flex items-center gap-2">
              {index > 0 && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
              <button
                onClick={() => crumb.id === "root" ? setSelectedFolder(null) : handleFolderClick(crumb.id)}
                className={cn(
                  "hover:text-primary transition-colors",
                  index === breadcrumbs.length - 1 ? "font-semibold text-foreground" : "text-muted-foreground"
                )}
              >
                {crumb.name}
              </button>
            </div>
          ))}
        </div>

        {/* Search and Actions */}
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-secondary/50 border border-border/30">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search folders and files..."
              className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full"
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-1" />
                New
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Folder className="w-4 h-4 mr-2" />
                New Folder
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileText className="w-4 h-4 mr-2" />
                New Notebook
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Upload className="w-4 h-4 mr-2" />
                Upload File
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center gap-1 border-l border-border/30 pl-2">
            <Button
              variant={viewMode === "tree" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("tree")}
              className="h-8 w-8 p-0"
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="h-8 w-8 p-0"
            >
              <Grid className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {viewMode === "tree" ? (
          <div className="space-y-1">
            {renderFolderTree(filteredFolders)}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Folders */}
            {filteredFolders.map((folder) => (
              <Card
                key={folder.id}
                className="cursor-pointer hover:shadow-medium transition-all"
                onClick={() => handleFolderClick(folder.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <Folder className={cn(
                      "w-8 h-8",
                      selectedFolder === folder.id ? "text-primary" : "text-muted-foreground"
                    )} />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => toggleStar(folder.id, e)}
                      className={cn(
                        "h-6 w-6 p-0",
                        folder.isStarred && "text-yellow-500"
                      )}
                    >
                      <Star className={cn("w-3 h-3", folder.isStarred && "fill-yellow-500")} />
                    </Button>
                  </div>
                  <p className="font-medium text-sm mb-1">{folder.name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline" className="text-[10px]">
                      {folder.itemCount} items
                    </Badge>
                    {folder.subfolders && folder.subfolders.length > 0 && (
                      <span>{folder.subfolders.length} subfolders</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Files */}
            {filteredFiles.map((file) => {
              const FileIcon = getFileIcon(file.type);
              return (
                <Card
                  key={file.id}
                  className="cursor-pointer hover:shadow-medium transition-all"
                  onClick={() => handleFileClick(file.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <FileIcon className={cn("w-8 h-8", getFileTypeColor(file.type))} />
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <MoreVertical className="w-3 h-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit2 className="w-4 h-4 mr-2" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <p className="font-medium text-sm mb-1">{file.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{file.size}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {file.modifiedAt.toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="p-3 border-t border-border/30">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{filteredFolders.length} folders, {filteredFiles.length} files</span>
          <span>{sampleFolders.reduce((acc, f) => acc + f.itemCount, 0)} total items</span>
        </div>
      </div>
    </div>
  );
}
