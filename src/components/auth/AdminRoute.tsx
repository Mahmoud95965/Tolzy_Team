"use client";
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../common/LoadingSpinner';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Checking admin privileges based on email (Case Insensitive)
  const isAdminEmail = user?.email?.toLowerCase() === 'mahmoud.m.moussa5310@gmail.com';

  useEffect(() => {
    // Console logs for developer
    console.log('AdminRoute State:', {
      loading,
      userEmail: user?.email,
      isAdminEmail,
      targetEmail: 'mahmoud.m.moussa5310@gmail.com'
    });

    if (!loading && (!user || !isAdminEmail)) {
      router.push('/');
    }
  }, [user, isAdminEmail, loading, router]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user || !isAdminEmail) {
    return null; // or a loader while redirecting
  }

  return <>{children}</>;
};

export default AdminRoute;
