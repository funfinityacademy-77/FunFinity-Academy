import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Award, Star, Flame, BookOpen, Target, Sparkles, Filter, ChevronDown, ChevronUp, Lock, Unlock, Clock, TrendingUp, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useGamification } from "@/hooks/use-gamification";

const rarityConfig = {
  common: { 
    label: "Common", 
    color: "from-gray-500 to-gray-600", 
    bg: "bg-gray-500/10", 
    border: "border-gray-500/30",
    text: "text-gray-500"
  },
  rare: { 
    label: "Rare", 
    color: "from-blue-500 to-cyan-500", 
    bg: "bg-blue-500/10", 
    border: "border-blue-500/30",
    text: "text-blue-500"
  },
  epic: { 
    label: "Epic", 
    color: "from-purple-500 to-pink-500", 
    bg: "bg-purple-500/10", 
    border: "border-purple-500/30",
    text: "text-purple-500"
  },
  legendary: { 
    label: "Legendary", 
    color: "from-yellow-500 to-orange-500", 
    bg: "bg-yellow-500/10", 
    border: "border-yellow-500/30",
    text: "text-yellow-500"
  },
};

const categoryIcons: Record<string, typeof Trophy> = {
  Onboarding: Trophy,
  Streak: Flame,
  Quizzes: Target,
  Time: Clock,
  Exploration: BookOpen,
  Community: Sparkles,
  Levels: Star,
  "Study Time": TrendingUp,
  Courses: BookOpen,
  Assignments: Target,
  Badges: Award,
  XP: Star,
  Achievements: Trophy,
  Social: Sparkles,
  Learning: BookOpen,
  Challenges: Target,
  Events: Calendar as any,
};

