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
  Image as ImageIcon,
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
  Music,
  Video,
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
  Activity
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  buildPersonalizedPrompt,
  streamStudyAssistant,
  type AssistantMode,
  type ChatMessage,
} from "@/lib/ai-study-assistant";
import { useStudentPreferences } from "@/hooks/use-student-preferences";

type ExtendedAssistantMode = AssistantMode | "code" | "creative";

const modeConfig: Record<ExtendedAssistantMode, { label: string; icon: typeof MessageSquare; placeholder: string; helper: string; color: string }> = {
  chat: {
    label: "Learning Assistant",
    icon: MessageSquare,
    placeholder: "Ask a study question or paste a problem to work through...",
    helper: "Best for explanations, worked examples, and study strategy",
    color: "from-cyan-500 to-blue-500"
  },
  quiz: {
    label: "Quiz Generator",
    icon: ClipboardList,
    placeholder: "Describe a topic to generate a practice set...",
    helper: "Generates questions, answers, and quick feedback",
    color: "from-purple-500 to-pink-500"
  },
  summarize: {
    label: "Smart Summarizer",
    icon: FileText,
    placeholder: "Paste notes, slides, or reading text to condense it...",
    helper: "Turns longer material into clear takeaways and review points",
    color: "from-emerald-500 to-teal-500"
  },
  code: {
    label: "Code Assistant",
    icon: Code2,
    placeholder: "Describe what code you need or paste code to explain...",
    helper: "Generate, debug, and explain code in any language",
    color: "from-orange-500 to-red-500"
  },
  creative: {
    label: "Creative Studio",
    icon: Palette,
    placeholder: "Generate creative content, stories, or ideas...",
    helper: "AI-powered creative writing and brainstorming",
    color: "from-pink-500 to-rose-500"
  },
};

const quickPrompts: Array<{
  id: string;
  mode: AssistantMode;
  label: string;
  description: string;
  icon: typeof Sparkles;
  template: string;
}> = [
    {
      id: "explain-topic",
      mode: "chat",
      label: "Explain a topic",
      description: "Deep, structured explanation with checks.",
      icon: BookOpenText,
      template:
        "Explain [Enter topic] at [Specify difficulty: Beginner/Intermediate/Advanced] level. \n\nStructure your response with:\n1. Core concept summary\n2. Real-world application\n3. 3 Key technical terms explained\n4. A practice exercise with solution hidden.",
    },
    {
      id: "study-guide",
      mode: "chat",
      label: "Create a study guide",
      description: "Comprehensive guide for any subject.",
      icon: Target,
      template:
        "Generate a comprehensive study guide for [Enter topic/exam]. \n\nInclude:\n- Learning objectives\n- Priority checklist (High/Medium/Low impact)\n- Recommended study techniques for this topic\n- 5 'Active Recall' questions to test knowledge.",
    },
    {
      id: "practice-problems",
      mode: "quiz",
      label: "Generate practice set",
      description: "Progressive difficulty practice questions.",
      icon: ClipboardList,
      template:
        "Create a set of 5 practice problems for [Enter topic]. \n\nDistribution:\n- 1 Fundamental question\n- 2 Application problems\n- 2 Challenge/Complex scenarios\n\nProvide step-by-step reasoning for each answer.",
    },
    {
      id: "concept-map",
      mode: "summarize",
      label: "Build concept hierarchy",
      description: "Maps how ideas connect.",
      icon: Layers3,
      template:
        "Analyze the following content about [Enter topic] and build a conceptual hierarchy.\n\nOutline the:\n1. Central Pillar (Primary idea)\n2. Supporting Branches (Key sub-topics)\n3. Critical Details (Specifics to memorize)\n4. Inter-topic connections.",
    },
    {
      id: "exam-strategy",
      mode: "chat",
      label: "Exam preparation strategy",
      description: "Personalized roadmap for finals.",
      icon: Brain,
      template:
        "Design a study strategy for [Enter exam name] which is in [Enter timeframe]. \n\nMy current confidence is [1-10]. Focus on:\n- High-yield topics\n- Spaced repetition schedule\n- Time management during the exam\n- 3 specific pitfalls to avoid.",
    },
  ];

