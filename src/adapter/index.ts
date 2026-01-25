import type { Adapter, AdapterAccount, AdapterSession, AdapterUser, AdapterVerificationToken } from 'better-auth';
import type { ObjectQLClient } from '@objectstack/ql';

/**
 * ObjectQL Adapter for Better-Auth
 * 
 * This adapter bridges Better-Auth with ObjectQL, enabling storage-agnostic
 * authentication data persistence (Postgres, Redis, Excel, etc.)
 * 
 * Pattern: All database operations use ql.entity('EntityName').operation()
 * NO direct SQL, Prisma, or Drizzle calls.
 */

export interface ObjectQLAdapterConfig {
  ql: ObjectQLClient;
}

/**
 * Generate a unique ID for entities
 * Prefers crypto.randomUUID, falls back to timestamp-based ID
 */
function generateId(): string {
  // Try crypto.randomUUID first (available in modern runtimes)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback: timestamp + random number + counter for better uniqueness
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 15);
  const counter = (Math.random() * 1000000).toString(36);
  return `${timestamp}-${random}-${counter}`;
}

export function createObjectQLAdapter(config: ObjectQLAdapterConfig): Adapter {
  const { ql } = config;

  return {
    // User operations
    async createUser(data: AdapterUser): Promise<AdapterUser> {
      const user = await ql.entity('User').create({
        data: {
          id: data.id,
          email: data.email,
          emailVerified: data.emailVerified ?? false,
          name: data.name ?? null,
          image: data.image ?? null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      return user as AdapterUser;
    },

    async getUser(id: string): Promise<AdapterUser | null> {
      const user = await ql.entity('User').findUnique({
        where: { id },
      });
      return user as AdapterUser | null;
    },

    async getUserByEmail(email: string): Promise<AdapterUser | null> {
      const user = await ql.entity('User').findUnique({
        where: { email },
      });
      return user as AdapterUser | null;
    },

    async updateUser(id: string, data: Partial<AdapterUser>): Promise<AdapterUser> {
      const user = await ql.entity('User').update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      });
      return user as AdapterUser;
    },

    async deleteUser(id: string): Promise<void> {
      await ql.entity('User').delete({
        where: { id },
      });
    },

    // Session operations
    async createSession(data: AdapterSession): Promise<AdapterSession> {
      const session = await ql.entity('Session').create({
        data: {
          id: data.id,
          userId: data.userId,
          expiresAt: data.expiresAt,
          token: data.token,
          ipAddress: data.ipAddress ?? null,
          userAgent: data.userAgent ?? null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      return session as AdapterSession;
    },

    async getSession(token: string): Promise<AdapterSession | null> {
      const session = await ql.entity('Session').findUnique({
        where: { token },
      });
      return session as AdapterSession | null;
    },

    async updateSession(token: string, data: Partial<AdapterSession>): Promise<AdapterSession> {
      const session = await ql.entity('Session').update({
        where: { token },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      });
      return session as AdapterSession;
    },

    async deleteSession(token: string): Promise<void> {
      await ql.entity('Session').delete({
        where: { token },
      });
    },

    // Account operations
    async createAccount(data: AdapterAccount): Promise<AdapterAccount> {
      const account = await ql.entity('Account').create({
        data: {
          id: data.id,
          userId: data.userId,
          accountId: data.accountId,
          providerId: data.providerId,
          accessToken: data.accessToken ?? null,
          refreshToken: data.refreshToken ?? null,
          idToken: data.idToken ?? null,
          expiresAt: data.expiresAt ?? null,
          scope: data.scope ?? null,
          password: data.password ?? null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      return account as AdapterAccount;
    },

    async getAccount(providerId: string, accountId: string): Promise<AdapterAccount | null> {
      const account = await ql.entity('Account').findFirst({
        where: {
          providerId,
          accountId,
        },
      });
      return account as AdapterAccount | null;
    },

    async updateAccount(
      providerId: string,
      accountId: string,
      data: Partial<AdapterAccount>
    ): Promise<AdapterAccount> {
      // Storage-agnostic approach: Find by composite fields, then update by ID
      // This avoids Prisma-specific compound key syntax that may not work with all ObjectQL drivers
      const existingAccount = await ql.entity('Account').findFirst({
        where: {
          providerId,
          accountId,
        },
      });
      
      if (!existingAccount) {
        throw new Error(`Account not found: ${providerId}/${accountId}`);
      }
      
      const account = await ql.entity('Account').update({
        where: { id: existingAccount.id },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      });
      return account as AdapterAccount;
    },

    async deleteAccount(providerId: string, accountId: string): Promise<void> {
      // Use deleteMany with where clause for storage-agnostic deletion
      await ql.entity('Account').deleteMany({
        where: {
          providerId,
          accountId,
        },
      });
    },

    // Verification token operations
    async createVerificationToken(data: AdapterVerificationToken): Promise<AdapterVerificationToken> {
      const token = await ql.entity('VerificationToken').create({
        data: {
          id: data.id || generateId(),
          identifier: data.identifier,
          token: data.token,
          expiresAt: data.expiresAt,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      return token as AdapterVerificationToken;
    },

    async getVerificationToken(identifier: string, token: string): Promise<AdapterVerificationToken | null> {
      const verificationToken = await ql.entity('VerificationToken').findFirst({
        where: {
          identifier,
          token,
        },
      });
      return verificationToken as AdapterVerificationToken | null;
    },

    async deleteVerificationToken(identifier: string, token: string): Promise<void> {
      await ql.entity('VerificationToken').deleteMany({
        where: {
          identifier,
          token,
        },
      });
    },
  };
}
