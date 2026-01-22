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
      // RBAC Bridge Plugin
      // Injects ObjectOS permissions into the session
      {
        id: 'objectos-rbac-bridge',
        hooks: {
          after: [
            {
              matcher(context) {
                return context.path === '/api/auth/session';
              },
              async handler(ctx) {
                const session = ctx.context.session;
                
                // If ObjectOS is configured and we have a session
                if (os && session && session.user) {
                  try {
                    // Fetch permissions from ObjectOS
                    const permissions = await os.getPermissions(session.user.id);
                    
                    // Inject permissions into the session
                    session.user.permissions = permissions;
                  } catch (error) {
                    console.error('Failed to fetch permissions:', error);
                    // Don't fail the session if permissions fetch fails
                    session.user.permissions = [];
                  }
                }
                
                return ctx;
              },
            },
          ],
        },
      },
    ],
  });

  return auth;
}

/**
 * Type for the initialized Better-Auth instance
 */
export type Auth = ReturnType<typeof initializeAuth>;
