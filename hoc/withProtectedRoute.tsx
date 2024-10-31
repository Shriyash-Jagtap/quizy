// hoc/withProtectedRoute.tsx
'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface WithProtectedRouteOptions {
  requireAdmin?: boolean;
  redirectTo?: string;
}

const withProtectedRoute = (
  WrappedComponent: React.ComponentType,
  options: WithProtectedRouteOptions = {}
) => {
  const { requireAdmin = false, redirectTo = '/admin/login' } = options;

  const ComponentWithProtection: React.FC = (props) => {
    const { user, role } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (user === null) {
        // User is not logged in, redirect to login
        router.push(redirectTo);
      } 
      // If user and role are being fetched, do nothing
    }, [user, role, router, requireAdmin, redirectTo]);

    if (user === null || (requireAdmin && role !== 'admin')) {
      // Optionally, render a loading or redirecting state
      return <p>Redirecting...</p>;
    }

    // User is authenticated (and has admin role if required), render the wrapped component
    return <WrappedComponent {...props} />;
  };

  return ComponentWithProtection;
};

export default withProtectedRoute;
