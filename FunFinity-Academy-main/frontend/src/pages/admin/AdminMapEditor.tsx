import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Upload, Image as ImageIcon, Save, X, ChevronRight, ChevronDown, Loader2, CheckCircle2, Code2, Play, FileText, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";

// Skeleton Loading Component
function AdminMapEditorSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="platform-card p-6">
        <div className="h-8 w-64 bg-slate-700/50 rounded mb-2" />
        <div className="h-4 w-96 bg-slate-700/30 rounded" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Map Settings Skeleton */}
        <div className="space-y-4">
          <div className="platform-card p-6 space-y-4">
            <div className="h-6 w-32 bg-slate-700/50 rounded" />
            <div className="space-y-2">
              <div className="h-4 w-24 bg-slate-700/30 rounded" />
              <div className="h-10 w-full bg-slate-700/20 rounded" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-24 bg-slate-700/30 rounded" />
              <div className="h-24 w-full bg-slate-700/20 rounded" />
            </div>
          </div>
          <div className="platform-card p-6 space-y-4">
            <div className="h-6 w-40 bg-slate-700/50 rounded" />
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-video bg-slate-700/30 rounded-xl" />
              ))}
            </div>
          </div>
        </div>

        {/* Nodes Editor Skeleton */}
        <div className="space-y-4">
          <div className="platform-card p-6 space-y-4">
            <div className="h-6 w-32 bg-slate-700/50 rounded" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass-card p-4 rounded-xl space-y-3">
                  <div className="h-10 w-full bg-slate-700/20 rounded" />
                </div>
              ))}
            </div>
          </div>
          <div className="h-12 w-full bg-slate-700/30 rounded" />
        </div>
      </div>
    </div>
  );
}

interface MapNode {
  id: string;
  title: string;
  description: string;
  type: "lesson" | "quiz" | "project" | "milestone";
  order: number;
  imageSample?: string;
  contentType?: "ide" | "video" | "reading" | "quiz";
  codeTemplate?: string;
  videoUrl?: string;
}

interface CourseMapData {
  id?: string;
  course_id?: string;
  mapName: string;
  description: string;
  nodes: MapNode[];
  imageSamples: string[];
}

