/**
 * Sign In Form Component
 * 
 * Pre-built sign-in form component for quick integration
 */

import React, { useState } from 'react';
import { useAuth, AuthClient } from '../hooks';

export interface SignInFormProps {
  authClient: AuthClient;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function SignInForm({ authClient, onSuccess, onError }: SignInFormProps) {
  const { signIn, loading } = useAuth(authClient);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await signIn(email, password);
      onSuccess?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign in';
      setError(errorMessage);
      onError?.(err as Error);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem' }}>
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.5rem',
            border: '1px solid #ccc',
            borderRadius: '4px',
          }}
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem' }}>
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.5rem',
            border: '1px solid #ccc',
            borderRadius: '4px',
          }}
        />
      </div>

      {error && (
        <div
          style={{
            padding: '0.75rem',
            marginBottom: '1rem',
            backgroundColor: '#fee',
            color: '#c00',
            border: '1px solid #fcc',
            borderRadius: '4px',
          }}
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        style={{
          width: '100%',
          padding: '0.75rem',
          backgroundColor: loading ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: '1rem',
        }}
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
}
