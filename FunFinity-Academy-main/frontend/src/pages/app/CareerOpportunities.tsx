import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, Heart, MapPin, Tag, Filter, Sparkles, Microscope, Palette, BarChart3, HeartPulse, Hammer, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCareer, CareerCluster, allOpportunities } from "@/hooks/use-career";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const clusterColors: Record<CareerCluster, string> = {
  STEM: "bg-cyan/10 text-cyan border-cyan/30",
  Arts: "bg-magenta/10 text-magenta border-magenta/30",
  Business: "bg-orange/10 text-orange border-orange/30",
  Healthcare: "bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-400",
  Trades: "bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400",
  "Public Service": "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400",
};

const clusterIcons: Record<CareerCluster, typeof Microscope> = {
  STEM: Microscope, Arts: Palette, Business: BarChart3, Healthcare: HeartPulse, Trades: Hammer, "Public Service": Building2,
};

export default function CareerOpportunities() {
  const { profile, toggleSaveOpportunity, getRecommendedOpportunities } = useCareer();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [loading, setLoading] = useState(false);

  const opportunities = useMemo(() => {
    let list = getRecommendedOpportunities();
    if (search) list = list.filter(o => o.title.toLowerCase().includes(search.toLowerCase()) || o.description.toLowerCase().includes(search.toLowerCase()));
    if (categoryFilter !== "all") list = list.filter(o => o.category === categoryFilter);
    if (typeFilter !== "all") list = list.filter(o => o.type === typeFilter);
    return list;
  }, [search, categoryFilter, typeFilter, profile.quizCompleted]);

  const isRecommended = (category: CareerCluster) => profile.quizCompleted && profile.careerInterests.includes(category);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Opportunities</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {profile.quizCompleted ? "Showing recommended opportunities based on your Pathfinder results" : "Take the Pathfinder Quiz to get personalized recommendations"}
          </p>
        </div>
        {!profile.quizCompleted && (
          <Button variant="hero" size="sm" onClick={() => navigate("/app/career/pathfinder")}>
            <Sparkles className="w-4 h-4 mr-1" /> Take Quiz
          </Button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary/50 border border-border/30">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search opportunities..." className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full" />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {(["STEM", "Arts", "Business", "Healthcare", "Trades", "Public Service"] as CareerCluster[]).map(c => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {["Internship", "Volunteer", "Scholarship", "Workshop", "Job Shadow", "Mentorship"].map(t => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {opportunities.length === 0 ? (
        <Card className="glass-card border-border/30">
          <CardContent className="p-12 text-center">
            <Search className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No opportunities found</h3>
            <p className="text-sm text-muted-foreground">Try adjusting your search or filters.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {opportunities.map((opp, i) => {
            const saved = profile.savedOpportunities.includes(opp.id);
            return (
              <motion.div key={opp.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className={cn("glass-card border-border/30 h-full flex flex-col transition-all hover:shadow-medium", isRecommended(opp.category) && "ring-2 ring-primary/20")}>
                  <CardContent className="p-5 flex flex-col flex-1">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex flex-wrap gap-1.5">
                        <Badge variant="outline" className={cn("flex items-center gap-1 text-[10px]", clusterColors[opp.category])}>
                          {(() => {
                            const ClusterIcon = clusterIcons[opp.category];
                            return <ClusterIcon className="w-3 h-3" />;
                          })()}
                          {opp.category}
                        </Badge>
                        <Badge variant="secondary" className="text-[10px]">{opp.type}</Badge>
                        {isRecommended(opp.category) && (
                          <Badge className="text-[10px] bg-gradient-brand text-primary-foreground border-0">
                            <Sparkles className="w-3 h-3 mr-0.5" /> For You
                          </Badge>
                        )}
                      </div>
                      <button onClick={() => toggleSaveOpportunity(opp.id)} className="shrink-0 p-1 rounded-lg hover:bg-secondary/50 transition-colors" aria-label={saved ? "Unsave" : "Save"}>
                        <Heart className={cn("w-4 h-4 transition-colors", saved ? "fill-magenta text-magenta" : "text-muted-foreground")} />
                      </button>
                    </div>
                    <h3 className="font-semibold text-foreground text-sm mb-1.5">{opp.title}</h3>
                    <p className="text-xs text-muted-foreground mb-3 flex-1">{opp.description}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                      <MapPin className="w-3 h-3" /> {opp.location}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {opp.requirements.map(r => (
                        <span key={r} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">{r}</span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
