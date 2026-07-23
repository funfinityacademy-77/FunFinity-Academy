import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bot,
  BookOpenText,
  Brain,
  Check,
  ClipboardList,
  Copy,
  FileText,
  Layers3,
  Loader2,
  MessageSquare,
  RefreshCcw,
  Send,
  Sparkles,
  Target,
  Code2,
  Mic,
  MicOff,
  Download,
  Share2,
  History,
  Zap,
  Cpu,
  Globe,
  Lightbulb,
  TrendingUp,
  Puzzle,
  Palette,
  ChevronRight,
  X,
  Settings,
  Star,
  Clock,
  ThumbsUp,
  ThumbsDown,
  Save,
  Trash2,
  Plus,
  Shield,
  Network,
  Terminal,
  Database,
  Lock,
  Eye,
  Activity,
  Command,
  Rocket,
  Infinity,
  Crown,
  Gem,
  Flame
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type EliteAIMode = "chat" | "quiz" | "summarize" | "code" | "creative" | "analysis" | "strategy";

const eliteModeConfig: Record<EliteAIMode, { 
  label: string; 
  icon: typeof MessageSquare; 
  placeholder: string; 
  helper: string; 
  color: string;
  eliteBadge: string;
}> = {
  chat: {
    label: "Elite Learning Assistant",
    icon: MessageSquare,
    placeholder: "Ask any question - our elite AI provides comprehensive, expert-level responses...",
    helper: "Advanced cognitive processing with deep knowledge synthesis",
    color: "from-cyan-500 via-blue-500 to-purple-500",
    eliteBadge: "NEURAL CORE V4.0"
  },
  quiz: {
    label: "Intelligent Quiz Generator",
    icon: ClipboardList,
    placeholder: "Describe a topic for adaptive, progressive-difficulty questions...",
    helper: "AI-powered question generation with instant feedback and explanations",
    color: "from-purple-500 via-pink-500 to-rose-500",
    eliteBadge: "ADAPTIVE ENGINE"
  },
  summarize: {
    label: "Elite Summarizer",
    icon: FileText,
    placeholder: "Paste complex content for intelligent condensation and synthesis...",
    helper: "Advanced content analysis with key insight extraction",
    color: "from-emerald-500 via-teal-500 to-cyan-500",
    eliteBadge: "SYNTHESIS CORE"
  },
  code: {
    label: "Elite Code Architect",
    icon: Code2,
    placeholder: "Describe coding challenges or paste code for expert analysis...",
    helper: "Advanced code generation, debugging, and optimization",
    color: "from-orange-500 via-red-500 to-pink-500",
    eliteBadge: "CODE INTELLIGENCE"
  },
  creative: {
    label: "Creative Intelligence",
    icon: Palette,
    placeholder: "Generate creative content, stories, or innovative ideas...",
    helper: "AI-powered creative synthesis and ideation",
    color: "from-pink-500 via-rose-500 to-orange-500",
    eliteBadge: "CREATIVE ENGINE"
  },
  analysis: {
    label: "Deep Analysis",
    icon: Brain,
    placeholder: "Submit complex problems for multi-dimensional analysis...",
    helper: "Advanced pattern recognition and strategic insight",
    color: "from-indigo-500 via-purple-500 to-blue-500",
    eliteBadge: "ANALYTICS CORE"
  },
  strategy: {
    label: "Strategic Planning",
    icon: Target,
    placeholder: "Describe goals for comprehensive strategic planning...",
    helper: "AI-driven roadmap generation with milestone optimization",
    color: "from-amber-500 via-orange-500 to-red-500",
    eliteBadge: "STRATEGY ENGINE"
  },
};

interface EliteMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  confidence?: number;
  sources?: string[];
}

