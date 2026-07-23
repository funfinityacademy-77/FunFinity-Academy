import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, User, Bot, Clock, Check, CheckCheck, Paperclip, Smile, MoreVertical, Minimize2, Maximize2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface SupportChatWidgetProps {
  supabaseUrl: string;
  supabaseKey: string;
  logoUrl?: string;
  primaryColor?: string;
  textColor?: string;
  bubbleBackground?: string;
}

interface Message {
  id: string;
  sender_type: 'visitor' | 'agent' | 'system';
  sender_name: string;
  content: string;
  created_at: string;
  read_at?: string;
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  reactions?: { emoji: string; count: number; userId?: string }[];
  reply_to?: string;
  attachments?: { name: string; url: string; type: string }[];
}

interface Ticket {
  id: string;
  visitor_name: string;
  visitor_email?: string;
  status: 'open' | 'assigned' | 'resolved';
  session_id: string;
  created_at: string;
  last_message_at: string;
}

export default function SupportChatWidget({
  supabaseUrl,
  supabaseKey,
  logoUrl,
  primaryColor = '#3B82F6',
  textColor = '#1F2937',
  bubbleBackground = '#F3F4F6'
}: SupportChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [visitorName, setVisitorName] = useState('');
  const [visitorEmail, setVisitorEmail] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [ticketId, setTicketId] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quickReplies, setQuickReplies] = useState<string[]>([
    "I need help with my account",
    "How do I reset my password?",
    "I found a bug",
    "I have a feature request",
    "I need technical support"
  ]);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [agentResponses] = useState<string[]>([
    "Thanks for reaching out! I'd be happy to help you with that.",
    "I understand. Let me look into that for you right away.",
    "That's a great question! Here's what I can tell you...",
    "I appreciate you bringing this to our attention.",
    "Could you provide a bit more detail so I can better assist you?",
    "I'm checking on that now. One moment please.",
    "Thanks for your patience. Here's what I found..."
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const supabase = createClient(supabaseUrl, supabaseKey);

  useEffect(() => {
    const existingSession = localStorage.getItem('support_chat_session_id');
    if (existingSession) {
      setSessionId(existingSession);
      loadTicket(existingSession);
    }
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const loadTicket = async (sid: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await supabase.rpc('set_session_id', { p_session_id: sid });

      const { data: ticketData, error: ticketError } = await supabase
        .rpc('get_or_create_visitor_ticket', {
          p_visitor_name: 'Visitor',
          p_visitor_email: null,
          p_session_id: sid
        });

      if (ticketError) throw ticketError;
      if (ticketData) {
        setTicketId(ticketData);
        await loadMessages(ticketData);
        subscribeToMessages(ticketData);
        subscribeToPresence();
        setIsInitialized(true);
      }
    } catch (error) {
      console.error('Error loading ticket:', error);
      setError('Failed to load chat. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (tid: string) => {
    try {
      const { data, error } = await supabase
        .from('ticket_messages')
        .select('*')
        .eq('ticket_id', tid)
        .order('created_at', { ascending: true });

      if (error) throw error;
      if (data) {
        setMessages(data);
        const unread = data.filter(m => m.sender_type === 'agent' && !m.read_at).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const subscribeToMessages = (tid: string) => {
    const channel = supabase
      .channel(`ticket_messages:${tid}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ticket_messages',
          filter: `ticket_id=eq.${tid}`
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages(prev => [...prev, newMessage]);
          if (newMessage.sender_type === 'agent' && !isOpen) {
            setUnreadCount(prev => prev + 1);
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to messages');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const subscribeToPresence = () => {
    const channel = supabase.channel('support_presence')
      .on('system', { event: 'postgres_changes' }, (payload: any) => {
        if (payload.event === 'SYNC') {
          const state = payload;
          const agents = Object.values(state).filter((u: any) => u.agent_online);
          setIsOnline(agents.length > 0);
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            online_at: new Date().toISOString(),
            visitor_id: sessionId
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const initializeChat = async () => {
    if (!visitorName.trim()) {
      setError('Please enter your name');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const newSessionId = crypto.randomUUID();
      localStorage.setItem('support_chat_session_id', newSessionId);
      setSessionId(newSessionId);

      await supabase.rpc('set_session_id', { p_session_id: newSessionId });

      const { data: ticketData, error: ticketError } = await supabase
        .rpc('get_or_create_visitor_ticket', {
          p_visitor_name: visitorName,
          p_visitor_email: visitorEmail || null,
          p_session_id: newSessionId
        });

      if (ticketError) throw ticketError;
      if (ticketData) {
        setTicketId(ticketData);
        await loadMessages(ticketData);
        subscribeToMessages(ticketData);
        subscribeToPresence();
        setIsInitialized(true);
      }
    } catch (error) {
      console.error('Error initializing chat:', error);
      setError('Failed to start chat. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (quickReply?: string) => {
    const messageContent = quickReply || inputMessage.trim();
    if (!messageContent || !ticketId) return;

    const tempId = crypto.randomUUID();
    const tempMessage: Message = {
      id: tempId,
      sender_type: 'visitor',
      sender_name: visitorName,
      content: messageContent,
      created_at: new Date().toISOString(),
      status: 'sending',
      reply_to: replyingTo || undefined
    };

    setMessages(prev => [...prev, tempMessage]);
    setInputMessage('');
    setReplyingTo(null);
    inputRef.current?.focus();

    try {
      const { data, error } = await supabase
        .from('ticket_messages')
        .insert({
          ticket_id: ticketId,
          sender_type: 'visitor',
          sender_name: visitorName,
          content: messageContent,
          reply_to: replyingTo || null
        })
        .select()
        .single();

      if (error) throw error;

      // Update message status to sent
      setMessages(prev => prev.map(m => 
        m.id === tempId ? { ...m, id: data.id, status: 'sent' } : m
      ));

      // Simulate agent typing and response for demo purposes
      if (isOnline) {
        setTimeout(() => {
          setIsTyping(true);
        }, 1000);

        setTimeout(() => {
          setIsTyping(false);
          const randomResponse = agentResponses[Math.floor(Math.random() * agentResponses.length)];
          const agentMessage: Message = {
            id: crypto.randomUUID(),
            sender_type: 'agent',
            sender_name: 'Support Agent',
            content: randomResponse,
            created_at: new Date().toISOString(),
            status: 'sent'
          };
          setMessages(prev => [...prev, agentMessage]);
        }, 3000 + Math.random() * 2000);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => prev.map(m => 
        m.id === tempId ? { ...m, status: 'failed' } : m
      ));
      setError('Failed to send message. Please try again.');
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

  const emojis = ['😀', '😊', '👍', '❤️', '🎉', '🔥', '✨', '💯', '🙏', '💪'];

  if (!isInitialized) {
    return (
      <div className="support-chat-widget">
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg shadow-primary/30 flex items-center justify-center z-[9999] hover:scale-110 transition-transform duration-300"
          style={{ backgroundColor: primaryColor }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <MessageCircle className="w-6 h-6 text-white" />
          {isOnline && (
            <div className="absolute bottom-1 right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
          )}
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
              {unreadCount}
            </Badge>
          )}
        </motion.button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed bottom-24 right-6 w-[400px] h-[520px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden z-[9998]"
            >
              <div className="p-6 flex items-center gap-4" style={{ backgroundColor: primaryColor }}>
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold text-lg">Support Chat</h3>
                  <p className="text-white/80 text-sm flex items-center gap-2">
                    {isOnline ? (
                      <>
                        <div className="w-2 h-2 bg-green-400 rounded-full" />
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
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white/20"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="flex-1 p-6 flex flex-col justify-center">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-4">
                    <User className="w-8 h-8 text-primary" />
                  </div>
                  <h4 className="text-lg font-semibold mb-2">Start a Conversation</h4>
                  <p className="text-muted-foreground text-sm">We're here to help. How can we assist you today?</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Name *</label>
                    <Input
                      value={visitorName}
                      onChange={(e) => setVisitorName(e.target.value)}
                      placeholder="Your name"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email (optional)</label>
                    <Input
                      type="email"
                      value={visitorEmail}
                      onChange={(e) => setVisitorEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full"
                    />
                  </div>
                  {error && (
                    <p className="text-red-500 text-sm">{error}</p>
                  )}
                  <Button
                    onClick={initializeChat}
                    disabled={!visitorName.trim() || isLoading}
                    className="w-full"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {isLoading ? 'Starting...' : 'Start Chat'}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="support-chat-widget">
      <motion.button
        onClick={() => {
          setIsOpen(!isOpen);
          if (isOpen) setUnreadCount(0);
        }}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg shadow-primary/30 flex items-center justify-center z-[9999] hover:scale-110 transition-transform duration-300"
        style={{ backgroundColor: primaryColor }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <MessageCircle className="w-6 h-6 text-white" />
        {isOnline && (
          <div className="absolute bottom-1 right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
        )}
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
            {unreadCount}
          </Badge>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "fixed bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden z-[9998]",
              isMinimized ? "bottom-6 right-24 w-80 h-14" : "bottom-24 right-6 w-[400px] h-[520px]"
            )}
          >
            <div className="p-4 flex items-center gap-3" style={{ backgroundColor: primaryColor }}>
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold">Support Chat</h3>
                <p className="text-white/80 text-xs flex items-center gap-2">
                  {isOnline ? (
                    <>
                      <div className="w-2 h-2 bg-green-400 rounded-full" />
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
              <div className="flex items-center gap-1">
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
            </div>

            {!isMinimized && (
              <>
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((message) => {
                      const replyToMessage = message.reply_to ? messages.find(m => m.id === message.reply_to) : null;
                      return (
                        <div
                          key={message.id}
                          className={cn(
                            "flex gap-3",
                            message.sender_type === 'visitor' ? 'flex-row-reverse' : 'flex-row'
                          )}
                        >
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className={cn(
                              message.sender_type === 'visitor' ? 'bg-primary text-white' : 'bg-muted'
                            )}>
                              {message.sender_type === 'visitor' ? (
                                <User className="w-4 h-4" />
                              ) : (
                                <Bot className="w-4 h-4" />
                              )}
                            </AvatarFallback>
                          </Avatar>
                          <div className={cn(
                            "flex flex-col gap-1 max-w-[75%]",
                            message.sender_type === 'visitor' ? 'items-end' : 'items-start'
                          )}>
                            {replyToMessage && (
                              <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                <MessageCircle className="w-3 h-3" />
                                Replying to: {replyToMessage.content.substring(0, 30)}...
                              </div>
                            )}
                            <div className={cn(
                              "px-4 py-2 rounded-2xl text-sm relative",
                              message.sender_type === 'visitor'
                                ? 'bg-primary text-white rounded-br-sm'
                                : 'bg-muted text-foreground rounded-bl-sm'
                            )}>
                              {message.content}
                              {message.status === 'failed' && (
                                <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                                  <X className="w-3 h-3 text-white" />
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {formatTime(message.created_at)}
                              {message.sender_type === 'visitor' && (
                                <>
                                  {message.status === 'sending' && (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  )}
                                  {message.status === 'sent' && (
                                    <Check className="w-3 h-3" />
                                  )}
                                  {message.status === 'delivered' && (
                                    <CheckCheck className="w-3 h-3" />
                                  )}
                                  {message.status === 'read' && (
                                    <CheckCheck className="w-3 h-3 text-blue-500" />
                                  )}
                                </>
                              )}
                              <button
                                onClick={() => setReplyingTo(message.id)}
                                className="hover:text-primary transition-colors"
                                title="Reply"
                              >
                                <MessageCircle className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {isTyping && (
                      <div className="flex gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-muted">
                            <Bot className="w-4 h-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                          <span>Agent is typing...</span>
                        </div>
                      </div>
                    )}
                    {error && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                        {error}
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                <Separator />

                <div className="p-4">
                  {replyingTo && (
                    <div className="mb-3 p-2 bg-muted/50 rounded-lg flex items-center justify-between">
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <MessageCircle className="w-3 h-3" />
                        Replying to message
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setReplyingTo(null)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                  
                  {messages.length === 0 && (
                    <div className="mb-3 flex flex-wrap gap-2">
                      {quickReplies.map((reply) => (
                        <Button
                          key={reply}
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            sendMessage(reply);
                          }}
                          className="text-xs h-8"
                        >
                          {reply}
                        </Button>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      >
                        <Smile className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Paperclip className="w-4 h-4" />
                      </Button>
                    </div>
                    <Input
                      ref={inputRef}
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      className="flex-1"
                    />
                    <Button
                      onClick={() => sendMessage()}
                      disabled={!inputMessage.trim()}
                      size="icon"
                      className="h-9 w-9"
                      style={{ backgroundColor: primaryColor }}
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
                        className="absolute bottom-16 left-4 bg-white border rounded-lg shadow-lg p-2 flex gap-1 flex-wrap"
                      >
                        {emojis.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => {
                              setInputMessage(prev => prev + emoji);
                              setShowEmojiPicker(false);
                            }}
                            className="text-2xl hover:bg-muted rounded p-1 transition-colors"
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
    </div>
  );
}
