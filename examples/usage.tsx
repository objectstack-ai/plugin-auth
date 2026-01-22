/**
 * Example usage of @objectstack/plugin-auth
 * 
 * This file demonstrates how to use the auth plugin in a typical application
 */

// ============================================================================
// SERVER-SIDE EXAMPLE
// ============================================================================

import { AuthPlugin, getAuth } from '@objectstack/plugin-auth';

// 1. Plugin is automatically initialized by ObjectStack runtime
// The runtime calls AuthPlugin.onEnable(context) with:
// - context.ql: ObjectQL client
// - context.os: ObjectOS runtime instance
// - context.config: Plugin configuration

// 2. Access the auth instance in your application
export function setupAuthRoutes(app: any) {
  const auth = getAuth();
  
  // Register auth routes
  // Better-Auth will handle:
  // - POST /api/auth/sign-in
  // - POST /api/auth/sign-up
  // - POST /api/auth/sign-out
  // - GET /api/auth/session
  app.use('/api/auth/*', auth.handler);
}

// ============================================================================
// CLIENT-SIDE EXAMPLE (React)
// ============================================================================

import React from 'react';
import {
  useAuth,
  useIsAuthenticated,
  usePermissions,
  SignInForm,
  UserButton,
  AuthClient,
} from '@objectstack/plugin-auth';

// Create an auth client that communicates with your API
const authClient: AuthClient = {
  signIn: async ({ email, password }) => {
    const response = await fetch('/api/auth/sign-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to sign in');
    }
    
    return response.json();
  },
  
  signUp: async ({ email, password, name }) => {
    const response = await fetch('/api/auth/sign-up', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password, name }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to sign up');
    }
    
    return response.json();
  },
  
  signOut: async () => {
    const response = await fetch('/api/auth/sign-out', {
      method: 'POST',
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Failed to sign out');
    }
  },
  
  getSession: async () => {
    const response = await fetch('/api/auth/session', {
      credentials: 'include',
    });
    
    if (!response.ok) {
      return null;
    }
    
    return response.json();
  },
};

// Example 1: Basic authentication flow
export function AuthExample() {
  const { user, loading, signOut } = useAuth(authClient);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return (
      <div>
        <h1>Sign In</h1>
        <SignInForm
          authClient={authClient}
          onSuccess={() => console.log('Successfully signed in!')}
          onError={(error) => console.error('Sign in failed:', error)}
        />
      </div>
    );
  }

  return (
    <div>
      <h1>Welcome, {user.name || user.email}!</h1>
      <UserButton
        authClient={authClient}
        onSignOut={() => console.log('Signed out')}
      />
    </div>
  );
}

// Example 2: Protected route
export function ProtectedPage() {
  const { isAuthenticated, loading } = useIsAuthenticated(authClient);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <div>Please sign in to access this page</div>;
  }

  return <div>Protected content here</div>;
}

// Example 3: Permission-based rendering
export function AdminPanel() {
  const { hasPermission, loading } = usePermissions(authClient);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!hasPermission('admin:access')) {
    return <div>You don't have permission to access this page</div>;
  }

  return (
    <div>
      <h1>Admin Panel</h1>
      <p>Admin-only content</p>
    </div>
  );
}

// Example 4: Multiple permissions check
export function EditorPage() {
  const { hasAnyPermission, hasAllPermissions } = usePermissions(authClient);

  const canEdit = hasAnyPermission(['editor:write', 'admin:full']);
  const canPublish = hasAllPermissions(['editor:write', 'editor:publish']);

  return (
    <div>
      <h1>Editor</h1>
      {canEdit && <button>Edit Content</button>}
      {canPublish && <button>Publish</button>}
    </div>
  );
}

// Example 5: Custom sign-in form
export function CustomSignInForm() {
  const { signIn, loading, error } = useAuth(authClient);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signIn(email, password);
      // Redirect or update UI
    } catch (err) {
      console.error('Sign in failed:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
      {error && <div>Error: {error.message}</div>}
    </form>
  );
}

// ============================================================================
// OBJECTQL ADAPTER EXAMPLE
// ============================================================================

// The adapter automatically maps Better-Auth operations to ObjectQL
// For example, when Better-Auth needs to create a user:

// Better-Auth calls:
// adapter.user.create({ email: 'user@example.com', password: 'hashed...' })

// Which becomes:
// ql.entity('User').create({ email: 'user@example.com', password: 'hashed...' })

// This works with ANY ObjectQL storage backend:
// - PostgreSQL: Data saved in postgres table
// - Redis: Data saved in redis hash
// - Excel: Data saved in excel row
// - Any other ObjectQL-compatible storage

// ============================================================================
// RBAC INTEGRATION EXAMPLE
// ============================================================================

// When ObjectOS is configured, permissions are automatically injected:

// 1. User signs in
// 2. Better-Auth creates a session
// 3. The RBAC bridge plugin calls os.getPermissions(userId)
// 4. Permissions are injected into session.user.permissions
// 5. Frontend receives user object with permissions included

// No extra API calls needed!
