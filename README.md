# @objectstack/plugin-auth

🔐 Better-Auth plugin for ObjectStack - A battery-included authentication and identity layer for the ObjectStack ecosystem.

## Features

- **Storage Agnostic**: Uses ObjectQL as the storage adapter, meaning authentication data can live in Postgres, Redis, or even Excel files
- **Type Safe**: End-to-end typed session objects with TypeScript
- **RBAC Integration**: Automatic permission injection from ObjectOS into session objects
- **React Hooks**: Pre-built hooks for easy client-side integration
- **Framework Agnostic**: Works with any JavaScript framework

## Installation

```bash
pnpm add @objectstack/plugin-auth better-auth
```

## Quick Start

### Server Setup

```typescript
import { createAuthPlugin } from '@objectstack/plugin-auth';
import { createQLClient } from '@objectstack/ql';

// Initialize ObjectQL client
const ql = createQLClient({
  driver: 'postgres', // or 'redis', 'excel', etc.
  connection: process.env.DATABASE_URL,
});

// Create auth plugin
const authPlugin = createAuthPlugin({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  
  // RBAC Integration: Inject permissions into session
  onGetPermissions: async (userId) => {
    return await os.getPermissions(userId);
  },
  
  // Optional: Configure email/password auth
  emailProvider: {
    enabled: true,
    sendVerificationEmail: async ({ user, url }) => {
      // Send email logic
    },
  },
  
  // Optional: Configure social providers
  socialProviders: [
    {
      id: 'google',
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
  ],
});

// Enable the plugin
await authPlugin.onEnable({
  ql,
  app: yourExpressApp, // or any compatible server
});
```

### Client Setup (React)

```typescript
import { useSession, usePermissions, signIn, signOut } from '@objectstack/plugin-auth';

function App() {
  const { data: session, isPending } = useSession();
  const { permissions } = usePermissions();

  if (isPending) return <div>Loading...</div>;

  if (!session) {
    return (
      <button onClick={() => signIn.email({ 
        email: 'user@example.com', 
        password: 'password' 
      })}>
        Sign In
      </button>
    );
  }

  return (
    <div>
      <p>Welcome, {session.user.name}!</p>
      <p>Email: {session.user.email}</p>
      <p>Permissions: {permissions?.join(', ')}</p>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  );
}
```

## Architecture

### ObjectQL Adapter

The plugin implements a custom Better-Auth adapter that maps all CRUD operations to ObjectQL entities:

```typescript
// Example: Creating a user
const user = await ql.entity('User').create({
  data: {
    email: 'user@example.com',
    name: 'John Doe',
  },
});
```

This means if ObjectQL is configured with an Excel driver, new users will be written as rows in an Excel file!

### Schema Definition

The plugin defines authentication entities in GraphQL:

```graphql
type User {
  id: ID!
  email: String!
  emailVerified: Boolean!
  name: String
  image: String
  createdAt: DateTime!
  updatedAt: DateTime!
}

type Session {
  id: ID!
  userId: ID!
  expiresAt: DateTime!
  token: String!
  # ... more fields
}
```

### RBAC Integration

The plugin bridges Better-Auth (authentication) with ObjectOS (authorization):

```typescript
// In server config
onGetPermissions: async (userId) => {
  // Query ObjectOS for permissions
  return await os.getPermissions(userId);
}

// In client
const { permissions } = usePermissions();
// permissions are automatically available in session
```

## API Reference

### Server API

#### `createAuthPlugin(config)`

Creates the auth plugin instance.

**Options:**
- `secret` - Secret key for signing tokens
- `baseURL` - Base URL for auth endpoints
- `trustedOrigins` - Array of trusted origins for CORS
- `emailProvider` - Email provider configuration
- `socialProviders` - Array of social provider configs
- `onGetPermissions` - Callback to get user permissions

#### `createAuthServer(config)`

Low-level API to create Better-Auth server instance.

#### `getSession(auth, request)`

Extract session from HTTP request.

### Client API

#### `useSession()`

React hook to get current session.

```typescript
const { data: session, isPending, error } = useSession();
```

#### `usePermissions()`

React hook to get user permissions.

```typescript
const { permissions, isPending, isAuthenticated } = usePermissions();
```

#### `useHasPermission(permission)`

Check if user has a specific permission.

```typescript
const { hasPermission, isPending } = useHasPermission('admin.write');
```

#### `signIn`

Sign in methods for different providers.

```typescript
// Email/password
await signIn.email({ email, password });

// Social
await signIn.social({ provider: 'google' });
```

#### `signOut`

Sign out the current user.

```typescript
await signOut();
```

## Environment Variables

```bash
BETTER_AUTH_SECRET=your-secret-key-min-32-chars
BETTER_AUTH_URL=http://localhost:3000
NODE_ENV=development
```

## Directory Structure

```
src/
├── adapter/
│   └── index.ts          # ObjectQL Adapter implementation
├── schema/
│   └── auth.gql          # GraphQL schema definitions
├── client/
│   └── hooks.ts          # React hooks
├── server/
│   └── index.ts          # Server-side initialization
└── index.ts              # Main entry point
```

## License

MIT

## Contributing

Contributions are welcome! Please read our contributing guidelines first.

## Support

For issues and questions, please open an issue on GitHub.