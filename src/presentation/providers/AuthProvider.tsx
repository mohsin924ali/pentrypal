// ========================================
// Auth Provider - Authentication context (placeholder)
// ========================================

import React, { type FC, type PropsWithChildren } from 'react';

/**
 * Auth Provider Component (Placeholder)
 *
 * This will be implemented when we set up Redux and auth state management
 * For now, it's a simple passthrough provider
 */
export const AuthProvider: FC<PropsWithChildren> = ({ children }) => {
  // TODO: Implement authentication context
  // - User authentication state
  // - Login/logout methods
  // - Token management
  // - Biometric authentication

  return <>{children}</>;
};
