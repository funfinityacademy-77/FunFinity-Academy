import { useState, useMemo, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Search, X, Users, BookOpen, FileText, MessageSquare, Calendar, Settings, ChevronRight } from "lucide-react";

interface SearchResult {
  id: string;
  type: "user" | "course" | "assignment" | "discussion" | "event" | "setting";
  title: string;
  description?: string;
  category?: string;
  icon: React.ReactNode;
  action: () => void;
}

interface GlobalSearchBarProps {
  onNavigate?: (path: string) => void;
}

const mockResults: SearchResult[] = [
  {
    id: "1",
    type: "user",
    title: "Alex Johnson",
    description: "Student • 10th Grade • Last active 2h ago",
    category: "Students",
    icon: <Users className="w-4 h-4" />,
    action: () => {},
  },
  {
    id: "2",
    type: "user",
    title: "Sarah Williams",
    description: "Teacher • Mathematics • Last active 1h ago",
    category: "Teachers",
    icon: <Users className="w-4 h-4" />,
    action: () => {},
  },
  {
    id: "3",
    type: "course",
    title: "Advanced Mathematics",
    description: "Course • 45 students enrolled • Active",
    category: "Courses",
    icon: <BookOpen className="w-4 h-4" />,
    action: () => {},
  },
  {
    id: "4",
    type: "course",
    title: "Chemistry 101",
    description: "Course • 32 students enrolled • Active",
    category: "Courses",
    icon: <BookOpen className="w-4 h-4" />,
    action: () => {},
  },
  {
    id: "5",
    type: "assignment",
    title: "Algebra Quiz #3",
    description: "Assignment • Due tomorrow • 28 submissions",
    category: "Assignments",
    icon: <FileText className="w-4 h-4" />,
    action: () => {},
  },
  {
    id: "6",
    type: "discussion",
    title: "Help with derivatives",
    description: "Discussion • 15 replies • Mathematics",
    category: "Discussions",
    icon: <MessageSquare className="w-4 h-4" />,
    action: () => {},
  },
  {
    id: "7",
    type: "event",
    title: "Parent-Teacher Conference",
    description: "Event • Dec 20, 2024 • 2:00 PM",
    category: "Events",
    icon: <Calendar className="w-4 h-4" />,
    action: () => {},
  },
  {
    id: "8",
    type: "setting",
    title: "Security Settings",
    description: "Settings • Configure authentication and permissions",
    category: "Settings",
    icon: <Settings className="w-4 h-4" />,
    action: () => {},
  },
];

const typeIcons = {
  user: <Users className="w-4 h-4 text-blue-500" />,
  course: <BookOpen className="w-4 h-4 text-green-500" />,
  assignment: <FileText className="w-4 h-4 text-purple-500" />,
  discussion: <MessageSquare className="w-4 h-4 text-orange-500" />,
  event: <Calendar className="w-4 h-4 text-pink-500" />,
  setting: <Settings className="w-4 h-4 text-gray-500" />,
};

const typeColors = {
  user: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  course: "bg-green-500/10 text-green-500 border-green-500/20",
  assignment: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  discussion: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  event: "bg-pink-500/10 text-pink-500 border-pink-500/20",
  setting: "bg-gray-500/10 text-gray-500 border-gray-500/20",
};

/**
 * Global Search Bar with working filter logic
 * Supports filtering by type, category, and search query
 */
export default function GlobalSearchBar({ onNavigate }: GlobalSearchBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredResults = useMemo(() => {
    let results = mockResults;

    // Filter by type
    if (selectedType !== "all") {
      results = results.filter(r => r.type === selectedType);
    }

    // Filter by query
    if (query.trim()) {
      const lowerQuery = query.toLowerCase();
      results = results.filter(r =>
        r.title.toLowerCase().includes(lowerQuery) ||
        r.description?.toLowerCase().includes(lowerQuery) ||
        r.category?.toLowerCase().includes(lowerQuery)
      );
    }

    return results;
  }, [query, selectedType]);

  const categories = useMemo(() => {
    const cats = new Set(mockResults.map(r => r.category));
    return Array.from(cats).filter(Boolean);
  }, []);

  const types = useMemo(() => {
    const typeSet = new Set(mockResults.map(r => r.type));
    return Array.from(typeSet);
  }, []);

  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredResults]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filteredResults.length - 1));
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (event.key === "Enter" && filteredResults.length > 0) {
        event.preventDefault();
        filteredResults[selectedIndex].action();
        setIsOpen(false);
        setQuery("");
      } else if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredResults, selectedIndex]);

  const handleSelect = (result: SearchResult) => {
    result.action();
    setIsOpen(false);
    setQuery("");
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-xl">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search users, courses, assignments, discussions..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="pl-10 pr-10 h-10"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setQuery("")}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {isOpen && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 border-border/50 shadow-xl max-h-[500px] overflow-hidden">
          <div className="p-3 border-b border-border/30">
            {/* Type Filters */}
            <div className="flex items-center gap-2 mb-2">
              <Button
                variant={selectedType === "all" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setSelectedType("all")}
                className="text-xs"
              >
                All
              </Button>
              {types.map((type) => (
                <Button
                  key={type}
                  variant={selectedType === type ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedType(type)}
                  className="text-xs capitalize"
                >
                  {type}s
                </Button>
              ))}
            </div>
          </div>

          <div className="overflow-y-auto max-h-[400px]">
            {filteredResults.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Search className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No results found for "{query}"</p>
              </div>
            ) : (
              <div className="p-2">
                {filteredResults.map((result, index) => (
                  <button
                    key={result.id}
                    onClick={() => handleSelect(result)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors",
                      index === selectedIndex
                        ? "bg-primary/10 border border-primary/20"
                        : "hover:bg-secondary/50"
                    )}
                  >
                    <div
                      className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center border",
                        typeColors[result.type]
                      )}
                    >
                      {typeIcons[result.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground truncate">{result.title}</p>
                        {result.category && (
                          <Badge variant="outline" className="text-[10px] h-5">
                            {result.category}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{result.description}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-2 border-t border-border/30 bg-secondary/30">
            <div className="flex items-center justify-between text-xs text-muted-foreground px-2">
              <span>
                {filteredResults.length} result{filteredResults.length !== 1 ? "s" : ""} found
              </span>
              <div className="flex items-center gap-2">
                <kbd className="px-1.5 py-0.5 rounded bg-background border border-border/30 text-[10px]">
                  ↑↓
                </kbd>
                <span>to navigate</span>
                <kbd className="px-1.5 py-0.5 rounded bg-background border border-border/30 text-[10px]">
                  Enter
                </kbd>
                <span>to select</span>
                <kbd className="px-1.5 py-0.5 rounded bg-background border border-border/30 text-[10px]">
                  Esc
                </kbd>
                <span>to close</span>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
