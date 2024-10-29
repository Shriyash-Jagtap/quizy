// hoc/withAdmin.tsx

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const withAdmin = (WrappedComponent: React.ComponentType) => {
  return function ComponentWithAdmin(props: any) {
    const { user, role } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (role !== null) {
        if (role !== 'admin') {
          router.push('/');
        }
      }
    }, [role, router]);

    if (role === null || user === null) {
      return <div>Loading...</div>; 
    }

    return <WrappedComponent {...props} />;
  };
};

export default withAdmin;
