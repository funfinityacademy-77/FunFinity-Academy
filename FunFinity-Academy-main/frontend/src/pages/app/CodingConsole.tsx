import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, Copy, Check, Terminal, Code2, Settings, Loader2, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Skeleton Loading Component
function CodingConsoleSkeleton() {
  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4 animate-pulse">
      {/* Header Skeleton */}
      <div className="platform-card p-4">
        <div className="h-6 w-48 bg-slate-700/50 rounded" />
      </div>

      {/* Main Content Skeleton */}
      <div className="flex-1 grid grid-rows-2 gap-4 min-h-0">
        {/* Code Editor Skeleton */}
        <div className="platform-card overflow-hidden flex flex-col">
          <div className="flex items-center gap-1 p-2 border-b border-border/30 bg-slate-900/50">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 w-24 bg-slate-700/30 rounded-t-lg" />
            ))}
          </div>
          <div className="flex-1 relative">
            <div className="w-full h-full p-4 space-y-2">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="h-4 bg-slate-700/20 rounded" style={{ width: `${60 + Math.random() * 40}%` }} />
              ))}
            </div>
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-slate-900/30 border-r border-border/30 p-4 space-y-2">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="h-3 bg-slate-700/20 rounded" />
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between p-3 border-t border-border/30 bg-slate-900/50">
            <div className="h-8 w-20 bg-slate-700/30 rounded" />
            <div className="h-8 w-24 bg-slate-700/30 rounded" />
          </div>
        </div>

        {/* Terminal Skeleton */}
        <div className="platform-card overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-3 border-b border-border/30 bg-slate-900/50">
            <div className="h-5 w-32 bg-slate-700/30 rounded" />
            <div className="h-8 w-16 bg-slate-700/30 rounded" />
          </div>
          <div className="flex-1 p-4 space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-slate-700/20 rounded" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface CodeTab {
  id: string;
  name: string;
  language: "javascript" | "python" | "csharp" | "cpp";
  code: string;
}

interface ConsoleOutput {
  id: string;
  type: "info" | "success" | "error" | "warning";
  message: string;
  timestamp: Date;
}

const languageTemplates: Record<string, string> = {
  javascript: `// JavaScript Example
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log("Fibonacci of 10:", fibonacci(10));`,
  python: `# Python Example
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

print("Fibonacci of 10:", fibonacci(10))`,
  csharp: `// C# Example
using System;

class Program {
    static int Fibonacci(int n) {
        if (n <= 1) return n;
        return Fibonacci(n - 1) + Fibonacci(n - 2);
    }
    
    static void Main() {
        Console.WriteLine($"Fibonacci of 10: {Fibonacci(10)}");
    }
}`,
  cpp: `// C++ Example
#include <iostream>

int fibonacci(int n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

int main() {
    std::cout << "Fibonacci of 10: " << fibonacci(10) << std::endl;
    return 0;
}`
};

const languageColors: Record<string, string> = {
  javascript: "text-yellow-400",
  python: "text-blue-400",
  csharp: "text-purple-400",
  cpp: "text-cyan-400"
};

