# @objectstack/plugin-auth

Authentication and identity layer for ObjectStack, wrapping Better-Auth with ObjectQL storage adapter.

## Overview

This plugin provides a **battery-included** authentication experience for the ObjectStack ecosystem by:

- 🔐 Wrapping [Better-Auth](https://better-auth.com) for robust authentication
- 💾 Using ObjectQL as the storage adapter (works with Postgres, Redis, Excel, etc.)
- 🔒 Providing end-to-end type-safe session objects
- 🎯 Framework agnostic design

## Features

- **Storage Agnostic**: Authentication data can live in any storage backend supported by ObjectQL
- **Type Safety**: Leverages Better-Auth's inference for type-safe session management
- **OAuth Support**: Built-in support for multiple OAuth providers
- **RBAC Integration**: Seamless integration with ObjectOS permissions

## Installation

```bash
npm install @objectstack/plugin-auth
```

## Project Structure

```
src/
├── adapter/          # ObjectQL adapter for Better-Auth
├── schema/           # GraphQL schema definitions (User, Session, etc.)
├── client/           # React hooks and components
├── server/           # Server-side initialization logic
└── index.ts          # Main plugin entry point
```

## Schema

The plugin defines the following entities compatible with Better-Auth:

- **User**: Core user entity with email, name, and profile information
- **Session**: Active user sessions with token and expiration
- **Account**: OAuth provider accounts linked to users
- **VerificationToken**: Email verification and password reset tokens

See `src/schema/auth.gql` for the complete schema definition.

## Development

```bash
# Install dependencies
npm install

# Build the plugin
npm run build

# Watch mode for development
npm run dev
```

## Configuration

The plugin is configured via `objectstack.config.ts` and requires the following environment variables:

- `BETTER_AUTH_SECRET`: Secret key for Better-Auth
- `BETTER_AUTH_URL`: Base URL for authentication endpoints

## License

MIT