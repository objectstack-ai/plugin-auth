# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-01-25

### Added
- Initial release of @objectstack/plugin-auth
- ObjectQL adapter for Better-Auth enabling storage-agnostic authentication
- GraphQL schema definitions for User, Session, Account, and VerificationToken entities
- Server-side Better-Auth initialization with RBAC integration
- React hooks for client-side authentication (`useSession`, `usePermissions`, `useHasPermission`)
- Plugin lifecycle hooks (onEnable, onDisable, onHealthCheck)
- Type-safe session management with permission injection
- Support for email/password authentication
- Support for social authentication providers (Google, GitHub, etc.)
- Comprehensive documentation and examples
- TypeScript strict mode support
- ESM module support

### Features
- **Storage Agnostic**: Works with any ObjectQL-supported database (Postgres, Redis, Excel, etc.)
- **Type Safe**: Full TypeScript support with type inference
- **RBAC Ready**: Automatic permission injection from ObjectOS
- **React Hooks**: Pre-built hooks for easy client integration
- **Framework Agnostic**: Core plugin works with any JavaScript framework

[0.1.0]: https://github.com/objectstack-ai/plugin-auth/releases/tag/v0.1.0
