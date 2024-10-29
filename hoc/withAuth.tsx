// hoc/withAuth.tsx

'use client'; // Ensure this is a client component

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const withAuth = (WrappedComponent: React.ComponentType) => {
  const ComponentWithAuth = (props: any) => {
    const { user, role } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (user === null) {
        router.push('/admin/login');
      }
    }, [user, router]);

    if (user === null) {
      return <div>Loading...</div>; 
    }

    return <WrappedComponent {...props} />;
  };

  return ComponentWithAuth;
};

export default withAuth;
