import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield, AlertTriangle, MessageSquare, FileText, CheckCircle, XCircle, 
  Clock, User, Ban, Eye, Trash2, Filter, Search, RefreshCw, Zap,
  ChevronRight, MoreVertical, Download, Calendar, Tag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ViolationSeverity, PenaltyType } from "@/lib/moderation";

interface ModerationItem {
  id: string;
  type: 'chat' | 'forum' | 'ai_chat';
  user_id: string;
  user_email?: string;
  user_display_name?: string;
  content: string;
  violation_type: string;
  severity: ViolationSeverity;
  status: 'pending' | 'reviewed' | 'dismissed' | 'actioned';
  created_at: string;
  metadata?: any;
}

interface ModerationStats {
  pending: number;
  reviewed: number;
  dismissed: number;
  actioned: number;
}

const severityConfig = {
  low: { color: "bg-primary/10 text-primary border-primary/20", label: "Low" },
  medium: { color: "bg-accent/10 text-accent border-accent/20", label: "Medium" },
  high: { color: "bg-destructive/10 text-destructive border-destructive/20", label: "High" },
  critical: { color: "bg-destructive/20 text-destructive border-destructive/40", label: "Critical" },
};

const typeConfig = {
  chat: { icon: MessageSquare, label: "Chat", color: "text-cyan" },
  forum: { icon: FileText, label: "Forum", color: "text-primary" },
  ai_chat: { icon: Zap, label: "AI Chat", color: "text-accent" },
};

