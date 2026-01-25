import { createAuthClient } from 'better-auth/react';
import type { InferSessionFromClient } from 'better-auth/client';

/**
 * Client-side configuration for ObjectStack Auth Plugin
 */
export interface ObjectStackAuthClientConfig {
  baseURL?: string;
  fetchOptions?: RequestInit;
}

/**
 * Create Better-Auth client with type-safe hooks
 * 
 * Usage:
 * ```tsx
 * const authClient = createObjectStackAuthClient({
 *   baseURL: 'http://localhost:3000'
 * });
 * 
 * function MyComponent() {
 *   const { data: session, isPending } = authClient.useSession();
 *   // session.user.permissions is available!
 * }
 * ```
 */
export function createObjectStackAuthClient(config: ObjectStackAuthClientConfig = {}) {
  const {
    baseURL = typeof window !== 'undefined' 
      ? window.location.origin 
      : 'http://localhost:3000',
    fetchOptions = {},
  } = config;

  return createAuthClient({
    baseURL,
    fetchOptions: {
      credentials: 'include', // Important for cookies
      ...fetchOptions,
    },
  });
}

/**
 * Default auth client instance
 * Can be used directly in React components
 */
export const authClient = createObjectStackAuthClient();

/**
 * Re-export Better-Auth hooks with enhanced types
 */
export const {
  useSession,
  signIn,
  signOut,
  signUp,
} = authClient;

/**
 * Type-safe session from client
 */
export type ObjectStackClientSession = InferSessionFromClient<typeof authClient>;

/**
 * Convenience hook to access user permissions
 */
export function usePermissions() {
  const { data: session, isPending } = useSession();
  
  return {
    permissions: session?.user?.permissions,
    isPending,
    isAuthenticated: !!session,
  };
}

/**
 * Convenience hook to check if user has a specific permission
 */
export function useHasPermission(permission: string) {
  const { permissions, isPending } = usePermissions();
  
  return {
    hasPermission: permissions?.includes?.(permission) ?? false,
    isPending,
  };
}
