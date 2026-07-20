import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, MapPin, Star, Award, Users, Building, Filter, Sparkles, BookOpen, TrendingUp, CheckCircle2, ArrowRight, ExternalLink } from "lucide-react";
import { FunfinityIcon } from "@/components/brand/FunfinityLogo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { CollegeExplorerSkeleton } from "@/components/skeletons/CollegeExplorerSkeleton";

interface College {
  id: string;
  name: string;
  location: string;
  type: "Public" | "Private" | "Community";
  ranking: number;
  acceptanceRate: number;
  tuition: number;
  programs: string[];
  satRange: [number, number];
  actRange: [number, number];
  gpaRange: [number, number];
  features: string[];
  imageUrl?: string;
  website?: string;
}

interface AcademicProfile {
  school_name?: string;
  gpa?: number;
  sat_score?: number;
  act_score?: number;
  intended_major?: string;
  grade_level?: string;
}

const mockColleges: College[] = [
  {
    id: "1",
    name: "Massachusetts Institute of Technology",
    location: "Cambridge, MA, USA",
    type: "Private",
    ranking: 1,
    acceptanceRate: 4,
    tuition: 57986,
    programs: ["Computer Science", "Engineering", "Physics", "Mathematics", "Chemistry"],
    satRange: [1520, 1580],
    actRange: [35, 36],
    gpaRange: [3.9, 4.0],
    features: ["Research Opportunities", "Innovation Labs", "Global Partnerships", "Tech Transfer"],
    imageUrl: "",
    website: "https://www.mit.edu"
  },
  {
    id: "2",
    name: "Stanford University",
    location: "Stanford, CA, USA",
    type: "Private",
    ranking: 2,
    acceptanceRate: 4,
    tuition: 56169,
    programs: ["Computer Science", "Engineering", "Business", "Medicine", "Design"],
    satRange: [1500, 1570],
    actRange: [34, 36],
    gpaRange: [3.9, 4.0],
    features: ["Silicon Valley Access", "Entrepreneurship", "Interdisciplinary Research", "Startup Incubator"],
    imageUrl: "",
    website: "https://www.stanford.edu"
  },
  {
    id: "3",
    name: "Harvard University",
    location: "Cambridge, MA, USA",
    type: "Private",
    ranking: 3,
    acceptanceRate: 3,
    tuition: 57261,
    programs: ["Law", "Medicine", "Business", "Arts & Sciences", "Government"],
    satRange: [1480, 1570],
    actRange: [33, 36],
    gpaRange: [3.9, 4.0],
    features: ["Ivy League Network", "Global Leadership", "Extensive Alumni", "Research Centers"],
    imageUrl: "",
    website: "https://www.harvard.edu"
  },
  {
    id: "4",
    name: "California Institute of Technology",
    location: "Pasadena, CA, USA",
    type: "Private",
    ranking: 4,
    acceptanceRate: 6,
    tuition: 58680,
    programs: ["Physics", "Chemistry", "Engineering", "Biology", "Astronomy"],
    satRange: [1530, 1560],
    actRange: [35, 36],
    gpaRange: [3.9, 4.0],
    features: ["NASA Partnerships", "Research Focus", "Small Class Sizes", "Lab Access"],
    imageUrl: "",
    website: "https://www.caltech.edu"
  },
  {
    id: "5",
    name: "University of California, Berkeley",
    location: "Berkeley, CA, USA",
    type: "Public",
    ranking: 5,
    acceptanceRate: 11,
    tuition: 44467,
    programs: ["Computer Science", "Engineering", "Business", "Environmental Science", "Social Sciences"],
    satRange: [1330, 1530],
    actRange: [29, 35],
    gpaRange: [3.8, 4.0],
    features: ["Public Ivy", "Research Excellence", "Diverse Programs", "Activism"],
    imageUrl: "",
    website: "https://www.berkeley.edu"
  },
  {
    id: "6",
    name: "University of Michigan",
    location: "Ann Arbor, MI, USA",
    type: "Public",
    ranking: 6,
    acceptanceRate: 18,
    tuition: 51572,
    programs: ["Engineering", "Business", "Medicine", "Law", "Nursing"],
    satRange: [1340, 1510],
    actRange: [31, 34],
    gpaRange: [3.7, 4.0],
    features: ["Big Ten Athletics", "Research Powerhouse", "Strong Alumni", "Hospital System"],
    imageUrl: "",
    website: "https://www.umich.edu"
  },
  {
    id: "7",
    name: "University of Oxford",
    location: "Oxford, UK",
    type: "Public",
    ranking: 7,
    acceptanceRate: 17,
    tuition: 45000,
    programs: ["Humanities", "Sciences", "Social Sciences", "Medicine", "Law"],
    satRange: [1400, 1560],
    actRange: [32, 36],
    gpaRange: [3.8, 4.0],
    features: ["Tutorial System", "Historic Tradition", "Global Network", "Research Excellence"],
    imageUrl: "",
    website: "https://www.ox.ac.uk"
  },
  {
    id: "8",
    name: "University of Cambridge",
    location: "Cambridge, UK",
    type: "Public",
    ranking: 8,
    acceptanceRate: 21,
    tuition: 47000,
    programs: ["Engineering", "Computer Science", "Mathematics", "Natural Sciences", "Humanities"],
    satRange: [1420, 1580],
    actRange: [33, 36],
    gpaRange: [3.8, 4.0],
    features: ["College System", "Research Focus", "Historic Excellence", "Innovation Hub"],
    imageUrl: "",
    website: "https://www.cam.ac.uk"
  },
  {
    id: "9",
    name: "ETH Zurich",
    location: "Zurich, Switzerland",
    type: "Public",
    ranking: 9,
    acceptanceRate: 8,
    tuition: 1500,
    programs: ["Engineering", "Computer Science", "Physics", "Mathematics", "Architecture"],
    satRange: [1450, 1570],
    actRange: [33, 36],
    gpaRange: [3.8, 4.0],
    features: ["European Excellence", "Research Focus", "Industry Partners", "Innovation"],
    imageUrl: "",
    website: "https://www.ethz.ch"
  },
  {
    id: "10",
    name: "University of Toronto",
    location: "Toronto, Canada",
    type: "Public",
    ranking: 10,
    acceptanceRate: 43,
    tuition: 38000,
    programs: ["Computer Science", "Engineering", "Medicine", "Business", "Arts"],
    satRange: [1300, 1500],
    actRange: [28, 34],
    gpaRange: [3.6, 4.0],
    features: ["Diverse Campus", "Research Excellence", "Global City", "Innovation Hub"],
    imageUrl: "",
    website: "https://www.utoronto.ca"
  },
  {
    id: "11",
    name: "National University of Singapore",
    location: "Singapore",
    type: "Public",
    ranking: 11,
    acceptanceRate: 5,
    tuition: 35000,
    programs: ["Engineering", "Business", "Computer Science", "Medicine", "Law"],
    satRange: [1400, 1560],
    actRange: [32, 36],
    gpaRange: [3.8, 4.0],
    features: ["Asian Hub", "Research Focus", "Global Partners", "Innovation"],
    imageUrl: "",
    website: "https://www.nus.edu.sg"
  },
  {
    id: "12",
    name: "Tsinghua University",
    location: "Beijing, China",
    type: "Public",
    ranking: 12,
    acceptanceRate: 2,
    tuition: 10000,
    programs: ["Engineering", "Computer Science", "Physics", "Mathematics", "Architecture"],
    satRange: [1450, 1580],
    actRange: [34, 36],
    gpaRange: [3.9, 4.0],
    features: ["Asian Excellence", "Research Power", "Government Partners", "Innovation"],
    imageUrl: "",
    website: "https://www.tsinghua.edu.cn"
  }
];

