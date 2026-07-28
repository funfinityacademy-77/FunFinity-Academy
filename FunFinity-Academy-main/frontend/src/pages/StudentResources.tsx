import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Search, FileText, Video, Download, Link as LinkIcon, Star, Eye, Users, ExternalLink, X, Calendar, Clock, Filter, ChevronDown, FileImage, Code, FileCode, Presentation, FileSpreadsheet, Calculator, Microscope, History as HistoryIcon, Bot, PenTool, FlaskConical, Activity, Atom, Beaker, Globe, Palette, Music, Globe2, Compass, GraduationCap, BrainCircuit, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useSupabaseRealtime } from "@/hooks/useSupabaseRealtime";

interface Resource {
  id: string;
  title: string;
  description: string;
  type: "PDF" | "Video" | "Image" | "Template" | "Code" | "Presentation" | "Spreadsheet";
  subject: string;
  author: string;
  rating: number;
  downloads: number;
  views: number;
  duration?: string;
  pages?: number;
  size: string;
  url: string;
  thumbnail?: string;
  tags: string[];
  uploadedAt?: string;
  uploaded_at?: string;
}

const typeIcons: Record<string, typeof FileText> = {
  PDF: FileText,
  Video: Video,
  Image: FileImage,
  Template: FileText,
  Code: FileCode,
  Presentation: Presentation,
  Spreadsheet: FileSpreadsheet
};

const typeColors: Record<string, string> = {
  PDF: "bg-destructive/10 text-destructive border-destructive/20",
  Video: "bg-cyan/10 text-cyan border-cyan/20",
  Image: "bg-magenta/10 text-magenta border-magenta/20",
  Template: "bg-accent/10 text-accent border-accent/20",
  Code: "bg-purple/10 text-purple border-purple/20",
  Presentation: "bg-orange/10 text-orange border-orange/20",
  Spreadsheet: "bg-emerald/10 text-emerald border-emerald/20"
};

const subjectIcons: Record<string, any> = {
  Mathematics: Calculator,
  Statistics: Activity,
  Biology: Microscope,
  History: HistoryIcon,
  Coding: Bot,
  Literature: PenTool,
  Physics: Atom,
  Chemistry: Beaker,
  Geography: Globe2,
  Music: Music,
  English: BookOpen,
  "Social Studies": Compass,
  "Computer Science": BrainCircuit,
  "General Studies": GraduationCap,
  Science: FlaskConical,
  Languages: Globe,
  Arts: Palette,
};

const subjects = ["All", "Mathematics", "Statistics", "Biology", "History", "Coding", "Literature", "Physics", "Chemistry", "Geography", "Music", "English", "Social Studies", "Computer Science", "Science", "Languages", "Arts"];

const resourceTypes = ["All", "PDF", "Video", "Image", "Template", "Code", "Presentation", "Spreadsheet"];