export default function CodingConsole() {
  const [loading, setLoading] = useState(true);
  const [tabs, setTabs] = useState<CodeTab[]>([
    { id: "1", name: "main.js", language: "javascript", code: languageTemplates.javascript }
  ]);
  const [activeTabId, setActiveTabId] = useState("1");
  const [isRunning, setIsRunning] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState<ConsoleOutput[]>([]);
  const [copied, setCopied] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Simulate loading
  useEffect(() => {
    setTimeout(() => setLoading(false), 800);
  }, []);

  if (loading) {
    return <CodingConsoleSkeleton />;
  }

  const activeTab = tabs.find(tab => tab.id === activeTabId);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [consoleOutput]);

  const addTab = (language: CodeTab["language"]) => {
    const newTab: CodeTab = {
      id: Date.now().toString(),
      name: `untitled.${language === 'javascript' ? 'js' : language === 'python' ? 'py' : language === 'csharp' ? 'cs' : 'cpp'}`,
      language,
      code: languageTemplates[language]
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newTab.id);
  };

  const closeTab = (tabId: string) => {
    if (tabs.length === 1) return;
    const newTabs = tabs.filter(tab => tab.id !== tabId);
    setTabs(newTabs);
    if (activeTabId === tabId) {
      setActiveTabId(newTabs[0].id);
    }
  };

  const updateCode = (code: string) => {
    setTabs(tabs.map(tab => tab.id === activeTabId ? { ...tab, code } : tab));
  };

  const runCode = () => {
    setIsRunning(true);
    setConsoleOutput(prev => [...prev, {
      id: Date.now().toString(),
      type: "info",
      message: `Running ${activeTab?.name}...`,
      timestamp: new Date()
    }]);

    // Simulate code execution
    setTimeout(() => {
      setConsoleOutput(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        type: "success",
        message: "Execution completed successfully",
        timestamp: new Date()
      }]);
      setIsRunning(false);
    }, 1500);
  };

  const resetCode = () => {
    if (activeTab) {
      updateCode(languageTemplates[activeTab.language]);
      setConsoleOutput([]);
    }
  };

  const copyCode = () => {
    if (activeTab?.code) {
      navigator.clipboard.writeText(activeTab.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const clearConsole = () => {
    setConsoleOutput([]);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="platform-card p-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <Code2 className="w-5 h-5 text-cyan" />
          <h1 className="font-display font-semibold text-foreground">Coding Console</h1>
          <div className="flex items-center gap-1 ml-4">
            {["javascript", "python", "csharp", "cpp"].map(lang => (
              <Button
                key={lang}
                variant="ghost"
                size="sm"
                onClick={() => addTab(lang as CodeTab["language"])}
                className={cn(
                  "text-xs capitalize",
                  languageColors[lang]
                )}
              >
                + {lang}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="platform-card p-4 mb-4"
          >
            <h3 className="font-display font-semibold text-foreground mb-3">IDE Settings</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Font Size</label>
                <select className="w-full mt-1 p-2 rounded-lg glass-card text-sm bg-transparent outline-none">
                  <option value="12">12px</option>
                  <option value="14" selected>14px</option>
                  <option value="16">16px</option>
                  <option value="18">18px</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Theme</label>
                <select className="w-full mt-1 p-2 rounded-lg glass-card text-sm bg-transparent outline-none">
                  <option value="dark" selected>Dark</option>
                  <option value="light">Light</option>
                  <option value="monokai">Monokai</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 grid grid-rows-2 gap-4 min-h-0">
        {/* Code Editor */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="platform-card overflow-hidden flex flex-col"
        >
          {/* Tabs */}
          <div className="flex items-center gap-1 p-2 border-b border-border/30 bg-slate-900/50">
            {tabs.map(tab => (
              <div
                key={tab.id}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-t-lg text-xs font-medium cursor-pointer transition-colors",
                  activeTabId === tab.id
                    ? "bg-slate-800 text-foreground border-t-2 border-cyan"
                    : "text-muted-foreground hover:text-foreground hover:bg-slate-800/50"
                )}
                onClick={() => setActiveTabId(tab.id)}
              >
                <span className={cn(languageColors[tab.language])}>{tab.name}</span>
                {tabs.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      closeTab(tab.id);
                    }}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Editor */}
          <div className="flex-1 relative">
            <textarea
              value={activeTab?.code || ""}
              onChange={(e) => updateCode(e.target.value)}
              className="w-full h-full p-4 bg-transparent text-foreground font-mono text-sm resize-none outline-none"
              style={{
                lineHeight: "1.6",
                tabSize: 2
              }}
              spellCheck={false}
              placeholder="Write your code here..."
            />
            
            {/* Line Numbers */}
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-slate-900/30 border-r border-border/30 p-4 text-right font-mono text-xs text-muted-foreground select-none">
              {activeTab?.code.split('\n').map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
          </div>

          {/* Editor Actions */}
          <div className="flex items-center justify-between p-3 border-t border-border/30 bg-slate-900/50">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={resetCode}>
                <RotateCcw className="w-4 h-4 mr-1" />
                Reset
              </Button>
              <Button variant="ghost" size="sm" onClick={copyCode}>
                {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
            <Button
              variant="hero"
              size="sm"
              onClick={runCode}
              disabled={isRunning}
              className="min-w-[100px]"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Run Code
                </>
              )}
            </Button>
          </div>
        </motion.div>

        {/* Terminal */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="platform-card overflow-hidden flex flex-col"
        >
          {/* Terminal Header */}
          <div className="flex items-center justify-between p-3 border-b border-border/30 bg-slate-900/50">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan" />
              <span className="text-sm font-medium text-foreground">Terminal Output</span>
            </div>
            <Button variant="ghost" size="sm" onClick={clearConsole}>
              Clear
            </Button>
          </div>

          {/* Terminal Content */}
          <div
            ref={terminalRef}
            className="flex-1 p-4 overflow-y-auto font-mono text-sm space-y-2"
          >
            {consoleOutput.length === 0 ? (
              <div className="text-center py-8">
                <Terminal className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-muted-foreground text-xs">Run your code to see output here</p>
              </div>
            ) : (
              consoleOutput.map(output => (
                <div
                  key={output.id}
                  className={cn(
                    "flex items-start gap-2 p-2 rounded-lg",
                    output.type === "error" && "bg-destructive/10 border border-destructive/20",
                    output.type === "success" && "bg-emerald-500/10 border border-emerald-500/20",
                    output.type === "warning" && "bg-amber-500/10 border border-amber-500/20",
                    output.type === "info" && "bg-slate-800/50"
                  )}
                >
                  <span className={cn(
                    "text-xs mt-0.5",
                    output.type === "error" && "text-destructive",
                    output.type === "success" && "text-emerald-400",
                    output.type === "warning" && "text-amber-400",
                    output.type === "info" && "text-cyan"
                  )}>
                    {output.type === "error" && "✖"}
                    {output.type === "success" && "✓"}
                    {output.type === "warning" && "⚠"}
                    {output.type === "info" && "ℹ"}
                  </span>
                  <div className="flex-1">
                    <p className={cn(
                      "text-xs",
                      output.type === "error" && "text-destructive",
                      output.type === "success" && "text-emerald-400",
                      output.type === "warning" && "text-amber-400",
                      output.type === "info" && "text-foreground"
                    )}>
                      {output.message}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {output.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