export default function AdminMapEditor() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [mapData, setMapData] = useState<CourseMapData>({
    mapName: "",
    description: "",
    nodes: [
      { id: "1", title: "Introduction", description: "Get started", type: "lesson", order: 0 },
      { id: "2", title: "Fundamentals", description: "Core concepts", type: "lesson", order: 1 },
      { id: "3", title: "Practice", description: "Hands-on", type: "quiz", order: 2 },
    ],
    imageSamples: []
  });
  const [saving, setSaving] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Fetch courses for selection
  useState(() => {
    const fetchCourses = async () => {
      try {
        const data = await apiClient.get<any[]>('/api/courses');
        setCourses(data || []);
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourses();
  });

  const handleCourseChange = (courseId: string) => {
    setSelectedCourseId(courseId);
    // Load existing map for this course if it exists
    loadMapForCourse(courseId);
  };

  const loadMapForCourse = async (courseId: string) => {
    if (!courseId) return;
    
    try {
      const data = await apiClient.get<any | null>(`/api/courses/${courseId}/map`);
      
      if (data) {
        setMapData({
          id: data.id,
          course_id: data.course_id,
          mapName: data.map_name,
          description: data.description,
          nodes: typeof data.nodes === 'string' ? JSON.parse(data.nodes) : data.nodes,
          imageSamples: typeof data.image_samples === 'string' ? JSON.parse(data.image_samples) : data.image_samples
        });
      } else {
        // Reset to default for new map
        setMapData({
          course_id: courseId,
          mapName: "",
          description: "",
          nodes: [
            { id: "1", title: "Introduction", description: "Get started", type: "lesson", order: 0 },
            { id: "2", title: "Fundamentals", description: "Core concepts", type: "lesson", order: 1 },
            { id: "3", title: "Practice", description: "Hands-on", type: "quiz", order: 2 },
          ],
          imageSamples: []
        });
      }
    } catch (error) {
      console.error('Error loading map:', error);
    }
  };

  if (loading) {
    return <AdminMapEditorSkeleton />;
  }

  const addNode = () => {
    const newNode: MapNode = {
      id: Date.now().toString(),
      title: "New Node",
      description: "Description",
      type: "lesson",
      order: mapData.nodes.length
    };
    setMapData({ ...mapData, nodes: [...mapData.nodes, newNode] });
  };

  const removeNode = (nodeId: string) => {
    setMapData({
      ...mapData,
      nodes: mapData.nodes.filter(n => n.id !== nodeId)
    });
  };

  const updateNode = (nodeId: string, field: keyof MapNode, value: any) => {
    setMapData({
      ...mapData,
      nodes: mapData.nodes.map(n => n.id === nodeId ? { ...n, [field]: value } : n)
    });
  };

  const toggleNodeExpand = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, nodeId?: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('path', 'map-samples');

      const publicUrl = await apiClient.post<string>('/api/upload', formData);

      if (nodeId) {
        updateNode(nodeId, 'imageSample', publicUrl);
      } else {
        setMapData({ ...mapData, imageSamples: [...mapData.imageSamples, publicUrl] });
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const removeImageSample = (index: number) => {
    setMapData({
      ...mapData,
      imageSamples: mapData.imageSamples.filter((_, i) => i !== index)
    });
  };

  const saveMap = async () => {
    if (!selectedCourseId) {
      toast({
        title: "Course Selection Required",
        description: "Please select a course first before saving the map.",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      await apiClient.put(`/api/courses/${selectedCourseId}/map`, {
        map_name: mapData.mapName,
        description: mapData.description,
        nodes: JSON.stringify(mapData.nodes),
        image_samples: JSON.stringify(mapData.imageSamples)
      });

      // Show success indicator
      setTimeout(() => setSaving(false), 1000);
    } catch (error) {
      console.error('Error saving map:', error);
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="platform-card p-6"
      >
        <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground mb-2">
          <span className="text-gradient-brand">Course Map Editor</span>
        </h1>
        <p className="text-muted-foreground text-sm">Create and manage hexagonal lesson roadmaps</p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Map Settings */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <div className="platform-card p-6 space-y-4">
            <h2 className="font-display font-semibold text-foreground">Map Settings</h2>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Select Course</label>
              <select
                value={selectedCourseId}
                onChange={(e) => handleCourseChange(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border/30 text-sm font-medium text-foreground outline-none focus:border-primary/50"
              >
                <option value="">-- Select a course --</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Map Name</label>
              <Input
                value={mapData.mapName}
                onChange={(e) => setMapData({ ...mapData, mapName: e.target.value })}
                placeholder="e.g., Python Fundamentals Journey"
                className="glass-card"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Description</label>
              <Textarea
                value={mapData.description}
                onChange={(e) => setMapData({ ...mapData, description: e.target.value })}
                placeholder="Describe this learning path..."
                rows={3}
                className="glass-card resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Course ID (Optional)</label>
              <Input
                value={mapData.course_id || ""}
                onChange={(e) => setMapData({ ...mapData, course_id: e.target.value })}
                placeholder="Link to existing course"
                className="glass-card"
              />
            </div>
          </div>

          {/* Image Samples */}
          <div className="platform-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-semibold text-foreground flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Map Image Samples
              </h2>
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e)}
                />
                <Button variant="outline" size="sm" asChild>
                  <span className="flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Upload
                  </span>
                </Button>
              </label>
            </div>

            {mapData.imageSamples.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {mapData.imageSamples.map((sample, idx) => (
                  <div key={idx} className="relative group">
                    <div className="aspect-video rounded-xl overflow-hidden border border-border/30 flex items-center justify-center bg-slate-900/50">
                      <ImageIcon className="w-8 h-8 text-cyan/50" />
                    </div>
                    <button
                      onClick={() => removeImageSample(idx)}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-destructive text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border-2 border-dashed border-border/30 rounded-xl">
                <ImageIcon className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No samples uploaded</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Nodes Editor */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <div className="platform-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-semibold text-foreground">Map Nodes</h2>
              <Button variant="hero" size="sm" onClick={addNode}>
                <Plus className="w-4 h-4 mr-2" />
                Add Node
              </Button>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {mapData.nodes.map((node, idx) => (
                <div
                  key={node.id}
                  className="glass-card p-4 rounded-xl space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-cyan/20 text-cyan text-xs font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <Input
                        value={node.title}
                        onChange={(e) => updateNode(node.id, 'title', e.target.value)}
                        className="glass-card text-sm"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleNodeExpand(node.id)}
                        className="p-1 hover:bg-secondary/50 rounded-lg transition-colors"
                      >
                        {expandedNodes.has(node.id) ? (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>
                      <button
                        onClick={() => removeNode(node.id)}
                        className="p-1 hover:bg-destructive/10 rounded-lg transition-colors text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {expandedNodes.has(node.id) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-3 pl-9"
                      >
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-muted-foreground">Description</label>
                          <Textarea
                            value={node.description}
                            onChange={(e) => updateNode(node.id, 'description', e.target.value)}
                            rows={2}
                            className="glass-card text-sm resize-none"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-medium text-muted-foreground">Type</label>
                          <select
                            value={node.type}
                            onChange={(e) => updateNode(node.id, 'type', e.target.value)}
                            className="w-full p-2 rounded-lg glass-card text-sm text-foreground bg-transparent outline-none"
                          >
                            <option value="lesson">Lesson</option>
                            <option value="quiz">Quiz</option>
                            <option value="project">Project</option>
                            <option value="milestone">Milestone</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-medium text-muted-foreground">Content Type</label>
                          <select
                            value={node.contentType || "reading"}
                            onChange={(e) => updateNode(node.id, 'contentType', e.target.value)}
                            className="w-full p-2 rounded-lg glass-card text-sm text-foreground bg-transparent outline-none"
                          >
                            <option value="reading">Reading</option>
                            <option value="ide">Code IDE (Computer Science)</option>
                            <option value="video">Video Lesson</option>
                            <option value="quiz">Interactive Quiz</option>
                          </select>
                        </div>

                        {node.contentType === "ide" && (
                          <div className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                              <Code2 className="w-3 h-3" />
                              Code Template
                            </label>
                            <Textarea
                              value={node.codeTemplate || ""}
                              onChange={(e) => updateNode(node.id, 'codeTemplate', e.target.value)}
                              rows={6}
                              placeholder="// Enter code template here..."
                              className="glass-card text-sm font-mono resize-none"
                            />
                          </div>
                        )}

                        {node.contentType === "video" && (
                          <div className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                              <Play className="w-3 h-3" />
                              Video URL
                            </label>
                            <Input
                              value={node.videoUrl || ""}
                              onChange={(e) => updateNode(node.id, 'videoUrl', e.target.value)}
                              placeholder="https://..."
                              className="glass-card text-sm"
                            />
                          </div>
                        )}

                        <div className="space-y-2">
                          <label className="text-xs font-medium text-muted-foreground">Node Image Sample</label>
                          <div className="flex gap-2">
                            {node.imageSample ? (
                              <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-border/30 flex items-center justify-center bg-slate-900/50">
                                <ImageIcon className="w-8 h-8 text-cyan/50" />
                                <button
                                  onClick={() => updateNode(node.id, 'imageSample', '')}
                                  className="absolute top-1 right-1 w-4 h-4 rounded-full bg-destructive text-white flex items-center justify-center"
                                >
                                  <X className="w-2 h-2" />
                                </button>
                              </div>
                            ) : (
                              <label className="w-20 h-20 rounded-lg border-2 border-dashed border-border/30 flex items-center justify-center cursor-pointer hover:border-cyan/50 transition-colors">
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => handleImageUpload(e, node.id)}
                                />
                                <Upload className="w-4 h-4 text-muted-foreground" />
                              </label>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="platform-card p-6">
            <h2 className="font-display font-semibold text-foreground mb-4">Preview</h2>
            <div className="flex flex-wrap gap-2">
              {mapData.nodes.map((node, idx) => (
                <div
                  key={node.id}
                  className={cn(
                    "w-12 h-12 flex items-center justify-center text-white text-xs font-bold transition-all",
                    "hexagon",
                    node.type === "milestone" ? "bg-amber-600" : node.type === "project" ? "bg-purple-600" : "bg-cyan-600"
                  )}
                  style={{
                    clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)"
                  }}
                >
                  {idx + 1}
                </div>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <Button
            variant="hero"
            size="default"
            className="w-full"
            onClick={saveMap}
            disabled={saving || !mapData.mapName}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Course Map
              </>
            )}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