export default function CollegeUniversity() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [countryFilter, setCountryFilter] = useState<string>("all");
  const [rankingFilter, setRankingFilter] = useState<string>("all");
  const [tuitionFilter, setTuitionFilter] = useState<string>("all");
  const [acceptanceRateFilter, setAcceptanceRateFilter] = useState<string>("all");
  const [programFilter, setProgramFilter] = useState<string>("all");
  const [gpaFilter, setGpaFilter] = useState<string>("all");
  const [satFilter, setSatFilter] = useState<string>("all");
  const [actFilter, setActFilter] = useState<string>("all");
  const [selectedCollege, setSelectedCollege] = useState<College | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [sortBy, setSortBy] = useState<string>("ranking");

  // Fetch academic profile for algorithmic matching
  const { data: academicProfile, isLoading: profileLoading } = useQuery<AcademicProfile>({
    queryKey: ["academic-profile", user?.id],
    queryFn: async () => {
      const data = await apiClient.get<any | null>(`/api/users/${user!.id}/academic-profile`);
      return data || {};
    },
    enabled: !!user
  });

  // Show skeleton while loading profile
  if (profileLoading && user) {
    return <CollegeExplorerSkeleton />;
  }

  const colleges = useMemo(() => {
    let list = mockColleges;
    
    if (search) {
      list = list.filter(c => 
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.location.toLowerCase().includes(search.toLowerCase()) ||
        c.programs.some(p => p.toLowerCase().includes(search.toLowerCase()))
      );
    }
    
    if (typeFilter !== "all") {
      list = list.filter(c => c.type === typeFilter);
    }
    
    if (locationFilter !== "all") {
      list = list.filter(c => c.location.includes(locationFilter));
    }

    if (countryFilter !== "all") {
      list = list.filter(c => c.location.includes(countryFilter));
    }

    if (rankingFilter !== "all") {
      if (rankingFilter === "top10") {
        list = list.filter(c => c.ranking <= 10);
      } else if (rankingFilter === "top25") {
        list = list.filter(c => c.ranking <= 25);
      } else if (rankingFilter === "top50") {
        list = list.filter(c => c.ranking <= 50);
      } else if (rankingFilter === "top100") {
        list = list.filter(c => c.ranking <= 100);
      }
    }

    if (tuitionFilter !== "all") {
      if (tuitionFilter === "under30k") {
        list = list.filter(c => c.tuition < 30000);
      } else if (tuitionFilter === "30k-50k") {
        list = list.filter(c => c.tuition >= 30000 && c.tuition <= 50000);
      } else if (tuitionFilter === "50k-70k") {
        list = list.filter(c => c.tuition >= 50000 && c.tuition <= 70000);
      } else if (tuitionFilter === "over70k") {
        list = list.filter(c => c.tuition > 70000);
      }
    }

    if (acceptanceRateFilter !== "all") {
      if (acceptanceRateFilter === "under5") {
        list = list.filter(c => c.acceptanceRate < 5);
      } else if (acceptanceRateFilter === "5-10") {
        list = list.filter(c => c.acceptanceRate >= 5 && c.acceptanceRate <= 10);
      } else if (acceptanceRateFilter === "10-20") {
        list = list.filter(c => c.acceptanceRate >= 10 && c.acceptanceRate <= 20);
      } else if (acceptanceRateFilter === "20-50") {
        list = list.filter(c => c.acceptanceRate >= 20 && c.acceptanceRate <= 50);
      } else if (acceptanceRateFilter === "over50") {
        list = list.filter(c => c.acceptanceRate > 50);
      }
    }

    if (programFilter !== "all") {
      list = list.filter(c => c.programs.some(p => p.toLowerCase().includes(programFilter.toLowerCase())));
    }

    if (gpaFilter !== "all") {
      if (gpaFilter === "3.0+") {
        list = list.filter(c => c.gpaRange[0] >= 3.0);
      } else if (gpaFilter === "3.5+") {
        list = list.filter(c => c.gpaRange[0] >= 3.5);
      } else if (gpaFilter === "3.8+") {
        list = list.filter(c => c.gpaRange[0] >= 3.8);
      } else if (gpaFilter === "4.0") {
        list = list.filter(c => c.gpaRange[1] >= 4.0);
      }
    }

    if (satFilter !== "all") {
      if (satFilter === "1200+") {
        list = list.filter(c => c.satRange[0] >= 1200);
      } else if (satFilter === "1300+") {
        list = list.filter(c => c.satRange[0] >= 1300);
      } else if (satFilter === "1400+") {
        list = list.filter(c => c.satRange[0] >= 1400);
      } else if (satFilter === "1500+") {
        list = list.filter(c => c.satRange[0] >= 1500);
      }
    }

    if (actFilter !== "all") {
      if (actFilter === "25+") {
        list = list.filter(c => c.actRange[0] >= 25);
      } else if (actFilter === "30+") {
        list = list.filter(c => c.actRange[0] >= 30);
      } else if (actFilter === "33+") {
        list = list.filter(c => c.actRange[0] >= 33);
      } else if (actFilter === "35+") {
        list = list.filter(c => c.actRange[0] >= 35);
      }
    }

    // Sorting
    if (sortBy === "ranking") {
      list = list.sort((a, b) => a.ranking - b.ranking);
    } else if (sortBy === "acceptance") {
      list = list.sort((a, b) => a.acceptanceRate - b.acceptanceRate);
    } else if (sortBy === "tuition") {
      list = list.sort((a, b) => a.tuition - b.tuition);
    } else if (sortBy === "name") {
      list = list.sort((a, b) => a.name.localeCompare(b.name));
    }

    // Algorithmic matching based on academic profile
    if (academicProfile) {
      list = list.map(college => {
        let matchScore = 0;
        let matchDetails: string[] = [];
        
        // GPA matching
        if (academicProfile.gpa && college.gpaRange[0] <= academicProfile.gpa && college.gpaRange[1] >= academicProfile.gpa) {
          matchScore += 30;
          matchDetails.push("GPA within range");
        } else if (academicProfile.gpa && academicProfile.gpa < college.gpaRange[0]) {
          const gap = college.gpaRange[0] - academicProfile.gpa;
          if (gap <= 0.2) {
            matchScore += 15;
            matchDetails.push("GPA slightly below range");
          }
        }
        
        // SAT matching
        if (academicProfile.sat_score && college.satRange[0] <= academicProfile.sat_score && college.satRange[1] >= academicProfile.sat_score) {
          matchScore += 25;
          matchDetails.push("SAT within range");
        } else if (academicProfile.sat_score && academicProfile.sat_score < college.satRange[0]) {
          const gap = college.satRange[0] - academicProfile.sat_score;
          if (gap <= 50) {
            matchScore += 12;
            matchDetails.push("SAT slightly below range");
          }
        }
        
        // ACT matching
        if (academicProfile.act_score && college.actRange[0] <= academicProfile.act_score && college.actRange[1] >= academicProfile.act_score) {
          matchScore += 25;
          matchDetails.push("ACT within range");
        } else if (academicProfile.act_score && academicProfile.act_score < college.actRange[0]) {
          const gap = college.actRange[0] - academicProfile.act_score;
          if (gap <= 2) {
            matchScore += 12;
            matchDetails.push("ACT slightly below range");
          }
        }
        
        // Program matching
        if (academicProfile.intended_major && college.programs.some(p => p.toLowerCase().includes(academicProfile.intended_major?.toLowerCase() || ""))) {
          matchScore += 20;
          matchDetails.push("Program match");
        }
        
        return { ...college, matchScore, matchDetails };
      }).sort((a, b) => (b as any).matchScore - (a as any).matchScore);
    }

    return list;
  }, [search, typeFilter, locationFilter, countryFilter, rankingFilter, tuitionFilter, acceptanceRateFilter, programFilter, gpaFilter, satFilter, actFilter, sortBy, academicProfile]);

  const getMatchColor = (score: number) => {
    if (score >= 70) return "bg-emerald/10 text-emerald border-emerald/30";
    if (score >= 40) return "bg-yellow/10 text-yellow border-yellow/30";
    return "bg-slate/10 text-slate border-slate/30";
  };

  const getAdmissionsAdvice = (college: College, profile: AcademicProfile) => {
    const advice: string[] = [];
    
    if (profile.gpa && profile.gpa < college.gpaRange[0]) {
      advice.push(`Focus on raising your GPA by ${(college.gpaRange[0] - profile.gpa).toFixed(2)} points to meet the minimum requirement.`);
    }
    
    if (profile.sat_score && profile.sat_score < college.satRange[0]) {
      advice.push(`Consider retaking the SAT to improve your score by ${college.satRange[0] - profile.sat_score} points.`);
    }
    
    if (profile.act_score && profile.act_score < college.actRange[0]) {
      advice.push(`Consider retaking the ACT to improve your score by ${college.actRange[0] - profile.act_score} points.`);
    }
    
    if (college.acceptanceRate < 10) {
      advice.push(`With a ${college.acceptanceRate}% acceptance rate, this is a highly competitive school. Strengthen your extracurricular activities and essays.`);
    }
    
    if (advice.length === 0) {
      advice.push("Your academic profile aligns well with this institution. Focus on maintaining strong grades and crafting compelling essays.");
    }
    
    return advice;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <FunfinityIcon size="md" className="text-primary" />
            College & University
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {academicProfile ? "Personalized recommendations based on your academic profile" : "Complete your academic profile for personalized recommendations"}
          </p>
        </div>
        {academicProfile && (
          <Badge className="bg-gradient-brand text-primary-foreground border-0">
            <Sparkles className="w-3 h-3 mr-1" /> AI-Powered Matching
          </Badge>
        )}
      </div>

      {/* Search and Filters */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary/50 border border-border/30">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input 
              type="text" 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              placeholder="Search colleges, programs, or locations..." 
              className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full" 
            />
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            {showAdvancedFilters ? "Hide Filters" : "Advanced Filters"}
          </Button>
        </div>

        {/* Basic Filters */}
        <div className="flex flex-wrap gap-3">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Public">Public</SelectItem>
              <SelectItem value="Private">Private</SelectItem>
              <SelectItem value="Community">Community</SelectItem>
            </SelectContent>
          </Select>
          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Location" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              <SelectItem value="CA">California</SelectItem>
              <SelectItem value="MA">Massachusetts</SelectItem>
              <SelectItem value="MI">Michigan</SelectItem>
              <SelectItem value="NY">New York</SelectItem>
              <SelectItem value="TX">Texas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-3 pt-3 border-t border-border/30"
          >
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Sort By" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ranking">Ranking</SelectItem>
                <SelectItem value="acceptance">Acceptance Rate</SelectItem>
                <SelectItem value="tuition">Tuition</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>
            <Select value={countryFilter} onValueChange={setCountryFilter}>
              <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Country" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                <SelectItem value="USA">USA</SelectItem>
                <SelectItem value="UK">UK</SelectItem>
                <SelectItem value="Canada">Canada</SelectItem>
                <SelectItem value="Switzerland">Switzerland</SelectItem>
                <SelectItem value="Singapore">Singapore</SelectItem>
                <SelectItem value="China">China</SelectItem>
              </SelectContent>
            </Select>
            <Select value={rankingFilter} onValueChange={setRankingFilter}>
              <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Ranking" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Rankings</SelectItem>
                <SelectItem value="top10">Top 10</SelectItem>
                <SelectItem value="top25">Top 25</SelectItem>
                <SelectItem value="top50">Top 50</SelectItem>
                <SelectItem value="top100">Top 100</SelectItem>
              </SelectContent>
            </Select>
            <Select value={tuitionFilter} onValueChange={setTuitionFilter}>
              <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Tuition" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tuitions</SelectItem>
                <SelectItem value="under30k">Under $30k</SelectItem>
                <SelectItem value="30k-50k">$30k - $50k</SelectItem>
                <SelectItem value="50k-70k">$50k - $70k</SelectItem>
                <SelectItem value="over70k">Over $70k</SelectItem>
              </SelectContent>
            </Select>
            <Select value={acceptanceRateFilter} onValueChange={setAcceptanceRateFilter}>
              <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Acceptance" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Rates</SelectItem>
                <SelectItem value="under5">Under 5%</SelectItem>
                <SelectItem value="5-10">5% - 10%</SelectItem>
                <SelectItem value="10-20">10% - 20%</SelectItem>
                <SelectItem value="20-50">20% - 50%</SelectItem>
                <SelectItem value="over50">Over 50%</SelectItem>
              </SelectContent>
            </Select>
            <Select value={programFilter} onValueChange={setProgramFilter}>
              <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Program" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Programs</SelectItem>
                <SelectItem value="Computer Science">Computer Science</SelectItem>
                <SelectItem value="Engineering">Engineering</SelectItem>
                <SelectItem value="Business">Business</SelectItem>
                <SelectItem value="Medicine">Medicine</SelectItem>
                <SelectItem value="Law">Law</SelectItem>
                <SelectItem value="Physics">Physics</SelectItem>
                <SelectItem value="Mathematics">Mathematics</SelectItem>
              </SelectContent>
            </Select>
            <Select value={gpaFilter} onValueChange={setGpaFilter}>
              <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Min GPA" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All GPAs</SelectItem>
                <SelectItem value="3.0+">3.0+</SelectItem>
                <SelectItem value="3.5+">3.5+</SelectItem>
                <SelectItem value="3.8+">3.8+</SelectItem>
                <SelectItem value="4.0">4.0</SelectItem>
              </SelectContent>
            </Select>
            <Select value={satFilter} onValueChange={setSatFilter}>
              <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Min SAT" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All SATs</SelectItem>
                <SelectItem value="1200+">1200+</SelectItem>
                <SelectItem value="1300+">1300+</SelectItem>
                <SelectItem value="1400+">1400+</SelectItem>
                <SelectItem value="1500+">1500+</SelectItem>
              </SelectContent>
            </Select>
            <Select value={actFilter} onValueChange={setActFilter}>
              <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Min ACT" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All ACTs</SelectItem>
                <SelectItem value="25+">25+</SelectItem>
                <SelectItem value="30+">30+</SelectItem>
                <SelectItem value="33+">33+</SelectItem>
                <SelectItem value="35+">35+</SelectItem>
              </SelectContent>
            </Select>
          </motion.div>
        )}
      </div>

      {/* College Cards */}
      {colleges.length === 0 ? (
        <Card className="glass-card border-border/30">
          <CardContent className="p-12 text-center">
            <Building className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No colleges found</h3>
            <p className="text-sm text-muted-foreground">Try adjusting your search or filters.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {colleges.map((college, i) => {
            const matchScore = (college as any).matchScore || 0;
            return (
              <motion.div 
                key={college.id} 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: i * 0.05 }}
              >
                <Card className="glass-card border-border/30 h-full flex flex-col transition-all hover:shadow-medium hover:border-primary/30">
                  <CardContent className="p-5 flex flex-col flex-1">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex flex-wrap gap-1.5">
                        <Badge variant="outline" className="text-[10px]">
                          <Star className="w-3 h-3 mr-1 text-yellow-500" />
                          #{college.ranking}
                        </Badge>
                        <Badge variant="secondary" className="text-[10px]">{college.type}</Badge>
                        {matchScore > 0 && (
                          <Badge className={cn("text-[10px]", getMatchColor(matchScore))}>
                            <TrendingUp className="w-3 h-3 mr-1" />
                            {matchScore}% Match
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <h3 className="font-semibold text-foreground text-sm mb-1">{college.name}</h3>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                      <MapPin className="w-3 h-3" /> {college.location}
                    </div>
                    
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Acceptance Rate</span>
                        <span className="font-medium text-foreground">{college.acceptanceRate}%</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Tuition</span>
                        <span className="font-medium text-foreground">${college.tuition.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">SAT Range</span>
                        <span className="font-medium text-foreground">{college.satRange[0]}-{college.satRange[1]}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">GPA Range</span>
                        <span className="font-medium text-foreground">{college.gpaRange[0]}-{college.gpaRange[1]}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mb-4">
                      {college.programs.slice(0, 3).map(program => (
                        <span key={program} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                          {program}
                        </span>
                      ))}
                      {college.programs.length > 3 && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                          +{college.programs.length - 3}
                        </span>
                      )}
                    </div>
                    
                    <div className="mt-auto">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => setSelectedCollege(college)}
                      >
                        View Details <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* College Detail Modal */}
      {selectedCollege && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedCollege(null)}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-2xl glass-card border-border/30 rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedCollege(null)}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-secondary/50 transition-colors"
            >
              <Award className="w-5 h-5 text-muted-foreground" />
            </button>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Building className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">{selectedCollege.name}</h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" /> {selectedCollege.location}
                  <Badge variant="outline" className="text-[10px]">
                    <Star className="w-3 h-3 mr-1 text-yellow-500" />
                    #{selectedCollege.ranking}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-secondary/50">
                <div className="text-xs text-muted-foreground mb-1">Acceptance Rate</div>
                <div className="text-2xl font-bold text-foreground">{selectedCollege.acceptanceRate}%</div>
              </div>
              <div className="p-4 rounded-xl bg-secondary/50">
                <div className="text-xs text-muted-foreground mb-1">Annual Tuition</div>
                <div className="text-2xl font-bold text-foreground">${selectedCollege.tuition.toLocaleString()}</div>
              </div>
            </div>
            
            <div className="space-y-4 mb-6">
              <div>
                <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  Programs
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedCollege.programs.map(program => (
                    <Badge key={program} variant="secondary" className="text-xs">
                      {program}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Award className="w-4 h-4 text-primary" />
                  Requirements
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-secondary/30 text-center">
                    <div className="text-xs text-muted-foreground">SAT</div>
                    <div className="font-medium text-foreground">{selectedCollege.satRange[0]}-{selectedCollege.satRange[1]}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/30 text-center">
                    <div className="text-xs text-muted-foreground">ACT</div>
                    <div className="font-medium text-foreground">{selectedCollege.actRange[0]}-{selectedCollege.actRange[1]}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/30 text-center">
                    <div className="text-xs text-muted-foreground">GPA</div>
                    <div className="font-medium text-foreground">{selectedCollege.gpaRange[0]}-{selectedCollege.gpaRange[1]}</div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Key Features
                </h3>
                <div className="space-y-2">
                  {selectedCollege.features.map(feature => (
                    <div key={feature} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span className="text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Algorithmic Admissions Advice */}
              {academicProfile && (
                <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    Admissions Strategy
                  </h3>
                  <div className="space-y-2">
                    {getAdmissionsAdvice(selectedCollege, academicProfile).map((advice, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                        <span className="text-foreground">{advice}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <Button 
              variant="hero" 
              className="w-full"
              asChild
            >
              <a 
                href={selectedCollege.website || "#"} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                Visit College Website
                <ExternalLink className="w-4 h-4 ml-2" />
              </a>
            </Button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
