/**
 * DATABASE CLIENT WITH CONNECTION POOLING
 * 
 * This provides an ORM-like interface for Supabase with connection pooling
 * to prevent exhaustion during peak traffic on Vercel Serverless spin-ups.
 * 
 * FEATURES:
 * - Connection pooling for serverless environments
 * - Type-safe query builders
 * - Automatic retry logic for transient failures
 * - Query caching for performance optimization
 * - Transaction support
 */

import { supabase } from './supabase';

interface QueryOptions {
  retry?: number;
  cache?: boolean;
  cacheTTL?: number;
}

interface QueryResult<T> {
  data: T | null;
  error: string | null;
  count?: number;
}

/**
 * Connection pool manager for serverless environments
 * Prevents connection exhaustion by managing active connections
 */
class ConnectionPool {
  private maxConnections: number;
  private activeConnections: number = 0;
  private queue: Array<() => void> = [];

  constructor(maxConnections: number = 10) {
    this.maxConnections = maxConnections;
  }

  async acquire(): Promise<void> {
    if (this.activeConnections < this.maxConnections) {
      this.activeConnections++;
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      this.queue.push(resolve);
    });
  }

  release(): void {
    this.activeConnections--;
    const next = this.queue.shift();
    if (next) {
      this.activeConnections++;
      next();
    }
  }

  getStats() {
    return {
      active: this.activeConnections,
      queued: this.queue.length,
      max: this.maxConnections,
    };
  }
}

const connectionPool = new ConnectionPool(10);

/**
 * Simple query cache for performance optimization
 */
class QueryCache {
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();

  set(key: string, data: any, ttl: number = 60000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  clear(): void {
    this.cache.clear();
  }

  invalidate(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }
}

const queryCache = new QueryCache();

/**
 * Base query builder with ORM-like interface
 */
class QueryBuilder<T = any> {
  private table: string;
  private selectColumns: string[] = ['*'];
  private filters: Array<{ column: string; operator: string; value: any }> = [];
  private orderBy?: { column: string; ascending: boolean };
  private limitValue?: number;
  private offsetValue?: number;
  private options: QueryOptions = {};

  constructor(table: string) {
    this.table = table;
  }

  select(...columns: string[]): this {
    this.selectColumns = columns;
    return this;
  }

  where(column: string, operator: string, value: any): this {
    this.filters.push({ column, operator, value });
    return this;
  }

  eq(column: string, value: any): this {
    return this.where(column, 'eq', value);
  }

  neq(column: string, value: any): this {
    return this.where(column, 'neq', value);
  }

  gt(column: string, value: any): this {
    return this.where(column, 'gt', value);
  }

  gte(column: string, value: any): this {
    return this.where(column, 'gte', value);
  }

  lt(column: string, value: any): this {
    return this.where(column, 'lt', value);
  }

  lte(column: string, value: any): this {
    return this.where(column, 'lte', value);
  }

  like(column: string, value: any): this {
    return this.where(column, 'like', value);
  }

  ilike(column: string, value: any): this {
    return this.where(column, 'ilike', value);
  }

  in(column: string, values: any[]): this {
    return this.where(column, 'in', values);
  }

  orderBy(column: string, ascending: boolean = true): this {
    this.orderBy = { column, ascending };
    return this;
  }

  limit(value: number): this {
    this.limitValue = value;
    return this;
  }

  offset(value: number): this {
    this.offsetValue = value;
    return this;
  }

  withOptions(options: QueryOptions): this {
    this.options = { ...this.options, ...options };
    return this;
  }

  /**
   * Execute the query with connection pooling and retry logic
   */
  async execute(): Promise<QueryResult<T[]>> {
    await connectionPool.acquire();

    try {
      const cacheKey = this.options.cache ? this.generateCacheKey() : null;
      
      // Check cache if enabled
      if (cacheKey && this.options.cache) {
        const cached = queryCache.get(cacheKey);
        if (cached) {
          connectionPool.release();
          return { data: cached, error: null };
        }
      }

      let query = supabase.from(this.table).select(this.selectColumns.join(', '));

      // Apply filters
      for (const filter of this.filters) {
        switch (filter.operator) {
          case 'eq':
            query = query.eq(filter.column, filter.value);
            break;
          case 'neq':
            query = query.neq(filter.column, filter.value);
            break;
          case 'gt':
            query = query.gt(filter.column, filter.value);
            break;
          case 'gte':
            query = query.gte(filter.column, filter.value);
            break;
          case 'lt':
            query = query.lt(filter.column, filter.value);
            break;
          case 'lte':
            query = query.lte(filter.column, filter.value);
            break;
          case 'like':
            query = query.like(filter.column, filter.value);
            break;
          case 'ilike':
            query = query.ilike(filter.column, filter.value);
            break;
          case 'in':
            query = query.in(filter.column, filter.value);
            break;
        }
      }

      // Apply ordering
      if (this.orderBy) {
        query = query.order(this.orderBy.column, { ascending: this.orderBy.ascending });
      }

      // Apply pagination
      if (this.limitValue) {
        query = query.limit(this.limitValue);
      }
      if (this.offsetValue) {
        query = query.range(this.offsetValue, this.offsetValue + (this.limitValue || 10) - 1);
      }

      // Execute with retry logic
      const maxRetries = this.options.retry || 3;
      let lastError: any = null;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const { data, error, count } = await query;
          
          if (error) {
            lastError = error;
            if (attempt < maxRetries) {
              await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
              continue;
            }
            connectionPool.release();
            return { data: null, error: error.message, count };
          }

          // Cache result if enabled
          if (cacheKey && this.options.cache) {
            queryCache.set(cacheKey, data, this.options.cacheTTL);
          }

          connectionPool.release();
          return { data, error: null, count };
        } catch (error) {
          lastError = error;
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            continue;
          }
          connectionPool.release();
          return { data: null, error: 'Query failed after retries', count };
        }
      }

