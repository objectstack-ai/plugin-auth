/**
 * Example configuration for @objectstack/plugin-auth
 * 
 * Copy this file to your project and customize as needed
 */

import { createAuthPlugin } from '@objectstack/plugin-auth';
import type { AuthPluginConfig } from '@objectstack/plugin-auth';

// Example: Full configuration with all options
export const authConfig: AuthPluginConfig = {
  // Required: Secret for signing tokens (min 32 characters)
  secret: process.env.BETTER_AUTH_SECRET,

  // Required: Base URL where your app is hosted
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',

  // Optional: Additional trusted origins for CORS
  trustedOrigins: [
    'http://localhost:5173', // Vite dev server
    'https://yourdomain.com',
  ],

  // Optional: Email/password authentication
  emailProvider: {
    enabled: true,
    
    // Implement your email sending logic
    sendVerificationEmail: async ({ user, url }) => {
      console.log(`Send verification email to ${user.email}: ${url}`);
      // Example: await sendEmail(user.email, 'Verify Email', url);
    },
    
    // Implement password reset email
    sendResetPasswordEmail: async ({ user, url }) => {
      console.log(`Send password reset to ${user.email}: ${url}`);
      // Example: await sendEmail(user.email, 'Reset Password', url);
    },
  },

  // Optional: Social authentication providers
  socialProviders: [
    // Google OAuth
    {
      id: 'google',
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    
    // GitHub OAuth
    {
      id: 'github',
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  ],

  // Optional: RBAC Integration
  // Inject ObjectOS permissions into session
  onGetPermissions: async (userId: string) => {
    // Example: Query your permission system
    // const permissions = await os.getPermissions(userId);
    // return permissions;
    
    // For now, return mock permissions
    return ['user.read', 'user.write'];
  },
};

// Example: Minimal configuration
export const minimalAuthConfig: AuthPluginConfig = {
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
};

// Usage in your app:
// const authPlugin = createAuthPlugin(authConfig);
// await authPlugin.onEnable({ ql, app });
