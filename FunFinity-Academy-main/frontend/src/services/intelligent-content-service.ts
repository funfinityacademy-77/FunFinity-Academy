// Intelligent Content Delivery System for FunFinity Academy
// Dynamically adjusts content based on difficulty_level and topic_tags
// AP Physics 1 & AP Precalculus focused with adaptive learning

import { dbService } from './database-service';
import { latexService } from './latex-rendering-service';

// Content intelligence configuration
interface ContentIntelligenceConfig {
  adaptiveThreshold: number; // Score threshold for adaptation
  difficultyAdjustment: number; // How much to adjust difficulty
  topicWeighting: Record<string, number>; // Weight for different topics
  learningPathOptimization: boolean;
  personalizedRecommendations: boolean;
}

// Student learning profile
interface StudentProfile {
  userId: number;
  subjectStrengths: Record<string, number>; // Subject performance scores
  topicWeaknesses: string[]; // Topics needing improvement
  preferredDifficulty: number; // Preferred difficulty level
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  pace: 'fast' | 'medium' | 'slow';
  lastActivity: Date;
  totalStudyTime: number; // Total minutes studied
  averageSessionTime: number; // Average minutes per session
}

// Content recommendation engine
interface ContentRecommendation {
  lessonId: number;
  lessonCode: string;
  lessonTitle: string;
  recommendationType: 'remediation' | 'challenge' | 'next_step' | 'review' | 'practice';
  confidenceScore: number;
  reason: string;
  estimatedTime: number;
  difficultyLevel: number;
  topicTags: string[];
  prerequisites: string[];
  xpReward: number;
}

// Adaptive learning path
interface LearningPath {
  pathId: string;
  title: string;
  description: string;
  lessons: Array<{
    lessonId: number;
    order: number;
    isRequired: boolean;
    estimatedTime: number;
    difficultyLevel: number;
  }>;
  totalEstimatedTime: number;
  difficultyProgression: number[];
  adaptiveAdjustments: boolean;
}

// Intelligent content delivery service
export class IntelligentContentService {
  private static instance: IntelligentContentService;
  private config: ContentIntelligenceConfig;
  private studentProfiles: Map<number, StudentProfile> = new Map();
  private learningPaths: Map<string, LearningPath> = new Map();

  private constructor() {
    this.config = {
      adaptiveThreshold: 0.7, // 70% threshold for adaptation
      difficultyAdjustment: 0.5, // Adjust difficulty by 0.5 levels
      topicWeighting: {
        'kinematics': 1.0,
        'dynamics': 1.2,
        'energy': 1.1,
        'momentum': 1.3,
        'waves': 0.9,
        'functions': 1.0,
        'trigonometry': 1.1,
        'calculus': 1.4,
        'algebra': 0.8,
      },
      learningPathOptimization: true,
      personalizedRecommendations: true,
    };
  }

  // Singleton pattern
  public static getInstance(): IntelligentContentService {
    if (!IntelligentContentService.instance) {
      IntelligentContentService.instance = new IntelligentContentService();
    }
    return IntelligentContentService.instance;
  }

  // Get or create student profile
  async getStudentProfile(userId: number): Promise<StudentProfile> {
    if (this.studentProfiles.has(userId)) {
      return this.studentProfiles.get(userId)!;
    }

    // Analyze student's past performance to create profile
    const profile = await this.analyzeStudentPerformance(userId);
    this.studentProfiles.set(userId, profile);
    return profile;
  }

