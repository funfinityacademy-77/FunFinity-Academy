import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, Link } from "react-router-dom";
import { ChevronRight, Trophy, Flag, CheckCircle2, Clover as Leaf, Image as ImageIcon, ArrowLeft, Loader2, Code2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";

// Skeleton Loading Component - Exact spatial footprint match
function CourseMapSkeleton() {
  return (
    <div className="max-w-7xl mx-auto bg-slate-950 min-h-screen text-white space-y-6">
      {/* Breadcrumb Skeleton */}
      <div className="text-sm text-slate-400 mb-4 space-x-2">
        <div className="inline-block h-4 w-16 bg-slate-700/30 rounded animate-pulse" />
        <span className="mx-2">/</span>
        <div className="inline-block h-4 w-32 bg-slate-700/50 rounded animate-pulse" />
      </div>

      {/* Header Skeleton - Exact platform-card p-6 match */}
      <div className="platform-card p-6 bg-slate-900/50 border-slate-800">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-10 w-64 bg-slate-700/50 rounded animate-pulse" />
            <div className="h-4 w-96 bg-slate-700/30 rounded animate-pulse" />
          </div>
          <div className="h-10 w-32 bg-slate-700/30 rounded-lg animate-pulse" />
        </div>
      </div>

      {/* Image Samples Skeleton - Exact grid match */}
      <div className="platform-card p-4 bg-slate-900/50 border-slate-800">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-5 w-5 bg-slate-700/30 rounded animate-pulse" />
          <div className="h-6 w-40 bg-slate-700/50 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-video rounded-xl bg-slate-700/30 border border-border/30 animate-pulse" />
          ))}
        </div>
      </div>

      {/* Hexagonal Roadmap Skeleton - Exact layout match */}
      <div className="platform-card p-8 relative bg-slate-900/50 border-slate-800 min-h-[500px]">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan/5 via-transparent to-purple/5 opacity-50" />
        <div className="relative z-10 max-w-md mx-auto">
          <div className="space-y-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="relative">
                {/* Node Circle */}
                <div className="w-24 h-24 mx-auto bg-slate-700/40 rounded-full animate-pulse" />
                {/* Node Text */}
                <div className="text-center mt-3 space-y-1">
                  <div className="h-4 w-24 bg-slate-700/30 rounded mx-auto animate-pulse" />
                  <div className="h-3 w-16 bg-slate-700/20 rounded mx-auto animate-pulse" />
                </div>
              </div>
            ))}
          </div>
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
  completed: boolean;
  locked: boolean;
  imageSample?: string;
  order: number;
  contentType?: "ide" | "video" | "reading" | "quiz";
  codeTemplate?: string;
  videoUrl?: string;
}

interface CourseMapData {
  id: string;
  mapName: string;
  description: string;
  nodes: MapNode[];
  imageSamples?: string[];
}

