// High-velocity SQLite Data Fetching Service
// Prisma + better-sqlite3 optimization for FunFinity Academy
// DBeaver compatible with real-time updates

import { join } from 'path';

// Type definitions for database classes (to be installed)
interface PrismaClient {
  $queryRaw: Function;
  siteArchitecture: any;
  subject: any;
  module: any;
  lesson: any;
  problemSet: any;
  user: any;
  studentProgress: any;
  contentRecommendation: any;
  $disconnect: Function;
}

interface DatabaseInterface {
  pragma(statement: string): void;
  prepare(query: string): Statement;
  close(): void;
}

interface Database {
  new(path: string): DatabaseInterface;
}

interface Statement {
  all(...params: any[]): any[];
  get(...params: any[]): any;
  run(...params: any[]): any;
}

// Mock implementations for development (replace with actual imports)
const PrismaClient = class implements PrismaClient {
  constructor(config?: any) { }
  $queryRaw = async (query: string, ...params: any[]) => [];
  siteArchitecture = {};
  subject = {};
  module = {};
  lesson = {};
  problemSet = {};
  user = {};
  studentProgress = {};
  contentRecommendation = {};
  $disconnect = async () => { };
};

const Database = class implements DatabaseInterface {
  constructor(path: string) { }
  pragma(statement: string): void { }
  prepare(query: string): Statement {
    return {
      all: () => [],
      get: () => ({}),
      run: () => ({})
    };
  }
  close(): void { }
};

// Database configuration
const DB_PATH = join(process.cwd(), 'database', 'funfinity-academy.db');

// Initialize better-sqlite3 for performance-critical operations
const sqliteDb = new Database(DB_PATH);

// Performance optimizations for SQLite
sqliteDb.pragma('journal_mode = WAL');
sqliteDb.pragma('synchronous = NORMAL');
sqliteDb.pragma('cache_size = 10000');
sqliteDb.pragma('temp_store = MEMORY');
sqliteDb.pragma('foreign_keys = ON');

// Initialize Prisma client for complex queries and type safety
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: `file:${DB_PATH}`,
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Database service class
class DatabaseServiceInternal {
  private static instance: DatabaseServiceInternal;
  private prisma: PrismaClient;
  private sqlite: DatabaseInterface;

  private constructor() {
    this.prisma = prisma;
    this.sqlite = sqliteDb;
  }

  // Singleton pattern for database connection management
  public static getInstance(): DatabaseServiceInternal {
    if (!DatabaseServiceInternal.instance) {
      DatabaseServiceInternal.instance = new DatabaseServiceInternal();
    }
    return DatabaseServiceInternal.instance;
  }

  // =====================================================
  // SITE ARCHITECTURE (Zero-Hardcode Mandate)
  // =====================================================