  // Analyze student performance from database
  private async analyzeStudentPerformance(userId: number): Promise<StudentProfile> {
    const progress = await dbService.getStudentProgress(userId);

    const profile: StudentProfile = {
      userId,
      subjectStrengths: {},
      topicWeaknesses: [],
      preferredDifficulty: 2, // Default to medium
      learningStyle: 'visual', // Default learning style
      pace: 'medium',
      lastActivity: new Date(),
      totalStudyTime: 0,
      averageSessionTime: 0,
    };

    // Analyze performance by subject
    const subjectPerformance: Record<string, { scores: number[], timeSpent: number }> = {};

    progress.forEach(p => {
      const subject = p.subject_code;
      if (!subjectPerformance[subject]) {
        subjectPerformance[subject] = { scores: [], timeSpent: 0 };
      }

      if (p.bestScore) {
        subjectPerformance[subject].scores.push(p.bestScore);
      }
      subjectPerformance[subject].timeSpent += p.timeSpentMinutes || 0;
      profile.totalStudyTime += p.timeSpentMinutes || 0;
    });

    // Calculate subject strengths
    Object.entries(subjectPerformance).forEach(([subject, data]) => {
      const avgScore = data.scores.reduce((sum, score) => sum + score, 0) / data.scores.length;
      profile.subjectStrengths[subject] = avgScore;

      // Identify weaknesses (scores below threshold)
      if (avgScore < this.config.adaptiveThreshold * 100) {
        profile.topicWeaknesses.push(subject);
      }
    });

    // Determine preferred difficulty based on performance
    const avgPerformance = Object.values(profile.subjectStrengths).reduce((sum, score) => sum + score, 0) / Object.values(profile.subjectStrengths).length;

    if (avgPerformance > 85) {
      profile.preferredDifficulty = 4; // Advanced
    } else if (avgPerformance > 70) {
      profile.preferredDifficulty = 3; // Intermediate
    } else if (avgPerformance > 55) {
      profile.preferredDifficulty = 2; // Medium
    } else {
      profile.preferredDifficulty = 1; // Basic
    }

    // Calculate average session time
    if (progress.length > 0) {
      profile.averageSessionTime = profile.totalStudyTime / progress.length;
    }

    // Determine learning pace
    if (profile.averageSessionTime > 60) {
      profile.pace = 'slow';
    } else if (profile.averageSessionTime > 30) {
      profile.pace = 'medium';
    } else {
      profile.pace = 'fast';
    }

    return profile;
  }

  // Generate personalized recommendations
  async generateRecommendations(userId: number): Promise<ContentRecommendation[]> {
    const profile = await this.getStudentProfile(userId);
    const recommendations: ContentRecommendation[] = [];

    // Remediation recommendations for weak topics
    for (const weakTopic of profile.topicWeaknesses) {
      const remediationLessons = await this.getRemediationLessons(weakTopic, profile.preferredDifficulty);

      remediationLessons.forEach(lesson => {
        recommendations.push({
          lessonId: lesson.id,
          lessonCode: lesson.lesson_code,
          lessonTitle: lesson.lesson_title,
          recommendationType: 'remediation',
          confidenceScore: 0.8,
          reason: `Strengthen foundation in ${weakTopic}`,
          estimatedTime: lesson.estimated_minutes,
          difficultyLevel: Math.max(1, profile.preferredDifficulty - 1),
          topicTags: lesson.topic_tags || [],
          prerequisites: lesson.prerequisites || [],
          xpReward: lesson.xp_reward,
        });
      });
    }

    // Challenge recommendations for strong topics
    const strongTopics = Object.entries(profile.subjectStrengths)
      .filter(([_, score]) => score > 85)
      .map(([topic, _]) => topic);

    for (const strongTopic of strongTopics) {
      const challengeLessons = await this.getChallengeLessons(strongTopic, profile.preferredDifficulty);

      challengeLessons.forEach(lesson => {
        recommendations.push({
          lessonId: lesson.id,
          lessonCode: lesson.lesson_code,
          lessonTitle: lesson.lesson_title,
          recommendationType: 'challenge',
          confidenceScore: 0.7,
          reason: `Advanced practice in ${strongTopic}`,
          estimatedTime: lesson.estimated_minutes,
          difficultyLevel: Math.min(5, profile.preferredDifficulty + 1),
          topicTags: lesson.topic_tags || [],
          prerequisites: lesson.prerequisites || [],
          xpReward: lesson.xp_reward,
        });
      });
    }

    // Next step recommendations based on progress
    const nextStepLessons = await this.getNextStepLessons(userId, profile);
    nextStepLessons.forEach(lesson => {
      recommendations.push({
        lessonId: lesson.id,
        lessonCode: lesson.lesson_code,
        lessonTitle: lesson.lesson_title,
        recommendationType: 'next_step',
        confidenceScore: 0.9,
        reason: 'Continue your learning journey',
        estimatedTime: lesson.estimated_minutes,
        difficultyLevel: profile.preferredDifficulty,
        topicTags: lesson.topic_tags || [],
        prerequisites: lesson.prerequisites || [],
        xpReward: lesson.xp_reward,
      });
    });

    // Sort by confidence score and limit to top recommendations
    return recommendations
      .sort((a, b) => b.confidenceScore - a.confidenceScore)
      .slice(0, 10);
  }

