// Configuration API Route
// Zero-hardcode implementation - all UI strings from PostgreSQL
// High-concurrency optimized for local HDD storage

import { NextRequest, NextResponse } from 'next/server';
import { postgres } from '@/lib/postgres-connection';
import { z } from 'zod';

// Request validation schemas
const ConfigRequestSchema = z.object({
  config_key: z.string().min(1).max(100),
  config_value: z.string().min(1),
  config_type: z.enum(['string', 'number', 'boolean', 'json']).default('string'),
  description: z.string().optional(),
  category: z.string().max(50).default('general'),
});

// GET: Retrieve configuration
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const activeOnly = searchParams.get('active_only') === 'true';

    let query = 'SELECT * FROM site_config WHERE 1=1';
    const params = [];

    if (category) {
      query += ' AND category = $' + (params.length + 1);
      params.push(category);
    }

    if (activeOnly) {
      query += ' AND is_active = true';
    }

    query += ' ORDER BY category, config_key';

    const config = await postgres.query(query, params);

    return NextResponse.json({
      success: true,
      data: config,
      count: config.length,
    });

  } catch (error) {
    console.error('Error fetching configuration:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Create configuration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = ConfigRequestSchema.parse(body);

    // Check if config key already exists
    const existingConfig = await postgres.queryOne(
      'SELECT id FROM site_config WHERE config_key = $1',
      [validatedData.config_key]
    );

    if (existingConfig) {
      return NextResponse.json(
        { error: 'Configuration key already exists' },
        { status: 409 }
      );
    }

    const insertQuery = `
      INSERT INTO site_config (config_key, config_value, config_type, description, category)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const config = await postgres.queryOne(insertQuery, [
      validatedData.config_key,
      validatedData.config_value,
      validatedData.config_type,
      validatedData.description || null,
      validatedData.category,
    ]);

    return NextResponse.json({
      success: true,
      data: config,
    });

  } catch (error) {
    console.error('Error creating configuration:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT: Update configuration
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { config_key, config_value } = body;

    if (!config_key || config_value === undefined) {
      return NextResponse.json(
        { error: 'config_key and config_value are required' },
        { status: 400 }
      );
    }

    // Verify config exists
    const existingConfig = await postgres.queryOne(
      'SELECT id, config_type FROM site_config WHERE config_key = $1 AND is_active = true',
      [config_key]
    );

    if (!existingConfig) {
      return NextResponse.json(
        { error: 'Configuration key not found' },
        { status: 404 }
      );
    }

    const updateQuery = `
      UPDATE site_config 
      SET config_value = $1, updated_at = CURRENT_TIMESTAMP
      WHERE config_key = $2 AND is_active = true
      RETURNING *
    `;

    const config = await postgres.queryOne(updateQuery, [config_value, config_key]);

    return NextResponse.json({
      success: true,
      data: config,
    });

  } catch (error) {
    console.error('Error updating configuration:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE: Deactivate configuration
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const configKey = searchParams.get('config_key');

    if (!configKey) {
      return NextResponse.json(
        { error: 'config_key is required' },
        { status: 400 }
      );
    }

    // Soft delete (deactivate) configuration
    const result = await postgres.query(
      'UPDATE site_config SET is_active = false WHERE config_key = $1',
      [configKey]
    );

    return NextResponse.json({
      success: true,
      deactivated: result.length > 0,
    });

  } catch (error) {
    console.error('Error deactivating configuration:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