export default function StudentResources() {
  const { data: resources, loading } = useSupabaseRealtime<Resource>('resources');
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("All");
  const [type, setType] = useState("All");
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [sortBy, setSortBy] = useState<"rating" | "downloads" | "views" | "newest">("rating");

  const filtered = (resources || []).filter(r =>
    (subject === "All" || r.subject === subject) &&
    (type === "All" || r.type === type) &&
    (r.title.toLowerCase().includes(search.toLowerCase()) ||
     r.description.toLowerCase().includes(search.toLowerCase()) ||
     r.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase())))
  );

  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case "rating":
        return b.rating - a.rating;
      case "downloads":
        return b.downloads - a.downloads;
      case "views":
        return b.views - a.views;
      case "newest":
        return new Date(b.uploadedAt || b.uploaded_at).getTime() - new Date(a.uploadedAt || a.uploaded_at).getTime();
      default:
        return 0;
    }
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Resource Hub</h1>
            <p className="text-muted-foreground text-sm mt-1">Browse and access educational resources and learning materials</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {resources?.length || 0} Resources
            </Badge>
          </div>
        </div>

        {/* Filters */}
        <Card className="border-border/30">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary/50 border border-border/30 flex-1 min-w-[250px]">
                <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                <input 
                  value={search} 
                  onChange={e => setSearch(e.target.value)} 
                  type="text" 
                  placeholder="Search resources by title, description, or tags..."
                  className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-secondary/50 border border-border/30 rounded-lg px-3 py-2 text-sm outline-none"
                >
                  <option value="rating">Sort by Rating</option>
                  <option value="downloads">Sort by Downloads</option>
                  <option value="views">Sort by Views</option>
                  <option value="newest">Sort by Newest</option>
                </select>
              </div>

              <div className="flex gap-2 flex-wrap">
                {subjects.map(s => (
                  <button 
                    key={s} 
                    onClick={() => setSubject(s)}
                    className={cn(
                      "px-3 py-2 rounded-xl text-xs font-medium border transition-all",
                      subject === s 
                        ? "bg-primary/10 text-primary border-primary/30" 
                        : "border-border/30 text-muted-foreground hover:bg-secondary/50"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <div className="flex gap-2 flex-wrap">
                {resourceTypes.map(t => (
                  <button 
                    key={t} 
                    onClick={() => setType(t)}
                    className={cn(
                      "px-3 py-2 rounded-xl text-xs font-medium border transition-all",
                      type === t 
                        ? "bg-primary/10 text-primary border-primary/30" 
                        : "border-border/30 text-muted-foreground hover:bg-secondary/50"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resource Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {sorted.length === 0 ? (
              <div className="col-span-full platform-card p-12 flex flex-col items-center justify-center text-center">
                <BookOpen className="w-16 h-16 text-muted-foreground/30 mb-4" />
                <h3 className="font-semibold text-foreground mb-2">No resources found</h3>
                <p className="text-muted-foreground text-sm">Try adjusting your filters or search terms</p>
              </div>
            ) : (
            sorted.map((r, i) => {
              const Icon = typeIcons[r.type] || FileText;
              return (
                <motion.div 
                  key={r.id} 
                  initial={{ opacity: 0, y: 12 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: i * 0.05 }}
                  className="platform-card p-4 hover:shadow-medium transition-all cursor-pointer group"
                  onClick={() => setSelectedResource(r)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center border", typeColors[r.type])}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      <span className="text-xs font-bold text-foreground">{r.rating}</span>
                    </div>
                  </div>
                  
                  <h3 className="font-semibold text-foreground text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {r.title}
                  </h3>
                  
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{r.description}</p>
                  
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <Badge variant="outline" className="text-[10px] flex items-center gap-1">
                      {(() => {
                        const SubjectIcon = subjectIcons[r.subject] || BookOpen;
                        return <SubjectIcon className="w-3 h-3" />;
                      })()}
                      {r.subject}
                    </Badge>
                    {r.tags.slice(0, 1).map(tag => (
                      <Badge key={tag} variant="secondary" className="text-[10px] px-2 py-0.5">
                        {tag}
                      </Badge>
                    ))}
                    {r.tags.length > 1 && (
                      <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
                        +{r.tags.length - 1}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border/20">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Download className="w-3 h-3" /> {r.downloads}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" /> {r.views}
                      </span>
                    </div>
                    <span className="text-[10px]">{r.size}</span>
                  </div>
                </motion.div>
              );
            })
            )}
          </div>
        )}
      </motion.div>

      {/* Resource Detail Modal */}
      <AnimatePresence>
        {selectedResource && (
          <Dialog open={!!selectedResource} onOpenChange={() => setSelectedResource(null)}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center border", typeColors[selectedResource.type])}>
                      {(() => {
                        const Icon = typeIcons[selectedResource.type] || FileText;
                        return <Icon className="w-6 h-6" />;
                      })()}
                    </div>
                    <div>
                      <DialogTitle className="text-xl">{selectedResource.title}</DialogTitle>
                      <p className="text-sm text-muted-foreground mt-1">{selectedResource.subject} · by {selectedResource.author}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setSelectedResource(null)}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                <p className="text-sm text-muted-foreground">{selectedResource.description}</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="platform-card p-3 text-center">
                    <div className="flex items-center justify-center gap-1 text-primary mb-1">
                      <Star className="w-4 h-4 fill-primary" />
                      <span className="font-bold">{selectedResource.rating}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Rating</p>
                  </div>
                  <div className="platform-card p-3 text-center">
                    <div className="flex items-center justify-center gap-1 text-primary mb-1">
                      <Download className="w-4 h-4" />
                      <span className="font-bold">{selectedResource.downloads}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Downloads</p>
                  </div>
                  <div className="platform-card p-3 text-center">
                    <div className="flex items-center justify-center gap-1 text-primary mb-1">
                      <Eye className="w-4 h-4" />
                      <span className="font-bold">{selectedResource.views}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Views</p>
                  </div>
                  <div className="platform-card p-3 text-center">
                    <div className="text-primary font-bold mb-1">{selectedResource.size}</div>
                    <p className="text-xs text-muted-foreground">File Size</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedResource.tags.map(tag => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Uploaded {new Date(selectedResource.uploadedAt || selectedResource.uploaded_at || '').toLocaleDateString()}
                  </div>
                  {selectedResource.duration && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Duration: {selectedResource.duration}
                    </div>
                  )}
                  {selectedResource.pages && (
                    <div className="flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      {selectedResource.pages} pages
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4 border-t border-border/20">
                  <Button className="flex-1 bg-gradient-brand hover:shadow-glow-cyan">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Online
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
}
