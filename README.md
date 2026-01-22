# @objectstack/plugin-auth

Authentication plugin for ObjectStack using Better-Auth. Provides a comprehensive, framework-agnostic authentication solution with seamless ObjectQL integration.

## Features

- 🔐 **Better-Auth Integration**: Leverages Better-Auth for robust authentication
- 🗄️ **Storage Agnostic**: Works with any ObjectQL-compatible storage (Postgres, Redis, Excel, etc.)
- 🔒 **Type Safe**: Full TypeScript support with type inference
- 🎯 **RBAC Integration**: Automatic permission injection from ObjectOS
- ⚛️ **React Support**: Pre-built hooks and components
- 🔌 **Plugin Architecture**: Follows ObjectStack plugin specification

## Installation

```bash
npm install @objectstack/plugin-auth better-auth
```

## Quick Start

### 1. Environment Variables

Create a `.env` file with the following variables:

```env
BETTER_AUTH_SECRET=your-secret-key-min-32-characters
BETTER_AUTH_URL=http://localhost:3000
NODE_ENV=development
```

### 2. Configure the Plugin

In your `objectstack.config.ts`:

```typescript
import { AuthPlugin } from '@objectstack/plugin-auth';

export default {
  plugins: [AuthPlugin],
  // ... other configuration
};
```

### 3. Server-Side Usage

The plugin automatically initializes when enabled by the ObjectStack runtime:

```typescript
import { getAuth } from '@objectstack/plugin-auth';

// Get the auth instance
const auth = getAuth();

// Use in your API routes
app.use('/api/auth/*', auth.handler);
```

### 4. Client-Side Usage (React)

```tsx
import { useAuth, SignInForm, UserButton } from '@objectstack/plugin-auth';

// Create an auth client (example)
const authClient = {
  signIn: async ({ email, password }) => {
    const response = await fetch('/api/auth/sign-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },
  signUp: async ({ email, password, name }) => {
    const response = await fetch('/api/auth/sign-up', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });
    return response.json();
  },
  signOut: async () => {
    await fetch('/api/auth/sign-out', { method: 'POST' });
  },
  getSession: async () => {
    const response = await fetch('/api/auth/session');
    return response.json();
  },
};

function App() {
  const { user, loading } = useAuth(authClient);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {user ? (
        <UserButton authClient={authClient} />
      ) : (
        <SignInForm authClient={authClient} />
      )}
    </div>
  );
}
```

## Architecture

### ObjectQL Adapter

The plugin includes a custom adapter that maps Better-Auth operations to ObjectQL entities:

- **No Direct SQL**: All database operations go through ObjectQL
- **Storage Agnostic**: Works with any ObjectQL-compatible backend
- **Automatic Schema**: Schema is defined in GraphQL and managed by ObjectQL

### Schema

The plugin defines the following entities in `src/schema/auth.gql`:

- **User**: User account information
- **Session**: Active user sessions
- **Account**: OAuth/social login accounts
- **VerificationToken**: Email verification and password reset tokens

### RBAC Bridge

The plugin includes a Better-Auth plugin that automatically injects ObjectOS permissions into user sessions:

```typescript
// Permissions are automatically available in the session
const { user } = useAuth(authClient);
console.log(user.permissions); // ['read:posts', 'write:posts', ...]
```

### React Hooks

#### `useAuth(authClient)`

Main authentication hook providing:
- `session`: Current session object
- `user`: Current user object with permissions
- `loading`: Loading state
- `error`: Error state
- `signIn(email, password)`: Sign in method
- `signUp(email, password, name?)`: Sign up method
- `signOut()`: Sign out method
- `refresh()`: Refresh session

#### `useIsAuthenticated(authClient)`

Check authentication status:
- `isAuthenticated`: Boolean indicating if user is logged in
- `loading`: Loading state

#### `usePermissions(authClient)`

Permission checking utilities:
- `permissions`: Array of user permissions
- `hasPermission(permission)`: Check single permission
- `hasAnyPermission(permissions)`: Check if user has any of the permissions
- `hasAllPermissions(permissions)`: Check if user has all permissions

### Components

#### `<SignInForm />`

Pre-built sign-in form with email/password inputs:

```tsx
<SignInForm
  authClient={authClient}
  onSuccess={() => console.log('Signed in!')}
  onError={(error) => console.error(error)}
/>
```

#### `<UserButton />`

User profile display with sign-out button:

```tsx
<UserButton
  authClient={authClient}
  onSignOut={() => console.log('Signed out!')}
/>
```

## Development

```bash
# Install dependencies
npm install

# Build the plugin
npm run build

# Watch mode for development
npm run dev

# Clean build artifacts
npm run clean
```

## Directory Structure

```
src/
├── adapter/
│   └── index.ts          # ObjectQL Adapter implementation
├── schema/
│   └── auth.gql          # GraphQL schema definitions
├── client/
│   ├── hooks.ts          # React hooks
│   └── components/       # React components
│       ├── SignInForm.tsx
│       ├── UserButton.tsx
│       └── index.ts
├── server/
│   └── index.ts          # Server-side initialization
└── index.ts              # Main plugin entry point
```

## Configuration

The plugin can be configured through the ObjectStack runtime context:

```typescript
{
  secureCookies: false,      // Enable/disable secure cookies (auto-detected)
  sessionExpiresIn: 604800,  // Session expiration in seconds (default: 7 days)
}
```

## Requirements

- Node.js 18+
- TypeScript 5+
- Better-Auth 1.0+
- ObjectStack Runtime

## License

MIT

## Contributing

Contributions are welcome! Please follow the ObjectStack contribution guidelines.

## Support

For issues and questions:
- GitHub Issues: [objectstack-ai/plugin-auth](https://github.com/objectstack-ai/plugin-auth)
- Documentation: [objectstack.ai](https://objectstack.ai)