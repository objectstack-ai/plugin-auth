import type { BetterAuthOptions } from 'better-auth';

/**
 * ObjectQL Adapter for Better-Auth
 * 
 * This adapter bridges Better-Auth with ObjectQL, enabling storage-agnostic
 * authentication data persistence (Postgres, Redis, Excel, etc.)
 * 
 * Pattern: All database operations use ql.entity('EntityName').operation()
 * NO direct SQL, Prisma, or Drizzle calls.
 * 
 * Note: The peer dependency @objectstack/ql provides the ObjectQLClient type.
 * This file uses 'any' type to avoid type errors when the peer dependency is not installed.
 */

export interface ObjectQLAdapterConfig {
  ql: any; // ObjectQLClient from @objectstack/ql peer dependency
  debugLogs?: boolean;
}

/**
 * Creates a Better-Auth DBAdapter for ObjectQL
 * 
 * This follows the better-auth 1.4+ adapter pattern where adapters
 * are factory functions that return a function that takes BetterAuthOptions
 * and returns the actual adapter implementation.
 */
export function createObjectQLAdapter(config: ObjectQLAdapterConfig) {
  const { ql, debugLogs = false } = config;

  return (options: BetterAuthOptions) => {
    // Model name mapping (better-auth uses lowercase model names)
    const modelMap: Record<string, string> = {
      user: 'User',
      session: 'Session',
      account: 'Account',
      verification: 'VerificationToken',
    };

    const getModelName = (model: string) => modelMap[model] || model;

    return {
      id: 'objectql-adapter',
      
      // Create a record in the specified model
      async create({ model, data }: { model: string; data: any }) {
        const entityName = getModelName(model);
        if (debugLogs) console.log(`[ObjectQL Adapter] create ${entityName}:`, data);
        
        const result = await ql.entity(entityName).create({ data });
        return result;
      },

      // Find a single record matching the where clause
      async findOne({ model, where }: { model: string; where: any }) {
        const entityName = getModelName(model);
        if (debugLogs) console.log(`[ObjectQL Adapter] findOne ${entityName}:`, where);
        
        // Try to use findUnique if there's a single unique field
        const whereKeys = Object.keys(where);
        if (whereKeys.length === 1) {
          const result = await ql.entity(entityName).findUnique({ where });
          return result || null;
        }
        
        // Otherwise use findFirst for composite where clauses
        const result = await ql.entity(entityName).findFirst({ where });
        return result || null;
      },

      // Find multiple records matching the where clause
      async findMany({ model, where, limit, offset, sortBy }: { 
        model: string; 
        where?: any; 
        limit?: number;
        offset?: number;
        sortBy?: any;
      }) {
        const entityName = getModelName(model);
        if (debugLogs) console.log(`[ObjectQL Adapter] findMany ${entityName}:`, { where, limit, offset, sortBy });
        
        const query: any = {};
        if (where) query.where = where;
        if (limit) query.take = limit;
        if (offset) query.skip = offset;
        if (sortBy) query.orderBy = sortBy;
        
        const results = await ql.entity(entityName).findMany(query);
        return results || [];
      },

      // Update a record matching the where clause
      async update({ model, where, update }: { model: string; where: any; update: any }) {
        const entityName = getModelName(model);
        if (debugLogs) console.log(`[ObjectQL Adapter] update ${entityName}:`, { where, update });
        
        const result = await ql.entity(entityName).update({
          where,
          data: update,
        });
        return result;
      },

      // Update multiple records matching the where clause
      async updateMany({ model, where, update }: { model: string; where: any; update: any }) {
        const entityName = getModelName(model);
        if (debugLogs) console.log(`[ObjectQL Adapter] updateMany ${entityName}:`, { where, update });
        
        const result = await ql.entity(entityName).updateMany({
          where,
          data: update,
        });
        return result;
      },

      // Delete a record matching the where clause
      async delete({ model, where }: { model: string; where: any }) {
        const entityName = getModelName(model);
        if (debugLogs) console.log(`[ObjectQL Adapter] delete ${entityName}:`, where);
        
        await ql.entity(entityName).delete({ where });
      },

      // Delete multiple records matching the where clause
      async deleteMany({ model, where }: { model: string; where: any }) {
        const entityName = getModelName(model);
        if (debugLogs) console.log(`[ObjectQL Adapter] deleteMany ${entityName}:`, where);
        
        await ql.entity(entityName).deleteMany({ where });
      },

      // Count records matching the where clause
      async count({ model, where }: { model: string; where?: any }) {
        const entityName = getModelName(model);
        if (debugLogs) console.log(`[ObjectQL Adapter] count ${entityName}:`, where);
        
        const count = await ql.entity(entityName).count({ where });
        return count;
      },
    };
  };
}
