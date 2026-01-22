/**
 * @objectstack/plugin-auth
 * 
 * Authentication plugin for ObjectStack using Better-Auth
 * Provides a comprehensive authentication solution with ObjectQL integration
 */

import { initializeAuth, BetterAuthConfig, Auth } from './server';
import { createObjectQLAdapter, ObjectQLClient, ObjectQLAdapter } from './adapter';

/**
 * ObjectStack Plugin Interface
 */
export interface ObjectStackPlugin {
  name: string;
  version: string;
  onEnable(context: PluginContext): void | Promise<void>;
  onDisable?(): void | Promise<void>;
}

/**
 * Plugin Context provided by ObjectStack runtime
 */
export interface PluginContext {
  /**
   * ObjectQL client for data access
   */
  ql: ObjectQLClient;
  
  /**
   * ObjectOS runtime instance
   */
  os?: any;
  
  /**
   * Plugin configuration from objectstack.config.ts
   */
  config?: Record<string, any>;
  
  /**
   * Logger instance
   */
  logger?: {
    info(message: string, ...args: any[]): void;
    error(message: string, ...args: any[]): void;
    warn(message: string, ...args: any[]): void;
    debug(message: string, ...args: any[]): void;
  };
}

/**
 * Auth Plugin State
 */
let authInstance: Auth | null = null;
let adapterInstance: ObjectQLAdapter | null = null;

/**
 * ObjectStack Auth Plugin
 */
export const AuthPlugin: ObjectStackPlugin = {
  name: '@objectstack/plugin-auth',
  version: '0.1.0',

  async onEnable(context: PluginContext) {
    const { ql, os, config = {}, logger } = context;

    logger?.info('Initializing ObjectStack Auth Plugin...');

    try {
      // Validate required environment variables
      if (!process.env.BETTER_AUTH_SECRET) {
        throw new Error('BETTER_AUTH_SECRET environment variable is required');
      }
      if (!process.env.BETTER_AUTH_URL) {
        throw new Error('BETTER_AUTH_URL environment variable is required');
      }

      // Create the ObjectQL adapter
      adapterInstance = createObjectQLAdapter({ ql });
      logger?.info('ObjectQL adapter created');

      // Initialize Better-Auth
      const authConfig: BetterAuthConfig = {
        ql,
        os,
        baseURL: process.env.BETTER_AUTH_URL,
        secret: process.env.BETTER_AUTH_SECRET,
        advanced: {
          secureCookies: config.secureCookies ?? process.env.NODE_ENV === 'production',
          sessionExpiresIn: config.sessionExpiresIn,
        },
      };

      authInstance = initializeAuth(authConfig);
      logger?.info('Better-Auth initialized successfully');

      // Register auth routes with ObjectOS runtime if available
      if (os && typeof os.registerRoutes === 'function') {
        os.registerRoutes('/api/auth', authInstance);
        logger?.info('Auth routes registered at /api/auth');
      }

      logger?.info('ObjectStack Auth Plugin enabled successfully');
    } catch (error) {
      logger?.error('Failed to initialize Auth Plugin:', error);
      throw error;
    }
  },

  async onDisable() {
    // Clean up resources
    authInstance = null;
    adapterInstance = null;
  },
};

/**
 * Get the current auth instance
 * @throws Error if plugin is not initialized
 */
export function getAuth(): Auth {
  if (!authInstance) {
    throw new Error('Auth plugin is not initialized. Make sure to call onEnable first.');
  }
  return authInstance;
}

/**
 * Get the current adapter instance
 * @throws Error if plugin is not initialized
 */
export function getAdapter(): ObjectQLAdapter {
  if (!adapterInstance) {
    throw new Error('Auth plugin is not initialized. Make sure to call onEnable first.');
  }
  return adapterInstance;
}

// Export all modules
export * from './server';
export * from './adapter';
export * from './client/hooks';
export * from './client/components';

// Default export
export default AuthPlugin;
