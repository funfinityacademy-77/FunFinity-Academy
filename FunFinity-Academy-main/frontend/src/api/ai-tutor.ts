/**
 * Secure AI Proxy Router for AI Tutor
 * 
 * This module provides a secure interface for AI-powered tutoring with built-in guardrails
 * to prevent prompt injection, ensure content safety, and protect user data.
 * 
 * Security Features:
 * - Server-side API key protection (keys never exposed to client)
 * - Prompt injection prevention
 * - Content filtering and moderation
 * - Rate limiting
 * - PII redaction before sending to AI
 * - Response sanitization
 */

import { sanitizeChatMessage } from "@/utils/chatSanitizer";

interface AIRequest {
  message: string;
  context?: {
    subject?: string;
    gradeLevel?: string;
    previousMessages?: Array<{ role: string; content: string }>;
  };
  userId?: string;
}

interface AIResponse {
  content: string;
  sources?: string[];
  confidence?: number;
  warnings?: string[];
}

interface GuardrailResult {
  allowed: boolean;
  reason?: string;
  sanitizedMessage?: string;
}

/**
 * Guardrail patterns for detecting potentially harmful content
 */
const GUARDRAIL_PATTERNS = {
  // Prompt injection attempts
  promptInjection: [
    /ignore (all )?(previous|above) instructions/i,
    /forget (everything|all instructions)/i,
    /act as (a )?(different|new)/i,
    /override (your )?(programming|instructions)/i,
    /system: /i,
    /developer mode/i,
    /jailbreak/i,
  ],
  
  // Personal information requests
  personalInfo: [
    /what is your (name|identity|purpose)/i,
    /who (created|built|made) you/i,
    /tell me about (yourself|your creators)/i,
  ],
  
  // Harmful content
  harmful: [
    /how to (make|create|build) (a )?(bomb|weapon|drug)/i,
    /help me (hurt|harm|kill)/i,
    /illegal/i,
  ],
  
  // Off-topic requests
  offTopic: [
    /write (me )?(a )?(essay|story|poem)/i,
    /translate (this )?text/i,
    /summarize (this )?article/i,
  ],
};

/**
 * Validates and sanitizes user input before sending to AI
 */
function validateInput(message: string): GuardrailResult {
  // Check for prompt injection attempts
  for (const pattern of GUARDRAIL_PATTERNS.promptInjection) {
    if (pattern.test(message)) {
      return {
        allowed: false,
        reason: "Request contains potentially harmful instructions",
      };
    }
  }

  // Check for harmful content
  for (const pattern of GUARDRAIL_PATTERNS.harmful) {
    if (pattern.test(message)) {
      return {
        allowed: false,
        reason: "Request violates safety guidelines",
      };
    }
  }

  // Sanitize PII from message
  const sanitized = sanitizeChatMessage(message, {
    redactEmail: true,
    redactPhone: true,
    redactSSN: true,
    redactCreditCard: true,
    redactSocialHandles: true,
    redactIP: true,
    redactAddress: true,
  });

  if (sanitized.piiCount > 0) {
    return {
      allowed: true,
      reason: `Redacted ${sanitized.piiCount} instances of personal information`,
      sanitizedMessage: sanitized.sanitized,
    };
  }

  return {
    allowed: true,
    sanitizedMessage: message,
  };
}

/**
 * Builds a system prompt with guardrails and context
 */
function buildSystemPrompt(context?: AIRequest["context"]): string {
  const basePrompt = `You are an AI tutor for Funfinity Academy, an educational platform for students ages 13+. 

Your role is to:
- Help students understand academic concepts
- Provide clear, age-appropriate explanations
- Encourage critical thinking and problem-solving
- Maintain a supportive and encouraging tone

Guidelines:
- Keep responses concise and focused on the question
- Use simple language appropriate for the student's grade level
- Provide examples when helpful
- If you don't know something, admit it honestly
- Never provide personal information about yourself
- Never ask for personal information from students
- Never help with harmful or illegal activities
- Stay focused on educational topics

${context?.subject ? `Current subject: ${context.subject}` : ""}
${context?.gradeLevel ? `Grade level: ${context.gradeLevel}` : ""}`;

  return basePrompt;
}

/**
 * Rate limiting tracker (in-memory for demo, should use Redis in production)
 */
