import { betterAuth } from 'better-auth';
import type { BetterAuthOptions } from 'better-auth';
import { createObjectQLAdapter } from '../adapter/index.js';

/**
 * ObjectOS Permissions type
 * Can be customized based on your RBAC implementation
 * 
 * Note: The peer dependency @objectstack/ql provides the ObjectQLClient type.
 * This file uses 'any' type to avoid type errors when the peer dependency is not installed.
 */
export type ObjectOSPermissions = string[] | Record<string, boolean> | null;

/**
 * Server-side configuration for ObjectStack Auth Plugin
 */
export interface ObjectStackAuthServerConfig {
  ql: any; // ObjectQLClient from @objectstack/ql peer dependency
  secret?: string;
  baseURL?: string;
  trustedOrigins?: string[];
  emailProvider?: BetterAuthOptions['emailAndPassword'];
  socialProviders?: BetterAuthOptions['socialProviders'];
  onGetPermissions?: (userId: string) => Promise<ObjectOSPermissions>;
}

/**
 * Initialize Better-Auth with ObjectQL adapter and ObjectOS RBAC integration
 * 
 * This is the core server-side initialization that:
 * 1. Configures Better-Auth with ObjectQL storage
 * 2. Injects ObjectOS permissions into session objects
 * 3. Handles environment-specific settings (dev/prod)
 */
export function createAuthServer(config: ObjectStackAuthServerConfig) {
  const {
    ql,
    secret = process.env.BETTER_AUTH_SECRET,
    baseURL = process.env.BETTER_AUTH_URL || 'http://localhost:3000',
    trustedOrigins = [],
    emailProvider,
    socialProviders = [],
    onGetPermissions,
  } = config;

  if (!secret) {
    throw new Error('BETTER_AUTH_SECRET environment variable is required');
  }

  // Create ObjectQL adapter
  const adapter = createObjectQLAdapter({ ql });

  // Build Better-Auth options
  const authOptions: BetterAuthOptions = {
    database: adapter,
    secret,
    baseURL,
    trustedOrigins: [
      ...trustedOrigins,
      'http://localhost:3000',
      'http://localhost:5173', // Vite default
    ],
    session: {
      expiresIn: 60 * 60 * 24 * 7, // 7 days
      updateAge: 60 * 60 * 24, // 1 day
      cookieCache: {
        enabled: true,
        maxAge: 60 * 5, // 5 minutes
      },
    },
    // Environment-specific cookie settings
    advanced: {
      cookiePrefix: 'objectstack-auth',
      crossSubDomainCookies: {
        enabled: false,
      },
      useSecureCookies: process.env.NODE_ENV === 'production',
    },
  };

  // Add email provider if configured
  if (emailProvider) {
    authOptions.emailAndPassword = emailProvider;
  }

  // Add social providers if configured
  if (socialProviders && Object.keys(socialProviders).length > 0) {
    authOptions.socialProviders = socialProviders as BetterAuthOptions['socialProviders'];
  }

  // Create Better-Auth instance
  const auth = betterAuth(authOptions);

  // RBAC Integration: Enhanced session retrieval with permissions
  // Note: This wraps the session retrieval to inject permissions
  // If Better-Auth provides official plugin hooks in the future, migrate to those
  return {
    ...auth,
    
    // Enhanced getSession that includes permissions
    getSessionWithPermissions: async (request: Request) => {
      const session = await auth.api.getSession({ 
        request,
        headers: request.headers 
      });
      
      if (session?.user?.id && onGetPermissions) {
        try {
          // Query ObjectOS for user permissions
          const permissions = await onGetPermissions(session.user.id);
          
          // Return enhanced session with permissions
          return {
            ...session,
            user: {
              ...session.user,
              permissions,
            },
          };
        } catch (error) {
          console.error('Failed to load user permissions:', error);
          // Return session without permissions on error
          return {
            ...session,
            user: {
              ...session.user,
              permissions: null,
            },
          };
        }
      }
      
      return session;
    },
  };
}

/**
 * Type-safe session object with injected permissions
 */
export interface ObjectStackSession {
  user: {
    id: string;
    email: string;
    name?: string;
    image?: string;
    emailVerified: boolean;
    permissions?: ObjectOSPermissions;
  };
  session: {
    id: string;
    expiresAt: Date;
    token: string;
    ipAddress?: string;
    userAgent?: string;
  };
}

/**
 * Utility to extract session with permissions from request
 */
export async function getSession(
  auth: ReturnType<typeof createAuthServer>, 
  request: Request
): Promise<ObjectStackSession | null> {
  // Use the enhanced getSessionWithPermissions if available
  if ('getSessionWithPermissions' in auth && typeof auth.getSessionWithPermissions === 'function') {
    return await auth.getSessionWithPermissions(request) as ObjectStackSession | null;
  }
  
  // Fallback to standard getSession
  return await auth.api.getSession({ 
    request,
    headers: request.headers 
  }) as ObjectStackSession | null;
}
