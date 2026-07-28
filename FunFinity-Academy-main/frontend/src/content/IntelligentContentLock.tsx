// Intelligent Content Lock System for FunFinity Academy
// AP-level rigor with zero distractions
// Surgical focus on AP Physics 1 and AP Precalculus only

import React, { createContext, useContext, ReactNode, useEffect, useState, useCallback } from 'react';
import { dbService } from '@/services/database-service';

// Content filtering rules
interface ContentFilterRule {
  id: string;
  name: string;
  description: string;
  category: 'subject' | 'difficulty' | 'topic' | 'content-type' | 'quality';
  rule: (content: any) => boolean;
  isActive: boolean;
  priority: number;
}

// Content validation result
interface ContentValidation {
  isValid: boolean;
  violations: Array<{
    type: string;
    message: string;
    severity: 'warning' | 'error' | 'critical';
  }>;
  score: number; // 0-100 content quality score
  recommendations: string[];
}

// Content lock context
interface ContentLockContextType {
  isLocked: boolean;
  validationRules: ContentFilterRule[];
  currentValidation: ContentValidation | null;
  validateContent: (content: any) => Promise<ContentValidation>;
  addFilterRule: (rule: ContentFilterRule) => void;
  removeFilterRule: (ruleId: string) => void;
  toggleRule: (ruleId: string) => void;
  getContentStats: () => Promise<any>;
}

const ContentLockContext = createContext<ContentLockContextType | null>(null);

// Intelligent Content Lock Manager
export class IntelligentContentLockManager {
  private static instance: IntelligentContentLockManager;
  private filterRules: Map<string, ContentFilterRule> = new Map();
  private isLocked = true;
  private validationCache: Map<string, ContentValidation> = new Map();

  private constructor() {
    this.initializeFilterRules();
  }

  public static getInstance(): IntelligentContentLockManager {
    if (!IntelligentContentLockManager.instance) {
      IntelligentContentLockManager.instance = new IntelligentContentLockManager();
    }
    return IntelligentContentLockManager.instance;
  }

  // Initialize AP-focused filter rules
  private initializeFilterRules(): void {
    const rules: ContentFilterRule[] = [
      // Subject focus rules
      {
        id: 'ap-physics-only',
        name: 'AP Physics 1 Only',
        description: 'Content must be AP Physics 1 curriculum aligned',
        category: 'subject',
        rule: (content) => {
          return content.subjectCode === 'ap-physics-1' ||
            (content.topicTags && content.topicTags.some((tag: string) =>
              ['kinematics', 'dynamics', 'energy', 'momentum', 'waves', 'electricity', 'magnetism'].includes(tag)
            ));
        },
        isActive: true,
        priority: 100,
      },
      {
        id: 'ap-precalculus-only',
        name: 'AP Precalculus Only',
        description: 'Content must be AP Precalculus curriculum aligned',
        category: 'subject',
        rule: (content) => {
          return content.subjectCode === 'ap-precalculus' ||
            (content.topicTags && content.topicTags.some((tag: string) =>
              ['functions', 'trigonometry', 'limits', 'derivatives', 'integrals', 'algebra'].includes(tag)
            ));
        },
        isActive: true,
        priority: 100,
      },
      {
        id: 'no-off-topic-content',
        name: 'No Off-Topic Content',
        description: 'Exclude content outside AP curriculum',
        category: 'subject',
        rule: (content) => {
          const offTopicKeywords = ['chemistry', 'biology', 'history', 'geography', 'art', 'music', 'literature'];
          const contentText = JSON.stringify(content).toLowerCase();
          return !offTopicKeywords.some(keyword => contentText.includes(keyword));
        },
        isActive: true,
        priority: 95,
      },

      // Difficulty rules
      {
        id: 'appropriate-difficulty',
        name: 'AP-Level Difficulty',
        description: 'Content must match AP-level difficulty',
        category: 'difficulty',
        rule: (content) => {
          const difficulty = content.difficultyLevel || 1;
          return difficulty >= 2 && difficulty <= 5; // Medium to Advanced
        },
        isActive: true,
        priority: 90,
      },
      {
        id: 'no-simplified-content',
        name: 'No Simplified Content',
        description: 'Content must not be overly simplified',
        category: 'difficulty',
        rule: (content) => {
          const simplifiedIndicators = ['easy', 'simple', 'basic', 'beginner'];
          const contentText = JSON.stringify(content).toLowerCase();
          return !simplifiedIndicators.some(indicator => contentText.includes(indicator));
        },
        isActive: true,
        priority: 85,
      },

      // Topic specificity rules
      {
        id: 'specific-topics-only',
        name: 'Specific AP Topics Only',
        description: 'Content must cover specific AP topics',
        category: 'topic',
        rule: (content) => {
          const apPhysicsTopics = ['newton-laws', 'kinematics', 'work-energy', 'momentum', 'oscillations', 'waves'];
          const apPrecalcTopics = ['polynomial-functions', 'rational-functions', 'exponential-logarithmic', 'trigonometric', 'limits-continuity', 'derivatives'];

          const hasValidTopic = content.topicTags && content.topicTags.some((tag: string) =>
            apPhysicsTopics.includes(tag) || apPrecalcTopics.includes(tag)
          );

          return hasValidTopic || content.subjectCode === 'ap-physics-1' || content.subjectCode === 'ap-precalculus';
        },
        isActive: true,
        priority: 80,
      },

      // Content quality rules
      {
        id: 'minimum-content-length',
        name: 'Minimum Content Length',
        description: 'Content must have sufficient depth',
        category: 'quality',
        rule: (content) => {
          const contentText = JSON.stringify(content);
          return contentText.length > 500; // Minimum 500 characters
        },
        isActive: true,
        priority: 70,
      },
      {
        id: 'mathematical-rigor',
        name: 'Mathematical Rigor',
        description: 'Content must include mathematical rigor',
        category: 'quality',
        rule: (content) => {
          const mathIndicators = ['equation', 'formula', 'derivation', 'proof', 'theorem', 'calculation'];
          const contentText = JSON.stringify(content).toLowerCase();
          return mathIndicators.some(indicator => contentText.includes(indicator));
        },
        isActive: true,
        priority: 75,
      },
      {
        id: 'no-distracting-elements',
        name: 'No Distracting Elements',
        description: 'Content must be focused and non-distracting',
        category: 'quality',
        rule: (content) => {
          const distractingElements = ['game', 'fun', 'entertainment', 'social', 'media', 'celebrity'];
          const contentText = JSON.stringify(content).toLowerCase();
          return !distractingElements.some(element => contentText.includes(element));
        },
        isActive: true,
        priority: 88,
      },

      // Content type rules
      {
        id: 'educational-content-only',
        name: 'Educational Content Only',
        description: 'Content must be purely educational',
        category: 'content-type',
        rule: (content) => {
          const educationalTypes = ['video', 'reading', 'interactive', 'quiz', 'lab', 'problem_set', 'simulation'];
          return educationalTypes.includes(content.lessonType);
        },
        isActive: true,
        priority: 92,
      },
      {
        id: 'no-entertainment-content',
        name: 'No Entertainment Content',
        description: 'Exclude entertainment-focused content',
        category: 'content-type',
        rule: (content) => {
          const entertainmentKeywords = ['fun', 'game', 'play', 'entertainment', 'recreation'];
          const contentText = JSON.stringify(content).toLowerCase();
          return !entertainmentKeywords.some(keyword => contentText.includes(keyword));
        },
        isActive: true,
        priority: 87,
      },
    ];

    rules.forEach(rule => {
      this.filterRules.set(rule.id, rule);
    });
  }

