import type { ObjectStackConfig } from '@objectstack/protocol';

const config: ObjectStackConfig = {
  type: 'plugin',
  name: '@objectstack/plugin-auth',
  version: '0.1.0',
  description: 'Better-Auth authentication plugin for ObjectStack',
  entities: ['./src/schema/*.gql'],
  dependencies: {
    '@objectstack/ql': '*',
    '@objectstack/protocol': '*',
    'better-auth': '^1.0.0'
  }
};

export default config;