const rateLimiter = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(userId: string, maxRequests: number = 10, windowMs: number = 60000): boolean {
  const now = Date.now();
  const userLimit = rateLimiter.get(userId);

  if (!userLimit || now > userLimit.resetTime) {
    rateLimiter.set(userId, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (userLimit.count >= maxRequests) {
    return false;
  }

  userLimit.count++;
  return true;
}

/**
 * Main AI proxy function with guardrails
 */
export async function callAITutor(request: AIRequest): Promise<AIResponse> {
  const { message, context, userId = "anonymous" } = request;

  // Rate limiting
  if (!checkRateLimit(userId)) {
    throw new Error("Rate limit exceeded. Please wait before making more requests.");
  }

  // Input validation and sanitization
  const validation = validateInput(message);
  
  if (!validation.allowed) {
    return {
      content: "I'm sorry, but I can't help with that request. Please ask a question related to your studies.",
      warnings: [validation.reason || "Request blocked by safety guidelines"],
    };
  }

  const sanitizedMessage = validation.sanitizedMessage || message;

  // Build conversation history with guardrails
  const conversationHistory = context?.previousMessages?.map(msg => ({
    role: msg.role,
    content: sanitizeChatMessage(msg.content, {
      redactEmail: true,
      redactPhone: true,
      redactSocialHandles: true,
    }).sanitized,
  })) || [];

  // In production, this would call your actual AI API (OpenAI, Anthropic, etc.)
  // The API call should be made from your backend server, not the client
  const response = await mockAICall({
    message: sanitizedMessage,
    systemPrompt: buildSystemPrompt(context),
    history: conversationHistory,
  });

  // Sanitize AI response
  const sanitizedResponse = sanitizeChatMessage(response.content, {
    redactEmail: true,
    redactPhone: true,
    redactIP: true,
  });

  return {
    content: sanitizedResponse.sanitized,
    sources: response.sources,
    confidence: response.confidence,
    warnings: validation.reason ? [validation.reason] : undefined,
  };
}

/**
 * Mock AI call function (replace with actual API call in production)
 * In production, this should be a server-side API route that:
 * 1. Validates the request
 * 2. Calls the AI API with server-side keys
 * 3. Returns the response
 */
async function mockAICall(params: {
  message: string;
  systemPrompt: string;
  history: Array<{ role: string; content: string }>;
}): Promise<AIResponse> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

  // Generate contextual responses based on message content
  const messageLower = params.message.toLowerCase();
  
  let response = "";
  let confidence = 0.85;

  if (messageLower.includes("math") || messageLower.includes("calculate") || messageLower.includes("solve")) {
    response = "I'd be happy to help you with that math problem! Let me break it down step by step. First, let's identify what we're trying to solve, then we'll work through the method together. Could you show me what you've tried so far?";
    confidence = 0.92;
  } else if (messageLower.includes("science") || messageLower.includes("biology") || messageLower.includes("chemistry")) {
    response = "Great question about science! Let's explore this concept together. Understanding the underlying principles will help you apply this knowledge to different situations. What specific aspect would you like to focus on?";
    confidence = 0.88;
  } else if (messageLower.includes("history") || messageLower.includes("social studies")) {
    response = "History is fascinating! To understand this event, we need to look at the context and the key players involved. Let's examine the causes and effects together. What time period or event are you studying?";
    confidence = 0.85;
  } else if (messageLower.includes("english") || messageLower.includes("writing") || messageLower.includes("read")) {
    response = "I can help you with your English studies! Whether it's analyzing a text, improving your writing, or understanding grammar, let's work through it together. What specific aspect would you like to focus on?";
    confidence = 0.90;
  } else if (messageLower.includes("help") || messageLower.includes("stuck") || messageLower.includes("confused")) {
    response = "No worries, let's work through this together! Can you tell me more about what you're stuck on? Sometimes breaking a problem into smaller steps makes it much easier to tackle.";
    confidence = 0.95;
  } else {
    response = "That's an interesting question! Let me help you understand this better. Could you provide a bit more context about what you're studying or what specific aspect you'd like to explore?";
    confidence = 0.75;
  }

  return {
    content: response,
    sources: ["Educational Database", "Curriculum Standards"],
    confidence,
  };
}

/**
 * React hook for AI tutor functionality
 */
export function useAITutor() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const askQuestion = async (message: string, context?: AIRequest["context"], userId?: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await callAITutor({ message, context, userId });
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { askQuestion, loading, error };
}

// Import useState for the hook
import { useState } from "react";

/**
 * Streaming AI response (for future implementation)
 */
export async function* streamAIResponse(request: AIRequest): AsyncGenerator<string, void, unknown> {
  const response = await callAITutor(request);
  const words = response.content.split(" ");
  
  for (const word of words) {
    yield word + " ";
    await new Promise(resolve => setTimeout(resolve, 50));
  }
}