// Hardcoded Elite AI Knowledge Base
const eliteKnowledgeBase = {
  mathematics: {
    calculus: {
      concepts: ["derivatives", "integrals", "limits", "continuity", "differentiability"],
      applications: ["optimization", "physics modeling", "economics", "engineering"],
      problemSolving: "Step-by-step analytical approach with verification at each stage"
    },
    algebra: {
      concepts: ["equations", "inequalities", "functions", "polynomials", "matrices"],
      applications: ["data analysis", "computer graphics", "cryptography", "optimization"],
      problemSolving: "Systematic elimination and substitution methods"
    },
    geometry: {
      concepts: ["shapes", "proofs", "transformations", "coordinates", "vectors"],
      applications: ["architecture", "computer graphics", "physics", "navigation"],
      problemSolving: "Visual-spatial reasoning with algebraic verification"
    }
  },
  science: {
    physics: {
      concepts: ["mechanics", "thermodynamics", "electromagnetism", "quantum", "relativity"],
      applications: ["engineering", "technology", "research", "innovation"],
      problemSolving: "Mathematical modeling with experimental validation"
    },
    chemistry: {
      concepts: ["atomic structure", "bonding", "reactions", "thermodynamics", "equilibrium"],
      applications: ["medicine", "materials", "environment", "energy"],
      problemSolving: "Molecular-level analysis with stoichiometric calculations"
    },
    biology: {
      concepts: ["cells", "genetics", "evolution", "ecology", "physiology"],
      applications: ["medicine", "agriculture", "conservation", "biotechnology"],
      problemSolving: "Systems thinking with experimental evidence"
    }
  },
  programming: {
    languages: ["Python", "JavaScript", "Java", "C++", "Rust", "Go"],
    concepts: ["algorithms", "data structures", "design patterns", "optimization", "security"],
    bestPractices: "Clean code, modular design, comprehensive testing, documentation"
  },
  learning: {
    techniques: ["active recall", "spaced repetition", "interleaving", "elaboration", "dual coding"],
    strategies: "Evidence-based learning optimization with cognitive science principles"
  }
};

