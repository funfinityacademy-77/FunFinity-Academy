import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Clock, Search, Plus, Pin, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useForumPosts, useCreateForumPost, useForumReplies, useCreateForumReply } from "@/hooks/use-forums";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const categories = ["All Topics", "Mathematics", "Science", "Coding", "General", "Study Tips"];

export default function Forums() {
  const [activeCategory, setActiveCategory] = useState("All Topics");
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("General");

  const { data: posts, isLoading } = useForumPosts(activeCategory);
  const createPost = useCreateForumPost();

  const filtered = posts?.filter((p: any) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    createPost.mutate(
      { title: newTitle, content: newContent, category: newCategory },
      {
        onSuccess: () => {
          setDialogOpen(false);
          setNewTitle("");
          setNewContent("");
          toast.success("Discussion topic published!");
        },
      }
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="flex flex-col md:flex-row md:items-end justify-between gap-6"
      >
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
              <MessageSquare className="w-5 h-5 text-primary" />
            </div>
            <h1 className="font-display text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
              Discussion <span className="text-gradient-brand">Forums</span>
            </h1>
          </div>
          <p className="text-muted-foreground ml-1">Collaborative intelligence through structured community discourse.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="hero" className="rounded-2xl shadow-lg shadow-primary/20">
                <Plus className="w-4 h-4 mr-2" /> 
                New Discussion
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card-heavy border-primary/20 max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                  <Plus className="w-5 h-5 text-primary" />
                  Initiate Discussion
                </DialogTitle>
                <p className="text-sm text-muted-foreground">Synthesize your thoughts for the community.</p>
              </DialogHeader>
              <div className="space-y-5 pt-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-primary/70 ml-1">Topic Identity</label>
                  <Input 
                    placeholder="e.g., Understanding Quantum Entanglement in Biology" 
                    value={newTitle} 
                    onChange={(e) => setNewTitle(e.target.value)} 
                    className="rounded-xl glass-card border-white/10 h-12"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-primary/70 ml-1">Domain</label>
                    <Select value={newCategory} onValueChange={setNewCategory}>
                      <SelectTrigger className="rounded-xl glass-card border-white/10 h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="glass-card border-white/10">
                        {categories.filter((c) => c !== "All Topics").map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-primary/70 ml-1">Content Synthesis</label>
                  <Textarea 
                    placeholder="Provide detailed context or questions..." 
                    value={newContent} 
                    onChange={(e) => setNewContent(e.target.value)} 
                    className="rounded-xl glass-card border-white/10 min-h-[150px] p-4"
                  />
                </div>
                <Button 
                  variant="hero" 
                  className="w-full h-14 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20" 
                  onClick={handleCreate} 
                  disabled={createPost.isPending}
                >
                  {createPost.isPending ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : "Publish Topic"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      <div className="grid gap-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex items-center gap-3 px-5 py-3 rounded-[2rem] glass-card border-primary/10 focus-within:border-primary/40 transition-all shadow-inner">
            <Search className="w-5 h-5 text-primary/50" />
            <input
              type="text"
              placeholder="Query across knowledge domains..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-sm outline-none w-full text-foreground placeholder:text-muted-foreground font-medium"
              aria-label="Search discussions"
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "px-5 py-3 rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-300 border",
                  activeCategory === cat 
                    ? "glass-card border-primary/40 text-primary shadow-lg shadow-primary/10" 
                    : "text-muted-foreground hover:text-foreground border-transparent hover:bg-white/5"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        ) : filtered?.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-24 text-center border-dashed border-primary/20 rounded-[3rem] relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-50" />
            <div className="relative z-10">
              <div className="w-20 h-20 rounded-[2.5rem] bg-secondary/30 flex items-center justify-center mx-auto mb-6 border border-border/20 shadow-xl">
                <MessageSquare className="w-10 h-10 text-primary/20" />
              </div>
              <p className="text-foreground font-display text-2xl font-bold">Domain Unexplored</p>
              <p className="text-muted-foreground mt-2 max-w-sm mx-auto text-sm">
                No active discussions found in this sector. Initiate a new exchange to catalyze collaborative learning.
              </p>
              <Button 
                variant="outline" 
                className="mt-8 rounded-xl border-primary/20 hover:bg-primary/5"
                onClick={() => setDialogOpen(true)}
              >
                Catalyze Conversation
              </Button>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {filtered?.map((post: any, idx: number) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <ForumPost post={post} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ForumPost({ post }: { post: any }) {
  const [expanded, setExpanded] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const { data: replies, isLoading: loadingReplies } = useForumReplies(post.id);
  const createReply = useCreateForumReply();

  const handleReply = () => {
    if (!replyContent.trim()) return;
    createReply.mutate({ postId: post.id, content: replyContent }, {
      onSuccess: () => {
        setReplyContent("");
        toast.success("Contribution recorded.");
      }
    });
  };

  return (
    <div className="glass-card p-6 lg:p-8 space-y-6 rounded-[2rem] border-white/10 hover:border-primary/30 transition-all duration-500 group relative overflow-hidden">
      <div className="absolute -right-12 -top-12 w-48 h-48 bg-primary/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="flex justify-between items-start relative z-10">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[10px] font-bold tracking-wider uppercase">
              {post.category || "General"}
            </Badge>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
              <Clock className="w-3 h-3" />
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </div>
          </div>
          <h3 className="text-xl lg:text-2xl font-bold text-foreground leading-tight group-hover:text-primary transition-colors">
            {post.title}
          </h3>
          <div className="flex items-center gap-2 text-[11px]">
            <div className="w-6 h-6 rounded-lg bg-secondary flex items-center justify-center font-bold text-primary">
              {post.profiles?.display_name?.charAt(0).toUpperCase()}
            </div>
            <span className="font-bold text-foreground/80">{post.profiles?.display_name || "Anonymous Member"}</span>
          </div>
        </div>
        {post.pinned && (
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <Pin className="w-4 h-4" />
          </div>
        )}
      </div>
      
      <p className="text-sm text-foreground/80 leading-relaxed max-w-3xl relative z-10">
        {post.content}
      </p>

      <div className="flex items-center gap-4 pt-2 relative z-10">
        <button 
          onClick={() => setExpanded(!expanded)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-bold text-[11px] uppercase tracking-wider",
            expanded 
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
              : "bg-secondary/40 text-muted-foreground hover:text-foreground hover:bg-secondary/60"
          )}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          {replies?.length || 0} Responses
        </button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="pt-6 border-t border-white/5 space-y-6 overflow-hidden"
          >
            {loadingReplies ? (
              <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-primary/50" /></div>
            ) : replies?.length === 0 ? (
              <div className="text-center py-8 opacity-40">
                <p className="text-xs font-bold tracking-widest uppercase">No contributions yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {replies?.map((reply: any) => (
                  <div key={reply.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[10px]">
                        <span className="font-bold text-primary">{reply.profiles?.display_name}</span>
                        <span className="text-muted-foreground opacity-50">•</span>
                        <span className="text-muted-foreground">{formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}</span>
                      </div>
                    </div>
                    <p className="text-sm text-foreground/80">{reply.content}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition-opacity" />
              <div className="relative flex gap-3">
                <Input 
                  value={replyContent} 
                  onChange={(e) => setReplyContent(e.target.value)} 
                  placeholder="Record your contribution..." 
                  className="h-12 text-sm rounded-xl glass-card border-white/10"
                  onKeyDown={(e) => { if (e.key === "Enter") handleReply(); }}
                />
                <Button 
                  variant="hero" 
                  size="sm" 
                  onClick={handleReply} 
                  disabled={createReply.isPending || !replyContent.trim()} 
                  className="h-12 w-12 rounded-xl shrink-0 shadow-lg shadow-primary/20"
                >
                  {createReply.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

