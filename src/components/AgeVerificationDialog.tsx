import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AgeVerificationDialogProps {
  open: boolean;
  onComplete: () => void;
}

export function AgeVerificationDialog({ open, onComplete }: AgeVerificationDialogProps) {
  const { user } = useAuth();
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!user || !ageConfirmed || !termsAccepted) {
      toast.error('Por favor, confirme todos os campos');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          age_verified: true,
          terms_accepted: true,
          terms_accepted_at: new Date().toISOString(),
        } as any)
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Verificação concluída com sucesso!');
      onComplete();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error('Erro ao salvar verificação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-6 w-6 text-warning" />
            <DialogTitle>Verificação Necessária</DialogTitle>
          </div>
          <DialogDescription>
            Para continuar usando o Market+, você precisa confirmar que atende aos requisitos da plataforma.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="flex items-start gap-3">
            <Checkbox
              id="age"
              checked={ageConfirmed}
              onCheckedChange={(checked) => setAgeConfirmed(checked as boolean)}
            />
            <div className="space-y-1">
              <Label htmlFor="age" className="text-base font-medium cursor-pointer">
                Tenho 18 anos ou mais
              </Label>
              <p className="text-sm text-muted-foreground">
                A plataforma Market+ é destinada apenas para maiores de 18 anos.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="terms"
              checked={termsAccepted}
              onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
            />
            <div className="space-y-1">
              <Label htmlFor="terms" className="text-base font-medium cursor-pointer">
                Li e aceito os Termos de Uso
              </Label>
              <p className="text-sm text-muted-foreground">
                Você pode ler nossos{' '}
                <Link to="/terms" className="text-primary hover:underline" target="_blank">
                  Termos de Uso e Política de Privacidade
                </Link>
                {' '}a qualquer momento.
              </p>
            </div>
          </div>
        </div>

        <Button 
          onClick={handleSubmit} 
          disabled={!ageConfirmed || !termsAccepted || loading}
          className="w-full"
        >
          {loading ? 'Confirmando...' : 'Confirmar e Continuar'}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