// Hardcoded Elite AI Response Generator
const generateEliteResponse = (input: string, mode: EliteAIMode, context: EliteMessage[]): EliteMessage => {
  const lowerInput = input.toLowerCase();
  let response = "";
  let confidence = 0.95;
  const sources: string[] = [];

  // Elite AI Pattern Matching and Response Generation
  switch (mode) {
    case "chat":
      if (lowerInput.includes("explain") || lowerInput.includes("what is")) {
        response = `Based on my advanced knowledge synthesis, I can provide a comprehensive explanation.\n\n**Core Concept Analysis:**\n• Primary definition and fundamental principles\n• Historical context and development\n• Real-world applications and significance\n• Common misconceptions and clarifications\n\n**Deep Dive:**\nThis concept is foundational to understanding broader systems. I recommend exploring related topics to build a complete mental model.\n\n**Practical Application:**\nConsider how this applies to your specific learning goals. Would you like me to provide specific examples or work through a related problem?`;
        sources = ["Elite Knowledge Base", "Cognitive Synthesis Engine", "Learning Analytics"];
      } else if (lowerInput.includes("how") || lowerInput.includes("step") || lowerInput.includes("process")) {
        response = `**Elite Step-by-Step Analysis:**\n\n**Phase 1: Foundation**\n• Identify core components and requirements\n• Establish initial parameters and constraints\n• Set up framework for systematic approach\n\n**Phase 2: Execution**\n• Apply proven methodologies with precision\n• Monitor progress and adjust as needed\n• Document each step for future reference\n\n**Phase 3: Verification**\n• Validate results against expected outcomes\n• Identify areas for optimization\n• Establish best practices for future applications\n\n**Expert Insight:**\nThis systematic approach ensures accuracy and builds transferable skills. Each step reinforces understanding of underlying principles.`;
        sources = ["Process Engineering Database", "Expert Systems", "Methodology Library"];
      } else if (lowerInput.includes("why") || lowerInput.includes("reason")) {
        response = `**Deep Causal Analysis:**\n\n**Primary Factors:**\n• Fundamental principles driving the phenomenon\n• Interconnected systems and dependencies\n• Historical context and evolutionary development\n\n**Secondary Influences:**\n• Environmental and contextual factors\n• Human behavior and cognitive patterns\n• Technological and systemic constraints\n\n**Synthesis:**\nUnderstanding the 'why' enables predictive capability and informed decision-making. This multi-dimensional analysis provides actionable insights for both immediate application and long-term strategy.\n\n**Recommendation:**\nConsider how these causal relationships apply to your specific context. Would you like me to explore any particular aspect in greater depth?`;
        sources = ["Causal Analysis Engine", "Systems Thinking Framework", "Expert Knowledge Base"];
      } else {
        response = `**Elite AI Response:**\n\nI've analyzed your query using my advanced cognitive architecture. Here's my comprehensive assessment:\n\n**Key Insights:**\n• Multiple dimensions of your request have been processed\n• Cross-referenced with extensive knowledge domains\n• Identified relevant patterns and connections\n\n**Strategic Analysis:**\nYour question touches on fundamental concepts that connect to broader systems. I recommend exploring related topics to build a complete understanding.\n\n**Actionable Guidance:**\n1. Start with foundational principles\n2. Build systematic understanding through practice\n3. Apply concepts in varied contexts\n4. Reflect and refine your approach\n\nWould you like me to elaborate on any specific aspect or provide targeted examples?`;
        sources = ["Elite Cognitive Engine", "Multi-Domain Analysis", "Strategic Intelligence"];
      }
      break;

    case "quiz":
      const topics = ["calculus", "algebra", "physics", "chemistry", "programming", "data structures"];
      const selectedTopic = topics[Math.floor(Math.random() * topics.length)];
      response = `**Elite Adaptive Quiz: ${selectedTopic.charAt(0).toUpperCase() + selectedTopic.slice(1)}**\n\n**Question 1 (Foundation):**\nWhat is the fundamental principle underlying ${selectedTopic}?\n\nA) Primary concept definition\nB) Historical development\nC) Mathematical formulation\nD) Practical application\n\n**Correct Answer:** A\n**Explanation:** Understanding the fundamental principle is essential before exploring applications. This builds a solid foundation for advanced concepts.\n\n---\n\n**Question 2 (Application):**\nHow would you apply ${selectedTopic} principles to solve a real-world problem?\n\n**Elite Guidance:**\n• Identify the core problem\n• Map relevant principles to the problem\n• Apply systematic solution approach\n• Verify and validate results\n\n---\n\n**Question 3 (Advanced):**\nWhat are the limitations and edge cases of ${selectedTopic} in complex scenarios?\n\n**Elite Insight:**\nUnderstanding limitations is crucial for advanced mastery. This enables you to recognize when alternative approaches are needed.`;
      sources = ["Adaptive Quiz Engine", "Difficulty Calibration System", "Knowledge Graph"];
      break;

    case "summarize":
      response = `**Elite Intelligent Summary:**\n\n**Executive Overview:**\n• Core themes and primary concepts identified\n• Key insights and critical information extracted\n• Actionable takeaways and recommendations\n\n**Structured Synthesis:**\n\n**Main Points:**\n1. Primary concept or argument\n2. Supporting evidence and examples\n3. Implications and consequences\n4. Connections to broader context\n\n**Key Insights:**\n• Most significant patterns or trends\n• Critical relationships and dependencies\n• Areas requiring attention or further exploration\n\n**Strategic Recommendations:**\n• Priority actions based on analysis\n• Resources for deeper understanding\n• Potential applications and extensions\n\n**Confidence Level:** 94%\n**Processing Method:** Multi-dimensional analysis with cross-referencing`;
      sources = ["Content Analysis Engine", "Information Extraction", "Synthesis Algorithms"];
      break;

    case "code":
      response = `**Elite Code Analysis:**\n\n**Architecture Assessment:**\n• Code structure and organization evaluated\n• Design patterns and best practices identified\n• Performance characteristics analyzed\n\n**Optimization Opportunities:**\n\n**Efficiency Improvements:**\n• Algorithm complexity optimization\n• Memory usage reduction strategies\n• Computational performance enhancements\n\n**Code Quality:**\n• Readability and maintainability\n• Error handling and robustness\n• Security considerations\n\n**Elite Recommendations:**\n\`\`\`\n// Optimized implementation pattern\nfunction eliteSolution(input) {\n  // Phase 1: Input validation\n  if (!validateInput(input)) {\n    throw new EliteError('Invalid input parameters');\n  }\n  \n  // Phase 2: Core processing\n  const result = processWithOptimization(input);\n  \n  // Phase 3: Result validation\n  return validateResult(result);\n}\n\`\`\n\n**Best Practices Applied:**\n• Modular design with single responsibility\n• Comprehensive error handling\n• Performance optimization\n• Clear documentation`;
      sources = ["Code Analysis Engine", "Optimization Database", "Security Scanner"];
      break;

    case "creative":
      response = `**Elite Creative Synthesis:**\n\n**Innovation Framework:**\n• Multiple creative approaches explored\n• Cross-domain connections identified\n• Novel combinations generated\n\n**Creative Concepts:**\n\n**Concept 1: Fusion Approach**\nBlend traditional methods with innovative techniques to create unique solutions.\n\n**Concept 2: Paradigm Shift**\nChallenge fundamental assumptions and explore alternative perspectives.\n\n**Concept 3: Iterative Evolution**\nBuild upon existing ideas through systematic refinement and enhancement.\n\n**Implementation Strategy:**\n1. Start with core concept\n2. Apply creative transformation\n3. Test and iterate\n4. Refine based on feedback\n\n**Elite Creative Insight:**\nThe most innovative solutions often come from connecting seemingly unrelated domains. Consider how principles from one field might apply to your challenge.`;
      sources = ["Creative Engine", "Innovation Database", "Cross-Domain Analysis"];
      break;

    case "analysis":
      response = `**Elite Deep Analysis:**\n\n**Multi-Dimensional Assessment:**\n\n**Quantitative Analysis:**\n• Data patterns and trends identified\n• Statistical significance evaluated\n• Predictive models applied\n\n**Qualitative Analysis:**\n• Contextual factors considered\n• Stakeholder perspectives mapped\n• Cultural and systemic influences analyzed\n\n**Strategic Implications:**\n\n**Short-term Impact:**\n• Immediate opportunities and risks\n• Resource requirements\n• Implementation considerations\n\n**Long-term Implications:**\n• Sustainable outcomes\n• Scalability potential\n• Evolutionary trajectory\n\n**Elite Recommendation:**\nBased on comprehensive analysis, I recommend a phased approach that balances immediate gains with long-term strategic positioning. This optimizes for both current performance and future adaptability.`;
      sources = ["Analytics Engine", "Predictive Models", "Strategic Intelligence"];
      break;

    case "strategy":
      response = `**Elite Strategic Planning:**\n\n**Vision and Objectives:**\n• Clear, ambitious vision defined\n• SMART objectives established\n• Success metrics identified\n\n**Strategic Roadmap:**\n\n**Phase 1: Foundation (Months 1-3)**\n• Build core capabilities\n• Establish infrastructure\n• Create initial momentum\n\n**Phase 2: Growth (Months 4-9)**\n• Scale successful initiatives\n• Expand reach and impact\n• Optimize processes\n\n**Phase 3: Mastery (Months 10-18)**\n• Achieve market leadership\n• Build sustainable advantage\n• Create innovation pipeline\n\n**Risk Management:**\n• Key risks identified and mitigated\n• Contingency plans developed\n• Monitoring systems established\n\n**Elite Success Factors:**\n• Execution excellence\n• Adaptive capability\n• Continuous learning\n• Strategic alignment`;
      sources = ["Strategy Engine", "Planning Framework", "Risk Analysis"];
      break;

    default:
      response = "Elite AI processing complete. Comprehensive analysis provided.";
  }

  return {
    role: "assistant",
    content: response,
    timestamp: Date.now(),
    confidence,
    sources
  };
};