  // Validate content against all active rules
  async validateContent(content: any): Promise<ContentValidation> {
    const contentKey = JSON.stringify(content);

    // Check cache first
    if (this.validationCache.has(contentKey)) {
      return this.validationCache.get(contentKey)!;
    }

    const violations: Array<{
      type: string;
      message: string;
      severity: 'warning' | 'error' | 'critical';
    }> = [];
    let score = 100;

    // Apply all active filter rules
    const activeRules = Array.from(this.filterRules.values())
      .filter(rule => rule.isActive)
      .sort((a, b) => b.priority - a.priority);

    for (const rule of activeRules) {
      try {
        const result = rule.rule(content);
        if (!result) {
          violations.push({
            type: rule.category,
            message: `Failed ${rule.name}: ${rule.description}`,
            severity: rule.priority >= 90 ? 'critical' : rule.priority >= 80 ? 'error' : 'warning',
          });

          // Reduce score based on rule priority
          score -= Math.floor(rule.priority / 10);
        }
      } catch (error) {
        violations.push({
          type: 'system',
          message: `Error applying rule ${rule.name}: ${(error as Error).message}`,
          severity: 'error',
        });
        score -= 10;
      }
    }

    // Generate recommendations
    const recommendations = this.generateRecommendations(violations, content);

    const validation: ContentValidation = {
      isValid: violations.length === 0,
      violations,
      score: Math.max(0, score),
      recommendations,
    };

    // Cache result
    this.validationCache.set(contentKey, validation);

    return validation;
  }

  // Generate recommendations based on violations
  private generateRecommendations(violations: any[], content: any): string[] {
    const recommendations: string[] = [];

    if (violations.some(v => v.type === 'subject')) {
      recommendations.push('Ensure content aligns with AP Physics 1 or AP Precalculus curriculum');
      recommendations.push('Remove off-topic content and focus on AP-level material');
    }

    if (violations.some(v => v.type === 'difficulty')) {
      recommendations.push('Adjust content difficulty to match AP-level expectations');
      recommendations.push('Include more challenging problems and concepts');
    }

    if (violations.some(v => v.type === 'quality')) {
      recommendations.push('Enhance content depth and mathematical rigor');
      recommendations.push('Add more detailed explanations and examples');
    }

    if (violations.some(v => v.type === 'content-type')) {
      recommendations.push('Focus on educational content types');
      recommendations.push('Remove entertainment or recreational elements');
    }

    if (recommendations.length === 0) {
      recommendations.push('Content meets all AP-level standards');
    }

    return recommendations;
  }

