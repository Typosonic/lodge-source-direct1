import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

const ProtectedRoute = ({ children, redirectTo = '/auth' }: ProtectedRouteProps) => {
  const { user, isLoading, isEmailVerified } = useAuth();

  // Check profile completion
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('profiles')
        .select('full_name,username')
        .eq('id', user.id)
        .single();
      return data;
    },
    enabled: !!user,
  });

  if (isLoading || profileLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lodge-purple"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={redirectTo} />;
  }

  // Allow dashboard to handle email verification prompt
  return <>{children}</>;
};

export default ProtectedRoute;