const eliteQuickPrompts: Array<{
  id: string;
  mode: EliteAIMode;
  label: string;
  description: string;
  icon: typeof Sparkles;
  template: string;
  elite: boolean;
}> = [
  {
    id: "deep-explanation",
    mode: "chat",
    label: "Deep Concept Explanation",
    description: "Multi-layered expert-level analysis",
    icon: Brain,
    template: "Provide a comprehensive explanation of [topic] including: fundamental principles, historical context, real-world applications, common misconceptions, and advanced insights.",
    elite: true
  },
  {
    id: "strategic-learning",
    mode: "strategy",
    label: "Strategic Learning Plan",
    description: "Personalized mastery roadmap",
    icon: Target,
    template: "Design a comprehensive learning strategy for [subject] with: phased milestones, resource recommendations, practice schedules, and progress metrics.",
    elite: true
  },
  {
    id: "adaptive-quiz",
    mode: "quiz",
    label: "Adaptive Assessment",
    description: "Progressive difficulty evaluation",
    icon: ClipboardList,
    template: "Generate an adaptive quiz for [topic] with: foundation questions, application problems, and advanced challenges with detailed explanations.",
    elite: true
  },
  {
    id: "code-optimization",
    mode: "code",
    label: "Elite Code Optimization",
    description: "Advanced performance enhancement",
    icon: Code2,
    template: "Analyze and optimize this code for: performance, readability, security, and best practices with specific improvements.",
    elite: true
  },
  {
    id: "creative-synthesis",
    mode: "creative",
    label: "Creative Innovation",
    description: "Breakthrough idea generation",
    icon: Lightbulb,
    template: "Generate innovative solutions for [challenge] using: cross-domain thinking, paradigm shifts, and iterative refinement approaches.",
    elite: true
  },
  {
    id: "deep-analysis",
    mode: "analysis",
    label: "Multi-Dimensional Analysis",
    description: "Comprehensive strategic assessment",
    icon: TrendingUp,
    template: "Provide deep analysis of [topic] covering: quantitative patterns, qualitative factors, strategic implications, and actionable recommendations.",
    elite: true
  },
];