  // Get remediation lessons for weak topics
  private async getRemediationLessons(topic: string, currentDifficulty: number): Promise<any[]> {
    const targetDifficulty = Math.max(1, currentDifficulty - 1);

    const lessons = await dbService.getLessonsByCriteria({
      topicTags: [topic],
      difficultyLevel: targetDifficulty,
      lessonType: 'reading', // Focus on foundational content
    });

    return lessons.slice(0, 3); // Top 3 remediation lessons
  }

  // Get challenge lessons for strong topics
  private async getChallengeLessons(topic: string, currentDifficulty: number): Promise<any[]> {
    const targetDifficulty = Math.min(5, currentDifficulty + 1);

    const lessons = await dbService.getLessonsByCriteria({
      topicTags: [topic],
      difficultyLevel: targetDifficulty,
      lessonType: 'problem_set', // Focus on challenging problems
    });

    return lessons.slice(0, 2); // Top 2 challenge lessons
  }

  // Get next step lessons based on completed content
  private async getNextStepLessons(userId: number, profile: StudentProfile): Promise<any[]> {
    const progress = await dbService.getStudentProgress(userId);
    const completedLessons = progress.filter(p => p.status === 'completed');

    if (completedLessons.length === 0) {
      // New student - get introductory lessons
      return await dbService.getLessonsByCriteria({
        difficultyLevel: 1,
        lessonType: 'video',
      });
    }

    // Find lessons with completed prerequisites
    const allLessons = await dbService.getActiveCurriculum();
    const nextLessons = allLessons.filter(lesson => {
      const prerequisites = lesson.prerequisites ? JSON.parse(lesson.prerequisites) : [];
      return prerequisites.every(prereq =>
        completedLessons.some(completed => completed.lessonCode === prereq)
      );
    });

    // Filter out already completed lessons
    const incompleteLessons = nextLessons.filter(lesson =>
      !completedLessons.some(completed => completed.lessonCode === lesson.lesson_code)
    );

    return incompleteLessons.slice(0, 3);
  }

  // Generate adaptive learning path
  async generateLearningPath(userId: number, subjectCode: string): Promise<LearningPath> {
    const profile = await this.getStudentProfile(userId);
    const pathId = `${userId}-${subjectCode}-${Date.now()}`;

    const lessons = await dbService.getLessonsByCriteria({
      subjectCode,
    });

    // Sort lessons by difficulty and prerequisites
    const sortedLessons = this.sortLessonsByDifficulty(lessons, profile);

    const learningPath: LearningPath = {
      pathId,
      title: `${subjectCode} Learning Path`,
      description: `Personalized learning path for ${subjectCode}`,
      lessons: sortedLessons.map((lesson, index) => ({
        lessonId: lesson.id,
        order: index + 1,
        isRequired: lesson.difficulty_level <= 3, // Basic and intermediate lessons required
        estimatedTime: lesson.estimated_minutes,
        difficultyLevel: lesson.difficulty_level,
      })),
      totalEstimatedTime: sortedLessons.reduce((sum, lesson) => sum + lesson.estimated_minutes, 0),
      difficultyProgression: sortedLessons.map(lesson => lesson.difficulty_level),
      adaptiveAdjustments: true,
    };

    this.learningPaths.set(pathId, learningPath);
    return learningPath;
  }

