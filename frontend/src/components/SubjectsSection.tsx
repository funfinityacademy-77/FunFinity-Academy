import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { 
  Calculator, Zap, FlaskConical, Dna, Code, Puzzle, Leaf, Map, 
  Landmark, BookOpen, Globe, Palette, Music, Brain, Cpu 
} from "lucide-react";

import { AIIcon } from "@/components/AIIcon";

// Icon mapping
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Calculator,
  Zap,
  FlaskConical,
  Dna,
  Code,
  Puzzle,
  Leaf,
  Map,
  Landmark,
  BookOpen,
  Globe,
  Palette,
  Music,
  Brain,
  Cpu,
};

// Interconnected knowledge nodes representing the landscape
const subjects = [
  {
    id: "math",
    name: "Mathematics",
    icon: "Calculator",
    color: "cyan",
    x: 50,
    y: 30,
    connections: ["physics", "coding", "logic"],
    topics: ["Algebra", "Geometry", "Calculus", "Statistics"]
  },
  {
    id: "physics",
    name: "Physics",
    icon: "Zap",
    color: "orange",
    x: 75,
    y: 25,
    connections: ["math", "chemistry", "engineering"],
    topics: ["Mechanics", "Waves", "Thermodynamics", "Quantum"]
  },
  {
    id: "chemistry",
    name: "Chemistry",
    icon: "FlaskConical",
    color: "magenta",
    x: 85,
    y: 50,
    connections: ["physics", "biology"],
    topics: ["Organic", "Inorganic", "Biochemistry", "Materials"]
  },
  {
    id: "biology",
    name: "Biology",
    icon: "Dna",
    color: "cyan",
    x: 70,
    y: 70,
    connections: ["chemistry", "environment"],
    topics: ["Genetics", "Ecology", "Anatomy", "Evolution"]
  },
  {
    id: "coding",
    name: "Coding",
    icon: "Code",
    color: "orange",
    x: 30,
    y: 45,
    connections: ["math", "logic", "engineering"],
    topics: ["Python", "Web Dev", "Algorithms", "AI/ML"]
  },
  {
    id: "logic",
    name: "Logic & Reasoning",
    icon: "Puzzle",
    color: "magenta",
    x: 25,
    y: 25,
    connections: ["math", "coding", "philosophy"],
    topics: ["Critical Thinking", "Problem Solving", "Puzzles"]
  },
  {
    id: "environment",
    name: "Environment",
    icon: "Leaf",
    color: "cyan",
    x: 50,
    y: 75,
    connections: ["biology", "geography"],
    topics: ["Climate", "Ecosystems", "Sustainability"]
  },
  {
    id: "geography",
    name: "Geography",
    icon: "Map",
    color: "orange",
    x: 20,
    y: 65,
    connections: ["environment", "history"],
    topics: ["Maps", "Cultures", "Resources", "Demographics"]
  },
  {
    id: "history",
    name: "History",
    icon: "Landmark",
    color: "magenta",
    x: 15,
    y: 45,
    connections: ["geography", "philosophy"],
    topics: ["Ancient", "Medieval", "Modern", "Civilizations"]
  },
  {
    id: "philosophy",
    name: "Philosophy",
    icon: "Brain",
    color: "cyan",
    x: 40,
    y: 15,
    connections: ["logic", "history"],
    topics: ["Ethics", "Metaphysics", "Epistemology"]
  },
  {
    id: "engineering",
    name: "Engineering",
    icon: "Wrench",
    color: "orange",
    x: 60,
    y: 55,
    connections: ["physics", "coding", "math"],
    topics: ["Robotics", "Design", "Systems", "Innovation"]
  },
];

const getColorClass = (color: string) => {
  switch (color) {
    case "cyan":
      return "from-blue to-blue-light";
    case "orange":
      return "from-orange to-orange-light";
    case "magenta":
      return "from-pink to-pink-light";
    default:
      return "from-primary to-accent";
  }
};

