/**
 * User Button Component
 * 
 * Displays user information and provides sign out functionality
 */

import React from 'react';
import { useAuth, AuthClient } from '../hooks';

export interface UserButtonProps {
  authClient: AuthClient;
  onSignOut?: () => void;
}

export function UserButton({ authClient, onSignOut }: UserButtonProps) {
  const { user, signOut, loading } = useAuth(authClient);

  if (loading) {
    return (
      <div style={{ padding: '0.5rem' }}>
        Loading...
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleSignOut = async () => {
    try {
      await signOut();
      onSignOut?.();
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      {user.image && (
        <img
          src={user.image}
          alt={user.name || user.email}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            objectFit: 'cover',
          }}
        />
      )}
      
      <div style={{ flex: 1 }}>
        {user.name && (
          <div style={{ fontWeight: 'bold' }}>{user.name}</div>
        )}
        <div style={{ fontSize: '0.875rem', color: '#666' }}>
          {user.email}
        </div>
      </div>

      <button
        onClick={handleSignOut}
        disabled={loading}
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#f44336',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        Sign Out
      </button>
    </div>
  );
}
