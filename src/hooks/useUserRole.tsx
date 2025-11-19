import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

const ADMIN_EMAIL = 'josearmandosouza8432@gmail.com';

export function useUserRole() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSeller, setIsSeller] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkRoles() {
      if (!user) {
        setIsAdmin(false);
        setIsSeller(false);
        setLoading(false);
        return;
      }

      try {
        // Check if user is the specific admin
        const isAdminUser = user.email === ADMIN_EMAIL;
        setIsAdmin(isAdminUser);

        // Check seller role from database
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        if (error) throw error;

        const roles = data?.map(r => r.role) || [];
        setIsSeller(roles.includes('seller') || isAdminUser);
      } catch (error) {
        console.error('Error checking roles:', error);
      } finally {
        setLoading(false);
      }
    }

    checkRoles();
  }, [user]);

  return { isAdmin, isSeller, loading };
}
