import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { AgeVerificationDialog } from './AgeVerificationDialog';

interface AgeVerificationWrapperProps {
  children: React.ReactNode;
}

export function AgeVerificationWrapper({ children }: AgeVerificationWrapperProps) {
  const { user } = useAuth();
  const [needsVerification, setNeedsVerification] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkVerification = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('age_verified, terms_accepted')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        const needs = !(data as any)?.age_verified || !(data as any)?.terms_accepted;
        setNeedsVerification(needs);
      } catch (error) {
        console.error('Error checking verification:', error);
      } finally {
        setLoading(false);
      }
    };

    checkVerification();
  }, [user]);

  if (loading) {
    return null;
  }

  return (
    <>
      {children}
      {user && needsVerification && (
        <AgeVerificationDialog
          open={needsVerification}
          onComplete={() => setNeedsVerification(false)}
        />
      )}
    </>
  );
}
