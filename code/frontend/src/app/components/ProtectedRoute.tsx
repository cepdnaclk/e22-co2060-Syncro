import React from 'react';
import { Navigate } from 'react-router';

/**
 * A simple auth guard that checks if the user is "logged in".
 * Currently uses localStorage to persist a mock auth flag set on Login/Register.
 * Replace the `isAuthenticated` logic with real JWT/session checking once the
 * backend is integrated.
 */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const isAuthenticated = localStorage.getItem('syncro_auth') === 'true';

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}
