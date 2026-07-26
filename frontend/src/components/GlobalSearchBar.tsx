import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, BookOpen, Users, FileText, Calendar, Settings, ChevronRight, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface SearchResult {
  id: string;
  type: "course" | "user" | "document" | "event" | "setting";
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  route: string;
  category?: string;
  tags?: string[];
}

interface GlobalSearchBarProps {
  placeholder?: string;
  maxResults?: number;
  className?: string;
}

const mockSearchResults: SearchResult[] = [
  {
    id: "1",
    type: "course",
    title: "Advanced Mathematics",
    subtitle: "Calculus and beyond",
    icon: <BookOpen className="w-4 h-4" />,
    route: "/app/courses/1",
    category: "Mathematics",
    tags: ["AP", "STEM"],
  },
  {
    id: "2",
    type: "course",
    title: "Physics Fundamentals",
    subtitle: "Introduction to mechanics",
    icon: <BookOpen className="w-4 h-4" />,
    route: "/app/courses/2",
    category: "Science",
    tags: ["Honors"],
  },
  {
    id: "3",
    type: "user",
    title: "Study Group: Chemistry",
    subtitle: "5 members • Active now",
    icon: <Users className="w-4 h-4" />,
    route: "/app/groups/1",
    category: "Groups",
  },
  {
    id: "4",
    type: "document",
    title: "Chapter 5 Notes",
    subtitle: "Biology • Last edited 2h ago",
    icon: <FileText className="w-4 h-4" />,
    route: "/app/notes/1",
    category: "Notes",
  },
  {
    id: "5",
    type: "event",
    title: "Quiz: Algebra",
    subtitle: "Tomorrow at 3:00 PM",
    icon: <Calendar className="w-4 h-4" />,
    route: "/app/calendar/1",
    category: "Schedule",
  },
  {
    id: "6",
    type: "setting",
    title: "Account Settings",
    subtitle: "Profile, notifications, privacy",
    icon: <Settings className="w-4 h-4" />,
    route: "/app/settings",
    category: "Settings",
  },
];

const typeColors: Record<string, string> = {
  course: "bg-blue/10 text-blue border-blue/30",
  user: "bg-green/10 text-green border-green/30",
  document: "bg-purple/10 text-purple border-purple/30",
  event: "bg-orange/10 text-orange border-orange/30",
  setting: "bg-gray/10 text-gray border-gray/30",
};

const typeIcons: Record<string, React.ReactNode> = {
  course: <BookOpen className="w-3 h-3" />,
  user: <Users className="w-3 h-3" />,
  document: <FileText className="w-3 h-3" />,
  event: <Calendar className="w-3 h-3" />,
  setting: <Settings className="w-3 h-3" />,
};

