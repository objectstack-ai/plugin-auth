/**
 * Type definitions for @objectstack/plugin-auth
 * 
 * These types ensure end-to-end type safety across the plugin
 */

/**
 * Base user entity matching Better-Auth and ObjectQL schema
 */
export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  name?: string | null;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Session entity
 */
export interface Session {
  id: string;
  userId: string;
  expiresAt: Date;
  token: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Account entity for OAuth providers
 */
export interface Account {
  id: string;
  userId: string;
  accountId: string;
  providerId: string;
  accessToken?: string | null;
  refreshToken?: string | null;
  idToken?: string | null;
  expiresAt?: Date | null;
  scope?: string | null;
  password?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Verification token for email verification and password reset
 */
export interface VerificationToken {
  id: string;
  identifier: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Extended user with ObjectOS permissions
 */
export interface UserWithPermissions extends User {
  permissions?: string[] | null;
}

/**
 * Complete session object with user and permissions
 */
export interface AuthSession {
  user: UserWithPermissions;
  session: Session;
}

/**
 * Sign in credentials
 */
export interface EmailSignInCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Sign up data
 */
export interface EmailSignUpData {
  email: string;
  password: string;
  name?: string;
  image?: string;
}

/**
 * Social provider IDs
 */
export type SocialProvider = 'google' | 'github' | 'facebook' | 'apple' | 'discord';

/**
 * Social sign in options
 */
export interface SocialSignInOptions {
  provider: SocialProvider;
  callbackUrl?: string;
}

/**
 * Password reset request
 */
export interface PasswordResetRequest {
  email: string;
}

/**
 * Password reset confirmation
 */
export interface PasswordResetConfirm {
  token: string;
  password: string;
}

/**
 * Email verification
 */
export interface EmailVerification {
  token: string;
}

/**
 * Auth error types
 */
export enum AuthErrorCode {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  EMAIL_ALREADY_EXISTS = 'EMAIL_ALREADY_EXISTS',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Auth error
 */
export class AuthError extends Error {
  constructor(
    public code: AuthErrorCode,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AuthError';
  }
}
