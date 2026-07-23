import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, Search, Plus, Loader2, UserPlus, ShieldAlert, X, MessageSquare, User,
  ShieldCheck
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { 
  useConversations, 
  useMessages, 
  useSendMessage, 
  useSearchUsers, 
  useCreateConversation,
  useUpdateConversationStatus,
  PREDEFINED_RESPONSES,
  getContextAwareResponses
} from "@/hooks/use-chat";


export function ChatContainer() {
  const { user, role } = useAuth();
  const [activeConvoId, setActiveConvoId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [activeTab, setActiveTab] = useState<"student" | "parent" | "admin">(role === "parent" ? "parent" : role === "admin" ? "admin" : "student");
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [showContacts, setShowContacts] = useState(true);
  const [customReplyRequested, setCustomReplyRequested] = useState(false);

  
  const { data: conversations, isLoading: loadingConvos } = useConversations();
  const { data: messages, isLoading: loadingMessages } = useMessages(activeConvoId);
  const { data: searchResults, isLoading: searchingUsers } = useSearchUsers(userSearchQuery);
  
  const sendMessage = useSendMessage();
  const createConversation = useCreateConversation();
  const updateStatus = useUpdateConversationStatus();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getOtherMember = (convo: any) => {
    return convo.members?.find((m: any) => m.user_id !== user?.id);
  };

  const isMonitoring = (convo: any) => {
    if (role !== "parent") return false;
    // If I'm a parent and neither member is me, I'm monitoring
    return !convo.members?.some((m: any) => m.user_id === user?.id);
  };

  const filteredConvos = ((conversations as any[]) || []).filter((c) => {
    const other = getOtherMember(c);
    const matchesTab = other?.role === activeTab;
    const displayName = c.name || other?.profiles?.display_name || "Conversation";
    const matchesSearch = displayName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const activeConvo = ((conversations as any[]) || []).find((c) => c.id === activeConvoId);
  const activeOtherMember = activeConvo ? getOtherMember(activeConvo) : null;
  const monitoring = activeConvo ? isMonitoring(activeConvo) : false;
  
  const isPendingReceiver = activeConvo?.type === "pending_student" && activeConvo.created_by !== user?.id;
  const isPendingSender = activeConvo?.type === "pending_student" && activeConvo.created_by === user?.id;

  useEffect(() => {
    if (!activeConvoId || !filteredConvos.some(c => c.id === activeConvoId)) {
      if (filteredConvos.length > 0) {
        setActiveConvoId(filteredConvos[0].id);
      } else {
        setActiveConvoId(null);
      }
    }
  }, [activeTab, conversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const lastSentRef = useRef<number>(0);

  const handleSend = () => {
    if (!newMessage.trim() || !activeConvoId || monitoring) return;
    
    // Security: Basic Rate Limiting (1 message per second)
    const now = Date.now();
    if (now - lastSentRef.current < 1000) {
      toast.error("Decelerate! Message transmission frequency limit exceeded.");
      return;
    }

    // Security: Pattern detection (Honeypot/Decoy logic)
    const suspiciousPatterns = ["<script", "javascript:", "eval(", "UNION SELECT"];
    if (suspiciousPatterns.some(p => newMessage.toLowerCase().includes(p))) {
      console.warn("Security Alert: Suspicious payload detected and neutralized.", { userId: user?.id, content: newMessage });
      toast.error("Integrity violation: Message contains forbidden syntax.");
      setNewMessage("");
      return;
    }

    sendMessage.mutate({ conversationId: activeConvoId, content: newMessage.trim() });
    lastSentRef.current = now;
    setNewMessage("");
  };

  const handleStartChat = (targetUser: any) => {
    createConversation.mutate({
      name: targetUser.display_name,
      memberIds: [targetUser.id],
      otherUserRole: targetUser.role
    }, {
      onSuccess: () => {
        setShowSearchModal(false);
        setUserSearchQuery("");
        setActiveTab(targetUser.role === "admin" ? "admin" : targetUser.role === "parent" ? "parent" : "student");
      }
    });
  };

  const handleApprove = () => {
    if (activeConvoId) {
      updateStatus.mutate({ id: activeConvoId, status: "direct" });
    }
  };

  const handleDecline = () => {
    if (activeConvoId) {
      updateStatus.mutate({ id: activeConvoId, status: "declined" });
    }
  };

  return (
    <div className="w-full h-full relative p-2 lg:p-4">
      <div className="platform-card h-full flex overflow-hidden rounded-[2.5rem] border border-white/10 shadow-2xl bg-background/10 backdrop-blur-2xl relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
        
        {/* Contacts Sidebar */}
        <div className={cn("w-80 border-r border-white/10 flex flex-col shrink-0 bg-background/20 backdrop-blur-xl z-20 relative", !showContacts && "hidden lg:flex")}>
          <div className="p-6 border-b border-white/5">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-bold text-foreground tracking-tight">Chat</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowSearchModal(true)} className="h-9 w-9 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 transition-all duration-300">
                <Plus className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="flex bg-white/5 p-1.5 rounded-2xl mb-6 border border-white/5">
              {(["student", "admin"] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={cn(
                    "flex-1 text-[10px] py-2 rounded-xl font-bold transition-all duration-300 capitalize tracking-wider",
                    activeTab === t 
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.05]" 
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  )}
                >
                  {t}s
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/5 border border-white/5 focus-within:border-primary/40 focus-within:bg-white/10 transition-all shadow-inner">
              <Search className="w-4 h-4 text-primary/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search channels..."
                className="bg-transparent text-xs outline-none w-full text-foreground placeholder:text-muted-foreground/50 font-bold tracking-wide"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {loadingConvos ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary/50" />
              </div>
            ) : filteredConvos.length === 0 ? (
              <div className="p-12 text-center text-sm text-muted-foreground flex flex-col items-center">
                <div className="w-16 h-16 rounded-3xl bg-secondary/30 flex items-center justify-center mb-4 border border-border/20">
                  <UserPlus className="w-6 h-6 opacity-30" />
                </div>
                <p className="font-medium">No conversations yet</p>
                <p className="text-xs opacity-60 mt-1">Start a chat to see messages here</p>
              </div>
            ) : (
              <div className="py-2">
                {filteredConvos.map((convo) => {
                  const other = getOtherMember(convo);
                  const isMonitor = isMonitoring(convo);
                  const displayName = convo.name || other?.profiles?.display_name || "User";
                  const lastMessage = messages?.filter(m => m.conversation_id === convo.id).pop();
                  
                  return (
                    <button
                      key={convo.id}
                      onClick={() => { setActiveConvoId(convo.id); setShowContacts(false); }}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all duration-300 border-l-4 group relative",
                        activeConvoId === convo.id 
                          ? "bg-primary/10 border-primary shadow-inner" 
                          : "hover:bg-secondary/20 border-transparent hover:border-primary/30"
                      )}
                    >
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center text-sm font-bold text-primary shrink-0 transition-transform group-hover:scale-105">
                        {displayName.charAt(0).toUpperCase()}
                        {convo.type === "pending_student" && (
                          <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-500 border-2 border-background animate-pulse" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-0.5">
                          <p className="text-sm font-semibold text-foreground truncate flex items-center gap-1.5">
                            {displayName}
                            {isMonitor && <ShieldAlert className="w-3 h-3 text-primary animate-pulse" />}

                          </p>
                          {convo.updated_at && (
                             <span className="text-[10px] text-muted-foreground">
                               {new Date(convo.updated_at).toLocaleDateString() === new Date().toLocaleDateString() 
                                 ? new Date(convo.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                 : new Date(convo.updated_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                             </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate opacity-80">
                          {convo.type === "pending_student" 
                            ? "Pending Approval" 
                            : isMonitor 
                              ? "Monitoring Activity" 
                              : lastMessage?.content || "No messages yet"}
                        </p>
                      </div>
                      {activeConvoId === convo.id && (
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-l-full" />
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-background/20">
          {!activeConvoId ? (
            <div className="flex-1 flex items-center justify-center">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <div className="w-24 h-24 rounded-[2.5rem] bg-secondary/30 flex items-center justify-center mx-auto mb-6 border border-border/20 shadow-xl">
                  <Send className="w-8 h-8 text-primary/40 rotate-12" />
                </div>
                <h3 className="text-xl font-display font-bold text-foreground mb-2">Select a Conversation</h3>
                <p className="text-muted-foreground text-sm max-w-[240px] mx-auto">Choose a contact to start chatting or view monitored discussions.</p>
              </motion.div>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-border/30 flex items-center justify-between bg-background/60 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <button className="lg:hidden p-2 text-foreground hover:bg-secondary/30 rounded-xl transition-colors" onClick={() => setShowContacts(true)}>←</button>
                  <div className="w-12 h-12 rounded-2xl bg-gradient-brand flex items-center justify-center text-base font-bold text-primary-foreground shadow-lg shadow-primary/20">
                    {(activeConvo?.name || activeOtherMember?.profiles?.display_name || "C").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-sm flex items-center gap-2 tracking-tight">
                      {activeConvo?.name || activeOtherMember?.profiles?.display_name || "Conversation"}
                      {monitoring && (
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-primary/20 text-primary font-bold uppercase tracking-wider animate-pulse">
                          Monitoring
                        </span>
                      )}
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                      <p className="text-[11px] text-muted-foreground font-medium capitalize opacity-80">{activeOtherMember?.role || "user"}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {(role === "student" || role === "parent") && activeOtherMember?.role === "admin" && (
                    <div className="hidden sm:flex items-center gap-2 text-[10px] text-primary/60 font-bold bg-primary/5 px-3 py-1.5 rounded-xl border border-primary/10">
                      <ShieldCheck className="w-3 h-3" />
                      GUIDED RESPONSE MODE
                    </div>
                  )}
                  {monitoring && (
                    <div className="hidden md:flex items-center gap-2 text-[10px] text-primary font-bold bg-primary/10 px-3 py-1.5 rounded-xl border border-primary/20">
                      <ShieldAlert className="w-3 h-3" />
                      READ ONLY MODE
                    </div>
                  )}
                </div>
              </div>

              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-dots-pattern">
                {loadingMessages ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-primary/40" />
                  </div>
                ) : ((messages as any[]) || []).length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center opacity-40">
                    <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mb-4 border border-border/20">
                      <Send className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-medium">No messages yet in this conversation.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {((messages as any[]) || []).map((msg, idx, arr) => {
                      const isMe = msg.sender_id === user?.id;
                      const prevMsg = arr[idx - 1];
                      const isFirstInGroup = !prevMsg || prevMsg.sender_id !== msg.sender_id;
                      
                      return (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, x: isMe ? 10 : -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={cn("flex flex-col", isMe ? "items-end" : "items-start")}
                        >
                          <div className={cn(
                            "max-w-[80%] lg:max-w-[65%] px-5 py-3.5 shadow-xl relative group transition-all duration-300",
                            isMe
                              ? "bg-gradient-to-br from-primary to-primary-700 text-primary-foreground rounded-[1.5rem] rounded-tr-sm shadow-primary/20"
                              : "glass-card-heavy text-foreground border-white/10 rounded-[1.5rem] rounded-tl-sm"
                          )}>
                            <p className="text-sm leading-relaxed font-medium">{msg.content}</p>
                            <p className={cn(
                              "text-[9px] mt-1 opacity-60 font-bold",
                              isMe ? "text-primary-foreground" : "text-muted-foreground"
                            )}>
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-border/30 bg-background/60 backdrop-blur-md">
                {isPendingReceiver ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row items-center justify-between gap-4 glass-card p-5 rounded-2xl border border-primary/30 bg-primary/5 shadow-lg shadow-primary/5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <UserPlus className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">New Chat Request</p>
                        <p className="text-[11px] text-muted-foreground">Would you like to connect and start messaging?</p>
                      </div>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                      <Button variant="outline" className="flex-1 md:flex-none h-9 text-xs rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10" onClick={handleDecline}>Decline</Button>
                      <Button variant="hero" className="flex-1 md:flex-none h-9 text-xs rounded-xl shadow-lg shadow-primary/20" onClick={handleApprove}>Approve Request</Button>
                    </div>
                  </motion.div>
                ) : isPendingSender ? (
                  <div className="text-center p-6 rounded-2xl border border-dashed border-border/50 bg-secondary/10">
                    <Loader2 className="w-6 h-6 animate-spin text-primary/40 mx-auto mb-3" />
                    <p className="text-sm font-bold text-foreground">Waiting for Approval</p>
                    <p className="text-xs text-muted-foreground mt-1">You can send messages once the request is accepted.</p>
                  </div>
                ) : monitoring ? (
                  <div className="p-4 rounded-2xl border border-primary/20 bg-primary/5 flex flex-col items-center justify-center gap-2 text-center">
                    <ShieldAlert className="w-5 h-5 text-primary animate-pulse" />
                    <p className="text-sm font-bold text-primary">Read-Only Monitoring Access</p>
                    <p className="text-[11px] text-primary/70">As a parent, you can view these messages but cannot participate in the conversation.</p>
                  </div>
                ) : activeConvo?.type === "declined" ? (
                  <div className="text-center p-5 rounded-2xl border border-destructive/20 bg-destructive/5">
                    <X className="w-6 h-6 text-destructive/40 mx-auto mb-2" />
                    <p className="text-sm font-bold text-destructive">Chat Request Declined</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {/* Role-based restriction check */}
                    {(role === "student" || role === "parent") && activeOtherMember?.role === "admin" && !customReplyRequested ? (
                      <div className="flex flex-col gap-4 p-2">
                        <div className="flex items-center justify-between px-1">
                          <p className="text-[10px] text-primary/70 uppercase tracking-widest font-bold">Suggested Responses</p>
                          <span className="text-[10px] text-muted-foreground/50 italic">Guided Response Mode</span>
                        </div>
                        
                        <div className="flex flex-wrap gap-3">
                          {(() => {
                            const lastMsg = messages?.[messages.length - 1]?.content || "";
                            const responses = [
                              ...getContextAwareResponses(lastMsg),
                              ...PREDEFINED_RESPONSES
                            ].slice(0, 8);
                            
                            return responses.map((resp) => (
                              <motion.button
                                key={resp}
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                  sendMessage.mutate({ conversationId: activeConvoId, content: resp });
                                  toast.success("Intelligence shared.");
                                }}
                                className="px-5 py-3 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 hover:border-primary/50 text-[11px] font-bold text-foreground shadow-lg shadow-black/5 transition-all flex items-center justify-between min-w-[140px] group relative overflow-hidden"
                              >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                <span className="relative z-10">{resp}</span>
                                <Send className="w-3 h-3 relative z-10 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                              </motion.button>
                            ));
                          })()}
                          
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setCustomReplyRequested(true)}
                            className="px-5 py-3 rounded-2xl border border-dashed border-primary/30 text-primary hover:bg-primary/5 text-[11px] font-bold transition-all flex items-center gap-2"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Synthesize Custom Reply
                          </motion.button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="flex-1 flex items-center gap-3 px-4 py-1 rounded-2xl bg-secondary/30 border border-border/20 focus-within:border-primary/40 focus-within:bg-secondary/40 transition-all duration-300">
                          {customReplyRequested && (role === "student" || role === "parent") && (
                            <button 
                              onClick={() => setCustomReplyRequested(false)} 
                              className="w-7 h-7 flex items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                              title="Back to structured responses"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                            placeholder={
                              (role === "student" || role === "parent") && activeOtherMember?.role === "admin"
                                ? "Type your requested custom reply..." 
                                : "Type a message..."
                            }
                            className="bg-transparent text-sm py-3 outline-none w-full text-foreground placeholder:text-muted-foreground font-medium"
                          />
                        </div>
                        <Button
                          variant="hero"
                          size="icon"
                          onClick={() => {
                            handleSend();
                            if (customReplyRequested) setCustomReplyRequested(false);
                          }}
                          disabled={!newMessage.trim() || sendMessage.isPending}
                          className="rounded-2xl h-12 w-12 shadow-lg shadow-primary/20 shrink-0 transition-transform active:scale-95"
                        >
                          {sendMessage.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        </Button>
                      </div>
                    )}
                  </div>

                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Improved Search Modal */}
      <AnimatePresence>
        {showSearchModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/60 backdrop-blur-xl"
              onClick={() => setShowSearchModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-card border border-border/50 shadow-2xl rounded-[2rem] overflow-hidden"
            >
              <div className="p-6 border-b border-border/30 flex items-center justify-between bg-secondary/10">
                <div>
                  <h3 className="text-lg font-display font-bold text-foreground">Find Connections</h3>
                  <p className="text-xs text-muted-foreground">Search for students, parents, or teachers</p>
                </div>
                <button onClick={() => setShowSearchModal(false)} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-secondary/50 text-muted-foreground transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-secondary/30 border border-border/20 focus-within:border-primary/40 focus-within:ring-4 ring-primary/5 transition-all mb-6">
                  <Search className="w-5 h-5 text-primary/50" />
                  <input
                    type="text"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    placeholder="Search by name or email..."
                    className="bg-transparent text-sm outline-none w-full text-foreground placeholder:text-muted-foreground font-medium"
                    autoFocus
                  />
                </div>

                <div className="space-y-3 max-h-[350px] overflow-y-auto custom-scrollbar px-1">
                  {userSearchQuery.length < 2 ? (
                    <div className="text-center py-12 opacity-40">
                      <Search className="w-12 h-12 mx-auto mb-3" />
                      <p className="text-sm font-medium">Enter at least 2 characters</p>
                    </div>
                  ) : searchingUsers ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      <p className="text-xs font-bold text-primary mt-4 animate-pulse">Searching profiles...</p>
                    </div>
                  ) : searchResults?.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-sm font-bold text-foreground">No matches found</p>
                      <p className="text-xs text-muted-foreground mt-1">Try a different search term</p>
                    </div>
                  ) : (
                    searchResults?.map((u) => {
                      if (u.id === user?.id) return null;
                      return (
                        <motion.div 
                          key={u.id} 
                          initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                          className="flex items-center justify-between p-4 rounded-2xl bg-secondary/20 hover:bg-secondary/40 border border-border/10 hover:border-primary/20 transition-all group"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-brand flex items-center justify-center text-base font-bold text-primary-foreground shadow-lg group-hover:scale-105 transition-transform">
                              {u.display_name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-foreground">{u.display_name}</p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className={cn(
                                  "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider",
                                  u.role === 'admin' ? "bg-amber-500/10 text-amber-500" : 
                                  u.role === 'parent' ? "bg-primary/10 text-primary" : "bg-emerald-500/10 text-emerald-500"
                                )}>
                                  {u.role}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Button 
                            variant="hero" 
                            size="sm" 
                            onClick={() => handleStartChat(u)} 
                            disabled={createConversation.isPending}
                            className="rounded-xl px-5 h-9 font-bold text-xs shadow-lg shadow-primary/10"
                          >
                            Connect
                          </Button>
                        </motion.div>
                      )
                    })
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