  // Get all UI strings, labels, and constants
  async getSiteArchitecture(category?: string): Promise<Record<string, string>> {
    const where = category ? { category, isActive: true } : { isActive: true };
    const items = await this.prisma.siteArchitecture.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    });

    // Convert to key-value object for easy access
    const result: Record<string, string> = {};
    items.forEach(item => {
      result[item.keyName] = item.value;
    });

    return result;
  }

  // Get specific UI string
  async getUIString(keyName: string): Promise<string | null> {
    const item = await this.prisma.siteArchitecture.findUnique({
      where: { keyName },
      select: { value: true },
    });

    return item?.value || null;
  }

  // Update UI string (for DBeaver real-time updates)
  async updateUIString(keyName: string, value: string): Promise<void> {
    await this.prisma.siteArchitecture.update({
      where: { keyName },
      data: { value },
    });
  }

  // =====================================================
  // CURRICULUM DATA FETCHING (Performance Optimized)
  // =====================================================

  // Get active curriculum structure (high-performance query)
  async getActiveCurriculum(subjectCode?: string): Promise<any[]> {
    const query = `
      SELECT 
        s.subject_code,
        s.subject_name,
        m.module_code,
        m.module_title,
        l.lesson_code,
        l.lesson_title,
        l.lesson_type,
        l.difficulty_level,
        l.topic_tags,
        l.estimated_minutes,
        l.xp_reward
      FROM subjects s
      JOIN modules m ON s.id = m.subject_id
      JOIN lessons l ON m.id = l.module_id
      WHERE s.is_active = 1 
        AND m.is_active = 1 
        AND l.is_active = 1
        ${subjectCode ? 'AND s.subject_code = ?' : ''}
      ORDER BY s.sort_order, m.sort_order, l.sort_order
    `;

    const stmt = this.sqlite.prepare(query);
    const results = subjectCode
      ? stmt.all(subjectCode)
      : stmt.all();

    return results;
  }

  // Get subjects with performance optimization
  async getSubjects(): Promise<any[]> {
    return this.prisma.subject.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        modules: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
          include: {
            lessons: {
              where: { isActive: true },
              orderBy: { sortOrder: 'asc' },
              select: {
                id: true,
                lessonCode: true,
                lessonTitle: true,
                lessonType: true,
                difficultyLevel: true,
                estimatedMinutes: true,
                xpReward: true,
                topicTags: true,
              },
            },
          },
        },
      },
    });
  }

  // Get lesson with content (including LaTeX)
  async getLesson(lessonCode: string): Promise<any> {
    const lesson = await this.prisma.lesson.findUnique({
      where: { lessonCode },
      include: {
        module: {
          include: {
            subject: true,
          },
        },
        problemSets: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!lesson) return null;

    // Parse JSON fields
    return {
      ...lesson,
      topicTags: lesson.topicTags ? JSON.parse(lesson.topicTags) : [],
      learningObjectives: lesson.learningObjectives ? JSON.parse(lesson.learningObjectives) : [],
      content: lesson.content ? JSON.parse(lesson.content) : null,
    };
  }

  // Get lessons by difficulty and topic (intelligent content delivery)
  async getLessonsByCriteria(criteria: {
    subjectCode?: string;
    difficultyLevel?: number;
    topicTags?: string[];
    lessonType?: string;
  }): Promise<any[]> {
    const { subjectCode, difficultyLevel, topicTags, lessonType } = criteria;

    // Build dynamic query for performance
    let query = `
      SELECT DISTINCT l.*
      FROM lessons l
      JOIN modules m ON l.module_id = m.id
      JOIN subjects s ON m.subject_id = s.id
      WHERE l.is_active = 1 
        AND m.is_active = 1 
        AND s.is_active = 1
    `;

    const params: any[] = [];

    if (subjectCode) {
      query += ` AND s.subject_code = ?`;
      params.push(subjectCode);
    }

    if (difficultyLevel) {
      query += ` AND l.difficulty_level = ?`;
      params.push(difficultyLevel);
    }

    if (lessonType) {
      query += ` AND l.lesson_type = ?`;
      params.push(lessonType);
    }

    if (topicTags && topicTags.length > 0) {
      // For SQLite, we'll use LIKE for JSON array matching
      const tagConditions = topicTags.map(() => `l.topic_tags LIKE ?`).join(' OR ');
      query += ` AND (${tagConditions})`;
      topicTags.forEach(tag => params.push(`%"${tag}"%`));
    }

    query += ` ORDER BY l.sort_order`;

    const stmt = this.sqlite.prepare(query);
    const results = stmt.all(...params);

    // Parse JSON fields for each result
    return results.map((lesson: any) => ({
      ...lesson,
      topicTags: lesson.topic_tags ? JSON.parse(lesson.topic_tags) : [],
      learningObjectives: lesson.learning_objectives ? JSON.parse(lesson.learning_objectives) : [],
    }));
  }

  // =====================================================
  // STUDENT PROGRESS TRACKING
  // =====================================================

  // Get student progress summary
  async getStudentProgressSummary(userId: number): Promise<any> {
    const query = `
      SELECT 
        u.id as user_id,
        u.display_name,
        COUNT(sp.id) as total_lessons,
        SUM(CASE WHEN sp.status = 'completed' THEN 1 ELSE 0 END) as completed_lessons,
        SUM(sp.xp_earned) as total_xp,
        AVG(sp.progress_percentage) as average_progress,
        MAX(sp.last_accessed) as last_activity
      FROM users u
      LEFT JOIN student_progress sp ON u.id = sp.user_id
      WHERE u.id = ? AND u.is_active = 1
      GROUP BY u.id, u.display_name
    `;

    const stmt = this.sqlite.prepare(query);
    return stmt.get(userId);
  }

  // Get detailed student progress
  async getStudentProgress(userId: number, subjectCode?: string): Promise<any[]> {
    let query = `
      SELECT 
        sp.*,
        l.lesson_code,
        l.lesson_title,
        l.lesson_type,
        l.difficulty_level,
        l.xp_reward,
        m.module_title,
        s.subject_code,
        s.subject_name
      FROM student_progress sp
      JOIN lessons l ON sp.lesson_id = l.id
      JOIN modules m ON l.module_id = m.id
      JOIN subjects s ON m.subject_id = s.id
      WHERE sp.user_id = ?
    `;

    const params: any[] = [userId];

    if (subjectCode) {
      query += ` AND s.subject_code = ?`;
      params.push(subjectCode);
    }

    query += ` ORDER BY sp.last_accessed DESC`;

    const stmt = this.sqlite.prepare(query);
    return stmt.all(...params);
  }

  // Update student progress
  async updateStudentProgress(
    userId: number,
    lessonId: number,
    progressData: {
      status?: string;
      progressPercentage?: number;
      timeSpentMinutes?: number;
      attempts?: number;
      bestScore?: number;
      xpEarned?: number;
    }
  ): Promise<void> {
    const existing = await this.prisma.studentProgress.findUnique({
      where: { userId_lessonId: { userId, lessonId } },
    });

    if (existing) {
      await this.prisma.studentProgress.update({
        where: { userId_lessonId: { userId, lessonId } },
        data: {
          ...progressData,
          lastAccessed: new Date(),
          completionDate: progressData.status === 'completed' ? new Date() : existing.completionDate,
        },
      });
    } else {
      await this.prisma.studentProgress.create({
        data: {
          userId,
          lessonId,
          ...progressData,
          lastAccessed: new Date(),
          completionDate: progressData.status === 'completed' ? new Date() : null,
        },
      });
    }
  }

  // =====================================================
  // INTELLIGENT CONTENT DELIVERY
  // =====================================================

  // Get content recommendations for a student
  async getContentRecommendations(userId: number): Promise<any[]> {
    return this.prisma.contentRecommendation.findMany({
      where: {
        userId,
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
      include: {
        lesson: {
          include: {
            module: {
              include: { subject: true },
            },
          },
        },
      },
      orderBy: { confidenceScore: 'desc' },
    });
  }

  // Generate intelligent recommendations based on performance
  async generateRecommendations(userId: number): Promise<void> {
    // Get student's recent performance
    const progress = await this.getStudentProgress(userId);

    // Analyze performance patterns
    const performanceAnalysis = this.analyzePerformance(progress);

    // Generate recommendations based on analysis
    const recommendations = this.generateRecommendationsFromAnalysis(performanceAnalysis);

    // Store recommendations
    for (const rec of recommendations) {
      await this.prisma.contentRecommendation.upsert({
        where: {
          userId_lessonId: {
            userId,
            lessonId: rec.lessonId,
          },
        },
        update: {
          recommendationType: rec.type,
          confidenceScore: rec.confidence,
          reason: rec.reason,
          isActive: true,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        },
        create: {
          userId,
          lessonId: rec.lessonId,
          recommendationType: rec.type,
          confidenceScore: rec.confidence,
          reason: rec.reason,
          isActive: true,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });
    }
  }

  // Analyze student performance
  private analyzePerformance(progress: any[]): any {
    const analysis = {
      averageScore: 0,
      strugglingSubjects: [] as string[],
      strongSubjects: [] as string[],
      recentActivity: progress.slice(0, 5),
      completionRate: 0,
    };

    if (progress.length === 0) return analysis;

    const completedLessons = progress.filter(p => p.status === 'completed');
    analysis.averageScore = completedLessons.reduce((sum, p) => sum + (p.bestScore || 0), 0) / completedLessons.length;
    analysis.completionRate = completedLessons.length / progress.length;

    // Analyze by subject
    const subjectPerformance: Record<string, { scores: number[], count: number }> = {};

    progress.forEach(p => {
      if (!subjectPerformance[p.subject_code]) {
        subjectPerformance[p.subject_code] = { scores: [], count: 0 };
      }
      if (p.bestScore) {
        subjectPerformance[p.subject_code].scores.push(p.bestScore);
      }
      subjectPerformance[p.subject_code].count++;
    });

    Object.entries(subjectPerformance).forEach(([subject, data]) => {
      const avgScore = data.scores.reduce((sum, score) => sum + score, 0) / data.scores.length;
      if (avgScore < 70) {
        analysis.strugglingSubjects.push(subject);
      } else if (avgScore > 85) {
        analysis.strongSubjects.push(subject);
      }
    });

    return analysis;
  }

  // Generate recommendations from performance analysis
  private generateRecommendationsFromAnalysis(analysis: any): any[] {
    const recommendations: any[] = [];

    // Remediation for struggling subjects
    if (analysis.strugglingSubjects.length > 0) {
      analysis.strugglingSubjects.forEach((subject: string) => {
        // Find foundational lessons in struggling subject
        const foundationalLessons = this.getFoundationalLessons(subject, 1, 2); // Easy to medium difficulty

        foundationalLessons.forEach((lesson: any) => {
          recommendations.push({
            lessonId: lesson.id,
            type: 'remediation',
            confidence: 0.8,
            reason: `Struggling with ${subject} - recommend foundational lesson`,
          });
        });
      });
    }

    // Challenge for strong subjects
    if (analysis.strongSubjects.length > 0) {
      analysis.strongSubjects.forEach((subject: string) => {
        const advancedLessons = this.getAdvancedLessons(subject, 4, 5); // Hard difficulty

        advancedLessons.forEach((lesson: any) => {
          recommendations.push({
            lessonId: lesson.id,
            type: 'challenge',
            confidence: 0.7,
            reason: `Strong performance in ${subject} - recommend advanced content`,
          });
        });
      });
    }

    return recommendations;
  }

  // Get foundational lessons for remediation
  private getFoundationalLessons(subjectCode: string, minDifficulty: number, maxDifficulty: number): any[] {
    const query = `
      SELECT l.id, l.lesson_code, l.lesson_title
      FROM lessons l
      JOIN modules m ON l.module_id = m.id
      JOIN subjects s ON m.subject_id = s.id
      WHERE s.subject_code = ? 
        AND l.difficulty_level BETWEEN ? AND ?
        AND l.is_active = 1
        AND m.is_active = 1
        AND s.is_active = 1
      ORDER BY l.sort_order
      LIMIT 3
    `;

    const stmt = this.sqlite.prepare(query);
    return stmt.all(subjectCode, minDifficulty, maxDifficulty);
  }

  // Get advanced lessons for challenges
  private getAdvancedLessons(subjectCode: string, minDifficulty: number, maxDifficulty: number): any[] {
    const query = `
      SELECT l.id, l.lesson_code, l.lesson_title
      FROM lessons l
      JOIN modules m ON l.module_id = m.id
      JOIN subjects s ON m.subject_id = s.id
      WHERE s.subject_code = ? 
        AND l.difficulty_level BETWEEN ? AND ?
        AND l.is_active = 1
        AND m.is_active = 1
        AND s.is_active = 1
      ORDER BY l.sort_order
      LIMIT 2
    `;

    const stmt = this.sqlite.prepare(query);
    return stmt.all(subjectCode, minDifficulty, maxDifficulty);
  }

  // =====================================================
  // PROBLEM SETS AND ASSESSMENTS
  // =====================================================

  // Get problem set with LaTeX content
  async getProblemSet(problemSetCode: string): Promise<any> {
    const problemSet = await this.prisma.problemSet.findUnique({
      where: { problemSetCode },
      include: {
        lesson: {
          include: {
            module: {
              include: { subject: true },
            },
          },
        },
      },
    });

    if (!problemSet) return null;

    return {
      ...problemSet,
      problems: JSON.parse(problemSet.problems),
      solutions: JSON.parse(problemSet.solutions),
    };
  }

  // =====================================================
  // DATABASE HEALTH AND MONITORING
  // =====================================================

  // Check database health
  async healthCheck(): Promise<{ status: string; details: any }> {
    try {
      // Test basic connectivity
      await this.prisma.$queryRaw`SELECT 1`;

      // Check table counts
      const subjectCount = await this.prisma.subject.count();
      const lessonCount = await this.prisma.lesson.count();
      const userCount = await this.prisma.user.count();

      // Check database size
      const dbStats = this.sqlite.prepare("SELECT page_count * page_size as size FROM pragma_page_count(), pragma_page_size()").get() as { size: number };

      return {
        status: 'healthy',
        details: {
          subjects: subjectCount,
          lessons: lessonCount,
          users: userCount,
          databaseSize: dbStats.size,
          lastCheck: new Date(),
        },
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: { error: (error as Error).message },
      };
    }
  }

  // =====================================================
  // CONNECTION MANAGEMENT
  // =====================================================

  // Close database connections
  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
    this.sqlite.close();
  }

  // Get Prisma client for complex operations
  getPrismaClient(): PrismaClient {
    return this.prisma;
  }

  // Get SQLite instance for raw queries
  getSQLiteInstance(): DatabaseInterface {
    return this.sqlite;
  }
}

// Export singleton instance
export const dbService = DatabaseServiceInternal.getInstance();

// Export types for use in components
export type DatabaseService = DatabaseServiceInternal;
