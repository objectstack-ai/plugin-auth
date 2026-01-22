/**
 * ObjectQL Adapter for Better-Auth
 * 
 * This adapter bridges Better-Auth with ObjectQL, allowing authentication
 * data to be stored using any ObjectQL-compatible storage backend
 * (Postgres, Redis, Excel, etc.)
 */

export interface ObjectQLClient {
  entity(name: string): EntityClient;
}

export interface EntityClient {
  create(data: any): Promise<any>;
  findUnique(where: any): Promise<any>;
  findMany(where?: any): Promise<any[]>;
  update(where: any, data: any): Promise<any>;
  delete(where: any): Promise<any>;
}

export interface ObjectQLAdapterConfig {
  ql: ObjectQLClient;
}

/**
 * Creates an adapter that connects Better-Auth to ObjectQL
 * @param config Configuration containing the ObjectQL client
 */
export function createObjectQLAdapter(config: ObjectQLAdapterConfig) {
  const { ql } = config;

  return {
    // User operations
    user: {
      async create(data: any) {
        return await ql.entity('User').create(data);
      },
      async findUnique(where: any) {
        return await ql.entity('User').findUnique(where);
      },
      async findMany(where?: any) {
        return await ql.entity('User').findMany(where);
      },
      async update(where: any, data: any) {
        return await ql.entity('User').update(where, data);
      },
      async delete(where: any) {
        return await ql.entity('User').delete(where);
      }
    },

    // Session operations
    session: {
      async create(data: any) {
        return await ql.entity('Session').create(data);
      },
      async findUnique(where: any) {
        return await ql.entity('Session').findUnique(where);
      },
      async findMany(where?: any) {
        return await ql.entity('Session').findMany(where);
      },
      async update(where: any, data: any) {
        return await ql.entity('Session').update(where, data);
      },
      async delete(where: any) {
        return await ql.entity('Session').delete(where);
      }
    },

    // Account operations (for OAuth/social login)
    account: {
      async create(data: any) {
        return await ql.entity('Account').create(data);
      },
      async findUnique(where: any) {
        return await ql.entity('Account').findUnique(where);
      },
      async findMany(where?: any) {
        return await ql.entity('Account').findMany(where);
      },
      async update(where: any, data: any) {
        return await ql.entity('Account').update(where, data);
      },
      async delete(where: any) {
        return await ql.entity('Account').delete(where);
      }
    },

    // Verification token operations
    verificationToken: {
      async create(data: any) {
        return await ql.entity('VerificationToken').create(data);
      },
      async findUnique(where: any) {
        return await ql.entity('VerificationToken').findUnique(where);
      },
      async findMany(where?: any) {
        return await ql.entity('VerificationToken').findMany(where);
      },
      async update(where: any, data: any) {
        return await ql.entity('VerificationToken').update(where, data);
      },
      async delete(where: any) {
        return await ql.entity('VerificationToken').delete(where);
      }
    }
  };
}

export type ObjectQLAdapter = ReturnType<typeof createObjectQLAdapter>;