function buildPreferenceBadges(preferencesText: string) {
  return preferencesText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export default function AIToolkit() {
  const { preferences, needsOnboarding } = useStudentPreferences();
  const [activeMode, setActiveMode] = useState<ExtendedAssistantMode>("chat");
  const [messages, setMessages] = useState<Record<ExtendedAssistantMode, ChatMessage[]>>({
    chat: [],
    quiz: [],
    summarize: [],
    code: [],
    creative: [],
  });
  const [input, setInput] = useState<Record<ExtendedAssistantMode, string>>({
    chat: "",
    quiz: "",
    summarize: "",
    code: "",
    creative: "",
  });
  const [loadingMode, setLoadingMode] = useState<ExtendedAssistantMode | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gpt-4-turbo");
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeMessages = messages[activeMode];
  const activeInput = input[activeMode];
  const activeConfig = modeConfig[activeMode];

  const preferenceBadges = useMemo(
    () =>
      buildPreferenceBadges(
        preferences
          ? [
            `Goals: ${preferences.learningGoals.join(", ")}`,
            `Style: ${preferences.preferredLearningStyle}`,
            `Difficulty: ${preferences.difficultyPreference}`,
            `Pace: ${preferences.studyPace}`,
          ].join("\n")
          : "No student preferences saved",
      ),
    [preferences],
  );

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeMessages]);

  const setModeInput = (mode: ExtendedAssistantMode, value: string) => {
    setInput((current) => ({ ...current, [mode]: value }));
  };

  const setModeMessages = (mode: ExtendedAssistantMode, nextMessages: ChatMessage[]) => {
    setMessages((current) => ({ ...current, [mode]: nextMessages }));
  };

  const send = async () => {
    if (!activeInput.trim() || loadingMode) {
      return;
    }

    const userPrompt = activeInput.trim();
    const nextUserMessage: ChatMessage = { role: "user", content: userPrompt };
    const visibleMessages = [...activeMessages, nextUserMessage];
    setModeMessages(activeMode, visibleMessages);
    setModeInput(activeMode, "");
    setLoadingMode(activeMode);

    let assistantResponse = "";

    try {
      // Only use valid AssistantMode types for the API call
      const validMode: AssistantMode = (activeMode === "code" || activeMode === "creative") ? "chat" : activeMode;
      
      await streamStudyAssistant({
        type: validMode,
        messages: [
          ...activeMessages,
          {
            role: "user",
            content: buildPersonalizedPrompt({
              input: userPrompt,
              preferences: preferences as any,
              extraInstructions:
                activeMode === "quiz"
                  ? "Keep the quiz format clear and review-friendly."
                  : activeMode === "summarize"
                    ? "Prioritize concise structure and exam-ready clarity."
                    : activeMode === "code"
                      ? "Provide code examples and explanations with best practices."
                      : activeMode === "creative"
                        ? "Generate creative and innovative content."
                        : "Use headings or bullet points when they improve readability.",
            }),
          },
        ],
        onDelta: (chunk) => {
          assistantResponse += chunk;
          setMessages((current) => {
            const modeMessages = current[activeMode];
            const lastMessage = modeMessages[modeMessages.length - 1];

            if (lastMessage?.role === "assistant") {
              return {
                ...current,
                [activeMode]: [
                  ...modeMessages.slice(0, -1),
                  { ...lastMessage, content: assistantResponse },
                ],
              };
            }

            return {
              ...current,
              [activeMode]: [...modeMessages, { role: "assistant", content: assistantResponse }],
            };
          });
        },
        onDone: () => setLoadingMode(null),
        onError: (message) => {
          toast.error(message);
          setLoadingMode(null);
        },
      });
    } catch (error) {
      console.error('AI assistant encountered an issue. Please try again.');
      toast.error("Unable to process your request. Please try again.");
      setLoadingMode(null);
    }
  };

  const clearThread = (mode: ExtendedAssistantMode) => {
    setModeMessages(mode, []);
    toast.success(`${modeConfig[mode].label} conversation cleared.`);
  };

  const copyText = async (key: string, value: string) => {
    await navigator.clipboard.writeText(value);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const exportConversation = (mode: ExtendedAssistantMode) => {
    const conversation = messages[mode].map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n');
    const blob = new Blob([conversation], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-conversation-${mode}-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Conversation exported successfully");
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
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Professional Header matching website theme */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 border-primary/20"
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-white shadow-lg shadow-primary/30">
                <Bot className="h-8 w-8" />
              </div>
              <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 border-2 border-background">
                <div className="h-2.5 w-2.5 rounded-full bg-white animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-display font-bold text-foreground">
                  AI <span className="text-gradient-brand">Assistant</span>
                </h1>
                <Badge className="bg-primary/10 text-primary border-primary/20">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Pro
                </Badge>
              </div>
              <p className="text-muted-foreground mt-2">Intelligent learning support powered by advanced AI.</p>
            </div>
          </div>

          <div className="glass-card p-5 lg:max-w-md border-border/30">
            <div className="flex items-center gap-2 mb-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              <Activity className="w-3 h-3" />
              Learning DNA Context
            </div>
            <div className="flex flex-wrap gap-2">
              {preferenceBadges.map((badge, index) => (
                <motion.span
                  key={badge}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="rounded-lg bg-secondary/50 border border-border px-3 py-1.5 text-[11px] font-medium text-foreground"
                >
                  {badge}
                </motion.span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-8 lg:grid-cols-[1.4fr_0.6fr]">
        {/* Main AI Interface */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="platform-card overflow-hidden p-0 border-border/30"
        >
          <Tabs value={activeMode} onValueChange={(value) => setActiveMode(value as ExtendedAssistantMode)} className="h-full flex flex-col">
            <div className="border-b border-border/30 p-4 bg-secondary/30">
              <TabsList className="grid h-auto w-full grid-cols-5 rounded-xl bg-background p-1 border border-border/30">
                {(Object.entries(modeConfig) as Array<[ExtendedAssistantMode, (typeof modeConfig)[ExtendedAssistantMode]]>).map(([mode, config]) => {
                  const Icon = config.icon;
                  return (
                    <TabsTrigger 
                      key={mode} 
                      value={mode} 
                      className="gap-2 rounded-lg py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200"
                    >
                      <Icon className="h-4 w-4" />
                      <span className="hidden sm:inline text-xs font-medium">{config.label}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </div>

            {(Object.keys(modeConfig) as ExtendedAssistantMode[]).map((mode) => {
              const config = modeConfig[mode];
              return (
                <TabsContent key={mode} value={mode} className="m-0 flex-1 flex flex-col">
                  <div className="flex h-[65vh] flex-col">
                    <div className="flex items-center justify-between border-b border-border/20 px-6 py-4 bg-secondary/20">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <config.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-foreground">{config.label}</p>
                            <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/20">
                              Neural
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{config.helper}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          value={selectedModel}
                          onChange={(e) => setSelectedModel(e.target.value)}
                          className="h-8 px-3 rounded-lg border border-border bg-background focus:border-primary transition-all text-xs"
                        >
                          <option value="gpt-4-turbo">GPT-4 Turbo</option>
                          <option value="claude-3-opus">Claude 3 Opus</option>
                          <option value="claude-3-sonnet">Claude 3 Sonnet</option>
                        </select>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => exportConversation(mode)} 
                          disabled={messages[mode].length === 0}
                          className="hover:bg-secondary rounded-lg transition-colors"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => clearThread(mode)} 
                          disabled={messages[mode].length === 0}
                          className="hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors"
                        >
                          <RefreshCcw className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div ref={scrollRef} className="flex-1 space-y-6 overflow-y-auto p-6 scroll-smooth">
                      {messages[mode].length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-8">
                          <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center mb-4 border border-border/20">
                            <config.icon className="w-8 h-8 text-primary/50" />
                          </div>
                          <h3 className="text-lg font-semibold mb-2 text-foreground">Start a conversation</h3>
                          <p className="text-sm text-muted-foreground max-w-sm">
                            Ask a question or select a template to begin your learning session.
                          </p>
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
                                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <Bot className="h-5 w-5" />
                                  </div>
                                ) : null}
                                <div
                                  className={cn(
                                    "group relative max-w-[85%] rounded-2xl px-5 py-4 text-sm leading-relaxed transition-all duration-200",
                                    message.role === "user"
                                      ? "bg-primary text-primary-foreground"
                                      : "glass-card border-border/40 text-foreground",
                                  )}
                                >
                                  <div className="whitespace-pre-wrap">{message.content}</div>
                                  {message.role === "assistant" ? (
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
                                  ) : null}
                                </div>
                              </motion.div>
                            );
                          })}
                        </AnimatePresence>
                      )}

                      {loadingMode === mode && messages[mode][messages[mode].length - 1]?.role !== "assistant" ? (
                        <div className="flex items-start gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <Loader2 className="h-5 w-5 animate-spin" />
                          </div>
                          <div className="rounded-2xl glass-card border-border/40 px-5 py-4 text-sm text-muted-foreground italic">
                            <div className="flex items-center gap-2">
                              <span>Thinking...</span>
                              <div className="flex gap-1">
                                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </div>

                    <div className="border-t border-border/20 p-4 bg-secondary/20">
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
                          className="min-h-[100px] flex-1 rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary resize-none"
                        />
                        <div className="flex flex-col gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleVoiceInput}
                            disabled={loadingMode !== null}
                            className={cn(
                              "h-10 w-10 rounded-xl transition-colors",
                              isRecording ? "bg-red-500/10 text-red-500 hover:bg-red-500/20" : "hover:bg-secondary"
                            )}
                          >
                            {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="hero"
                            size="icon"
                            className="h-10 w-10 rounded-xl shrink-0"
                            disabled={!input[mode].trim() || loadingMode !== null || activeMode !== mode}
                            onClick={() => {
                              if (activeMode === mode) {
                                void send();
                              }
                            }}
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>
        </motion.div>

        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6 border-border/30"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Sparkles className="h-5 w-5" />
              </div>
              <h2 className="text-base font-semibold text-foreground">Quick Templates</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Pre-designed prompts optimized for your learning style.
            </p>
          </motion.div>

          <div className="space-y-3">
            {quickPrompts.map((prompt, idx) => {
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
                    toast.success(`${prompt.label} template added.`);
                  }}
                  className="group relative w-full text-left"
                >
                  <div className="platform-card w-full p-4 transition-all duration-200 hover:border-primary/30">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary/50 text-primary group-hover:bg-primary/10 transition-colors">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <p className="text-sm font-medium text-foreground">{prompt.label}</p>
                          <Badge variant="outline" className="text-[10px] h-5 bg-background px-2 uppercase font-medium tracking-tighter border-border/30">
                            {modeConfig[prompt.mode].label}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1">{prompt.description}</p>
                      </div>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