  // Sort lessons by difficulty considering student profile
  private sortLessonsByDifficulty(lessons: any[], profile: StudentProfile): any[] {
    return lessons.sort((a, b) => {
      // Base sorting by difficulty
      let difficultyA = a.difficulty_level;
      let difficultyB = b.difficulty_level;

      // Adjust based on student's preferred difficulty
      const prefDiff = profile.preferredDifficulty;
      difficultyA = Math.abs(difficultyA - prefDiff) < Math.abs(difficultyB - prefDiff) ? difficultyA : difficultyB;
      difficultyB = Math.abs(difficultyB - prefDiff) < Math.abs(difficultyA - prefDiff) ? difficultyB : difficultyA;

      // Apply topic weighting
      const topicWeightA = this.getTopicWeight(a.topic_tags || []);
      const topicWeightB = this.getTopicWeight(b.topic_tags || []);

      const scoreA = difficultyA * topicWeightA;
      const scoreB = difficultyB * topicWeightB;

      return scoreA - scoreB;
    });
  }

  // Get topic weight based on student profile
  private getTopicWeight(topicTags: string[]): number {
    return topicTags.reduce((weight, tag) => {
      return weight + (this.config.topicWeighting[tag] || 1.0);
    }, 0) / topicTags.length || 1.0;
  }

  // Adapt content difficulty based on performance
  async adaptContentDifficulty(userId: number, lessonId: number, performanceScore: number): Promise<void> {
    const profile = await this.getStudentProfile(userId);
    const lesson = await dbService.getLesson(lessonId.toString());

    if (!lesson) return;

    // Adjust preferred difficulty based on performance
    if (performanceScore > 90) {
      // Excellent performance - increase difficulty
      profile.preferredDifficulty = Math.min(5, profile.preferredDifficulty + this.config.difficultyAdjustment);
    } else if (performanceScore < 60) {
      // Poor performance - decrease difficulty
      profile.preferredDifficulty = Math.max(1, profile.preferredDifficulty - this.config.difficultyAdjustment);
    }

    // Update student profile
    this.studentProfiles.set(userId, profile);

    // Generate new recommendations based on updated profile
    await this.generateRecommendations(userId);
  }

  // Get intelligent content for lesson display
  async getIntelligentLessonContent(lessonId: number, userId: number): Promise<{
    lesson: any;
    recommendations: ContentRecommendation[];
    adaptiveContent: {
      difficulty: number;
      estimatedTime: number;
      prerequisites: string[];
      relatedLessons: any[];
      hints: string[];
    };
  }> {
    const lesson = await dbService.getLesson(lessonId.toString());
    const profile = await this.getStudentProfile(userId);
    const recommendations = await this.generateRecommendations(userId);

    // Calculate adaptive content
    const adaptiveContent = {
      difficulty: this.adjustDifficultyForStudent(lesson.difficulty_level, profile),
      estimatedTime: this.adjustTimeForStudent(lesson.estimated_minutes, profile),
      prerequisites: this.getPrerequisitesForStudent(lesson.prerequisites, profile),
      relatedLessons: await this.getRelatedLessons(lesson, profile),
      hints: this.generateHints(lesson, profile),
    };

    return {
      lesson,
      recommendations,
      adaptiveContent,
    };
  }

  // Adjust difficulty for individual student
  private adjustDifficultyForStudent(baseDifficulty: number, profile: StudentProfile): number {
    const adjustment = (profile.preferredDifficulty - baseDifficulty) * 0.3;
    return Math.round(baseDifficulty + adjustment);
  }

