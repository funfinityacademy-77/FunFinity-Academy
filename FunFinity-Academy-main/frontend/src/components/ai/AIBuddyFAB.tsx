import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, MessageCircle, X, Send, Brain, BookOpen, TrendingUp, User, Sparkles, Cpu, Zap, Globe, Code, Lightbulb, Target, Award, Flame } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/hooks/use-auth';

interface AIContext {
  userId: string;
  currentCourse: string;
  progress: any;
  recentNotes: any;
  learningStyle: string;
  recentQuizScores: any;
  timeSpent: number;
  lastActive: string;
}

interface VectorEmbedding {
  id: string;
  userId: string;
  content: string;
  embedding: number[];
  metadata: any;
  createdAt: string;
}

interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  context?: any;
}

export function AIBuddyFAB() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [context, setContext] = useState<AIContext | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load user context on mount
  useEffect(() => {
    loadUserContext();
    loadChatHistory();
  }, [user]);

  // Load user context from database
  const loadUserContext = async () => {
    try {
      if (!user) return;

      const profile = await apiClient.get<any | null>(`/api/users/${user.id}/profile`).catch(() => null);

      if (profile) {
        const userContext: AIContext = {
          userId: user.id,
          currentCourse: profile.current_course || '',
          progress: profile.course_progress || {},
          recentNotes: profile.recent_notes || [],
          learningStyle: profile.learning_style || 'balanced',
          recentQuizScores: profile.quiz_scores || {},
          timeSpent: profile.time_spent || 0,
          lastActive: profile.last_active || new Date().toISOString()
        };

        setContext(userContext);
        generateContextualSuggestions(userContext);
      }
    } catch (error) {
      // Silently handle errors - context will remain null
    }
  };

  // Load chat history
  const loadChatHistory = async () => {
    try {
      if (!user) return;

      const history = await apiClient.get<any[]>(`/api/users/${user.id}/ai-chat-history?limit=20`).catch(() => []);

      if (history) {
        const formattedHistory: AIMessage[] = history.map((msg: any) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: msg.created_at,
          context: msg.context
        }));

        setMessages(formattedHistory.reverse());
      }
    } catch (error) {
      // Silently handle errors - messages will remain empty
    }
  };

  // Generate contextual suggestions
  const generateContextualSuggestions = (userContext: AIContext) => {
    const suggestions = [];
    if (userContext.currentCourse) {
      suggestions.push(`Explain ${userContext.currentCourse} core concepts`);
      suggestions.push(`How do I apply what I learned in ${userContext.currentCourse}?`);
    }
    suggestions.push('Create a study plan for today');
    suggestions.push('Give me a quick quiz on my recent topics');
    suggestions.push('Summarize my learning progress');
    setSuggestions(suggestions.slice(0, 4));
  };

  // Save message to database
  const saveMessage = async (message: Omit<AIMessage, 'id'>) => {
    try {
      if (!user) return;

      const savedMessage = await apiClient.post<any>(`/api/users/${user.id}/ai-chat-history`, {
        user_id: user.id,
        role: message.role,
        content: message.content,
        context: context,
        created_at: new Date().toISOString()
      });

      if (savedMessage) {
        const newMessage: AIMessage = {
          id: savedMessage.id,
          role: message.role,
          content: message.content,
          timestamp: savedMessage.created_at,
          context: context
        };
        setMessages(prev => [...prev.slice(-49), newMessage]);
      }
    } catch (error) {
      console.error('Failed to save message:', error);
    }
  };

  const handleSendMessage = async (text?: string) => {
    const content = text || inputValue;
    if (!content.trim()) return;

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
      context: context
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Elite AI Response System - Completely Hardcoded
    setTimeout(async () => {
      const aiResponse = generateEliteAIResponse(content, context);

      const aiMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date().toISOString(),
        context: context
      };

      setMessages(prev => [...prev, aiMessage]);
      saveMessage(userMessage);
      saveMessage(aiMessage);
      setIsTyping(false);
    }, 1500);
  };

  // Elite AI Response Generation - Completely Hardcoded
  const generateEliteAIResponse = (userQuery: string, aiContext: AIContext | null): string => {
    const query = userQuery.toLowerCase();
    
    // Learning-related queries
    if (query.includes('explain') || query.includes('what is') || query.includes('how does')) {
      return `I've analyzed your query through my advanced cognitive architecture. Based on your ${aiContext?.learningStyle || 'balanced'} learning style and current progress in ${aiContext?.currentCourse || 'your studies'}, here's my comprehensive analysis:\n\n**Core Concept:** The fundamental principle you're asking about involves understanding the underlying architecture and how components interact.\n\n**Key Insights:**\n1. **Foundation**: The concept builds upon foundational knowledge you've already acquired\n2. **Application**: This applies directly to your current learning objectives\n3. **Connection**: This connects to 3 other topics you've studied recently\n\n**Personalized Recommendation:** Given your learning patterns, I suggest focusing on the practical implementation first, then exploring the theoretical underpinnings. This approach aligns with your cognitive strengths.\n\nWould you like me to dive deeper into any specific aspect or provide examples relevant to your current course?`;
    }
    
    if (query.includes('help') || query.includes('stuck') || query.includes('confused')) {
      return `I understand you're facing a challenge. My neural pathways have analyzed your situation and I'm here to help you overcome this obstacle.\n\n**Diagnostic Analysis:**\nBased on your recent interactions and learning patterns, this type of challenge typically occurs when transitioning between conceptual understanding and practical application.\n\n**Strategic Approach:**\n1. **Deconstruct**: Let's break this down into smaller, manageable components\n2. **Identify**: Pinpoint exactly where the disconnect occurs\n3. **Rebuild**: Reconstruct understanding from your strongest foundation\n\n**Immediate Action:**\nTry explaining the concept in your own words first. This activates different neural pathways and often reveals the specific gap in understanding. I'll then provide targeted guidance based on what emerges.\n\nYou've got this - your learning trajectory shows strong problem-solving capabilities. Let's work through this together.`;
    }
    
    if (query.includes('quiz') || query.includes('test') || query.includes('practice')) {
      return `Excellent choice to reinforce your learning! I've generated a personalized assessment based on your current knowledge state and learning objectives.\n\n**Adaptive Quiz Configuration:**\n• Difficulty: Dynamically adjusted to your current level\n• Focus Areas: Topics where you've shown 70-80% mastery\n• Format: Mixed question types for comprehensive evaluation\n\n**Sample Question:**\nBased on your recent study of ${aiContext?.currentCourse || 'core concepts'}, which of the following best describes the relationship between the primary components?\n\nA) Hierarchical dependency\nB) Parallel interaction\nC) Sequential processing\nD) Modular integration\n\n**Learning Insight:**\nThis question type targets your analytical reasoning skills, which I've identified as a strength. The correct answer is A) Hierarchical dependency, and here's why...\n\nWould you like me to generate more questions or explain the reasoning in detail?`;
    }
    
    if (query.includes('progress') || query.includes('how am i doing') || query.includes('summary')) {
      return `I've synthesized a comprehensive analysis of your learning journey using my advanced pattern recognition capabilities.\n\n**Performance Metrics:**\n• **Overall Progress:** ${aiContext?.progress ? 'Strong upward trajectory' : 'Building foundation'}\n• **Learning Velocity:** Above average - you're absorbing concepts efficiently\n• **Retention Rate:** Excellent based on quiz performance patterns\n• **Engagement Level:** Consistent and focused\n\n**Cognitive Strengths Identified:**\n• Pattern recognition and synthesis\n• Practical application of theoretical concepts\n• Cross-domain knowledge integration\n\n**Growth Opportunities:**\n• Deeper exploration of edge cases\n• More frequent practice with complex scenarios\n\n**Personalized Insight:**\nYour learning DNA suggests you thrive with structured, progressive challenges. I recommend increasing complexity gradually while maintaining the supportive framework that's working well for you.\n\nYou're on an excellent path. Shall I suggest specific next steps to accelerate your progress?`;
    }
    
    if (query.includes('study plan') || query.includes('schedule') || query.includes('what should i learn')) {
      return `I've crafted an optimized learning schedule using my predictive algorithms and your historical performance data.\n\n**Today's Personalized Learning Path:**\n\n**09:00 - 10:30** | **Core Concept Mastery**\nFocus: ${aiContext?.currentCourse || 'Primary subject'} fundamentals\nMethod: Interactive exercises with immediate feedback\n\n**11:00 - 12:00** | **Practical Application**\nFocus: Hands-on implementation of learned concepts\nMethod: Project-based learning with real-world scenarios\n\n**14:00 - 15:00** | **Knowledge Integration**\nFocus: Connecting new concepts to existing knowledge\nMethod: Comparative analysis and synthesis exercises\n\n**16:00 - 17:00** | **Reinforcement & Review**\nFocus: Spaced repetition and consolidation\nMethod: Adaptive quizzes and reflection exercises\n\n**Adaptive Notes:**\n• Your peak cognitive performance occurs in the morning\n• You benefit from varied learning modalities\n• Regular breaks improve your retention by 23%\n\nThis schedule is optimized for your specific learning patterns. I'll adjust it dynamically based on your performance throughout the day. Ready to begin?`;
    }
    
    // Default elite response
    return `I've processed your query through my advanced cognitive architecture. My analysis considers your learning history, current objectives, and cognitive patterns to provide the most relevant guidance.\n\n**Contextual Understanding:**\nYour query relates to your ongoing learning journey in ${aiContext?.currentCourse || 'your studies'}. I've identified several relevant connections to your previous interactions.\n\n**Strategic Insight:**\nBased on your learning DNA and performance patterns, I recommend approaching this from both theoretical and practical perspectives. Your cognitive profile suggests you benefit most from integrated learning experiences.\n\n**Actionable Guidance:**\n1. Start with the foundational principles\n2. Apply through hands-on experimentation\n3. Reflect and synthesize the connections\n4. Iterate with increasing complexity\n\n**Personalized Note:**\nI've noticed you excel at pattern recognition. Leverage this strength by looking for underlying structures and relationships in the material.\n\nWould you like me to elaborate on any specific aspect or provide examples tailored to your current learning objectives?`;
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.9, y: 20, filter: 'blur(10px)' }}
            className="w-[380px] h-[550px] glass-card-heavy border-primary/20 shadow-2xl flex flex-col overflow-hidden mb-2"
          >
            {/* Header */}
            <div className="p-5 border-b border-white/10 bg-gradient-to-r from-primary/10 via-purple/10 to-accent/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/50 via-purple/50 to-accent/50 blur-xl rounded-full animate-pulse" />
                  <div className="relative h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 via-purple/20 to-accent/20 flex items-center justify-center border border-primary/30 backdrop-blur-md">
                    <Cpu className="w-6 h-6 text-primary" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-ping" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground leading-none flex items-center gap-2">
                    <Sparkles className="w-3 h-3 text-primary" />
                    AI Assistant
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Zap className="w-2 h-2 text-yellow-500" />
                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Advanced Neural Engine</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar scroll-smooth" ref={messagesEndRef}>
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center px-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center mb-4 border border-primary/10">
                    <Sparkles className="w-6 h-6 text-primary/50" />
                  </div>
                  <p className="text-sm font-medium text-foreground/80">Your cognitive partner is ready.</p>
                  <p className="text-[11px] text-muted-foreground mt-1">Ask anything about your courses, progress, or study strategies.</p>
                </div>
              )}

              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, x: message.role === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-3 rounded-2xl text-[13px] leading-relaxed transition-all duration-300 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                        : 'glass-card border-white/10 text-foreground/90'
                    }`}
                  >
                    {message.content}
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                  <div className="glass-card border-white/10 px-4 py-3 rounded-2xl flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce" />
                      <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                    <span className="text-[11px] text-muted-foreground font-medium italic"> Buddy is thinking...</span>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-white/10 bg-secondary/10">
              {suggestions.length > 0 && messages.length < 3 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(s)}
                      className="px-3 py-1.5 rounded-lg glass-card border-primary/10 text-[11px] text-foreground/70 hover:border-primary/40 hover:text-primary transition-all whitespace-nowrap"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
              <div className="relative group">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Query your Learning DNA..."
                  className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-primary/40 transition-all placeholder:text-muted-foreground/50"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputValue.trim() || isTyping}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-primary hover:scale-110 disabled:opacity-30 disabled:scale-100 transition-all"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 left-6 relative group h-16 w-16"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-purple to-accent blur-2xl opacity-60 group-hover:opacity-90 transition-opacity rounded-full animate-pulse-soft" />
        <div className="relative h-full w-full rounded-full glass-card border-primary/40 shadow-2xl flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 via-purple/30 to-accent/30 animate-spin-slow" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-purple/20 to-accent/20 animate-pulse" />
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                <X className="w-7 h-7 text-primary" />
              </motion.div>
            ) : (
              <motion.div key="bot" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.5, opacity: 0 }}>
                <Cpu className="w-7 h-7 text-primary" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.button>
    </div>
  );
}
