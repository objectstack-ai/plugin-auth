/**
 * Server-side Better-Auth initialization
 * 
 * This module handles the initialization of Better-Auth with ObjectQL adapter
 * and implements the RBAC bridge to inject permissions into sessions
 */

import { betterAuth } from 'better-auth';
import { createObjectQLAdapter, ObjectQLClient } from '../adapter';

export interface BetterAuthConfig {
  /**
   * ObjectQL client instance for data persistence
   */
  ql: ObjectQLClient;
  
  /**
   * Base URL for the authentication service
   * Default: process.env.BETTER_AUTH_URL
   */
  baseURL?: string;
  
  /**
   * Secret key for signing tokens
   * Default: process.env.BETTER_AUTH_SECRET
   */
  secret?: string;
  
  /**
   * ObjectOS instance for fetching user permissions
   */
  os?: any;
  
  /**
   * Additional Better-Auth configuration
   */
  advanced?: {
    /**
     * Enable cookie security (disable for localhost development)
     */
    secureCookies?: boolean;
    
    /**
     * Session expiration in seconds
     * Default: 7 days (604800 seconds)
     */
    sessionExpiresIn?: number;
  };
}

/**
 * Initialize Better-Auth with ObjectQL adapter and RBAC integration
 */
export function initializeAuth(config: BetterAuthConfig) {
  const {
    ql,
    baseURL = process.env.BETTER_AUTH_URL,
    secret = process.env.BETTER_AUTH_SECRET,
    os,
    advanced = {}
  } = config;

  if (!secret) {
    throw new Error('BETTER_AUTH_SECRET environment variable is required');
  }

  if (!baseURL) {
    throw new Error('BETTER_AUTH_URL environment variable is required');
  }

  // Create the ObjectQL adapter
  const adapter = createObjectQLAdapter({ ql });

  // Initialize Better-Auth
  const auth = betterAuth({
    database: adapter as any,
    baseURL,
    secret,
    
    // Email and password authentication
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false, // Can be enabled later
    },
    
    // Session configuration
    session: {
      expiresIn: advanced.sessionExpiresIn || 60 * 60 * 24 * 7, // 7 days
      updateAge: 60 * 60 * 24, // Update session every 24 hours
      cookieCache: {
        enabled: true,
        maxAge: 5 * 60, // 5 minutes
      },
    },
    
    // Advanced settings
    advanced: {
      cookieSecure: advanced.secureCookies ?? process.env.NODE_ENV === 'production',
      crossSubDomainCookies: {
        enabled: false,
      },
    },
    
    // Plugins for additional functionality
    plugins: [
      // RBAC Bridge Plugin - Simplified version
      // Note: The actual RBAC bridge implementation would be added
      // after Better-Auth session handling based on the Better-Auth API
    ],
  });

  // Return auth instance with permission injector if ObjectOS is available
  if (os) {
    return {
      ...auth,
      async getSessionWithPermissions(sessionToken: string) {
        const session = await auth.api.getSession({ headers: { cookie: sessionToken } });
        if (session && session.user) {
          try {
            const permissions = await os.getPermissions(session.user.id);
            (session.user as any).permissions = permissions;
          } catch (error) {
            console.error('Failed to fetch permissions:', error);
            (session.user as any).permissions = [];
          }
        }
        return session;
      },
    };
  }

  return auth;
}

/**
 * Type for the initialized Better-Auth instance
 */
export type Auth = ReturnType<typeof initializeAuth>;
