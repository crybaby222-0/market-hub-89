import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useUserStore() {
  const { user } = useAuth();
  const [store, setStore] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserStore() {
      if (!user) {
        setStore(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('stores')
          .select('*')
          .eq('seller_id', user.id)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') throw error;
        setStore(data);
      } catch (error) {
        console.error('Error fetching user store:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchUserStore();
  }, [user]);

  return { store, loading };
}