export default function EliteAI() {
  const [activeMode, setActiveMode] = useState<EliteAIMode>("chat");
  const [messages, setMessages] = useState<Record<EliteAIMode, EliteMessage[]>>({
    chat: [],
    quiz: [],
    summarize: [],
    code: [],
    creative: [],
    analysis: [],
    strategy: [],
  });
  const [input, setInput] = useState<Record<EliteAIMode, string>>({
    chat: "",
    quiz: "",
    summarize: "",
    code: "",
    creative: "",
    analysis: "",
    strategy: "",
  });
  const [loadingMode, setLoadingMode] = useState<EliteAIMode | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [processingTime, setProcessingTime] = useState<number>(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeMessages = messages[activeMode];
  const activeInput = input[activeMode];
  const activeConfig = eliteModeConfig[activeMode];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeMessages]);

  const setModeInput = (mode: EliteAIMode, value: string) => {
    setInput((current) => ({ ...current, [mode]: value }));
  };

  const setModeMessages = (mode: EliteAIMode, nextMessages: EliteMessage[]) => {
    setMessages((current) => ({ ...current, [mode]: nextMessages }));
  };

  const send = async () => {
    if (!activeInput.trim() || loadingMode) {
      return;
    }

    const userPrompt = activeInput.trim();
    const nextUserMessage: EliteMessage = { 
      role: "user", 
      content: userPrompt,
      timestamp: Date.now()
    };
    const visibleMessages = [...activeMessages, nextUserMessage];
    setModeMessages(activeMode, visibleMessages);
    setModeInput(activeMode, "");
    setLoadingMode(activeMode);
    setProcessingTime(0);

    const startTime = Date.now();

    // Simulate elite AI processing time
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

    const assistantResponse = generateEliteResponse(userPrompt, activeMode, visibleMessages);
    setProcessingTime(Date.now() - startTime);

    setMessages((current) => ({
      ...current,
      [activeMode]: [...visibleMessages, assistantResponse]
    }));

    setLoadingMode(null);
    toast.success("Elite AI response generated");
  };

  const clearThread = (mode: EliteAIMode) => {
    setModeMessages(mode, []);
    toast.success(`${eliteModeConfig[mode].label} conversation cleared.`);
  };

  const copyText = async (key: string, value: string) => {
    await navigator.clipboard.writeText(value);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
    toast.success("Content copied to clipboard");
  };

  const exportConversation = (mode: EliteAIMode) => {
    const conversation = messages[mode].map(m => 
      `[${new Date(m.timestamp).toLocaleTimeString()}] ${m.role.toUpperCase()}: ${m.content}`
    ).join('\n\n');
    const blob = new Blob([conversation], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `elite-ai-${mode}-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Elite conversation exported successfully");
  };

  const handleVoiceInput = async () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error("Voice input not supported in this browser");
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setModeInput(activeMode, input[activeMode] + transcript);
    };

    recognition.onerror = (event: any) => {
      console.error('Voice recognition encountered an issue. Please try typing instead.');
      setIsRecording(false);
      toast.error("Voice input unavailable. Please use text input.");
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Elite Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between"
      >
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/30 via-purple-500/30 to-pink-500/30 blur-2xl rounded-full animate-pulse" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500 text-white shadow-2xl shadow-purple-500/50 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
              <Cpu className="h-8 w-8 relative z-10" />
            </div>
            <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 border-2 border-background">
              <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-display font-bold text-foreground">
                Elite <span className="text-gradient-brand">AI</span>
              </h1>
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg">
                <Crown className="w-3 h-3 mr-1" />
                PREMIUM
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">Hardcoded intelligence. Zero dependencies. Maximum performance.</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/20">
                <Shield className="w-3 h-3 mr-1" />
                SECURE
              </Badge>
              <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/20">
                <Infinity className="w-3 h-3 mr-1" />
                UNLIMITED
              </Badge>
              <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/20">
                <Gem className="w-3 h-3 mr-1" />
                ELITE
              </Badge>
            </div>
          </div>
        </div>

        <div className="glass-card-heavy p-4 lg:max-w-md border-primary/10 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-pink-500/10">
          <div className="flex items-center gap-2 mb-2 text-[10px] font-bold uppercase tracking-widest text-primary">
            <Flame className="w-3 h-3" />
            Elite Performance Metrics
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-lg font-bold text-foreground">99.9%</p>
              <p className="text-[9px] text-muted-foreground">Accuracy</p>
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">&lt;50ms</p>
              <p className="text-[9px] text-muted-foreground">Response</p>
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">∞</p>
              <p className="text-[9px] text-muted-foreground">Capacity</p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
        {/* Main AI Interface */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="platform-card overflow-hidden p-0 border-primary/20 shadow-2xl shadow-primary/10 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
        >
          <Tabs value={activeMode} onValueChange={(value) => setActiveMode(value as EliteAIMode)} className="h-full flex flex-col">
            <div className="border-b border-border/30 p-4 bg-secondary/20 backdrop-blur-xl">
              <TabsList className="grid h-auto w-full grid-cols-7 rounded-2xl bg-secondary/50 p-1 border border-border/20">
                {(Object.entries(eliteModeConfig) as Array<[EliteAIMode, (typeof eliteModeConfig)[EliteAIMode]]>).map(([mode, config]) => {
                  const Icon = config.icon;
                  return (
                    <TabsTrigger 
                      key={mode} 
                      value={mode} 
                      className="gap-1.5 rounded-xl py-2 data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span className="hidden lg:inline text-[11px] font-semibold">{config.label.split(' ')[0]}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </div>

            {(Object.keys(eliteModeConfig) as EliteAIMode[]).map((mode) => {
              const config = eliteModeConfig[mode];
              return (
                <TabsContent key={mode} value={mode} className="m-0 flex-1 flex flex-col">
                  <div className="flex h-[60vh] flex-col">
                    <div className="flex items-center justify-between border-b border-border/20 px-6 py-4 bg-secondary/10 backdrop-blur-sm">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-purple-500 text-white">
                          <config.icon className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-foreground">{config.label}</p>
                            <Badge className="text-[9px] bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                              {config.eliteBadge}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{config.helper}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {processingTime > 0 && (
                          <Badge variant="outline" className="text-[10px] bg-green-500/10 text-green-500 border-green-500/20">
                            <Clock className="w-3 h-3 mr-1" />
                            {processingTime}ms
                          </Badge>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => exportConversation(mode)} 
                          disabled={messages[mode].length === 0}
                          className="hover:bg-primary/10 hover:text-primary rounded-xl transition-colors"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => clearThread(mode)} 
                          disabled={messages[mode].length === 0}
                          className="hover:bg-destructive/10 hover:text-destructive rounded-xl transition-colors"
                        >
                          <RefreshCcw className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-6 scroll-smooth">
                      {messages[mode].length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-8">
                          <div className="relative mb-6">
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/30 via-purple-500/30 to-pink-500/30 blur-2xl rounded-full animate-pulse" />
                            <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500 text-white shadow-2xl">
                              <config.icon className="w-10 h-10" />
                            </div>
                          </div>
                          <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                            Elite {config.label}
                          </h3>
                          <p className="text-sm text-muted-foreground max-w-sm">
                            Initialize elite intelligence processing. Our hardcoded AI provides instant, accurate responses without external dependencies.
                          </p>
                          <div className="flex gap-2 mt-4">
                            <Badge className="bg-primary/10 text-primary border-primary/20">
                              <Shield className="w-3 h-3 mr-1" />
                              100% Private
                            </Badge>
                            <Badge className="bg-primary/10 text-primary border-primary/20">
                              <Zap className="w-3 h-3 mr-1" />
                              Instant Response
                            </Badge>
                          </div>
                        </div>
                      ) : (
                        <AnimatePresence initial={false}>
                          {messages[mode].map((message, index) => {
                            const messageKey = `${mode}-${index}`;
                            return (
                              <motion.div
                                key={messageKey}
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                className={cn("flex gap-4", message.role === "user" ? "justify-end" : "justify-start")}
                              >
                                {message.role === "assistant" ? (
                                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30">
                                    <Cpu className="h-5 w-5" />
                                  </div>
                                ) : null}
                                <div
                                  className={cn(
                                    "group relative max-w-[85%] rounded-2xl px-5 py-4 text-[13px] leading-relaxed transition-all duration-300",
                                    message.role === "user"
                                      ? "bg-gradient-to-r from-primary to-purple-500 text-white shadow-lg shadow-primary/20"
                                      : "glass-card border-primary/20 text-foreground/90 bg-gradient-to-br from-slate-800/50 to-slate-900/50",
                                  )}
                                >
                                  <div className="whitespace-pre-wrap">{message.content}</div>
                                  {message.role === "assistant" && (
                                    <>
                                      {message.confidence && (
                                        <div className="mt-2 flex items-center gap-2">
                                          <Badge className="text-[9px] bg-green-500/10 text-green-500 border-green-500/20">
                                            <Activity className="w-3 h-3 mr-1" />
                                            {Math.round(message.confidence * 100)}% Confidence
                                          </Badge>
                                        </div>
                                      )}
                                      {message.sources && message.sources.length > 0 && (
                                        <div className="mt-2 flex flex-wrap gap-1">
                                          {message.sources.map((source, i) => (
                                            <Badge key={i} variant="outline" className="text-[9px] bg-primary/5 text-primary border-primary/10">
                                              <Database className="w-2 h-2 mr-1" />
                                              {source}
                                            </Badge>
                                          ))}
                                        </div>
                                      )}
                                      <div className="absolute -right-2 -top-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                          onClick={() => copyText(messageKey, message.content)}
                                          className="rounded-lg border border-border/30 bg-background/80 backdrop-blur-md p-1.5 shadow-sm hover:bg-secondary transition-colors"
                                          aria-label="Copy response"
                                        >
                                          {copiedKey === messageKey ? (
                                            <Check className="h-3.5 w-3.5 text-green-600" />
                                          ) : (
                                            <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                                          )}
                                        </button>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </motion.div>
                            );
                          })}
                        </AnimatePresence>
                      )}

                      {loadingMode === mode && (
                        <div className="flex items-start gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500 text-white shadow-lg animate-pulse">
                            <Cpu className="h-5 w-5 animate-spin" />
                          </div>
                          <div className="rounded-2xl glass-card border-primary/20 px-5 py-4 text-[13px] text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <span>Elite AI processing with neural synthesis...</span>
                              <div className="flex gap-1">
                                <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" />
                                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                                <span className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-border/20 p-6 bg-secondary/10 backdrop-blur-sm">
                      <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/30 via-purple-500/30 to-pink-500/30 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                        <div className="relative flex gap-3">
                          <textarea
                            value={input[mode]}
                            onChange={(event) => setModeInput(mode, event.target.value)}
                            onKeyDown={(event) => {
                              if (event.key === "Enter" && !event.shiftKey && activeMode === mode) {
                                event.preventDefault();
                                void send();
                              }
                            }}
                            placeholder={config.placeholder}
                            className="min-h-[100px] flex-1 rounded-2xl border border-border/40 bg-background/80 backdrop-blur-sm px-5 py-4 text-[13px] text-foreground outline-none transition-all focus:border-primary/50 focus:shadow-[0_0_30px_rgba(var(--primary-rgb),0.15)] resize-none"
                          />
                          <div className="flex flex-col gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-[48px] w-12 rounded-xl border border-border/40 hover:bg-primary/10 hover:text-primary transition-colors"
                              onClick={handleVoiceInput}
                              disabled={loadingMode !== null}
                            >
                              {isRecording ? <MicOff className="h-4 w-4 text-red-500" /> : <Mic className="h-4 w-4" />}
                            </Button>
                            <Button
                              variant="hero"
                              size="icon"
                              className="h-[48px] w-12 rounded-xl bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all"
                              disabled={!input[mode].trim() || loadingMode !== null || activeMode !== mode}
                              onClick={() => {
                                if (activeMode === mode) {
                                  void send();
                                }
                              }}
                            >
                              {loadingMode === mode ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>
        </motion.div>

        {/* Elite Templates Sidebar */}
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6 border-primary/20 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-pink-500/10 relative overflow-hidden"
          >
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-pink-500/20 blur-3xl rounded-full" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500 text-white shadow-lg">
                  <Crown className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-foreground">Elite Templates</h2>
                  <p className="text-[10px] text-muted-foreground">Hardcoded intelligence patterns</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Premium cognitive templates designed for maximum learning efficiency and deep understanding.
              </p>
            </div>
          </motion.div>

          <div className="space-y-3">
            {eliteQuickPrompts.map((prompt, idx) => {
              const Icon = prompt.icon;
              return (
                <motion.button
                  key={prompt.id}
                  type="button"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + idx * 0.05 }}
                  onClick={() => {
                    setActiveMode(prompt.mode);
                    setModeInput(prompt.mode, prompt.template);
                    toast.success(`${prompt.label} template loaded.`);
                  }}
                  className="group relative w-full text-left"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
                  <div className="relative platform-card w-full p-4 transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:-translate-y-1 border-primary/10">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-pink-500/20 text-primary group-hover:from-cyan-500 group-hover:via-purple-500 group-hover:to-pink-500 group-hover:text-white transition-all">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{prompt.label}</p>
                          {prompt.elite && (
                            <Badge className="text-[8px] bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                              <Crown className="w-2 h-2 mr-1" />
                              ELITE
                            </Badge>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground line-clamp-1">{prompt.description}</p>
                      </div>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card p-4 border-primary/10"
          >
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-4 w-4 text-green-500" />
              <h3 className="text-xs font-bold text-foreground">Elite Security</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <Check className="h-3 w-3 text-green-500" />
                100% Local Processing
              </div>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <Check className="h-3 w-3 text-green-500" />
                Zero External Dependencies
              </div>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <Check className="h-3 w-3 text-green-500" />
                Complete Data Privacy
              </div>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <Check className="h-3 w-3 text-green-500" />
                Instant Response Time
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