export function GlobalSearchBar({ placeholder = "Search anything...", maxResults = 8, className }: GlobalSearchBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [filteredResults, setFilteredResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setIsOpen(true);
        inputRef.current?.focus();
      }
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setFilteredResults(mockSearchResults.slice(0, maxResults));
      setSelectedIndex(0);
      return;
    }

    const lowerQuery = query.toLowerCase();
    let results = mockSearchResults.filter((result) => {
      const matchesQuery =
        result.title.toLowerCase().includes(lowerQuery) ||
        result.subtitle?.toLowerCase().includes(lowerQuery) ||
        result.category?.toLowerCase().includes(lowerQuery) ||
        result.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery));

      const matchesFilter = activeFilter ? result.type === activeFilter : true;

      return matchesQuery && matchesFilter;
    });

    results = results.slice(0, maxResults);
    setFilteredResults(results);
    setSelectedIndex(0);
  }, [query, activeFilter, maxResults]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredResults.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredResults.length) % filteredResults.length);
    } else if (e.key === "Enter" && filteredResults.length > 0) {
      e.preventDefault();
      navigate(filteredResults[selectedIndex].route);
      setIsOpen(false);
      setQuery("");
    }
  };

  const handleResultClick = (result: SearchResult) => {
    navigate(result.route);
    setIsOpen(false);
    setQuery("");
  };

  const clearSearch = () => {
    setQuery("");
    setActiveFilter(null);
    inputRef.current?.focus();
  };

  const uniqueTypes = Array.from(new Set(mockSearchResults.map((r) => r.type)));

  return (
    <div ref={searchRef} className={cn("relative w-full max-w-xl", className)}>
      {/* Search Input */}
      <div className="relative">
        <motion.div
          animate={isOpen ? { scale: 1.02 } : { scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              type="text"
              placeholder={placeholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsOpen(true)}
              onKeyDown={handleKeyDown}
              className="pl-10 pr-10 h-10 bg-secondary/50 border-border/30 focus:border-primary/50"
            />
            {query && (
              <Button
                variant="ghost"
                size="icon"
                onClick={clearSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6"
              >
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>
        </motion.div>

        {/* Keyboard Shortcut Hint */}
        {!isOpen && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1 text-[10px] text-muted-foreground bg-secondary/50 px-1.5 py-0.5 rounded">
            <kbd className="font-sans">⌘</kbd>
            <kbd className="font-sans">K</kbd>
          </div>
        )}
      </div>

      {/* Search Results Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 z-50"
          >
            <div className="glass-card-heavy border-2 border-border/50 rounded-2xl overflow-hidden shadow-2xl">
              {/* Filter Tabs */}
              <div className="flex items-center gap-2 p-3 border-b border-border/30 overflow-x-auto">
                <Button
                  variant={activeFilter === null ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setActiveFilter(null)}
                  className="shrink-0"
                >
                  All
                </Button>
                {uniqueTypes.map((type) => (
                  <Button
                    key={type}
                    variant={activeFilter === type ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setActiveFilter(type)}
                    className="shrink-0 capitalize"
                  >
                    {type}
                  </Button>
                ))}
              </div>

              {/* Results List */}
              <div className="max-h-96 overflow-y-auto">
                {filteredResults.length === 0 ? (
                  <div className="p-8 text-center">
                    <Search className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">No results found</p>
                    <p className="text-xs text-muted-foreground mt-1">Try a different search term</p>
                  </div>
                ) : (
                  <div className="p-2">
                    {filteredResults.map((result, index) => (
                      <motion.button
                        key={result.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.15, delay: index * 0.05 }}
                        onClick={() => handleResultClick(result)}
                        className={cn(
                          "w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all",
                          index === selectedIndex
                            ? "bg-primary/10 border border-primary/30"
                            : "hover:bg-secondary/50 border border-transparent"
                        )}
                      >
                        <div
                          className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center border",
                            typeColors[result.type]
                          )}
                        >
                          {result.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-foreground truncate">
                              {result.title}
                            </p>
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[10px] px-1.5 py-0 h-5 shrink-0",
                                typeColors[result.type]
                              )}
                            >
                              {result.type}
                            </Badge>
                          </div>
                          {result.subtitle && (
                            <p className="text-xs text-muted-foreground truncate">
                              {result.subtitle}
                            </p>
                          )}
                          {result.tags && result.tags.length > 0 && (
                            <div className="flex items-center gap-1 mt-1">
                              {result.tags.slice(0, 2).map((tag) => (
                                <span
                                  key={tag}
                                  className="text-[10px] text-muted-foreground bg-secondary/50 px-1.5 py-0 rounded"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-3 border-t border-border/30 flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <kbd className="px-1.5 py-0.5 bg-secondary/50 rounded font-sans">↑↓</kbd>
                  <span>to navigate</span>
                  <kbd className="px-1.5 py-0.5 bg-secondary/50 rounded font-sans">↵</kbd>
                  <span>to select</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-1.5 py-0.5 bg-secondary/50 rounded font-sans">esc</kbd>
                  <span>to close</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * React hook for global search functionality
 */
export function useGlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);

  const openSearch = () => setIsOpen(true);
  const closeSearch = () => setIsOpen(false);
  const toggleSearch = () => setIsOpen((prev) => !prev);

  return { isOpen, openSearch, closeSearch, toggleSearch };
}
