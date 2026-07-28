import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Brain, Sparkles, FileText, Zap, MessageCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { getAIService, createAIContext, type AIContext, type AIResponse } from '@/lib/ai/advanced-ai-service';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

interface AIAssistantProps {
  content: string;
  onAction: (action: string, result: string) => void;
  onClose: () => void;
}

interface LocalAIResponse {
  action: string;
  result: string;
  loading: boolean;
  aiResponse?: AIResponse;
}

export function AIAssistant({ content, onAction, onClose }: AIAssistantProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [prompt, setPrompt] = useState('');
  const [responses, setResponses] = useState<LocalAIResponse[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const aiService = getAIService();
  const aiContextRef = useRef<AIContext | null>(null);

  // Initialize AI context on mount
  useEffect(() => {
    if (user?.id) {
      aiContextRef.current = createAIContext(user.id, `note-${Date.now()}`);
    }
  }, [user?.id]);

  const stripHtml = useCallback((html: string) => {
    // Sanitize HTML to prevent XSS
    const sanitized = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '')
      .replace(/javascript:/gi, '');
    
    const tmp = document.createElement('div');
    tmp.innerHTML = sanitized;
    return tmp.textContent || tmp.innerText || '';
  }, []);

  const generatePrompt = useCallback((action: string, noteContent: string) => {
    const cleanContent = stripHtml(noteContent).substring(0, 2000); // Limit content length

    switch (action) {
      case 'summarize':
        return `Please provide a concise summary of the following notes. Focus on key concepts and main ideas:\n\n${cleanContent}`;

      case 'keywords':
        return `Extract the most important keywords and concepts from these notes. Return them as a comma-separated list:\n\n${cleanContent}`;

      case 'diagram':
        return `Based on these notes, suggest a simple diagram structure that could help visualize the concepts. Describe the diagram elements and their relationships:\n\n${cleanContent}`;

      default:
        return `Analyze these notes and provide helpful insights:\n\n${cleanContent}`;
    }
  }, [stripHtml]);

  const callAdvancedAI = useCallback(async (promptText: string, action: string) => {
    if (!aiContextRef.current) {
      throw new Error('AI context not initialized');
    }

    try {
      const aiResponse = await aiService.generateResponse(promptText, aiContextRef.current);
      return aiResponse;
    } catch (error) {
      console.error('AI Service Error:', error);
      throw error;
    }
  }, [aiService]);

  const handleAction = useCallback(async (action: string) => {
    if (!content.trim()) {
      toast({
        title: "Content Required",
        description: "Please add some content to your note first before using AI features.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    // Add loading response
    const loadingResponse: LocalAIResponse = {
      action,
      result: '',
      loading: true
    };
    setResponses(prev => [...prev, loadingResponse]);

    try {
      const promptText = generatePrompt(action, content);
      const aiResponse = await callAdvancedAI(promptText, action);

      if (aiResponse) {
        // Update the loading response with the actual result
        setResponses(prev => prev.map((resp, index) =>
          index === prev.length - 1 ? { ...resp, result: aiResponse.content, loading: false, aiResponse } : resp
        ));

        // Auto-apply the result after a short delay
        setTimeout(() => {
          onAction(action, aiResponse.content);
        }, 1000);
      }
    } catch (error) {
      // Remove the loading response and show error
      setResponses(prev => prev.slice(0, -1));
      console.error('AI processing failed:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [content, generatePrompt, callAdvancedAI, onAction]);

  const clearResponses = useCallback(() => {
    setResponses([]);
  }, []);

  const quickActions = [
    {
      id: 'summarize',
      label: 'Summarize',
      description: 'Create a concise summary',
      icon: FileText,
      color: 'bg-blue-500'
    },
    {
      id: 'keywords',
      label: 'Extract Keywords',
      description: 'Get key concepts and terms',
      icon: Zap,
      color: 'bg-green-500'
    },
    {
      id: 'diagram',
      label: 'Suggest Diagram',
      description: 'Visual structure ideas',
      icon: Brain,
      color: 'bg-purple-500'
    },
    {
      id: 'analyze',
      label: 'Analyze',
      description: 'General insights and suggestions',
      icon: MessageCircle,
      color: 'bg-orange-500'
    }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative bg-background rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-3">
              <Brain className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-bold">AI Note Assistant</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Quick Actions */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickActions.map((action) => (
                  <Card
                    key={action.id}
                    className="cursor-pointer hover:shadow-md transition-all"
                    onClick={() => handleAction(action.id)}
                  >
                    <CardContent className="flex items-center gap-4 p-4">
                      <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center`}>
                        <action.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{action.label}</h4>
                        <p className="text-sm text-muted-foreground">{action.description}</p>
                      </div>
                      {isProcessing && responses.some(r => r.action === action.id && r.loading) && (
                        <div className="animate-spin">
                          <Sparkles className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Custom Prompt */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Custom Prompt</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Ask anything about your notes... (e.g., 'Explain this concept simply', 'Create practice questions', 'Find connections between ideas')"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[100px]"
                />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    {prompt.length}/500 characters
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearResponses}
                    >
                      Clear History
                    </Button>
                    <Button
                      onClick={() => handleAction('custom')}
                      disabled={!prompt.trim() || isProcessing}
                    >
                      Process
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Response History */}
            {responses.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Response History</h3>
                  <Badge variant="secondary">{responses.length} responses</Badge>
                </div>
                <div className="space-y-4">
                  {responses.map((response, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <Badge variant="outline" className="capitalize">
                              {response.action === 'custom' ? 'Custom' : response.action}
                            </Badge>
                            {response.loading ? (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <div className="animate-spin">
                                  <Sparkles className="w-3 h-3" />
                                </div>
                                Processing...
                              </div>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onAction(response.action, response.result)}
                              >
                                Apply to Note
                              </Button>
                            )}
                          </div>
                          <Separator className="mb-3" />
                          {response.loading ? (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <div className="animate-pulse bg-muted rounded w-full h-4" />
                            </div>
                          ) : (
                            <div className="prose prose-sm max-w-none">
                              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                {response.result}
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t bg-muted/30">
            <p className="text-xs text-muted-foreground text-center">
              AI Assistant uses local processing to analyze your notes. Results are based on the content provided.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
