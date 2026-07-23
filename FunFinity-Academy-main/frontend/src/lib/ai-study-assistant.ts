// Advanced AI Study Assistant
// This module provides intelligent study assistance using the advanced AI service

import { getAIService, createAIContext, type AIContext, type AIResponse } from './ai/advanced-ai-service';

export type AssistantMode = 'chat' | 'quiz' | 'summarize';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

export interface StudyPreferences {
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  pace: 'slow' | 'moderate' | 'fast';
  topics: string[];
  goals: string[];
}

export function buildPersonalizedPrompt(options: {
  input: string;
  preferences: StudyPreferences;
  extraInstructions?: string;
}): string {
  const { input, preferences, extraInstructions } = options;
  
  let personalizedPrompt = input;
  
  // Add learning style instructions
  const styleInstructions: Record<string, string> = {
    visual: 'Use visual descriptions, diagrams, and spatial examples.',
    auditory: 'Use analogies, stories, and verbal explanations.',
    kinesthetic: 'Include hands-on examples and practical applications.',
    reading: 'Provide detailed text explanations and comprehensive notes.'
  };
  
  personalizedPrompt += `\n\nLearning Style: ${styleInstructions[preferences.learningStyle]}`;
  
  // Add difficulty level
  const difficultyInstructions: Record<string, string> = {
    beginner: 'Explain from first principles. Avoid jargon.',
    intermediate: 'Assume some foundational knowledge. Build on existing concepts.',
    advanced: 'Use technical terminology. Dive deep into nuances.'
  };
  
  personalizedPrompt += `\n\nDifficulty: ${difficultyInstructions[preferences.difficulty]}`;
  
  // Add pace
  const paceInstructions: Record<string, string> = {
    slow: 'Take time to explain each step thoroughly.',
    moderate: 'Balance depth with efficiency.',
    fast: 'Get straight to the key points and insights.'
  };
  
  personalizedPrompt += `\n\nPace: ${paceInstructions[preferences.pace]}`;
  
  // Add topics context
  if (preferences.topics.length) {
    personalizedPrompt += `\n\nRelevant Topics: ${preferences.topics.join(', ')}`;
  }
  
  // Add goals
  if (preferences.goals.length) {
    personalizedPrompt += `\n\nLearning Goals: ${preferences.goals.join(', ')}`;
  }
  
  // Add extra instructions if provided
  if (extraInstructions) {
    personalizedPrompt += `\n\nAdditional Instructions: ${extraInstructions}`;
  }
  
  return personalizedPrompt;
}

export async function streamStudyAssistant(options: {
  type: AssistantMode;
  messages: ChatMessage[];
  onDelta: (chunk: string) => void;
  onDone: () => void;
  onError: (message: string) => void;
  userId?: string;
  preferences?: StudyPreferences;
}): Promise<void> {
  try {
    const aiService = getAIService();
    
    // Create AI context
    const context = createAIContext(
      options.userId || 'anonymous',
      `study-${Date.now()}`
    );
    
    // Apply preferences if provided
    if (options.preferences) {
      context.preferences = {
        learningStyle: options.preferences.learningStyle,
        pace: options.preferences.pace,
        depth: options.preferences.difficulty === 'beginner' ? 'overview' : 
               options.preferences.difficulty === 'intermediate' ? 'detailed' : 'expert'
      };
      context.difficulty = options.preferences.difficulty;
      context.goals = options.preferences.goals;
    }
    
    // Build prompt based on mode
    let prompt = '';
    switch (options.type) {
      case 'chat':
        prompt = options.messages.map(m => `${m.role}: ${m.content}`).join('\n');
        break;
      case 'quiz':
        prompt = `Generate quiz questions based on this content:\n\n${options.messages.map(m => m.content).join('\n')}`;
        break;
      case 'summarize':
        prompt = `Summarize this content:\n\n${options.messages.map(m => m.content).join('\n')}`;
        break;
    }
    
    // Get AI response
    const response: AIResponse = await aiService.generateResponse(prompt, context);
    
    // Stream the response
    const content = response.content;
    for (let i = 0; i < content.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 10));
      options.onDelta(content[i]);
    }
    
    options.onDone();
  } catch (error) {
    console.error('AI Study Assistant Error:', error);
    options.onError('Failed to generate AI response. Please try again.');
  }
}

// Export advanced AI service for direct use
export { getAIService, createAIContext, type AIContext, type AIResponse } from './ai/advanced-ai-service';
