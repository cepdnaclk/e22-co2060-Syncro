import React from 'react';
import { Navigate } from 'react-router';
import { useApp } from '../context/AppContext';

/**
 * Auth guard — uses real isAuthenticated from AppContext (JWT-based).
 */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated } = useApp();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}
