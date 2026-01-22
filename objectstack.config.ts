/**
 * ObjectStack Plugin Configuration
 * Defines this package as a plugin for the ObjectStack runtime
 */
export default {
  type: 'plugin',
  name: '@objectstack/plugin-auth',
  version: '0.1.0',
  description: 'Authentication plugin using Better-Auth',
  
  // Schema files that define the data structure
  entities: ['./src/schema/*.gql'],
  
  // Plugin metadata
  author: 'ObjectStack AI',
  
  // Dependencies on other ObjectStack packages
  dependencies: {
    '@objectstack/ql': '*',
    '@objectstack/protocol': '*'
  },
  
  // Environment variables required by this plugin
  requiredEnv: [
    'BETTER_AUTH_SECRET',
    'BETTER_AUTH_URL'
  ]
};
