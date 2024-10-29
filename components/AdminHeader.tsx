// components/AdminHeader.tsx

'use client'; 

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button'; 
const AdminHeader: React.FC = () => {
  const { signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <header className="flex justify-end p-4 bg-gray-800">
      <Button onClick={handleLogout} variant="secondary">
        Logout
      </Button>
    </header>
  );
};

export default AdminHeader;
