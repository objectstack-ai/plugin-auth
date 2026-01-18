import { defineConfig } from '@objectstack/protocol';

/**
 * ObjectStack Plugin Configuration for @objectstack/plugin-auth
 * 
 * This configuration defines the authentication plugin as an ObjectStack plugin
 * and registers the GraphQL schema entities required for Better-Auth integration.
 */
export default defineConfig({
  type: 'plugin',
  name: '@objectstack/plugin-auth',
  entities: ['./src/schema/*.gql'],
  version: '0.1.0',
});