  // Add filter rule
  addFilterRule(rule: ContentFilterRule): void {
    this.filterRules.set(rule.id, rule);
    // Clear cache when rules change
    this.validationCache.clear();
  }

  // Remove filter rule
  removeFilterRule(ruleId: string): void {
    this.filterRules.delete(ruleId);
    this.validationCache.clear();
  }

  // Toggle rule active status
  toggleRule(ruleId: string): void {
    const rule = this.filterRules.get(ruleId);
    if (rule) {
      rule.isActive = !rule.isActive;
      this.validationCache.clear();
    }
  }

  // Get content statistics
  async getContentStats(): Promise<{
    totalRules: number;
    activeRules: number;
    lockedContent: number;
    validatedContent: number;
    averageScore: number;
    topViolations: Array<{ type: string; count: number }>;
  }> {
    const activeRules = Array.from(this.filterRules.values()).filter(rule => rule.isActive);

    // This would analyze actual content in the database
    // For now, return mock statistics
    return {
      totalRules: this.filterRules.size,
      activeRules: activeRules.length,
      lockedContent: 0, // Would be calculated from database
      validatedContent: 0, // Would be calculated from database
      averageScore: 85, // Would be calculated from validations
      topViolations: [
        { type: 'subject', count: 0 },
        { type: 'difficulty', count: 0 },
        { type: 'quality', count: 0 },
      ],
    };
  }

  // Get all filter rules
  getFilterRules(): ContentFilterRule[] {
    return Array.from(this.filterRules.values());
  }

  // Check if content lock is active
  isContentLocked(): boolean {
    return this.isLocked;
  }

  // Toggle content lock
  toggleContentLock(): void {
    this.isLocked = !this.isLocked;
  }

  // Clear validation cache
  clearCache(): void {
    this.validationCache.clear();
  }
}

// Intelligent Content Lock Provider
export function IntelligentContentLockProvider({ children }: { children: ReactNode }) {
  const lockManager = IntelligentContentLockManager.getInstance();
  const [isLocked, setIsLocked] = useState(lockManager.isContentLocked());
  const [validationRules, setValidationRules] = useState(lockManager.getFilterRules());
  const [currentValidation, setCurrentValidation] = useState<ContentValidation | null>(null);

  useEffect(() => {
    // Update state periodically
    const interval = setInterval(() => {
      setIsLocked(lockManager.isContentLocked());
      setValidationRules(lockManager.getFilterRules());
    }, 1000);

    return () => clearInterval(interval);
  }, [lockManager]);

  const validateContent = useCallback(async (content: any) => {
    const validation = await lockManager.validateContent(content);
    setCurrentValidation(validation);
    return validation;
  }, [lockManager]);

  const addFilterRule = useCallback((rule: ContentFilterRule) => {
    lockManager.addFilterRule(rule);
    setValidationRules(lockManager.getFilterRules());
  }, [lockManager]);

  const removeFilterRule = useCallback((ruleId: string) => {
    lockManager.removeFilterRule(ruleId);
    setValidationRules(lockManager.getFilterRules());
  }, [lockManager]);

  const toggleRule = useCallback((ruleId: string) => {
    lockManager.toggleRule(ruleId);
    setValidationRules(lockManager.getFilterRules());
  }, [lockManager]);

  const getContentStats = useCallback(async () => {
    return await lockManager.getContentStats();
  }, [lockManager]);

  const contextValue: ContentLockContextType = {
    isLocked,
    validationRules,
    currentValidation,
    validateContent,
    addFilterRule,
    removeFilterRule,
    toggleRule,
    getContentStats,
  };

  return (
    <ContentLockContext.Provider value={contextValue}>
      {children}
    </ContentLockContext.Provider>
  );
}

// Hook to use intelligent content lock
export function useIntelligentContentLock() {
  const context = useContext(ContentLockContext);
  if (!context) {
    throw new Error('useIntelligentContentLock must be used within IntelligentContentLockProvider');
  }
  return context;
}

// Hook for content validation
export function useContentValidation(content: any) {
  const { validateContent } = useIntelligentContentLock();
  const [validation, setValidation] = useState<ContentValidation | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    const validate = async () => {
      if (content) {
        setIsValidating(true);
        const result = await validateContent(content);
        setValidation(result);
        setIsValidating(false);
      }
    };

    validate();
  }, [content, validateContent]);

  return { validation, isValidating };
}

// Export singleton instance
export const intelligentContentLock = IntelligentContentLockManager.getInstance();

// Export types
export type { ContentFilterRule, ContentValidation, ContentLockContextType };