  // Adjust time estimate for student's pace
  private adjustTimeForStudent(baseTime: number, profile: StudentProfile): number {
    const paceMultiplier = {
      fast: 0.8,
      medium: 1.0,
      slow: 1.3,
    }[profile.pace];

    return Math.round(baseTime * paceMultiplier);
  }

  // Get prerequisites filtered for student's current knowledge
  private getPrerequisitesForStudent(prerequisites: string, profile: StudentProfile): string[] {
    if (!prerequisites) return [];

    const prereqArray = JSON.parse(prerequisites);

    // Filter out prerequisites for topics the student is strong in
    return prereqArray.filter(prereq => {
      const topic = prereq.split('_')[0]; // Extract topic from prerequisite
      const strength = profile.subjectStrengths[topic];
      return !strength || strength < 85; // Keep if not strong in topic
    });
  }

  // Get related lessons based on student profile
  private async getRelatedLessons(lesson: any, profile: StudentProfile): Promise<any[]> {
    const relatedLessons = await dbService.getLessonsByCriteria({
      topicTags: lesson.topic_tags || [],
      difficultyLevel: lesson.difficulty_level,
    });

    // Filter out the current lesson and sort by relevance
    return relatedLessons
      .filter(l => l.id !== lesson.id)
      .sort((a, b) => {
        const relevanceA = this.calculateRelevance(a, lesson, profile);
        const relevanceB = this.calculateRelevance(b, lesson, profile);
        return relevanceB - relevanceA;
      })
      .slice(0, 3);
  }

  // Calculate lesson relevance
  private calculateRelevance(lessonA: any, lessonB: any, profile: StudentProfile): number {
    let relevance = 0;

    // Same topic tags increase relevance
    const tagsA = new Set(lessonA.topic_tags || []);
    const tagsB = new Set(lessonB.topic_tags || []);
    const commonTags = [...tagsA].filter(tag => tagsB.has(tag));
    relevance += commonTags.length * 0.3;

    // Similar difficulty level increases relevance
    const diffDiff = Math.abs(lessonA.difficulty_level - lessonB.difficulty_level);
    relevance += (2 - diffDiff) * 0.2;

    // Student's preferred difficulty increases relevance
    const prefDiff = Math.abs(lessonA.difficulty_level - profile.preferredDifficulty);
    relevance += (3 - prefDiff) * 0.2;

    return relevance;
  }

  // Generate contextual hints for student
  private generateHints(lesson: any, profile: StudentProfile): string[] {
    const hints: string[] = [];

    // Add hints based on student's weaknesses
    if (profile.topicWeaknesses.includes(lesson.topic_tags?.[0])) {
      hints.push('Take your time with this topic. Review the fundamentals if needed.');
    }

    // Add hints based on lesson difficulty
    if (lesson.difficulty_level > profile.preferredDifficulty) {
      hints.push('This lesson is challenging. Don\'t hesitate to review prerequisites.');
    } else if (lesson.difficulty_level < profile.preferredDifficulty) {
      hints.push('This should be a good review. Focus on mastering the concepts.');
    }

    // Add hints based on learning pace
    if (profile.pace === 'fast') {
      hints.push('You tend to work quickly. Make sure to understand each concept before moving on.');
    } else if (profile.pace === 'slow') {
      hints.push('Take your time to understand. It\'s better to learn thoroughly than quickly.');
    }

    return hints;
  }

  // Update configuration
  updateConfig(newConfig: Partial<ContentIntelligenceConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // Get service statistics
  getServiceStats(): {
    studentProfiles: number;
    learningPaths: number;
    config: ContentIntelligenceConfig;
  } {
    return {
      studentProfiles: this.studentProfiles.size,
      learningPaths: this.learningPaths.size,
      config: this.config,
    };
  }
}

// Export singleton instance
export const intelligentContentService = IntelligentContentService.getInstance();

// Export types
export type {
  ContentIntelligenceConfig,
  StudentProfile,
  ContentRecommendation,
  LearningPath
};
