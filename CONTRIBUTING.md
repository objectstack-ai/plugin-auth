# Contributing to @objectstack/plugin-auth

Thank you for your interest in contributing to the ObjectStack Auth Plugin! This document provides guidelines and instructions for contributing.

## Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/objectstack-ai/plugin-auth.git
   cd plugin-auth
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the project**
   ```bash
   npm run build
   ```

4. **Watch mode for development**
   ```bash
   npm run dev
   ```

## Project Structure

```
src/
├── adapter/          # ObjectQL adapter for Better-Auth
├── schema/           # GraphQL schema definitions
├── client/           # React hooks and client utilities
├── server/           # Server-side initialization
├── types.ts          # TypeScript type definitions
└── index.ts          # Main plugin entry point
```

## Architecture Principles

### 1. Storage Agnostic
- **Never** use direct database calls (SQL, Prisma, Drizzle)
- **Always** use ObjectQL for data operations
- Pattern: `ql.entity('EntityName').operation()`

Example:
```typescript
// ❌ Bad
await prisma.user.create({ ... });

// ✅ Good
await ql.entity('User').create({ ... });
```

### 2. Type Safety
- Use TypeScript strict mode
- Export all public types
- Leverage Better-Auth's type inference

### 3. Framework Agnostic
- Core plugin should work with any framework
- Framework-specific code goes in separate exports
- Example: React hooks in `client/hooks.ts`

### 4. RBAC Integration
- Authentication (who you are) via Better-Auth
- Authorization (what you can do) via ObjectOS
- Inject permissions into session objects

## Coding Standards

### TypeScript
- Use strict mode
- Prefer interfaces over types for objects
- Use explicit return types for public APIs
- Document complex logic with comments

### Naming Conventions
- PascalCase for types, interfaces, classes
- camelCase for functions, variables
- UPPER_CASE for constants
- Prefix private methods with `_`

### File Organization
- One export per file (with exceptions for related utilities)
- Group related functionality
- Keep files focused and under 300 lines

## Testing Guidelines

When adding tests (future work):
- Test with multiple ObjectQL drivers (Postgres, Redis, etc.)
- Test RBAC permission injection
- Test session lifecycle
- Test error handling

## Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow coding standards
   - Add tests if applicable
   - Update documentation

3. **Verify your changes**
   ```bash
   npm run typecheck
   npm run build
   ```

4. **Commit with clear messages**
   ```bash
   git commit -m "feat: add new feature"
   ```
   
   Follow [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` New feature
   - `fix:` Bug fix
   - `docs:` Documentation changes
   - `refactor:` Code refactoring
   - `test:` Test additions/changes
   - `chore:` Maintenance tasks

5. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

## Common Tasks

### Adding a New Auth Provider

1. Update `AuthPluginConfig` in `src/index.ts`
2. Add provider configuration to server setup
3. Update documentation
4. Add example to `example.config.ts`

### Extending the Schema

1. Update GraphQL schema in `src/schema/auth.gql`
2. Update TypeScript types in `src/types.ts`
3. Update adapter operations in `src/adapter/index.ts`
4. Update documentation

### Adding Client Hooks

1. Add hook to `src/client/hooks.ts`
2. Export from `src/index.ts`
3. Add TypeScript types
4. Document with JSDoc comments
5. Add usage example to README

## Questions?

- Open an issue for bugs or feature requests
- Start a discussion for questions or ideas
- Tag maintainers for urgent issues

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
