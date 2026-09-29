import React from 'react';
import { Navigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { ShieldAlert } from 'lucide-react';

/**
 * AdminRoute Guard — allows access only to authenticated users with isAdmin flag.
 */
export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAdmin } = useApp();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="max-w-md w-full bg-card border border-destructive/30 rounded-2xl p-8 text-center shadow-lg">
          <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Only authorized platform administrators (syncromarketplace@gmail.com) are permitted to access this area.
          </p>
          <a
            href="/dashboard"
            className="inline-block px-5 py-2.5 bg-primary text-primary-foreground font-medium rounded-xl hover:opacity-90 transition-opacity"
          >
            Return to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
