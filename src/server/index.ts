import { betterAuth } from 'better-auth';
import type { BetterAuthOptions } from 'better-auth';
import type { ObjectQLClient } from '@objectstack/ql';
import { createObjectQLAdapter } from '../adapter/index.js';

/**
 * Server-side configuration for ObjectStack Auth Plugin
 */
export interface ObjectStackAuthServerConfig {
  ql: ObjectQLClient;
  secret?: string;
  baseURL?: string;
  trustedOrigins?: string[];
  emailProvider?: any; // Better-Auth email provider
  socialProviders?: any[]; // Better-Auth social providers
  onGetPermissions?: (userId: string) => Promise<any>;
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
    authOptions.emailAndPassword = {
      enabled: true,
      ...emailProvider,
    };
  }

  // Add social providers if configured
  if (socialProviders.length > 0) {
    authOptions.socialProviders = socialProviders;
  }

  // Create Better-Auth instance
  const auth = betterAuth(authOptions);

  // RBAC Integration: Inject permissions into session
  // This is a custom plugin hook that runs after session retrieval
  if (onGetPermissions) {
    const originalGetSession = auth.api.getSession.bind(auth.api);
    auth.api.getSession = async (request: any) => {
      const session = await originalGetSession(request);
      
      if (session?.user?.id) {
        try {
          // Query ObjectOS for user permissions
          const permissions = await onGetPermissions(session.user.id);
          
          // Inject permissions into session object
          session.user.permissions = permissions;
        } catch (error) {
          console.error('Failed to load user permissions:', error);
          // Don't fail the session if permissions fail to load
          session.user.permissions = null;
        }
      }
      
      return session;
    };
  }

  return auth;
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
    permissions?: any; // ObjectOS permissions
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
 * Utility to extract session from request
 */
export async function getSession(auth: ReturnType<typeof createAuthServer>, request: Request): Promise<ObjectStackSession | null> {
  return await auth.api.getSession({ request }) as ObjectStackSession | null;
}