export default function Badges() {
  const { stats, loading } = useGamification();
  const [filterRarity, setFilterRarity] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const categories = Array.from(new Set(stats.badges.map(b => b.category)));
  const earnedBadges = stats.badges.filter(b => b.earned);
  const lockedBadges = stats.badges.filter(b => !b.earned);

  const filteredBadges = stats.badges.filter(badge => {
    const matchesRarity = filterRarity === "all" || badge.rarity === filterRarity;
    const matchesCategory = filterCategory === "all" || badge.category === filterCategory;
    const matchesStatus = filterStatus === "all" || 
                          (filterStatus === "earned" && badge.earned) ||
                          (filterStatus === "locked" && !badge.earned);
    return matchesRarity && matchesCategory && matchesStatus;
  });

  const getProgressPercentage = (badge: any) => {
    if (badge.earned) return 100;
    if (badge.progress !== undefined && badge.maxProgress !== undefined) {
      return (badge.progress / badge.maxProgress) * 100;
    }
    return 0;
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 flex items-center justify-center border border-yellow-500/20">
            <Trophy className="w-5 h-5 text-yellow-500" />
          </div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">
            <span className="text-gradient-brand">Achievements</span>
          </h1>
        </div>
        <p className="text-muted-foreground text-sm ml-1">
          Earn badges by completing challenges and reaching milestones
        </p>
      </motion.div>

      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <div className="platform-card p-4 border-primary/10">
          <div className="text-2xl font-bold text-foreground">{earnedBadges.length}</div>
          <div className="text-xs text-muted-foreground">Badges Earned</div>
        </div>
        <div className="platform-card p-4 border-blue-500/10">
          <div className="text-2xl font-bold text-blue-500">{stats.level}</div>
          <div className="text-xs text-muted-foreground">Current Level</div>
        </div>
        <div className="platform-card p-4 border-orange-500/10">
          <div className="text-2xl font-bold text-orange-500">{stats.streak}</div>
          <div className="text-xs text-muted-foreground">Day Streak</div>
        </div>
        <div className="platform-card p-4 border-purple-500/10">
          <div className="text-2xl font-bold text-purple-500">{stats.points}</div>
          <div className="text-xs text-muted-foreground">Total XP</div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="platform-card p-4 border-border/30"
      >
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground">Filters:</span>
          </div>
          
          <select
            value={filterRarity}
            onChange={(e) => setFilterRarity(e.target.value)}
            className="h-9 px-3 rounded-lg border border-border/50 bg-secondary/40 focus:bg-background transition-all text-sm"
          >
            <option value="all">All Rarities</option>
            <option value="common">Common</option>
            <option value="rare">Rare</option>
            <option value="epic">Epic</option>
            <option value="legendary">Legendary</option>
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="h-9 px-3 rounded-lg border border-border/50 bg-secondary/40 focus:bg-background transition-all text-sm"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-9 px-3 rounded-lg border border-border/50 bg-secondary/40 focus:bg-background transition-all text-sm"
          >
            <option value="all">All Status</option>
            <option value="earned">Earned</option>
            <option value="locked">Locked</option>
          </select>
        </div>
      </motion.div>

      {/* Badges by Category */}
      <div className="space-y-6">
        {categories.map((category, categoryIndex) => {
          const categoryBadges = filteredBadges.filter(b => b.category === category);
          const CategoryIcon = categoryIcons[category] || Trophy;
          const isExpanded = expandedCategory === category;

          if (categoryBadges.length === 0) return null;

          return (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + categoryIndex * 0.1 }}
              className="platform-card border-border/30 overflow-hidden"
            >
              <button
                onClick={() => setExpandedCategory(isExpanded ? null : category)}
                className="w-full p-4 flex items-center justify-between hover:bg-secondary/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <CategoryIcon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-foreground">{category}</h3>
                    <p className="text-xs text-muted-foreground">
                      {categoryBadges.filter(b => b.earned).length} / {categoryBadges.length} earned
                    </p>
                  </div>
                </div>
                {isExpanded ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-border/20"
                  >
                    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {categoryBadges.map((badge, index) => {
                        const rarity = rarityConfig[badge.rarity];
                        const progress = getProgressPercentage(badge);
                        const Icon = badge.earned ? Unlock : Lock;

                        return (
                          <motion.div
                            key={badge.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className={cn(
                              "relative p-4 rounded-2xl border transition-all hover:scale-[1.02] hover:shadow-lg",
                              badge.earned
                                ? `${rarity.bg} ${rarity.border} bg-gradient-to-br ${rarity.color} bg-opacity-10`
                                : "bg-secondary/30 border-border/40 opacity-60"
                            )}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className={cn(
                                "w-16 h-16 rounded-2xl flex items-center justify-center text-3xl",
                                badge.earned ? "bg-white/20 backdrop-blur-sm" : "bg-border/50"
                              )}>
                                {badge.icon}
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className={cn("text-[10px]", rarity.bg, rarity.border, rarity.text)}>
                                  {rarity.label}
                                </Badge>
                                {badge.earned ? (
                                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                    <Unlock className="w-4 h-4 text-emerald-500" />
                                  </div>
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center">
                                    <Lock className="w-4 h-4 text-muted-foreground" />
                                  </div>
                                )}
                              </div>
                            </div>

                            <h4 className="font-bold text-foreground mb-1">{badge.name}</h4>
                            <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{badge.description}</p>

                            {!badge.earned && badge.progress !== undefined && badge.maxProgress !== undefined && (
                              <div className="space-y-1">
                                <div className="flex justify-between text-[10px] text-muted-foreground">
                                  <span>Progress</span>
                                  <span>{badge.progress} / {badge.maxProgress}</span>
                                </div>
                                <div className="h-2 rounded-full bg-border/50 overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.5 }}
                                    className={cn("h-full rounded-full", rarity.color.replace("from-", "bg-gradient-to-r ").replace(" to-", " to-"))}
                                  />
                                </div>
                              </div>
                            )}

                            {badge.earnedAt && (
                              <div className="mt-3 flex items-center gap-1 text-[10px] text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                Earned {new Date(badge.earnedAt).toLocaleDateString()}
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredBadges.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="platform-card p-12 text-center border-dashed border-2 border-border/40"
        >
          <Trophy className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-bold mb-2">No badges found</h3>
          <p className="text-muted-foreground text-sm">
            Try adjusting your filters to see more badges
          </p>
        </motion.div>
      )}
    </div>
  );
}