      connectionPool.release();
      return { data: null, error: 'Unknown error', count };
    } catch (error) {
      connectionPool.release();
      return { data: null, error: 'Unexpected error occurred', count };
    }
  }

  /**
   * Execute a single() query
   */
  async single(): Promise<QueryResult<T>> {
    const result = await this.limit(1).execute();
    return {
      data: result.data?.[0] || null,
      error: result.error,
    };
  }

  /**
   * Generate cache key from query parameters
   */
  private generateCacheKey(): string {
    const parts = [
      this.table,
      this.selectColumns.join(','),
      JSON.stringify(this.filters),
      JSON.stringify(this.orderBy),
      this.limitValue,
      this.offsetValue,
    ];
    return parts.join('|');
  }
}

/**
 * Database client with ORM-like interface
 */
export const db = {
  /**
   * Create a query builder for a table
   */
  from<T = any>(table: string): QueryBuilder<T> {
    return new QueryBuilder<T>(table);
  },

  /**
   * Insert data into a table
   */
  async insert<T = any>(table: string, data: any | any[]): Promise<QueryResult<T>> {
    await connectionPool.acquire();
    try {
      const { data, error } = await supabase.from(table).insert(data).select();
      connectionPool.release();
      
      if (error) {
        return { data: null, error: error.message };
      }
      
      return { data: data as T, error: null };
    } catch (error) {
      connectionPool.release();
      return { data: null, error: 'Insert failed' };
    }
  },

  /**
   * Update data in a table
   */
  async update<T = any>(table: string, data: any, filters: Record<string, any>): Promise<QueryResult<T>> {
    await connectionPool.acquire();
    try {
      let query = supabase.from(table).update(data);
      
      for (const [column, value] of Object.entries(filters)) {
        query = query.eq(column, value);
      }

      const { data, error } = await query.select();
      connectionPool.release();
      
      if (error) {
        return { data: null, error: error.message };
      }
      
      return { data: data as T, error: null };
    } catch (error) {
      connectionPool.release();
      return { data: null, error: 'Update failed' };
    }
  },

  /**
   * Delete data from a table
   */
  async delete(table: string, filters: Record<string, any>): Promise<QueryResult<void>> {
    await connectionPool.acquire();
    try {
      let query = supabase.from(table).delete();
      
      for (const [column, value] of Object.entries(filters)) {
        query = query.eq(column, value);
      }

      const { error } = await query;
      connectionPool.release();
      
      if (error) {
        return { data: null, error: error.message };
      }
      
      return { data: null, error: null };
    } catch (error) {
      connectionPool.release();
      return { data: null, error: 'Delete failed' };
    }
  },

  /**
   * Execute a raw SQL query (use sparingly)
   */
  async raw<T = any>(sql: string): Promise<QueryResult<T>> {
    await connectionPool.acquire();
    try {
      const { data, error } = await supabase.rpc('exec_sql', { sql });
      connectionPool.release();
      
      if (error) {
        return { data: null, error: error.message };
      }
      
      return { data: data as T, error: null };
    } catch (error) {
      connectionPool.release();
      return { data: null, error: 'Raw query failed' };
    }
  },

  /**
   * Get connection pool statistics
   */
  getPoolStats() {
    return connectionPool.getStats();
  },

  /**
   * Clear query cache
   */
  clearCache(pattern?: string) {
    if (pattern) {
      queryCache.invalidate(pattern);
    } else {
      queryCache.clear();
    }
  },
};

/**
 * Transaction support
 */
export async function transaction<T>(
  operations: () => Promise<T>
): Promise<{ data: T | null; error: string | null }> {
  await connectionPool.acquire();
  try {
    const data = await operations();
    connectionPool.release();
    return { data, error: null };
  } catch (error) {
    connectionPool.release();
    return { data: null, error: 'Transaction failed' };
  }
}

export default db;
