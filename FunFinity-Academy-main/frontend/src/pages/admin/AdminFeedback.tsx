import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Plus, Trash2, Search, Star, ThumbsUp, ThumbsDown, Filter, Send, Reply, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseRealtime } from "@/hooks/useSupabaseRealtime";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

interface Feedback {
  id: string;
  user_id: string;
  user_name: string | null;
  user_email: string | null;
  type: 'bug' | 'feature' | 'feedback' | 'support';
  category: string;
  subject: string;
  message: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  priority: 'low' | 'medium' | 'high';
  admin_response: string | null;
  rating: number | null;
  created_at: string;
  updated_at: string;
}

const categoryColors: Record<string, string> = {
  bug: "bg-destructive/10 text-destructive border-destructive/20",
  feature: "bg-primary/10 text-primary border-primary/20",
  feedback: "bg-cyan/10 text-cyan border-cyan/20",
  support: "bg-emerald/10 text-emerald border-emerald/20",
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  reviewed: "bg-blue/10 text-blue border-blue/20",
  resolved: "bg-emerald/10 text-emerald border-emerald/20",
  dismissed: "bg-slate/10 text-slate-foreground border-slate/20",
};

export default function AdminFeedback() {
  const { toast } = useToast();
  const { data: feedback, loading, error, refresh } = useSupabaseRealtime<Feedback>('feedback');
  const [isResponseModalOpen, setIsResponseModalOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "reviewed" | "resolved" | "dismissed">("all");
  const [categoryFilter, setCategoryFilter] = useState<"all" | "bug" | "feature" | "feedback" | "support">("all");
  const [responseText, setResponseText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFeedback || !responseText.trim()) {
      toast({
        title: "Missing Response",
        description: "Please provide a response message.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('feedback')
        .update({ 
          admin_response: responseText, 
          status: "reviewed",
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedFeedback.id);

      if (error) throw error;
      
      toast({
        title: "Response Sent",
        description: "Your response has been sent to the user.",
      });
      
      setIsResponseModalOpen(false);
      setSelectedFeedback(null);
      setResponseText("");
      refresh();
    } catch (error) {
      console.error("Error sending response:", error);
      toast({
        title: "Failed to send response",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (feedbackId: string, status: Feedback["status"]) => {
    try {
      const { error } = await supabase
        .from('feedback')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', feedbackId);

      if (error) throw error;
      
      toast({
        title: "Status Updated",
        description: `Feedback status has been updated to ${status}.`,
      });
      refresh();
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Failed to update status",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteFeedback = async (id: string) => {
    try {
      const { error } = await supabase
        .from('feedback')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Feedback Deleted",
        description: "The feedback has been permanently deleted.",
      });
      refresh();
    } catch (error) {
      console.error("Error deleting feedback:", error);
      toast({
        title: "Failed to delete",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  const filteredFeedback = (feedback || []).filter(item => {
    const matchesStatus = filter === "all" || item.status === filter;
    const matchesCategory = categoryFilter === "all" || item.type === categoryFilter;
    const matchesSearch = item.subject.toLowerCase().includes(search.toLowerCase()) || 
                         item.message.toLowerCase().includes(search.toLowerCase()) ||
                         (item.user_name || "").toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesCategory && matchesSearch;
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
            <MessageSquare className="w-6 h-6 text-primary" />
            Feedback Center
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage and respond to user feedback
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="glass-card border-border/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{feedback?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-border/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                <Star className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{feedback?.filter(f => f.status === "pending").length || 0}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-border/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue/10 flex items-center justify-center">
                <Reply className="w-5 h-5 text-blue" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{feedback?.filter(f => f.status === "reviewed").length || 0}</p>
                <p className="text-xs text-muted-foreground">Reviewed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-border/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald/10 flex items-center justify-center">
                <ThumbsUp className="w-5 h-5 text-emerald" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{feedback?.filter(f => f.status === "resolved").length || 0}</p>
                <p className="text-xs text-muted-foreground">Resolved</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-border/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                <ThumbsDown className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{feedback?.filter(f => f.type === "bug").length || 0}</p>
                <p className="text-xs text-muted-foreground">Bugs</p>
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
                placeholder="Search feedback..."
                className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-muted-foreground" />
              <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
                <SelectTrigger className="w-[120px] bg-secondary/50 border-border/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="dismissed">Dismissed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={(value: any) => setCategoryFilter(value)}>
                <SelectTrigger className="w-[120px] bg-secondary/50 border-border/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="bug">Bug</SelectItem>
                  <SelectItem value="feature">Feature</SelectItem>
                  <SelectItem value="feedback">Feedback</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feedback List */}
      <div className="space-y-4">
        {filteredFeedback.length === 0 ? (
          <Card className="glass-card border-border/30">
            <CardContent className="p-12 text-center">
              <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Feedback Found</h3>
              <p className="text-sm text-muted-foreground">
                {search || filter !== "all" || categoryFilter !== "all" 
                  ? "Try adjusting your search or filter criteria." 
                  : "No feedback has been submitted yet."}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredFeedback.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="glass-card border-border/30">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-brand flex items-center justify-center text-white font-bold">
                        {item.user_name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{item.user_name}</h3>
                        <p className="text-xs text-muted-foreground">{item.user_email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={cn("text-[10px]", categoryColors[item.category])}>
                        {item.category}
                      </Badge>
                      <Badge className={cn("text-[10px]", statusColors[item.status])}>
                        {item.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="font-medium text-foreground mb-2">{item.subject}</h4>
                    <p className="text-sm text-muted-foreground">{item.message}</p>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current text-yellow-500" style={{ opacity: i < item.rating ? 1 : 0.3 }} />
                    ))}
                  </div>

                  {item.admin_response && (
                    <div className="bg-secondary/30 rounded-lg p-3 mb-4">
                      <p className="text-xs text-muted-foreground mb-1">Admin Response:</p>
                      <p className="text-sm text-foreground">{item.admin_response}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-border/20">
                    <p className="text-xs text-muted-foreground">
                      {new Date(item.created_at).toLocaleDateString()} at {new Date(item.created_at).toLocaleTimeString()}
                    </p>
                    <div className="flex items-center gap-2">
                      <Select 
                        value={item.status} 
                        onValueChange={(value: any) => handleUpdateStatus(item.id, value)}
                      >
                        <SelectTrigger className="w-[110px] h-8 text-xs bg-secondary/50 border-border/30">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="reviewed">Reviewed</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="dismissed">Dismissed</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedFeedback(item);
                          setResponseText(item.admin_response || "");
                          setIsResponseModalOpen(true);
                        }}
                        className="h-8"
                      >
                        <Reply className="w-3 h-3 mr-1" />
                        Respond
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteFeedback(item.id)}
                        className="text-destructive hover:text-destructive h-8"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Response Modal */}
      <AnimatePresence>
        {isResponseModalOpen && selectedFeedback && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setIsResponseModalOpen(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-lg glass-card border-border/30 rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setIsResponseModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-secondary/50 transition-colors"
              >
                <Trash2 className="w-5 h-5 text-muted-foreground" />
              </button>

              <div className="mb-6">
                <h2 className="text-xl font-bold text-foreground mb-2">Respond to Feedback</h2>
                <p className="text-sm text-muted-foreground">{selectedFeedback.subject}</p>
              </div>

              <div className="bg-secondary/30 rounded-lg p-4 mb-4">
                <p className="text-xs text-muted-foreground mb-1">From: {selectedFeedback.user_name}</p>
                <p className="text-sm text-foreground">{selectedFeedback.message}</p>
              </div>

              <form onSubmit={handleResponse} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="response">Your Response</Label>
                  <Textarea
                    id="response"
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder="Type your response..."
                    rows={4}
                    className="bg-secondary/50 border-border/30 resize-none"
                    required
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    variant="hero"
                    className="flex-1"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send Response
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsResponseModalOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