const getBorderColor = (color: string) => {
  switch (color) {
    case "cyan":
      return "border-blue/50 hover:border-blue";
    case "orange":
      return "border-orange/50 hover:border-orange";
    case "magenta":
      return "border-pink/50 hover:border-pink";
    default:
      return "border-border";
  }
};

export function SubjectsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [activeSubject, setActiveSubject] = useState<string | null>(null);
  const [hoveredSubject, setHoveredSubject] = useState<string | null>(null);

  const activeData = subjects.find(
    (s) => s.id === (hoveredSubject || activeSubject)
  );

  // Calculate connection lines
  const getConnectionLines = () => {
    const lines: { x1: number; y1: number; x2: number; y2: number; active: boolean }[] = [];
    const drawnConnections = new Set<string>();

    subjects.forEach((subject) => {
      subject.connections.forEach((connId) => {
        const connKey = [subject.id, connId].sort().join("-");
        if (!drawnConnections.has(connKey)) {
          const connected = subjects.find((s) => s.id === connId);
          if (connected) {
            const isActive =
              hoveredSubject === subject.id ||
              hoveredSubject === connId ||
              activeSubject === subject.id ||
              activeSubject === connId;
            lines.push({
              x1: subject.x,
              y1: subject.y,
              x2: connected.x,
              y2: connected.y,
              active: isActive,
            });
            drawnConnections.add(connKey);
          }
        }
      });
    });

    return lines;
  };

  return (
    <section
      id="subjects"
      className="py-12 md:py-16 relative overflow-hidden bg-background"
    >
      {/* Background glows */}
      <div className="absolute top-0 left-1/4 w-[300px] sm:w-[400px] md:w-[500px] h-[300px] sm:h-[400px] md:h-[500px] bg-glow-cyan opacity-20" />
      <div className="absolute bottom-0 right-1/4 w-[250px] sm:w-[300px] md:w-[400px] h-[250px] sm:h-[300px] md:h-[400px] bg-glow-magenta opacity-15" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-6 sm:mb-8"
        >
          <span className="text-sm font-medium text-accent uppercase tracking-wider mb-4 block">
            Knowledge Landscape
          </span>
          <h2 className="font-display text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 text-foreground">
            Interconnected <span className="text-gradient-brand">Learning</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Knowledge is not a checklist of isolated facts. Explore a landscape
            where ideas connect, patterns emerge, and understanding deepens
            naturally.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-4 sm:gap-6 lg:gap-8 items-start">
          {/* Interactive Map - Takes 3 columns */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-3 relative aspect-[4/3] glass-card rounded-2xl border border-border/50 overflow-hidden"
          >
            {/* Connection Lines SVG */}
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              {getConnectionLines().map((line, index) => (
                <motion.line
                  key={index}
                  x1={`${line.x1}%`}
                  y1={`${line.y1}%`}
                  x2={`${line.x2}%`}
                  y2={`${line.y2}%`}
                  stroke={line.active ? "hsl(var(--accent))" : "hsl(var(--border))"}
                  strokeWidth={line.active ? 0.4 : 0.2}
                  strokeDasharray={line.active ? "none" : "2,2"}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5, delay: 0.5 + index * 0.05 }}
                />
              ))}
            </svg>

            {/* Subject Nodes */}
            {subjects.map((subject, index) => (
              <motion.button
                key={subject.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.05 }}
                onClick={() =>
                  setActiveSubject(activeSubject === subject.id ? null : subject.id)
                }
                onMouseEnter={() => setHoveredSubject(subject.id)}
                onMouseLeave={() => setHoveredSubject(null)}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
                  hoveredSubject === subject.id || activeSubject === subject.id
                    ? "z-20 scale-125"
                    : "z-10 scale-100"
                }`}
                style={{ left: `${subject.x}%`, top: `${subject.y}%` }}
              >
                <div
                  className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center overflow-hidden
                    bg-card border-2 ${getBorderColor(subject.color)} shadow-soft
                    ${
                      hoveredSubject === subject.id || activeSubject === subject.id
                        ? "shadow-medium border-opacity-100"
                        : "border-opacity-40"
                    }
                    transition-all duration-300 relative group/node`}
                >
                  {(() => {
                    const IconComponent = iconMap[subject.icon] || BookOpen;
                    return <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 transition-transform duration-500 group-hover/node:scale-110 text-foreground" />;
                  })()}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent opacity-60" />
                </div>
                <span
                  className={`absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] md:text-xs font-medium whitespace-nowrap
                    ${
                      hoveredSubject === subject.id || activeSubject === subject.id
                        ? "text-foreground"
                        : "text-muted-foreground"
                    } transition-colors duration-300`}
                >
                  {subject.name}
                </span>
              </motion.button>
            ))}

            {/* Ambient animation */}
            <div className="absolute inset-0 bg-gradient-brand-soft animate-pulse-soft opacity-30 pointer-events-none" />
          </motion.div>

          {/* Subject Detail Panel - Takes 2 columns */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="lg:col-span-2"
          >
            <div className="glass-card rounded-2xl border border-border/50 p-4 sm:p-6 min-h-[250px] sm:min-h-[300px]">
              {activeData ? (
                <motion.div
                  key={activeData.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="relative h-36 sm:h-48 mb-4 sm:mb-6 rounded-2xl overflow-hidden glass-card-heavy border-white/10 group/img bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                    {(() => {
                      const IconComponent = iconMap[activeData.icon] || BookOpen;
                      return <IconComponent className="w-16 h-16 sm:w-20 md:w-24 text-primary/50 transition-transform duration-700 group-hover/img:scale-110" />;
                    })()}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 flex items-center gap-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden border border-white/20 bg-card flex items-center justify-center">
                        {(() => {
                          const IconComponent = iconMap[activeData.icon] || BookOpen;
                          return <IconComponent className="w-6 h-6 text-foreground" />;
                        })()}
                      </div>
                      <div>
                        <h3 className="font-display text-lg sm:text-xl font-bold text-foreground drop-shadow-sm">
                          {activeData.name}
                        </h3>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                          {activeData.connections.length} connected domains
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4 sm:mb-6">
                    <h4 className="text-sm font-medium text-foreground mb-3">
                      Explore Topics
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {activeData.topics.map((topic) => (
                        <span
                          key={topic}
                          className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm bg-gradient-to-r ${getColorClass(
                            activeData.color
                          )} text-primary-foreground shadow-sm`}
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-3">
                      Connected To
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {activeData.connections.map((connId) => {
                        const conn = subjects.find((s) => s.id === connId);
                        return conn ? (
                          <button
                            key={connId}
                            onClick={() => setActiveSubject(connId)}
                            className="flex items-center gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-secondary/50 hover:bg-secondary text-xs sm:text-sm text-secondary-foreground transition-colors"
                          >
                            <AIIcon name={conn.icon} size="sm" />
                            <span>{conn.name}</span>
                          </button>
                        ) : null;
                      })}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-8">
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="text-4xl mb-4 text-primary opacity-50"
                  >
                    <AIIcon name="Compass" size="lg" />
                  </motion.div>
                  <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                    Discover Connections
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-[200px]">
                    Click or hover over any subject node to explore its topics
                    and connections
                  </p>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-3 sm:mt-4">
              {[
                { label: "Subjects", value: "11+" },
                { label: "Topics", value: "40+" },
                { label: "Connections", value: "∞" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                  transition={{ duration: 0.5, delay: 0.6 + i * 0.1 }}
                  className="text-center p-2 sm:p-4 rounded-xl bg-secondary/30"
                >
                  <div className="font-display text-2xl font-bold text-gradient-brand">
                    {stat.value}
                  </div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
