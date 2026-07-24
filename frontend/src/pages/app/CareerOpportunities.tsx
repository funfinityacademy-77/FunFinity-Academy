import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Heart, MapPin, Tag, Filter, Sparkles, Microscope, Palette, BarChart3, HeartPulse, Hammer, Building2, X, Calendar, Clock, ExternalLink, Users, DollarSign, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCareer, CareerCluster } from "@/hooks/use-career";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

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
  const { profile, toggleSaveOpportunity } = useCareer();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedOpportunity, setSelectedOpportunity] = useState<any>(null);

  // Fetch opportunities from API
  const { data: opportunities = [], isLoading } = useQuery({
    queryKey: ["opportunities"],
    queryFn: async () => {
      try {
        const data = await apiClient.get<any[]>('/api/opportunities');
        return data;
      } catch (error) {
        console.error('Failed to fetch opportunities, using fallback data');
        // Fallback to hook data if API fails
        const { getRecommendedOpportunities } = useCareer();
        return getRecommendedOpportunities();
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const filteredOpportunities = useMemo(() => {
    let list = opportunities;
    if (search) list = list.filter(o => o.title.toLowerCase().includes(search.toLowerCase()) || o.description.toLowerCase().includes(search.toLowerCase()));
    if (categoryFilter !== "all") list = list.filter(o => o.category === categoryFilter);
    if (typeFilter !== "all") list = list.filter(o => o.type === typeFilter);
    return list;
  }, [search, categoryFilter, typeFilter, opportunities]);

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
                <Card className={cn("glass-card border-border/30 h-full flex flex-col transition-all hover:shadow-medium cursor-pointer", isRecommended(opp.category) && "ring-2 ring-primary/20")}
                  onClick={() => setSelectedOpportunity(opp)}
                >
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

      {/* Opportunity Detail Modal */}
      <AnimatePresence>
        {selectedOpportunity && (
          <Dialog open={!!selectedOpportunity} onOpenChange={() => setSelectedOpportunity(null)}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-[2rem]">
              <DialogHeader>
                <DialogTitle className="text-2xl font-display font-bold">{selectedOpportunity.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 mt-4">
                {/* Header Info */}
                <div className="flex flex-wrap gap-3">
                  <Badge className={cn("flex items-center gap-1 text-sm", clusterColors[selectedOpportunity.category])}>
                    {(() => {
                      const ClusterIcon = clusterIcons[selectedOpportunity.category];
                      return <ClusterIcon className="w-4 h-4" />;
                    })()}
                    {selectedOpportunity.category}
                  </Badge>
                  <Badge variant="secondary" className="text-sm">{selectedOpportunity.type}</Badge>
                  {isRecommended(selectedOpportunity.category) && (
                    <Badge className="bg-gradient-brand text-primary-foreground border-0">
                      <Sparkles className="w-4 h-4 mr-1" /> Recommended For You
                    </Badge>
                  )}
                </div>

                {/* Key Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-secondary/30">
                    <MapPin className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase">Location</p>
                      <p className="text-sm font-medium">{selectedOpportunity.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-secondary/30">
                    <Clock className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase">Duration</p>
                      <p className="text-sm font-medium">{selectedOpportunity.duration || "Flexible"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-secondary/30">
                    <DollarSign className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase">Compensation</p>
                      <p className="text-sm font-medium">{selectedOpportunity.compensation || "Unpaid"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-secondary/30">
                    <Users className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase">Spots</p>
                      <p className="text-sm font-medium">{selectedOpportunity.spots || "Open"}</p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                  <h3 className="font-semibold text-foreground mb-2">About This Opportunity</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{selectedOpportunity.description}</p>
                </div>

                {/* Requirements */}
                <div>
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    Requirements
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedOpportunity.requirements.map((req: string, i: number) => (
                      <Badge key={i} variant="outline" className="bg-secondary/50 border-border/30">{req}</Badge>
                    ))}
                  </div>
                </div>

                {/* Skills Gained */}
                {selectedOpportunity.skills && (
                  <div>
                    <h3 className="font-semibold text-foreground mb-3">Skills You'll Gain</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedOpportunity.skills.map((skill: string, i: number) => (
                        <Badge key={i} className="bg-primary/10 text-primary border-primary/20">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Application Deadline */}
                {selectedOpportunity.deadline && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
                    <Calendar className="w-4 h-4 text-orange-500" />
                    <div>
                      <p className="text-[10px] text-orange-500 uppercase font-bold">Application Deadline</p>
                      <p className="text-sm font-medium text-foreground">{new Date(selectedOpportunity.deadline).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-border/30">
                  <Button 
                    variant="hero" 
                    className="flex-1"
                    onClick={() => {
                      toast.success("Application started! Check your email for next steps.");
                      setSelectedOpportunity(null);
                    }}
                  >
                    Apply Now
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => toggleSaveOpportunity(selectedOpportunity.id)}
                    className={profile.savedOpportunities.includes(selectedOpportunity.id) ? "border-magenta text-magenta" : ""}
                  >
                    <Heart className={cn("w-4 h-4 mr-2", profile.savedOpportunities.includes(selectedOpportunity.id) && "fill-magenta")} />
                    {profile.savedOpportunities.includes(selectedOpportunity.id) ? "Saved" : "Save"}
                  </Button>
                  {selectedOpportunity.website && (
                    <Button variant="ghost" asChild>
                      <a href={selectedOpportunity.website} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
}