export default function AdminModerationQueue() {
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<ModerationItem | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [penaltyReason, setPenaltyReason] = useState("");
  const [penaltyDuration, setPenaltyDuration] = useState(24);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: moderationItems, isLoading } = useQuery({
    queryKey: ["moderation-queue"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('moderation_queue')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as ModerationItem[];
    },
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  const { data: stats } = useQuery({
    queryKey: ["moderation-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('moderation_queue')
        .select('status')
        .limit(1000);

      if (error) throw error;
      
      const stats: ModerationStats = {
        pending: 0,
        reviewed: 0,
        dismissed: 0,
        actioned: 0,
      };

      data?.forEach((item: any) => {
        stats[item.status as keyof ModerationStats]++;
      });

      return stats;
    },
    refetchInterval: 10000,
  });

  const dismissMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase
        .from('moderation_queue')
        .update({ status: 'dismissed' })
        .eq('id', itemId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Item dismissed", description: "The flagged content has been marked as false positive." });
      queryClient.invalidateQueries({ queryKey: ["moderation-queue"] });
      queryClient.invalidateQueries({ queryKey: ["moderation-stats"] });
      setShowDetails(false);
    },
    onError: (error: any) => {
      toast({ title: "Failed to dismiss", description: error.message, variant: "destructive" });
    }
  });

  const applyPenaltyMutation = useMutation({
    mutationFn: async ({ itemId, penaltyType, reason, duration }: { 
      itemId: string; 
      penaltyType: PenaltyType; 
      reason: string; 
      duration: number;
    }) => {
      // Update moderation item status
      const { error: updateError } = await supabase
        .from('moderation_queue')
        .update({ status: 'actioned' })
        .eq('id', itemId);

      if (updateError) throw updateError;

      // Apply penalty to user
      const item = moderationItems?.find(i => i.id === itemId);
      if (!item) throw new Error("Item not found");

      if (penaltyType === 'ban') {
        const { error: banError } = await supabase
          .from('profiles')
          .update({ banned: true })
          .eq('id', item.user_id);

        if (banError) throw banError;
      } else if (penaltyType === 'restriction' || penaltyType === 'timeout') {
        const { error: restrictError } = await supabase
          .from('profiles')
          .update({ restricted: true })
          .eq('id', item.user_id);

        if (restrictError) throw restrictError;
      }

      // Log the penalty action
      const { error: logError } = await supabase
        .from('activity_logs')
        .insert({
          user_id: item.user_id,
          user_email: item.user_email,
          action: `Penalty applied: ${penaltyType}`,
          category: 'Moderation',
          severity: 'warning',
          details: `Reason: ${reason}, Duration: ${duration}h`,
        });

      if (logError) throw logError;
    },
    onSuccess: () => {
      toast({ title: "Penalty applied", description: "The user has been penalized according to the violation." });
      queryClient.invalidateQueries({ queryKey: ["moderation-queue"] });
      queryClient.invalidateQueries({ queryKey: ["moderation-stats"] });
      setShowDetails(false);
      setPenaltyReason("");
      setPenaltyDuration(24);
    },
    onError: (error: any) => {
      toast({ title: "Failed to apply penalty", description: error.message, variant: "destructive" });
    }
  });

  const filteredItems = moderationItems?.filter(item => {
    if (selectedType !== "all" && item.type !== selectedType) return false;
    if (selectedSeverity !== "all" && item.severity !== selectedSeverity) return false;
    if (selectedStatus !== "all" && item.status !== selectedStatus) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        item.content.toLowerCase().includes(query) ||
        item.user_email?.toLowerCase().includes(query) ||
        item.user_display_name?.toLowerCase().includes(query)
      );
    }
    return true;
  }) || [];

  const handleApplyPenalty = (penaltyType: PenaltyType) => {
    if (!selectedItem || !penaltyReason.trim()) {
      toast({ title: "Missing information", description: "Please provide a reason for the penalty.", variant: "destructive" });
      return;
    }
    applyPenaltyMutation.mutate({
      itemId: selectedItem.id,
      penaltyType,
      reason: penaltyReason,
      duration: penaltyDuration,
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Moderation Queue</h1>
            <p className="text-muted-foreground text-sm mt-1">Review and manage flagged content and violations</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => queryClient.invalidateQueries({ queryKey: ["moderation-queue"] })}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="border-border/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats?.pending || 0}</p>
                  <p className="text-xs text-muted-foreground">Pending Review</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Eye className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats?.reviewed || 0}</p>
                  <p className="text-xs text-muted-foreground">Reviewed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald/10 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-emerald" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats?.dismissed || 0}</p>
                  <p className="text-xs text-muted-foreground">Dismissed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                  <Ban className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats?.actioned || 0}</p>
                  <p className="text-xs text-muted-foreground">Actioned</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-border/30 mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search content, user..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-9"
                />
              </div>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-40 h-9">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="chat">Chat</SelectItem>
                  <SelectItem value="forum">Forum</SelectItem>
                  <SelectItem value="ai_chat">AI Chat</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
                <SelectTrigger className="w-40 h-9">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-40 h-9">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                  <SelectItem value="dismissed">Dismissed</SelectItem>
                  <SelectItem value="actioned">Actioned</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Moderation Items */}
        <Card className="border-border/30">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center">
                <RefreshCw className="w-8 h-8 text-muted-foreground animate-spin mx-auto mb-2" />
                <p className="text-muted-foreground text-sm">Loading moderation queue...</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="p-12 text-center">
                <Shield className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">No items in moderation queue</p>
              </div>
            ) : (
              <div className="divide-y divide-border/20">
                {filteredItems.map((item, index) => {
                  const TypeIcon = typeConfig[item.type as keyof typeof typeConfig]?.icon || MessageSquare;
                  const typeColor = typeConfig[item.type as keyof typeof typeConfig]?.color || "text-muted-foreground";
                  const severityStyle = severityConfig[item.severity];

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 hover:bg-secondary/20 transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedItem(item);
                        setShowDetails(true);
                      }}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-xl bg-secondary/30 flex items-center justify-center shrink-0 ${typeColor}`}>
                          <TypeIcon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={cn("text-[10px]", severityStyle?.color)}>
                              {severityStyle?.label}
                            </Badge>
                            <Badge variant="outline" className="text-[10px]">
                              {typeConfig[item.type as keyof typeof typeConfig]?.label}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(item.created_at).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-foreground line-clamp-2 mb-2">{item.content}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <User className="w-3 h-3" />
                            <span>{item.user_display_name || item.user_email || 'Unknown'}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant={item.status === 'pending' ? 'default' : 'secondary'} className="text-[10px]">
                            {item.status}
                          </Badge>
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-destructive" />
              Moderation Review
            </DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Type</label>
                  <Badge variant="outline">{typeConfig[selectedItem.type as keyof typeof typeConfig]?.label}</Badge>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Severity</label>
                  <Badge className={severityConfig[selectedItem.severity].color}>
                    {severityConfig[selectedItem.severity].label}
                  </Badge>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">User</label>
                  <p className="text-sm text-foreground">{selectedItem.user_display_name || selectedItem.user_email || 'Unknown'}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Date</label>
                  <p className="text-sm text-foreground">{new Date(selectedItem.created_at).toLocaleString()}</p>
                </div>
              </div>
              
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Flagged Content</label>
                <div className="p-3 bg-secondary/20 rounded-lg text-sm text-foreground max-h-40 overflow-y-auto">
                  {selectedItem.content}
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Violation Type</label>
                <p className="text-sm text-foreground">{selectedItem.violation_type}</p>
              </div>

              {/* Penalty Section */}
              {selectedItem.status === 'pending' && (
                <div className="space-y-3 pt-4 border-t border-border/30">
                  <label className="text-xs text-muted-foreground mb-1 block">Apply Penalty</label>
                  <Textarea
                    placeholder="Reason for penalty..."
                    value={penaltyReason}
                    onChange={(e) => setPenaltyReason(e.target.value)}
                    className="min-h-[80px]"
                  />
                  <div className="flex items-center gap-2">
                    <Select value={penaltyDuration.toString()} onValueChange={(value) => setPenaltyDuration(Number(value))}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 hour</SelectItem>
                        <SelectItem value="24">24 hours</SelectItem>
                        <SelectItem value="72">3 days</SelectItem>
                        <SelectItem value="168">7 days</SelectItem>
                        <SelectItem value="720">30 days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleApplyPenalty('warning')}
 disabled={dismissalMutation.isPending}
                    >
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Warning
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleApplyPenalty('timeout')}
                      disabled={dismissalMutation.isPending}
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      Timeout
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleApplyPenalty('restriction')}
                      disabled={dismissalMutation.isPending}
                    >
                      <Ban className="w-4 h-4 mr-2" />
                      Restrict
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleApplyPenalty('ban')}
                      disabled={dismissalMutation.isPending}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Ban
                    </Button>
                  </div>
                </div>
              )}

              <DialogFooter className="gap-2">
                {selectedItem.status === 'pending' && (
                  <Button
                    variant="outline"
                    onClick={() => dismissMutation.mutate(selectedItem.id)}
                    disabled={dismissMutation.isPending}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Dismiss as False Positive
                  </Button>
                )}
                <Button variant="outline" onClick={() => setShowDetails(false)}>
                  Close
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
