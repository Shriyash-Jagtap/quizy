// hoc/withAdmin.tsx
'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

const withAdmin = (WrappedComponent: React.ComponentType) => {
  const AdminComponent: React.FC = (props) => {
    const { user, role } = useAuth();
    const router = useRouter();
    
    useEffect(() => {
      if (user === null) {
        // User is not logged in, redirect to admin login page
        router.push('/admin/login'); // Ensure this path is correct
        console.log("nulluser")
      } else if (role !== 'admin') {
        
        // User is logged in but not an admin, redirect to unauthorized page
        router.push('/unauthorized'); // Ensure this path is correct
      }
      console.log("this is the role:"+role);
      // If user and role are being fetched, do nothing
    }, [user, role, router]);

    if (user === null || role === null) {
      // Optionally, render a loading or redirecting state
      return <p>Redirecting...</p>;
    }

    // Note: Removed the undefined checks since `useState` initializes with null and is never undefined
    // If you plan to have undefined states, ensure they are handled appropriately in AuthContext

    // User is authenticated and has admin role, render the wrapped component
    return <WrappedComponent {...props} />;
  };

  return AdminComponent;
};

export default withAdmin;
