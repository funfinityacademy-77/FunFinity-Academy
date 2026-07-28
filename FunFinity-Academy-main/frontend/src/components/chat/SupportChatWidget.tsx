import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Minimize2, Maximize2, User, Bot, Clock, Check, CheckCheck, Smile, MoreVertical, Phone, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

interface ChatMessage {
  id: string;
  user_id: string;
  message: string;
  is_support: boolean;
  created_at: string;
  read: boolean;
  read_at?: string;
}

export function SupportChatWidget() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const subscriptionRef = useRef<any>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const emojis = ['😀', '😊', '👍', '❤️', '🎉', '🔥', '✨', '💯', '🙏', '💪', '🤔', '😂', '👋', '🙌', '💪'];

  useEffect(() => {
    if (user) {
      loadMessages();
      checkSupportOnline();
    }
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Set up subscription when component mounts
    if (user && !subscriptionRef.current) {
      const subscription = supabase
        .channel('support_messages')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'support_messages',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            const newMessage = payload.new as ChatMessage;
            setMessages(prev => [...prev, newMessage]);
            
            if (newMessage.is_support) {
              setUnreadCount(prev => prev + 1);
              setIsTyping(false);
              toast({
                title: "New support message",
                description: "You have a new message from support.",
              });
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'support_messages',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            const updatedMessage = payload.new as ChatMessage;
            setMessages(prev => prev.map(m => m.id === updatedMessage.id ? updatedMessage : m));
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('Subscribed to support messages');
          }
        });

      subscriptionRef.current = subscription;
    }

    // Cleanup on unmount
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, [user]);

  const checkSupportOnline = async () => {
    // Simulate online status - in production, this would check actual support presence
    setIsOnline(true);
  };

  const loadMessages = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('support_messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setMessages(data || []);
      
      // Count unread messages
      const unread = (data || []).filter((m: ChatMessage) => m.is_support && !m.read).length;
      setUnreadCount(unread);

      // Mark support messages as read
      if (unread > 0) {
        await supabase
          .from('support_messages')
          .update({ read: true, read_at: new Date().toISOString() })
          .eq('user_id', user.id)
          .eq('is_support', true);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async () => {
    if (!message.trim() || !user) return;

    setIsLoading(true);
    const newMessage = message.trim();
    setMessage("");

    try {
      const { data, error } = await supabase
        .from('support_messages')
        .insert({
          user_id: user.id,
          message: newMessage,
          is_support: false,
          read: false,
        })
        .select()
        .single();

      if (error) throw error;

      setMessages(prev => [...prev, data]);
      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Failed to send message",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  if (!user) return null;

  return (
    <>
      {/* Chat Button */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Button
          onClick={() => {
            setIsOpen(!isOpen);
            if (isOpen) {
              setUnreadCount(0);
              loadMessages();
            }
          }}
          size="lg"
          className={cn(
            "rounded-full shadow-lg transition-all duration-300 relative",
            "bg-gradient-brand hover:shadow-glow-cyan"
          )}
          style={{ width: '64px', height: '64px' }}
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <>
              <MessageCircle className="w-6 h-6" />
              {isOnline && (
                <div className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white" />
              )}
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-6 w-6 flex items-center justify-center p-0 bg-destructive text-white text-xs">
                  {unreadCount}
                </Badge>
              )}
            </>
          )}
        </Button>
      </motion.div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "fixed z-50 shadow-2xl border-primary/20 bg-background rounded-2xl overflow-hidden flex flex-col",
              isMinimized ? "bottom-6 right-24 w-80 h-14" : "bottom-20 right-6 w-[420px] h-[580px]"
            )}
          >
            {/* Header */}
            <CardHeader className="flex flex-row items-center justify-between p-4 border-b border-border/30 bg-gradient-brand">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="w-10 h-10 bg-white/20">
                    <AvatarFallback className="text-white">
                      <Bot className="w-5 h-5" />
                    </AvatarFallback>
                  </Avatar>
                  {isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-white">Support Chat</h3>
                  <p className="text-xs text-white/80 flex items-center gap-2">
                    {isOnline ? (
                      <>
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                        Online
                      </>
                    ) : (
                      <>
                        <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                        Away
                      </>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 h-8 w-8"
                >
                  <Phone className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 h-8 w-8"
                >
                  <Video className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="text-white hover:bg-white/20 h-8 w-8"
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white/20 h-8 w-8"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>

            {!isMinimized && (
              <>
                {/* Messages */}
                <CardContent className="p-0 flex-1">
                  <ScrollArea className="h-[420px] p-4" ref={scrollRef}>
                    <div className="space-y-4">
                      {messages.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-4">
                            <Bot className="w-8 h-8 text-primary" />
                          </div>
                          <h4 className="font-semibold mb-2">Start a Conversation</h4>
                          <p className="text-sm text-muted-foreground">
                            Our support team is here to help. How can we assist you today?
                          </p>
                        </div>
                      ) : (
                        messages.map((msg) => (
                          <div
                            key={msg.id}
                            className={cn(
                              "flex gap-3",
                              msg.is_support ? "justify-start" : "justify-end"
                            )}
                          >
                            {msg.is_support && (
                              <Avatar className="w-8 h-8 bg-primary/10">
                                <AvatarFallback>
                                  <Bot className="w-4 h-4 text-primary" />
                                </AvatarFallback>
                              </Avatar>
                            )}
                            <div className={cn(
                              "flex flex-col gap-1 max-w-[75%]",
                              msg.is_support ? "items-start" : "items-end"
                            )}>
                              <div
                                className={cn(
                                  "rounded-2xl px-4 py-2 text-sm",
                                  msg.is_support
                                    ? "bg-secondary text-foreground rounded-bl-sm"
                                    : "bg-gradient-brand text-white rounded-br-sm"
                                )}
                              >
                                {msg.message}
                              </div>
                              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                {formatTime(msg.created_at)}
                                {msg.is_support && msg.read && (
                                  <CheckCheck className="w-3 h-3 text-primary" />
                                )}
                                {!msg.is_support && (
                                  <Check className={cn("w-3 h-3", msg.read ? "text-primary" : "text-muted-foreground")} />
                                )}
                              </div>
                            </div>
                            {!msg.is_support && (
                              <Avatar className="w-8 h-8 bg-primary/10">
                                <AvatarFallback>
                                  <User className="w-4 h-4 text-primary" />
                                </AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                        ))
                      )}
                      {isTyping && (
                        <div className="flex gap-3">
                          <Avatar className="w-8 h-8 bg-primary/10">
                            <AvatarFallback>
                              <Bot className="w-4 h-4 text-primary" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex items-center gap-2 text-muted-foreground text-sm bg-secondary rounded-2xl rounded-bl-sm px-4 py-2">
                            <div className="flex gap-1">
                              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                            <span>Support is typing...</span>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>
                </CardContent>

                {/* Input */}
                <div className="p-4 border-t border-border/30">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    >
                      <Smile className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                    <Input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      className="flex-1"
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={!message.trim() || isLoading}
                      size="icon"
                      className="h-9 w-9 bg-gradient-brand hover:shadow-glow-cyan"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>

                  <AnimatePresence>
                    {showEmojiPicker && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute bottom-16 left-4 bg-background border border-border/30 rounded-lg shadow-lg p-2 flex gap-1 flex-wrap max-w-[280px]"
                      >
                        {emojis.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => {
                              setMessage(prev => prev + emoji);
                              setShowEmojiPicker(false);
                            }}
                            className="text-2xl hover:bg-secondary rounded p-1 transition-colors"
                          >
                            {emoji}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
