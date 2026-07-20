import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Search, Edit, MapPin, Building2, ExternalLink, Star, Filter, Award } from "lucide-react";
import { FunfinityIcon } from "@/components/brand/FunfinityLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface College {
  id: string;
  name: string;
  location: string;
  website: string;
  type: "public" | "private" | "community";
  rating: number;
  programs: string[];
  description: string;
  active: boolean;
  created_at: string;
}

const typeColors: Record<string, string> = {
  public: "bg-cyan/10 text-cyan border-cyan/20",
  private: "bg-purple/10 text-purple border-purple/20",
  community: "bg-emerald/10 text-emerald border-emerald/20",
};

export default function AdminCollegeUniversity() {
  const { toast } = useToast();
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "public" | "private" | "community">("all");
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    website: "",
    type: "public" as const,
    rating: 5,
    programs: "",
    description: "",
  });

  // Mock data for now - in production, this would come from the database
  useState(() => {
    setColleges([
      {
        id: "1",
        name: "Harvard University",
        location: "Cambridge, MA",
        website: "https://www.harvard.edu",
        type: "private",
        rating: 5,
        programs: ["Computer Science", "Business", "Law", "Medicine"],
        description: "Harvard University is a private Ivy League research university in Cambridge, Massachusetts.",
        active: true,
        created_at: new Date().toISOString(),
      },
      {
        id: "2",
        name: "MIT",
        location: "Cambridge, MA",
        website: "https://www.mit.edu",
        type: "private",
        rating: 5,
        programs: ["Engineering", "Computer Science", "Physics", "Mathematics"],
        description: "Massachusetts Institute of Technology is a private research university in Cambridge, Massachusetts.",
        active: true,
        created_at: new Date().toISOString(),
      },
      {
        id: "3",
        name: "Stanford University",
        location: "Stanford, CA",
        website: "https://www.stanford.edu",
        type: "private",
        rating: 5,
        programs: ["Computer Science", "Business", "Engineering", "Medicine"],
        description: "Stanford University is a private research university in Stanford, California.",
        active: true,
        created_at: new Date().toISOString(),
      },
    ]);
    setLoading(false);
  });

  const handleCreateCollege = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.location.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide a name and location for the college/university.",
        variant: "destructive"
      });
      return;
    }

    const newCollege: College = {
      id: Date.now().toString(),
      ...formData,
      programs: formData.programs.split(",").map(p => p.trim()).filter(p => p),
      active: true,
      created_at: new Date().toISOString(),
    };

    setColleges([newCollege, ...colleges]);
    
    toast({
      title: "College/University Added",
      description: `${formData.name} has been successfully added to the database.`,
    });
    
    setIsCreateModalOpen(false);
    setFormData({
      name: "",
      location: "",
      website: "",
      type: "public",
      rating: 5,
      programs: "",
      description: "",
    });
  };

  const handleDeleteCollege = (id: string) => {
    setColleges(colleges.filter(c => c.id !== id));
    toast({
      title: "College/University Deleted",
      description: "The institution has been removed from the database.",
    });
  };

  const filteredColleges = colleges.filter(college => {
    const matchesFilter = filter === "all" || college.type === filter;
    const matchesSearch = college.name.toLowerCase().includes(search.toLowerCase()) || 
                         college.location.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-slate-700/50 rounded animate-pulse" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-slate-700/30 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <FunfinityIcon size="md" className="text-primary" />
            College & University Search
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage colleges and universities in the search database
          </p>
        </div>
        <Button 
          variant="hero" 
          size="sm" 
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Institution
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card border-border/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{colleges.length}</p>
                <p className="text-xs text-muted-foreground">Total Institutions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-border/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan/10 flex items-center justify-center">
                <Award className="w-5 h-5 text-cyan" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{colleges.filter(c => c.type === "public").length}</p>
                <p className="text-xs text-muted-foreground">Public</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-border/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-purple" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{colleges.filter(c => c.type === "private").length}</p>
                <p className="text-xs text-muted-foreground">Private</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-border/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald/10 flex items-center justify-center">
                <Star className="w-5 h-5 text-emerald" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{colleges.filter(c => c.rating >= 4).length}</p>
                <p className="text-xs text-muted-foreground">Top Rated</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="glass-card border-border/30">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary/50 border border-border/30 flex-1">
              <Search className="w-5 h-5 text-muted-foreground shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search colleges/universities..."
                className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-muted-foreground" />
              <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
                <SelectTrigger className="w-[140px] bg-secondary/50 border-border/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="community">Community</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Colleges List */}
      <div className="space-y-4">
        {filteredColleges.length === 0 ? (
          <Card className="glass-card border-border/30">
            <CardContent className="p-12 text-center">
              <Building2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Institutions Found</h3>
              <p className="text-sm text-muted-foreground">
                {search || filter !== "all" 
                  ? "Try adjusting your search or filter criteria." 
                  : "Add your first college or university to start building the search database."}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredColleges.map((college, index) => (
            <motion.div
              key={college.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="glass-card border-border/30">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 rounded-xl bg-gradient-brand flex items-center justify-center text-white font-bold text-lg shrink-0">
                        {college.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-foreground">{college.name}</h3>
                          <Badge className={cn("text-[10px]", typeColors[college.type])}>
                            {college.type}
                          </Badge>
                          <div className="flex items-center gap-1 text-yellow-500">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-current" style={{ opacity: i < college.rating ? 1 : 0.3 }} />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {college.location}
                        </p>
                        <p className="text-sm text-muted-foreground mb-3">{college.description}</p>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {college.programs.slice(0, 3).map((program) => (
                            <Badge key={program} variant="outline" className="text-[10px]">
                              {program}
                            </Badge>
                          ))}
                          {college.programs.length > 3 && (
                            <Badge variant="outline" className="text-[10px]">
                              +{college.programs.length - 3} more
                            </Badge>
                          )}
                        </div>
                        {college.website && (
                          <a
                            href={college.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Visit Website
                          </a>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteCollege(college.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Create College Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setIsCreateModalOpen(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-lg glass-card border-border/30 rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-secondary/50 transition-colors"
              >
                <Trash2 className="w-5 h-5 text-muted-foreground" />
              </button>

              <div className="mb-6">
                <h2 className="text-xl font-bold text-foreground mb-2">Add College/University</h2>
                <p className="text-sm text-muted-foreground">Add a new institution to the search database</p>
              </div>

              <form onSubmit={handleCreateCollege} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Institution Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Harvard University"
                    className="bg-secondary/50 border-border/30"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="e.g., Cambridge, MA"
                    className="bg-secondary/50 border-border/30"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="https://www.example.edu"
                    className="bg-secondary/50 border-border/30"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select value={formData.type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger id="type" className="bg-secondary/50 border-border/30">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                        <SelectItem value="community">Community</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rating">Rating (1-5)</Label>
                    <Select value={formData.rating.toString()} onValueChange={(value) => setFormData(prev => ({ ...prev, rating: parseInt(value) }))}>
                      <SelectTrigger id="rating" className="bg-secondary/50 border-border/30">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5].map(r => (
                          <SelectItem key={r} value={r.toString()}>{r} Stars</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="programs">Programs (comma-separated)</Label>
                  <Input
                    id="programs"
                    value={formData.programs}
                    onChange={(e) => setFormData(prev => ({ ...prev, programs: e.target.value }))}
                    placeholder="e.g., Computer Science, Business, Engineering"
                    className="bg-secondary/50 border-border/30"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of the institution..."
                    rows={3}
                    className="bg-secondary/50 border-border/30 resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  variant="hero"
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Institution
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
