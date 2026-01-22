/**
 * React hooks for Better-Auth client
 * 
 * Provides React hooks that wrap Better-Auth client functionality
 * for easy integration in React applications
 */

import { useState, useEffect, useCallback } from 'react';

export interface User {
  id: string;
  name?: string;
  email: string;
  emailVerified?: boolean;
  image?: string;
  permissions?: string[];
}

export interface Session {
  user: User;
  expiresAt: string;
}

export interface AuthClient {
  signIn: (credentials: { email: string; password: string }) => Promise<{ user: User; session: Session }>;
  signUp: (credentials: { email: string; password: string; name?: string }) => Promise<{ user: User; session: Session }>;
  signOut: () => Promise<void>;
  getSession: () => Promise<Session | null>;
}

/**
 * Hook to use authentication
 * Provides access to the current user session and authentication methods
 */
export function useAuth(authClient: AuthClient) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch the current session
  const fetchSession = useCallback(async () => {
    try {
      setLoading(true);
      const currentSession = await authClient.getSession();
      setSession(currentSession);
      setError(null);
    } catch (err) {
      setError(err as Error);
      setSession(null);
    } finally {
      setLoading(false);
    }
  }, [authClient]);

  // Load session on mount
  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  // Sign in method
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await authClient.signIn({ email, password });
      setSession(result.session);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [authClient]);

  // Sign up method
  const signUp = useCallback(async (email: string, password: string, name?: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await authClient.signUp({ email, password, name });
      setSession(result.session);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [authClient]);

  // Sign out method
  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await authClient.signOut();
      setSession(null);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [authClient]);

  return {
    session,
    user: session?.user || null,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    refresh: fetchSession,
  };
}

/**
 * Hook to check if user is authenticated
 */
export function useIsAuthenticated(authClient: AuthClient) {
  const { session, loading } = useAuth(authClient);
  return {
    isAuthenticated: !!session,
    loading,
  };
}

/**
 * Hook to get user permissions
 */
export function usePermissions(authClient: AuthClient) {
  const { user, loading } = useAuth(authClient);
  
  const hasPermission = useCallback((permission: string) => {
    if (!user || !user.permissions) return false;
    return user.permissions.includes(permission);
  }, [user]);

  const hasAnyPermission = useCallback((permissions: string[]) => {
    if (!user || !user.permissions) return false;
    return permissions.some(p => user.permissions!.includes(p));
  }, [user]);

  const hasAllPermissions = useCallback((permissions: string[]) => {
    if (!user || !user.permissions) return false;
    return permissions.every(p => user.permissions!.includes(p));
  }, [user]);

  return {
    permissions: user?.permissions || [],
    loading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
}