export default function CourseMap() {
  const { id } = useParams();
  const [mapData, setMapData] = useState<CourseMapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<MapNode | null>(null);

  // Fetch course map data
  useState(() => {
    const fetchMapData = async () => {
      try {
        const data = await apiClient.get<any | null>(`/api/courses/${id}/map`);
        
        // Parse nodes if they're stored as JSON
        const parsedData = data ? {
          ...data,
          nodes: typeof data.nodes === 'string' ? JSON.parse(data.nodes) : data.nodes,
          imageSamples: typeof data.image_samples === 'string' ? JSON.parse(data.image_samples) : data.image_samples
        } : null;
        
        setMapData(parsedData);
      } catch (error) {
        console.error("Unable to load your course map. Loading default view.");
        // Set default demo data if no map exists
        setMapData({
          id: "demo",
          mapName: "Learning Journey",
          description: "Your path to mastery",
          nodes: [
            { id: "1", title: "Introduction", description: "Get started", type: "lesson", completed: true, locked: false, order: 0 },
            { id: "2", title: "Fundamentals", description: "Core concepts", type: "lesson", completed: true, locked: false, order: 1 },
            { id: "3", title: "Practice", description: "Hands-on", type: "quiz", completed: false, locked: false, order: 2 },
            { id: "4", title: "Checkpoint", description: "Test your skills", type: "milestone", completed: false, locked: false, order: 3 },
            { id: "5", title: "Advanced", description: "Deep dive", type: "lesson", completed: false, locked: true, order: 4 },
            { id: "6", title: "Final Project", description: "Showcase", type: "project", completed: false, locked: true, order: 5 },
          ],
          imageSamples: []
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchMapData();
  });

  const getNodeIcon = (node: MapNode) => {
    if (node.type === "milestone") return <Flag className="w-5 h-5" />;
    if (node.type === "project") return <Trophy className="w-5 h-5" />;
    if (node.completed) return <CheckCircle2 className="w-5 h-5" />;
    return <Leaf className="w-5 h-5" />;
  };

  const getNodeColor = (node: MapNode) => {
    if (node.locked) return "bg-slate-800 border-slate-700";
    if (node.completed) return "bg-emerald-900/40 border-emerald-500/30";
    if (node.type === "milestone") return "bg-amber-900/40 border-amber-500/30";
    if (node.type === "project") return "bg-purple-900/40 border-purple-500/30";
    return "bg-cyan-900/40 border-cyan-500/30";
  };

  if (loading) {
    return <CourseMapSkeleton />;
  }

  return (
    <div className="max-w-7xl mx-auto bg-slate-950 min-h-screen text-white">
      <nav className="text-sm text-slate-400 mb-4" aria-label="Breadcrumb">
        <Link to="/app/courses" className="hover:text-white">Courses</Link>
        <span className="mx-2">/</span>
        <span className="text-white">{mapData?.mapName || "Course Map"}</span>
      </nav>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="platform-card p-6 bg-slate-900/50 border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-2xl lg:text-3xl font-bold text-white mb-2">
                <span className="text-gradient-brand">{mapData?.mapName || "Learning Journey"}</span>
              </h1>
              <p className="text-slate-300 text-sm">{mapData?.description || "Your path to mastery"}</p>
            </div>
            <Button variant="outline" size="sm" asChild className="border-slate-700 text-slate-300 hover:bg-slate-800">
              <Link to="/app/courses">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Courses
              </Link>
            </Button>
          </div>
        </div>

        {/* Image Samples Gallery */}
        {mapData?.imageSamples && mapData.imageSamples.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="platform-card p-4 bg-slate-900/50 border-slate-800"
          >
            <h3 className="font-display font-semibold text-white mb-3 flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              Course Samples
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {mapData.imageSamples.map((sample, idx) => (
                <div
                  key={idx}
                  className="aspect-video rounded-xl bg-slate-900/50 border border-border/30 overflow-hidden cursor-pointer hover:border-cyan/50 transition-colors flex items-center justify-center"
                  onClick={() => setSelectedNode(mapData.nodes[idx] || null)}
                >
                  <ImageIcon className="w-8 h-8 text-cyan/50" />
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Hexagonal Roadmap */}
        <div className="platform-card p-8 relative bg-slate-900/50 border-slate-800">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan/5 via-transparent to-purple/5 opacity-50" />
          
          <div className="relative z-10 max-w-md mx-auto">
            <div className="space-y-8">
              {mapData?.nodes.map((node, idx) => (
                <div key={node.id} className="relative">
                  {/* Connecting Line */}
                  {idx < mapData.nodes.length - 1 && (
                    <div
                      className={cn(
                        "absolute left-1/2 -translate-x-1/2 top-12 w-0.5 h-8",
                        idx === mapData.nodes.length - 2 ? "border-l-2 border-dashed border-slate-600" : "bg-slate-700"
                      )}
                      style={{ height: "2rem" }}
                    />
                  )}

                  {/* Hexagon Node */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="relative"
                  >
                    {/* Speech bubble for jump prompt */}
                    {idx === 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="absolute -top-12 left-1/2 -translate-x-1/2 bg-cyan-500/20 border border-cyan-500/30 rounded-xl px-3 py-1.5 text-xs font-bold text-cyan backdrop-blur-md"
                      >
                        JUMP HERE?
                      </motion.div>
                    )}

                    <button
                      onClick={() => !node.locked && setSelectedNode(node)}
                      disabled={node.locked}
                      className={cn(
                        "relative w-24 h-24 mx-auto flex items-center justify-center transition-all duration-300",
                        "hexagon hover:scale-105",
                        node.locked ? "cursor-not-allowed opacity-60" : "cursor-pointer magnetic-hover",
                        getNodeColor(node)
                      )}
                      style={{
                        clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                        backgroundColor: node.locked ? "#1e293b" : node.completed ? "#064e3b" : node.type === "milestone" ? "#78350f" : node.type === "project" ? "#581c87" : "#164e63",
                        border: "2px solid",
                        borderColor: node.locked ? "#334155" : node.completed ? "#10b981" : node.type === "milestone" ? "#f59e0b" : node.type === "project" ? "#a855f7" : "#06b6d4"
                      }}
                    >
                      <div className="relative z-10 text-white">
                        {getNodeIcon(node)}
                      </div>
                      
                      {/* 3D effect overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                    </button>

                    {/* Node Label */}
                    <div className="text-center mt-3">
                      <p className={cn(
                        "text-sm font-semibold",
                        node.locked ? "text-slate-500" : "text-white"
                      )}>
                        {node.title}
                      </p>
                      <p className="text-xs text-slate-400">{node.description}</p>
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Node Detail Modal */}
        <AnimatePresence>
          {selectedNode && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedNode(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="platform-card max-w-lg w-full p-6 bg-slate-900/90 border-slate-800"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    getNodeColor(selectedNode)
                  )}>
                    {getNodeIcon(selectedNode)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display text-lg font-bold text-white">{selectedNode.title}</h3>
                    <p className="text-sm text-slate-300">{selectedNode.description}</p>
                  </div>
                </div>

                {selectedNode.imageSample && (
                  <div className="mb-4 rounded-xl overflow-hidden bg-slate-900/50 border border-border/30 flex items-center justify-center h-48">
                    <ImageIcon className="w-16 h-16 text-cyan/50" />
                  </div>
                )}

                {/* IDE Content for Computer Science */}
                {selectedNode.contentType === "ide" && selectedNode.codeTemplate && (
                  <div className="mb-4 rounded-xl overflow-hidden bg-slate-950 border border-slate-700">
                    <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-700">
                      <div className="flex items-center gap-2">
                        <Code2 className="w-4 h-4 text-cyan-400" />
                        <span className="text-xs font-semibold text-slate-300">Code Editor</span>
                      </div>
                      <Button variant="ghost" size="sm" className="h-6 text-xs text-slate-400 hover:text-white">
                        Run Code
                      </Button>
                    </div>
                    <div className="p-4">
                      <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap bg-slate-950 p-3 rounded-lg">
                        {selectedNode.codeTemplate}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Video Content for Other Subjects */}
                {selectedNode.contentType === "video" && selectedNode.videoUrl && (
                  <div className="mb-4 rounded-xl overflow-hidden bg-slate-950 border border-slate-700">
                    <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-700">
                      <div className="flex items-center gap-2">
                        <Play className="w-4 h-4 text-purple-400" />
                        <span className="text-xs font-semibold text-slate-300">Video Lesson</span>
                      </div>
                      <Button variant="ghost" size="sm" className="h-6 text-xs text-slate-400 hover:text-white">
                        Full Screen
                      </Button>
                    </div>
                    <div className="aspect-video bg-slate-950 flex items-center justify-center">
                      <div className="text-center">
                        <Play className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                        <p className="text-xs text-slate-500">Video Player</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    variant="hero"
                    size="default"
                    className="flex-1"
                    asChild
                  >
                    <Link to={`/app/courses/${id}/learn`}>
                      Start Lesson
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="default"
                    onClick={() => setSelectedNode(null)}
                    className="border-slate-700 text-slate-300 hover:bg-slate-800"
                  >
                    Close
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
