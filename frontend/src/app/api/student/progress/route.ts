// Student Progress API Route
// Isolated module for student progress tracking
// High-concurrency optimized for local HDD storage

import { NextRequest, NextResponse } from 'next/server';
import { postgres } from '@/lib/postgres';
import { z } from 'zod';

// Request validation schema
const ProgressRequestSchema = z.object({
  user_id: z.string().uuid(),
  course_id: z.string().min(1),
  lesson_id: z.string().optional(),
  module_id: z.string().optional(),
  status: z.enum(['not_started', 'in_progress', 'completed', 'mastered']).optional(),
  progress_percentage: z.number().min(0).max(100).optional(),
  progress_data: z.object({}).optional(),
  time_spent_minutes: z.number().min(0).optional(),
});

// GET: Retrieve student progress
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const courseId = searchParams.get('course_id');
    const lessonId = searchParams.get('lesson_id');

    if (!userId) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      );
    }

    let query = 'SELECT * FROM student_progress WHERE user_id = $1';
    const params = [userId];

    if (courseId) {
      query += ' AND course_id = $2';
      params.push(courseId);
    }

    if (lessonId) {
      query += ' AND lesson_id = $' + (params.length + 1);
      params.push(lessonId);
    }

    query += ' ORDER BY last_accessed DESC';

    const progress = await postgres.query(query, params);

    return NextResponse.json({
      success: true,
      data: progress,
      count: progress.length,
    });

  } catch (error) {
    console.error('Error fetching student progress:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Create or update student progress
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = ProgressRequestSchema.parse(body);

    // Check if progress record exists
    const existingProgress = await postgres.queryOne(
      'SELECT id FROM student_progress WHERE user_id = $1 AND course_id = $2 AND lesson_id = $3',
      [validatedData.user_id, validatedData.course_id, validatedData.lesson_id || null]
    );

    let result;
    
    if (existingProgress) {
      // Update existing progress
      const updateQuery = `
        UPDATE student_progress 
        SET 
          status = COALESCE($1, status),
          progress_percentage = COALESCE($2, progress_percentage),
          progress_data = COALESCE($3, progress_data),
          time_spent_minutes = COALESCE($4, time_spent_minutes),
          last_accessed = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $5
        RETURNING *
      `;
      
      result = await postgres.queryOne(updateQuery, [
        validatedData.status,
        validatedData.progress_percentage,
        JSON.stringify(validatedData.progress_data || {}),
        validatedData.time_spent_minutes,
        existingProgress.id,
      ]);
    } else {
      // Create new progress record
      const insertQuery = `
        INSERT INTO student_progress (
          user_id, course_id, lesson_id, module_id, 
          status, progress_percentage, progress_data, 
          time_spent_minutes, last_accessed
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
        RETURNING *
      `;
      
      result = await postgres.queryOne(insertQuery, [
        validatedData.user_id,
        validatedData.course_id,
        validatedData.lesson_id || null,
        validatedData.module_id || null,
        validatedData.status || 'not_started',
        validatedData.progress_percentage || 0,
        JSON.stringify(validatedData.progress_data || {}),
        validatedData.time_spent_minutes || 0,
      ]);
    }

    return NextResponse.json({
      success: true,
      data: result,
    });

  } catch (error) {
    console.error('Error updating student progress:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT: Bulk update student progress
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, course_id, updates } = body;

    if (!user_id || !course_id || !Array.isArray(updates)) {
      return NextResponse.json(
        { error: 'user_id, course_id, and updates array are required' },
        { status: 400 }
      );
    }

    const results = await postgres.transaction(async (client) => {
      const updatedRecords = [];
      
      for (const update of updates) {
        const updateQuery = `
          UPDATE student_progress 
          SET 
            status = COALESCE($1, status),
            progress_percentage = COALESCE($2, progress_percentage),
            progress_data = COALESCE($3, progress_data),
            time_spent_minutes = COALESCE($4, time_spent_minutes),
            last_accessed = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
          WHERE user_id = $5 AND course_id = $6 AND lesson_id = $7
          RETURNING *
        `;
        
        const result = await client.query(updateQuery, [
          update.status,
          update.progress_percentage,
          JSON.stringify(update.progress_data || {}),
          update.time_spent_minutes,
          user_id,
          course_id,
          update.lesson_id || null,
        ]);
        
        if (result.rows.length > 0) {
          updatedRecords.push(result.rows[0]);
        }
      }
      
      return updatedRecords;
    });

    return NextResponse.json({
      success: true,
      data: results,
      count: results.length,
    });

  } catch (error) {
    console.error('Error bulk updating student progress:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE: Remove student progress
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const courseId = searchParams.get('course_id');
    const lessonId = searchParams.get('lesson_id');

    if (!userId || !courseId) {
      return NextResponse.json(
        { error: 'user_id and course_id are required' },
        { status: 400 }
      );
    }

    let query = 'DELETE FROM student_progress WHERE user_id = $1 AND course_id = $2';
    const params = [userId, courseId];

    if (lessonId) {
      query += ' AND lesson_id = $3';
      params.push(lessonId);
    }

    const result = await postgres.query(query, params);

    return NextResponse.json({
      success: true,
      deleted: result.length,
    });

  } catch (error) {
    console.error('Error deleting student progress:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
