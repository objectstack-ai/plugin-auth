import type { ObjectStackPlugin, PluginContext } from '@objectstack/protocol';
import { createAuthServer, type ObjectStackAuthServerConfig } from './server/index.js';

/**
 * ObjectStack Authentication Plugin
 * 
 * A Better-Auth wrapper providing battery-included authentication
 * for the ObjectStack ecosystem with:
 * - Storage-agnostic persistence via ObjectQL
 * - RBAC integration with ObjectOS
 * - Type-safe session management
 * - React hooks for client-side
 */

export interface AuthPluginConfig {
  /**
   * Secret key for signing tokens
   * Falls back to BETTER_AUTH_SECRET env var
   */
  secret?: string;

  /**
   * Base URL for authentication endpoints
   * Falls back to BETTER_AUTH_URL env var
   */
  baseURL?: string;

  /**
   * Trusted origins for CORS
   */
  trustedOrigins?: string[];

  /**
   * Email provider configuration
   */
  emailProvider?: any;

  /**
   * Social providers (Google, GitHub, etc.)
   */
  socialProviders?: any[];

  /**
   * Callback to get user permissions from ObjectOS
   * This integrates RBAC into the session object
   */
  onGetPermissions?: (userId: string) => Promise<any>;
}

/**
 * Create the ObjectStack Auth Plugin
 */
export function createAuthPlugin(config: AuthPluginConfig = {}): ObjectStackPlugin {
  let authServer: ReturnType<typeof createAuthServer> | null = null;

  return {
    name: '@objectstack/plugin-auth',
    version: '0.1.0',
    
    /**
     * Plugin lifecycle: Called when the plugin is enabled
     */
    async onEnable(context: PluginContext) {
      console.log('[Auth Plugin] Initializing Better-Auth with ObjectQL adapter...');

      // Validate ObjectQL client is available
      if (!context.ql) {
        throw new Error('ObjectQL client is required for auth plugin');
      }

      // Create server-side auth configuration
      const serverConfig: ObjectStackAuthServerConfig = {
        ql: context.ql,
        secret: config.secret,
        baseURL: config.baseURL,
        trustedOrigins: config.trustedOrigins,
        emailProvider: config.emailProvider,
        socialProviders: config.socialProviders,
        onGetPermissions: config.onGetPermissions,
      };

      // Initialize Better-Auth server
      authServer = createAuthServer(serverConfig);

      console.log('[Auth Plugin] Better-Auth initialized successfully');

      // Register auth routes with the application server
      if (context.app) {
        console.log('[Auth Plugin] Registering authentication routes...');
        
        // Better-Auth exposes a handler for all auth routes
        context.app.all('/api/auth/*', async (req: any, res: any) => {
          return authServer!.handler(req, res);
        });

        console.log('[Auth Plugin] Authentication routes registered at /api/auth/*');
      }

      return {
        auth: authServer,
      };
    },

    /**
     * Plugin lifecycle: Called when the plugin is disabled
     */
    async onDisable() {
      console.log('[Auth Plugin] Cleaning up...');
      authServer = null;
    },

    /**
     * Plugin lifecycle: Called on health checks
     */
    async onHealthCheck() {
      return {
        status: authServer ? 'healthy' : 'disabled',
        timestamp: new Date().toISOString(),
      };
    },
  };
}

// Re-export key types and utilities
export type { ObjectStackAuthServerConfig } from './server/index.js';
export type { ObjectStackSession } from './server/index.js';
export { createAuthServer, getSession } from './server/index.js';

// Re-export adapter
export { createObjectQLAdapter } from './adapter/index.js';
export type { ObjectQLAdapterConfig } from './adapter/index.js';

// Re-export client utilities
export {
  createObjectStackAuthClient,
  authClient,
  useSession,
  usePermissions,
  useHasPermission,
  signIn,
  signOut,
  signUp,
} from './client/hooks.js';
export type { ObjectStackClientSession } from './client/hooks.js';

// Re-export all types
export type {
  User,
  Session,
  Account,
  VerificationToken,
  UserWithPermissions,
  AuthSession,
  EmailSignInCredentials,
  EmailSignUpData,
  SocialProvider,
  SocialSignInOptions,
  PasswordResetRequest,
  PasswordResetConfirm,
  EmailVerification,
  AuthErrorCode,
} from './types.js';
export { AuthError } from './types.js';

// Default export
export default createAuthPlugin;
